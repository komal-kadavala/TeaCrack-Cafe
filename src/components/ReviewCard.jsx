import React from 'react';

export default function ReviewCard({ name, rating, comment, date }) {
  // Generate star string
  const renderStars = (num) => {
    return '⭐'.repeat(num) + '☆'.repeat(5 - num);
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-name">{name}</div>
        <div className="review-date">{date}</div>
      </div>
      <div className="review-rating">{renderStars(rating)}</div>
      <div className="review-text">{comment}</div>
    </div>
  );
}
