import { AppError } from '../utils/AppError.js';

/**
 * Centralized error handler. Must be registered after all routes.
 */
export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  } else if (Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode < 600) {
    statusCode = err.statusCode;
  }

  const payload = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}
