// src/pages/Home.jsx
import React, { useState } from "react";
import { Box, Heading, Text, Button, Stack, Container } from "@chakra-ui/react";
import { LoginModal } from "../../components/Modal/LoginModal"; // при необходимости скорректируйте путь
import { useAuth } from "../../contexts/AuthContext";
import BookFacts from "../../components/BookFacts/BookFacts"; // при необходимости скорректируйте путь
import "./Home.css";

const Home = () => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Box className="home-hero">
        <Container maxW="4xl" className="home-container">
          <Box className="home-card">
            <Stack spacing={6} align="center" textAlign="center">
              <Heading as="h1" className="home-title">
                Добро пожаловать!
              </Heading>

              <Text className="home-subtitle">
                {isAuthenticated
                  ? "Окунитесь в мир знаний и вдохновения — выбирайте, читайте и делитесь любимыми историями вместе с нами."
                  : "Если хотите перейти к покупкам или продажам — войдите в систему или зарегистрируйтесь."}
              </Text>

              <Box as="blockquote" className="home-quote">
                «Книги — корабли мысли, странствующие по волнам времени.» — Фрэнсис Бэкон
              </Box>

              {!isAuthenticated && (
                <Button className="home-login-btn" onClick={() => setLoginOpen(true)}>
                  Войти
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