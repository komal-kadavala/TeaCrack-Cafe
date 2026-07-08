import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createReview, listReviews } from '../server/reviewStore.js';

test('review creation and listing work without Firebase credentials', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'teacracke-reviews-'));
  const tempFile = path.join(tempDir, 'reviews.json');

  process.env.REVIEWS_DATA_FILE = tempFile;
  process.env.FIREBASE_PROJECT_ID = '';
  process.env.FIREBASE_CLIENT_EMAIL = '';
  process.env.FIREBASE_PRIVATE_KEY = '';
  process.env.FIREBASE_SERVICE_ACCOUNT = '';

  try {
    const created = await createReview({
      name: 'Alice',
      rating: 5,
      comment: 'Excellent service!',
    });

    assert.equal(created.name, 'Alice');
    assert.equal(created.rating, 5);

    const persisted = await readFile(tempFile, 'utf8');
    assert.match(persisted, /Excellent service!/);

    const reviews = await listReviews();
    assert.ok(Array.isArray(reviews));
    assert.ok(reviews.some((review) => review.comment === 'Excellent service!'));
  } finally {
    delete process.env.REVIEWS_DATA_FILE;
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_SERVICE_ACCOUNT;
    await rm(tempDir, { recursive: true, force: true });
  }
});
