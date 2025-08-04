import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import EditProfileDialog from "./EditProfileDialog";
import "./Profile.css";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const ref = doc(db, "userProfiles", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setProfile(snap.data());
        else setProfile({
          firstName: "Клиент",
          lastName: "",
          middleName: "",
          birthDate: "",
          gender: "",
          phone: "",
          email: user.email || "",
        });
      };
      fetchProfile();
    }
  }, [user]);

  const handleSave = async (data) => {
    const ref = doc(db, "userProfiles", user.uid);
    await setDoc(ref, { ...data, email: user.email || "" });
    setProfile({ ...data, email: user.email || "" });
    setDialogOpen(false);
  };

  if (!user || !profile) return null;

  return (
    <div className="profile-container">
      {/* Левое меню */}
      <div className="profile-sidebar">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profile.firstName[0]}
          </div>
        </div>
        <div className="profile-name">
          <span>{profile.firstName} {profile.lastName}</span>
          <button className="profile-edit-link" onClick={() => setDialogOpen(true)}>
            Изменить профиль
          </button>
        </div>
        <hr className="profile-divider" />
        <div className="profile-menu-title">Меню</div>
        <div className="profile-menu">
          <button className="profile-menu-btn">Личная информация</button>
          <button className="profile-menu-btn">Заказы</button>
          <button className="profile-menu-btn">Подписки</button>
        </div>
      </div>

      {/* Центр */}
      <div className="profile-main">
        <div className="profile-main-header">
          <div className="avatar-circle avatar-large">
            {profile.firstName[0]}
          </div>
          <div>
            <h2>{profile.lastName} {profile.firstName}</h2>
            <div className="profile-main-info">
              <span>Дата рождения: <b>{profile.birthDate || "Не указана"}</b></span>
              <span>Пол: <b>{profile.gender ? (profile.gender === "male" ? "Мужской" : "Женский") : "Не указан"}</b></span>
              <button className="profile-edit-link" onClick={() => setDialogOpen(true)}>
                Изменить
              </button>
            </div>
          </div>
        </div>
        <hr className="profile-divider" />
        <div>
          <h3>Учётные данные</h3>
          <div className="profile-desc">Здесь вы можете отредактировать информацию о себе и добавить недостающую</div>
          <div className="profile-warning">
            <b>Укажите недостающие данные, чтобы защитить свой аккаунт</b>
          </div>
          <div className="profile-contacts">
            <div>
              <div className="profile-label">Телефон</div>
              <div className="profile-value">{profile.phone || "Не указан"}</div>
              <button className="profile-edit-link" onClick={() => setDialogOpen(true)}>
                Изменить
              </button>
            </div>
            <div>
              <div className="profile-label">Почта</div>
              <div className={`profile-value ${profile.email ? "" : "profile-value-missing"}`}>
                {profile.email || "Не указана"}
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