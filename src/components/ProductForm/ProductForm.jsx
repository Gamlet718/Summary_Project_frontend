import React, { useState } from 'react';
import './ProductForm.css';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    quantity: '',
    image: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const categories = [
    'Электроника',
    'Одежда',
    'Дом и сад',
    'Спорт',
    'Книги',
    'Красота',
    'Автотовары',
    'Другое'
  ];

  const API_BASE_URL = 'http://localhost:3000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Убираем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Убираем сообщение об отправке
    if (submitMessage.text) {
      setSubmitMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название товара обязательно';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание товара обязательно';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Укажите корректную цену';
    }

    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
    }

    if (!formData.quantity || formData.quantity < 0) {
      newErrors.quantity = 'Укажите количество товара';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitMessage({
          type: 'success',
          text: `Товар "${result.data.name}" успешно создан! ID: ${result.data.id}`
        });
        
        // Очищаем форму
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          brand: '',
          quantity: '',
          image: ''
        });
        
        console.log('Создан товар:', result.data);
        
      } else {
        // Обработка ошибок валидации с сервера
        if (result.errors && Array.isArray(result.errors)) {
          setSubmitMessage({
            type: 'error',
            text: result.errors.join(', ')
          });
        } else {
          setSubmitMessage({
            type: 'error',
            text: result.message || 'Ошибка при создании товара'
          });
        }
      }
      
    } catch (error) {
      console.error('Ошибка сети:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Ошибка соединения с сервером. Проверьте, что сервер запущен.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      quantity: '',
      image: ''
    });
    setErrors({});
    setSubmitMessage({ type: '', text: '' });
  };

  return (
    <div className="product-form-container">
      <div className="product-form-card">
        <h2 className="form-title">Создание нового товара</h2>
        
        {submitMessage.text && (
          <div className={`message ${submitMessage.type}`}>
            {submitMessage.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Название товара *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Введите название товара"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Описание *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Описание товара"
                rows="4"
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Цена (₽) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`form-input ${errors.price ? 'error' : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="quantity" className="form-label">
                Количество *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={`form-input ${errors.quantity ? 'error' : ''}`}
                placeholder="0"
                min="0"
              />
              {errors.quantity && <span className="error-message">{errors.quantity}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Категория *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`form-select ${errors.category ? 'error' : ''}`}
              >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="brand" className="form-label">
                Бренд
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="form-input"
                placeholder="Бренд товара"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="image" className="form-label">
                URL изображения
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {formData.image && (
            <div className="image-preview">
              <img 
                src={formData.image} 
                alt="Предпросмотр" 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-form btn-form-secondary"
              onClick={clearForm}
              disabled={isSubmitting}
            >
              Очистить
            </button>
            <button
              type="submit"
              className="btn-form btn-form-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать товар'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
