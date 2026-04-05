import mongoose from 'mongoose';

/**
 * Connects to MongoDB via Mongoose.
 * Exits the process on failure so the server does not run without a database.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('Missing MONGODB_URI in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}
