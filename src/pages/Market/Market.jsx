import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "../../contexts/CartContext";
import ProductForm from "../../components/ProductForm/ProductForm";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { Notification } from "../../components/Notification/Notification";
import BookFilter from "../../components/BookFilter/BookFilter";
import { useAuth } from "../../contexts/AuthContext";
import Pagination from "../../components/ui/Pagination";
import "./Market.css";

const applyBookFilter = (books, filter) => {
  let filtered = [...books];
  if (filter.name) {
    filtered = filtered.filter((b) =>
      b.name.toLowerCase().includes(filter.name.toLowerCase())
    );
  }
  if (filter.categories && filter.categories.length > 0) {
    filtered = filtered.filter((b) => filter.categories.includes(b.category));
  }
  if (filter.author) {
    filtered = filtered.filter((b) =>
      (b.author || "").toLowerCase().includes(filter.author.toLowerCase())
    );
  }
  if (filter.priceFrom) {
    filtered = filtered.filter((b) => Number(b.price) >= Number(filter.priceFrom));
  }
  if (filter.priceTo) {
    filtered = filtered.filter((b) => Number(b.price) <= Number(filter.priceTo));
  }
  if (filter.sort === "asc") {
    filtered = filtered.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (filter.sort === "desc") {
    filtered = filtered.sort((a, b) => Number(b.price) - Number(a.price));
  }
  return filtered;
};

const Market = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [notification, setNotification] = useState({ status: "", message: "" });
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Фильтр
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [bookFilter, setBookFilter] = useState({
    name: "",
    categories: [],
    author: "",
    priceFrom: "",
    priceTo: "",
    sort: "asc",
  });

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { addToCart, removeFromCart, setCart } = useCart();
  const { user } = useAuth();
  const canCreateBook = user && (user.role === "admin" || user.role === "seller");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const { data } = await res.json();
      setProducts(data);
    } catch (err) {
      setNotification({
        status: "error",
        message: "Не удалось загрузить книги: " + err.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setNotification({ status: "error", message: "Книга успешно удалена" });
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
        ? "Книга успешно изменена"
        : "Книга успешно добавлена",
    });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotification({
      status: "success",
      message: "Книга успешно добавлена в корзину",
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
        setIsFilterOpen(false);
      }
    };
    if (isFormVisible || isFilterOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isFormVisible, isFilterOpen]);

  // --- ОТЛАДКА ---
  const filteredProducts = applyBookFilter(products, bookFilter);
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Сброс страницы если фильтр уменьшил количество страниц
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }
    setCurrentPage(page);
  };

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

      <h2>Управление книгами</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 16,
          position: "relative",
          gap: 12,
        }}
      >
        {/* Кнопка "Создать книгу" */}
        {!isFormVisible && (
          <button
            className="btn btn-primary btn-create-product"
            onClick={() => {
              setEditingProduct(null);
              setIsFormVisible(true);
            }}
            disabled={!canCreateBook}
            title={!canCreateBook ? "Только продавец или админ может создавать книги" : ""}
            style={!canCreateBook ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            Создать книгу
          </button>
        )}

        {/* Кнопка "Применить фильтр" */}
        {!isFilterOpen && (
          <button
            className="btn btn-primary btn-create-product"
            style={{ marginLeft: "auto" }}
            onClick={() => setIsFilterOpen(true)}
          >
            Применить фильтр
          </button>
        )}

        {/* Форма фильтра */}
        {isFilterOpen && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              position: "absolute",
              top: "100%",
              right: 0,
              zIndex: 100,
            }}
          >
            <BookFilter
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onApply={(filter) => setBookFilter(filter)}
              initialFilter={bookFilter}
            />
          </div>
        )}
      </div>

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
        {paginatedProducts.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAddToBasket={handleAddToCart}
          />
        ))}
      </div>

      {/* Пагинация появляется, если карточек 20 и более */}
      {filteredProducts.length >= pageSize && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Market;