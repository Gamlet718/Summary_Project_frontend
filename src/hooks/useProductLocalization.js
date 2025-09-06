// src/hooks/useProductLocalization.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateBatch } from "../services/translationApi";

// Кэш переводов на клиенте: Map<productId, { [lang]: { sig: string, data: Partial<Product> } }>
const productTranslations = new Map();
// Дедупликация одновременных запросов: Map<key, Promise<Partial<Product>>>
const inflightTranslations = new Map();
// Кулдаун ошибок, чтобы не перезапускать мгновенно при неудаче
const errorCooldown = new Map(); // key -> timestamp(ms)
const ERROR_COOLDOWN_MS = 60_000;

/**
 * Локализует поля продукта (name, description, author, category) под текущий язык i18n.
 * - Если product.lang неизвестен, используем 'auto'.
 * - Переводы кэшируются и инвалидаются при изменении исходных полей (по "подписи").
 *
 * @param {Object} product
 * @returns {{ product: Object, loading: boolean }}
 */
export function useProductLocalization(product) {
  const { i18n } = useTranslation();
  const targetLang = i18n.language?.startsWith("ru") ? "ru" : "en";
  const originalLang = product?.lang || "auto";

  const fields = useMemo(() => ["name", "description", "author", "category"], []);

  // Подпись содержимого полей, чтобы инвалидировать кэш при изменениях
  const signature = useMemo(() => {
    if (!product) return "";
    const values = fields.map((f) => product?.[f] || "");
    try {
      return JSON.stringify(values);
    } catch {
      return values.join("\u0001");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.name, product?.description, product?.author, product?.category]);

  const hasAnyText = useMemo(() => {
    if (!product) return false;
    return fields.some((f) => !!product[f]);
  }, [product, fields]);

  const initialLoading =
    !!product &&
    (originalLang === "auto" ? hasAnyText : targetLang !== originalLang && hasAnyText);

  const [state, setState] = useState({
    product,
    loading: initialLoading
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!product || !product.id) {
      setState({ product, loading: false });
      return;
    }

    // Если исходный язык известен и совпадает с целевым — перевода не нужно
    if (originalLang !== "auto" && targetLang === originalLang) {
      setState({ product, loading: false });
      return;
    }

    // Если перевода нечего — выходим
    if (!hasAnyText) {
      setState({ product, loading: false });
      return;
    }

    // Проверяем кэш (по подписи)
    const cacheEntry = productTranslations.get(product.id);
    const cached = cacheEntry?.[targetLang];
    if (cached && cached.sig === signature) {
      setState({ product: { ...product, ...cached.data }, loading: false });
      return;
    }

    const inflightKey = `${product.id}|${originalLang}|${targetLang}|${signature}`;

    // Проверим кулдаун последней ошибки по этому ключу
    const lastErrAt = errorCooldown.get(inflightKey) || 0;
    const now = Date.now();
    if (now - lastErrAt < ERROR_COOLDOWN_MS) {
      // Недавняя ошибка — не пытаемся снова до истечения кулдауна
      setState({ product, loading: false });
      return;
    }

    let canceled = false;
    setState((prev) => ({ ...prev, loading: true }));

    const run = async () => {
      const texts = fields.map((f) => product[f] || "");
      try {
        // Дедупликация одновременных запросов
        let p = inflightTranslations.get(inflightKey);
        if (!p) {
          p = (async () => {
            // Мягкий таймаут внутри translateBatch, вернет оригиналы при сбое
            const translations = await translateBatch(texts, originalLang, targetLang, 15000);
            const mapped = {};
            fields.forEach((f, i) => {
              mapped[f] = translations[i] ?? product[f] ?? "";
            });
            return mapped;
          })();
          inflightTranslations.set(inflightKey, p);
        }

        const mapped = await p;

        // Кладем в кэш
        const existing = productTranslations.get(product.id) || {};
        existing[targetLang] = { sig: signature, data: mapped };
        productTranslations.set(product.id, existing);

        if (!canceled && mountedRef.current) {
          setState({ product: { ...product, ...mapped }, loading: false });
        }
      } catch (e) {
        // Лог для отладки, но без спиннера
        console.error("[useProductLocalization] translate error:", e);
        errorCooldown.set(inflightKey, Date.now());
        if (!canceled && mountedRef.current) {
          setState({ product, loading: false });
        }
      } finally {
        inflightTranslations.delete(inflightKey);
      }
    };

    run();

    return () => {
      canceled = true;
    };
  }, [product?.id, targetLang, originalLang, signature, hasAnyText, fields]);

  return state;
}