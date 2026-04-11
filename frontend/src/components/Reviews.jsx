import { useState, useEffect } from 'react';
import { createReview, fetchReviews } from '../api/auth.js';
import InlineNotice from './InlineNotice.jsx';
import { getStoredToken } from '../lib/authStorage.js';

function Stars({ rating, onRate }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate && onRate(star)}
          disabled={!onRate}
          className={`text-2xl transition ${
            star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
          } ${onRate ? 'cursor-pointer hover:text-amber-300' : 'cursor-default'}`}
          type="button"
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function ReviewsList({ listingId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchReviews(listingId);
        setReviews(data.reviews || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [listingId]);

  if (loading) {
    return <div className="text-center text-sm text-slate-500 dark:text-slate-400">Loading reviews...</div>;
  }

  if (error) {
    return <InlineNotice tone="error">{error}</InlineNotice>;
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet. Be the first to review after your stay.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id} className="app-panel-soft p-4">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{review.user?.name || 'Anonymous'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Stars rating={review.rating} />
          </div>
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}

export function ReviewForm({ listingId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const token = getStoredToken();
    if (!token) {
      setError('Sign in required to leave a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createReview(listingId, rating, comment, token);
      setSuccess(true);
      setRating(0);
      setComment('');
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="app-panel-soft space-y-4 p-5">
      <h3 className="font-semibold text-slate-900 dark:text-white">Leave a review</h3>

      {error && (
        <InlineNotice tone="error" className="p-3">{error}</InlineNotice>
      )}

      {success && (
        <InlineNotice tone="success" className="p-3">Review posted successfully.</InlineNotice>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Rating</p>
        <Stars rating={rating} onRate={setRating} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
          className="app-input min-h-[112px] resize-none"
          maxLength={2000}
          rows={4}
          placeholder="Share what the stay felt like..."
        />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{comment.length}/2000</p>
      </div>

      <button type="submit" disabled={submitting || success} className="app-button-primary">
        {submitting ? 'Posting...' : 'Post review'}
      </button>
    </form>
  );
}
