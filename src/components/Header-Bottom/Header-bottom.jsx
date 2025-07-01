import React from "react";
import { Link } from "react-router-dom";
import "./Header-Bottom.css";

export const HeaderBottom = () => {
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
              <Link to="/my_profile" className="navbar-link">
                Мой профиль
              </Link>
            </li>
            <li>
              <Link to="/market" className="navbar-link">
                Маркет
              </Link>
            </li>
            <li>
              <Link to="/packages" className="navbar-link">
                Наборы
              </Link>
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

        {/* Кнопка «Book Now» */}
        <Link to="/basket" className="btn btn-primary">
          Корзина
        </Link>
      </div>
    </div>
  );
};
