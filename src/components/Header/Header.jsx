// src/components/Header/Header.jsx
import React, { useState, useContext } from "react";
import "./Header.css";
import { AuthContext } from "../../contexts/AuthContext";
import { Dialog, Button, Portal } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

/**
 * @fileoverview Компонент шапки сайта (Header).
 * Содержит телефон, логотип, кнопки входа/выхода, регистрации и переключатель языка.
 * При попытке «войти», когда пользователь уже авторизован — показывает модальное окно с предложением выйти.
 */

/**
 * Функция-обработчик без аргументов.
 * @callback VoidHandler
 * @returns {void}
 */

/**
 * @typedef {Object} HeaderProps
 * @property {VoidHandler} onSignUpClick - Обработчик нажатия на кнопку «Зарегистрироваться».
 * @property {VoidHandler} onLoginClick - Обработчик нажатия на кнопку «Войти».
 */

/**
 * Пример структуры значения из AuthContext (для понимания, откуда приходят данные).
 * @typedef {Object} AuthContextValue
 * @property {boolean} isAuthenticated - Признак, авторизован ли пользователь.
 * @property {{ email?: string, role?: string } | null} user - Данные текущего пользователя.
 * @property {VoidHandler} logout - Функция выхода из аккаунта.
 */

/**
 * Шапка сайта. defaultValue — на русском (RU — источник).
 * Показывает кнопки в зависимости от статуса авторизации и поддерживает локализацию.
 *
 * @component
 * @param {HeaderProps} props - Пропсы компонента.
 * @returns {JSX.Element} Разметка шапки.
 *
 * @example
 * <Header onSignUpClick={() => setShowSignUp(true)} onLoginClick={() => setShowLogin(true)} />
 */
export default function Header({ onSignUpClick, onLoginClick }) {
  /** @type {AuthContextValue} */
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  /**
   * Состояние видимости модального окна подтверждения выхода.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /**
   * Хук для перевода строк интерфейса.
   * t(key, options) возвращает строку по ключу, а defaultValue задаёт запасной текст.
   */
  const { t } = useTranslation();

  /**
   * Обработка клика по кнопке «Войти/Выйти».
   * Если пользователь уже авторизован — открываем модал «Выйти?».
   * Иначе прокидываем событие выше (например, открыть форму логина).
   * @returns {void}
   */
  const handleLoginClick = () => {
    if (isAuthenticated) setShowLogoutModal(true);
    else onLoginClick();
  };

  /**
   * Закрывает модальное окно выхода.
   * @returns {void}
   */
  const closeLogoutModal = () => setShowLogoutModal(false);

  /**
   * Выполняет выход из аккаунта и закрывает модальное окно.
   * @returns {void}
   */
  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="header">
        <div className="header__phone">📞 +1 (234) 567-89-00</div>
        <div className="header__logo">MyLogo</div>

        <div className="header__actions">
          <button className="header__btn" onClick={handleLoginClick}>
            {isAuthenticated
              ? t("header_logout", { defaultValue: "Выход" })
              : t("header_login", { defaultValue: "Войти" })}
          </button>

          {!isAuthenticated && (
            <button
              className="header__btn header__btn--signup"
              onClick={onSignUpClick}
            >
              {t("header_signup", { defaultValue: "Зарегистрироваться" })}
            </button>
          )}

          <LanguageSwitcher />
        </div>
      </header>

      {/* Logout modal */}
      <Dialog.Root open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <Dialog.Trigger asChild>
          <div />
        </Dialog.Trigger>

        <Portal>
          <Dialog.Backdrop
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)" }}
          />
          <Dialog.Positioner
            onClick={(e) => e.target === e.currentTarget && closeLogoutModal()}
          >
            <Dialog.Content
              style={{
                background: "#fff",
                borderRadius: 6,
                padding: 20,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                maxWidth: 400,
                margin: "auto"
              }}
            >
              <Dialog.Header>
                <Dialog.Title>
                  {t("dialog_title", { defaultValue: "Вы уже вошли в систему" })}
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <p>
                  {t("dialog_loggedInAs", { defaultValue: "Вы уже вошли в систему как" })}{" "}
                  <b>{user?.email}</b>
                  {user?.role && (
                    <>
                      {t("dialog_roleSeparator", { defaultValue: " - " })}
                      <b>{user.role}</b>
                    </>
                  )}
                  . {t("dialog_wantToLogout", { defaultValue: "Вы хотите выйти ?" })}
                </p>
              </Dialog.Body>

              <Dialog.Footer>
                <Button variant="outline" onClick={closeLogoutModal} type="button">
                  {t("common_cancel", { defaultValue: "Отмена" })}
                </Button>
                <Button colorScheme="red" onClick={handleLogout} type="button">
                  {t("common_logout", { defaultValue: "Выйти" })}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}