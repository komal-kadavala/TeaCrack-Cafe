import React, { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import ReviewCard from '../components/ReviewCard';
import { sanitizeReviewInput, formatReviewDate, getReviewFingerprint } from '../services/reviewUtils';

const API_URL = import.meta.env.VITE_API_URL || '/api/reviews';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useScrollReveal(reviews);

  const fetchReviews = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Unable to fetch reviews');
      const nextReviews = await response.json();
      setReviews(nextReviews);
    } catch (error) {
      console.error('Unable to load reviews:', error);
      setMessage({ text: 'We could not load reviews right now. Please try again shortly.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = sanitizeReviewInput({
      name,
      rating,
      comment,
    });
    const {
      sanitizedName,
      sanitizedRating,
      sanitizedComment,
      errors = [],
    } = validation || {};

    const safeErrors = Array.isArray(errors) ? errors : [];
    console.log('[reviews] validation error count', safeErrors.length);

    if (safeErrors.length > 0) {
      showMsg(safeErrors[0], 'error');
      return;
    }

    const submissionFingerprint = getReviewFingerprint({
      name: sanitizedName,
      rating: sanitizedRating,
      comment: sanitizedComment,
    });

    const duplicate = reviews.some((review) => getReviewFingerprint(review) === submissionFingerprint);
    if (duplicate) {
      showMsg('This review appears to be a duplicate. Please try a different comment.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sanitizedName,
          rating: sanitizedRating,
          comment: sanitizedComment,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Unable to save review');
      }

      const newReview = await response.json();
      setReviews((prevReviews) => [newReview, ...prevReviews]);
      showMsg('✅ Review posted successfully! Thank you 🍵', 'success');
      resetForm();
    } catch (error) {
      console.error('Unable to save review:', error);
      showMsg(error.message || 'We could not save your review right now. Please try again shortly.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setComment('');
    setRating(0);
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    window.clearTimeout(showMsg.timeout);
    showMsg.timeout = window.setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const reviewList = Array.isArray(reviews) ? reviews : [];
  const reviewCount = reviewList.length;
  console.log('[reviews] current review count', reviewCount);

  return (
    <section id="feedback" style={{ minHeight: '100vh', paddingTop: '140px' }}>
      <div className="container">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '52px' }}>
          <p className="section-label">Your Voice Matters</p>
          <h2 className="section-title">Leave a Review</h2>
          <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#666', fontSize: '1.15rem', marginTop: '-24px' }}>
            See what our customers say and share your experience.
          </p>
        </div>

        <div className="reviews-layout">
          <div className="reveal reviews-list-section">
            <h3 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '24px' }}>What People Say</h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                Loading reviews from the database...
              </div>
            ) : reviewCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontStyle: 'italic' }}>
                Be the first to leave a review!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviewList.slice(0, visibleCount).map((r, idx) => (
                  <ReviewCard
                    key={r.id || idx}
                    name={r.name}
                    rating={r.rating}
                    comment={r.comment}
                    date={r.date}
                  />
                ))}

                {reviewCount > visibleCount && (
                  <button
                    onClick={handleLoadMore}
                    className="btn btn-outline"
                    style={{ alignSelf: 'center', marginTop: '16px' }}
                  >
                    Load More Reviews
                  </button>
                )}
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '2px dashed rgba(26,58,58,0.15)', margin: '20px 0' }} />

          <div className="reveal review-form-card" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <h3 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '24px' }}>Write Your Review</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Raj Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="star-rating-container" style={{ justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        transform: (hoverRating || rating) >= star ? 'scale(1.2)' : 'scale(1)',
                        opacity: (hoverRating || rating) >= star ? '1' : '0.35',
                        display: 'inline-block',
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Experience</label>
                <textarea
                  rows="4"
                  className="form-input"
                  placeholder="Tell others what you loved..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.25rem', letterSpacing: '3px' }}
                disabled={submitting}
              >
                {submitting ? 'POSTING...' : 'POST REVIEW →'}
              </button>

              {message.text && (
                <div
                  style={{
                    marginTop: '14px',
                    textAlign: 'center',
                    color: message.type === 'error' ? 'var(--red)' : 'var(--teal)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                  }}
                >
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
