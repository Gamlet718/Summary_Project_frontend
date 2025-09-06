// server/utils/productsStorage.js
/**
 * Утилиты для чтения/записи локального хранилища товаров (server/data/products.json).
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к JSON с товарами
export const DATA_FILE = path.join(__dirname, '../data/products.json');

/**
 * Создает директорию под файл, если её нет.
 * @returns {Promise<void>}
 */
async function ensureDir() {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Записывает массив товаров в файл.
 * @param {Array<Object>} products - Список товаров.
 * @returns {Promise<void>}
 */
export async function writeProducts(products) {
  await ensureDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
}

/**
 * Читает массив товаров из файла (или создает пустой файл, если его нет).
 * @returns {Promise<Array<Object>>}
 */
export async function readProducts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeProducts([]);
      return [];
    }
    throw error;
  }
}