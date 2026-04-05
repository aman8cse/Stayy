/**
 * 404 handler for undefined routes.
 */
export function notFound(req, res, next) {
  const err = new Error(`Not Found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}
