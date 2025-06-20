import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("../pages/Home"));
const My_profile = lazy(() => import("../pages/My_profile"));
const Destination = lazy(() => import("../pages/Destination"));

export const AppRoutes = () => (
  <Suspense fallback={<div>Загрузка страницы…</div>}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/my_profile" element={<My_profile />} />
      <Route path="/destination" element={<Destination />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

