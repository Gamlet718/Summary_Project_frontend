// import React, { useState } from "react";
// import BookSet from "../components/BookSet/BookSet";
// import "./Packages.css";

// // Месяцы на русском
// const months = [
//   "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
//   "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
// ];

// // 10 примеров наборов книг
// const initialBookSets = [
//   {
//     id: 1,
//     title: "Русская классика",
//     author: "Ф. М. Достоевский",
//     description: "Лучшие произведения великого писателя.",
//     count: 5,
//     year: 1870,
//     country: "Россия",
//     price: 1200,
//     image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     id: 2,
//     title: "Мировая фантастика",
//     author: "Айзек Азимов",
//     description: "Сборник фантастических рассказов.",
//     count: 4,
//     year: 1950,
//     country: "США",
//     price: 950,
//     image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     id: 3,
//     title: "Поэзия Серебряного века",
//     author: "А. А. Блок",
//     description: "Стихи и поэмы.",
//     count: 3,
//     year: 1910,
//     country: "Россия",
//     price: 700,
//     image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     id: 4,
//     title: "Детективы Агаты Кристи",
//     author: "Агата Кристи",
//     description: "Лучшие детективные истории.",
//     count: 6,
//     year: 1935,
//     country: "Великобритания",
//     price: 1400,
//     image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     id: 5,
//     title: "Философия Запада",
//     author: "Ф. Ницше",
//     description: "Классика философской мысли.",
//     count: 2,
//     year: 1885,
//     country: "Германия",
//     price: 800,
//     image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     id: 6,
//     title: "Современная проза",
//     author: "Харуки Мураками",
//     description: "Лучшие романы XXI века.",
//     count: 3,
//     year: 2010,
//     country: "Япония",
//     price: 1100,
//     image: "https://images.unsplash.com/photo-1455885664032-7cbbda5d1a5a?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     id: 7,
//     title: "Фэнтези для подростков",
//     author: "Дж. К. Роулинг",
//     description: "Волшебный мир Гарри Поттера.",
//     count: 7,
//     year: 2007,
//     country: "Великобритания",
//     price: 2100,
//     image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     id: 8,
//     title: "Американская классика",
//     author: "Э. Хемингуэй",
//     description: "Романы и рассказы.",
//     count: 4,
//     year: 1940,
//     country: "США",
//     price: 900,
//     image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     id: 9,
//     title: "Французская литература",
//     author: "В. Гюго",
//     description: "Шедевры французской прозы.",
//     count: 3,
//     year: 1862,
//     country: "Франция",
//     price: 950,
//     image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     id: 10,
//     title: "Детская литература",
//     author: "А. Линдгрен",
//     description: "Любимые книги детства.",
//     count: 5,
//     year: 1960,
//     country: "Швеция",
//     price: 850,
//     image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80"
//   }
// ];

// function Packages() {
//   const [bookSets, setBookSets] = useState(initialBookSets);

//   // Текущий месяц
//   const now = new Date();
//   const monthName = months[now.getMonth()];

//   function handleEditBookSet(edited) {
//     setBookSets((sets) =>
//       sets.map((b) => (b.id === edited.id ? { ...edited } : b))
//     );
//   }

//   return (
//     <div className="packages-page">
//       <div className="month-label">{monthName}</div>
//       <h1 className="packages-title">Наборы книг авторов</h1>
//       <div className="booksets-list">
//         {bookSets.map((set) => (
//           <BookSet key={set.id} bookSet={set} onEdit={handleEditBookSet} />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Packages;