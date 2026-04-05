/**
 * GET /health — liveness check for load balancers and monitoring.
 */
export async function getHealth(req, res) {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
