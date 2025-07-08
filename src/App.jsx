// src/App.jsx
import { useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import { HeaderBottom } from "./components/Header-Bottom/Header-bottom";
import "./components/Home/Home.css";
import { RegistrModal } from "./components/Modal/RegistrModal";
import { LoginModal } from "./components/Modal/LoginModal";
import { Box } from "@chakra-ui/react";
import { AppRoutes } from "./routes/AppRoutes";

// Импортируем CartProvider из контекста
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  const openLogin = () => {
    console.log("App: openLogin called");
    setRegisterOpen(false);
    setLoginOpen(true);
  };
  const openRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };
  const closeModals = () => {
    setLoginOpen(false);
    setRegisterOpen(false);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="home" id="home">
          <Header onSignUpClick={openRegister} onLoginClick={openLogin} />
          <HeaderBottom onRequireAuth={openLogin} />
          <RegistrModal
            isOpen={isRegisterOpen}
            onClose={closeModals}
            onSwitchToLogin={openLogin}
          />
          <LoginModal
            isOpen={isLoginOpen}
            onClose={closeModals}
            onSwitchToRegister={openRegister}
          />
          <Box as="main">
            <AppRoutes onRequireAuth={openLogin} />
          </Box>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
