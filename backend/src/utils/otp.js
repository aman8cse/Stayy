/**
 * Generate a 6-digit OTP code
 */
export function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

/**
 * Get OTP expiry time (10 minutes from now)
 */
export function getOTPExpiry() {
  const now = new Date();
  return new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
}
