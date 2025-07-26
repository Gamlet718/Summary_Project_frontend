import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const DATA_FILE = path.join(__dirname, "../data/products.json");

const writeProducts = async (products) => {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), "utf8");
};

const readProducts = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeProducts([]);
      return [];
    }
    throw error;
  }
};

const validateProduct = (product) => {
  const errors = [];

  if (!product.name || product.name.trim().length === 0) {
    errors.push("Название книги обязательно");
  }

  if (!product.description || product.description.trim().length === 0) {
    errors.push("Описание книги обязательно");
  }

  if (!product.price || isNaN(product.price) || parseFloat(product.price) <= 0) {
    errors.push("Цена должна быть положительным числом");
  }

  if (!product.category || product.category.trim().length === 0) {
    errors.push("Категория книги обязательна");
  }

  if (
    product.quantity === undefined ||
    isNaN(product.quantity) ||
    parseInt(product.quantity) < 0
  ) {
    errors.push("Количество должно быть неотрицательным числом");
  }

  return errors;
};

// GET /api/products - Получить все книги
router.get("/", async (req, res) => {
  try {
    const products = await readProducts();
    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ошибка при получении книг",
      error: error.message,
    });
  }
});

// GET /api/products/:id - Получить книгу по ID
router.get("/:id", async (req, res) => {
  try {
    const products = await readProducts();
    const product = products.find((p) => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Книга не найдена",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ошибка при получении книги",
      error: error.message,
    });
  }
});

// POST /api/products - Создать новую книгу
router.post("/", async (req, res) => {
  try {
    const productData = req.body;

    const errors = validateProduct(productData);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors,
      });
    }

    const newProduct = {
      id: uuidv4(),
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: parseFloat(productData.price),
      category: productData.category.trim(),
      author: productData.author ? productData.author.trim() : "",
      quantity: parseInt(productData.quantity),
      image: productData.image || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const products = await readProducts();
    products.push(newProduct);

    await writeProducts(products);

    console.log(`✅ Создана новая книга: ${newProduct.name} (ID: ${newProduct.id})`);

    res.status(201).json({
      success: true,
      message: "Книга успешно создана",
      data: newProduct,
    });
  } catch (error) {
    console.error("Ошибка при создании книги:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка при создании книги",
      error: error.message,
    });
  }
});

// PUT /api/products/:id - Обновить книгу
router.put("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    const errors = validateProduct(updateData);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors,
      });
    }

    const products = await readProducts();
    const productIndex = products.findIndex((p) => p.id === productId);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Книга не найдена",
      });
    }

    const updatedProduct = {
      ...products[productIndex],
      name: updateData.name.trim(),
      description: updateData.description.trim(),
      price: parseFloat(updateData.price),
      category: updateData.category.trim(),
      author: updateData.author ? updateData.author.trim() : "",
      quantity: parseInt(updateData.quantity),
      image: updateData.image || "",
      updatedAt: new Date().toISOString(),
    };

    products[productIndex] = updatedProduct;
    await writeProducts(products);

    console.log(`✏️ Обновлена книга: ${updatedProduct.name} (ID: ${productId})`);

    res.json({
      success: true,
      message: "Книга успешно обновлена",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ошибка при обновлении книги",
      error: error.message,
    });
  }
});

// DELETE /api/products/:id - Удалить книгу
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const products = await readProducts();
    const productIndex = products.findIndex((p) => p.id === productId);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Книга не найдена",
      });
    }

    const deletedProduct = products[productIndex];
    products.splice(productIndex, 1);
    await writeProducts(products);

    console.log(`🗑️ Удалена книга: ${deletedProduct.name} (ID: ${productId})`);

    res.json({
      success: true,
      message: "Книга успешно удалена",
      data: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ошибка при удалении книги",
      error: error.message,
    });
  }
});

export default router;