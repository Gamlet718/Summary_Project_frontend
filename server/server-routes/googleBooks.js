// server/server-routes/googleBooks.js
/**
 * Интеграция Google Books:
 * - POST /api/google-books/seed?force=1 — загрузить до 30 RU книг, сохранить в Firestore и локально
 * - GET  /api/google-books/cached — отдать до 30 книг из Firestore без запроса к Google
 * - GET  /api/google-books/image-proxy?src=... — прокси картинок (решает проблемы с загрузкой изображений)
 * - POST /api/google-books/normalize-local — исправить уже сохраненные локально книги (картинки через прокси + жанры на русском)
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbAdmin } from '../firebaseAdmin.js';
import { readProducts, writeProducts } from '../utils/productsStorage.js';

const router = express.Router();

const FIRESTORE_COLLECTION = 'google_seed_books';
const OWNER_ID = 'google-seed';
const DEFAULT_LIMIT = 30;

/**
 * Стриппер HTML-тегов из описания.
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html = '') {
  return String(html).replace(/<[^>]*>/g, '').trim();
}

/**
 * Проверка наличия кириллицы в строке.
 * @param {string} s
 * @returns {boolean}
 */
function hasCyrillic(s = '') {
  return /[а-яё]/i.test(String(s));
}

/**
 * Маппинг категорий Google Books → Русские названия.
 * Если категория уже на русском — возвращает как есть.
 * @param {string[]|string|undefined} cats
 * @returns {string} категория на русском
 */
function mapCategoryToRu(cats) {
  let raw = '';
  if (Array.isArray(cats) && cats.length) raw = String(cats[0]);
  else if (typeof cats === 'string') raw = cats;
  else raw = '';

  const s = raw.trim();
  if (!s) return 'Книги';

  if (hasCyrillic(s)) return s;

  const low = s.toLowerCase();
  const tests = [
    [/juvenile|young adult|children/, 'Детская литература'],
    [/fiction|novel|literature/, 'Художественная литература'],
    [/non[-\s]?fiction/, 'Нон-фикшн'],
    [/computers?|programming|software|coding/, 'Компьютеры'],
    [/technology|engineering/, 'Технологии'],
    [/business|economics/, 'Бизнес'],
    [/science|mathematics|physics|chemistry|biology/, 'Наука'],
    [/history/, 'История'],
    [/art|design|photograph/, 'Искусство'],
    [/biography|autobiography/, 'Биографии'],
    [/health|fitness/, 'Здоровье'],
    [/self[-\s]?help|personal development/, 'Саморазвитие'],
    [/education|study aids/, 'Образование'],
    [/travel/, 'Путешествия'],
    [/religion|spirituality/, 'Религия'],
    [/philosophy/, 'Философия'],
    [/poetry/, 'Поэзия'],
    [/drama|theater/, 'Драма'],
    [/comics|graphic novels|manga/, 'Комиксы'],
    [/cooking|food|wine/, 'Кулинария'],
    [/sports?|recreation/, 'Спорт'],
    [/music/, 'Музыка'],
    [/reference|handbooks?/, 'Справочники'],
    [/language arts|linguistics|language/, 'Языкознание'],
    [/social science|sociology|political|politics/, 'Общественные науки'],
    [/law/, 'Право'],
    [/crime|true crime|criminology/, 'Криминалистика'],
    [/books?/, 'Книги'],
  ];

  for (const [re, ru] of tests) {
    if (re.test(low)) return ru;
  }
  return 'Книги';
}

/**
 * Выбор URL картинки из volumeInfo.imageLinks.
 * Возвращает исходный google-URL (https).
 * @param {any} volumeInfo
 * @returns {string} URL
 */
function pickRawImage(volumeInfo) {
  const links = volumeInfo?.imageLinks || {};
  let img =
    links.extraLarge ||
    links.large ||
    links.medium ||
    links.small ||
    links.thumbnail ||
    links.smallThumbnail ||
    '';
  if (img && img.startsWith('http:')) img = img.replace('http:', 'https:');
  return img || '';
}

/**
 * Построение URL прокси по оригинальной ссылке.
 * @param {string} original
 * @returns {string}
 */
function buildProxyUrl(original) {
  return `/api/google-books/image-proxy?src=${encodeURIComponent(original)}`;
}

