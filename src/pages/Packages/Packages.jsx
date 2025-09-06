import React, { useMemo, useState } from "react";
import BookSet from "../../components/BookSet/BookSet";
import PaymentDrawer from "../../components/PaymentDrawer/PaymentDrawer";
import "./Packages.css";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

/**
 * @file Packages.jsx
 * @description Страница "Наборы книг": выводит коллекцию наборов, позволяет администратору редактировать
 * содержимое и запускает оплату через PaymentDrawer.
 *
 * Ключевые моменты:
 * - Все пользовательские строки вынесены в i18n-ключи (включая данные наборов: title, author, description,
 *   country и список books).
 * - defaultValue на русском для страховки.
 * - Месяц отображается через локализованные ключи month_*.
 */

/** @typedef {{ key: string, defaultValue: string }} I18nField */

/**
 * Тип исходного набора (ключи переводов + дефолты).
 * @typedef {Object} RawBookSet
 * @property {number} id
 * @property {I18nField} title
 * @property {I18nField} author
 * @property {I18nField} description
 * @property {number} count
 * @property {number} year
 * @property {I18nField} country
 * @property {number} price
 * @property {string} image
 * @property {Array<I18nField>} books
 */

/**
 * Тип локализованного набора (значения — строки).
 * @typedef {Object} LocalizedBookSet
 * @property {number} id
 * @property {string} title
 * @property {string} author
 * @property {string} description
 * @property {number} count
 * @property {number} year
 * @property {string} country
 * @property {number} price
 * @property {string} image
 * @property {Array<string>} books
 */

