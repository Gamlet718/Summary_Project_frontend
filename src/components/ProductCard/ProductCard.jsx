// src/components/ProductCard/ProductCard.jsx
import React from 'react'
import './Product-Card.css'
import { FaTrash, FaEdit, FaShoppingCart } from 'react-icons/fa'

export function ProductCard({ product, onDelete, onEdit }) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE'
      })
      const { success, message } = await res.json()
      if (success) {
        onDelete(product.id)
      } else {
        alert('Ошибка: ' + message)
      }
    } catch (err) {
      alert('Ошибка: ' + err.message)
    }
  }

  return (
    <div className="product-card">
      <div className="product-card__image-wrap">
        <img
          className="product-card__image"
          src={product.image}
          alt={product.name}
        />
      </div>

      <div className="product-card__body">
        <div className="product-card__badges">
          <span className="badge badge--brand">{product.brand}</span>
          <span className="badge badge--category">{product.category}</span>
        </div>

        <h3 className="product-card__title">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>

        <div className="product-card__footer">
          <span className="product-card__price">{product.price} ₽</span>
          <div className="product-card__actions">
            <button className="btn btn--cart">
              <FaShoppingCart /> В корзину
            </button>
            <button className="btn btn--edit" onClick={() => onEdit(product)}>
              <FaEdit /> Ред.
            </button>
            <button className="btn btn--delete" onClick={handleDelete}>
              <FaTrash /> Удал.
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