/**
 * Преобразование Google volume → товар маркетплейса (без id).
 * Картинка переводится через прокси, категория — на русском.
 * @param {any} item
 * @returns {Object}
 */
function normalizeVolume(item) {
  const v = item?.volumeInfo || {};
  const s = item?.saleInfo || {};

  const name = String(v.title || 'Без названия').trim();

  const author = (v.authors && v.authors[0]) || 'Неизвестно';
  const descriptionSrc =
    stripHtml(v.description || '') ||
    `Книга из Google Books. Автор: ${author}.`;

  const categoryRu = mapCategoryToRu(v.categories);

  const price =
    (s?.listPrice && Number(s.listPrice.amount)) ||
    Math.round(300 + Math.random() * 1200);

  const quantity = Math.floor(5 + Math.random() * 20);
  const rawImg = pickRawImage(v);
  const image = rawImg ? buildProxyUrl(rawImg) : '';

  return {
    name,
    description: descriptionSrc,
    price,
    category: categoryRu,
    author,
    quantity,
    image,
    ownerId: OWNER_ID,
    source: 'google',
    googleVolumeId: item.id || null,
  };
}

/**
 * Запрос томов из Google Books (только русскоязычные).
 * @param {string} query
 * @returns {Promise<any[]>}
 */
async function fetchGoogleVolumes(query) {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY || '';
  const url = new URL('https://www.googleapis.com/books/v1/volumes');
  url.searchParams.set('q', query);
  url.searchParams.set('printType', 'books');
  url.searchParams.set('orderBy', 'relevance');
  url.searchParams.set('maxResults', '40');
  url.searchParams.set('langRestrict', 'ru'); // только русские книги
  if (apiKey) url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Books API error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return Array.isArray(json.items) ? json.items : [];
}

/**
 * Upsert книг в Firestore: docId = googleVolumeId
 * @param {Array<Object>} normalizedBooks
 * @returns {Promise<number>}
 */
async function upsertFirestoreBooks(normalizedBooks) {
  const col = dbAdmin.collection(FIRESTORE_COLLECTION);
  let added = 0;
  for (const book of normalizedBooks) {
    if (!book.googleVolumeId) continue;
    const docRef = col.doc(book.googleVolumeId);
    const snap = await docRef.get();
    if (!snap.exists) {
      await docRef.set({ ...book, createdAt: new Date().toISOString() });
      added++;
    }
  }
  return added;
}

/**
 * Чтение до limit книг из Firestore.
 * @param {number} limit
 * @returns {Promise<Array<Object>>}
 */
async function readFirestoreBooks(limit = DEFAULT_LIMIT) {
  const snap = await dbAdmin.collection(FIRESTORE_COLLECTION).limit(limit).get();
  const data = [];
  snap.forEach((d) => data.push(d.data()));
  return data;
}

/**
 * Синхронизировать книги из Firestore в локальные товары (без дублей).
 * @param {Array<Object>} books
 * @returns {Promise<number>}
 */
