// src/components/Modal/RegistrModal.jsx
import React, { useEffect, useContext } from "react";
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
import { useTranslation } from "react-i18next";
import "../responsive.css";

export const RegistrModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
  } = useForm();

  const { register: registerUser } = useContext(AuthContext);
  const { t } = useTranslation();

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

  const passwordValidation = (v) => {
    const ok = v.length >= 10 && (v.match(/\d/g) || []).length >= 3;
    return (
      ok ||
      t("validation_password_requirements", {
        defaultValue: "Пароль минимум 10 символов и 3 цифры",
      })
    );
  };

  const matchesPrev = (v) =>
    v === getValues().password1 ||
    t("validation_password_mismatch", { defaultValue: "Пароли не совпадают" });

  const onSubmit = async (data) => {
    const success = await registerUser({
      email: data.email,
      password1: data.password1,
      role: data.role,
    });
    if (success) {
      onClose();
    } else {
      alert(
        t("error_user_exists", {
          defaultValue: "Пользователь с таким email уже существует",
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Header>
                <Dialog.Title>
                  {t("modal_register_title", { defaultValue: "Регистрация" })}
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body pb="4">
                <Stack gap="4" maxW="sm" align="flex-start">
                  <Field.Root invalid={!!errors.firstName}>
                    <Field.Label htmlFor="firstName">
                      {t("form_first_name_label", { defaultValue: "First Name" })}
                    </Field.Label>
                    <Input
                      id="firstName"
                      placeholder={t("form_first_name_placeholder", { defaultValue: "First Name" })}
                      {...register("firstName", {
                        required: t("validation_required", { defaultValue: "Required" }),
                        validate: (v) =>
                          /^[A-Za-zА-Яа-яЁё\s-]+$/.test(v) ||
                          t("validation_letters_only", { defaultValue: "Строковые символы" }),
                      })}
                    />
                    <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.lastName}>
                    <Field.Label htmlFor="lastName">
                      {t("form_last_name_label", { defaultValue: "Last Name" })}
                    </Field.Label>
                    <Input
                      id="lastName"
                      placeholder={t("form_last_name_placeholder", { defaultValue: "Last Name" })}
                      {...register("lastName", {
                        required: t("validation_required", { defaultValue: "Required" }),
                        validate: (v) =>
                          /^[A-Za-zА-Яа-яЁё\s-]+$/.test(v) ||
                          t("validation_letters_only", { defaultValue: "Строковые символы" }),
                      })}
                    />
                    <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.phone}>
                    <Field.Label htmlFor="phone">
                      {t("form_phone_label", { defaultValue: "Phone" })}
                    </Field.Label>
                    <Input
                      id="phone"
                      placeholder={t("form_phone_placeholder", { defaultValue: "+7 (999) 999-99-99" })}
                      {...register("phone", {
                        required: t("validation_phone_required", { defaultValue: "Phone is required" }),
                        validate: (v) => {
                          const digits = v.replace(/\D/g, "");
                          return (
                            (digits.length === 11 && digits.startsWith("7")) ||
                            t("validation_phone_invalid", { defaultValue: "Введите корректный номер телефона" })
                          );
                        },
                      })}
                    />
                    <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.email}>
                    <Field.Label htmlFor="email">
                      {t("form_email_label", { defaultValue: "Email" })} <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      id="email"
                      placeholder={t("form_email_placeholder", { defaultValue: "Enter your email" })}
                      {...register("email", {
                        required: t("validation_required", { defaultValue: "Required" }),
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: t("validation_email_invalid", { defaultValue: "Неверный email" }),
                        },
                      })}
                    />
                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                    <Field.HelperText>
                      {t("form_email_helper", { defaultValue: "We'll never share your email." })}
                    </Field.HelperText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.role}>
                    <Field.Label htmlFor="role">
                      {t("form_role_label", { defaultValue: "Роль" })}
                    </Field.Label>
                    <select
                      id="role"
                      {...register("role", {
                        required: t("validation_role_required", { defaultValue: "Выберите роль" }),
                      })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: errors.role ? "1px solid red" : "1px solid #ccc",
                      }}
                    >
                      <option value="">
                        {t("form_role_placeholder", { defaultValue: "Выберите роль" })}
                      </option>
                      <option value="buyer">
                        {t("form_role_buyer", { defaultValue: "Покупатель" })}
                      </option>
                      <option value="seller">
                        {t("form_role_seller", { defaultValue: "Продавец" })}
                      </option>
                    </select>
                    <Field.ErrorText>{errors.role?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.password1}>
                    <Field.Label htmlFor="password1">
                      {t("form_password_label", { defaultValue: "Password" })} <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      id="password1"
                      type="password"
                      placeholder={t("form_password_placeholder", { defaultValue: "Enter your password" })}
                      {...register("password1", {
                        required: t("validation_required", { defaultValue: "Required" }),
                        validate: passwordValidation,
                      })}
                    />
                    <Field.ErrorText>{errors.password1?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.password2}>
                    <Field.Label htmlFor="password2">
                      {t("form_password_confirm_label", { defaultValue: "Confirm Password" })} <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      id="password2"
                      type="password"
                      placeholder={t("form_password_confirm_placeholder", { defaultValue: "Confirm your password" })}
                      {...register("password2", {
                        required: t("validation_required", { defaultValue: "Required" }),
                        validate: {
                          matchesPrev,
                          validatePassword: passwordValidation,
                        },
                      })}
                    />
                    <Field.ErrorText>{errors.password2?.message}</Field.ErrorText>
                  </Field.Root>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer>
                <Button variant="outline" onClick={onClose} type="button">
                  {t("btn_cancel", { defaultValue: "Отмена" })}
                </Button>
                <Button type="submit">
                  {t("btn_register", { defaultValue: "Зарегистрироваться" })}
                </Button>
              </Dialog.Footer>

              <div style={{ marginTop: 10, textAlign: "center" }}>
                {t("auth_have_account", { defaultValue: "Уже есть аккаунт?" })}{" "}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToLogin();
                  }}
                  style={{ color: "blue", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                >
                  {t("auth_login", { defaultValue: "Войти" })}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};