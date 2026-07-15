// =============================================================================
// src/middleware/authorize.js – Role-Based Authorization Middleware
// =============================================================================
// Factory middleware that accepts one or more allowed roles and blocks access
// if the authenticated user's role is not in the allowed list.
//
// This must be used AFTER the `authenticate` middleware so that req.user exists.
//
// Usage:
//   const { authorize } = require('../middleware/authorize');
//
//   // Only CLIENTs can access this route
//   router.post('/projects', authenticate, authorize('CLIENT'), createProject);
//
//   // Both CLIENTs and ADMINs can access this route
//   router.get('/admin/users', authenticate, authorize('ADMIN'), getUsers);
// =============================================================================

const ApiError = require('../utils/ApiError');

/**
 * Factory function that returns role-checking middleware.
 * @param {...string} roles - Allowed role strings (e.g., 'CLIENT', 'FREELANCER', 'ADMIN')
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // authenticate middleware must run first
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. This action requires one of the following roles: ${roles.join(', ')}.`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
