// src/components/Header/Header.jsx
import React, { useState, useContext } from "react";
import "./Header.css";
import { AuthContext } from "../../contexts/AuthContext";
import {
  Dialog,
  Button,
  Portal,
} from "@chakra-ui/react";

export default function Header({ onSignUpClick, onLoginClick }) {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLoginClick = () => {
    if (isAuthenticated) {
      setShowLogoutModal(true);
    } else {
      onLoginClick();
    }
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

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
            {isAuthenticated ? "Log out" : "Log in"}
          </button>
          {!isAuthenticated && (
            <button
              className="header__btn header__btn--signup"
              onClick={onSignUpClick}
            >
              Sign Up
            </button>
          )}
          <button
            className="header__lang-btn"
            onClick={() => {
              // Ваш код переключения языка
            }}
          >
            EN
          </button>
        </div>
      </header>

      {/* Модальное окно выхода */}
      <Dialog.Root open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <Dialog.Trigger asChild>
          <div />
        </Dialog.Trigger>

        <Portal>
          <Dialog.Backdrop
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)" }}
          />
          <Dialog.Positioner onClick={(e) => e.target === e.currentTarget && closeLogoutModal()}>
            <Dialog.Content
              style={{
                background: "#fff",
                borderRadius: 6,
                padding: 20,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                maxWidth: 400,
                margin: "auto",
              }}
            >
              <Dialog.Header>
                <Dialog.Title>Вы уже в системе</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <p>
                  Вы вошли как <b>{user?.email}</b>
                  {user?.role && (
                    <> - <b>{user.role}</b></>
                  )}
                  . Хотите выйти?
                </p>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={closeLogoutModal} type="button">
                  Отмена
                </Button>
                <Button colorScheme="red" onClick={handleLogout} type="button">
                  Выйти
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}