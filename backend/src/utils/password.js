// =============================================================================
// src/utils/password.js – Password Hashing Utilities
// =============================================================================
// Wraps bcryptjs for password hashing and comparison.
// Salt rounds = 10 is the industry standard balance between security and speed.
// =============================================================================

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password.
 * @param {string} password - Plain-text password from user input
 * @returns {Promise<string>} Bcrypt hash string
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain-text password against a stored hash.
 * @param {string} password     - Plain-text password attempt
 * @param {string} passwordHash - Stored bcrypt hash from database
 * @returns {Promise<boolean>} True if password matches hash
 */
const comparePassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

module.exports = { hashPassword, comparePassword };