const initialBookSetsSource = [
  {
    id: 1,
    title: { key: "pkg_1_title", defaultValue: "Русская классика" },
    author: { key: "pkg_1_author", defaultValue: "Ф. М. Достоевский" },
    description: { key: "pkg_1_description", defaultValue: "Лучшие произведения великого писателя." },
    count: 5,
    year: 1870,
    country: { key: "country_russia", defaultValue: "Россия" },
    price: 1200,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
    books: [
      { key: "pkg_1_book_1", defaultValue: "Преступление и наказание" },
      { key: "pkg_1_book_2", defaultValue: "Идиот" },
      { key: "pkg_1_book_3", defaultValue: "Братья Карамазовы" },
      { key: "pkg_1_book_4", defaultValue: "Бесы" },
      { key: "pkg_1_book_5", defaultValue: "Игрок" },
    ],
  },
  {
    id: 2,
    title: { key: "pkg_2_title", defaultValue: "Мировая фантастика" },
    author: { key: "pkg_2_author", defaultValue: "Айзек Азимов" },
    description: { key: "pkg_2_description", defaultValue: "Сборник фантастических рассказов." },
    count: 4,
    year: 1950,
    country: { key: "country_usa", defaultValue: "США" },
    price: 950,
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    books: [
      { key: "pkg_2_book_1", defaultValue: "Я, робот" },
      { key: "pkg_2_book_2", defaultValue: "Основание" },
      { key: "pkg_2_book_3", defaultValue: "Конец Вечности" },
      { key: "pkg_2_book_4", defaultValue: "Стальные пещеры" },
    ],
  },
  {
    id: 3,
    title: { key: "pkg_3_title", defaultValue: "Поэзия Серебряного века" },
    author: { key: "pkg_3_author", defaultValue: "А. А. Блок" },
    description: { key: "pkg_3_description", defaultValue: "Стихи и поэмы." },
    count: 3,
    year: 1910,
    country: { key: "country_russia", defaultValue: "Россия" },
    price: 700,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    books: [
      { key: "pkg_3_book_1", defaultValue: "Стихи о Прекрасной Даме" },
      { key: "pkg_3_book_2", defaultValue: "Двенадцать" },
      { key: "pkg_3_book_3", defaultValue: "Ночные часы" },
    ],
  },
  {
    id: 4,
    title: { key: "pkg_4_title", defaultValue: "Детективы Агаты Кристи" },
    author: { key: "pkg_4_author", defaultValue: "Агата Кристи" },
    description: { key: "pkg_4_description", defaultValue: "Лучшие детективные истории." },
    count: 6,
    year: 1935,
    country: { key: "country_uk", defaultValue: "Великобритания" },
    price: 1400,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80",
    books: [
      { key: "pkg_4_book_1", defaultValue: "Убийство в Восточном экспрессе" },
      { key: "pkg_4_book_2", defaultValue: "Десять негритят" },
      { key: "pkg_4_book_3", defaultValue: "Смерть на Ниле" },
      { key: "pkg_4_book_4", defaultValue: "Карты на столе" },
      { key: "pkg_4_book_5", defaultValue: "Загадка Эндхауза" },
      { key: "pkg_4_book_6", defaultValue: "Тайна семи циферблатов" },
    ],
  },
  {
    id: 5,
    title: { key: "pkg_5_title", defaultValue: "Философия Запада" },
    author: { key: "pkg_5_author", defaultValue: "Ф. Ницше" },
    description: { key: "pkg_5_description", defaultValue: "Классика философской мысли." },
    count: 2,
    year: 1885,
    country: { key: "country_germany", defaultValue: "Германия" },
    price: 800,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    books: [
      { key: "pkg_5_book_1", defaultValue: "Так говорил Заратустра" },
      { key: "pkg_5_book_2", defaultValue: "По ту сторону добра и зла" },
    ],
  },
  {
    id: 6,
    title: { key: "pkg_6_title", defaultValue: "Современная проза" },
    author: { key: "pkg_6_author", defaultValue: "Харуки Мураками" },
    description: { key: "pkg_6_description", defaultValue: "Лучшие романы XXI века." },
    count: 3,
    year: 2010,
    country: { key: "country_japan", defaultValue: "Япония" },
    price: 1100,
    image: "https://images.unsplash.com/photo-1455885664032-7cbbda5d1a5a?auto=format&fit=crop&w=400&q=80",
    books: [
      { key: "pkg_6_book_1", defaultValue: "Норвежский лес" },
      { key: "pkg_6_book_2", defaultValue: "Кафка на пляже" },
      { key: "pkg_6_book_3", defaultValue: "1Q84" },
    ],
  },
  {
    id: 7,
    title: { key: "pkg_7_title", defaultValue: "Фэнтези для подростков" },
    author: { key: "pkg_7_author", defaultValue: "Дж. К. Роулинг" },
    description: { key: "pkg_7_description", defaultValue: "Волшебный мир Гарри Поттера." },
    count: 7,
    year: 2007,
    country: { key: "country_uk", defaultValue: "Великобритания" },
    price: 2100,
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
    books: [
      { key: "pkg_7_book_1", defaultValue: "Гарри Поттер и философский камень" },
      { key: "pkg_7_book_2", defaultValue: "Гарри Поттер и тайная комната" },
      { key: "pkg_7_book_3", defaultValue: "Гарри Поттер и узник Азкабана" },
      { key: "pkg_7_book_4", defaultValue: "Гарри Поттер и кубок огня" },
      { key: "pkg_7_book_5", defaultValue: "Гарри Поттер и орден Феникса" },
      { key: "pkg_7_book_6", defaultValue: "Гарри Поттер и принц-полукровка" },
      { key: "pkg_7_book_7", defaultValue: "Гарри Поттер и дары смерти" },
    ],
  },
  {
    id: 8,
    title: { key: "pkg_8_title", defaultValue: "Американская классика" },
    author: { key: "pkg_8_author", defaultValue: "Э. Хемингуэй" },
    description: { key: "pkg_8_description", defaultValue: "Романы и рассказы." },
    count: 4,
    year: 1940,
    country: { key: "country_usa", defaultValue: "США" },
    price: 900,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    books: [
      { key: "pkg_8_book_1", defaultValue: "Старик и море" },
      { key: "pkg_8_book_2", defaultValue: "По ком звонит колокол" },
      { key: "pkg_8_book_3", defaultValue: "Праздник, который всегда с тобой" },
      { key: "pkg_8_book_4", defaultValue: "Прощай, оружие!" },
    ],
  },
  {
    id: 9,
    title: { key: "pkg_9_title", defaultValue: "Французская литература" },
    author: { key: "pkg_9_author", defaultValue: "В. Гюго" },
    description: { key: "pkg_9_description", defaultValue: "Шедевры французской прозы." },
    count: 3,
    year: 1862,
    country: { key: "country_france", defaultValue: "Франция" },
    price: 950,
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    books: [
      { key: "pkg_9_book_1", defaultValue: "Отверженные" },
      { key: "pkg_9_book_2", defaultValue: "Собор Парижской Богоматери" },
      { key: "pkg_9_book_3", defaultValue: "Человек, который смеётся" },
    ],
  },
  {
    id: 10,
    title: { key: "pkg_10_title", defaultValue: "Детская литература" },
    author: { key: "pkg_10_author", defaultValue: "А. Линдгрен" },
    description: { key: "pkg_10_description", defaultValue: "Любимые книги детства." },
    count: 5,
    year: 1960,
    country: { key: "country_sweden", defaultValue: "Швеция" },
    price: 850,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
    books: [
      { key: "pkg_10_book_1", defaultValue: "Пеппи Длинныйчулок" },
      { key: "pkg_10_book_2", defaultValue: "Малыш и Карлсон" },
      { key: "pkg_10_book_3", defaultValue: "Рони, дочь разбойника" },
      { key: "pkg_10_book_4", defaultValue: "Мио, мой Мио" },
      { key: "pkg_10_book_5", defaultValue: "Братья Львиное сердце" },
    ],
  },
];

