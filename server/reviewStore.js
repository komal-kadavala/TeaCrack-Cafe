import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { collection, getDocs, addDoc, query, orderBy, limit, getFirestore } from 'firebase/firestore';
import { sanitizeReviewInput, formatReviewDate } from '../src/services/reviewUtils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REVIEWS_FILE = path.join(__dirname, 'reviews.json');

let memoryReviews = [];
let persistenceMode = 'memory';
let firestoreDb = null;
let firestoreInitAttempted = false;

function getReviewsDataFile() {
  const configuredPath = process.env.REVIEWS_DATA_FILE;
  if (configuredPath) {
    return path.isAbsolute(configuredPath) ? configuredPath : path.resolve(process.cwd(), configuredPath);
  }

  if (process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT) {
    return path.join(os.tmpdir(), 'teacracke-reviews.json');
  }

  return DEFAULT_REVIEWS_FILE;
}

async function readLocalReviews() {
  if (memoryReviews.length > 0) {
    return memoryReviews;
  }

  const reviewsFile = getReviewsDataFile();

  try {
    const raw = await fs.readFile(reviewsFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryReviews = parsed;
      persistenceMode = 'file';
      return parsed;
    }
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      memoryReviews = [];
      persistenceMode = 'memory';
      return [];
    }

    if (error && (error.code === 'EROFS' || error.code === 'EPERM')) {
      persistenceMode = 'memory';
      console.warn('[reviews] File system is read-only; using in-memory review store.', error);
      return memoryReviews;
    }

    console.error('[reviews] Unable to read local review store:', error);
  }

  if (persistenceMode === 'memory') {
    return memoryReviews;
  }

  return [];
}

async function writeLocalReviews(reviews) {
  memoryReviews = reviews;

  const reviewsFile = getReviewsDataFile();

  try {
    await fs.mkdir(path.dirname(reviewsFile), { recursive: true });
    await fs.writeFile(reviewsFile, JSON.stringify(reviews, null, 2), 'utf8');
    persistenceMode = 'file';
  } catch (error) {
    if (error && (error.code === 'EROFS' || error.code === 'EPERM')) {
      persistenceMode = 'memory';
      console.warn('[reviews] File system is read-only; continuing with in-memory review store.', error);
      return;
    }

    persistenceMode = 'memory';
    console.error('[reviews] Unable to write local review store:', error);
  }
}

function getFirebaseConfig() {
  const config = {
    apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
  };

  const isConfigured = Boolean(config.apiKey && config.projectId);
  return isConfigured ? config : null;
}

function getFirestoreDb() {
  if (firestoreDb) {
    return firestoreDb;
  }

  if (firestoreInitAttempted) {
    return null;
  }

  firestoreInitAttempted = true;
  const config = getFirebaseConfig();

  if (!config) {
    console.warn('[reviews] Firebase web config is missing; using local review store.');
    return null;
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    firestoreDb = getFirestore(app);
    return firestoreDb;
  } catch (error) {
    console.error('[reviews] Firestore initialization failed:', error);
    return null;
  }
}

function isFirestoreFallbackError(error) {
  const code = error?.code ?? error?.status ?? error?.errorInfo?.code;
  const codeText = String(code ?? '').toLowerCase();
  const messageText = String(error?.message ?? '').toLowerCase();

  return (
    code === 5 ||
    codeText.includes('not_found') ||
    codeText.includes('not-found') ||
    codeText.includes('failed-precondition') ||
    codeText.includes('unavailable') ||
    codeText.includes('deadline-exceeded') ||
    codeText.includes('internal') ||
    messageText.includes('not_found') ||
    messageText.includes('not-found')
  );
}

export async function listReviews() {
  const db = getFirestoreDb();
  if (!db) {
    console.log('Loading reviews from local review store...');
    return readLocalReviews();
  }

  try {
    console.log('Loading reviews from Firestore...');

    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);

    console.log(`Loaded ${snapshot.size} reviews`);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date || formatReviewDate(doc.data().createdAt),
    }));
  } catch (error) {
    if (isFirestoreFallbackError(error)) {
      console.warn('[reviews] Firestore is unavailable; falling back to local review store.', error);
      return readLocalReviews();
    }

    throw error;
  }
}

export async function createReview(input) {
  console.log('Incoming review:', input);

  const validation = sanitizeReviewInput(input || {});

  console.log('Validation:', validation);

  const {
    sanitizedName,
    sanitizedRating,
    sanitizedComment,
    errors = [],
  } = validation || {};

  const safeErrors = Array.isArray(errors) ? errors : [];
  console.log('[reviews] validation error count', safeErrors.length);

  if (safeErrors.length > 0) {
    const err = new Error(safeErrors[0] || 'The review data is invalid.');
    err.statusCode = 400;
    throw err;
  }

  const db = getFirestoreDb();
  const createdAt = Date.now();

  const review = {
    name: sanitizedName,
    rating: sanitizedRating,
    comment: sanitizedComment,
    createdAt,
    date: formatReviewDate(createdAt),
  };

  console.log('Saving review:', review);

  if (!db) {
    const existingReviews = await readLocalReviews();
    const nextReviews = [{ id: `local-${createdAt}`, ...review }, ...existingReviews];
    await writeLocalReviews(nextReviews);
    console.log('Saved review locally');
    return {
      id: `local-${createdAt}`,
      ...review,
    };
  }

  try {
    const docRef = await addDoc(collection(db, 'reviews'), review);

    console.log('Saved review:', docRef.id);

    return {
      id: docRef.id,
      ...review,
    };
  } catch (error) {
    if (isFirestoreFallbackError(error)) {
      const existingReviews = await readLocalReviews();
      const nextReviews = [{ id: `local-${createdAt}`, ...review }, ...existingReviews];
      await writeLocalReviews(nextReviews);
      console.warn('[reviews] Firestore write failed, stored review locally.', error);
      return {
        id: `local-${createdAt}`,
        ...review,
      };
    }

    throw error;
  }
}