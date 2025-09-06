// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// Эти файлы формируются/обновляются скриптами i18n:extract / i18n:translate
import en from "./locales/en/common.json";
import ru from "./locales/ru/common.json";

/**
 * Логируем состояние словарей. Источник — RU, EN — производный.
 */
function logDictionaries() {
  try {
    const ruKeys = Object.keys(ru || {});
    const enKeys = Object.keys(en || {});
    const missingInEn = ruKeys.filter((k) => !en || !en[k]);
    console.log(`[i18n:init] Dict sizes -> ru: ${ruKeys.length}, en: ${enKeys.length}`);
    if (missingInEn.length > 0) {
      console.warn(
        `[i18n:init] Missing ${missingInEn.length} en keys. ` +
          `Run "npm run i18n:update" to generate en from ru.\n` +
          `First 5: ${missingInEn.slice(0, 5).join(", ")}`
      );
    }
  } catch {
    // ignore
  }
}
logDictionaries();

/**
 * Инициализация i18next.
 * - Стартуем на русском (lng: 'ru').
 * - Fallback — на русский.
 * - Дефолтный namespace — 'common'.
 */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { common: ru },
      en: { common: en }
    },
    lng: "ru",
    fallbackLng: "ru",
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnEmptyString: false
  })
  .then(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = i18n.language || "ru";
    }
    console.log(`[i18n:init] Initialized. Current language: ${i18n.language}`);
  })
  .catch((e) => {
    console.error("[i18n:init] Failed to initialize i18next:", e);
  });

/**
 * Синхронизируем <html lang="..."> при смене языка.
 */
i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng || "ru";
  }
  console.log(`[i18n] languageChanged -> ${lng}`);
});

export default i18n;