async function syncToLocalProducts(books) {
  const products = await readProducts();
  const existingGoogleIds = new Set(
    products.filter((p) => p.source === 'google' && p.googleVolumeId).map((p) => p.googleVolumeId)
  );
  let added = 0;
  for (const b of books) {
    if (b.googleVolumeId && existingGoogleIds.has(b.googleVolumeId)) continue;
    products.push({
      id: uuidv4(),
      name: b.name,
      description: b.description,
      price: Number(b.price),
      category: b.category,
      author: b.author || '',
      quantity: Number(b.quantity) || 0,
      image: b.image || '',
      ownerId: OWNER_ID,
      source: 'google',
      googleVolumeId: b.googleVolumeId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    added++;
  }
  if (added > 0) await writeProducts(products);
  return added;
}

/* ---------- Image Proxy ---------- */

/**
 * Хосты, разрешенные для проксирования картинок.
 */
const ALLOWED_IMAGE_HOSTS = new Set([
  'books.google.com',
  'books.googleusercontent.com',
  'lh3.googleusercontent.com',
]);

/**
 * Проверка, что URL картинки разрешён для прокси.
 * @param {string} src
 * @returns {URL|null}
 */
function validateImageSrc(src) {
  try {
    const u = new URL(src);
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    if (![...ALLOWED_IMAGE_HOSTS].some((host) => u.hostname.endsWith(host))) return null;
    return u;
  } catch {
    return null;
  }
}

// GET /api/google-books/image-proxy?src=...
router.get('/image-proxy', async (req, res) => {
  const src = String(req.query.src || '');
  const u = validateImageSrc(src);
  if (!u) {
    return res.status(400).send('Invalid image source');
  }

  // Таймаут на апстрим-запрос
  const controller = new AbortController();
  const timeoutMs = 8000;
  const t = setTimeout(() => controller.abort('Upstream timeout'), timeoutMs);

  try {
    const upstream = await fetch(u.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        Referer: 'https://books.google.com/',
      },
    });
    clearTimeout(t);

    if (!upstream.ok) {
      return res.status(502).send('Bad gateway');
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.status(200).send(buf);
  } catch (e) {
    clearTimeout(t);
    console.error('Image proxy error:', e);
    const isTimeout = String(e).includes('timeout') || String(e).includes('aborted');
    return res.status(isTimeout ? 504 : 500).send(isTimeout ? 'Proxy timeout' : 'Proxy error');
  }
});

/* ---------- Endpoints ---------- */

// POST /api/google-books/seed?force=1
router.post('/seed', async (req, res) => {
  const force = String(req.query.force || '') === '1';
  try {
    if (!force) {
      const cached = await readFirestoreBooks(DEFAULT_LIMIT);
      if (cached.length >= DEFAULT_LIMIT) {
        const addedLocal = await syncToLocalProducts(cached);
        return res.json({
          success: true,
          message: 'Использована кэш-копия из Firestore. Для принудительной перезагрузки добавь ?force=1',
          firestoreCount: cached.length,
          addedToLocal: addedLocal,
        });
      }
    }
    const items = await fetchGoogleVolumes('subject:fiction');
    const normalized = items.slice(0, DEFAULT_LIMIT).map(normalizeVolume);
    const addedToFirestore = await upsertFirestoreBooks(normalized);
    const cachedAfter = await readFirestoreBooks(DEFAULT_LIMIT);
    const addedLocal = await syncToLocalProducts(cachedAfter);
    res.json({
      success: true,
      message: 'Сохранено в Firestore и синхронизировано локально (RU контент, изображения через прокси)',
      firestoreAdded: addedToFirestore,
      firestoreCount: cachedAfter.length,
      addedToLocal: addedLocal,
    });
  } catch (e) {
    console.error('Seed error:', e);
    res.status(500).json({ success: false, message: 'Ошибка при загрузке/сохранении книг', error: e.message });
  }
});

// GET /api/google-books/cached
router.get('/cached', async (_req, res) => {
  try {
    const cached = await readFirestoreBooks(DEFAULT_LIMIT);
    res.json({ success: true, data: cached, count: cached.length });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Ошибка при чтении Firestore', error: e.message });
  }
});

/**
 * Разовая нормализация уже сохраненных локально книг из Google:
 * - категории → русские (не портим уже русские)
 * - изображения → через прокси (если это гугловский хост и не прокси ещё)
 */
router.post('/normalize-local', async (_req, res) => {
  try {
    const products = await readProducts();
    let updated = 0;
    const next = products.map((p) => {
      if (p.source !== 'google') return p;

      let changed = false;
      // Категория → RU
      const newCat = mapCategoryToRu(p.category);
      if (newCat && newCat !== p.category) {
        p.category = newCat;
        changed = true;
      }
      // Картинка → через прокси
      if (p.image && !p.image.startsWith('/api/google-books/image-proxy')) {
        try {
          const u = new URL(p.image);
          const allowed = [...ALLOWED_IMAGE_HOSTS].some((host) => u.hostname.endsWith(host));
          if (allowed) {
            p.image = buildProxyUrl(p.image);
            changed = true;
          }
        } catch {
          // ignore malformed URLs
        }
      }
      if (changed) {
        p.updatedAt = new Date().toISOString();
        updated++;
      }
      return p;
    });

    if (updated > 0) {
      await writeProducts(next);
    }

    res.json({ success: true, updated });
  } catch (e) {
    console.error('normalize-local error:', e);
    res.status(500).json({ success: false, message: 'Ошибка нормализации локальных книг', error: e.message });
  }
});

export default router;