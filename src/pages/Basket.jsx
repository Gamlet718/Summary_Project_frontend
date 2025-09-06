// import React, { useState } from "react";
// import { useCart } from "../contexts/CartContext";
// import { BasketProduct } from "../components/Basket/Basket-product";
// import PaymentDrawer from "../components/PaymentDrawer/PaymentDrawer";
// import { useTranslation } from "react-i18next";

// /**
//  * @file Basket.jsx
//  * @description Страница "Корзина".
//  * Отвечает за:
//  * - отображение списка товаров в корзине,
//  * - изменение количества товаров,
//  * - удаление позиций,
//  * - расчёт итоговой суммы,
//  * - инициацию оплаты через PaymentDrawer.
//  *
//  * Интернационализация:
//  * - Используется i18next: useTranslation -> t("ключ", { defaultValue: "..." }).
//  * - Для каждого пользовательского текста задан ключ перевода и defaultValue на русском.
//  */

// /**
//  * Компонент страницы корзины.
//  * Источники данных и действий:
//  * - useCart: получение списка товаров, изменение количества, удаление.
//  * - PaymentDrawer: оформление оплаты.
//  *
//  * Состояния:
//  * - isPaymentOpen: открытие/закрытие панели оплаты.
//  *
//  * @returns {JSX.Element} Разметка страницы корзины.
//  */
// const Basket = () => {
//   const { t } = useTranslation();

//   /**
//    * Данные корзины и методы управления из контекста.
//    * @type {{
//    *   cart: Array<{
//    *     id: string | number,
//    *     title?: string,
//    *     description?: string,
//    *     category?: string,
//    *     author?: string,
//    *     price: number,
//    *     selectedQuantity?: number
//    *   }>,
//    *   updateQuantity: (productId: string | number, newQuantity: number) => void,
//    *   setCart: React.Dispatch<React.SetStateAction<any[]>>
//    * }}
//    */
//   const { cart, updateQuantity, setCart } = useCart();

//   /**
//    * Состояние открытия боковой панели оплаты.
//    * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
//    */
//   const [isPaymentOpen, setPaymentOpen] = useState(false);

//   /**
//    * Итоговая сумма по корзине.
//    * Для каждой позиции используется цена * выбранное количество (по умолчанию 1).
//    * @type {number}
//    */
//   const totalSum = cart.reduce(
//     (sum, p) => sum + p.price * (p.selectedQuantity || 1),
//     0
//   );

//   /**
//    * Обработчик изменения количества у товара.
//    * Делегирует изменение в контекст корзины.
//    *
//    * @param {string | number} productId Идентификатор товара.
//    * @param {number} newQuantity Новое количество.
//    * @returns {void}
//    */
//   const handleQuantityChange = (productId, newQuantity) => {
//     updateQuantity(productId, newQuantity);
//   };

//   /**
//    * Удаление товара из корзины по идентификатору.
//    *
//    * @param {string | number} productId Идентификатор товара.
//    * @returns {void}
//    */
//   const handleDelete = (productId) => {
//     setCart((prev) => prev.filter((item) => item.id !== productId));
//   };

//   /**
//    * Открытие панели оплаты.
//    * @returns {void}
//    */
//   const openPayment = () => {
//     console.log("Кнопка Оплатить нажата");
//     setPaymentOpen(true);
//   };

//   /**
//    * Закрытие панели оплаты.
//    * @returns {void}
//    */
//   const closePayment = () => {
//     console.log("Закрытие Drawer");
//     setPaymentOpen(false);
//   };

//   /**
//    * Базовые стили для кастомной кнопки оплаты.
//    * @type {React.CSSProperties}
//    */
//   const buttonStyle = {
//     backgroundColor: "transparent",
//     border: "1px solid white",
//     color: "white",
//     padding: "8px 16px",
//     borderRadius: "8px",
//     fontSize: "14px",
//     fontWeight: "500",
//     cursor: "pointer",
//     transition: "all 0.2s ease",
//     outline: "none",
//   };

//   /**
//    * Стили при наведении на кнопку оплаты.
//    * Применяются программно в обработчиках onMouseEnter/onMouseLeave.
//    * @type {React.CSSProperties}
//    */
//   const buttonHoverStyle = {
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//     transform: "translateY(-1px)",
//   };

//   return (
//     <div className="basket-container">
//       <h2>{t("basket_title", { defaultValue: "Корзина товаров" })}</h2>

//       {cart.length === 0 ? (
//         <p>{t("basket_empty", { defaultValue: "Корзина пуста" })}</p>
//       ) : (
//         <>
//           <table className="basket-table">
//             <thead>
//               <tr>
//                 <th>{t("basket_th_image", { defaultValue: "Изображение" })}</th>
//                 <th>{t("basket_th_name", { defaultValue: "Наименование" })}</th>
//                 <th
//                   // Делаем колонку "Описание" шире, но без перегиба
//                   style={{ width: "28%" }}
//                 >
//                   {t("basket_th_description", { defaultValue: "Описание" })}
//                 </th>
//                 <th>{t("basket_th_category", { defaultValue: "Категория" })}</th>
//                 <th>{t("basket_th_author", { defaultValue: "Автор" })}</th>
//                 <th>{t("basket_th_price", { defaultValue: "Цена" })}</th>
//                 <th>{t("basket_th_quantity", { defaultValue: "Количество" })}</th>
//                 <th>{t("basket_th_total", { defaultValue: "Итог" })}</th>
//                 <th>{t("basket_th_actions", { defaultValue: "Действия" })}</th>
//               </tr>
//             </thead>

//             <tbody>
//               {cart.map((product) => (
//                 <BasketProduct
//                   key={product.id}
//                   product={product}
//                   onQuantityChange={handleQuantityChange}
//                   onDelete={handleDelete}
//                 />
//               ))}
//             </tbody>

//             <tfoot>
//               <tr>
//                 <td
//                   colSpan="7"
//                   style={{
//                     textAlign: "center",
//                     fontWeight: 600,
//                     color: "white",
//                   }}
//                 >
//                   {t("basket_total_label", { defaultValue: "Общая сумма:" })}
//                 </td>

//                 <td
//                   style={{
//                     fontWeight: 600,
//                     color: "white",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "10px",
//                   }}
//                 >
//                   {totalSum.toFixed(2)} ₽
//                 </td>

//                 <td>
//                   <button
//                     style={buttonStyle}
//                     onClick={openPayment}
//                     title={t("basket_pay", { defaultValue: "Оплатить" })}
//                     aria-label={t("basket_pay", { defaultValue: "Оплатить" })}
//                     onMouseEnter={(e) => {
//                       Object.assign(e.target.style, buttonHoverStyle);
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.backgroundColor = "transparent";
//                       e.target.style.transform = "translateY(0)";
//                     }}
//                   >
//                     {t("basket_pay", { defaultValue: "Оплатить" })}
//                   </button>
//                 </td>
//               </tr>
//             </tfoot>
//           </table>

//           <PaymentDrawer
//             isOpen={isPaymentOpen}
//             onClose={closePayment}
//             totalSum={totalSum}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default Basket;