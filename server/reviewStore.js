import admin from 'firebase-admin';
import { sanitizeReviewInput, formatReviewDate } from '../src/services/reviewUtils.js';

let adminApp = null;

function getAdminApp() {
  if (adminApp) return adminApp;

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccount) {
    try {
      const parsedServiceAccount = JSON.parse(serviceAccount);
      adminApp = admin.apps.length
        ? admin.app()
        : admin.initializeApp({
            credential: admin.credential.cert(parsedServiceAccount),
            projectId: parsedServiceAccount.project_id || projectId,
          });
      return adminApp;
    } catch (error) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT payload:', error);
      throw new Error('Invalid Firebase service account configuration.');
    }
  }

  if (clientEmail && privateKey && projectId) {
    adminApp = admin.apps.length
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert({
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
  const db = admin.firestore(app);
  const snapshot = await db.collection('reviews').orderBy('createdAt', 'desc').limit(50).get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date || formatReviewDate(doc.data().createdAt),
  }));
}

export async function createReview(input) {
  const app = getAdminApp();
  const db = admin.firestore(app);
  const { sanitizedName, sanitizedRating, sanitizedComment, errors } = sanitizeReviewInput(input);

  if (errors.length > 0) {
    const error = new Error(errors[0]);
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