function Packages() {
  const { t } = useTranslation();

  const [bookSetsSource, setBookSetsSource] = useState(initialBookSetsSource);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentSum, setPaymentSum] = useState(0);

  const { user } = useAuth();
  const canEdit = user && user.role === "admin";

  const monthNames = [
    t("month_january", { defaultValue: "Январь" }),
    t("month_february", { defaultValue: "Февраль" }),
    t("month_march", { defaultValue: "Март" }),
    t("month_april", { defaultValue: "Апрель" }),
    t("month_may", { defaultValue: "Май" }),
    t("month_june", { defaultValue: "Июнь" }),
    t("month_july", { defaultValue: "Июль" }),
    t("month_august", { defaultValue: "Август" }),
    t("month_september", { defaultValue: "Сентябрь" }),
    t("month_october", { defaultValue: "Октябрь" }),
    t("month_november", { defaultValue: "Ноябрь" }),
    t("month_december", { defaultValue: "Декабрь" }),
  ];
  const monthName = monthNames[new Date().getMonth()];

  const localizedBookSets = useMemo(
    () =>
      bookSetsSource.map((src) => ({
        id: src.id,
        title: t(src.title.key, { defaultValue: src.title.defaultValue }),
        author: t(src.author.key, { defaultValue: src.author.defaultValue }),
        description: t(src.description.key, { defaultValue: src.description.defaultValue }),
        count: src.count,
        year: src.year,
        country: t(src.country.key, { defaultValue: src.country.defaultValue }),
        price: src.price,
        image: src.image,
        books: src.books.map((b) => t(b.key, { defaultValue: b.defaultValue })),
      })),
    [t, bookSetsSource]
  );

  // --- Защита плейсхолдеров {{...}} для runtime-перевода ---
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
    let restored = text || "";
    restored = restored.replace(/__I18N_(\d+)__/g, (_, idx) => {
      const i = Number(idx);
      return typeof tokens[i] === "string" ? tokens[i] : "";
    });
    return restored;
  }
  // ---------------------------------------------------------

  // Автоперевод изменённых значений через серверный /api/translate и инжект в i18n
  async function translateAndInject(updatedRawSet) {
    // Переводим только в en (можно расширить массивом языков)
    const targetLang = "en";
    if (targetLang === i18n.options.fallbackLng) return;

    const keys = [
      updatedRawSet.title.key,
      updatedRawSet.author.key,
      updatedRawSet.description.key,
      updatedRawSet.country.key,
      ...updatedRawSet.books.map((b) => b.key),
    ];

    const texts = [
      updatedRawSet.title.defaultValue,
      updatedRawSet.author.defaultValue,
      updatedRawSet.description.defaultValue,
      updatedRawSet.country.defaultValue,
      ...updatedRawSet.books.map((b) => b.defaultValue),
    ];

    // Маскируем плейсхолдеры для каждого текста
    const maskedPayload = texts.map((txt) => maskInterpolation(String(txt ?? "")));
    const maskedTexts = maskedPayload.map((m) => m.masked);

    try {
      const resp = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: maskedTexts,
          sourceLang: "ru",
          targetLang,
        }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      const translations = data?.translations || [];

      // Размаскируем и инжектим переводы в рантайме
      keys.forEach((k, idx) => {
        const translatedMasked = translations[idx] ?? "";
        const restored = unmaskInterpolation(String(translatedMasked), maskedPayload[idx].tokens);
        if (restored && typeof restored === "string") {
          i18n.addResource(targetLang, "common", k, restored, { overwrite: true });
        }
      });
    } catch (e) {
      console.warn("[Packages] translateAndInject failed:", e?.message || e);
      // На ошибке ничего не ломаем: ru останется как фолбэк
    }
  }

  function handleEditBookSet(edited) {
    setBookSetsSource((prev) =>
      prev.map((src) => {
        if (src.id !== edited.id) return src;

        const updated = {
          ...src,
          title: { ...src.title, defaultValue: edited.title },
          author: { ...src.author, defaultValue: edited.author },
          description: { ...src.description, defaultValue: edited.description },
          country: { ...src.country, defaultValue: edited.country },
          count: typeof edited.count === "number" ? edited.count : src.count,
          year: typeof edited.year === "number" ? edited.year : src.year,
          price: typeof edited.price === "number" ? edited.price : src.price,
          image: edited.image || src.image,
        };

        if (Array.isArray(edited.books)) {
          updated.books = edited.books.map((title, idx) => {
            const existing = src.books[idx];
            if (existing) return { ...existing, defaultValue: title };
            const baseKey = src.title.key.replace(/_title$/, "");
            return { key: `${baseKey}_book_${idx + 1}`, defaultValue: title };
          });
        }

        // Асинхронно переводим и инжектим новые значения в словарь (en)
        translateAndInject(updated);

        return updated;
      })
    );
  }

  function handleBuy(price) {
    setPaymentSum(price);
    setPaymentOpen(true);
  }

  return (
    <div className="packages-page">
      <div className="month-label">{monthName}</div>

      <h1 className="packages-title">
        {t("packages_title", { defaultValue: "Наборы книг авторов" })}
      </h1>

      <div className="booksets-list">
        {localizedBookSets.map((set) => (
          <div key={set.id} className="bookset-item">
            <BookSet
              bookSet={set}
              onEdit={handleEditBookSet}
              onBuy={handleBuy}
              canEdit={canEdit}
            />
          </div>
        ))}
      </div>

      <PaymentDrawer
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        totalSum={paymentSum}
      />
    </div>
  );
}

export default Packages;