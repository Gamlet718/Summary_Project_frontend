/**
 * Хук для определения прав пользователя над товаром.
 * Возвращает набор булевых флагов, упрощающих логику отображения кнопок.
 *
 * @param {import("../components/ProductCard/types").AppUser | null | undefined} user - Текущий пользователь (или отсутствует).
 * @param {import("../components/ProductCard/types").Product} product - Товар.
 * @returns {{ isAdmin: boolean, isSellerOwner: boolean, isBuyer: boolean, canManage: boolean }}
 */
export function useProductPermissions(user, product) {
  const isAdmin = Boolean(user && user.role === "admin");
  const isSellerOwner = Boolean(
    user && user.role === "seller" && user.uid === product.ownerId
  );
  const isBuyer = Boolean(user && user.role === "buyer");
  const canManage = isAdmin || isSellerOwner;

  return { isAdmin, isSellerOwner, isBuyer, canManage };
}