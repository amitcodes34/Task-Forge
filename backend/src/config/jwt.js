// =============================================================================
// src/config/jwt.js – JWT Configuration
// =============================================================================
// Centralizes all JWT-related configuration so that token logic is consistent
// across the entire application. If secrets or expiry need to change, this is
// the single place to update.
// =============================================================================

module.exports = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    // 7 days in milliseconds – used for DB expiry calculation
    expiresInMs: 7 * 24 * 60 * 60 * 1000,
  },
  // Token expiry for email verification and password reset links (24 hours)
  verificationTokenExpiresInMs: 24 * 60 * 60 * 1000,
};
