import React, { useEffect } from "react";

const STATUS_STYLES = {
  success: {
    bgColor: "#d4edda",
    color: "#155724",
    title: "Добавление",
  },
  error: {
    bgColor: "#f8d7da",
    color: "#721c24",
    title: "Удаление",
  },
  info: {
    bgColor: "#cce5ff",
    color: "#004085",
    title: "Редактирование",
  },
  warning: {
    bgColor: "#fff3cd",
    color: "#856404",
    title: "Внимание",
  },
};

export const Notification = ({ status, message, onClose }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose && onClose();
    }, 1500);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const { bgColor, color, title } = STATUS_STYLES[status] || STATUS_STYLES.info;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        backgroundColor: bgColor,
        color,
        padding: "12px 20px",
        borderRadius: 6,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        fontSize: 14,
        fontWeight: "600",
        minWidth: 240,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "default",
        userSelect: "none",
      }}
    >
      <div>
        <strong style={{ marginRight: 8 }}>{title}:</strong>
        <span>{message}</span>
      </div>
      <button
        onClick={onClose}
        aria-label="Закрыть уведомление"
        style={{
          marginLeft: 16,
          background: "transparent",
          border: "none",
          color,
          fontSize: 18,
          fontWeight: "bold",
          cursor: "pointer",
          lineHeight: 1,
          padding: 0,
          userSelect: "none",
        }}
      >
        ×
      </button>
    </div>
  );
};
