// server/server-routes/products.js
/**
 * CRUD для локальных товаров (книг) — хранение в server/data/products.json
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readProducts, writeProducts } from '../utils/productsStorage.js';

const router = express.Router();

/**
 * Валидация сущности товара.
 * @param {Object} product
 * @returns {string[]} массив ошибок
 */
const validateProduct = (product) => {
  const errors = [];

  if (!product.name || product.name.trim().length === 0) {
    errors.push('Название книги обязательно');
  }
  if (!product.description || product.description.trim().length === 0) {
    errors.push('Описание книги обязательно');
  }
  if (!product.price || isNaN(product.price) || parseFloat(product.price) <= 0) {
    errors.push('Цена должна быть положительным числом');
  }
  if (!product.category || product.category.trim().length === 0) {
    errors.push('Категория книги обязательна');
  }
  if (
    product.quantity === undefined ||
    isNaN(product.quantity) ||
    parseInt(product.quantity) < 0
  ) {
    errors.push('Количество должно быть неотрицательным числом');
  }
  if (!product.ownerId || typeof product.ownerId !== 'string' || product.ownerId.trim() === '') {
    errors.push('ownerId обязателен');
  }

  return errors;
};

// GET /api/products
router.get('/', async (_req, res) => {
  try {
    const products = await readProducts();
    res.json({ success: true, data: products, count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка при получении книг', error: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const products = await readProducts();
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Книга не найдена' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка при получении книги', error: error.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    const errors = validateProduct(productData);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Ошибки валидации', errors });
    }

    const newProduct = {
      id: uuidv4(),
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: parseFloat(productData.price),
      category: productData.category.trim(),
      author: productData.author ? productData.author.trim() : '',
      quantity: parseInt(productData.quantity),
      image: productData.image || '',
      ownerId: productData.ownerId,
      source: productData.source || 'local',
      googleVolumeId: productData.googleVolumeId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const products = await readProducts();
    products.push(newProduct);
    await writeProducts(products);

    res.status(201).json({ success: true, message: 'Книга успешно создана', data: newProduct });
  } catch (error) {
    console.error('Ошибка при создании книги:', error);
    res.status(500).json({ success: false, message: 'Ошибка при создании книги', error: error.message });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    const errors = validateProduct(updateData);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Ошибки валидации', errors });
    }

    const products = await readProducts();
    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Книга не найдена' });
    }

    const updatedProduct = {
      ...products[productIndex],
      name: updateData.name.trim(),
      description: updateData.description.trim(),
      price: parseFloat(updateData.price),
      category: updateData.category.trim(),
      author: updateData.author ? updateData.author.trim() : '',
      quantity: parseInt(updateData.quantity),
      image: updateData.image || '',
      ownerId: updateData.ownerId,
      source: updateData.source || products[productIndex].source || 'local',
      googleVolumeId: updateData.googleVolumeId ?? products[productIndex].googleVolumeId ?? null,
      updatedAt: new Date().toISOString(),
    };

    products[productIndex] = updatedProduct;
    await writeProducts(products);

    res.json({ success: true, message: 'Книга успешно обновлена', data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка при обновлении книги', error: error.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const products = await readProducts();
    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Книга не найдена' });
    }

    const deletedProduct = products[productIndex];
    products.splice(productIndex, 1);
    await writeProducts(products);

    res.json({ success: true, message: 'Книга успешно удалена', data: deletedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка при удалении книги', error: error.message });
  }
});

export default router;