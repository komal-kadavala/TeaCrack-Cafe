const MAX_NAME_LENGTH = 60;
const MAX_COMMENT_LENGTH = 500;

function stripHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeReviewInput({ name, rating, comment }) {
  const sanitizedName = stripHtml(name).slice(0, MAX_NAME_LENGTH);
  const sanitizedComment = stripHtml(comment).slice(0, MAX_COMMENT_LENGTH);
  const parsedRating = Number(rating);
  const isValidRating = Number.isInteger(parsedRating) && parsedRating >= 1 && parsedRating <= 5;

  const errors = [];

  if (!sanitizedName) {
    errors.push('Please enter your name.');
  }

  if (!isValidRating) {
    errors.push('Please select a rating from 1 to 5 stars.');
  }

  if (!sanitizedComment) {
    errors.push('Please write a review comment.');
  } else if (sanitizedComment.length < 5) {
    errors.push('Your comment should be at least 5 characters long.');
  }

  return {
    sanitizedName,
    sanitizedRating: isValidRating ? parsedRating : 0,
    sanitizedComment,
    errors,
  };
}

export function formatReviewDate(timestamp = Date.now()) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function getReviewFingerprint(review) {
  return `${review.name}|${review.rating}|${review.comment}`.toLowerCase();
}
