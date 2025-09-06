// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import "./i18n"; // Глобальная инициализация i18next до монтирования приложения

/**
 * Точка входа приложения.
 * - Chakra UI
 * - React Router
 * - i18next
 */
createRoot(document.getElementById("root")).render(
  <ChakraProvider value={defaultSystem}>
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </ChakraProvider>
);