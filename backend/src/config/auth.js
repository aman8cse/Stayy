const DEFAULT_JWT_EXPIRES = '7d';
const DEFAULT_BCRYPT_ROUNDS = 12;

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET must be set and at least 16 characters long');
  }
  return secret;
}

export function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES;
}

export function getBcryptSaltRounds() {
  const n = Number(process.env.BCRYPT_SALT_ROUNDS);
  if (Number.isInteger(n) && n >= 10 && n <= 14) return n;
  return DEFAULT_BCRYPT_ROUNDS;
}
