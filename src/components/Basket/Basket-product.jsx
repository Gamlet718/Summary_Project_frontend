// src/components/Basket/Basket-product.jsx
import React, { useEffect, useState } from "react";
import "./Basket-product.css";
import { useTranslation } from "react-i18next";
import { translateBatch } from "../../services/translationApi";

/**
 * @file Basket-product.jsx
 * @description
 * Компонент строки товара в корзине (в составе таблицы).
 * Отображает:
 * - изображение товара,
 * - основные сведения (название, описание, категория, автор),
 * - цену за единицу и итог за позицию,
 * - поле количества с валидацией,
 * - кнопку удаления позиции.
 *
 * Интернационализация:
 * Все статичные строки обернуты в t('ключ', { defaultValue: '...' }) с русским дефолтом.
 *
 * Ключи переводов, используемые компонентом (русские значения заданы как defaultValue):
 * - currency_symbol: "₽"
 * - basket_product_image_alt: "Изображение товара"
 * - basket_quantity_input_aria: "Количество"
 * - basket_max_hint: "Максимум: {{quantity}}"
 * - basket_product_total_title: "Итого за товар"
 * - basket_product_delete_title: "Удалить товар"
 *
 * Пример:
 * <BasketProduct
 *   product={{
 *     id: 1,
 *     name: "Книга",
 *     description: "Подробное описание",
 *     category: "Литература",
 *     author: "Автор Имя",
 *     image: "https://example.com/image.jpg",
 *     price: 499.99,
 *     quantity: 5,
 *     selectedQuantity: 1
 *   }}
 *   onQuantityChange={(id, qty) => console.log(id, qty)}
 *   onDelete={(id) => console.log('delete', id)}
 * />
 */

/**
 * @typedef {Object} BasketProductData
 * @property {number} id - Уникальный идентификатор товара.
 * @property {string} [name] - Название товара.
 * @property {string} [description] - Описание товара.
 * @property {string} [category] - Категория товара.
 * @property {string} [author] - Автор товара.
 * @property {string} [image] - URL изображения товара.
 * @property {number} price - Цена одной единицы товара.
 * @property {number} quantity - Максимально доступное количество (на складе).
 * @property {number} selectedQuantity - Текущее выбранное количество в корзине.
 */

/**
 * @typedef {Object} BasketProductProps
 * @property {BasketProductData} product - Данные товара для отображения.
 * @property {(id: number, quantity: number) => void} onQuantityChange - Обработчик изменения количества.
 * @property {(id: number) => void} onDelete - Обработчик удаления товара из корзины.
 */

// Простой in-memory кэш переводов на время жизни страницы
const transCache = new Map(); // key: `${lang}|${productId}|${name}|${description}|${category}|${author}` -> {name,description,category,author}

/**
 * Компонент строки товара в корзине.
 * @component
 * @param {BasketProductProps} props - Свойства компонента.
 * @returns {JSX.Element} Строка (tr) таблицы с данными о товаре.
 */
