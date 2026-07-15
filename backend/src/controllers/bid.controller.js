// =============================================================================
// src/controllers/bid.controller.js – Bid HTTP Request Handlers
// =============================================================================

const bidService = require('../services/bid.service');
const ApiResponse = require('../utils/ApiResponse');
const { invalidatePattern } = require('../lib/cache');

/**
 * POST /api/v1/projects/:id/bids
 */
const createBid = async (req, res, next) => {
  try {
    const bid = await bidService.createBid(req.user.userId, req.params.id, req.body, { ip: req.ip });
    ApiResponse.created(res, 'Bid placed successfully.', { bid });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/projects/:id/bids
 */
const getBidsForProject = async (req, res, next) => {
  try {
    const bids = await bidService.getBidsForProject(req.params.id, req.user.userId);
    ApiResponse.success(res, 200, 'Bids retrieved successfully.', { bids, count: bids.length });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/bids/:id
 */
const updateBid = async (req, res, next) => {
  try {
    const bid = await bidService.updateBid(req.params.id, req.user.userId, req.body);
    ApiResponse.success(res, 200, 'Bid updated successfully.', { bid });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/bids/:id
 */
const deleteBid = async (req, res, next) => {
  try {
    await bidService.deleteBid(req.params.id, req.user.userId, { ip: req.ip });
    ApiResponse.noContent(res, 'Bid withdrawn successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/bids/:id/accept
 */
const acceptBid = async (req, res, next) => {
  try {
    const result = await bidService.acceptBid(req.params.id, req.user.userId, { ip: req.ip });
    await invalidatePattern('projects:*');
    if (result.updatedProject) await invalidatePattern(`project:${result.updatedProject.id}`);
    ApiResponse.success(res, 200, 'Bid accepted. Project is now in progress!', { result });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBid, getBidsForProject, updateBid, deleteBid, acceptBid };
