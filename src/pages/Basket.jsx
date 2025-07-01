import React from "react";
import { useCart } from "../contexts/CartContext";
import { BasketProduct } from "../components/Basket/Basket-product";

const Basket = () => {
  const { cart, updateQuantity, setCart } = useCart();

  const totalSum = cart.reduce(
    (sum, p) => sum + p.price * (p.selectedQuantity || 1),
    0
  );

  // Обновление количества
  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  // Удаление товара из корзины
  const handleDelete = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  return (
    <div className="basket-container">
      <h2>Корзина товаров</h2>
      {cart.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <table className="basket-table">
          <thead>
            <tr>
              <th>Изображение</th>
              <th>Наименование</th>
              <th>Описание</th>
              <th>Категория</th>
              <th>Бренд</th>
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
              <td colSpan="7" style={{ textAlign: "right", fontWeight: "bold" }}>
                Общая сумма:
              </td>
              <td style={{ fontWeight: "bold" }}>{totalSum.toFixed(2)} ₽</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export default Basket;
