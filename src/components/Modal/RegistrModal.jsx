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

export const RegistrModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
  } = useForm();

  const { register: registerUser } = useContext(AuthContext);

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
    return ok || "Пароль минимум 10 символов и 3 цифры";
  };

  const matchesPrev = (v) =>
    v === getValues().password1 || "Пароли не совпадают";

  const onSubmit = async (data) => {
    const success = await registerUser({
      email: data.email,
      password1: data.password1,
      role: data.role,
    });
    if (success) {
      onClose();
    } else {
      alert("Пользователь с таким email уже существует");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Trigger asChild><div /></Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)" }} />
        <Dialog.Positioner onClick={(e) => e.target === e.currentTarget && onClose()}>
          <Dialog.Content style={{ background: "#fff", borderRadius: 6, padding: 20, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Header><Dialog.Title>Регистрация</Dialog.Title></Dialog.Header>
              <Dialog.Body pb="4">
                <Stack gap="4" maxW="sm" align="flex-start">
                  <Field.Root invalid={!!errors.firstName}>
                    <Field.Label htmlFor="firstName">First Name</Field.Label>
                    <Input
                      id="firstName"
                      placeholder="First Name"
                      {...register("firstName", {
                        required: "Required",
                        validate: (v) =>
                          /^[A-Za-zА-Яа-яЁё\s-]+$/.test(v) || "Строковые символы",
                      })}
                    />
                    <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.lastName}>
                    <Field.Label htmlFor="lastName">Last Name</Field.Label>
                    <Input
                      id="lastName"
                      placeholder="Last Name"
                      {...register("lastName", {
                        required: "Required",
                        validate: (v) =>
                          /^[A-Za-zА-Яа-яЁё\s-]+$/.test(v) || "Строковые символы",
                      })}
                    />
                    <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.phone}>
                    <Field.Label htmlFor="phone">Phone</Field.Label>
                    <Input
                      id="phone"
                      placeholder="+7 (999) 999-99-99"
                      {...register("phone", {
                        required: "Phone is required",
                        validate: (v) => {
                          const digits = v.replace(/\D/g, "");
                          return (
                            digits.length === 11 && digits.startsWith("7") ||
                            "Введите корректный номер телефона"
                          );
                        },
                      })}
                    />
                    <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.email}>
                    <Field.Label htmlFor="email">
                      Email <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      {...register("email", {
                        required: "Required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Неверный email",
                        },
                      })}
                    />
                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                    <Field.HelperText>We'll never share your email.</Field.HelperText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.role}>
                    <Field.Label htmlFor="role">Роль</Field.Label>
                    <select
                      id="role"
                      {...register("role", {
                        required: "Выберите роль",
                      })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: errors.role ? "1px solid red" : "1px solid #ccc",
                      }}
                    >
                      <option value="">Выберите роль</option>
                      <option value="buyer">Покупатель</option>
                      <option value="seller">Продавец</option>
                    </select>
                    <Field.ErrorText>{errors.role?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.password1}>
                    <Field.Label htmlFor="password1">
                      Password <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      id="password1"
                      type="password"
                      placeholder="Enter your password"
                      {...register("password1", {
                        required: "Required",
                        validate: passwordValidation,
                      })}
                    />
                    <Field.ErrorText>{errors.password1?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.password2}>
                    <Field.Label htmlFor="password2">
                      Confirm Password <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      id="password2"
                      type="password"
                      placeholder="Confirm your password"
                      {...register("password2", {
                        required: "Required",
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
                <Button variant="outline" onClick={onClose} type="button">Отмена</Button>
                <Button type="submit">Зарегистрироваться</Button>
              </Dialog.Footer>
              <div style={{ marginTop: 10, textAlign: "center" }}>
                Уже есть аккаунт?{" "}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToLogin();
                  }}
                  style={{ color: "blue", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                >
                  Войти
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
