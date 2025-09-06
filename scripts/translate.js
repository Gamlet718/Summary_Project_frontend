// scripts/translate.js
/* eslint-disable no-console */
import "dotenv/config";
import fs from "fs";
import path from "path";
import process from "process";

/**
 * CLI: node scripts/translate.js [targetLang] [--force]
 * Пример: node scripts/translate.js en --force
 *
 * Источник — RU, цель — EN (по умолчанию).
 * Работает только с UI-словарями (src/locales), не трогает товары/данные.
 */

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src", "locales");

// Источник — русский
const SOURCE_LANG = process.env.I18N_SOURCE_LANG || "ru";
// Цель — из аргумента/ENV, по умолчанию английский
const TARGET_LANG =
  process.argv[2] || process.env.I18N_TARGET_LANG || process.env.TRANSLATE_TARGET_LANG || "en";

// Флаг форс-перевода всех ключей (перепишет существующие переводы)
const FORCE =
  process.argv.includes("--force") ||
  process.env.I18N_TRANSLATE_FORCE === "1" ||
  process.env.TRANSLATE_FORCE === "1";

// Таймауты/конкурентность — поддерживаем оба варианта ENV
const TIMEOUT_MS = Number(
  process.env.I18N_TRANSLATE_TIMEOUT_MS ||
    process.env.TRANSLATE_TIMEOUT_MS ||
    15000
);
const CONCURRENCY = Number(
  process.env.I18N_TRANSLATE_CONCURRENCY ||
    process.env.TRANSLATE_CONCURRENCY ||
    3
);

const sourceFile = path.join(SRC_DIR, SOURCE_LANG, "common.json");
const targetFile = path.join(SRC_DIR, TARGET_LANG, "common.json");

// Жёсткая защита: в RU никогда не пишем
if (TARGET_LANG === "ru") {
  console.error("[i18n:translate] Запрет: TARGET_LANG=ru. RU — источник, в него не пишем.");
  process.exit(1);
}

async function ensureFetch() {
  if (typeof fetch === "undefined") {
    const { default: fetchPolyfill } = await import("node-fetch");
    global.fetch = fetchPolyfill;
    console.log("[i18n:translate] fetch polyfilled via node-fetch");
  }
}

function fetchWithTimeout(url, options = {}, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

function readJson(file) {
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8") || "{}");
  } catch (e) {
    console.error(`[i18n:translate] Failed to parse JSON: ${file}`, e);
    return {};
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`[i18n:translate] Wrote ${Object.keys(data).length} keys -> ${file}`);
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

async function translateLibre(text, targetLang) {
  const baseUrl = process.env.LIBRETRANSLATE_URL || "https://libretranslate.com";
  const apiKey = process.env.LIBRETRANSLATE_API_KEY || "";
  const url = `${baseUrl.replace(/\/+$/, "")}/translate`;
  const body = {
    q: text,
    source: SOURCE_LANG,
    target: targetLang,
    format: "text"
  };
  if (apiKey) body.api_key = apiKey;

  const res = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    },
    TIMEOUT_MS
  );
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`LibreTranslate ${res.status}: ${msg || "no message"}`);
  }
  const data = await res.json().catch(() => ({}));
  const out = data?.translatedText;
  if (!out) throw new Error("LibreTranslate returned empty result");
  return { text: out, engine: "libre" };
}

async function translateGoogle(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${SOURCE_LANG}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    text
  )}`;
  const res = await fetchWithTimeout(url, {}, TIMEOUT_MS);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Google ${res.status}: ${msg || "no message"}`);
  }
  const data = await res.json().catch(() => null);
  const translated = data?.[0]?.map((chunk) => chunk?.[0]).join("") ?? "";
  if (!translated) throw new Error("Google returned empty result");
  return { text: translated, engine: "google" };
}

