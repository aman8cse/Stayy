import { useState, useEffect } from 'react';
import { createReview, fetchReviews } from '../api/auth.js';
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
            star <= rating ? 'text-amber-400' : 'text-slate-200'
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

  if (loading) return <div className="text-center text-slate-600">Loading reviews...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  if (reviews.length === 0) {
    return <p className="text-slate-600 text-sm">No reviews yet. Be the first to review!</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-medium text-slate-900">{review.user?.name || 'Anonymous'}</p>
              <p className="text-xs text-slate-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Stars rating={review.rating} />
          </div>
          <p className="text-slate-700 text-sm">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}

export function ReviewForm({ listingId, bookingId, onSuccess }) {
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-6">
      <h3 className="font-semibold text-slate-900">Leave a review</h3>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Review posted successfully! 🎉
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Rating</p>
        <Stars rating={rating} onRate={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none transition"
          rows={3}
          placeholder="Share your experience..."
        />
        <p className="text-xs text-slate-500 mt-1">{comment.length}/500</p>
      </div>

      <button
        type="submit"
        disabled={submitting || success}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition"
      >
        {submitting ? 'Posting...' : 'Post review'}
      </button>
    </form>
  );
}
