import React from "react";
import "./BuyModal.css";

function BuyModal({ price, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="buy-modal">
        <h2>Покупка набора</h2>
        <div className="buy-modal-price">Сумма к оплате: <b>{price} ₽</b></div>
        <div className="buy-modal-actions">
          <button onClick={onClose}>Отмена</button>
          <button onClick={() => { alert("Оплата прошла успешно!"); onClose(); }}>Оплатить</button>
        </div>
      </div>
    </div>
  );
}

export default BuyModal;