import React, { useState, useEffect } from "react";
import "./ProductForm.css";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

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

// Встроенная карта переводов для отображения лейблов категорий в текущем языке.
// Значения опций остаются русскими (как в данных), чтобы не ломать сохранение и фильтрацию.
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

function getUiLang(i18n) {
  const lng = (i18n?.language || "ru").toLowerCase();
  return lng.startsWith("en") ? "en" : "ru";
}

const ProductForm = ({ product = null, onSuccess, onCancel, style, modal }) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

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
    if (!formData.name.trim())
      e.name = t("product_form_error_name_required", { defaultValue: "Название книги обязательно" });
    if (!formData.description.trim())
      e.description = t("product_form_error_description_required", { defaultValue: "Описание книги обязательно" });
    if (!formData.price || formData.price <= 0)
      e.price = t("product_form_error_price_invalid", { defaultValue: "Укажите корректную цену" });
    if (!formData.category)
      e.category = t("product_form_error_category_required", { defaultValue: "Выберите категорию" });
    if (!formData.quantity || formData.quantity < 0)
      e.quantity = t("product_form_error_quantity_required", { defaultValue: "Укажите количество книг" });
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
          message: isEdit
            ? t("product_form_alert_saved", { defaultValue: "Книга успешно изменена" })
            : t("product_form_alert_created", { defaultValue: "Книга успешно создана" }),
        });

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
          : result.message || t("product_form_alert_save_error", { defaultValue: "Ошибка при сохранении книги" });
        setAlert({ status: "error", message: msg });
        console.log("[ProductForm] handleSubmit: error", msg);
      }
    } catch (err) {
      setAlert({
        status: "error",
        message: t("product_form_alert_network_error", {
          defaultValue: "Ошибка соединения с сервером. Проверьте доступность API.",
        }),
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
  const lang = getUiLang(i18n);

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
            aria-label={t("product_form_close_aria", { defaultValue: "Закрыть форму" })}
            type="button"
          >
            ×
          </button>

          <h2 className="form-title">
            {isEdit
              ? t("product_form_title_edit", { defaultValue: "Редактирование книги" })
              : t("product_form_title_create", { defaultValue: "Создание новой книги" })}
          </h2>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  {t("product_form_name_label", { defaultValue: "Название книги *" })}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? "error" : ""}`}
                  placeholder={t("product_form_name_placeholder", { defaultValue: "Введите название книги" })}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  {t("product_form_desc_label", { defaultValue: "Описание *" })}
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-textarea ${errors.description ? "error" : ""}`}
                  placeholder={t("product_form_desc_placeholder", { defaultValue: "Описание книги" })}
                />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  {t("product_form_price_label", { defaultValue: "Цена (₽) *" })}
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
                  {t("product_form_quantity_label", { defaultValue: "Количество *" })}
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
                  {t("product_form_category_label", { defaultValue: "Категория *" })}
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`form-select ${errors.category ? "error" : ""}`}
                >
                  <option value="">
                    {t("product_form_category_placeholder", { defaultValue: "Выберите категорию" })}
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[lang]?.[c] ?? c}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="error-message">{errors.category}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="author" className="form-label">
                  {t("product_form_author_label", { defaultValue: "Автор" })}
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={t("product_form_author_placeholder", { defaultValue: "Автор книги" })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="image" className="form-label">
                  {t("product_form_image_label", { defaultValue: "URL изображения" })}
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={t("product_form_image_placeholder", { defaultValue: "https://example.com/image.jpg" })}
                />
              </div>
            </div>
            {formData.image && (
              <div className="image-preview">
                <img
                  src={formData.image}
                  alt={t("product_form_image_alt", { defaultValue: "Предпросмотр" })}
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
                {isEdit
                  ? t("product_form_btn_cancel", { defaultValue: "Отмена" })
                  : t("product_form_btn_clear", { defaultValue: "Очистить" })}
              </button>
              <button
                type="submit"
                className="btn-form btn-form-primary"
                disabled={busy}
              >
                {busy
                  ? isEdit
                    ? t("product_form_btn_saving", { defaultValue: "Сохранение..." })
                    : t("product_form_btn_creating", { defaultValue: "Создание..." })
                  : isEdit
                  ? t("product_form_btn_save", { defaultValue: "Сохранить" })
                  : t("product_form_btn_create", { defaultValue: "Создать книгу" })}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
};

export default ProductForm;