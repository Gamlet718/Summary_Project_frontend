// src/pages/Contact.jsx
import { Box, Heading, Text, Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();

  return (
    <Box as="section" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }} maxW="900px" mx="auto">
      {/* Заголовок страницы белыми буквами */}
      <Heading as="h1" size="xl" color="white" mb={{ base: 4, md: 6 }}>
        {t("page_contacts_title", { defaultValue: "Контакты" })}
      </Heading>

      {/* Блок контактов с адаптивом (колонка на телефоне, строка на планшете/десктопе) */}
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={{ base: 4, md: 8 }}
        align={{ base: "flex-start", md: "flex-start" }}
      >
        <Box
          flex="1"
          borderWidth="1px"
          borderColor="gray.700"
          borderRadius="md"
          p={{ base: 4, md: 5 }}
          bg="rgba(255,255,255,0.02)"
        >
          <Heading as="h2" size="md" mb={3} color="gray.100">
            {t("contacts_main_office_heading", {
              defaultValue: "Главный офис интернет‑магазина",
            })}
          </Heading>

          <Box mb={2}>
            <Text as="span" fontWeight="semibold" color="gray.200">
              {t("contacts_address_label", { defaultValue: "Адрес" })}:
            </Text>{" "}
            <Text as="span" color="gray.300">
              {t("contacts_address_value", {
                defaultValue:
                  "Россия, г. Москва, Варшавское шоссе, 1, БЦ «Панорама», офис 501, 115230",
              })}
            </Text>
          </Box>

          <Box>
            <Text as="span" fontWeight="semibold" color="gray.200">
              {t("contacts_phone_label", { defaultValue: "Телефон" })}:
            </Text>{" "}
            <Text as="span" color="gray.300">
              {t("contacts_phone_value", { defaultValue: "+7 (495) 123-45-67" })}
            </Text>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default Contact;