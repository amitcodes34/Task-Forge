// =============================================================================
// src/services/review.service.js – Review Business Logic
// =============================================================================

const reviewRepo = require('../repositories/review.repository');
const projectRepo = require('../repositories/project.repository');
const bidRepo = require('../repositories/bid.repository');
const ApiError = require('../utils/ApiError');

// ---------------------------------------------------------------------------
// Submit a review (only after project is COMPLETED)
// ---------------------------------------------------------------------------
const createReview = async (reviewerId, reviewerRole, { projectId, targetId, rating, comment }) => {
  // 1. Fetch the project
  const project = await projectRepo.findProjectByIdRaw(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found.');
  }

  // 2. Project must be COMPLETED for reviews to be allowed
  if (project.status !== 'COMPLETED') {
    throw ApiError.badRequest(
      'Reviews can only be submitted after the project has been marked as completed.'
    );
  }

  // 3. Validate reviewer is part of the project (client or winning freelancer)
  if (reviewerRole === 'CLIENT') {
    // Client must own the project
    if (project.clientId !== reviewerId) {
      throw ApiError.forbidden('You are not the client for this project.');
    }
    // Client can only review the winning freelancer
    if (!project.winningBidId) {
      throw ApiError.badRequest('No winning bid found. Cannot submit review.');
    }
    const winningBid = await bidRepo.findBidByIdRaw(project.winningBidId);
    if (!winningBid || winningBid.freelancerId !== targetId) {
      throw ApiError.badRequest(
        'As a client, you can only review the freelancer who completed your project.'
      );
    }
  } else if (reviewerRole === 'FREELANCER') {
    // Freelancer must have won the bid
    if (!project.winningBidId) {
      throw ApiError.badRequest('No winning bid found.');
    }
    const winningBid = await bidRepo.findBidByIdRaw(project.winningBidId);
    if (!winningBid || winningBid.freelancerId !== reviewerId) {
      throw ApiError.forbidden('Only the freelancer who completed the project can leave a review.');
    }
    // Freelancer can only review the project's client
    if (project.clientId !== targetId) {
      throw ApiError.badRequest(
        'As a freelancer, you can only review the client of your completed project.'
      );
    }
  } else {
    throw ApiError.forbidden('Admins cannot submit reviews.');
  }

  // 4. Prevent duplicate reviews
  const existingReview = await reviewRepo.findExistingReview(projectId, reviewerId);
  if (existingReview) {
    throw ApiError.conflict('You have already submitted a review for this project.');
  }

  // 5. Cannot review yourself
  if (reviewerId === targetId) {
    throw ApiError.badRequest('You cannot review yourself.');
  }

  return reviewRepo.createReview({ projectId, reviewerId, targetId, rating, comment });
};

module.exports = { createReview };