async function translateText(text, targetLang) {
  const started = Date.now();
  try {
    const res = await translateLibre(text, targetLang);
    console.log(`[i18n:translate] Libre ok in ${Date.now() - started}ms`);
    return res;
  } catch (e) {
    console.warn(
      `[i18n:translate] Libre failed after ${Date.now() - started}ms -> ${e?.message}`
    );
    const gStarted = Date.now();
    const res = await translateGoogle(text, targetLang);
    console.log(`[i18n:translate] Google ok in ${Date.now() - gStarted}ms`);
    return res;
  }
}

async function runWithConcurrency(items, worker, limit = CONCURRENCY) {
  let index = 0;
  async function one() {
    const i = index++;
    if (i >= items.length) return;
    try {
      await worker(items[i], i);
    } catch {}
    return one();
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => one());
  await Promise.all(workers);
}

async function main() {
  const ts = new Date().toISOString().replace("T", " ").replace("Z", "");
  console.log("==============================================");
  console.log(`[i18n:translate] Start at ${ts}`);
  console.log(`[i18n:translate] Node ${process.version} | cwd ${ROOT}`);
  console.log(`[i18n:translate] Source (${SOURCE_LANG}): ${sourceFile}`);
  console.log(`[i18n:translate] Target (${TARGET_LANG}): ${targetFile}`);
  console.log(
    `[i18n:translate] Using LibreTranslate: ${process.env.LIBRETRANSLATE_URL || "https://libretranslate.com"}`
  );
  console.log(`[i18n:translate] Timeout: ${TIMEOUT_MS}ms | Concurrency: ${CONCURRENCY}`);
  console.log(`[i18n:translate] Force mode: ${FORCE ? "ON" : "OFF"}`);
  console.log("==============================================");

  if (SOURCE_LANG === TARGET_LANG) {
    console.warn("[i18n:translate] SOURCE_LANG equals TARGET_LANG — nothing to do.");
    return;
  }

  await ensureFetch();

  if (!fs.existsSync(sourceFile)) {
    console.error(
      `[i18n:translate] Source file not found.\n` +
        `  Expected: ${sourceFile}\n` +
        `  Hint: Run "npx i18next -c i18next-parser.config.cjs 'src/**/*.{js,jsx,ts,tsx}'" first.`
    );
    process.exit(1);
  }

  const srcDict = readJson(sourceFile);
  const targetDict = readJson(targetFile);

  const sourceKeys = Object.keys(srcDict);
  const targetKeys = Object.keys(targetDict);
  console.log(
    `[i18n:translate] Source keys: ${sourceKeys.length}, Target existing keys: ${targetKeys.length}`
  );

  const missingKeys = sourceKeys.filter(
    (k) => FORCE || !targetDict[k] || String(targetDict[k]).trim() === ""
  );
  console.log(
    `[i18n:translate] Keys to translate: ${missingKeys.length} ${FORCE ? "(forced)" : ""}`
  );
  if (missingKeys.length > 0) {
    console.log(`[i18n:translate] First 5: ${missingKeys.slice(0, 5).join(", ")}`);
  }

  if (missingKeys.length === 0) {
    console.log("[i18n:translate] Nothing to translate. Up to date.");
    return;
  }

  await runWithConcurrency(
    missingKeys,
    async (key) => {
      const src = String(srcDict[key] ?? "");
      const preview = src.length > 60 ? src.slice(0, 57) + "..." : src;
      process.stdout.write(`[i18n:translate] -> ${key} | "${preview}" ... `);
      try {
        // Маскируем плейсхолдеры перед переводом
        const { masked, tokens } = maskInterpolation(src);
        const { text, engine } = await translateText(masked, TARGET_LANG);
        const restored = unmaskInterpolation(text, tokens);
        targetDict[key] = restored;
        console.log(`ok (${engine})`);
      } catch (e) {
        targetDict[key] = targetDict[key] || "";
        console.log(`fail (${e?.message || "unknown"})`);
      }
    },
    CONCURRENCY
  );

  writeJson(targetFile, targetDict);
  console.log("[i18n:translate] Done.");
}

main().catch((e) => {
  console.error("[i18n:translate] Uncaught error:", e);
  process.exit(1);
});