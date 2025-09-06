// src/services/translationApi.js

// Глобальный лимитер параллельных запросов, чтобы не перегружать сервер/провайдера
const MAX_CONCURRENT = 4;
let pending = 0;
const waitQueue = [];

function acquire() {
  if (pending < MAX_CONCURRENT) {
    pending++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waitQueue.push(resolve));
}
function release() {
  const next = waitQueue.shift();
  if (next) {
    next();
  } else {
    pending = Math.max(0, pending - 1);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function withSoftTimeout(promise, ms, err = new Error("timeout")) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(err), ms))
  ]);
}

/**
 * Вызов серверного перевода батчем с мягким таймаутом и ретраем.
 * Не относится к i18n словарю — используется для данных (например, продукты).
 */
export async function translateBatch(texts, sourceLang = "auto", targetLang = "ru", timeoutMs = 15000) {
  const payload = (texts || []).map((t) => (typeof t === "string" ? t : ""));
  if (payload.length === 0) return [];

  await acquire();
  try {
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await withSoftTimeout(
          fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texts: payload, sourceLang, targetLang })
          }),
          timeoutMs
        );

        if (!res.ok) {
          const msg = await res.text().catch(() => res.statusText);
          throw new Error(`Translate API error ${res.status}: ${msg}`);
        }
        const data = await withSoftTimeout(res.json(), Math.min(timeoutMs, 5000));
        if (!data || !Array.isArray(data.translations)) {
          throw new Error("Translate API bad response");
        }
        return data.translations;
      } catch (e) {
        const isTimeout = e?.message?.includes("timeout");
        const isNetwork =
          e?.message?.includes("Failed to fetch") ||
          e?.message?.includes("NetworkError") ||
          e?.message?.includes("TypeError: Failed to fetch");

        if ((isTimeout || isNetwork) && attempt < maxAttempts) {
          await sleep(300);
          continue;
        }
        // Возвращаем оригиналы при любой ошибке — UI не «повиснет»
        return payload;
      }
    }

    // safety
    return payload;
  } finally {
    release();
  }
}