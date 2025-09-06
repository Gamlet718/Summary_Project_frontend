// src/components/Header-Bottom/Header-Bottom.jsx

/**
 * @file Header-Bottom.jsx
 * @description Компонент нижней части шапки сайта (HeaderBottom), отвечающий за:
 * - отображение социальных ссылок (слева),
 * - центрированное главное меню (по центру),
 * - кнопки действий, зависящие от авторизации (справа, например, корзина),
 * - обработку навигации к защищённым маршрутам: если пользователь не авторизован —
 *   запоминается целевой путь, вызывается внешний onRequireAuth (например, открытие модального окна),
 *   а после успешной авторизации осуществляется переход на ранее запрошенный путь.
 *
 * Компонент использует:
 * - React Router (Link, useNavigate) для навигации,
 * - контекст аутентификации AuthContext,
 * - i18next для интернационализации (useTranslation).
 */

import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header-Bottom.css";
import { AuthContext } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

/**
 * Тип пропсов компонента HeaderBottom.
 * @typedef {Object} HeaderBottomProps
 * @property {() => void} onRequireAuth
 *  Колбэк, вызываемый при попытке перехода на защищённый маршрут неавторизованным пользователем.
 *  Обычно внутри открывается модальное окно логина/регистрации или выполняется редирект на страницу авторизации.
 */

/**
 * Компонент нижней панели шапки сайта: соц.ссылки, навигационное меню и кнопки действий.
 * Включает логику работы с защищёнными маршрутами: сохранение "ожидаемого" пути и навигация
 * к нему после успешной аутентификации.
 *
 * Пример использования:
 * <HeaderBottom onRequireAuth={() => setLoginModalOpen(true)} />
 *
 * @param {HeaderBottomProps} props Пропсы компонента, включающие колбэк onRequireAuth.
 * @returns {JSX.Element} Разметка нижней части шапки.
 */
export const HeaderBottom = ({ onRequireAuth }) => {
  /**
   * Флаг авторизации пользователя, берётся из контекста аутентификации.
   * @type {{ isAuthenticated: boolean }}
   */
  const { isAuthenticated } = useContext(AuthContext);

  /**
   * Хук навигации из react-router. Используется для программного перехода по маршрутам.
   */
  const navigate = useNavigate();

  /**
   * Хранилище "ожидаемого" пути, на который нужно перейти после успешной аутентификации.
   * null означает, что отложенный путь отсутствует.
   * @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]}
   */
  const [pendingPath, setPendingPath] = useState(null);

  /**
   * Хук интернационализации. Функция t возвращает строку перевода.
   * В качестве подстраховки используется defaultValue, для случаев, когда ключ перевода отсутствует.
   */
  const { t } = useTranslation();

  /**
   * Обработчик клика по защищённым пунктам меню/кнопкам.
   * - Если пользователь НЕ авторизован:
   *   1) сохраняет целевой путь в pendingPath,
   *   2) вызывает onRequireAuth (например, для открытия модального окна логина).
   * - Если пользователь авторизован:
   *   выполняется немедленная навигация navigate(path).
   *
   * Важно: используйте абсолютные пути приложения (например, "/market").
   *
   * @param {string} path Абсолютный маршрут приложения, куда требуется перейти.
   * @returns {void}
   */
  const handleProtectedClick = (path) => {
    console.log("HeaderBottom: handleProtectedClick", path, isAuthenticated);
    if (!isAuthenticated) {
      setPendingPath(path);
      onRequireAuth();
    } else {
      navigate(path);
    }
  };

  /**
   * Эффект, отслеживающий успешную авторизацию.
   * Как только isAuthenticated становится true и есть сохранённый pendingPath:
   * - выполняется навигация navigate(pendingPath)
   * - pendingPath очищается (setPendingPath(null)), чтобы избежать повторных переходов
   *
   * Зависимости:
   * - isAuthenticated: срабатывание при изменении статуса авторизации,
   * - pendingPath: выполнение только когда есть отложенный путь,
   * - navigate: функция из react-router (стабильна, но добавлена для полноты зависимости).
   */
  useEffect(() => {
    if (isAuthenticated && pendingPath) {
      console.log("HeaderBottom: navigating to pendingPath", pendingPath);
      navigate(pendingPath);
      setPendingPath(null);
    }
  }, [isAuthenticated, pendingPath, navigate]);

  return (
    <div className="header-bottom">
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Левая область (социальные ссылки) */}
        <div
          className="hb-left"
          style={{ flex: 1, display: "flex", alignItems: "center" }}
        >
          <ul className="social-list">
            <li>
              <a
                href="https://www.facebook.com/your-page"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook"
              >
                <ion-icon name="logo-facebook"></ion-icon>
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/your-profile"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                title="X (Twitter)"
              >
                <ion-icon name="logo-twitter"></ion-icon>
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/@your-channel"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                title="YouTube"
              >
                <ion-icon name="logo-youtube"></ion-icon>
              </a>
            </li>
          </ul>
        </div>

        {/* Центр (главное меню), всегда по центру */}
        <div
          className="hb-center"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <nav className="navbar" data-navbar aria-label="Главная навигация">
            <ul className="navbar-list">
              <li>
                <Link to="/home" className="navbar-link">
                  {t("nav_home", { defaultValue: "Дом" })}
                </Link>
              </li>

              {isAuthenticated && (
                <li>
                  {/* Используем button, чтобы исключить предустановленную навигацию
                      и централизовать поведение через handleProtectedClick */}
                  <button
                    className="navbar-link btn-link"
                    onClick={() => handleProtectedClick("/my_profile")}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    aria-label={t("nav_profile", { defaultValue: "Мой профиль" })}
                  >
                    {t("nav_profile", { defaultValue: "Мой профиль" })}
                  </button>
                </li>
              )}

              {isAuthenticated && (
                <li>
                  <button
                    className="navbar-link btn-link"
                    onClick={() => handleProtectedClick("/market")}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    aria-label={t("nav_market", { defaultValue: "Маркет" })}
                  >
                    {t("nav_market", { defaultValue: "Маркет" })}
                  </button>
                </li>
              )}

              {isAuthenticated && (
                <li>
                  <button
                    className="navbar-link btn-link"
                    onClick={() => handleProtectedClick("/packages")}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    aria-label={t("nav_packages", { defaultValue: "Наборы" })}
                  >
                    {t("nav_packages", { defaultValue: "Наборы" })}
                  </button>
                </li>
              )}

              <li>
                <Link to="/gallery" className="navbar-link">
                  {t("nav_gallery", { defaultValue: "Галерея" })}
                </Link>
              </li>

              <li>
                <Link to="/contact" className="navbar-link">
                  {t("nav_contacts", { defaultValue: "Контакты" })}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Правая область (корзина или пустое место) */}
        <div
          className="hb-right"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {isAuthenticated && (
            <button
              className="btn btn-primary"
              onClick={() => handleProtectedClick("/basket")}
              style={{ cursor: "pointer" }}
              aria-label={t("nav_cart", { defaultValue: "Корзина" })}
              title={t("nav_cart", { defaultValue: "Корзина" })}
            >
              {t("nav_cart", { defaultValue: "Корзина" })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};