// src/components/Notification.jsx
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../responsive.css";

const STATUS_COLORS = {
  success: { bgColor: "#d4edda", color: "#155724" },
  error: { bgColor: "#f8d7da", color: "#721c24" },
  info: { bgColor: "#cce5ff", color: "#004085" },
  warning: { bgColor: "#fff3cd", color: "#856404" },
};

export const Notification = ({ status, message, onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose && onClose();
    }, 1500);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const { bgColor, color } = STATUS_COLORS[status] || STATUS_COLORS.info;

  const titleMap = {
    success: t("notification_title_success", { defaultValue: "Добавление" }),
    error: t("notification_title_error", { defaultValue: "Удаление" }),
    info: t("notification_title_info", { defaultValue: "Редактирование" }),
    warning: t("notification_title_warning", { defaultValue: "Внимание" }),
  };
  const title = titleMap[status] || titleMap.info;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="notification"
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
        aria-label={t("notification_close_aria", { defaultValue: "Закрыть уведомление" })}
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