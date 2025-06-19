import { Button, Dialog, Field, Input, Portal, Stack } from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { withMask } from "use-mask-input";

export const Demo = ({ isOpen, onClose }) => {
  const ref = useRef(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const passwordValidation = (v) => {
    const ok = v.length >= 10 && (v.match(/\d/g) || []).length >= 3;
    return ok || "Пароль минимум 10 символов и 3 цифры";
  };
  const matchesPrev = (v) =>
    v === getValues().password1 || "Пароли не совпадают";

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    onClose();
  });

  // Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Trigger asChild>
        <div />
      </Dialog.Trigger>

      <Portal>
        {/* затемнённый фон */}
        <Dialog.Backdrop
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
          }}
        />

        {/* ловим клик «мимо» Content */}
        <Dialog.Positioner
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <Dialog.Content
            style={{
              background: "#fff",
              borderRadius: 6,
              padding: 20,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <form onSubmit={onSubmit}>
              <Dialog.Header>
                <Dialog.Title>Dialog Header</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body pb="4">
                <Stack gap="4" maxW="sm" align="flex-start">
                  {/* First Name */}
                  <Field.Root invalid={!!errors.firstName}>
                    <Field.Label>First Name</Field.Label>
                    <Input
                      placeholder="First Name"
                      {...register("firstName", {
                        required: "Required",
                        validate: (v) =>
                          /^[A-Za-zА-Яа-яЁёs-]+$/.test(v) ||
                          "Строковые символы",
                      })}
                    />
                    <Field.ErrorText>
                      {errors.firstName?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  {/* Last Name */}
                  <Field.Root invalid={!!errors.lastName}>
                    <Field.Label>Last Name</Field.Label>
                    <Input
                      ref={ref}
                      placeholder="Last Name"
                      {...register("lastName", {
                        required: "Required",
                        validate: (v) =>
                          /^[A-Za-zА-Яа-яЁёs-]+$/.test(v) ||
                          "Строковые символы",
                      })}
                    />
                    <Field.ErrorText>
                      {errors.lastName?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  {/* Phone */}
                  <Field.Root invalid={!!errors.phone}>
                    <Field.Label>Phone</Field.Label>
                    <Input
                      placeholder="+7 (999) 999-99-99"
                      {...register("phone", {
                        required: "Phone is required",
                        validate: (v) => {
                          // убираем всё, кроме цифр
                          const digits = v.replace(/\D/g, "");
                          // ожидаем 11 цифр, начиная с '7'
                          return (
                            (digits.length === 11 && digits.startsWith("7")) ||
                            "Введите корректный номер телефона"
                          );
                        },
                      })}
                      ref={(el) => {
                        register("phone").ref(el);
                        withMask("+7 (999) 999-99-99")(el);
                      }}
                    />
                    <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
                  </Field.Root>

                  {/* Email */}
                  <Field.Root invalid={!!errors.email}>
                    <Field.Label>
                      Email <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
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
                    <Field.HelperText>
                      We'll never share your email.
                    </Field.HelperText>
                  </Field.Root>

                  {/* Password */}
                  <Field.Root invalid={!!errors.password1}>
                    <Field.Label>
                      Password <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...register("password1", {
                        required: "Required",
                        validate: passwordValidation,
                      })}
                    />
                    <Field.ErrorText>
                      {errors.password1?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  {/* Confirm Password */}
                  <Field.Root invalid={!!errors.password2}>
                    <Field.Label>
                      Confirm Password <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
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
                    <Field.ErrorText>
                      {errors.password2?.message}
                    </Field.ErrorText>
                  </Field.Root>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" onClick={onClose} type="button">
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button type="submit">Save</Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
