import React, { useState, useEffect } from "react";
import "./BookFilter.css";

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

const SORT_OPTIONS = [
  { value: "asc", label: "От дешевых к дорогим" },
  { value: "desc", label: "От дорогих к дешевым" },
];

export default function BookFilter({
  isOpen,
  onClose,
  onApply,
  initialFilter,
  onReset, // новый проп для сброса фильтра
}) {
  const [filter, setFilter] = useState({
    name: "",
    categories: [],
    author: "",
    priceFrom: "",
    priceTo: "",
    sort: "asc",
  });

  useEffect(() => {
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
      if (checked) {
        categories = [...categories, value];
      } else {
        categories = categories.filter((c) => c !== value);
      }
      return { ...prev, categories };
    });
  };

  // Сброс фильтра: если есть onReset, вызываем его, иначе стандартное поведение
  const handleReset = () => {
    if (typeof onReset === "function") {
      onReset();
    } else {
      setFilter({
        name: "",
        categories: [],
        author: "",
        priceFrom: "",
        priceTo: "",
        sort: "asc",
      });
      onApply({
        name: "",
        categories: [],
        author: "",
        priceFrom: "",
        priceTo: "",
        sort: "asc",
      });
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(filter);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="book-filter-overlay">
      <div className="book-filter-modal">
        <button
          className="book-filter-close"
          onClick={onClose}
          aria-label="Закрыть фильтр"
          type="button"
        >
          ×
        </button>
        <h2 className="book-filter-title">Фильтр книг</h2>
        <form onSubmit={handleSubmit} className="book-filter-form">
          <div className="book-filter-row">
            <label className="book-filter-label" htmlFor="name">
              Название книги
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={filter.name}
              onChange={handleChange}
              className="book-filter-input"
              placeholder="Введите название книги"
            />
          </div>
          <div className="book-filter-row">
            <label className="book-filter-label">Категории</label>
            <div className="book-filter-categories">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="book-filter-checkbox">
                  <input
                    type="checkbox"
                    value={cat}
                    checked={filter.categories.includes(cat)}
                    onChange={handleCategoryChange}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <div className="book-filter-row">
            <label className="book-filter-label" htmlFor="author">
              Автор
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={filter.author}
              onChange={handleChange}
              className="book-filter-input"
              placeholder="Введите автора"
            />
          </div>
          <div className="book-filter-row">
            <label className="book-filter-label">Цена (₽)</label>
            <div className="book-filter-price-inputs">
              <input
                type="number"
                name="priceFrom"
                value={filter.priceFrom}
                onChange={handleChange}
                className="book-filter-input"
                placeholder="от"
                min="0"
              />
              <input
                type="number"
                name="priceTo"
                value={filter.priceTo}
                onChange={handleChange}
                className="book-filter-input"
                placeholder="до"
                min="0"
              />
            </div>
          </div>
          <div className="book-filter-row">
            <label className="book-filter-label">Сортировка по цене</label>
            <select
              name="sort"
              value={filter.sort}
              onChange={handleChange}
              className="book-filter-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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
              Сбросить
            </button>
            <button
              type="submit"
              className="book-filter-btn book-filter-btn-primary"
            >
              Применить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}