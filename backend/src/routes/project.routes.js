// =============================================================================
// src/routes/project.routes.js – Project Routes
// =============================================================================

const { Router } = require('express');
const projectController = require('../controllers/project.controller');
const bidController = require('../controllers/bid.controller');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
} = require('../validators/project.validators');
const { createBidSchema } = require('../validators/bid.validators');

const router = Router();

// ---------------------------------------------------------------------------
// Project CRUD
// ---------------------------------------------------------------------------

/**
 * @route   POST /api/v1/projects
 * @desc    Create a new project
 * @access  Private – CLIENT only
 */
router.post(
  '/',
  authenticate,
  authorize('CLIENT'),
  validate(createProjectSchema),
  projectController.createProject
);

/**
 * @route   GET /api/v1/projects
 * @desc    List all open projects with search, filter, sort, pagination
 * @access  Public
 */
router.get(
  '/',
  validate(listProjectsQuerySchema, 'query'),
  projectController.getProjects
);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get a single project by ID
 * @access  Public
 */
router.get('/:id', projectController.getProjectById);

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update a project (ownership check in service layer)
 * @access  Private – CLIENT only
 */
router.put(
  '/:id',
  authenticate,
  authorize('CLIENT'),
  validate(updateProjectSchema),
  projectController.updateProject
);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete a project (ownership check in service layer)
 * @access  Private – CLIENT only
 */
router.delete(
  '/:id',
  authenticate,
  authorize('CLIENT'),
  projectController.deleteProject
);

// ---------------------------------------------------------------------------
// Project Lifecycle Actions
// ---------------------------------------------------------------------------

/**
 * @route   POST /api/v1/projects/:id/deliver
 * @desc    Freelancer submits their work
 * @access  Private – FREELANCER only (must be the accepted freelancer)
 */
router.post(
  '/:id/deliver',
  authenticate,
  authorize('FREELANCER'),
  projectController.deliverProject
);

/**
 * @route   POST /api/v1/projects/:id/complete
 * @desc    Client confirms project completion
 * @access  Private – CLIENT only (must be the project owner)
 */
router.post(
  '/:id/complete',
  authenticate,
  authorize('CLIENT'),
  projectController.completeProject
);

// ---------------------------------------------------------------------------
// Bid Sub-Resources (nested under /projects)
// ---------------------------------------------------------------------------

/**
 * @route   POST /api/v1/projects/:id/bids
 * @desc    Place a bid on a project
 * @access  Private – FREELANCER only
 */
router.post(
  '/:id/bids',
  authenticate,
  authorize('FREELANCER'),
  validate(createBidSchema),
  bidController.createBid
);

/**
 * @route   GET /api/v1/projects/:id/bids
 * @desc    View all bids on a project (project owner only)
 * @access  Private – CLIENT only (ownership check in service)
 */
router.get(
  '/:id/bids',
  authenticate,
  authorize('CLIENT'),
  bidController.getBidsForProject
);

module.exports = router;
