// // src/components/GoogleTranslateProvider/GoogleTranslateProvider.jsx
// import React, { useEffect } from "react";

// /**
//  * Загружает скрипт Google Website Translator и инициализирует переводчик.
//  * Язык страницы по умолчанию — 'ru'. Переводить можно на 'en' и обратно.
//  *
//  * Примечания:
//  * - Мы создаём скрытый контейнер #google_translate_element, чтобы инициализировать виджет.
//  * - Скрываем баннер и системные элементы переводчика через инлайн-CSS.
//  *
//  * @param {{ children: React.ReactNode }} props
//  * @returns {JSX.Element}
//  */
// export default function GoogleTranslateProvider({ children }) {
//   useEffect(() => {
//     // Устанавливаем <html lang="ru"> по умолчанию
//     if (typeof document !== "undefined") {
//       document.documentElement.lang = "ru";
//     }

//     // Если скрипт уже подключён — выходим
//     if (window.google && window.google.translate) {
//       initGoogleTranslate();
//       return;
//     }

//     // Глобальный колбэк, который вызовет Google при загрузке скрипта
//     window.googleTranslateElementInit = () => {
//       initGoogleTranslate();
//     };

//     // Подключаем скрипт Google Translate
//     const script = document.createElement("script");
//     script.src =
//       "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
//     script.async = true;
//     document.head.appendChild(script);

//     return () => {
//       // Удалять скрипт не обязательно, но можно по желанию
//     };
//   }, []);

//   return (
//     <>
//       {/* Скрытый контейнер для инициализации виджета */}
//       <div
//         id="google_translate_element"
//         style={{ position: "fixed", visibility: "hidden", pointerEvents: "none", height: 0, width: 0, overflow: "hidden" }}
//       />
//       {/* Стили, скрывающие баннер и визуальные элементы Google Translate */}
//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//             .goog-te-banner-frame.skiptranslate { display: none !important; }
//             body { top: 0 !important; }
//             #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
//             .goog-logo-link, .goog-te-gadget { display: none !important; }
//             .goog-te-combo { visibility: hidden !important; pointer-events: none !important; }
//           `,
//         }}
//       />
//       {children}
//     </>
//   );
// }

// /**
//  * Инициализация Google Translate с языком страницы 'ru' и доступными языками 'ru,en'.
//  * @returns {void}
//  */
// function initGoogleTranslate() {
//   try {
//     // eslint-disable-next-line no-undef
//     new google.translate.TranslateElement(
//       {
//         pageLanguage: "ru",
//         includedLanguages: "ru,en",
//         autoDisplay: false,
//         layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
//       },
//       "google_translate_element"
//     );
//   } catch (e) {
//     // no-op
//   }
// }