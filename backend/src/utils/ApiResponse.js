// =============================================================================
// src/utils/ApiResponse.js – Standardized API Response Helper
// =============================================================================
// All successful API responses use this helper to ensure a consistent shape.
// Every response will always have: { success, message, data, meta? }
// This makes frontend integration and API documentation straightforward.
// =============================================================================

class ApiResponse {
  /**
   * Send a standardized success response.
   *
   * @param {Response} res        - Express response object
   * @param {number}   statusCode - HTTP status code (default: 200)
   * @param {string}   message    - Human-readable success message
   * @param {*}        data       - Response payload (object, array, or null)
   * @param {object}   meta       - Optional metadata (pagination, counts, etc.)
   */
  static success(res, statusCode = 200, message = 'Success', data = null, meta = null) {
    const responseBody = {
      success: true,
      message,
      data,
    };

    if (meta) {
      responseBody.meta = meta;
    }

    return res.status(statusCode).json(responseBody);
  }

  /**
   * Shorthand for 201 Created responses.
   */
  static created(res, message = 'Resource created successfully', data = null) {
    return ApiResponse.success(res, 201, message, data);
  }

  /**
   * Shorthand for 200 OK with no data payload (e.g., logout, delete).
   */
  static noContent(res, message = 'Operation successful') {
    return ApiResponse.success(res, 200, message, null);
  }
}

module.exports = ApiResponse;
