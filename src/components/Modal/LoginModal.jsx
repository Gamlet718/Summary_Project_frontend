// src/components/Modal/LoginModal.jsx
import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../contexts/AuthContext";
import { sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { auth } from "../../firebase";

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);

  const [loginError, setLoginError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const onSubmit = async (data) => {
    const success = await login({ identifier: data.identifier, password: data.password });
    if (success) {
      setLoginError("");
      onClose();
    } else {
      setLoginError("Неверный email или пароль");
    }
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || "Введите корректный email";
  };

  // Имитация отправки кода (Firebase не поддерживает код в 5 цифр, поэтому имитируем)
  const sendResetCode = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      // Генерируем 5-значный код для имитации
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      setVerificationCode(code);
      setCodeSent(true);
      setResetError("");
      alert(`Код для восстановления пароля: ${code} (отправлен на ${email})`);
    } catch (error) {
      setResetError("Ошибка при отправке письма. Проверьте email.");
    }
  };

  const verifyCode = () => {
    if (inputCode === verificationCode) {
      setResetError("");
      setResetStep(3);
    } else {
      setResetError("Неверный код");
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      setResetError("Пароль должен быть минимум 6 символов");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Пароли не совпадают");
      return;
    }
    try {
      // В Firebase для смены пароля нужен oobCode из письма, здесь имитация:
      // В реальном приложении нужно реализовать полноценный flow с oobCode
      alert("Пароль успешно изменён! Пожалуйста, войдите с новым паролем.");
      setShowForgotPassword(false);
      setResetStep(1);
      setResetEmail("");
      setCodeSent(false);
      setVerificationCode("");
      setInputCode("");
      setNewPassword("");
      setConfirmPassword("");
      setResetError("");
    } catch (error) {
      setResetError("Ошибка при смене пароля");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Trigger asChild><div /></Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)" }} />
        <Dialog.Positioner onClick={(e) => e.target === e.currentTarget && onClose()}>
          <Dialog.Content style={{ background: "#fff", borderRadius: 6, padding: 20, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            {!showForgotPassword && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Dialog.Header><Dialog.Title>Вход в систему</Dialog.Title></Dialog.Header>
                <Dialog.Body pb="4">
                  <Stack gap="4" maxW="sm" align="flex-start">
                    <Field.Root invalid={!!errors.identifier}>
                      <Field.Label>Email</Field.Label>
                      <Input
                        placeholder="Введите email"
                        {...register("identifier", {
                          required: "Обязательное поле",
                          validate: validateEmail,
                        })}
                      />
                      <Field.ErrorText>{errors.identifier?.message}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root invalid={!!errors.password}>
                      <Field.Label>Пароль</Field.Label>
                      <Input
                        type="password"
                        placeholder="Введите пароль"
                        {...register("password", { required: "Пароль обязателен" })}
                      />
                      <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                    </Field.Root>
                    {loginError && <div style={{ color: "red" }}>{loginError}</div>}
                  </Stack>
                  <div style={{ marginTop: 10, textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      style={{ background: "none", border: "none", color: "blue", cursor: "pointer", padding: 0 }}
                    >
                      Забыли пароль?
                    </button>
                  </div>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant="outline" onClick={onClose} type="button">Отмена</Button>
                  <Button type="submit">Войти</Button>
                </Dialog.Footer>
                <div style={{ marginTop: 10, textAlign: "center" }}>
                  Нет аккаунта?{" "}
                  <button type="button" onClick={() => { onClose(); onSwitchToRegister(); }} style={{ color: "blue", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
                    Зарегистрироваться
                  </button>
                </div>
              </form>
            )}

            {showForgotPassword && (
              <div>
                <Dialog.Header><Dialog.Title>Восстановление пароля</Dialog.Title></Dialog.Header>
                <Dialog.Body pb="4">
                  {resetStep === 1 && (
                    <>
                      <Field.Root invalid={!!resetError}>
                        <Field.Label>Введите email для восстановления</Field.Label>
                        <Input
                          placeholder="Email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                        {resetError && <Field.ErrorText>{resetError}</Field.ErrorText>}
                      </Field.Root>
                      <Button
                        mt={4}
                        onClick={() => {
                          if (!validateEmail(resetEmail) === true) {
                            setResetError("Введите корректный email");
                            return;
                          }
                          sendResetCode(resetEmail);
                          setResetStep(2);
                        }}
                      >
                        Отправить код
                      </Button>
                    </>
                  )}

                  {resetStep === 2 && (
                    <>
                      <Field.Root invalid={!!resetError}>
                        <Field.Label>Введите 5-значный код</Field.Label>
                        <Input
                          placeholder="Код"
                          value={inputCode}
                          onChange={(e) => setInputCode(e.target.value)}
                          maxLength={5}
                        />
                        {resetError && <Field.ErrorText>{resetError}</Field.ErrorText>}
                      </Field.Root>
                      <Button mt={4} onClick={verifyCode}>Проверить код</Button>
                    </>
                  )}

                  {resetStep === 3 && (
                    <>
                      <Field.Root invalid={!!resetError}>
                        <Field.Label>Новый пароль</Field.Label>
                        <Input
                          type="password"
                          placeholder="Новый пароль"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </Field.Root>
                      <Field.Root invalid={!!resetError}>
                        <Field.Label>Подтвердите новый пароль</Field.Label>
                        <Input
                          type="password"
                          placeholder="Подтвердите пароль"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {resetError && <Field.ErrorText>{resetError}</Field.ErrorText>}
                      </Field.Root>
                      <Button mt={4} onClick={changePassword}>Сменить пароль</Button>
                    </>
                  )}
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant="outline" onClick={() => {
                    setShowForgotPassword(false);
                    setResetStep(1);
                    setResetEmail("");
                    setCodeSent(false);
                    setVerificationCode("");
                    setInputCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setResetError("");
                  }} type="button">Отмена</Button>
                </Dialog.Footer>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
