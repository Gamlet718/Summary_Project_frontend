// i18next-parser.config.cjs
/**
 * Источник: ru — берём defaultValue из кода -> ru/common.json
 * en — пусто, заполним автопереводом ru -> en.
 * Неймспейс: common (как в i18n.js).
 */
module.exports = {
  contextSeparator: "_",
  createOldCatalogs: false,

  defaultNamespace: "common",

  // Для ru берём defaultValue из кода, для остальных — пусто
  defaultValue: (locale, namespace, key, value) => {
    if (locale === "ru") return value || key;
    return "";
  },

  // ВАЖНО: ru всегда перезаписывается из кода
  resetDefaultValueLocale: "ru",

  locales: ["ru", "en"],

  namespaceSeparator: false,
  keySeparator: false,

  output: "src/locales/$LOCALE/common.json",
  input: ["src/**/*.{js,jsx,ts,tsx}"],

  keepRemoved: true,
  sort: true,
  verbose: true,

  lexers: {
    js: ["JsxLexer", "JavascriptLexer"],
    jsx: ["JsxLexer"],
    ts: ["TypescriptLexer"],
    tsx: ["JsxLexer"]
  }
};