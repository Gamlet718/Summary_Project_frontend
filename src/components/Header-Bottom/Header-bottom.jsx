import React from "react";
import "./Header-Bottom.css"

export const HeaderBottom = () => {
  return (
    <div className="header-bottom">
      <div className="container">
        <ul className="social-list">
          <li>
            <a href="#" className="social-link">
              <ion-icon name="logo-facebook"></ion-icon>
            </a>
          </li>

          <li>
            <a href="#" className="social-link">
              <ion-icon name="logo-twitter"></ion-icon>
            </a>
          </li>

          <li>
            <a href="#" className="social-link">
              <ion-icon name="logo-youtube"></ion-icon>
            </a>
          </li>
        </ul>

        <nav className="navbar" data-navbar>

          <ul className="navbar-list">
            <li>
              <a href="#home" className="navbar-link" data-nav-link>
                home
              </a>
            </li>

            <li>
              <a href="#" className="navbar-link" data-nav-link>
                about us
              </a>
            </li>

            <li>
              <a href="#destination" className="navbar-link" data-nav-link>
                destination
              </a>
            </li>

            <li>
              <a href="#package" className="navbar-link" data-nav-link>
                packages
              </a>
            </li>

            <li>
              <a href="#gallery" className="navbar-link" data-nav-link>
                gallery
              </a>
            </li>

            <li>
              <a href="#contact" className="navbar-link" data-nav-link>
                contact us
              </a>
            </li>
          </ul>
        </nav>

        <button className="btn btn-primary">Book Now</button>
      </div>
    </div>
  );
};
