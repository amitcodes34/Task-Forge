// =============================================================================
// src/middleware/authenticate.js – JWT Authentication Middleware
// =============================================================================
// Validates the JWT access token from the Authorization header.
// On success, attaches the decoded user payload to req.user.
// On failure, throws an ApiError which is caught by the global error handler.
//
// Usage:
//   router.get('/protected', authenticate, controller.method)
// =============================================================================

const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

/**
 * Middleware: Verify Bearer token and populate req.user.
 *
 * Expected header:
 *   Authorization: Bearer <access_token>
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized(
        'No authentication token provided. Please log in.'
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Malformed authorization header.');
    }

    // verifyAccessToken throws ApiError on failure (expired, invalid)
    const decoded = verifyAccessToken(token);

    // Attach decoded payload to request so downstream handlers can use it
    // Shape: { userId, email, role, iat, exp }
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
