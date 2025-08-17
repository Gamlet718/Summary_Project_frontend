/**
 * @module hooks/useModalEscClose
 * @description Хук для закрытия модальных окон по клавише Escape.
 */

import { useEffect } from "react";

/**
 * Хук для закрытия модалок по Escape.
 * @param {boolean} isOpen - Открыта ли модалка.
 * @param {Function} onClose - Функция закрытия.
 */
export function useModalEscClose(isOpen, onClose) {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);
}