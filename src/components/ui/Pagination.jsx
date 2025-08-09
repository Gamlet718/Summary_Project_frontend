import React from "react";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  if (totalPages < 1) return null;

  // Для красоты: показываем не все страницы, а диапазон вокруг текущей
  const getPages = () => {
    const pages = [];
    const delta = 2; // сколько страниц слева/справа от текущей
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    if (currentPage <= delta + 1) {
      end = Math.min(totalPages, 1 + 2 * delta);
    }
    if (currentPage >= totalPages - delta) {
      start = Math.max(1, totalPages - 2 * delta);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Предыдущая страница"
      >
        {"<"}
      </button>
      {pages[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)}>1</button>
          {pages[0] > 2 && <span style={{ margin: "0 4px" }}>…</span>}
        </>
      )}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={currentPage === page}
          className={currentPage === page ? "active" : ""}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {page}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span style={{ margin: "0 4px" }}>…</span>
          )}
          <button onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Следующая страница"
      >
        {">"}
      </button>
    </div>
  );
};

export default Pagination;