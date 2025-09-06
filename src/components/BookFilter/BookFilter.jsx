/**
 * @file BookFilter.jsx
 * @module BookFilter
 * @description Модальное окно фильтрации книг по различным параметрам.
 * - Фильтрация по данным с сервера (/api/products)
 * - Языконезависимый поиск (перевод RU↔EN + транслитерация RU↔EN)
 * - Совместимость: domMatchedProductIds заполняются ID с сервера
 */

import React, { useState, useEffect } from "react";
import "./BookFilter.css";
import { useTranslation } from "react-i18next";
import { translateBatch } from "../../services/translationApi";

/* ---------- Константы UI ---------- */

const CATEGORIES = [
  "практическое",
  "учебное",
  "информационное",
  "художественное",
  "научное",
  "социально-политическое",
  "рекламное",
  "научно-популярное",
  "для досуга",
  "другое",
];

const CATEGORY_LABELS = {
  ru: {
    "практическое": "Практические",
    "учебное": "Учебные",
    "информационное": "Информационные",
    "художественное": "Художественные",
    "научное": "Научные",
    "социально-политическое": "Социально-политические",
    "рекламное": "Рекламные",
    "научно-популярное": "Научно-популярные",
    "для досуга": "Для досуга",
    "другое": "Другое",
  },
  en: {
    "практическое": "Practical",
    "учебное": "Educational",
    "информационное": "Informational",
    "художественное": "Fiction",
    "научное": "Scientific",
    "социально-политическое": "Socio-political",
    "рекламное": "Advertising",
    "научно-популярное": "Popular science",
    "для досуга": "Leisure",
    "другое": "Other",
  },
};

const CATEGORY_EXPAND_MAP = {
  "художественное": [
    "художественное",
    "Художественные",
    "Ficition",
    "Fiction",
    "Books",
    "Художественная литература",
  ],
};

const SORT_OPTIONS = [
  { value: "asc", tKey: "book_filter_sort_price_asc", defaultLabel: "От дешевых к дорогим" },
  { value: "desc", tKey: "book_filter_sort_price_desc", defaultLabel: "От дорогих к дешевым" },
];

function getUiLang(i18n) {
  const lng = (i18n?.language || "ru").toLowerCase();
  return lng.startsWith("en") ? "en" : "ru";
}
function getOppositeLang(uiLang) {
  return uiLang === "ru" ? "en" : "ru";
}

/* ---------- Debug ---------- */

const DEBUG = (() => {
  try {
    const ls = localStorage.getItem("debug:BookFilter");
    if (ls != null) return ls === "1" || ls === "true";
  } catch {}
  return true;
})();
function dbg(...args) { if (DEBUG) console.log("[BookFilter]", ...args); }
function dbgGroup(label, fn) {
  if (!DEBUG) return fn?.();
  try { console.group("[BookFilter]", label); return fn?.(); } finally { console.groupEnd(); }
}

/* ---------- DOM fallback (оставлен для совместимости) ---------- */

const CARD_ROOT_SELECTORS = [
  '[data-product-id]',
  '[data-id]',
  '[data-key]',
  '[role="article"]',
  '.product-card',
  '.book-card',
  '.card',
  '.product',
  '.item',
  'article',
];
const TITLE_SELECTORS = [
  '[data-role="title"]',
  '.product-title',
  '.card-title',
  '.book-title',
  'h3',
  'h2',
];
const AUTHOR_SELECTORS = [
  '[data-role="author"]',
  '.product-author',
  '.card-author',
  '.book-author',
  '[data-field="author"]',
  '.author',
];

function getFirstText(el, selectors) {
  for (const sel of selectors) {
    const node = el.querySelector(sel);
    if (node && node.textContent) {
      const s = node.textContent.trim();
      if (s) return s;
    }
  }
  return "";
}
function extractProductId(el) {
  const direct =
    el.getAttribute("data-product-id") ||
    el.dataset?.productId ||
    el.getAttribute("data-id") ||
    el.dataset?.id ||
    el.getAttribute("data-key") ||
    el.dataset?.key;
  if (direct) return String(direct);
  const nested = el.querySelector("[data-product-id], [data-id], [data-key]");
  if (nested) {
    const id =
      nested.getAttribute("data-product-id") ||
      nested.getAttribute("data-id") ||
      nested.getAttribute("data-key");
    if (id) return String(id);
  }
  const elId = el.id || "";
  if (elId) {
    const m = elId.match(/product[-_]?([A-Za-z0-9]+)/i) || elId.match(/(\d{3,})/);
    if (m && m[1]) return String(m[1]);
  }
  return "";
}
function getAllCandidateCards() {
  const selectorUnion = CARD_ROOT_SELECTORS.join(",");
  const nodes = Array.from(document.querySelectorAll(selectorUnion));
  return nodes.filter(
    (el) =>
      TITLE_SELECTORS.some((s) => el.querySelector(s)) ||
      AUTHOR_SELECTORS.some((s) => el.querySelector(s))
  );
}
function findDomMatchedProductIds(nameVariants = [], authorVariants = []) {
  const nv = Array.from(new Set((nameVariants || []).map((s) => String(s || "").toLowerCase().trim()).filter(Boolean)));
  const av = Array.from(new Set((authorVariants || []).map((s) => String(s || "").toLowerCase().trim()).filter(Boolean)));
  if (nv.length === 0 && av.length === 0) return [];
  const cards = getAllCandidateCards();
  const ids = new Set();
  cards.forEach((card) => {
    const id = extractProductId(card);
    const titleText = getFirstText(card, TITLE_SELECTORS).toLowerCase();
    const authorText = getFirstText(card, AUTHOR_SELECTORS).toLowerCase();
    const nameOk = nv.length > 0 ? nv.some((v) => titleText.includes(v)) : true;
    const authorOk = av.length > 0 ? av.some((v) => authorText.includes(v)) : true;
    if (nameOk && authorOk && id) ids.add(id);
  });
  return Array.from(ids);
}

/* ---------- Нормализация + транслитерация ---------- */

const hasCyrillic = (s) => /[а-яё]/i.test(String(s));
const hasLatin = (s) => /[a-z]/i.test(String(s));

function normalizeForSearch(s) {
  let x = String(s ?? "").toLowerCase();
  try { x = x.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""); } catch {}
  x = x.replace(/ё/g, "е");
  x = x.replace(/[_—–−\-]+/g, "-");
  x = x.replace(/[^\p{L}\p{N}\- ]+/gu, " ");
  x = x.replace(/\s+/g, " ").trim();
  return x;
}
function translitRuToLat(s) {
  const map = {
    а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ё:"e", ж:"zh", з:"z", и:"i", й:"y",
    к:"k", л:"l", м:"m", н:"n", о:"o", п:"p", р:"r", с:"s", т:"t", у:"u", ф:"f",
    х:"kh", ц:"ts", ч:"ch", ш:"sh", щ:"shch", ъ:"", ы:"y", ь:"", э:"e", ю:"yu", я:"ya"
  };
  return String(s || "").toLowerCase().split("").map((ch) => map[ch] ?? ch).join("");
}
function translitLatToRu(s) {
  let x = String(s || "").toLowerCase();
  x = x
    .replace(/shch/g, "щ")
    .replace(/sch/g, "щ")
    .replace(/yo/g, "ё")
    .replace(/yu/g, "ю")
    .replace(/ya/g, "я")
    .replace(/ye/g, "е")
    .replace(/kh/g, "х")
    .replace(/ts/g, "ц")
    .replace(/ch/g, "ч")
    .replace(/sh/g, "ш")
    .replace(/zh/g, "ж");
  const map = {
    a:"а", b:"б", c:"к", d:"д", e:"е", f:"ф", g:"г", h:"х", i:"и", j:"дж",
    k:"к", l:"л", m:"м", n:"н", o:"о", p:"п", q:"к", r:"р", s:"с", t:"т",
    u:"у", v:"в", w:"в", x:"кс", y:"й", z:"з", "-":"-", " ":" "
  };
  return x.split("").map((ch) => map[ch] ?? ch).join("");
}

/* ---------- Перевод + построение вариантов ---------- */

async function buildLanguageIndependentVariants(query, label = "query") {
  const q = String(query || "").trim();
  if (!q) { dbg(`buildVariants(${label}): empty input`); return []; }

  const variants = new Set([q, q.toLowerCase()]);

  // Переводы в RU и EN
  for (const target of ["ru", "en"]) {
    try {
      const arr = await translateBatch([q], "auto", target);
      const tr = Array.isArray(arr) ? String(arr[0] || "") : "";
      if (tr) { variants.add(tr); variants.add(tr.toLowerCase()); }
    } catch (e) {
      dbg(`translate to ${target} error:`, e?.message || e);
    }
  }

  // Транслитерации для всех накопленных вариантов
  const snapshot = Array.from(variants);
  for (const v of snapshot) {
    if (hasCyrillic(v)) {
      const lat = translitRuToLat(v);
      if (lat) { variants.add(lat); variants.add(lat.toLowerCase()); }
    }
    if (hasLatin(v)) {
      const ru = translitLatToRu(v);
      if (ru) { variants.add(ru); variants.add(ru.toLowerCase()); }
    }
  }

  const out = Array.from(variants).filter(Boolean);
  dbgGroup(`variants(${label})`, () => dbg(out));
  return out;
}

/* ---------- Server helpers ---------- */

const API_BASE = "http://localhost:3001";
async function fetchAllProducts() {
  const url = `${API_BASE}/api/products`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Fetch products failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.products)) return json.products;
  dbg("Unknown products payload shape:", json);
  return [];
}

/* ---------- Компонент ---------- */

export default function BookFilter({
  isOpen,
  onClose,
  onApply,
  initialFilter,
  onReset,
}) {
  const { t, i18n } = useTranslation();
  const lang = getUiLang(i18n);

  const [filter, setFilter] = useState({
    name: "",
    categories: [],
    author: "",
    priceFrom: "",
    priceTo: "",
    sort: "asc",
  });

  useEffect(() => {
    dbgGroup("Modal open / initialFilter sync", () => {
      dbg("isOpen:", isOpen);
      dbg("initialFilter:", initialFilter);
    });
    if (initialFilter) setFilter(initialFilter);
  }, [initialFilter, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFilter((prev) => {
      let categories = prev.categories || [];
      if (checked) categories = [...categories, value];
      else categories = categories.filter((c) => c !== value);
      return { ...prev, categories };
    });
  };

  const handleReset = () => {
    if (typeof onReset === "function") {
      dbg("Reset via onReset()");
      onReset();
    } else {
      const cleared = { name: "", categories: [], author: "", priceFrom: "", priceTo: "", sort: "asc" };
      setFilter(cleared);
      onApply(cleared);
      onClose();
    }
  };

  function expandCategories(selected) {
    const set = new Set();
    (selected || []).forEach((c) => {
      set.add(c);
      const extra = CATEGORY_EXPAND_MAP[c];
      if (extra && Array.isArray(extra)) extra.forEach((x) => set.add(x));
    });
    return Array.from(set);
  }

  const includesAny = (target, variants) => {
    if (!variants || variants.length === 0) return true;
    const t = normalizeForSearch(target);
    if (!t) return false;
    return variants.some((v) => t.includes(normalizeForSearch(v)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t0 = (performance && performance.now && performance.now()) || Date.now();

    dbgGroup("Submit start", () => {
      dbg("raw filter:", filter);
      dbg("uiLang:", lang, "opposite:", getOppositeLang(lang));
    });

    const categoriesExpanded = expandCategories(filter.categories);
    const nameQuery = String(filter.name || "").trim();
    const authorQuery = String(filter.author || "").trim();

    // Варианты поиска (перевод + транслит)
    const [nameVariants, authorVariants] = await Promise.all([
      buildLanguageIndependentVariants(nameQuery, "name"),
      buildLanguageIndependentVariants(authorQuery, "author"),
    ]);

    // Цены
    const priceFromNum = Number(filter.priceFrom);
    const priceToNum = Number(filter.priceTo);
    const hasPriceFrom = !Number.isNaN(priceFromNum) && filter.priceFrom !== "";
    const hasPriceTo = !Number.isNaN(priceToNum) && filter.priceTo !== "";

    // Основной путь: фильтрация по данным сервера
    let serverError = null;
    try {
      const all = await fetchAllProducts();
      dbg("Products fetched:", all.length);

      const filtered = (all || []).filter((p) => {
        const nameOk = nameVariants.length ? includesAny(p.name, nameVariants) : true;
        const authorOk = authorVariants.length ? includesAny(p.author ?? "", authorVariants) : true;
        const catOk = categoriesExpanded.length ? includesAny(p.category ?? "", categoriesExpanded) : true;

        const price = Number(p.price);
        const priceOk =
          (hasPriceFrom ? price >= priceFromNum : true) &&
          (hasPriceTo ? price <= priceToNum : true);

        return nameOk && authorOk && catOk && priceOk;
      });

      dbg("Filtered count:", filtered.length);

      const sorted = filtered.sort((a, b) =>
        filter.sort === "desc" ? Number(b.price) - Number(a.price) : Number(a.price) - Number(b.price)
      );

      const serverMatchedProductIds = sorted.map((p) => String(p.id));

      // Ключевая совместимость: дублируем в domMatchedProductIds
      const processed = {
        ...filter,
        categories: categoriesExpanded,
        nameQuery,
        authorQuery,
        nameVariants,
        authorVariants,
        matchSource: "server",
        uiLang: lang,
        searchedAcross: ["ru", "en", "translit"],
        serverMatchedProductIds,
        serverMatchedProducts: sorted,
        domMatchedProductIds: serverMatchedProductIds, // <-- для существующего UI
      };

      const t1 = (performance && performance.now && performance.now()) || Date.now();
      dbgGroup("Submit processed payload (server)", () => {
        dbg("serverMatchedProductIds:", serverMatchedProductIds.length);
        dbg("total duration(ms):", Math.round(t1 - t0));
      });

      onApply(processed);
      onClose();
      return;
    } catch (e1) {
      serverError = e1;
      dbg("Server fetch failed, fallback to DOM:", e1?.message || e1);
    }

    // Fallback: DOM
    try {
      const domMatchedProductIds = findDomMatchedProductIds(nameVariants, authorVariants);
      const processed = {
        ...filter,
        categories: categoriesExpanded,
        nameQuery,
        authorQuery,
        nameVariants,
        authorVariants,
        domMatchedProductIds,
        matchSource: "dom",
        uiLang: lang,
        searchedAcross: ["ru", "en", "translit"],
        serverError: serverError ? String(serverError) : undefined,
      };
      onApply(processed);
      onClose();
    } catch (e2) {
      const processed = {
        ...filter,
        categories: categoriesExpanded,
        nameQuery,
        authorQuery,
        nameVariants,
        authorVariants,
        matchSource: "none",
        uiLang: lang,
        searchedAcross: ["ru", "en", "translit"],
        serverError: serverError ? String(serverError) : undefined,
        fallbackError: String(e2?.message || e2),
      };
      onApply(processed);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="book-filter-overlay">
      <div className="book-filter-modal">
        <button
          className="book-filter-close"
          onClick={onClose}
          aria-label={t("book_filter_close_aria", { defaultValue: "Закрыть фильтр" })}
          type="button"
        >
          ×
        </button>
        <h2 className="book-filter-title">
          {t("book_filter_title", { defaultValue: "Фильтр книг" })}
        </h2>
        <form onSubmit={handleSubmit} className="book-filter-form">
          <div className="book-filter-row">
            <label className="book-filter-label" htmlFor="name">
              {t("book_filter_name_label", { defaultValue: "Название книги" })}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={filter.name}
              onChange={handleChange}
              className="book-filter-input"
              placeholder={t("book_filter_name_placeholder", { defaultValue: "Введите название книги" })}
            />
          </div>

          <div className="book-filter-row">
            <label className="book-filter-label">
              {t("book_filter_categories_label", { defaultValue: "Категории" })}
            </label>
            <div className="book-filter-categories">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="book-filter-checkbox">
                  <input
                    type="checkbox"
                    value={cat}
                    checked={filter.categories.includes(cat)}
                    onChange={handleCategoryChange}
                  />
                  {CATEGORY_LABELS[lang]?.[cat] ?? cat}
                </label>
              ))}
            </div>
          </div>

          <div className="book-filter-row">
            <label className="book-filter-label" htmlFor="author">
              {t("book_filter_author_label", { defaultValue: "Автор" })}
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={filter.author}
              onChange={handleChange}
              className="book-filter-input"
              placeholder={t("book_filter_author_placeholder", { defaultValue: "Введите автора" })}
            />
          </div>

          <div className="book-filter-row">
            <label className="book-filter-label">
              {t("book_filter_price_label", { defaultValue: "Цена (₽)" })}
            </label>
            <div className="book-filter-price-inputs">
              <input
                type="number"
                name="priceFrom"
                value={filter.priceFrom}
                onChange={handleChange}
                className="book-filter-input"
                placeholder={t("book_filter_price_from", { defaultValue: "от" })}
                min="0"
              />
              <input
                type="number"
                name="priceTo"
                value={filter.priceTo}
                onChange={handleChange}
                className="book-filter-input"
                placeholder={t("book_filter_price_to", { defaultValue: "до" })}
                min="0"
              />
            </div>
          </div>

          <div className="book-filter-row">
            <label className="book-filter-label">
              {t("book_filter_sort_label", { defaultValue: "Сортировка по цене" })}
            </label>
            <select
              name="sort"
              value={filter.sort}
              onChange={handleChange}
              className="book-filter-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.tKey, { defaultValue: opt.defaultLabel })}
                </option>
              ))}
            </select>
          </div>

          <div className="book-filter-actions">
            <button
              type="button"
              className="book-filter-btn book-filter-btn-secondary"
              onClick={handleReset}
            >
              {t("book_filter_btn_reset", { defaultValue: "Сбросить" })}
            </button>
            <button
              type="submit"
              className="book-filter-btn book-filter-btn-primary"
            >
              {t("book_filter_btn_apply", { defaultValue: "Применить" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}