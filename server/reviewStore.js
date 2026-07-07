import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp as initializeFirebaseApp, cert, getApps as getFirebaseApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { sanitizeReviewInput, formatReviewDate } from '../src/services/reviewUtils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REVIEWS_FILE = path.join(__dirname, 'reviews.json');

let adminApp = null;
let memoryReviews = [];
let persistenceMode = 'memory';

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

  if (persistenceMode === 'memory') {
    return;
  }

  const reviewsFile = getReviewsDataFile();

  try {
    await fs.mkdir(path.dirname(reviewsFile), { recursive: true });
    await fs.writeFile(reviewsFile, JSON.stringify(reviews, null, 2), 'utf8');
  } catch (error) {
    if (error && (error.code === 'EROFS' || error.code === 'EPERM')) {
      persistenceMode = 'memory';
      console.warn('[reviews] File system is read-only; continuing with in-memory review store.', error);
      return;
    }

    console.error('[reviews] Unable to write local review store:', error);
  }
}

function getAdminApp() {
  if (adminApp) return adminApp;

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();

  console.log('========== Firebase Environment ==========');
  console.log('PROJECT_ID:', projectId || '(missing)');
  console.log('CLIENT_EMAIL:', clientEmail || '(missing)');
  console.log('PRIVATE_KEY_EXISTS:', !!privateKey);
  console.log('SERVICE_ACCOUNT_EXISTS:', !!serviceAccount);
  console.log('==========================================');

  const adminApps = Array.isArray(getFirebaseApps()) ? getFirebaseApps() : [];
  console.log('[reviews] admin app count', Array.isArray(adminApps) ? adminApps.length : 0);
  if (adminApps.length > 0) {
    adminApp = adminApps[0];
    return adminApp;
  }

  try {
    if (serviceAccount) {
      const parsed = JSON.parse(serviceAccount);
      adminApp = initializeFirebaseApp({
        credential: cert(parsed),
      });

      console.log('Firebase initialized using FIREBASE_SERVICE_ACCOUNT');
      return adminApp;
    }

    if (projectId && clientEmail && privateKey) {
      adminApp = initializeFirebaseApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

      console.log('Firebase initialized using individual environment variables');
      return adminApp;
    }

    console.warn('[reviews] Firebase Admin is not configured; using local review store.');
    return null;
  } catch (err) {
    console.error('Firebase initialization failed:', err);
    return null;
  }
}

function getFirestoreDb() {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
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

    const snapshot = await db
      .collection('reviews')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

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
    const doc = await db.collection('reviews').add(review);

    console.log('Saved review:', doc.id);

    return {
      id: doc.id,
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