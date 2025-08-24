/**
 * @module hooks/useStickyButton
 * @description Хук для управления sticky-кнопками (позиция, sticky-статус).
 * Вешайте ref на "слот"-обёртку, которая остаётся в потоке.
 */

import { useRef, useState, useEffect, useCallback } from "react";

/**
 * @param {"left"|"right"} side
 * @param {{debug?: boolean}} options
 * @returns {{
 *   btnRef: React.RefObject<HTMLElement>,
 *   btnRect: { offset: number, top: number, width: number, height: number } | null,
 *   isSticky: boolean,
 *   updateRect: (force?: boolean) => void,
 *   reset: (reason?: string) => void
 * }}
 */
export function useStickyButton(side = "left", { debug = false } = {}) {
  const btnRef = useRef(null); // ref на SLOT (обёртку), а не на кнопку
  const [btnRect, setBtnRect] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const isStickyRef = useRef(false);

  const log = (...args) => {
    if (debug) console.debug("[useStickyButton]", ...args);
  };

  useEffect(() => {
    isStickyRef.current = isSticky;
  }, [isSticky]);

  const measure = useCallback(() => {
    const el = btnRef.current;
    if (!el) {
      log("measure: no element");
      return;
    }
    const r = el.getBoundingClientRect();
    const offset = side === "left" ? r.left : window.innerWidth - r.right;
    const next = {
      offset,
      top: r.top + window.scrollY,
      width: r.width,
      height: r.height,
    };
    setBtnRect(next);
    log("measure:", { side, next });
  }, [side]);

  const updateRect = useCallback(
    (force = false) => {
      if (!btnRef.current) return;
      // если элемент залипший — измерения слота всё равно валидны (слот остаётся в потоке)
      // даём кадр на рефлоу
      requestAnimationFrame(measure);
      log("updateRect", { side, force });
    },
    [measure, side]
  );

  useEffect(() => {
    // первичное измерение
    const raf = requestAnimationFrame(() => updateRect(true));
    const onResize = () => updateRect(true);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [updateRect]);

  useEffect(() => {
    const onScroll = () => {
      if (!btnRect) return;
      const shouldStick = window.scrollY > btnRect.top;
      if (shouldStick !== isStickyRef.current) {
        setIsSticky(shouldStick);
        isStickyRef.current = shouldStick;
        log("sticky change:", { side, shouldStick, top: btnRect.top, scrollY: window.scrollY });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // инициируем проверку сразу
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [btnRect, side]);

  // Следим за изменением размеров самого слота (обёртки)
  useEffect(() => {
    if (!btnRef.current) return;
    const ro = new ResizeObserver(() => {
      log("ResizeObserver -> updateRect");
      updateRect(true);
    });
    ro.observe(btnRef.current);
    return () => {
      try {
        ro.disconnect();
      } catch {}
    };
  }, [updateRect]);

  const reset = useCallback(
    (reason = "") => {
      log("reset", { side, reason });
      isStickyRef.current = false;
      setIsSticky(false);
      setTimeout(() => updateRect(true), 0);
    },
    [updateRect, side]
  );

  return { btnRef, btnRect, isSticky, updateRect, reset };
}