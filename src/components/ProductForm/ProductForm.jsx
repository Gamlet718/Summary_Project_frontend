import React, { useState, useEffect } from "react";
import "./ProductForm.css";

const ProductForm = ({ product = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    quantity: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState({ status: "", message: "" });

  const categories = [
    "Электроника",
    "Одежда",
    "Дом и сад",
    "Спорт",
    "Книги",
    "Красота",
    "Автотовары",
    "Другое",
  ];
  const API_BASE_URL = "http://localhost:3000/api";

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        brand: product.brand || "",
        quantity: product.quantity || "",
        image: product.image || "",
      });
      setErrors({});
      setAlert({ status: "", message: "" });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (alert.message) setAlert({ status: "", message: "" });
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Название товара обязательно";
    if (!formData.description.trim())
      e.description = "Описание товара обязательно";
    if (!formData.price || formData.price <= 0)
      e.price = "Укажите корректную цену";
    if (!formData.category) e.category = "Выберите категорию";
    if (!formData.quantity || formData.quantity < 0)
      e.quantity = "Укажите количество товара";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    setBusy(true);
    setAlert({ status: "", message: "" });

    const isEdit = Boolean(product?.id);
    const url = isEdit
      ? `${API_BASE_URL}/products/${product.id}`
      : `${API_BASE_URL}/products`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        const saved = result.data;
        onSuccess && onSuccess(saved);

        setAlert({
          status: "success",
          message: isEdit ? "Товар успешно изменен" : "Товар успешно создан",
        });

        setTimeout(() => {
          onSuccess && onSuccess(saved);
        }, 1500);

        if (!isEdit) {
          setFormData({
            name: "",
            description: "",
            price: "",
            category: "",
            brand: "",
            quantity: "",
            image: "",
          });
        }
      } else {
        const msg = Array.isArray(result.errors)
          ? result.errors.join(", ")
          : result.message || "Ошибка при сохранении товара";
        setAlert({ status: "error", message: msg });
      }
    } catch {
      setAlert({
        status: "error",
        message: "Ошибка соединения с сервером. Проверьте доступность API.",
      });
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
      brand: "",
      quantity: "",
      image: "",
    });
    setErrors({});
    setAlert({ status: "", message: "" });
  };

  const isEdit = Boolean(product?.id);

  return (
    <div className="product-form-container">
      <div className="product-form-card">
        <h2 className="form-title">
          {isEdit ? "Редактирование товара" : "Создание нового товара"}
        </h2>

        <form onSubmit={handleSubmit} className="product-form">
          {/* Название */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Название товара *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="Введите название товара"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>
          </div>

          {/* Описание */}
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
                placeholder="Описание товара"
              />
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>
          </div>

          {/* Цена и количество */}
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

          {/* Категория и бренд */}
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
                {categories.map((c) => (
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
              <label htmlFor="brand" className="form-label">
                Бренд
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="form-input"
                placeholder="Бренд товара"
              />
            </div>
          </div>

          {/* Изображение */}
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

          {/* Кнопки */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-form btn-form-secondary"
              onClick={isEdit ? onCancel : clearForm}
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
                : "Создать товар"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
