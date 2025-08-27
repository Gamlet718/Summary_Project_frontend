import React from "react";
import { HStack, Badge } from "@chakra-ui/react";

/**
 * Бейджи с автором и категорией.
 *
 * @param {Object} props
 * @param {string} props.author - Автор (бренд/издатель и т.п.).
 * @param {string} props.category - Категория товара.
 * @returns {JSX.Element}
 */
export function ProductBadges({ author, category }) {
  return (
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
        title={author}
      >
        {author}
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
        title={category}
      >
        {category}
      </Badge>
    </HStack>
  );
}
