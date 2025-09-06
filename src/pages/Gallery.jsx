// src/pages/Gallery.jsx
import { Box, Heading, Text, SimpleGrid, Link, Image, VisuallyHidden } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const galleryItems = [
  {
    key: "gallery_item_1_title",
    defaultTitle: "«Офелия»",
    url: "https://ria.ru/images/82689/17/826891757.jpg",
  },
  {
    key: "gallery_item_2_title",
    defaultTitle: "Дэвид Гаррик в роли Ричарда III», Уильям Хогарт",
    url: "https://avatars.mds.yandex.net/i?id=6288c42668d5c999ee86efcde33c8b92-5194713-images-thumbs&n=13",
  },
  {
    key: "gallery_item_3_title",
    defaultTitle: "«Дездемона», Родольфо Амоедо",
    url: "https://avatars.mds.yandex.net/i?id=dc0f90aac9068b636837d05c734b85f5_l-12523274-images-thumbs&n=13",
  },
  {
    key: "gallery_item_4_title",
    defaultTitle: "«Ромео и Джульетта», Фрэнк Бернард Дикси",
    url: "https://avatars.mds.yandex.net/i?id=5fe466cf9c28b0c5544b583348799a18_l-5130185-images-thumbs&n=13",
  },
  {
    key: "gallery_item_5_title",
    defaultTitle: "«Сон в летнюю ночь», Эдвин Ландсир",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Study_for_The_Quarrel_of_Oberon_and_Titania.jpg/960px-Study_for_The_Quarrel_of_Oberon_and_Titania.jpg",
  },
  {
    key: "gallery_item_6_title",
    defaultTitle: "«Король Лир», Эдвин Остин Эбби",
    url: "https://avatars.mds.yandex.net/i?id=86cf98d89512ea069f2734f6f03d826b4925aa41-16974973-images-thumbs&n=13",
  },
  {
    key: "gallery_item_7_title",
    defaultTitle: "«Миранда и Буря», Джон Уильям Уотерхаус",
    url: "https://i.pinimg.com/originals/c4/32/65/c432653ec5eea41ab48b13ff65f94c13.jpg",
  },
  {
    key: "gallery_item_8_title",
    defaultTitle: "«Брут и призрак Цезаря», Уильям Блейк.",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Brutus_and_Caesar%27s_Ghost%2C_illustration_to_%27Julius_Caesar%27_IV%2C_iii_by_William_Blake.jpg",
  },
  {
    key: "gallery_item_9_title",
    defaultTitle: "«Иван Грозный и сын его Иван» Ильи Репина",
    url: "https://i.pinimg.com/736x/96/fb/22/96fb22dd5ec0059439deebaf04c6ab01.jpg",
  },
  {
    key: "gallery_item_10_title",
    defaultTitle: "«Царевна-Лебедь» Михаила Врубеля",
    url: "https://avatars.mds.yandex.net/i?id=9fd9c330bc12215453e22deec1cf3192_l-3780431-images-thumbs&n=13",
  },
];

const Gallery = () => {
  const { t } = useTranslation();

  return (
    <Box as="section" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }} maxW="1200px" mx="auto">
      {/* Заголовок страницы белыми буквами */}
      <Heading as="h1" size="xl" color="white" mb={{ base: 4, md: 6 }}>
        {t("page_gallery_title", { defaultValue: "Галерея" })}
      </Heading>

      {/* Сетка с адаптивом для телефона/планшета/десктопа */}
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 3, lg: 5 }}
        spacing={4}
      >
        {galleryItems.map((item, idx) => {
          const title = t(item.key, { defaultValue: item.defaultTitle });
          return (
            <Box key={idx}>
              {/* Заголовок над картинкой */}
              <Text
                fontWeight="semibold"
                fontSize={{ base: "md", md: "lg" }}
                mb={2}
                color="gray.200"
                noOfLines={2}
                minH="48px"
              >
                {title}
              </Text>

              {/* Ссылка на картинку (открывается в новой вкладке) */}
              <Link href={item.url} isExternal aria-label={title}>
                <Box
                  overflow="hidden"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.700"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  transition="all 0.2s ease"
                >
                  <Image
                    src={item.url}
                    alt={title}
                    width="100%"
                    height="200px"
                    objectFit="cover"
                  />
                </Box>
              </Link>
            </Box>
          );
        })}
      </SimpleGrid>

      <VisuallyHidden>
        {/* На случай отсутствия переводов — запасные описания */}
        {galleryItems.map((item, i) => (
          <span key={i}>{t(item.key, { defaultValue: item.defaultTitle })}</span>
        ))}
      </VisuallyHidden>
    </Box>
  );
};

export default Gallery;