// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const register = async ({ email, password1 }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password1);
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
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
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
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
