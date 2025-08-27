/**
 * Тип описывает минимально необходимую модель товара для карточки.
 *
 * @typedef {Object} Product
 * @property {string} id - Уникальный идентификатор товара.
 * @property {string} name - Название товара.
 * @property {string} [image] - URL изображения товара.
 * @property {string} description - Описание товара.
 * @property {number} price - Цена товара (в рублях).
 * @property {number} [quantity] - Остаток/количество.
 * @property {string} author - Автор/бренд/издатель.
 * @property {string} category - Категория товара.
 * @property {string} ownerId - UID владельца (продавца), разместившего товар.
 */

/**
 * Тип пользователя приложения (AuthContext).
 *
 * @typedef {Object} AppUser
 * @property {string} uid - Уникальный идентификатор пользователя.
 * @property {"admin"|"seller"|"buyer"} role - Роль пользователя.
 * @property {string} [email] - E-mail пользователя.
 */

// Пустой экспорт, чтобы файл считался модулем и типы можно было импортировать через import("./types").
export {};