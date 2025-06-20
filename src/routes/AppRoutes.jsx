import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About-Us"));
const Destination = lazy(() => import("../pages/Destination"));

export const AppRoutes = () => (
  <Suspense fallback={<div>Загрузка страницы…</div>}>
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/about-us" element={<About />} />
      <Route path="/destination" element={<Destination />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

