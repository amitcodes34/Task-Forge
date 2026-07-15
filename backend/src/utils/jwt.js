// =============================================================================
// src/utils/jwt.js – JWT Token Utilities
// =============================================================================
// Wraps jsonwebtoken into simple async-friendly functions.
// Separates concerns: token creation and token verification are each
// single-responsibility functions that can be mocked in tests.
// =============================================================================

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const ApiError = require('./ApiError');

// ---------------------------------------------------------------------------
// Access Token (short-lived: 15 minutes)
// ---------------------------------------------------------------------------

/**
 * Generate a short-lived JWT access token.
 * @param {object} payload - Data to encode (userId, role, email)
 * @returns {string} Signed JWT string
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: jwtConfig.accessToken.expiresIn,
  });
};

/**
 * Verify and decode a JWT access token.
 * @param {string} token - JWT string from Authorization header
 * @returns {object} Decoded payload
 * @throws {ApiError} 401 if token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.accessToken.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token has expired. Please refresh your session.');
    }
    throw ApiError.unauthorized('Invalid access token.');
  }
};

// ---------------------------------------------------------------------------
// Refresh Token (long-lived: 7 days)
// ---------------------------------------------------------------------------

/**
 * Generate a long-lived JWT refresh token.
 * @param {object} payload - Data to encode (userId)
 * @returns {string} Signed JWT string
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshToken.secret, {
    expiresIn: jwtConfig.refreshToken.expiresIn,
  });
};

/**
 * Verify and decode a JWT refresh token.
 * @param {string} token - JWT string from request body or cookie
 * @returns {object} Decoded payload
 * @throws {ApiError} 401 if token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshToken.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Refresh token has expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid refresh token.');
  }
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
