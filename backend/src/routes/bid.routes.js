// =============================================================================
// src/routes/bid.routes.js – Standalone Bid Routes (by bid ID)
// =============================================================================

const { Router } = require('express');
const bidController = require('../controllers/bid.controller');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { updateBidSchema } = require('../validators/bid.validators');

const router = Router();

/**
 * @route   PUT /api/v1/bids/:id
 * @desc    Update a bid (ownership check in service layer)
 * @access  Private – FREELANCER only
 */
router.put(
  '/:id',
  authenticate,
  authorize('FREELANCER'),
  validate(updateBidSchema),
  bidController.updateBid
);

/**
 * @route   DELETE /api/v1/bids/:id
 * @desc    Withdraw a bid
 * @access  Private – FREELANCER only
 */
router.delete('/:id', authenticate, authorize('FREELANCER'), bidController.deleteBid);

/**
 * @route   POST /api/v1/bids/:id/accept
 * @desc    Accept a bid (project ownership check in service layer)
 * @access  Private – CLIENT only
 */
router.post('/:id/accept', authenticate, authorize('CLIENT'), bidController.acceptBid);

module.exports = router;
