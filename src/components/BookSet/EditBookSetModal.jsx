import React, { useState, useEffect, useRef } from "react";
import "./EditBookSetModal.css";
import { useTranslation } from "react-i18next";

/**
 * @file EditBookSetModal.jsx
 * @description Модальное окно редактирования набора книг.
 * Поддерживает:
 * - управление списком книг согласно количеству;
 * - загрузку изображения с превью через FileReader;
 * - плавные анимации появления/закрытия;
 * - закрытие по Esc и клику вне формы;
 * - блокировку прокрутки Body, пока открыта модалка.
 * Все UI-строки локализованы i18next с дефолтами на русском.
 */

/**
 * @typedef {Object} BookSetData
 * @property {string} image URL или data URL изображения набора.
 * @property {string} title Название набора.
 * @property {string} author Автор.
 * @property {string} description Описание.
 * @property {string[]} books Список книг.
 * @property {number} count Количество книг.
 * @property {number} year Год.
 * @property {string} country Страна.
 * @property {number} price Цена (в рублях).
 */

/**
 * @typedef {Object} EditBookSetModalProps
 * @property {BookSetData} bookSet Изначальные данные набора для редактирования.
 * @property {() => void} onClose Колбэк закрытия модалки (после анимации размонтирует модалку).
 * @property {(updated: BookSetData) => void} onSave Колбэк сохранения обновлённых данных.
 */

/**
 * Модальное окно редактирования набора.
 *
 * - Синхронизирует список полей книг с полем count (1..8).
 * - Обрабатывает загрузку изображения и создаёт data URL превью.
 * - Реализует плавное появление/закрытие с помощью локального state.
 * - Закрывается по Esc и по клику вне формы.
 *
 * @param {EditBookSetModalProps} props Пропсы модального окна.
 * @returns {JSX.Element | null} Разметка модалки или null после закрытия.
 */
function EditBookSetModal({ bookSet, onClose, onSave }) {
  const { t } = useTranslation();

  /** @type {[BookSetData & { books: string[] }, React.Dispatch<React.SetStateAction<BookSetData & { books: string[] }>>]} */
  const [form, setForm] = useState({
    ...bookSet,
    books: bookSet.books ? [...bookSet.books] : [],
  });

  /**
   * visible управляет классами для анимации (open/close).
   * shouldRender нужен для размонтирования после анимации закрытия.
   */
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  /**
   * Ссылка на DOM-элемент формы для отлова клика вне области.
   * @type {React.RefObject<HTMLFormElement>}
   */
  const formRef = useRef(null);

  /**
   * Эффект синхронизации количества полей "Книга i" с форм.значением count.
   * Гарантирует 1..8 полей и поддерживает рост/сокращение массива books.
   */
  useEffect(() => {
    let count = Number(form.count) || 1;
    if (count > 8) count = 8;
    if (count < 1) count = 1;

    let books = [...form.books];
    if (books.length < count) {
      books = books.concat(Array(count - books.length).fill(""));
    } else if (books.length > count) {
      books = books.slice(0, count);
    }

    setForm((f) => ({ ...f, count, books }));
    // eslint-disable-next-line
  }, [form.count]);

  /**
   * Эффект: блокировка прокрутки body, пока открыта модалка.
   */
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  /**
   * Эффект запускает появление модалки (CSS transition).
   */
  useEffect(() => {
    setVisible(true);
  }, []);

  /**
   * Эффект: закрытие по Esc и по клику за пределами формы.
   */
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        handleClose();
      }
    }

    function handleClickOutside(e) {
      if (formRef.current && !formRef.current.contains(e.target)) {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line
  }, []);

  /**
   * Обработчик изменений формы.
   * - Для input type="file" (name="image") читает файл и сохраняет data URL.
   * - Для полей книг book_{idx} обновляет соответствующий элемент массива books.
   * - Для остальных полей — обновляет одноимённое поле в form.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e Событие изменения.
   */
  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((f) => ({ ...f, image: ev.target?.result }));
      };
      reader.readAsDataURL(files[0]);
    } else if (name.startsWith("book_")) {
      const idx = Number(name.split("_")[1]);
      setForm((f) => {
        const books = [...f.books];
        books[idx] = value;
        return { ...f, books };
      });
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  /**
   * Сабмит формы: приводит count к числу, передаёт результат наружу и закрывает модалку.
   * @param {React.FormEvent<HTMLFormElement>} e Событие отправки формы.
   */
  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, count: Number(form.count) });
    handleClose();
  }

  /**
   * Плавное закрытие модалки с последующим размонтированием.
   */
  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 250); // Время должно соответствовать transition в CSS
  }

  if (!shouldRender) return null;

  return (
    <div
      className={`modal-backdrop ${visible ? "modal-open" : "modal-close"}`}
      role="dialog"
      aria-modal="true"
    >
      <form
        className={`edit-modal ${visible ? "modal-open" : "modal-close"}`}
        ref={formRef}
        onSubmit={handleSubmit}
        aria-label={t("edit_modal_title", { defaultValue: "Редактировать набор" })}
      >
        <h2>{t("edit_modal_title", { defaultValue: "Редактировать набор" })}</h2>

        <label>
          {t("edit_field_title", { defaultValue: "Название:" })}
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          {t("edit_field_author", { defaultValue: "Автор:" })}
          <input name="author" value={form.author} onChange={handleChange} required />
        </label>

        <label>
          {t("edit_field_description", { defaultValue: "Описание:" })}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          {t("edit_field_books_count", { defaultValue: "Кол-во книг:" })}
          <input
            name="count"
            type="number"
            value={form.count}
            onChange={handleChange}
            required
            min={1}
            max={8}
          />
        </label>

        <label>
          {t("edit_field_books", { defaultValue: "Книги:" })}
          <div className="edit-books-list">
            {Array.from({ length: form.count }).map((_, idx) => (
              <input
                key={idx}
                name={`book_${idx}`}
                value={form.books[idx] || ""}
                onChange={handleChange}
                placeholder={t("edit_book_placeholder", {
                  defaultValue: "Книга {{index}}",
                  index: idx + 1,
                })}
                required
                maxLength={80}
              />
            ))}
          </div>
        </label>

        <label>
          {t("edit_field_year", { defaultValue: "Год:" })}
          <input
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            required
            min={1000}
            max={2100}
          />
        </label>

        <label>
          {t("edit_field_country", { defaultValue: "Страна:" })}
          <input name="country" value={form.country} onChange={handleChange} required />
        </label>

        <label>
          {t("edit_field_price", { defaultValue: "Цена (₽):" })}
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
            min={0}
          />
        </label>

        <label>
          {t("edit_field_image", { defaultValue: "Картинка:" })}
          <input name="image" type="file" accept="image/*" onChange={handleChange} />
        </label>

        <div className="edit-modal-actions">
          <button type="button" onClick={handleClose}>
            {t("common_cancel", { defaultValue: "Отмена" })}
          </button>
          <button type="submit">
            {t("common_save", { defaultValue: "Сохранить" })}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditBookSetModal;