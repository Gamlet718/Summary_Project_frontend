import React from "react";
import { Button } from "@chakra-ui/react";
import { FaTrash, FaEdit, FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";

/**
 * Кнопки действий для товара.
 * - "В корзину" отображается всегда;
 * - "Ред." и "Удал." доступны при canManage = true.
 *
 * @param {Object} props
 * @param {() => void} props.onAddToBasket - Обработчик добавления в корзину.
 * @param {() => void} props.onEdit - Обработчик начала редактирования.
 * @param {() => void | Promise<void>} props.onDelete - Обработчик удаления.
 * @param {boolean} props.canManage - Признак доступности управления (ред/удал).
 * @returns {JSX.Element}
 */
export function ProductActions({ onAddToBasket, onEdit, onDelete, canManage }) {
  const { t } = useTranslation();

  return (
    <>
      <Button
        size="sm"
        colorScheme="teal"
        leftIcon={<FaShoppingCart />}
        borderRadius="full"
        boxShadow="md"
        _hover={{ bg: "#e1ffde", boxShadow: "xl" }}
        transition="all 0.3s ease"
        cursor="pointer"
        onClick={onAddToBasket}
      >
        {t("В КОРЗ")}
      </Button>

      {canManage && (
        <>
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<FaEdit />}
            onClick={onEdit}
            borderRadius="full"
            boxShadow="md"
            _hover={{ bg: "#dedfff", boxShadow: "xl" }}
            transition="all 0.3s ease"
            cursor="pointer"
          >
            {t("РЕД")}
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            leftIcon={<FaTrash />}
            onClick={onDelete}
            borderRadius="full"
            boxShadow="md"
            _hover={{ bg: "#ffdede", boxShadow: "xl" }}
            transition="all 0.3s ease"
            cursor="pointer"
          >
            {t("УДАЛ")}
          </Button>
        </>
      )}
    </>
  );
}