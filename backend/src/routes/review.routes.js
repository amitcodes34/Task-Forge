// =============================================================================
// src/routes/review.routes.js – Review Routes
// =============================================================================

const { Router } = require('express');
const reviewController = require('../controllers/review.controller');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { createReviewSchema } = require('../validators/review.validators');

const router = Router();

/**
 * @route   POST /api/v1/reviews
 * @desc    Submit a review (only after project completion)
 * @access  Private – CLIENT or FREELANCER
 */
router.post(
  '/',
  authenticate,
  authorize('CLIENT', 'FREELANCER'),
  validate(createReviewSchema),
  reviewController.createReview
);

module.exports = router;
