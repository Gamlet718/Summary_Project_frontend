/**
 * @module hooks/useProducts
 * @description Хук для загрузки продуктов с сервера.
 */

import { useState, useCallback } from "react";

/**
 * Хук для загрузки продуктов.
 * @returns {Object} - products, loading, fetchProducts, setProducts
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const { data } = await res.json();
      setProducts(data);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, loading, fetchProducts, setProducts };
}