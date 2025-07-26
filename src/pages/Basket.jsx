import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { BasketProduct } from "../components/Basket/Basket-product";
import PaymentDrawer from "../components/PaymentDrawer/PaymentDrawer";

const Basket = () => {
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
    console.log("Кнопка Оплатить нажата");
    setPaymentOpen(true);
  };

  const closePayment = () => {
    console.log("Закрытие Drawer");
    setPaymentOpen(false);
  };

  // Стили для кастомной кнопки
  const buttonStyle = {
    backgroundColor: 'transparent',
    border: '1px solid white',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  };

  const buttonHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-1px)',
  };

  return (
    <div className="basket-container">
      <h2>Корзина товаров</h2>
      {cart.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <>
          <table className="basket-table">
            <thead>
              <tr>
                <th>Изображение</th>
                <th>Наименование</th>
                <th>Описание</th>
                <th>Категория</th>
                <th>Автор</th>
                <th>Цена</th>
                <th>Количество</th>
                <th>Итог</th>
                <th>Действия</th>
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
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  Общая сумма:
                </td>
                <td
                  style={{
                    fontWeight: 600,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {totalSum.toFixed(2)} ₽
                </td>
                <td>
                  <button
                    style={buttonStyle}
                    onClick={openPayment}
                    title="Оплатить"
                    onMouseEnter={(e) => {
                      Object.assign(e.target.style, buttonHoverStyle);
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Оплатить
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
          <PaymentDrawer isOpen={isPaymentOpen} onClose={closePayment} totalSum={totalSum} />
        </>
      )}
    </div>
  );
};

export default Basket;
