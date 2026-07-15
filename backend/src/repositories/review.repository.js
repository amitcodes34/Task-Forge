// =============================================================================
// src/repositories/review.repository.js – Review Data Access Layer
// =============================================================================

const prisma = require('../config/database');

const REVIEW_SELECT = {
  id: true,
  rating: true,
  comment: true,
  createdAt: true,
  reviewer: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
  },
  target: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
  },
  project: {
    select: { id: true, title: true },
  },
};

/**
 * Create a new review.
 */
const createReview = async ({ projectId, reviewerId, targetId, rating, comment }) => {
  return prisma.review.create({
    data: { projectId, reviewerId, targetId, rating, comment },
    select: REVIEW_SELECT,
  });
};

/**
 * Check if a reviewer has already submitted a review for this project.
 */
const findExistingReview = async (projectId, reviewerId) => {
  return prisma.review.findUnique({
    where: { projectId_reviewerId: { projectId, reviewerId } },
  });
};

/**
 * Find all reviews written about a specific user (their received reviews).
 */
const findReviewsByTargetId = async (targetId) => {
  return prisma.review.findMany({
    where: { targetId },
    orderBy: { createdAt: 'desc' },
    select: REVIEW_SELECT,
  });
};

module.exports = { createReview, findExistingReview, findReviewsByTargetId };
