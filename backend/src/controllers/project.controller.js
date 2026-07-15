// =============================================================================
// src/controllers/project.controller.js – Project HTTP Request Handlers
// =============================================================================

const projectService = require('../services/project.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * POST /api/v1/projects
 */
const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user.userId, req.body, { ip: req.ip });
    ApiResponse.created(res, 'Project created successfully.', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/projects
 */
const getProjects = async (req, res, next) => {
  try {
    const { projects, pagination } = await projectService.getProjects(req.query);
    ApiResponse.success(res, 200, 'Projects retrieved successfully.', { projects }, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    ApiResponse.success(res, 200, 'Project retrieved successfully.', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(
      req.params.id,
      req.user.userId,
      req.body,
      { ip: req.ip }
    );
    ApiResponse.success(res, 200, 'Project updated successfully.', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/projects/:id
 */
const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user.userId, { ip: req.ip });
    ApiResponse.noContent(res, 'Project deleted successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/projects/:id/deliver
 */
const deliverProject = async (req, res, next) => {
  try {
    const project = await projectService.deliverProject(
      req.params.id,
      req.user.userId,
      req.body,       // { note, attachmentUrl }
      { ip: req.ip }
    );
    ApiResponse.success(res, 200, 'Project marked as delivered. Awaiting client confirmation.', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/projects/:id/complete
 */
const completeProject = async (req, res, next) => {
  try {
    const project = await projectService.completeProject(req.params.id, req.user.userId, { ip: req.ip });
    ApiResponse.success(res, 200, 'Project marked as completed. You can now leave a review!', { project });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  deliverProject,
  completeProject,
};
