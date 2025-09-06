/**
 * @module utils/applyBookFilter
 * @description Фильтрует и сортирует массив книг по заданному фильтру.
 */

/**
 * Фильтрует и сортирует книги.
 * @param {Array} books - Массив книг.
 * @param {Object} filter - Объект фильтрации.
 * @returns {Array} - Отфильтрованный и отсортированный массив книг.
 */
export function applyBookFilter(books, filter) {
  let filtered = [...books];
  if (filter.name) {
    filtered = filtered.filter((b) =>
      b.name.toLowerCase().includes(filter.name.toLowerCase())
    );
  }
  if (filter.categories && filter.categories.length > 0) {
    filtered = filtered.filter((b) => filter.categories.includes(b.category));
  }
  if (filter.author) {
    filtered = filtered.filter((b) =>
      (b.author || "").toLowerCase().includes(filter.author.toLowerCase())
    );
  }
  if (filter.priceFrom !== undefined && filter.priceFrom !== null && filter.priceFrom !== '') {
    filtered = filtered.filter((b) => Number(b.price) >= Number(filter.priceFrom));
  }
  if (filter.priceTo !== undefined && filter.priceTo !== null && filter.priceTo !== '') {
    filtered = filtered.filter((b) => Number(b.price) <= Number(filter.priceTo));
  }
  if (filter.sort === "asc") {
    filtered = filtered.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (filter.sort === "desc") {
    filtered = filtered.sort((a, b) => Number(b.price) - Number(a.price));
  }
  return filtered;
}