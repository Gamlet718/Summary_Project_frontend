import { Button, Dialog, Field, Input, Portal, Stack } from "@chakra-ui/react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { withMask } from "use-mask-input";

export const Demo = ({ isOpen, onClose }) => {
  const ref = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
