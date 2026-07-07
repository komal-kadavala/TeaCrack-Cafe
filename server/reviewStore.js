import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp as initializeFirebaseApp, cert, getApps as getFirebaseApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { sanitizeReviewInput, formatReviewDate } from '../src/services/reviewUtils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REVIEWS_FILE = path.join(__dirname, 'reviews.json');

let adminApp = null;

function getReviewsDataFile() {
  const configuredPath = process.env.REVIEWS_DATA_FILE;
  if (configuredPath) {
    return path.isAbsolute(configuredPath) ? configuredPath : path.resolve(process.cwd(), configuredPath);
  }

  return DEFAULT_REVIEWS_FILE;
}

async function readLocalReviews() {
  const reviewsFile = getReviewsDataFile();

  try {
    const raw = await fs.readFile(reviewsFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return [];
    }

    console.error('[reviews] Unable to read local review store:', error);
    return [];
  }
}

async function writeLocalReviews(reviews) {
  const reviewsFile = getReviewsDataFile();
  await fs.mkdir(path.dirname(reviewsFile), { recursive: true });
  await fs.writeFile(reviewsFile, JSON.stringify(reviews, null, 2), 'utf8');
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

    console.warn('[reviews] Firebase Admin is not configured; using local JSON review store.');
    return null;
  } catch (err) {
    console.error('Firebase initialization failed:', err);
    throw err;
  }
}

function getFirestoreDb() {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

export async function listReviews() {
  const db = getFirestoreDb();
  if (!db) {
    console.log('Loading reviews from local file store...');
    return readLocalReviews();
  }

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

  const doc = await db.collection('reviews').add(review);

  console.log('Saved review:', doc.id);

  return {
    id: doc.id,
    ...review,
  };
}