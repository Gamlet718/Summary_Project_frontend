import api from "./client";

// Получить список пользователей
export function fetchUsers() {
  return api.get("/users");
}

// Добавить нового пользователя
export function createUser(data) {
  return api.post("/users", data);
}

// Обновить пользователя
export function updateUser(id, data) {
  return api.put(`/users/${id}`, data);
}

// Удалить пользователя
export function deleteUser(id) {
  return api.delete(`/users/${id}`);
}
