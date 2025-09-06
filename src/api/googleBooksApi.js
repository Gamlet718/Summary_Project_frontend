// src/api/googleBooksApi.js
/**
 * Клиентские функции для работы с серверными роутами Google Books.
 */

/**
 * Инициирует загрузку 30 книг из Google Books (RU, с Firestore и локальным кэшем).
 * @param {boolean} [force=false]
 */
export async function seedGoogleBooks(force = false) {
  const res = await fetch(`/api/google-books/seed${force ? '?force=1' : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

/**
 * Получить до 30 книг из Firestore без обращения к Google.
 */
export async function getCachedGoogleBooks() {
  const res = await fetch(`/api/google-books/cached`);
  return res.json();
}

/**
 * Разово нормализовать уже сохраненные локальные книги:
 * - жанры → русские
 * - картинки → через прокси
 */
export async function normalizeLocalGoogleBooks() {
  const res = await fetch(`/api/google-books/normalize-local`, { method: 'POST' });
  return res.json();
}