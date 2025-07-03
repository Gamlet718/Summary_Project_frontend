import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        const newQuantity = Math.min(
          (existing.selectedQuantity || 1) + 1,
          product.quantity || 99
        );
        return prev.map((p) =>
          p.id === product.id ? { ...p, selectedQuantity: newQuantity } : p
        );
      } else {
        return [...prev, { ...product, selectedQuantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, selectedQuantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    setCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
