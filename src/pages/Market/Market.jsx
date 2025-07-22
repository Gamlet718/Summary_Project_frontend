// Market.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "../../contexts/CartContext";
import ProductForm from "../../components/ProductForm/ProductForm";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { Notification } from "../../components/Notification/Notification";
import "./Market.css";

const Market = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [notification, setNotification] = useState({ status: "", message: "" });
  const [isFormVisible, setIsFormVisible] = useState(false);

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
    removeFromCart(id);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormVisible(true);
  };

  const handleFormSuccess = (savedProduct) => {
    setEditingProduct(null);
    setIsFormVisible(false);

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

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotification({
      status: "success",
      message: "Товар успешно добавлен в корзину",
    });
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsFormVisible(false);
        setEditingProduct(null);
      }
    };
    if (isFormVisible) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isFormVisible]);

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
        style={{ fontSize: 14, minWidth: 220, padding: "10px 16px" }}
      />

      <h2>Управление товарами</h2>

      {/* Кнопка видна только если форма не открыта */}
      {!isFormVisible && (
        <button
          className="btn btn-primary btn-create-product"
          onClick={() => {
            setEditingProduct(null);
            setIsFormVisible(true);
          }}
        >
          Создать товар
        </button>
      )}

      {isFormVisible && (
        <ProductForm
          key={editingProduct?.id ?? "new"}
          product={editingProduct}
          onSuccess={(savedProduct) => {
            handleFormSuccess(savedProduct);
            setIsFormVisible(false);
          }}
          onCancel={() => {
            setIsFormVisible(false);
            setEditingProduct(null);
          }}
          style={{ width: 320 }}
        />
      )}

      <div className="market__grid">
        {products.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAddToBasket={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default Market;