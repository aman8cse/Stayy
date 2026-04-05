import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { getJwtSecret } from '../config/auth.js';

/**
 * Verifies Bearer JWT and attaches `req.user` as `{ id, role }`.
 */
export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    const id = decoded.sub;
    const role = decoded.role;

    if (!id || typeof id !== 'string' || !role || typeof role !== 'string') {
      return next(new AppError('Invalid token payload', 401));
    }

    req.user = { id, role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    next(err);
  }
}
