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
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { useTranslation } from "react-i18next";
import "../responsive.css";

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, user } = useContext(AuthContext);
  const { t } = useTranslation();

  const [loginError, setLoginError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
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

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      emailRegex.test(value) ||
      t("validation_email_invalid", { defaultValue: "Введите корректный email" })
    );
  };

  const onSubmit = async (data) => {
    const success = await login({ identifier: data.identifier, password: data.password });
    if (success) {
      setLoginError("");
      onClose();
    } else {
      setLoginError(t("auth_invalid_credentials", { defaultValue: "Неверный email или пароль" }));
    }
  };

  const sendResetCode = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setResetError("");
      setResetStep(2);
    } catch (error) {
      setResetError(
        t("reset_error_send", {
          defaultValue: "Ошибка при отправке письма. Проверьте email.",
        })
      );
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Trigger asChild><div /></Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)" }} />
        <Dialog.Positioner onClick={(e) => e.target === e.currentTarget && onClose()}>
          <Dialog.Content
            className="auth-modal"
            style={{ background: "#fff", borderRadius: 6, padding: 20, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
          >
            {!showForgotPassword && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Dialog.Header>
                  <Dialog.Title>
                    {t("modal_login_title", { defaultValue: "Вход в систему" })}
                  </Dialog.Title>
                </Dialog.Header>

                <Dialog.Body pb="4">
                  <Stack gap="4" maxW="sm" align="flex-start">
                    <Field.Root invalid={!!errors.identifier}>
                      <Field.Label>{t("form_email_label", { defaultValue: "Email" })}</Field.Label>
                      <Input
                        placeholder={t("form_email_enter_placeholder", { defaultValue: "Введите email" })}
                        {...register("identifier", {
                          required: t("validation_required", { defaultValue: "Обязательное поле" }),
                          validate: validateEmail,
                        })}
                      />
                      <Field.ErrorText>{errors.identifier?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.password}>
                      <Field.Label>{t("form_password_label", { defaultValue: "Пароль" })}</Field.Label>
                      <Input
                        type="password"
                        placeholder={t("form_password_enter_placeholder", { defaultValue: "Введите пароль" })}
                        {...register("password", {
                          required: t("validation_password_required", { defaultValue: "Пароль обязателен" }),
                        })}
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
                      {t("auth_forgot_password", { defaultValue: "Забыли пароль?" })}
                    </button>
                  </div>

                  {user && (
                    <div style={{ marginTop: 15, fontWeight: "bold" }}>
                      {t("auth_your_role", { defaultValue: "Ваша роль:" })}{" "}
                      <span style={{ color: "green" }}>
                        {user.role || t("auth_role_unset", { defaultValue: "не назначена" })}
                      </span>
                    </div>
                  )}
                </Dialog.Body>

                <Dialog.Footer>
                  <Button variant="outline" onClick={onClose} type="button">
                    {t("btn_cancel", { defaultValue: "Отмена" })}
                  </Button>
                  <Button type="submit">
                    {t("btn_login", { defaultValue: "Войти" })}
                  </Button>
                </Dialog.Footer>

                <div style={{ marginTop: 10, textAlign: "center" }}>
                  {t("auth_no_account", { defaultValue: "Нет аккаунта?" })}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToRegister();
                    }}
                    style={{ color: "blue", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                  >
                    {t("btn_register", { defaultValue: "Зарегистрироваться" })}
                  </button>
                </div>
              </form>
            )}

            {showForgotPassword && (
              <div>
                <Dialog.Header>
                  <Dialog.Title>
                    {t("modal_reset_title", { defaultValue: "Восстановление пароля" })}
                  </Dialog.Title>
                </Dialog.Header>

                <Dialog.Body pb="4">
                  {resetStep === 1 && (
                    <>
                      <Field.Root invalid={!!resetError}>
                        <Field.Label>
                          {t("reset_enter_email_label", { defaultValue: "Введите email для восстановления" })}
                        </Field.Label>
                        <Input
                          placeholder={t("form_email_label", { defaultValue: "Email" })}
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                        {resetError && <Field.ErrorText>{resetError}</Field.ErrorText>}
                      </Field.Root>
                      <Button
                        mt={4}
                        onClick={() => {
                          if (validateEmail(resetEmail) !== true) {
                            setResetError(
                              t("validation_email_invalid", { defaultValue: "Введите корректный email" })
                            );
                            return;
                          }
                          sendResetCode(resetEmail);
                        }}
                      >
                        {t("reset_send_link", { defaultValue: "Отправить ссылку" })}
                      </Button>
                    </>
                  )}

                  {resetStep === 2 && (
                    <>
                      <div style={{ marginTop: 10, color: "green" }}>
                        {t("reset_success_message", {
                          defaultValue: "Ссылка для сброса пароля успешно отправлена на ваш email.",
                        })}
                      </div>
                      <Button
                        mt={4}
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetStep(1);
                          setResetEmail("");
                          setResetError("");
                        }}
                      >
                        {t("btn_close", { defaultValue: "Закрыть" })}
                      </Button>
                    </>
                  )}
                </Dialog.Body>

                <Dialog.Footer>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetStep(1);
                      setResetEmail("");
                      setResetError("");
                    }}
                    type="button"
                  >
                    {t("btn_cancel", { defaultValue: "Отмена" })}
                  </Button>
                </Dialog.Footer>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};