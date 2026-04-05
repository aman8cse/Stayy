import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    unitType: {
      type: String,
      enum: ['room', 'bed', 'entire_place'],
      required: true,
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

unitSchema.index({ listing: 1, pricePerHour: 1 });

export const Unit = mongoose.model('Unit', unitSchema);
