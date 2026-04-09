import bcrypt from 'bcryptjs';
import { promisify } from 'node:util';
import validator from 'validator';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { isValidPhone } from '../utils/phone.js';
import { getBcryptSaltRounds } from '../config/auth.js';
import { signAuthToken } from '../utils/token.js';
import { toPublicUser } from '../utils/userPublic.js';
import { sendOtpEmail, sendPasswordResetEmail } from './emailService.js';
import { generateOTP, getOTPExpiry } from '../utils/otp.js';

const hashPassword = promisify(bcrypt.hash);
const comparePassword = promisify(bcrypt.compare);

function assertEmail(email) {
  if (typeof email !== 'string' || !validator.isEmail(email.trim())) {
    throw new AppError('Valid email is required', 400);
  }
}

function assertPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }
}

function assertName(name) {
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) {
    throw new AppError('Name is required (max 120 characters)', 400);
  }
}

function assertPhone(phone) {
  if (typeof phone !== 'string' || !isValidPhone(phone)) {
    throw new AppError('Valid phone number is required', 400);
  }
}

/**
 * @param {{ name: string; email: string; password: string; phone: string }} input
 */
export async function signupUser(input) {
  assertName(input.name);
  assertEmail(input.email);
  assertPassword(input.password);
  assertPhone(input.phone);

  const saltRounds = getBcryptSaltRounds();
  const hashedPassword = await hashPassword(input.password, saltRounds);

  // Generate OTP
  const otpCode = generateOTP();
  const otpExpiry = getOTPExpiry();

  let user;
  try {
    user = await User.create({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: hashedPassword,
      phone: input.phone.trim(),
      role: 'user',
      isVerified: false,
      otpCode,
      otpExpiry,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('Email is already registered', 409);
    }
    throw err;
  }

  // Send OTP email
  try {
    await sendOtpEmail(user.email, otpCode, user.name);
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    // Don't fail signup, but user won't be able to verify
  }

  const token = signAuthToken(user._id.toString(), user.role);
  return {
    user: toPublicUser(user),
    token,
    message: 'Signup successful. An OTP has been sent to your email.',
  };
}

/**
 * @param {{ email: string; password: string }} input
 */
export async function loginUser(input) {
  assertEmail(input.email);
  if (typeof input.password !== 'string' || !input.password) {
    throw new AppError('Password is required', 400);
  }

  const user = await User.findOne({ email: input.email.trim().toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const match = await comparePassword(input.password, user.password);
  if (!match) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signAuthToken(user._id.toString(), user.role);
  return { user: toPublicUser(user), token };
}

/**
 * Verify OTP code
 * @param {string} email
 * @param {string} otpCode
 */
export async function verifyOTP(email, otpCode) {
  if (!email || typeof email !== 'string') {
    throw new AppError('Email is required', 400);
  }
  if (!otpCode || typeof otpCode !== 'string') {
    throw new AppError('OTP code is required', 400);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+otpCode +otpExpiry');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    throw new AppError('Email is already verified', 400);
  }

  const now = new Date();
  if (!user.otpCode || user.otpCode !== otpCode) {
    throw new AppError('Invalid OTP code', 400);
  }

  if (!user.otpExpiry || user.otpExpiry < now) {
    throw new AppError('OTP code has expired. Please request a new one.', 400);
  }

  // Mark user as verified
  user.isVerified = true;
  user.otpCode = null;
  user.otpExpiry = null;
  await user.save();

  return { user: toPublicUser(user) };
}

/**
 * Resend OTP code
 * @param {string} email
 */
export async function resendOTP(email) {
  if (!email || typeof email !== 'string') {
    throw new AppError('Email is required', 400);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+name');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate new OTP
  const otpCode = generateOTP();
  const otpExpiry = getOTPExpiry();

  user.otpCode = otpCode;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Send OTP email
  try {
    await sendOtpEmail(user.email, otpCode, user.name);
  } catch (err) {
    console.error('Failed to resend OTP email:', err);
    throw new AppError('Failed to send OTP email', 500);
  }

  return { message: 'OTP has been sent to your email' };
}

/**
 * Initiate password reset - sends OTP to user's email
 * @param {string} email
 */
export async function forgotPassword(email) {
  if (!email || typeof email !== 'string') {
    throw new AppError('Email is required', 400);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+name');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Generate OTP for password reset
  const otpCode = generateOTP();
  const otpExpiry = getOTPExpiry();

  user.otpCode = otpCode;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Send password reset email
  try {
    await sendPasswordResetEmail(user.email, otpCode, user.name);
  } catch (err) {
    console.error('Failed to send password reset email:', err);
    throw new AppError('Failed to send password reset email', 500);
  }

  return { message: 'Password reset OTP has been sent to your email' };
}

/**
 * Reset password with OTP verification
 * @param {{ email: string; otpCode: string; newPassword: string }} input
 */
export async function resetPassword(input) {
  if (!input.email || typeof input.email !== 'string') {
    throw new AppError('Email is required', 400);
  }
  if (!input.otpCode || typeof input.otpCode !== 'string') {
    throw new AppError('OTP code is required', 400);
  }
  if (!input.newPassword || typeof input.newPassword !== 'string') {
    throw new AppError('New password is required', 400);
  }

  assertPassword(input.newPassword);

  const user = await User.findOne({ email: input.email.trim().toLowerCase() }).select('+password +otpCode +otpExpiry');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const now = new Date();
  if (!user.otpCode || user.otpCode !== input.otpCode) {
    throw new AppError('Invalid OTP code', 400);
  }

  if (!user.otpExpiry || user.otpExpiry < now) {
    throw new AppError('OTP code has expired. Please request a new one.', 400);
  }

  // Update password
  const saltRounds = getBcryptSaltRounds();
  user.password = await hashPassword(input.newPassword, saltRounds);
  user.otpCode = null;
  user.otpExpiry = null;
  await user.save();

  return { message: 'Password reset successfully. You can now login with your new password.' };
}
