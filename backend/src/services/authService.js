import bcrypt from 'bcryptjs';
import { promisify } from 'node:util';
import validator from 'validator';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { isValidPhone } from '../utils/phone.js';
import { getBcryptSaltRounds } from '../config/auth.js';
import { signAuthToken } from '../utils/token.js';
import { toPublicUser } from '../utils/userPublic.js';

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

  let user;
  try {
    user = await User.create({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: hashedPassword,
      phone: input.phone.trim(),
      role: 'user',
      isVerified: false,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('Email is already registered', 409);
    }
    throw err;
  }

  const token = signAuthToken(user._id.toString(), user.role);
  return { user: toPublicUser(user), token };
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
