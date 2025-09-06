import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import EditProfileDialog from "./EditProfileDialog";
import "./Profile.css";
import { useTranslation } from "react-i18next";

/**
 * @file Profile.jsx
 * @description Компонент страницы профиля пользователя.
 * Отвечает за:
 * - загрузку профиля из Firestore (коллекция userProfiles, документ user.uid),
 * - отображение основных данных профиля,
 * - открытие/закрытие диалога редактирования профиля,
 * - сохранение обновлённых данных в Firestore.
 *
 * Интернационализация:
 * - Все видимые тексты, подписи и кнопки локализованы через i18next (useTranslation).
 */

/**
 * Тип данных профиля пользователя.
 * @typedef {Object} UserProfile
 * @property {string} firstName Имя
 * @property {string} lastName Фамилия
 * @property {string} middleName Отчество
 * @property {string} birthDate Дата рождения (YYYY-MM-DD)
 * @property {"male"|"female"|""} gender Пол
 * @property {string} phone Телефон
 * @property {string} email Почта (копируется из user.email)
 */

/**
 * Компонент страницы профиля.
 * Не принимает пропсов — получает текущего пользователя из AuthContext.
 *
 * @returns {JSX.Element|null} Разметка профиля или null, если пользователь/профиль ещё не доступны.
 */
const Profile = () => {
  /**
   * Контекст аутентификации (текущий пользователь Firebase Auth).
   */
  const { user } = useContext(AuthContext);

  /**
   * Хук интернационализации.
   * Используется для получения локализованных строк.
   */
  const { t } = useTranslation();

  /**
   * Состояние данных профиля пользователя.
   * @type {[UserProfile|null, React.Dispatch<React.SetStateAction<UserProfile|null>>]}
   */
  const [profile, setProfile] = useState(null);

  /**
   * Флаг открытия диалога редактирования профиля.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [dialogOpen, setDialogOpen] = useState(false);

  /**
   * Эффект загрузки профиля пользователя из Firestore.
   * - Если документ существует — устанавливаем его в состояние.
   * - Если нет — создаём локально "пустой" профиль с безопасными дефолтами.
   *
   * Зависимости:
   * - user: при смене пользователя выполнится повторная загрузка,
   * - t: чтобы корректно локализовать дефолтные значения при смене языка.
   */
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const ref = doc(db, "userProfiles", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          // Локально создаём дефолтные поля до первого сохранения
          setProfile({
            firstName: t("profile_default_firstName", { defaultValue: "Клиент" }),
            lastName: "",
            middleName: "",
            birthDate: "",
            gender: "",
            phone: "",
            email: user.email || "",
          });
        }
      };
      fetchProfile();
    }
  }, [user, t]);

  /**
   * Обработчик сохранения профиля.
   * Сохраняет данные в Firestore (документ userProfiles/{uid}), затем обновляет локальное состояние.
   *
   * @param {UserProfile} data Новые данные профиля
   * @returns {Promise<void>}
   */
  const handleSave = async (data) => {
    const ref = doc(db, "userProfiles", user.uid);
    // Email берём из авторизованного пользователя, чтобы не редактировался вручную
    const payload = { ...data, email: user.email || "" };
    await setDoc(ref, payload);
    setProfile(payload);
    setDialogOpen(false);
  };

  // Рендерим только когда есть авторизованный пользователь и профиль
  if (!user || !profile) return null;

  // Вспомогательные локализованные "заглушки" для статусов "не указано/не указана" по роду
  const notSpecifiedM = t("profile_not_specified_m", { defaultValue: "Не указан" });
  const notSpecifiedF = t("profile_not_specified_f", { defaultValue: "Не указана" });

  return (
    <div className="profile-container">
      {/* Левое меню */}
      <div className="profile-sidebar">
        <div className="profile-avatar">
          <div className="avatar-circle" aria-hidden="true">
            {profile.firstName ? profile.firstName[0] : "?"}
          </div>
        </div>

        <div className="profile-name">
          <span>{profile.firstName} {profile.lastName}</span>
          <button
            className="profile-edit-link"
            onClick={() => setDialogOpen(true)}
            aria-label={t("profile_edit_profile", { defaultValue: "Изменить профиль" })}
            title={t("profile_edit_profile", { defaultValue: "Изменить профиль" })}
          >
            {t("profile_edit_profile", { defaultValue: "Изменить профиль" })}
          </button>
        </div>

        <hr className="profile-divider" />

        <div className="profile-menu-title">
          {t("profile_menu_title", { defaultValue: "Меню" })}
        </div>

        <div className="profile-menu">
          <button className="profile-menu-btn">
            {t("profile_menu_personal", { defaultValue: "Личная информация" })}
          </button>
          <button className="profile-menu-btn">
            {t("profile_menu_orders", { defaultValue: "Заказы" })}
          </button>
          <button className="profile-menu-btn">
            {t("profile_menu_subscriptions", { defaultValue: "Подписки" })}
          </button>
        </div>
      </div>

      {/* Центр */}
      <div className="profile-main">
        <div className="profile-main-header">
          <div className="avatar-circle avatar-large" aria-hidden="true">
            {profile.firstName ? profile.firstName[0] : "?"}
          </div>

          <div>
            <h2>{profile.lastName} {profile.firstName}</h2>

            <div className="profile-main-info">
              <span>
                {t("profile_birth_date", { defaultValue: "Дата рождения" })}:{" "}
                <b>{profile.birthDate || notSpecifiedF}</b>
              </span>

              <span>
                {t("profile_gender_label", { defaultValue: "Пол" })}:{" "}
                <b>
                  {profile.gender
                    ? profile.gender === "male"
                      ? t("gender_male", { defaultValue: "Мужской" })
                      : t("gender_female", { defaultValue: "Женский" })
                    : notSpecifiedM}
                </b>
              </span>

              <button
                className="profile-edit-link"
                onClick={() => setDialogOpen(true)}
                aria-label={t("profile_edit", { defaultValue: "Изменить" })}
                title={t("profile_edit", { defaultValue: "Изменить" })}
              >
                {t("profile_edit", { defaultValue: "Изменить" })}
              </button>
            </div>
          </div>
        </div>

        <hr className="profile-divider" />

        <div>
          <h3>{t("profile_account_data", { defaultValue: "Учётные данные" })}</h3>

          <div className="profile-desc">
            {t("profile_desc", {
              defaultValue:
                "Здесь вы можете отредактировать информацию о себе и добавить недостающую",
            })}
          </div>

          <div className="profile-warning">
            <b>
              {t("profile_warning", {
                defaultValue: "Укажите недостающие данные, чтобы защитить свой аккаунт",
              })}
            </b>
          </div>

          <div className="profile-contacts">
            <div>
              <div className="profile-label">
                {t("profile_phone", { defaultValue: "Телефон" })}
              </div>

              <div className="profile-value">
                {profile.phone || notSpecifiedM}
              </div>

              <button
                className="profile-edit-link"
                onClick={() => setDialogOpen(true)}
                aria-label={t("profile_edit", { defaultValue: "Изменить" })}
                title={t("profile_edit", { defaultValue: "Изменить" })}
              >
                {t("profile_edit", { defaultValue: "Изменить" })}
              </button>
            </div>

            <div>
              <div className="profile-label">
                {t("profile_email", { defaultValue: "Почта" })}
              </div>

              <div
                className={`profile-value ${profile.email ? "" : "profile-value-missing"}`}
              >
                {profile.email || notSpecifiedF}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Диалог редактирования */}
      {dialogOpen && (
        <EditProfileDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          profile={profile}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Profile;