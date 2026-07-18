// =============================================================================
// src/routes/freelancer.routes.js – Freelancer Routes
// =============================================================================

const { Router } = require('express');
const freelancerController = require('../controllers/freelancer.controller');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

const router = Router();

/**
 * @route   GET /api/v1/freelancers
 * @desc    List all freelancers (with simulated AI Match Score for clients)
 * @access  Private – CLIENT only
 */
router.get('/', authenticate, authorize('CLIENT'), freelancerController.getFreelancers);

module.exports = router;
