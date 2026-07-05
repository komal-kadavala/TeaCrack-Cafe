import { sanitizeReviewInput, formatReviewDate, getReviewFingerprint } from '../src/services/reviewUtils.js';

const sanitized = sanitizeReviewInput({ name: '  Alice  ', rating: 4, comment: 'Excellent service!' });
const testErrors = Array.isArray(sanitized.errors) ? sanitized.errors : [];
console.log('[tests] validation error count', testErrors.length);

if (!sanitized.sanitizedName || sanitized.sanitizedName !== 'Alice') {
  throw new Error('Name sanitization failed');
}

if (sanitized.sanitizedRating !== 4) {
  throw new Error('Rating sanitization failed');
}

if (testErrors.length > 0) {
  throw new Error('Expected no validation errors');
}

const formatted = formatReviewDate(1710000000000);
if (!formatted) {
  throw new Error('Date formatting failed');
}

const fingerprint = getReviewFingerprint({ name: 'Alice', rating: 4, comment: 'Excellent service!' });
if (!fingerprint.includes('alice')) {
  throw new Error('Fingerprint generation failed');
}

console.log('reviewUtils checks passed');