export function BasketProduct({ product, onQuantityChange, onDelete }) {
  const { t, i18n } = useTranslation();

  // Локальное состояние переведенных полей данных товара
  const [trData, setTrData] = useState(() => ({
    name: product.name,
    description: product.description,
    category: product.category,
    author: product.author,
  }));

  // Эффект перевода данных товара при смене языка
  useEffect(() => {
    const lang = i18n.language || "ru";

    const original = {
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      author: product.author || "",
    };

    // Если все поля пустые — просто отобразим оригинал
    const allEmpty =
      !original.name && !original.description && !original.category && !original.author;
    if (allEmpty) {
      setTrData(original);
      return;
    }

    const key = `${lang}|${product.id}|${original.name}|${original.description}|${original.category}|${original.author}`;
    if (transCache.has(key)) {
      setTrData(transCache.get(key));
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const texts = [
          original.name,
          original.description,
          original.category,
          original.author,
        ];
        // ВАЖНО: всегда переводим в выбранный язык (ru|en), независимо от исходного
        const translated = await translateBatch(texts, "auto", lang, 10000);
        const [nameTr, descTr, catTr, authTr] = translated || [];

        const out = {
          name: nameTr || original.name,
          description: descTr || original.description,
          category: catTr || original.category,
          author: authTr || original.author,
        };

        if (!cancelled) {
          transCache.set(key, out);
          setTrData(out);
        }
      } catch {
        // Фолбэк на оригинальные данные
        if (!cancelled) setTrData(original);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    i18n.language,
    product.id,
    product.name,
    product.description,
    product.category,
    product.author,
  ]);

  /**
   * Обрабатывает изменение количества товара в input[type="number"].
   * Допускаются только целые числа в диапазоне [1, product.quantity].
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения значения инпута.
   * @returns {void}
   */
  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!Number.isNaN(value) && value > 0 && value <= product.quantity) {
      onQuantityChange(product.id, value);
    }
  };

  // Символ валюты (по умолчанию — рубль).
  const currencySymbol = t("currency_symbol", { defaultValue: "₽" });

  // Общие стили для текстовых ячеек: до 5 строк, единая высота строки
  const textCellStyle = {
    color: "white",
    fontWeight: 600,
  };
  const clamp5Style = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 5,
    overflow: "hidden",
    lineHeight: "1.2",
    // 5 строк * 1.2em ≈ 6em, чтобы визуально соответствовать общей высоте строки
    maxHeight: "6em",
  };

  return (
    // Единая высота строки ≈ 5 строк текста (96px)
    <tr style={{ height: "96px" }}>
      <td>
        <img
          src={product.image || "https://placehold.co/60x60?text=No+Image"}
          alt={
            trData.name ||
            t("basket_product_image_alt", { defaultValue: "Изображение товара" })
          }
          title={
            trData.name ||
            t("basket_product_image_alt", { defaultValue: "Изображение товара" })
          }
          width={60}
          height={60}
          style={{ objectFit: "cover" }}
        />
      </td>

      <td style={textCellStyle}>
        <div style={clamp5Style}>{trData.name}</div>
      </td>
      <td style={textCellStyle}>
        <div style={clamp5Style}>{trData.description}</div>
      </td>
      <td style={textCellStyle}>
        <div style={clamp5Style}>{trData.category}</div>
      </td>
      <td style={textCellStyle}>
        <div style={clamp5Style}>{trData.author}</div>
      </td>

      <td style={{ color: "white", fontWeight: 600 }}>
        {product.price} {currencySymbol}
      </td>

      <td>
        <input
          type="number"
          min="1"
          max={product.quantity}
          value={product.selectedQuantity}
          onChange={handleInputChange}
          style={{ width: "60px" }}
          aria-label={t("basket_quantity_input_aria", { defaultValue: "Количество" })}
          title={t("basket_quantity_input_aria", { defaultValue: "Количество" })}
        />
        <div style={{ fontSize: "0.75rem", color: "white", fontWeight: 600 }}>
          {t("basket_max_hint", {
            defaultValue: "Максимум: {{quantity}}",
            quantity: product.quantity,
          })}
        </div>
      </td>

      <td
        style={{ color: "white", fontWeight: 600 }}
        className="Price_table"
        title={t("basket_product_total_title", { defaultValue: "Итого за товар" })}
      >
        {(product.price * product.selectedQuantity).toFixed(2)} {currencySymbol}
      </td>

      <td>
        <button
          onClick={() => onDelete(product.id)}
          style={{
            background: "none",
            border: "none",
            color: "red",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          aria-label={t("basket_product_delete_title", { defaultValue: "Удалить товар" })}
          title={t("basket_product_delete_title", { defaultValue: "Удалить товар" })}
        >
          ×
        </button>
      </td>
    </tr>
  );
}