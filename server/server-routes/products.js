const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/products.json');

// Утилита для чтения данных
const readProducts = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Если файл не существует, создаем пустой массив
    if (error.code === 'ENOENT') {
      await writeProducts([]);
      return [];
    }
    throw error;
  }
};

// Утилита для записи данных
const writeProducts = async (products) => {
  // Создаем директорию если не существует
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
};

// Валидация данных товара
const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim().length === 0) {
    errors.push('Название товара обязательно');
  }
  
  if (!product.description || product.description.trim().length === 0) {
    errors.push('Описание товара обязательно');
  }
  
  if (!product.price || isNaN(product.price) || parseFloat(product.price) <= 0) {
    errors.push('Цена должна быть положительным числом');
  }
  
  if (!product.category || product.category.trim().length === 0) {
    errors.push('Категория товара обязательна');
  }
  
  if (product.quantity === undefined || isNaN(product.quantity) || parseInt(product.quantity) < 0) {
    errors.push('Количество должно быть неотрицательным числом');
  }
  
  return errors;
};

// GET /api/products - Получить все товары
router.get('/', async (req, res) => {
  try {
    const products = await readProducts();
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товаров',
      error: error.message
    });
  }
});

// GET /api/products/:id - Получить товар по ID
router.get('/:id', async (req, res) => {
  try {
    const products = await readProducts();
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товара',
      error: error.message
    });
  }
});

// POST /api/products - Создать новый товар
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    
    // Валидация
    const errors = validateProduct(productData);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ошибки валидации',
        errors: errors
      });
    }
    
    // Создаем новый товар
    const newProduct = {
      id: uuidv4(),
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: parseFloat(productData.price),
      category: productData.category.trim(),
      brand: productData.brand ? productData.brand.trim() : '',
      quantity: parseInt(productData.quantity),
      image: productData.image || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Читаем существующие товары и добавляем новый
    const products = await readProducts();
    products.push(newProduct);
    
    // Записываем обновленный список
    await writeProducts(products);
    
    console.log(`✅ Создан новый товар: ${newProduct.name} (ID: ${newProduct.id})`);
    
    res.status(201).json({
      success: true,
      message: 'Товар успешно создан',
      data: newProduct
    });
    
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании товара',
      error: error.message
    });
  }
});

// PUT /api/products/:id - Обновить товар
router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    
    // Валидация
    const errors = validateProduct(updateData);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ошибки валидации',
        errors: errors
      });
    }
    
    const products = await readProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }
    
    // Обновляем товар
    const updatedProduct = {
      ...products[productIndex],
      name: updateData.name.trim(),
      description: updateData.description.trim(),
      price: parseFloat(updateData.price),
      category: updateData.category.trim(),
      brand: updateData.brand ? updateData.brand.trim() : '',
      quantity: parseInt(updateData.quantity),
      image: updateData.image || '',
      updatedAt: new Date().toISOString()
    };
    
    products[productIndex] = updatedProduct;
    await writeProducts(products);
    
    console.log(`✏️ Обновлен товар: ${updatedProduct.name} (ID: ${productId})`);
    
    res.json({
      success: true,
      message: 'Товар успешно обновлен',
      data: updatedProduct
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении товара',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Удалить товар
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const products = await readProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }
    
    const deletedProduct = products[productIndex];
    products.splice(productIndex, 1);
    await writeProducts(products);
    
    console.log(`🗑️ Удален товар: ${deletedProduct.name} (ID: ${productId})`);
    
    res.json({
      success: true,
      message: 'Товар успешно удален',
      data: deletedProduct
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении товара',
      error: error.message
    });
  }
});

module.exports = router;
