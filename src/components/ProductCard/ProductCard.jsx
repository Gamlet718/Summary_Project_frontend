// ProductCard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Image,
  Badge,
  Text,
  Heading,
  Button,
  HStack,
  VStack,
  Stack,
} from "@chakra-ui/react";
import { FaTrash, FaEdit, FaShoppingCart } from "react-icons/fa";

export function ProductCard({ product, onDelete, onEdit, onAddToBasket }) {
  const [showEditMessage, setShowEditMessage] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      const { success, message } = await res.json();
      if (success) {
        onDelete(product.id);
      } else {
        alert("Ошибка: " + message);
      }
    } catch (err) {
      alert("Ошибка: " + err.message);
    }
  };

  const handleEditClick = () => {
    setShowEditMessage(true);
    onEdit(product);
  };

  const handleAddToBasketClick = () => {
    if (onAddToBasket) {
      onAddToBasket(product);
    }
  };

  useEffect(() => {
    if (showEditMessage) {
      const timer = setTimeout(() => setShowEditMessage(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showEditMessage]);

  const bg = "white";
  const borderColor = "gray.200";
  const textColor = "gray.600";

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      boxShadow="md"
      maxW="100%"
      minW="320px"
      w="full"
      display="flex"
      flexDirection="column"
      transition="transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease"
      _hover={{ transform: "scale(1.015)", boxShadow: "lg" }}
      position="relative"
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

      <Box
        h="180px"
        overflow="hidden"
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Image
          src={
            product.image && product.image.trim() !== "" ? product.image : null
          }
          alt={product.name}
          objectFit="cover"
          w="100%"
          h="100%"
          fallbackSrc="https://placehold.co/320x180?text=No+Image"
          transition="transform 0.3s ease"
          _hover={{ transform: "scale(1.05)" }}
        />
      </Box>

      <VStack align="start" spacing={2} p={4} flex="1" minH="220px" w="full">
        <HStack spacing={2} flexWrap="wrap" maxW="full" w="full">
          <Badge
            colorScheme="purple"
            fontWeight="semibold"
            fontSize="0.75rem"
            px={2}
            py={1}
            borderRadius="md"
            noOfLines={1}
            maxW="50%"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {product.author}
          </Badge>
          <Badge
            colorScheme="green"
            fontWeight="semibold"
            fontSize="0.75rem"
            px={2}
            py={1}
            borderRadius="md"
            noOfLines={1}
            maxW="50%"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {product.category}
          </Badge>
        </HStack>

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
          style={{
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
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
            <Button
              size="sm"
              colorScheme="teal"
              leftIcon={<FaShoppingCart />}
              borderRadius="full"
              boxShadow="md"
              _hover={{ bg: "#e1ffde", boxShadow: "xl" }}
              transition="all 0.3s ease"
              cursor="pointer"
              onClick={handleAddToBasketClick}
            >
              В корзину
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<FaEdit />}
              onClick={handleEditClick}
              borderRadius="full"
              boxShadow="md"
              _hover={{ bg: "#dedfff", boxShadow: "xl" }}
              transition="all 0.3s ease"
              cursor="pointer"
            >
              Ред.
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<FaTrash />}
              onClick={handleDelete}
              borderRadius="full"
              boxShadow="md"
              _hover={{ bg: "#ffdede", boxShadow: "xl" }}
              transition="all 0.3s ease"
              cursor="pointer"
            >
              Удал.
            </Button>
          </Stack>
        </HStack>
      </VStack>
    </Box>
  );
}