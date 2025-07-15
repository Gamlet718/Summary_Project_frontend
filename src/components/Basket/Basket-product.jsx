import React from "react"
import "./Basket-product.css"
export function BasketProduct({ product, onQuantityChange, onDelete }) {
  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= product.quantity) {
      onQuantityChange(product.id, value);
    }
  };

  return (
    <tr>
      <td>
        <img
          src={product.image || "https://placehold.co/60x60?text=No+Image"}
          alt={product.name}
          width={60}
          height={60}
          style={{ objectFit: "cover" }}
        />
      </td>
      <td style={{ color: "white", fontWeight: 600 }} >{product.name}</td>
      <td style={{ color: "white", fontWeight: 600 }} >{product.description}</td>
      <td style={{ color: "white", fontWeight: 600 }} >{product.category}</td>
      <td style={{ color: "white", fontWeight: 600 }} >{product.brand}</td>
      <td style={{ color: "white", fontWeight: 600 }} >{product.price} ₽</td>
      <td>
        <input
          type="number"
          min="1"
          max={product.quantity}
          value={product.selectedQuantity}
          onChange={handleInputChange}
          style={{ width: "60px" }}
        />
        <div style={{ fontSize: "0.75rem", color: "#666",color: "white", fontWeight: 600 }}>
          Максимум: {product.quantity}
        </div>
      </td>
      <td style={{ color: "white", fontWeight: 600 }} className="Price_table" >{(product.price * product.selectedQuantity).toFixed(2)}  ₽</td>
      <td>
        <button
          onClick={() => onDelete(product.id)}
          style={{
            background: "none",
            border: "none",
            color: "red",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          title="Удалить товар"
        >
          ×
        </button>
      </td>
    </tr>
  );
}
