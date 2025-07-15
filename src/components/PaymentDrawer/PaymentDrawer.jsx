// PaymentDrawer.jsx
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

const PaymentDrawer = ({ isOpen, onClose, totalSum }) => {
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
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Оплата заказа</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body>
              <Box as="form" display="flex" flexDirection="column" gap={4}>
                <Stack spacing={2}>
                  <Text>Номер карты</Text>
                  <Input placeholder="1234 5678 9012 3456" maxLength={19} />
                </Stack>
                <Stack direction="row" spacing={4}>
                  <Box flex={1}>
                    <Text>Срок действия</Text>
                    <Input placeholder="MM/YY" maxLength={5} />
                  </Box>
                  <Box flex={1}>
                    <Text>CVC</Text>
                    <Input placeholder="123" maxLength={4} />
                  </Box>
                </Stack>
                <Stack spacing={2}>
                  <Text>Имя держателя карты</Text>
                  <Input placeholder="Иван Иванов" />
                </Stack>
              </Box>
            </Drawer.Body>

            <Drawer.Footer
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "12px", 
                alignItems: "stretch" 
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
                Сумма к оплате: {totalSum.toFixed(2)} ₽
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <Button variant="outline" onClick={onClose}>
                  Отмена
                </Button>
                <Button colorScheme="blue" onClick={() => alert("Оплата проведена!")}>
                  Оплатить
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
