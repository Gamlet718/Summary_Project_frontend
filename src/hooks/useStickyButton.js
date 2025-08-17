/**
 * @module hooks/useStickyButton
 * @description Хук для управления sticky-кнопками (позиция, sticky-статус).
 */

import { useRef, useState, useEffect } from "react";

/**
 * Хук для sticky-кнопки.
 * @returns {Object} - ref, rect, isSticky, updateRect
 */
export function useStickyButton(side = "left") {
  const btnRef = useRef(null);
  const [btnRect, setBtnRect] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

  const updateRect = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setBtnRect({
        [side]: side === "left" ? rect.left : window.innerWidth - rect.right,
        top: rect.top + window.scrollY,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (btnRect) {
        setIsSticky(window.scrollY > btnRect.top);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [btnRect]);

  return { btnRef, btnRect, isSticky, updateRect };
}