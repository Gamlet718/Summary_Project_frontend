import React from "react";
import "./BuyModal.css";
import { useTranslation } from "react-i18next";

/**
 * @file BuyModal.jsx
 * @description Модальное окно подтверждения покупки набора.
 * Содержит сумму к оплате и кнопки управления (Отмена, Оплатить).
 */

/**
 * @typedef {Object} BuyModalProps
 * @property {number} price Сумма к оплате (в рублях).
 * @property {() => void} onClose Обработчик закрытия модального окна.
 */

/**
 * Модалка покупки набора.
 *
 * - Показывает заголовок, сумму к оплате и две кнопки.
 * - При нажатии "Оплатить" выводит сообщение об успехе и закрывает модалку.
 * - Все UI-строки локализованы i18next с дефолтом на русском.
 *
 * @param {BuyModalProps} props Пропсы компонента.
 * @returns {JSX.Element} Модальное окно покупки.
 */
function BuyModal({ price, onClose }) {
  const { t } = useTranslation();

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="buy-modal">
        <h2>{t("buy_modal_title", { defaultValue: "Покупка набора" })}</h2>

        <div className="buy-modal-price">
          {t("buy_modal_amount_label", { defaultValue: "Сумма к оплате:" })}{" "}
          <b>
            {t("bookset_price", {
              defaultValue: "{{price}} ₽",
              price,
            })}
          </b>
        </div>

        <div className="buy-modal-actions">
          <button onClick={onClose}>
            {t("common_cancel", { defaultValue: "Отмена" })}
          </button>

          <button
            onClick={() => {
              alert(
                t("buy_modal_payment_success", {
                  defaultValue: "Оплата прошла успешно!",
                })
              );
              onClose();
            }}
          >
            {t("common_pay", { defaultValue: "Оплатить" })}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuyModal;