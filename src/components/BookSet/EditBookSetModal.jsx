import React, { useState, useEffect, useRef } from "react";
import "./EditBookSetModal.css";

function EditBookSetModal({ bookSet, onClose, onSave }) {
  const [form, setForm] = useState({
    ...bookSet,
    books: bookSet.books ? [...bookSet.books] : [],
  });

  const [visible, setVisible] = useState(false); // Для анимации
  const [shouldRender, setShouldRender] = useState(true); // Для размонтирования
  const formRef = useRef(null);

  // Синхронизируем количество полей для книг с count
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

  // Блокируем прокрутку body
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Плавное появление
  useEffect(() => {
    setVisible(true);
  }, []);

  // Обработка Esc и клик вне формы
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

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((f) => ({ ...f, image: ev.target.result }));
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

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, count: Number(form.count) });
    handleClose();
  }

  // Плавное закрытие
  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 250); // Время совпадает с transition в CSS
  }

  if (!shouldRender) return null;

  return (
    <div className={`modal-backdrop ${visible ? "modal-open" : "modal-close"}`}>
      <form
        className={`edit-modal ${visible ? "modal-open" : "modal-close"}`}
        ref={formRef}
        onSubmit={handleSubmit}
      >
        <h2>Редактировать набор</h2>
        <label>
          Название:
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Автор:
          <input name="author" value={form.author} onChange={handleChange} required />
        </label>
        <label>
          Описание:
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </label>
        <label>
          Кол-во книг:
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
          Книги:
          <div className="edit-books-list">
            {Array.from({ length: form.count }).map((_, idx) => (
              <input
                key={idx}
                name={`book_${idx}`}
                value={form.books[idx] || ""}
                onChange={handleChange}
                placeholder={`Книга ${idx + 1}`}
                required
                maxLength={80}
              />
            ))}
          </div>
        </label>
        <label>
          Год:
          <input name="year" type="number" value={form.year} onChange={handleChange} required min={1000} max={2100} />
        </label>
        <label>
          Страна:
          <input name="country" value={form.country} onChange={handleChange} required />
        </label>
        <label>
          Цена (₽):
          <input name="price" type="number" value={form.price} onChange={handleChange} required min={0} />
        </label>
        <label>
          Картинка:
          <input name="image" type="file" accept="image/*" onChange={handleChange} />
        </label>
        <div className="edit-modal-actions">
          <button type="button" onClick={handleClose}>Отмена</button>
          <button type="submit">Сохранить</button>
        </div>
      </form>
    </div>
  );
}

export default EditBookSetModal;