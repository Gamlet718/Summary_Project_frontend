// server/server-routes/translate.js
// Роут перевода: LibreTranslate (с API-ключом, если задан) -> fallback на Google.
// С таймаутами, бюджетом на элемент и ограничением конкуренции. Node 18+.
import express from "express";

const router = express.Router();

const LT_URL = (process.env.LIBRETRANSLATE_URL || "https://libretranslate.com").replace(/\/+$/, "");
const LT_API_KEY = process.env.LIBRETRANSLATE_API_KEY || "";
const PROVIDER = (process.env.TRANSLATE_PROVIDER || "auto").toLowerCase(); // 'auto' | 'libre' | 'google'

// Базовые таймауты/лимиты
const DEFAULT_TIMEOUT_MS = Number(process.env.TRANSLATE_TIMEOUT_MS || 7000);

// Бюджет времени на один текст (Libre + fallback Google суммарно)
const ITEM_BUDGET_MS = Number(process.env.TRANSLATE_ITEM_BUDGET_MS || 6500);
// Частные таймауты попыток (ограничиваются бюджетом)
const LT_ATTEMPT_MS = Number(process.env.TRANSLATE_LIBRE_TIMEOUT_MS || 3000);
const GOOGLE_ATTEMPT_MS = Number(process.env.TRANSLATE_GOOGLE_TIMEOUT_MS || 3000);

const CONCURRENCY = Number(process.env.TRANSLATE_CONCURRENCY || 3);
const MAX_TEXTS = Number(process.env.TRANSLATE_MAX_TEXTS || 100);
const MAX_TEXT_LEN = Number(process.env.TRANSLATE_MAX_TEXT_LEN || 2000);

// In-memory кэш (сбрасывается при рестарте)
const cache = new Map(); // key: `${source}|${target}|${text}` -> translation

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// --- Защита плейсхолдеров {{...}} ---
const INTERP_RE = /{{\s*[^}]+\s*}}/g;

function maskInterpolation(text) {
  const tokens = text.match(INTERP_RE) || [];
  let masked = text;
  tokens.forEach((tok, i) => {
    masked = masked.replace(tok, `__I18N_${i}__`);
  });
  return { masked, tokens };
}

function unmaskInterpolation(text, tokens) {
  let restored = text;
  restored = restored.replace(/__I18N_(\d+)__/g, (_, idx) => {
    const i = Number(idx);
    return typeof tokens[i] === "string" ? tokens[i] : "";
  });
  return restored;
}
// --------------------------------------

async function translateOneLibre(text, sourceLang, targetLang, timeoutMs = LT_ATTEMPT_MS) {
  const body = {
    q: text,
    source: sourceLang === "auto" ? "auto" : sourceLang,
    target: targetLang,
    format: "text"
  };
  if (LT_API_KEY) body.api_key = LT_API_KEY;

  const resp = await fetchWithTimeout(`${LT_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }, timeoutMs);

  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`LibreTranslate error ${resp.status}: ${msg}`);
  }
  const data = await resp.json().catch(() => ({}));
  const translated = data?.translatedText ?? "";
  if (!translated) throw new Error("LibreTranslate empty result");
  return translated;
}

async function translateOneGoogle(text, sourceLang, targetLang, timeoutMs = GOOGLE_ATTEMPT_MS) {
  const sl = sourceLang === "auto" ? "auto" : sourceLang || "auto";
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
    sl
  )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;

  const resp = await fetchWithTimeout(url, {}, timeoutMs);
  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Google error ${resp.status}: ${msg}`);
  }
  const data = await resp.json().catch(() => null);
  const translated = data?.[0]?.map((chunk) => chunk?.[0]).join("") ?? "";
  if (!translated) throw new Error("Google empty result");
  return translated;
}

// Перевод одного текста с общим бюджетом времени на все попытки
async function translateOne(text, sourceLang, targetLang) {
  const deadline = Date.now() + ITEM_BUDGET_MS;
  const left = () => Math.max(0, deadline - Date.now());
  const bounded = (ms) => Math.max(800, Math.min(ms, left()));

  if (PROVIDER === "google") {
    return translateOneGoogle(text, sourceLang, targetLang, bounded(GOOGLE_ATTEMPT_MS));
  }
  if (PROVIDER === "libre") {
    try {
      return await translateOneLibre(text, sourceLang, targetLang, bounded(LT_ATTEMPT_MS));
    } catch (_e) {
      if (left() <= 0) throw _e;
      return translateOneGoogle(text, sourceLang, targetLang, bounded(GOOGLE_ATTEMPT_MS));
    }
  }

  try {
    return await translateOneLibre(text, sourceLang, targetLang, bounded(LT_ATTEMPT_MS));
  } catch (_e) {
    if (left() <= 0) throw _e;
    return translateOneGoogle(text, sourceLang, targetLang, bounded(GOOGLE_ATTEMPT_MS));
  }
}

// простой воркер-пул
async function runWithConcurrency(tasks, limit = CONCURRENCY) {
  const results = new Array(tasks.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () =>
    (async function worker() {
      while (true) {
        const current = idx++;
        if (current >= tasks.length) break;
        try {
          results[current] = await tasks[current]();
        } catch (e) {
          results[current] = e;
        }
      }
    })()
  );
  await Promise.all(workers);
  return results;
}

router.post("/translate", async (req, res) => {
  try {
    const { texts, sourceLang = "auto", targetLang = "ru" } = req.body || {};
    if (!Array.isArray(texts)) {
      return res.status(400).json({ error: "texts must be an array" });
    }

    // Мягкие лимиты на размер запроса
    const sliced = texts.slice(0, MAX_TEXTS).map((t) =>
      typeof t === "string" ? t.slice(0, MAX_TEXT_LEN) : ""
    );

    const input = sliced.map((t) => (typeof t === "string" ? t : ""));
    const results = new Array(input.length);
    const toTranslate = [];

    input.forEach((text, idx) => {
      const key = `${sourceLang}|${targetLang}|${text}`;
      if (cache.has(key)) {
        results[idx] = cache.get(key);
      } else {
        toTranslate.push(idx);
      }
    });

    const tasks = toTranslate.map((idx) => async () => {
      const text = input[idx];
      if (!text) {
        results[idx] = "";
        return;
      }
      try {
        // Маскируем плейсхолдеры перед переводом
        const { masked, tokens } = maskInterpolation(text);
        const translatedMasked = await translateOne(masked, sourceLang, targetLang);
        const translated = unmaskInterpolation(translatedMasked, tokens);

        const key = `${sourceLang}|${targetLang}|${text}`;
        cache.set(key, translated);
        results[idx] = translated;
      } catch (e) {
        console.error("[/api/translate] item failed:", e?.message || e);
        // Возвращаем оригинал, чтобы не блокировать UI
        results[idx] = text;
      }
    });

    await runWithConcurrency(tasks, CONCURRENCY);

    res.json({ translations: results });
  } catch (e) {
    console.error("[/api/translate] error:", e);
    res.status(500).json({ error: "translate_failed", message: e?.message || "Unknown error" });
  }
});

export default router;