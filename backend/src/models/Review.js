import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ user: 1, listing: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
