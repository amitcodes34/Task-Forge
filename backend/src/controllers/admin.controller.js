// =============================================================================
// src/controllers/admin.controller.js – Admin HTTP Request Handlers
// =============================================================================

const adminService = require('../services/admin.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/v1/admin/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { users, pagination } = await adminService.getAllUsers({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    ApiResponse.success(res, 200, 'Users retrieved successfully.', { users }, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/ban
 */
const banUser = async (req, res, next) => {
  try {
    const user = await adminService.banUser(req.params.id, req.user.userId, { ip: req.ip });
    ApiResponse.success(res, 200, `User ${user.email} has been banned.`, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/unban
 */
const unbanUser = async (req, res, next) => {
  try {
    const user = await adminService.unbanUser(req.params.id, req.user.userId, { ip: req.ip });
    ApiResponse.success(res, 200, `User ${user.email} has been unbanned.`, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/projects
 */
const getAllProjects = async (req, res, next) => {
  try {
    const { projects, pagination } = await adminService.getAllProjects({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    ApiResponse.success(res, 200, 'Projects retrieved successfully.', { projects }, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/stats
 * Platform-wide aggregated statistics.
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    ApiResponse.success(res, 200, 'Platform stats retrieved.', { stats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/audit-logs
 * Paginated audit event log.
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { logs, pagination } = await adminService.getAuditLogs({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 30,
      action: req.query.action || undefined,
    });
    ApiResponse.success(res, 200, 'Audit logs retrieved.', { logs }, pagination);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, banUser, unbanUser, getAllProjects, getStats, getAuditLogs };
