import * as reviewService from '../services/reviewService.js';

export async function create(req, res) {
  const review = await reviewService.createReview(req.user.id, req.body);
  res.status(201).json({
    success: true,
    review,
  });
}

export async function listByListing(req, res) {
  const { listingId, averageRating, reviewCount, reviews } = await reviewService.getReviewsForListing(
    req.params.listingId
  );
  res.status(200).json({
    success: true,
    listingId,
    averageRating,
    reviewCount,
    reviews,
  });
}
