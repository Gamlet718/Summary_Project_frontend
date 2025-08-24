import React, { useState } from "react";
import "./BookSet.css";
import EditBookSetModal from "./EditBookSetModal";

function BookSet({ bookSet, onEdit, onBuy, canEdit }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="bookset-card">
      <img className="bookset-img" src={bookSet.image} alt={bookSet.title} />
      <div className="bookset-content">
        <div className="bookset-header">
          <h2>{bookSet.title}</h2>
          {canEdit && (
            <button className="edit-btn" onClick={() => setEditOpen(true)} title="Редактировать">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15.232 5.232l-10 10V17h1.768l10-10-1.768-1.768zM17.414 2.586a2 2 0 0 0-2.828 0l-1.172 1.172 2.828 2.828 1.172-1.172a2 2 0 0 0 0-2.828z"/>
              </svg>
            </button>
          )}
        </div>
        <div className="bookset-author">{bookSet.author}</div>
        <div className="bookset-desc">{bookSet.description}</div>
        <div className="bookset-books">
          <b>В наборе:</b>
          <ul>
            {bookSet.books && bookSet.books.map((book, idx) => (
              <li key={idx}>{book}</li>
            ))}
          </ul>
        </div>
        <div className="bookset-meta">
          <span>📚 {bookSet.count} книг(и)</span>
          <span>📅 {bookSet.year}</span>
          <span>🌍 {bookSet.country}</span>
        </div>
      </div>
      <div className="bookset-buy">
        <div className="bookset-price">{bookSet.price} ₽</div>
        <button className="buy-btn" onClick={() => onBuy(bookSet.price)}>Купить</button>
      </div>
      {editOpen && (
        <EditBookSetModal
          bookSet={bookSet}
          onClose={() => setEditOpen(false)}
          onSave={onEdit}
        />
      )}
    </div>
  );
}

export default BookSet;