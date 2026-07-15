// =============================================================================
// src/middleware/errorHandler.js – Global Error Handling Middleware
// =============================================================================
// This is the centralized error handler attached at the end of the Express
// middleware chain. It normalizes all errors (ApiError, Prisma errors, Zod
// validation errors, JWT errors) into a consistent JSON response format.
//
// Error types handled:
//   - ApiError         → Operational errors thrown by our own code
//   - ZodError         → Input validation failures
//   - Prisma errors    → Database constraint violations, connection issues
//   - JsonWebTokenError → Invalid/expired tokens (caught by middleware first)
//   - Generic errors   → Unexpected server errors (500)
// =============================================================================

const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

/**
 * Express global error handler middleware.
 * Must be registered LAST in the middleware chain (4 parameters required).
 */
const errorHandler = (err, req, res, next) => {
  // ---- 1. Handle our own operational errors (ApiError) ----
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
    });
  }

  // ---- 2. Handle Zod validation errors ----
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check the provided data.',
      errors: formattedErrors,
    });
  }

  // ---- 3. Handle Prisma known request errors ----
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists.`,
      });
    }

    // P2025: Record not found (e.g., trying to update a non-existent record)
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'The requested resource was not found.',
      });
    }
  }

  // ---- 4. Handle unexpected/unhandled errors (bugs, not operational) ----
  const isDevelopment = process.env.NODE_ENV === 'development';

  console.error('❌ UNHANDLED ERROR:', err);

  return res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.',
    // Only expose stack trace in development for debugging
    ...(isDevelopment && { stack: err.stack }),
  });
};

module.exports = errorHandler;
