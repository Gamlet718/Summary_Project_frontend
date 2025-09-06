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
 * Использует заранее измеренные offset/width.
 */
function getStickyBtnStyle(rect, side) {
  if (!rect) return {};
  const isMobile = window.innerWidth < 600;
  const baseWidth = Math.round(rect.width || 0);
  const widthPx = isMobile ? Math.min(baseWidth, window.innerWidth - 16) : baseWidth;

  const style = {
    position: "fixed",
    top: 0,
    width: `${widthPx}px`,
    minWidth: `${widthPx}px`,
    boxSizing: "border-box",
    zIndex: 100,
    maxWidth: isMobile ? "95vw" : undefined,
  };

  if (side === "left") {
    style.left = `${rect.offset}px`;
  } else {
    style.right = `${rect.offset}px`;
  }

  return style;
}

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

  // --- Sticky-кнопки (отладка включена) ---
  // ВАЖНО: ref вешаем на "слот"-обёртку, а не на саму кнопку
  const createSlot = useStickyButton("left", { debug: true });
  const filterSlot = useStickyButton("right", { debug: true });

  // --- Загрузка продуктов ---
  const { products, loading, fetchProducts, setProducts } = useProducts();

  // --- Фильтрация и пагинация ---
  const filteredProducts = applyBookFilter(products, bookFilter);
  const { paginatedProducts, currentPage, totalPages, setCurrentPage } =
    usePaginatedProducts(filteredProducts, 20);

  // --- Эффекты ---
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Обновление измерений после загрузки/изменения модалок
  useEffect(() => {
    const id = setTimeout(() => {
      createSlot.updateRect(true);
      filterSlot.updateRect(true);
      console.debug("[Market] updateRect after change", {
        loading,
        isFormVisible,
        isFilterOpen,
      });
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [loading, isFormVisible, isFilterOpen]);

  // Закрытие по Esc
  useModalEscClose(isFormVisible || isFilterOpen, () => {
    console.debug("[Market] useModalEscClose -> close all modals");
    setIsFormVisible(false);
    setEditingProduct(null);
    setIsFilterOpen(false);
    setTimeout(() => {
      createSlot.updateRect(true);
      filterSlot.updateRect(true);
    }, 0);
  });

  // --- Обработчики ---
  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setNotification({ status: "error", message: "Книга успешно удалена" });
    removeFromCart(id);
  };

  const openCreateForm = () => {
    console.debug("[Market] openCreateForm");
    // Если была залипшая, разлипим сразу (исправляет сценарий 2)
    createSlot.reset("open create form");
    setEditingProduct(null);
    setIsFormVisible(true);
  };

  const handleEdit = (product) => {
    console.debug("[Market] handleEdit", product);
    createSlot.reset("open edit form");
    setEditingProduct(product);
    setIsFormVisible(true);
  };

  const handleFormSuccess = (savedProduct) => {
    console.debug("[Market] handleFormSuccess", savedProduct);
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
      message: editingProduct ? "Книга успешно изменена" : "Книга успешно добавлена",
    });

    // После закрытия формы — переобмер
    setTimeout(() => {
      createSlot.updateRect(true);
      filterSlot.updateRect(true);
    }, 0);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotification({
      status: "success",
      message: "Книга успешно добавлена в корзину",
    });
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setTimeout(() => {
      createSlot.updateRect(true);
      filterSlot.updateRect(true);
    }, 0);
  };

  const closeNotification = () => setNotification({ status: "", message: "" });

  // Служебные флаги видимости (не убираем из DOM, только прячем кнопку)
  const hideCreateBtn = isFormVisible; // когда открыта форма — прячем кнопку "Создать"
  const hideFilterBtn = isFilterOpen; // когда открыт фильтр — прячем кнопку "Фильтр"

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

      <h2 className="market__title">Управление книгами</h2>

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
        {/* Слот левой кнопки "Создать книгу" — всегда в DOM */}
        <div
          ref={createSlot.btnRef}
          className="sticky-slot-left"
          style={{
            position: "relative",
            // Без авто-отступов слева — слот занимает своё место слева
          }}
          data-debug-slot="create"
        >
          {/* Плейсхолдер сохраняет место, когда кнопка зафиксирована */}
          {createSlot.isSticky && !hideCreateBtn && createSlot.btnRect ? (
            <div
              aria-hidden="true"
              style={{
                width: `${createSlot.btnRect.width}px`,
                height: `${createSlot.btnRect.height}px`,
              }}
            />
          ) : null}

          <button
            className={`btn btn-primary btn-create-product${createSlot.isSticky && !hideCreateBtn ? " sticky" : ""}`}
            onClick={openCreateForm}
            data-debug="create-button"
            // Если скрываем — только визуально
            style={{
              visibility: hideCreateBtn ? "hidden" : "visible",
              pointerEvents: hideCreateBtn ? "none" : "auto",
              ...(createSlot.isSticky && !hideCreateBtn && createSlot.btnRect
                ? getStickyBtnStyle(createSlot.btnRect, "left")
                : {}),
            }}
          >
            Создать книгу
          </button>
        </div>

        {/* Слот правой кнопки "Применить фильтр" — всегда в DOM и прижат вправо */}
        <div
          ref={filterSlot.btnRef}
          className="sticky-slot-right"
          style={{
            position: "relative",
            marginLeft: "auto",
          }}
          data-debug-slot="filter"
        >
          {filterSlot.isSticky && !hideFilterBtn && filterSlot.btnRect ? (
            <div
              aria-hidden="true"
              style={{
                width: `${filterSlot.btnRect.width}px`,
                height: `${filterSlot.btnRect.height}px`,
              }}
            />
          ) : null}

          <button
            className={`btn btn-primary btn-create-product-filter${filterSlot.isSticky && !hideFilterBtn ? " sticky" : ""}`}
            data-debug="filter-button"
            onClick={() => {
              console.debug("[Market] open filter");
              // Если была залипшая, разлипим сразу (исправляет сценарий 1)
              filterSlot.reset("open filter");
              setIsFilterOpen(true);
            }}
            style={{
              visibility: hideFilterBtn ? "hidden" : "visible",
              pointerEvents: hideFilterBtn ? "none" : "auto",
              ...(filterSlot.isSticky && !hideFilterBtn && filterSlot.btnRect
                ? getStickyBtnStyle(filterSlot.btnRect, "right")
                : {}),
            }}
          >
            Применить фильтр
          </button>
        </div>
      </div>

      {/* Модальное окно фильтра — кнопка при этом скрыта визуально, слот остаётся */}
      {isFilterOpen && (
        <BookFilter
          isOpen={isFilterOpen}
          onClose={() => {
            console.debug("[Market] close filter");
            setIsFilterOpen(false);
            setTimeout(() => {
              // после закрытия — переобмер слотов
              createSlot.updateRect(true);
              filterSlot.updateRect(true);
            }, 0);
          }}
          onApply={(filter) => {
            console.debug("[Market] apply filter", filter);
            setBookFilter(filter);
          }}
          initialFilter={bookFilter}
        />
      )}

      {/* Модальное окно для создания/редактирования — кнопка при этом скрыта визуально, слот остаётся */}
      {isFormVisible && (
        <ProductForm
          key={editingProduct?.id ?? "new"}
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            console.debug("[Market] ProductForm onCancel");
            setIsFormVisible(false);
            setEditingProduct(null);
            setTimeout(() => {
              createSlot.updateRect(true);
              filterSlot.updateRect(true);
            }, 0);
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