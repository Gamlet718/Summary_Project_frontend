// src/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { PrivateRoute } from "../routes/PrivateRoute";

const Home = lazy(() => import("../pages/Home-Pages/Home"));
const My_profile = lazy(() => import("../pages/My_profile"));
const Market = lazy(() => import("../pages/Market/Market"));
const Packages = lazy(() => import("../pages/Packages/Packages"));
const Gallery = lazy(() => import("../pages/Gallery"));
const Contact = lazy(() => import("../pages/Contact"));
const Basket = lazy(() => import("../pages/Basket"));

export const AppRoutes = ({ onRequireAuth }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Загрузка пользователя...</div>;
  }

  return (
    <Suspense fallback={<div>Загрузка страницы…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Защищённые маршруты */}
        <Route
          path="/my_profile"
          element={
            <PrivateRoute onRequireAuth={onRequireAuth}>
              <My_profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/market"
          element={
            <PrivateRoute onRequireAuth={onRequireAuth}>
              <Market />
            </PrivateRoute>
          }
        />
        <Route
          path="/packages"
          element={
            <PrivateRoute onRequireAuth={onRequireAuth}>
              <Packages />
            </PrivateRoute>
          }
        />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/basket"
          element={
            <PrivateRoute onRequireAuth={onRequireAuth}>
              <Basket />
            </PrivateRoute>
          }
        />

        {/* Перенаправление для неизвестных маршрутов */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
