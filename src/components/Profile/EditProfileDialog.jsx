import React, { useState, useEffect } from "react";
import "./Profile.css";
import { useTranslation } from "react-i18next";

/**
 * @file EditProfileDialog.jsx
 * @description Модальное окно для редактирования личных данных профиля.
 * Содержит контролы для изменения имени, отчества, фамилии, даты рождения, пола и телефона.
 * При сабмите передаёт обновлённые данные вверх через onSave.
 */

/**
 * @typedef {Object} EditProfileDialogProps
 * @property {boolean} isOpen Флаг открытия диалога
 * @property {() => void} onClose Обработчик закрытия диалога
 * @property {Object} profile Текущие данные профиля
 * @property {string} [profile.firstName]
 * @property {string} [profile.middleName]
 * @property {string} [profile.lastName]
 * @property {string} [profile.birthDate] Формат YYYY-MM-DD
 * @property {"male"|"female"|""} [profile.gender]
 * @property {string} [profile.phone]
 * @property {string} [profile.email]
 * @property {(data: Object) => void} onSave Колбэк сохранения данных
 */

/**
 * Компонент модального диалога для редактирования профиля.
 *
 * @param {EditProfileDialogProps} props Пропсы компонента
 * @returns {JSX.Element|null} Разметка диалога или null, если isOpen = false
 */
const EditProfileDialog = ({ isOpen, onClose, profile, onSave }) => {
  /**
   * Хук интернационализации.
   */
  const { t } = useTranslation();

  /**
   * Локальная форма редактирования — копия объекта профиля.
   * @type {[Object, React.Dispatch<React.SetStateAction<Object>>]}
   */
  const [form, setForm] = useState(profile);

  /**
   * Синхронизация локальной формы при смене входного профиля.
   */
  useEffect(() => {
    setForm(profile);
  }, [profile]);

  /**
   * Обновление значения поля по имени.
   * @param {React.ChangeEvent<HTMLInputElement>} e Событие изменения
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Отдельный обработчик для изменения пола (radio).
   * @param {React.ChangeEvent<HTMLInputElement>} e Событие изменения
   */
  const handleGender = (e) => {
    setForm((prev) => ({ ...prev, gender: e.target.value }));
  };

  /**
   * Сабмит формы — передаём значения вверх для сохранения.
   * @param {React.FormEvent<HTMLFormElement>} e Событие отправки формы
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-label={t("profile_dialog_title", { defaultValue: "Личные данные" })}>
      <div className="dialog-content">
        <div className="dialog-header">
          <span>{t("profile_dialog_title", { defaultValue: "Личные данные" })}</span>
          <button
            className="dialog-close"
            onClick={onClose}
            aria-label={t("dialog_close", { defaultValue: "Закрыть" })}
            title={t("dialog_close", { defaultValue: "Закрыть" })}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <label>
              {t("field_firstName", { defaultValue: "Имя" })}
              <input
                type="text"
                name="firstName"
                value={form.firstName || ""}
                onChange={handleChange}
                autoComplete="given-name"
              />
            </label>

            <label>
              {t("field_middleName", { defaultValue: "Отчество" })}
              <input
                type="text"
                name="middleName"
                value={form.middleName || ""}
                onChange={handleChange}
                autoComplete="additional-name"
              />
            </label>

            <label>
              {t("field_lastName", { defaultValue: "Фамилия" })}
              <input
                type="text"
                name="lastName"
                value={form.lastName || ""}
                onChange={handleChange}
                autoComplete="family-name"
              />
            </label>

            <label>
              {t("field_birthDate", { defaultValue: "Дата рождения" })}
              <input
                type="date"
                name="birthDate"
                value={form.birthDate || ""}
                onChange={handleChange}
                autoComplete="bday"
              />
            </label>

            <label>
              {t("field_gender", { defaultValue: "Пол" })}
              <div className="dialog-radio-group">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={form.gender === "male"}
                    onChange={handleGender}
                  />
                  {t("gender_male", { defaultValue: "Мужской" })}
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={form.gender === "female"}
                    onChange={handleGender}
                  />
                  {t("gender_female", { defaultValue: "Женский" })}
                </label>
              </div>
            </label>

            <label>
              {t("field_phone", { defaultValue: "Телефон" })}
              <input
                type="tel"
                inputMode="tel"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                autoComplete="tel"
                placeholder="+7 (___) ___-__-__"
              />
            </label>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="dialog-btn"
              onClick={onClose}
              aria-label={t("btn_cancel", { defaultValue: "Отмена" })}
              title={t("btn_cancel", { defaultValue: "Отмена" })}
            >
              {t("btn_cancel", { defaultValue: "Отмена" })}
            </button>

            <button
              type="submit"
              className="dialog-btn dialog-btn-primary"
              aria-label={t("btn_save", { defaultValue: "Сохранить" })}
              title={t("btn_save", { defaultValue: "Сохранить" })}
            >
              {t("btn_save", { defaultValue: "Сохранить" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileDialog;