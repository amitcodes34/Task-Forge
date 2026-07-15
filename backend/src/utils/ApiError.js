// =============================================================================
// src/utils/ApiError.js – Custom Application Error Class
// =============================================================================
// A structured error class that carries an HTTP status code alongside a message.
// Thrown by service/repository layers and caught by the global error handler.
// This ensures all error responses are consistent in shape and easy to trace.
// =============================================================================

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 403, 404)
   * @param {string} message    - Human-readable error description
   * @param {Array}  errors     - Optional array of field-level validation errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Marks as a known/expected error (not a bug)

    // Capture stack trace for debugging (excludes constructor from trace)
    Error.captureStackTrace(this, this.constructor);
  }

  // ---------------------------------------------------------------------------
  // Static factory methods for common HTTP error codes
  // ---------------------------------------------------------------------------

  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
