import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "../contexts/CartContext";
import ProductForm from "../components/ProductForm/ProductForm";
import { ProductCard } from "../components/ProductCard/ProductCard";
import { Notification } from "../components/Notification/Notification";

const Market = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [notification, setNotification] = useState({ status: "", message: "" });

  const { addToCart, removeFromCart, setCart } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const { data } = await res.json();
      setProducts(data);
    } catch (err) {
      setNotification({
        status: "error",
        message: "Не удалось загрузить товары: " + err.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setNotification({ status: "error", message: "Товар успешно удалён" });

    // Удаляем товар из корзины через removeFromCart
    removeFromCart(id);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleFormSuccess = (savedProduct) => {
    setEditingProduct(null);

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === savedProduct.id);
      return exists
        ? prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
        : [savedProduct, ...prev];
    });

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === savedProduct.id
          ? { ...savedProduct, selectedQuantity: item.selectedQuantity || 1 }
          : item
      )
    );

    setNotification({
      status: editingProduct ? "info" : "success",
      message: editingProduct
        ? "Товар успешно изменен"
        : "Товар успешно добавлен",
    });
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return <div className="centered">Загрузка…</div>;
  }

  const closeNotification = () => setNotification({ status: "", message: "" });

  return (
    <div className="market">
      <Notification
        status={notification.status}
        message={notification.message}
        onClose={closeNotification}
        style={{
          fontSize: 14,
          minWidth: 220,
          padding: "10px 16px",
        }}
      />

      <h2>Управление товарами</h2>

      <div className="market__form">
        <ProductForm
          key={editingProduct?.id ?? "new"}
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingProduct(null)}
          style={{
            width: 300,
          }}
        />
      </div>

      <div
        className="market__grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
          padding: "0 16px 8px 16px",
          boxSizing: "border-box",
        }}
      >
        {products.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAddToBasket={addToCart} // Добавление в корзину
          />
        ))}
      </div>
    </div>
  );
};

export default Market;
