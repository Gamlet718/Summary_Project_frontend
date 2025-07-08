// src/components/Header-Bottom/Header-Bottom.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header-Bottom.css";
import { AuthContext } from "../../contexts/AuthContext";

export const HeaderBottom = ({ onRequireAuth }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState(null);

  const handleProtectedClick = (path) => {
    console.log("HeaderBottom: handleProtectedClick", path, isAuthenticated);
    if (!isAuthenticated) {
      setPendingPath(path);
      onRequireAuth();
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    if (isAuthenticated && pendingPath) {
      console.log("HeaderBottom: navigating to pendingPath", pendingPath);
      navigate(pendingPath);
      setPendingPath(null);
    }
  }, [isAuthenticated, pendingPath, navigate]);

  return (
    <div className="header-bottom">
      <div className="container">
        {/* Социальные ссылки */}
        <ul className="social-list">
          <li>
            <a
              href="https://www.facebook.com/ваша-страница"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ion-icon name="logo-facebook"></ion-icon>
            </a>
          </li>
          <li>
            <a
              href="https://twitter.com/ваш-профиль"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ion-icon name="logo-twitter"></ion-icon>
            </a>
          </li>
          <li>
            <a
              href="https://www.youtube.com/ваш-канал"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ion-icon name="logo-youtube"></ion-icon>
            </a>
          </li>
        </ul>

        {/* Главное навигационное меню */}
        <nav className="navbar" data-navbar>
          <ul className="navbar-list">
            <li>
              <Link to="/home" className="navbar-link">
                Дом
              </Link>
            </li>
            <li>
              <button
                className="navbar-link btn-link"
                onClick={() => handleProtectedClick("/my_profile")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Мой профиль
              </button>
            </li>
            <li>
              <button
                className="navbar-link btn-link"
                onClick={() => handleProtectedClick("/market")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Маркет
              </button>
            </li>
            <li>
              <button
                className="navbar-link btn-link"
                onClick={() => handleProtectedClick("/packages")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Наборы
              </button>
            </li>
            <li>
              <Link to="/gallery" className="navbar-link">
                Галерея
              </Link>
            </li>
            <li>
              <Link to="/contact" className="navbar-link">
                Контакты
              </Link>
            </li>
          </ul>
        </nav>

        {/* Кнопка «Корзина» */}
        <button
          className="btn btn-primary"
          onClick={() => handleProtectedClick("/basket")}
          style={{ cursor: "pointer" }}
        >
          Корзина
        </button>
      </div>
    </div>
  );
};
