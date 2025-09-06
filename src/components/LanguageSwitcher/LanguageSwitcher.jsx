// src/components/LanguageSwitcher/LanguageSwitcher.jsx
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Кнопка-переключатель языка (RU/EN) для i18next.
 *
 * @param {{ className?: string }} props
 * @returns {JSX.Element}
 */
export default function LanguageSwitcher({ className = "header__lang-btn" }) {
  const { i18n, t } = useTranslation();

  const getLabel = () => (i18n.language?.startsWith("ru") ? "RU" : "EN");

  const toggleLanguage = () => {
    const next = i18n.language?.startsWith("ru") ? "en" : "ru";
    i18n.changeLanguage(next).catch((e) => {
      console.error("[LanguageSwitcher] changeLanguage failed:", e);
    });
  };

  return (
    <button
      type="button"
      className={className}
      onClick={toggleLanguage}
      aria-label={t("toggleLangTitle")}
      title={t("toggleLangTitle")}
    >
      {getLabel()}
    </button>
  );
}