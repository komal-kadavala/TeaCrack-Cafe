import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { sanitizeReviewInput, formatReviewDate } from '../src/services/reviewUtils.js';

let adminApp = null;

function getAdminApp() {
  if (adminApp) return adminApp;

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  console.log('[reviews] Firebase env check', {
    hasProjectId: Boolean(projectId),
    hasClientEmail: Boolean(clientEmail),
    hasPrivateKey: Boolean(privateKey),
    hasServiceAccount: Boolean(serviceAccount),
  });

  if (admin.getApps().length > 0) {
    adminApp = admin.getApp();
    return adminApp;
  }

  if (serviceAccount) {
    try {
      const parsedServiceAccount = JSON.parse(serviceAccount);
      adminApp = admin.initializeApp({
        credential: admin.cert(parsedServiceAccount),
        projectId: parsedServiceAccount.project_id || projectId,
      });
      return adminApp;
    } catch (error) {
      console.error('[reviews] Invalid FIREBASE_SERVICE_ACCOUNT payload:', error);
      throw new Error('Invalid Firebase service account configuration.');
    }
  }

  if (clientEmail && privateKey && projectId) {
    adminApp = admin.initializeApp({
      credential: admin.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return adminApp;
  }

  throw new Error('Firebase Admin is not configured. Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY or FIREBASE_SERVICE_ACCOUNT.');
}

export async function listReviews() {
  const app = getAdminApp();
  const db = getFirestore(app);
  const snapshot = await db.collection('reviews').orderBy('createdAt', 'desc').limit(50).get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date || formatReviewDate(doc.data().createdAt),
  }));
}

export async function createReview(input) {
  console.log('[reviews] createReview invoked with input:', input);
  const app = getAdminApp();
  const db = getFirestore(app);

  const normalizedInput = input && typeof input === 'object' ? input : {};
  console.log('[reviews] normalized input payload:', normalizedInput);

  const validation = sanitizeReviewInput(normalizedInput || {});
  console.log('[reviews] validation result:', validation);

  const {
    sanitizedName,
    sanitizedRating,
    sanitizedComment,
    errors = [],
  } = validation || {};

  const safeErrors = Array.isArray(errors) ? errors : [];
  console.log('[reviews] validation errors:', safeErrors);

  if (safeErrors.length > 0) {
    const error = new Error(safeErrors[0] || 'The review data is invalid.');
    error.statusCode = 400;
    throw error;
  }

  const createdAt = Date.now();
  const newReview = {
    name: sanitizedName,
    rating: sanitizedRating,
    comment: sanitizedComment,
    date: formatReviewDate(createdAt),
    createdAt,
  };

  const docRef = await db.collection('reviews').add(newReview);
  return { id: docRef.id, ...newReview };
}
