/**
 * @file Market.jsx
 * @module pages/Market/Market
 * @description Страница управления книгами (маркет).
 */

import React, { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";
import ProductForm from "../../components/ProductForm/ProductForm";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { Notification } from "../../components/Notification/Notification";
import BookFilter from "../../components/BookFilter/BookFilter";
import { useAuth } from "../../contexts/AuthContext";
import Pagination from "../../components/ui/Pagination";
import { applyBookFilter } from "../../utils/applyBookFilter";
import { useStickyButton } from "../../hooks/useStickyButton";
import { usePaginatedProducts } from "../../hooks/usePaginatedProducts";
import { useProducts } from "../../hooks/useProducts";
import { useModalEscClose } from "../../hooks/useModalEscClose";
import "./Market.css";

/**
 * Возвращает стили для sticky-кнопки.
 * @param {Object} rect - Положение и размеры кнопки.
 * @param {string} side - Сторона ("left" или "right").
 * @returns {Object} - Стили.
 */
function getStickyBtnStyle(rect, side) {
  if (!rect) return {};
  const isMobile = window.innerWidth < 600;
  return {
    position: "fixed",
    top: 0,
    [side]: side === "left" ? `${rect.left}px` : `${rect.right}px`,
    width: isMobile
      ? Math.min(rect.width, window.innerWidth - 16) + "px"
      : `${rect.width}px`,
    minWidth: isMobile
      ? Math.min(rect.width, window.innerWidth - 16) + "px"
      : `${rect.width}px`,
    boxSizing: "border-box",
    zIndex: 100,
    maxWidth: isMobile ? "95vw" : undefined,
  };
}

/**
 * Компонент страницы маркет.
 * @returns {JSX.Element}
 */
const Market = () => {
  // --- Состояния ---
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

  // --- Контексты ---
  const { addToCart, removeFromCart, setCart } = useCart();
  const { user } = useAuth();
  const canCreateBook = user && (user.role === "admin" || user.role === "seller");

  // --- Sticky-кнопки ---
  const createBtnSticky = useStickyButton("left");
  const filterBtnSticky = useStickyButton("right");

  // --- Загрузка продуктов ---
  const { products, loading, fetchProducts, setProducts } = useProducts();

  // --- Фильтрация и пагинация ---
  const filteredProducts = applyBookFilter(products, bookFilter);
  const {
    paginatedProducts,
    currentPage,
    totalPages,
    setCurrentPage,
  } = usePaginatedProducts(filteredProducts, 20);

  // --- Эффекты ---
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        createBtnSticky.updateRect();
        filterBtnSticky.updateRect();
      }, 0);
    }
    // eslint-disable-next-line
  }, [loading, isFormVisible, isFilterOpen]);

  useModalEscClose(isFormVisible || isFilterOpen, () => {
    setIsFormVisible(false);
    setEditingProduct(null);
    setIsFilterOpen(false);
  });

  // --- Обработчики ---
  /**
   * Удаляет книгу.
   * @param {string|number} id - ID книги.
   */
  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setNotification({ status: "error", message: "Книга успешно удалена" });
    removeFromCart(id);
  };

  /**
   * Открывает форму создания книги.
   */
  const openCreateForm = () => {
    setEditingProduct(null);
    setIsFormVisible(true);
  };

  /**
   * Открывает форму редактирования книги.
   * @param {Object} product - Книга.
   */
  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormVisible(true);
  };

  /**
   * Обработка успешного сохранения книги.
   * @param {Object} savedProduct - Сохраненная книга.
   */
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

  /**
   * Добавляет книгу в корзину.
   * @param {Object} product - Книга.
   */
  const handleAddToCart = (product) => {
    addToCart(product);
    setNotification({
      status: "success",
      message: "Книга успешно добавлена в корзину",
    });
  };

  /**
   * Обработка смены страницы.
   * @param {number} page - Номер страницы.
   */
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }
    setCurrentPage(page);
  };

  /**
   * Закрывает уведомление.
   */
  const closeNotification = () => setNotification({ status: "", message: "" });

  // --- Рендер ---
  if (loading) {
    return <div className="centered">Загрузка…</div>;
  }

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
            ref={createBtnSticky.btnRef}
            className={`btn btn-primary btn-create-product${createBtnSticky.isSticky ? " sticky" : ""}`}
            onClick={openCreateForm}
            disabled={!canCreateBook}
            title={!canCreateBook ? "Только продавец или админ может создавать книги" : ""}
            style={
              createBtnSticky.isSticky && createBtnSticky.btnRect
                ? getStickyBtnStyle(createBtnSticky.btnRect, "left")
                : {}
            }
          >
            Создать книгу
          </button>
        )}

        {/* Кнопка "Применить фильтр" */}
        {!isFilterOpen && (
          <button
            ref={filterBtnSticky.btnRef}
            className={`btn btn-primary btn-create-product-filter${filterBtnSticky.isSticky ? " sticky" : ""}`}
            style={
              filterBtnSticky.isSticky && filterBtnSticky.btnRect
                ? getStickyBtnStyle(filterBtnSticky.btnRect, "right")
                : { marginLeft: "auto" }
            }
            onClick={() => setIsFilterOpen(true)}
          >
            Применить фильтр
          </button>
        )}

        {/* Форма фильтра */}
        {isFilterOpen && (
          <BookFilter
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            onApply={(filter) => setBookFilter(filter)}
            initialFilter={bookFilter}
          />
        )}
      </div>

      {/* Модальное окно для создания/редактирования */}
      {isFormVisible && (
        <ProductForm
          key={editingProduct?.id ?? "new"}
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsFormVisible(false);
            setEditingProduct(null);
          }}
          modal
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
      {filteredProducts.length >= 20 && (
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