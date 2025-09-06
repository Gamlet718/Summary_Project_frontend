// server/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import productsRouter from "./server-routes/products.js";
import googleBooksRouter from "./server-routes/googleBooks.js";
import translateRouter from "./server-routes/translate.js"; // NEW: роут перевода

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Логирование
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Роуты
app.use("/api/products", productsRouter);
app.use("/api/google-books", googleBooksRouter);
app.use("/api", translateRouter); // NEW: теперь доступен POST /api/translate

// Базовый маршрут
app.get("/", (_req, res) => {
  res.json({
    message: "Сервер товаров запущен!",
    version: "1.0.0",
    endpoints: {
      "GET /api/products": "Получить все товары",
      "POST /api/products": "Создать новый товар",
      "GET /api/products/:id": "Получить товар по ID",
      "PUT /api/products/:id": "Обновить товар",
      "DELETE /api/products/:id": "Удалить товар",
      "POST /api/google-books/seed":
        "Загрузить 30 книг из Google, сохранить в Firestore и локально",
      "GET /api/google-books/cached": "Получить до 30 книг из Firestore",
      "GET /api/google-books/image-proxy?src=":
        "Прокси для изображений Google Books",
      "POST /api/google-books/normalize-local":
        "Исправить локальные книги: жанры RU + картинки через прокси",
      "POST /api/translate": "Перевести массив текстов EN <-> RU" // NEW
    }
  });
});

// Ошибки
app.use((err, _req, res, _next) => {
  console.error("Ошибка сервера:", err);
  res.status(500).json({
    success: false,
    message: "Внутренняя ошибка сервера",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Что-то пошло не так"
  });
});

// 404
app.use("*", (_req, res) => {
  res.status(404).json({ success: false, message: "Маршрут не найден" });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен по адресу: http://localhost:${PORT}`);
  console.log(`📝 Документация: http://localhost:${PORT}`);
});