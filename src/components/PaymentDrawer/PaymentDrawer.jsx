// src/components/PaymentDrawer.jsx
"use client";

import React from "react";
import {
  Button,
  CloseButton,
  Drawer,
  Portal,
  Box,
  Stack,
  Input,
  Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import "../responsive.css";

const PaymentDrawer = ({ isOpen, onClose, totalSum }) => {
  const { t } = useTranslation();

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={({ open }) => !open && onClose()}
      placement="end"
      size="md"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content className="payment-drawer">
            <Drawer.Header>
              <Drawer.Title>
                {t("payment_title", { defaultValue: "Оплата заказа" })}
              </Drawer.Title>
            </Drawer.Header>

            <Drawer.Body>
              <Box as="form" display="flex" flexDirection="column" gap={4}>
                <Stack spacing={2}>
                  <Text>{t("payment_card_number", { defaultValue: "Номер карты" })}</Text>
                  <Input
                    placeholder={t("payment_card_number_placeholder", { defaultValue: "1234 5678 9012 3456" })}
                    maxLength={19}
                  />
                </Stack>
                <Stack direction="row" spacing={4}>
                  <Box flex={1}>
                    <Text>{t("payment_expiry", { defaultValue: "Срок действия" })}</Text>
                    <Input placeholder={t("payment_expiry_placeholder", { defaultValue: "MM/YY" })} maxLength={5} />
                  </Box>
                  <Box flex={1}>
                    <Text>{t("payment_cvc", { defaultValue: "CVC" })}</Text>
                    <Input placeholder={t("payment_cvc_placeholder", { defaultValue: "123" })} maxLength={4} />
                  </Box>
                </Stack>
                <Stack spacing={2}>
                  <Text>{t("payment_cardholder", { defaultValue: "Имя держателя карты" })}</Text>
                  <Input placeholder={t("payment_cardholder_placeholder", { defaultValue: "Иван Иванов" })} />
                </Stack>
              </Box>
            </Drawer.Body>

            <Drawer.Footer
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                alignItems: "stretch",
              }}
            >
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "1.25rem",
                  color: "#454444",
                  textAlign: "center",
                }}
              >
                {t("payment_total", {
                  defaultValue: "Сумма к оплате: {{sum}} ₽",
                  sum: totalSum.toFixed(2),
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <Button variant="outline" onClick={onClose}>
                  {t("btn_cancel", { defaultValue: "Отмена" })}
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() =>
                    alert(t("payment_success", { defaultValue: "Оплата проведена!" }))
                  }
                >
                  {t("payment_pay", { defaultValue: "Оплатить" })}
                </Button>
              </div>
            </Drawer.Footer>

            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" position="absolute" top="8px" right="8px" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default PaymentDrawer;