// =============================================================================
// src/routes/admin.routes.js – Admin Routes
// =============================================================================
// All admin routes are gated behind authenticate + authorize('ADMIN').
// These are the ONLY endpoints where ADMIN role is required.
// =============================================================================

const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Platform-wide aggregated statistics
 * @access  Private – ADMIN only
 */
router.get('/stats', adminController.getStats);

/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    Paginated audit event log
 * @access  Private – ADMIN only
 */
router.get('/audit-logs', adminController.getAuditLogs);

/**
 * @route   GET /api/v1/admin/users
 * @desc    List all platform users (with pagination)
 * @access  Private – ADMIN only
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   PATCH /api/v1/admin/users/:id/ban
 * @desc    Ban a user account
 * @access  Private – ADMIN only
 */
router.patch('/users/:id/ban', adminController.banUser);

/**
 * @route   PATCH /api/v1/admin/users/:id/unban
 * @desc    Unban a user account
 * @access  Private – ADMIN only
 */
router.patch('/users/:id/unban', adminController.unbanUser);

/**
 * @route   GET /api/v1/admin/projects
 * @desc    List all projects across the platform (includes soft-deleted)
 * @access  Private – ADMIN only
 */
router.get('/projects', adminController.getAllProjects);

module.exports = router;
