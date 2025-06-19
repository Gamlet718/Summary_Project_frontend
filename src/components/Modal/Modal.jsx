import { Button, Dialog, Field, Input, Portal, Stack } from "@chakra-ui/react";
import { useRef } from "react";
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

  const passwordValidation = (value) => {
    const isValid =
      value.length >= 10 && (value.match(/\d/g) || []).length >= 3;

    return isValid || "Пароль должен содержать минимум 10 символов и 3 цифры";
  };

  const matchesPreviousPassword = (value) => {
    const { password1 } = getValues();
    return value === password1 || "Пароли не совпадают";
  };

  const onSubmit = handleSubmit((data) => {
    console.log(data); // тут будут firstName, lastName и phone
    onClose();
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Trigger asChild>
        <div />
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <form onSubmit={onSubmit}>
              <Dialog.Header>
                <Dialog.Title>Dialog Header</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb="4">
                <Stack gap="4" maxW="sm" align="flex-start">
                  <Field.Root invalid={!!errors.firstName}>
                    <Field.Label>First Name</Field.Label>
                    <Input
                      placeholder="First Name"
                      {...register("firstName", {
                        required: "First name is required",
                        validate: (value) =>
                          /^[A-Za-zА-Яа-яЁёs-]+$/.test(value) ||
                          "Введите пожалуйста строковые значения",
                      })}
                    />
                    <Field.ErrorText>
                      {errors.firstName?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.lastName}>
                    <Field.Label>Last Name</Field.Label>
                    <Input
                      ref={ref}
                      placeholder="Last Name"
                      {...register("lastName", {
                        required: "Last name is required",
                        validate: (value) =>
                          /^[A-Za-zА-Яа-яЁёs-]+$/.test(value) ||
                          "Введите пожалуйста строковые значения",
                      })}
                    />
                    <Field.ErrorText>
                      {errors.lastName?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  {/* Добавляем поле для телефона */}
                  <Field.Root invalid={!!errors.phone}>
                    <Field.Label>Phone</Field.Label>
                    <Input
                      placeholder="+7 (999) 999-99-99"
                      {...register("phone", {
                        required: "Phone is required",
                        validate: (value) =>
                          /^(\+7) \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value) ||
                          "Введите корректный номер телефона в формате +7 (999) 999-99-99",
                      })}
                      ref={(el) => {
                        register("phone").ref(el);
                        withMask("+7 (999) 999-99-99")(el);
                      }}
                    />
                    <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root invalid={!!errors.email}>
                    <Field.Label>
                      Email <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      placeholder="Enter your email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Введите корректный адрес электронной почты",
                        },
                      })}
                    />
                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>{" "}
                    <Field.HelperText>
                      We'll never share your email.
                    </Field.HelperText>
                  </Field.Root>
                  <Field.Root invalid={!!errors.password1}>
                    <Field.Label>
                      Password <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...register("password1", {
                        required: "Password is required",
                        validate: passwordValidation,
                      })}
                    />
                    <Field.ErrorText>
                      {errors.password1?.message}
                    </Field.ErrorText>
                  </Field.Root>
                  <Field.Root invalid={!!errors.password2}>
                    <Field.Label>
                      Confirm Password <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...register("password2", {
                        required: "Confirm Password is required",
                        validate: {
                          matchesPreviousPassword: matchesPreviousPassword,
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
