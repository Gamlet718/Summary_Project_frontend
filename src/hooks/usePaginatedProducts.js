/**
 * @module hooks/usePaginatedProducts
 * @description Хук для пагинации продуктов.
 */

import { useState, useEffect } from "react";

/**
 * Хук для пагинации.
 * @param {Array} products - Массив продуктов.
 * @param {number} pageSize - Размер страницы.
 * @returns {Object} - paginatedProducts, currentPage, totalPages, setCurrentPage
 */
export function usePaginatedProducts(products, pageSize = 20) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / pageSize);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return { paginatedProducts, currentPage, totalPages, setCurrentPage };
}