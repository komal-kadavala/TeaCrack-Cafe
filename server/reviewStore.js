import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { sanitizeReviewInput, formatReviewDate } from '../src/services/reviewUtils.js';

let adminApp = null;

function getAdminApp() {
  if (adminApp) return adminApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  console.log('========== Firebase Environment ==========');
  console.log('PROJECT_ID:', projectId);
  console.log('CLIENT_EMAIL:', clientEmail);
  console.log('PRIVATE_KEY_EXISTS:', !!privateKey);
  console.log('SERVICE_ACCOUNT_EXISTS:', !!serviceAccount);
  console.log('==========================================');

  if (admin.apps.length) {
    adminApp = admin.app();
    return adminApp;
  }

  try {
    if (serviceAccount) {
      const parsed = JSON.parse(serviceAccount);

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(parsed),
      });

      console.log('Firebase initialized using FIREBASE_SERVICE_ACCOUNT');
      return adminApp;
    }

    if (projectId && clientEmail && privateKey) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

      console.log('Firebase initialized using individual environment variables');
      return adminApp;
    }

    throw new Error(
      'Missing Firebase environment variables.'
    );
  } catch (err) {
    console.error('Firebase initialization failed:', err);
    throw err;
  }
}

export async function listReviews() {
  const db = getFirestore(getAdminApp());

  console.log('Loading reviews...');

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
  } = validation;

  if (errors.length) {
    const err = new Error(errors[0]);
    err.statusCode = 400;
    throw err;
  }

  const db = getFirestore(getAdminApp());

  const createdAt = Date.now();

  const review = {
    name: sanitizedName,
    rating: sanitizedRating,
    comment: sanitizedComment,
    createdAt,
    date: formatReviewDate(createdAt),
  };

  console.log('Saving review:', review);

  const doc = await db.collection('reviews').add(review);

  console.log('Saved review:', doc.id);

  return {
    id: doc.id,
    ...review,
  };
}