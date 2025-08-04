import React, { useState, useEffect } from "react";
import "./Profile.css";

const EditProfileDialog = ({ isOpen, onClose, profile, onSave }) => {
  const [form, setForm] = useState(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGender = (e) => {
    setForm((prev) => ({ ...prev, gender: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <div className="dialog-header">
          <span>Личные данные</span>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <label>
              Имя
              <input name="firstName" value={form.firstName || ""} onChange={handleChange} />
            </label>
            <label>
              Отчество
              <input name="middleName" value={form.middleName || ""} onChange={handleChange} />
            </label>
            <label>
              Фамилия
              <input name="lastName" value={form.lastName || ""} onChange={handleChange} />
            </label>
            <label>
              Дата рождения
              <input type="date" name="birthDate" value={form.birthDate || ""} onChange={handleChange} />
            </label>
            <label>
              Пол
              <div className="dialog-radio-group">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={form.gender === "male"}
                    onChange={handleGender}
                  />
                  Мужской
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={form.gender === "female"}
                    onChange={handleGender}
                  />
                  Женский
                </label>
              </div>
            </label>
            <label>
              Телефон
              <input name="phone" value={form.phone || ""} onChange={handleChange} />
            </label>
          </div>
          <div className="dialog-footer">
            <button type="button" className="dialog-btn" onClick={onClose}>Отмена</button>
            <button type="submit" className="dialog-btn dialog-btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileDialog;