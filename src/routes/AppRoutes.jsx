import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("../pages/Home"));
const My_profile = lazy(() => import("../pages/My_profile"));
const Market = lazy(() => import("../pages/Market"));
const Packages = lazy(() => import("../pages/Packages"));
const Gallery = lazy(() => import("../pages/Gallery"));
const Contact = lazy(() => import("../pages/Contact"));
const Basket = lazy(() => import("../pages/Basket"));

export const AppRoutes = () => (
  <Suspense fallback={<div>Загрузка страницы…</div>}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/my_profile" element={<My_profile />} />
      <Route path="/market" element={<Market />} />
      <Route path="/packages" element={<Packages />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/basket" element={<Basket />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);
