import jwt from 'jsonwebtoken';
import { getJwtExpiresIn, getJwtSecret } from '../config/auth.js';

export function signAuthToken(userId, role) {
  return jwt.sign({ sub: userId, role }, getJwtSecret(), { expiresIn: getJwtExpiresIn() });
}
