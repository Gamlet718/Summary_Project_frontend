import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const PrivateRoute = ({ children, onRequireAuth }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const hasRequestedAuth = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !hasRequestedAuth.current) {
      hasRequestedAuth.current = true;
      console.log("PrivateRoute: calling onRequireAuth");
      onRequireAuth();
    }
    if (isAuthenticated) {
      hasRequestedAuth.current = false; // сбрасываем флаг при аутентификации
    }
  }, [isAuthenticated, onRequireAuth]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
};
