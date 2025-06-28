import React, { useEffect, useState, useCallback } from "react";
import ProductForm from "../components/ProductForm/ProductForm";
import { ProductCard } from "../components/ProductCard/ProductCard";
import { Notification } from "../components/Notification/Notification";

const Destination = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  // Состояние для уведомлений
  const [notification, setNotification] = useState({ status: "", message: "" });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const { data } = await res.json();
      setProducts(data);
    } catch (err) {
      // Можно добавить обработку ошибок, если нужно
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setNotification({ status: "error", message: "Товар удален" }); // красный
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

    setNotification({
      status: editingProduct ? "info" : "success", // синий для редактирования, зеленый для добавления
      message: editingProduct ? "Товар изменен" : "Товар добавлен",
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
    <div className="destination">
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

      <div className="destination__form">
        <ProductForm
          key={editingProduct?.id ?? "new"}
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingProduct(null)}
        />
      </div>

      <div className="destination__grid">
        {products.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default Destination;
