// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data().role;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const role = await fetchUserRole(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: role || "buyer",
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Регистрация с проверкой роли из формы (только "buyer" или "seller")
  const register = async ({ email, password1, role }) => {
    try {
      const allowedRoles = ["buyer", "seller"];
      const assignedRole = allowedRoles.includes(role) ? role : "buyer";

      // Создаем пользователя в Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password1);
      const uid = userCredential.user.uid;

      // Записываем данные пользователя в Firestore с назначенной ролью
      await setDoc(doc(db, "users", uid), {
        email,
        role: assignedRole,
      });

      // Отправляем письмо для подтверждения email
      await sendEmailVerification(userCredential.user);

      // Обновляем состояние пользователя в контексте
      setUser({
        uid,
        email,
        role: assignedRole,
        emailVerified: userCredential.user.emailVerified,
      });

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const login = async ({ identifier, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      const uid = userCredential.user.uid;
      const role = await fetchUserRole(uid);

      setUser({
        uid,
        email: userCredential.user.email,
        role: role || "buyer",
        emailVerified: userCredential.user.emailVerified,
      });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Добавил этот хук для удобства!
export const useAuth = () => React.useContext(AuthContext);