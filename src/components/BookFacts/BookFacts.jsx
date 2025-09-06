// src/components/BookFacts/BookFacts.jsx
import React, { useState, useRef, useEffect } from "react";
import "./BookFacts.css";
import { useTranslation } from "react-i18next";

const ANIM_MS = 800;

const BookFacts = () => {
  const { t } = useTranslation(); // defaultNS = 'common'

  // Страницы: фиксированные ключи + русский defaultValue — парсер сложит в ru/common.json
  const pages = [
    {
      title: t("bookFacts.pages.0.title", { defaultValue: "Библиотеки" }),
      items: [
        t("bookFacts.pages.0.items.0", {
          defaultValue:
            "Самая старая действующая библиотека — в Монастыре Святой Екатерины на Синайском полуострове в Египте. Построена в середине VI века, закрыта для широкой публики, взять книги могут только монахи и приглашённые студенты."
        }),
        t("bookFacts.pages.0.items.1", {
          defaultValue:
            "Самая большая библиотека в мире — Библиотека Конгресса США. В её фондах хранится более 170 миллионов единиц, включая книги, карты и рукописи."
        }),
        t("bookFacts.pages.0.items.2", {
          defaultValue:
            "В Йельском университете есть библиотека без окон, но света там и без них хватает, так как наружная стена выполнена из частично пропускающего солнечный свет мрамора."
        }),
        t("bookFacts.pages.0.items.3", {
          defaultValue:
            "Библиотека есть даже в космосе — на борту МКС. Состоит из сотни с небольшим книг, которые были специально напечатаны на тонком пластике вместо бумаги, чтобы избежать засорения бортовой системы фильтрации воздуха бумажной пылью."
        })
      ]
    },
    {
      title: t("bookFacts.pages.1.title", { defaultValue: "Книги" }),
      items: [
        t("bookFacts.pages.1.items.0", {
          defaultValue:
            "Самая древняя сохранившаяся книга — «Алмазная сутра», напечатанная в Китае в 868 году. Создана методом ксилографии, представляет собой буддийский текст."
        }),
        t("bookFacts.pages.1.items.1", {
          defaultValue:
            "Первые книги в Древнем Египте изготавливали из папируса, а в Древнем Китае — из бамбуковых дощечек, связанных шнурками."
        }),
        t("bookFacts.pages.1.items.2", {
          defaultValue:
            "Самая маленькая книга в мире — «Теотокос», её размер — всего 0,9 мм, для её чтения требуется микроскоп."
        }),
        t("bookFacts.pages.1.items.3", {
          defaultValue:
            "Первые переплёты книг создавались из кожи и дерева, они не только защищали страницы, но и служили украшением, так как их часто инкрустировали драгоценными камнями."
        }),
        t("bookFacts.pages.1.items.4", {
          defaultValue:
            "В некоторых древних книгах можно встретить «тайные страницы» — например, в средневековых манускриптах иногда скрывались дополнительные записи или иллюстрации, которые были видны только при определённом освещении."
        })
      ]
    }
  ];

  const [pageIndex, setPageIndex] = useState(0);
  const [isTurning, setIsTurning] = useState(false);
  const [direction, setDirection] = useState(null); // 'forward' | 'back' | null
  const turnTimer = useRef(null);

  useEffect(() => {
    if (pageIndex > pages.length - 1) {
      setPageIndex(Math.max(0, pages.length - 1));
    }
  }, [pages.length, pageIndex]);

  // Чистим таймер при размонтировании
  useEffect(() => {
    return () => {
      if (turnTimer.current) clearTimeout(turnTimer.current);
    };
  }, []);

  const canPrev = pageIndex > 0 && !isTurning;
  const canNext = pageIndex < pages.length - 1 && !isTurning;

  const handleTurn = (dir) => {
    if ((dir === "forward" && !canNext) || (dir === "back" && !canPrev)) return;
    setDirection(dir);
    setIsTurning(true);

    clearTimeout(turnTimer.current);
    turnTimer.current = setTimeout(() => {
      setPageIndex((i) => (dir === "forward" ? i + 1 : i - 1));
      setIsTurning(false);
      setDirection(null);
    }, ANIM_MS);
  };

  const currentPage = pages[pageIndex] || { title: "", items: [] };

  return (
    <div
      className="book-facts"
      aria-label={t("bookFacts.region_label", { defaultValue: "Интересные факты — книга" })}
      role="region"
    >
      <div className="book-wrap">
        <div
          className={[
            "book",
            isTurning && direction === "forward" ? "turn-forward" : "",
            isTurning && direction === "back" ? "turn-back" : ""
          ].join(" ")}
          aria-live="polite"
        >
          {/* Левая страница (титульная) */}
          <div className="page page-left">
            <div className="page-inner">
              <h2 className="book-title">
                {t("bookFacts.main_title", {
                  defaultValue: "Интересные факты о библиотеках и книгах"
                })}
              </h2>
              <p className="book-lead">
                {t("bookFacts.lead", {
                  defaultValue:
                    "Откройте редкие собрания, необычные читальные залы и удивительные истории книг. Перелистывайте страницы, чтобы посмотреть разделы."
                })}
              </p>
              <div className="decoration-line" />
            </div>
          </div>

          {/* Правая страница (перелистываемая) */}
          <div className="page page-right">
            <div className="page-inner">
              <h3 className="page-heading">{currentPage.title}</h3>
              <div className="page-content">
                <ul className="page-list">
                  {currentPage.items.map((text, idx) => (
                    <li key={idx} className="fact-item">
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="page-bottom">
                <span className="page-indicator">
                  {t("bookFacts.page_indicator", {
                    current: pageIndex + 1,
                    total: pages.length,
                    // Совместимость с ошибочно переведёнными плейсхолдерами
                    Current: pageIndex + 1,
                    Total: pages.length,
                    TOTAL: pages.length,
                    defaultValue: "Страница {{current}} / {{total}}"
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Управление перелистыванием */}
        <div className="book-controls">
          <button
            type="button"
            className="turn-btn"
            onClick={() => handleTurn("back")}
            disabled={!canPrev}
            aria-disabled={!canPrev}
            aria-label={t("bookFacts.prev_aria", { defaultValue: "Предыдущая страница" })}
          >
            {t("bookFacts.prev", { defaultValue: "Назад" })}
          </button>
          <button
            type="button"
            className="turn-btn"
            onClick={() => handleTurn("forward")}
            disabled={!canNext}
            aria-disabled={!canNext}
            aria-label={t("bookFacts.next_aria", { defaultValue: "Следующая страница" })}
          >
            {t("bookFacts.next", { defaultValue: "Вперёд" })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookFacts;