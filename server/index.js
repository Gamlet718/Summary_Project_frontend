import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import productsRouter from './server-routes/products.js'; // Обрати внимание на расширение .js

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Маршруты
app.use('/api/products', productsRouter);

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'Сервер товаров запущен!',
    version: '1.0.0',
    endpoints: {
      'GET /api/products': 'Получить все товары',
      'POST /api/products': 'Создать новый товар',
      'GET /api/products/:id': 'Получить товар по ID',
      'PUT /api/products/:id': 'Обновить товар',
      'DELETE /api/products/:id': 'Удалить товар'
    }
  });
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
  });
});

// Обработчик 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен по адресу: http://localhost:${PORT}`);
  console.log(`📝 Документация: http://localhost:${PORT}`);
});
