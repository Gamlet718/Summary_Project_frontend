import React from "react";
import { Box, Image } from "@chakra-ui/react";

/**
 * Блок с изображением товара.
 *
 * @param {Object} props
 * @param {string | null | undefined} props.src - URL изображения товара.
 * @param {string} props.alt - Альтернативный текст.
 * @param {string} props.borderColor - Цвет границы снизу.
 * @returns {JSX.Element}
 */
export function ProductImage({ src, alt, borderColor }) {
  const validSrc = src && typeof src === "string" && src.trim() !== "" ? src : null;

  return (
    <Box
      h="180px"
      overflow="hidden"
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Image
        src={validSrc}
        alt={alt}
        objectFit="cover"
        w="100%"
        h="100%"
        fallbackSrc="https://placehold.co/320x180?text=No+Image"
        transition="transform 0.3s ease"
        _hover={{ transform: "scale(1.05)" }}
      />
    </Box>
  );
}