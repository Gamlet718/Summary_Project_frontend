// server/firebaseAdmin.js
/**
 * Инициализация Firebase Admin SDK для серверного доступа к Firestore.
 * Поддерживает 2 варианта:
 * - FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY (в .env)
 * - GOOGLE_APPLICATION_CREDENTIALS=./server/firebase-service-account.json (путь к JSON)
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function resolveKeyPath() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) return null;
  return path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

const hasTripleEnv =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

let appInited = false;

try {
  if (hasTripleEnv) {
    console.log('Firebase Admin: init via FIREBASE_* env vars');
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
    appInited = true;
  } else {
    const keyPath = resolveKeyPath();
    if (!keyPath) {
      console.error('Firebase Admin: GOOGLE_APPLICATION_CREDENTIALS не задан. Добавь в .env путь к JSON');
    } else if (!fs.existsSync(keyPath)) {
      console.error('Firebase Admin: файл ключа не найден по пути:', keyPath);
    } else {
      console.log('Firebase Admin: init via service account file:', keyPath);
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      initializeApp({ credential: cert(serviceAccount) });
      appInited = true;
    }
  }
} catch (e) {
  console.error('Firebase Admin init error:', e);
}

if (!appInited) {
  console.error('Firebase Admin не инициализирован — Firestore работать не будет.');
}

export const dbAdmin = getFirestore();