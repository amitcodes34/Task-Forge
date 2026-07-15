// =============================================================================
// src/controllers/review.controller.js – Review HTTP Request Handlers
// =============================================================================

const reviewService = require('../services/review.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * POST /api/v1/reviews
 */
const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user.userId, req.user.role, req.body);
    ApiResponse.created(res, 'Review submitted successfully.', { review });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview };
