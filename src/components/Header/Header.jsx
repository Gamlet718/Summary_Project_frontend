import React, { useState } from "react";
import "./Header.css";

export default function Header({ onSignUpClick }) {
  const [lang, setLang] = useState("EN");

  const toggleLang = () => {
    setLang((prev) => (prev === "EN" ? "RU" : "EN"));
  };

  return (
    <header className="header">
      <div className="header__phone">📞 +1 (234) 567-89-00</div>
      <div className="header__logo">MyLogo</div>
      <div className="header__actions">
        <button className="header__btn">Log in</button>
        <button
          className="header__btn header__btn--signup"
          onClick={onSignUpClick}
        >
          Sign Up
        </button>
        <button className="header__lang-btn" onClick={toggleLang}>
          {lang}
        </button>
      </div>
    </header>
  );
}
