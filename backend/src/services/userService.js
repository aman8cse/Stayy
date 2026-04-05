import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { signAuthToken } from '../utils/token.js';
import { toPublicUser } from '../utils/userPublic.js';

/**
 * Upgrades `user` → `host`. Idempotent for hosts. Admins cannot use this flow.
 * @param {string} userId
 */
export async function promoteUserToHost(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user id', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role === 'admin') {
    throw new AppError('Admins cannot use this endpoint to change role', 400);
  }

  if (user.role === 'user') {
    user.role = 'host';
    await user.save();
  }

  const token = signAuthToken(user._id.toString(), user.role);
  return { user: toPublicUser(user), token };
}
