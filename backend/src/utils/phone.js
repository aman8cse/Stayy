import validator from 'validator';

/**
 * Accepts common international mobile formats (libphonenumber-style checks).
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  if (!trimmed) return false;
  return validator.isMobilePhone(trimmed, 'any', { strictMode: false });
}
