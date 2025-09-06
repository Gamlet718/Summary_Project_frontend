import React from "react";
import { Box, Image } from "@chakra-ui/react";

/**
 * Проксируем картинки Google Books через бэкенд,
 * чтобы избежать таймаутов/CORS.
 */
function maybeProxyGoogleBooks(src) {
  if (!src || typeof src !== "string") return src;
  const isGoogleBooks = src.includes("books.google.com/books/content");
  if (isGoogleBooks) {
    const encoded = encodeURIComponent(src);
    // у тебя уже есть /api/google-books/image-proxy?src=
    return `/api/google-books/image-proxy?src=${encoded}`;
  }
  return src;
}

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
  const normalized = src && typeof src === "string" && src.trim() !== "" ? src.trim() : null;
  const proxied = normalized ? maybeProxyGoogleBooks(normalized) : null;

  return (
    <Box
      h="180px"
      overflow="hidden"
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Image
        src={proxied || undefined}
        alt={alt}
        objectFit="cover"
        w="100%"
        h="100%"
        fallbackSrc="https://placehold.co/320x180?text=No+Image"
        transition="transform 0.3s ease"
        _hover={{ transform: "scale(1.05)" }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </Box>
  );
}