import React, { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import ReviewCard from '../components/ReviewCard';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [visibleCount, setVisibleCount] = useState(5); // Show 5 reviews initially
  const [loading, setLoading] = useState(true);

  useScrollReveal(reviews);

  const API_URL = 'http://localhost:5000/api/reviews';

  // Load reviews from API database
  const fetchReviews = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("API error fetching reviews:", error);
      // Fail-safe load from localStorage if API is unavailable
      const storedReviews = localStorage.getItem('teacrack_reviews');
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showMsg('Please enter your name.', 'error');
      return;
    }
    if (rating === 0) {
      showMsg('Please select a star rating.', 'error');
      return;
    }
    if (!comment.trim()) {
      showMsg('Please write something about your experience.', 'error');
      return;
    }

    const reviewData = {
      name: name.trim(),
      rating,
      comment: comment.trim()
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) throw new Error('API server rejected the post');
      
      const newReview = await response.json();
      
      // Update state in real-time (prepend new review to list)
      setReviews((prevReviews) => [newReview, ...prevReviews]);
      
      showMsg('✅ Review posted successfully! Thank you 🍵', 'success');
      resetForm();
    } catch (error) {
      console.error("API error saving review:", error);
      showMsg('Database connection error. Unable to post review.', 'error');
    }
  };

  const resetForm = () => {
    setName('');
    setComment('');
    setRating(0);
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  return (
    <section id="feedback" style={{ minHeight: '100vh', paddingTop: '140px' }}>
      <div className="container">
        
        {/* Page Heading & Subtitle */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '52px' }}>
          <p className="section-label">Your Voice Matters</p>
          <h2 className="section-title">Leave a Review</h2>
          <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#666', fontSize: '1.15rem', marginTop: '-24px' }}>
            See what our customers say and share your experience.
          </p>
        </div>

        {/* Reviews Layout Container */}
        <div className="reviews-layout">
          
          {/* 1. What People Say - Existing Reviews First */}
          <div className="reveal reviews-list-section">
            <h3 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '24px' }}>What People Say</h3>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                Loading reviews from database...
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontStyle: 'italic' }}>
                Be the first to leave a review!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.slice(0, visibleCount).map((r, idx) => (
                  <ReviewCard 
                    key={r.id || idx}
                    name={r.name}
                    rating={r.rating}
                    comment={r.comment}
                    date={r.date}
                  />
                ))}
                
                {/* Load More Pagination */}
                {reviews.length > visibleCount && (
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

          {/* 2. Write Your Review - Form at the Bottom */}
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
                        display: 'inline-block'
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
              >
                POST REVIEW →
              </button>

              {message.text && (
                <div 
                  style={{ 
                    marginTop: '14px', 
                    textAlign: 'center', 
                    color: message.type === 'error' ? 'var(--red)' : 'var(--teal)', 
                    fontWeight: 700, 
                    fontSize: '0.95rem' 
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
