import React, { useState, useEffect } from "react";
import "./ProductForm.css";
import { useAuth } from "../../contexts/AuthContext";

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

const ProductForm = ({ product = null, onSuccess, onCancel, style, modal }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    author: "",
    quantity: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState({ status: "", message: "" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    console.log("[ProductForm] modal opened");
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        author: product.author || "",
        quantity: product.quantity || "",
        image: product.image || "",
      });
      setErrors({});
      setAlert({ status: "", message: "" });
      console.log("[ProductForm] edit mode: product loaded", product);
    }
  }, [product]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onCancel && onCancel();
      console.log("[ProductForm] handleClose");
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (alert.message) setAlert({ status: "", message: "" });
    console.log("[ProductForm] handleChange:", name, value);
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Название книги обязательно";
    if (!formData.description.trim())
      e.description = "Описание книги обязательно";
    if (!formData.price || formData.price <= 0)
      e.price = "Укажите корректную цену";
    if (!formData.category) e.category = "Выберите категорию";
    if (!formData.quantity || formData.quantity < 0)
      e.quantity = "Укажите количество книг";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      console.log("[ProductForm] validation errors:", v);
      return;
    }

    setBusy(true);
    setAlert({ status: "", message: "" });

    const isEdit = Boolean(product?.id);
    const API_BASE_URL = "http://localhost:3000/api";
    const url = isEdit
      ? `${API_BASE_URL}/products/${product.id}`
      : `${API_BASE_URL}/products`;
    const method = isEdit ? "PUT" : "POST";

    const dataToSend = {
      ...formData,
      ownerId: user?.uid || "",
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        const saved = result.data;

        setAlert({
          status: "success",
          message: isEdit ? "Книга успешно изменена" : "Книга успешно создана",
        });

        // Вызываем onSuccess ОДИН раз
        onSuccess && onSuccess(saved);

        if (!isEdit) {
          setFormData({
            name: "",
            description: "",
            price: "",
            category: "",
            author: "",
            quantity: "",
            image: "",
          });
        }
        console.log("[ProductForm] handleSubmit: success", saved);
      } else {
        const msg = Array.isArray(result.errors)
          ? result.errors.join(", ")
          : result.message || "Ошибка при сохранении книги";
        setAlert({ status: "error", message: msg });
        console.log("[ProductForm] handleSubmit: error", msg);
      }
    } catch (err) {
      setAlert({
        status: "error",
        message: "Ошибка соединения с сервером. Проверьте доступность API.",
      });
      console.log("[ProductForm] handleSubmit: fetch error", err);
    } finally {
      setBusy(false);
    }
  };

  const clearForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      author: "",
      quantity: "",
      image: "",
    });
    setErrors({});
    setAlert({ status: "", message: "" });
    console.log("[ProductForm] clearForm");
  };

  const isEdit = Boolean(product?.id);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        handleClose();
        console.log("[ProductForm] Esc pressed: close form");
      }
    };
    if (modal) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [modal]);

  if (modal) {
    return (
      <div className="product-form-overlay">
        <div
          className={`product-form-card ${visible ? "fade-in" : "fade-out"}`}
          style={style}
        >
          <button
            className="btn-close-form"
            onClick={handleClose}
            aria-label="Закрыть форму"
            type="button"
          >
            ×
          </button>

          <h2 className="form-title">
            {isEdit ? "Редактирование книги" : "Создание новой книги"}
          </h2>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Название книги *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? "error" : ""}`}
                  placeholder="Введите название книги"
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Описание *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-textarea ${errors.description ? "error" : ""}`}
                  placeholder="Описание книги"
                />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`form-input ${errors.price ? "error" : ""}`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.price && (
                  <span className="error-message">{errors.price}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="quantity" className="form-label">
                  Количество *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={`form-input ${errors.quantity ? "error" : ""}`}
                  placeholder="0"
                  min="0"
                />
                {errors.quantity && (
                  <span className="error-message">{errors.quantity}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Категория *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`form-select ${errors.category ? "error" : ""}`}
                >
                  <option value="">Выберите категорию</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="error-message">{errors.category}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="author" className="form-label">
                  Автор
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Автор книги"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="image" className="form-label">
                  URL изображения
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            {formData.image && (
              <div className="image-preview">
                <img
                  src={formData.image}
                  alt="Предпросмотр"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-form btn-form-secondary"
                onClick={isEdit ? handleClose : clearForm}
                disabled={busy}
              >
                {isEdit ? "Отмена" : "Очистить"}
              </button>
              <button
                type="submit"
                className="btn-form btn-form-primary"
                disabled={busy}
              >
                {busy
                  ? isEdit
                    ? "Сохранение..."
                    : "Создание..."
                  : isEdit
                  ? "Сохранить"
                  : "Создать книгу"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
};

export default ProductForm;