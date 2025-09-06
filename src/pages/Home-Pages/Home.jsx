// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Box, Heading, Text, Button, Stack, Container } from "@chakra-ui/react";
import { LoginModal } from "../../components/Modal/LoginModal"; // при необходимости скорректируйте путь
import { useAuth } from "../../contexts/AuthContext";
import BookFacts from "../../components/BookFacts/BookFacts"; // при необходимости скорректируйте путь
import "./Home.css";
import { useTranslation } from "react-i18next";

const Home = () => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation(); // defaultNS = 'common'

  useEffect(() => {
    // Dev-only сидинг, чтобы не дергать API в проде/каждый импорт модуля
    if (process.env.NODE_ENV === "development") {
      fetch("http://localhost:3001/api/google-books/seed?force=1", {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => console.log("Seed OK:", data))
        .catch((error) => console.error("Seed error:", error));
    }
  }, []);

  return (
    <>
      <Box className="home-hero">
        <Container maxW="4xl" className="home-container">
          <Box className="home-card">
            <Stack spacing={6} align="center" textAlign="center">
              <Heading as="h1" className="home-title">
                {t("home.title", { defaultValue: "Добро пожаловать!" })}
              </Heading>

              <Text className="home-subtitle">
                {isAuthenticated
                  ? t("home.subtitle_auth", {
                      defaultValue:
                        "Окунитесь в мир знаний и вдохновения — выбирайте, читайте и делитесь любимыми историями вместе с нами."
                    })
                  : t("home.subtitle_guest", {
                      defaultValue:
                        "Если хотите перейти к покупкам или продажам — войдите в систему или зарегистрируйтесь."
                    })}
              </Text>

              <Box as="blockquote" className="home-quote">
                {t("home.quote", {
                  defaultValue:
                    "«Книги — корабли мысли, странствующие по волнам времени.» — Фрэнсис Бэкон"
                })}
              </Box>

              {!isAuthenticated && (
                <Button className="home-login-btn" onClick={() => setLoginOpen(true)}>
                  {t("home.login", { defaultValue: "Войти" })}
                </Button>
              )}
            </Stack>
          </Box>

          {/* Книга с эффектом перелистывания */}
          <BookFacts />
        </Container>
      </Box>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {}}
      />
    </>
  );
};

export default Home;