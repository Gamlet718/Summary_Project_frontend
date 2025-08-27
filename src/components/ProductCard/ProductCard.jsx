import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Heading, HStack, VStack, Stack } from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";
import { ProductImage } from "./ProductImage";
import { ProductBadges } from "./ProductBadges";
import { ProductActions } from "./ProductActions";
import { useProductPermissions } from "../../hooks/useProductPermissions";

/**
 * Карточка товара.
 *
 * Отображает изображение, бейджи (автор и категория),
 * название, описание, цену, количество и набор действий (в корзину, редактирование, удаление).
 * Кнопки "Ред." и "Удал." доступны только админу и продавцу-владельцу товара.
 *
 * @param {Object} props
 * @param {import("./types").Product} props.product - Товар для отображения.
 * @param {(productId: string) => void} props.onDelete - Колбэк при успешном удалении товара.
 * @param {(product: import("./types").Product) => void} props.onEdit - Колбэк для начала редактирования товара.
 * @param {(product: import("./types").Product) => void} [props.onAddToBasket] - Колбэк добавления товара в корзину.
 * @returns {JSX.Element}
 */
export function ProductCard({ product, onDelete, onEdit, onAddToBasket }) {
  const [showEditMessage, setShowEditMessage] = useState(false);
  const { user } = useAuth();

  const { canManage } = useProductPermissions(user, product);

  // Цвета/стили компонента
  const bg = "white";
  const borderColor = "gray.200";
  const textColor = "gray.600";

  /**
   * Обработчик удаления товара.
   * Выполняет запрос DELETE и уведомляет родителя через onDelete.
   *
   * @returns {Promise<void>}
   */
  const handleDelete = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const { success, message } = await res.json();

      if (success) {
        onDelete(product.id);
      } else {
        alert("Ошибка: " + message);
      }
    } catch (err) {
      alert("Ошибка: " + (err?.message || "Неизвестная ошибка"));
    }
  }, [onDelete, product.id]);

  /**
   * Обработчик начала редактирования.
   * Показывает краткий инфо-баннер и передает товар наверх через onEdit.
   */
  const handleEditClick = useCallback(() => {
    setShowEditMessage(true);
    onEdit(product);
  }, [onEdit, product]);

  /**
   * Обработчик "В корзину".
   * Безопасно вызывает переданный проп.
   */
  const handleAddToBasketClick = useCallback(() => {
    if (onAddToBasket) {
      onAddToBasket(product);
    }
  }, [onAddToBasket, product]);

  // Скрываем всплывающее сообщение через 1 сек.
  useEffect(() => {
    if (showEditMessage) {
      const timer = setTimeout(() => setShowEditMessage(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showEditMessage]);

  // Заглушка-эффект на изменение пользователя/владельца (оставлено для возможной логики)
  useEffect(() => {
    if (user) {
      // Здесь можно выполнить трекинг/логирование или обновление данных пользователя и владельца
    }
  }, [user, product.ownerId]);

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      boxShadow="md"
      display="flex"
      flexDirection="column"
      transition="transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease"
      _hover={{ transform: "scale(1.015)", boxShadow: "lg" }}
      position="relative"
      minWidth="290px"
      maxWidth="320px"
      width="100%"
      flex="1 1 220px"
    >
      {showEditMessage && (
        <Box
          position="absolute"
          top="8px"
          right="8px"
          bg="gray.700"
          color="white"
          px={3}
          py={1}
          borderRadius="md"
          fontSize="sm"
          opacity={0.8}
          zIndex={10}
          boxShadow="md"
          userSelect="none"
          transition="opacity 0.3s ease"
        >
          Можете переходить к редактированию
        </Box>
      )}

      <ProductImage
        src={product.image}
        alt={product.name}
        borderColor={borderColor}
      />

      <VStack align="start" spacing={2} p={4} flex="1" minH="220px" w="full">
        <ProductBadges author={product.author} category={product.category} />

        <Heading
          size="md"
          noOfLines={1}
          title={product.name}
          wordBreak="break-word"
          w="full"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {product.name}
        </Heading>

        <Text
          fontSize="sm"
          color={textColor}
          noOfLines={2}
          title={product.description}
          wordBreak="break-word"
          w="full"
          overflow="hidden"
          textOverflow="ellipsis"
          display="-webkit-box"
          style={{ WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
        >
          {product.description}
        </Text>

        {typeof product.quantity !== "undefined" && (
          <Text
            fontSize="sm"
            color={textColor}
            fontWeight="medium"
            w="full"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            mt={1}
          >
            Количество: {product.quantity}
          </Text>
        )}

        <HStack justifyContent="space-between" w="full" mt="auto" pt={2}>
          <Text
            fontWeight="bold"
            fontSize="lg"
            whiteSpace="nowrap"
            title={`${product.price} ₽`}
          >
            {product.price} ₽
          </Text>

          <Stack direction="row" spacing={3}>
            <ProductActions
              onAddToBasket={handleAddToBasketClick}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              canManage={canManage}
            />
          </Stack>
        </HStack>
      </VStack>
    </Box>
  );
}