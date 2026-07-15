// =============================================================================
// src/repositories/bid.repository.js – Bid Data Access Layer
// =============================================================================

const prisma = require('../config/database');

const BID_SELECT = {
  id: true,
  amount: true,
  proposal: true,
  deliveryDays: true,
  status: true,
  aiScore: true,
  aiReason: true,
  aiFlags: true,
  aiScoredAt: true,
  createdAt: true,
  updatedAt: true,
  freelancer: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true, bio: true },
  },
  project: {
    select: { id: true, title: true, status: true, clientId: true },
  },
};

/**
 * Create a new bid on a project.
 */
const createBid = async ({ projectId, freelancerId, amount, proposal, deliveryDays }) => {
  return prisma.bid.create({
    data: { projectId, freelancerId, amount, proposal, deliveryDays },
    select: BID_SELECT,
  });
};

/**
 * Find a single bid by its ID.
 */
const findBidById = async (id) => {
  return prisma.bid.findUnique({
    where: { id },
    select: BID_SELECT,
  });
};

/**
 * Find raw bid (includes all fields for internal checks).
 */
const findBidByIdRaw = async (id) => {
  return prisma.bid.findUnique({ where: { id } });
};

/**
 * Find all bids for a specific project.
 */
const findBidsByProjectId = async (projectId) => {
  return prisma.bid.findMany({
    where: { projectId },
    orderBy: [
      { aiScore: { sort: 'desc', nulls: 'last' } },
      { createdAt: 'desc' }
    ],
    select: BID_SELECT,
  });
};

/**
 * Check if a freelancer has already bid on a project.
 */
const findExistingBid = async (projectId, freelancerId) => {
  return prisma.bid.findUnique({
    where: { projectId_freelancerId: { projectId, freelancerId } },
  });
};

/**
 * Update a bid.
 */
const updateBid = async (id, data) => {
  return prisma.bid.update({
    where: { id },
    data,
    select: BID_SELECT,
  });
};

/**
 * Delete a bid.
 */
const deleteBid = async (id) => {
  return prisma.bid.delete({ where: { id } });
};

/**
 * Accept a bid: sets bid to ACCEPTED, rejects all others, and updates project.
 * This runs in a transaction to guarantee atomicity.
 */
const acceptBid = async (bidId, projectId) => {
  return prisma.$transaction(async (tx) => {
    // 1. Mark the selected bid as ACCEPTED
    const acceptedBid = await tx.bid.update({
      where: { id: bidId },
      data: { status: 'ACCEPTED' },
    });

    // 2. Reject all other bids on this project
    await tx.bid.updateMany({
      where: { projectId, id: { not: bidId } },
      data: { status: 'REJECTED' },
    });

    // 3. Update the project status to IN_PROGRESS and set the winning bid
    const updatedProject = await tx.project.update({
      where: { id: projectId },
      data: { status: 'IN_PROGRESS', winningBidId: bidId },
    });

    return { acceptedBid, updatedProject };
  });
};

module.exports = {
  createBid,
  findBidById,
  findBidByIdRaw,
  findBidsByProjectId,
  findExistingBid,
  updateBid,
  deleteBid,
  acceptBid,
};
