import React, { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { BasketProduct } from "../../components/Basket/Basket-product";
import PaymentDrawer from "../../components/PaymentDrawer/PaymentDrawer";
import { useTranslation } from "react-i18next";
import "./Basket.css";

/**
 * @file Basket.jsx
 * @description Страница "Корзина".
 * Отвечает за:
 * - отображение списка товаров в корзине,
 * - изменение количества товаров,
 * - удаление позиций,
 * - расчёт итоговой суммы,
 * - инициацию оплаты через PaymentDrawer.
 *
 * Интернационализация:
 * - Используется i18next: useTranslation -> t("ключ", { defaultValue: "..." }).
 * - Для каждого пользовательского текста задан ключ перевода и defaultValue на русском.
 */

const Basket = () => {
  const { t } = useTranslation();

  const { cart, updateQuantity, setCart } = useCart();

  const [isPaymentOpen, setPaymentOpen] = useState(false);

  const totalSum = cart.reduce(
    (sum, p) => sum + p.price * (p.selectedQuantity || 1),
    0
  );

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const handleDelete = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const openPayment = () => {
    setPaymentOpen(true);
  };

  const closePayment = () => {
    setPaymentOpen(false);
  };

  return (
    <div className="basket-container">
      <h2>{t("basket_title", { defaultValue: "Корзина товаров" })}</h2>

      {cart.length === 0 ? (
        <p>{t("basket_empty", { defaultValue: "Корзина пуста" })}</p>
      ) : (
        <>
          <table className="basket-table">
            <thead>
              <tr>
                <th>{t("basket_th_image", { defaultValue: "Изображение" })}</th>
                <th>{t("basket_th_name", { defaultValue: "Наименование" })}</th>
                <th className="col-description">
                  {t("basket_th_description", { defaultValue: "Описание" })}
                </th>
                <th>{t("basket_th_category", { defaultValue: "Категория" })}</th>
                <th>{t("basket_th_author", { defaultValue: "Автор" })}</th>
                <th>{t("basket_th_price", { defaultValue: "Цена" })}</th>
                <th>{t("basket_th_quantity", { defaultValue: "Количество" })}</th>
                <th>{t("basket_th_total", { defaultValue: "Итог" })}</th>
                <th>{t("basket_th_actions", { defaultValue: "Действия" })}</th>
              </tr>
            </thead>

            <tbody>
              {cart.map((product) => (
                <BasketProduct
                  key={product.id}
                  product={product}
                  onQuantityChange={handleQuantityChange}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="7" className="basket-total-label">
                  {t("basket_total_label", { defaultValue: "Общая сумма:" })}
                </td>

                <td className="basket-total-value">
                  {totalSum.toFixed(2)} ₽
                </td>

                <td>
                  <button
                    className="pay-button"
                    onClick={openPayment}
                    title={t("basket_pay", { defaultValue: "Оплатить" })}
                    aria-label={t("basket_pay", { defaultValue: "Оплатить" })}
                  >
                    {t("basket_pay", { defaultValue: "Оплатить" })}
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>

          <PaymentDrawer
            isOpen={isPaymentOpen}
            onClose={closePayment}
            totalSum={totalSum}
          />
        </>
      )}
    </div>
  );
};

export default Basket;