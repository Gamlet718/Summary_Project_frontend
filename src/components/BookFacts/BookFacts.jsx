// src/components/BookFacts/BookFacts.jsx
import React, { useState, useRef } from "react";
import "./BookFacts.css";

const ANIM_MS = 800;

const pages = [
  {
    title: "Библиотеки",
    items: [
      "Самая старая действующая библиотека — в Монастыре Святой Екатерины на Синайском полуострове в Египте. Построена в середине VI века, закрыта для широкой публики, взять книги могут только монахи и приглашённые студенты.",
      "Самая большая библиотека в мире — Библиотека Конгресса США. В её фондах хранится более 170 миллионов единиц, включая книги, карты и рукописи.",
      "В Йельском университете есть библиотека без окон, но света там и без них хватает, так как наружная стена выполнена из частично пропускающего солнечный свет мрамора.",
      "Библиотека есть даже в космосе — на борту МКС. Состоит из сотни с небольшим книг, которые были специально напечатаны на тонком пластике вместо бумаги, чтобы избежать засорения бортовой системы фильтрации воздуха бумажной пылью.",
    ],
  },
  {
    title: "Книги",
    items: [
      "Самая древняя сохранившаяся книга — «Алмазная сутра», напечатанная в Китае в 868 году. Создана методом ксилографии, представляет собой буддийский текст.",
      "Первые книги в Древнем Египте изготавливали из папируса, а в Древнем Китае — из бамбуковых дощечек, связанных шнурками.",
      "Самая маленькая книга в мире — «Теотокос», её размер — всего 0,9 мм, для её чтения требуется микроскоп.",
      "Первые переплёты книг создавались из кожи и дерева, они не только защищали страницы, но и служили украшением, так как их часто инкрустировали драгоценными камнями.",
      "В некоторых древних книгах можно встретить «тайные страницы» — например, в средневековых манускриптах иногда скрывались дополнительные записи или иллюстрации, которые были видны только при определённом освещении.",
    ],
  },
];

const BookFacts = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [isTurning, setIsTurning] = useState(false);
  const [direction, setDirection] = useState(null); // 'forward' | 'back' | null
  const turnTimer = useRef(null);

  const canPrev = pageIndex > 0 && !isTurning;
  const canNext = pageIndex < pages.length - 1 && !isTurning;

  const handleTurn = (dir) => {
    if ((dir === "forward" && !canNext) || (dir === "back" && !canPrev)) return;
    setDirection(dir);
    setIsTurning(true);

    // После окончания анимации меняем страницу и возвращаемся в исходное состояние
    clearTimeout(turnTimer.current);
    turnTimer.current = setTimeout(() => {
      setPageIndex((i) => (dir === "forward" ? i + 1 : i - 1));
      setIsTurning(false);
      setDirection(null);
    }, ANIM_MS);
  };

  return (
    <div className="book-facts" aria-label="Интересные факты — книга" role="region">
      <div className="book-wrap">
        <div
          className={[
            "book",
            isTurning && direction === "forward" ? "turn-forward" : "",
            isTurning && direction === "back" ? "turn-back" : "",
          ].join(" ")}
          aria-live="polite"
        >
          {/* Левая страница (титульная) */}
          <div className="page page-left">
            <div className="page-inner">
              <h2 className="book-title">Интересные факты о библиотеках и книгах</h2>
              <p className="book-lead">
                Откройте редкие собрания, необычные читальные залы и удивительные истории книг.
                Перелистывайте страницы, чтобы посмотреть разделы.
              </p>
              <div className="decoration-line" />
            </div>
          </div>

          {/* Правая страница (перелистываемая) */}
          <div className="page page-right">
            <div className="page-inner">
              <h3 className="page-heading">{pages[pageIndex].title}</h3>
              <div className="page-content">
                <ul className="page-list">
                  {pages[pageIndex].items.map((text, idx) => (
                    <li key={idx} className="fact-item">{text}</li>
                  ))}
                </ul>
              </div>
              <div className="page-bottom">
                <span className="page-indicator">
                  Страница {pageIndex + 1} / {pages.length}
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
            aria-label="Предыдущая страница"
          >
            Назад
          </button>
          <button
            type="button"
            className="turn-btn"
            onClick={() => handleTurn("forward")}
            disabled={!canNext}
            aria-disabled={!canNext}
            aria-label="Следующая страница"
          >
            Вперёд
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookFacts;