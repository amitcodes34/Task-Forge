// =============================================================================
// src/services/bid.service.js – Bid Business Logic
// =============================================================================

const bidRepo = require('../repositories/bid.repository');
const projectRepo = require('../repositories/project.repository');
const { log, AuditActions } = require('./audit.service');
const { broadcastToProject } = require('../websockets/connectionManager');
const { emailQueue } = require('../queues/emailQueue');
const { scoringQueue } = require('../queues/scoringQueue');
const ApiError = require('../utils/ApiError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ---------------------------------------------------------------------------
// Place a bid (FREELANCER only)
// ---------------------------------------------------------------------------
const createBid = async (freelancerId, projectId, bidData, { ip } = {}) => {
  // 1. Verify the project exists and is OPEN
  const project = await projectRepo.findProjectByIdRaw(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found.');
  }
  if (project.status !== 'OPEN') {
    throw ApiError.badRequest(
      `Cannot bid on a project with status '${project.status}'. Only OPEN projects accept bids.`
    );
  }

  // 2. Prevent client from bidding on their own project
  if (project.clientId === freelancerId) {
    throw ApiError.forbidden('You cannot bid on your own project.');
  }

  // 3. Prevent duplicate bids from the same freelancer
  const existingBid = await bidRepo.findExistingBid(projectId, freelancerId);
  if (existingBid) {
    throw ApiError.conflict(
      'You have already placed a bid on this project. Update your existing bid instead.'
    );
  }

  const bid = await bidRepo.createBid({ projectId, freelancerId, ...bidData });

  // Fire-and-forget: audit log + client notification
  log({ actorId: freelancerId, action: AuditActions.BID_PLACED, resourceType: 'Bid', resourceId: bid.id, metadata: { projectId, amount: bidData.amount }, ip });

  // ---------------------------------------------------------------------------
  // Real-Time WebSocket Broadcast
  // ---------------------------------------------------------------------------
  // After saving the bid to PostgreSQL, immediately broadcast it to all sockets
  // currently watching this project page (i.e., joined room `project:<id>`).
  //
  // We also fetch the full bid (with freelancer name included) so the frontend
  // can display the new card immediately without a round-trip fetch.
  //
  // This is fire-and-forget: if the broadcast fails (e.g. no one is watching),
  // it does NOT affect the API response. The bid is already saved in the DB.
  // ---------------------------------------------------------------------------
  try {
    const fullBid = await bidRepo.findBidById(bid.id);
    broadcastToProject(projectId, 'new_bid', {
      event: 'new_bid',
      data: fullBid,
    });
  } catch (wsErr) {
    console.error('⚠️  WebSocket broadcast failed (non-fatal):', wsErr.message);
  }

  // Notify client via background queue (Debounced in logic via Redis in real-world, 
  // but for now we'll just push to queue or implement a simple in-memory map here.
  // We can push to the queue, and the worker handles it.)
  const projectWithClient = await projectRepo.findProjectById(projectId);
  if (projectWithClient?.client?.email) {
    const totalBids = (await bidRepo.findBidsByProjectId(projectId)).length;
    const clientName = `${projectWithClient.client.firstName} ${projectWithClient.client.lastName}`;
    
    // Add job to BullMQ queue
    await emailQueue.add('new_bid_notification', {
      to: projectWithClient.client.email,
      subject: `💼 New bid on your project "${project.title}"`,
      templateName: 'new_bid_notification',
      templateData: {
        clientName,
        projectTitle: project.title,
        projectId,
        totalBids,
      }
    }, {
      // Optional: BullMQ job options here (e.g. jobId to debounce)
      jobId: `new_bid_${projectId}_${Date.now()}` // Unique per bid
    });
  }

  // Trigger AI Scoring in the background
  if (process.env.AI_SCORING_ENABLED === 'true') {
    await scoringQueue.add('score_bid', { bidId: bid.id }, {
      jobId: `score_bid_${bid.id}` // Prevent duplicate jobs
    });
  }

  return bid;
};

// ---------------------------------------------------------------------------
// Get all bids on a project (project owner only)
// ---------------------------------------------------------------------------
const getBidsForProject = async (projectId, requestingUserId) => {
  const project = await projectRepo.findProjectByIdRaw(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found.');
  }

  // Only the project owner can see the bids on their project
  if (project.clientId !== requestingUserId) {
    throw ApiError.forbidden(
      'You do not have permission to view bids on this project.'
    );
  }

  return bidRepo.findBidsByProjectId(projectId);
};

// ---------------------------------------------------------------------------
// Update a bid (FREELANCER who owns the bid)
// ---------------------------------------------------------------------------
const updateBid = async (bidId, freelancerId, updateData) => {
  const bid = await bidRepo.findBidByIdRaw(bidId);
  if (!bid) {
    throw ApiError.notFound('Bid not found.');
  }

  // Ownership check
  if (bid.freelancerId !== freelancerId) {
    throw ApiError.forbidden('You do not have permission to update this bid.');
  }

  // Cannot update a bid that has already been accepted or rejected
  if (bid.status !== 'PENDING') {
    throw ApiError.badRequest(
      `Cannot update a bid with status '${bid.status}'. Only PENDING bids can be modified.`
    );
  }

  return bidRepo.updateBid(bidId, updateData);
};

// ---------------------------------------------------------------------------
// Delete a bid (FREELANCER who owns the bid)
// ---------------------------------------------------------------------------
const deleteBid = async (bidId, freelancerId, { ip } = {}) => {
  const bid = await bidRepo.findBidByIdRaw(bidId);
  if (!bid) {
    throw ApiError.notFound('Bid not found.');
  }

  if (bid.freelancerId !== freelancerId) {
    throw ApiError.forbidden('You do not have permission to delete this bid.');
  }

  if (bid.status !== 'PENDING') {
    throw ApiError.badRequest(
      'Cannot delete a bid that has already been accepted or rejected.'
    );
  }

  await bidRepo.deleteBid(bidId);

  log({ actorId: freelancerId, action: AuditActions.BID_WITHDRAWN, resourceType: 'Bid', resourceId: bidId, metadata: { projectId: bid.projectId }, ip });
};

// ---------------------------------------------------------------------------
// Accept a bid (project CLIENT/owner)
// ---------------------------------------------------------------------------
const acceptBid = async (bidId, requestingUserId, { ip } = {}) => {
  const bid = await bidRepo.findBidByIdRaw(bidId);
  if (!bid) {
    throw ApiError.notFound('Bid not found.');
  }

  // Verify the project belongs to the requesting user
  const project = await projectRepo.findProjectByIdRaw(bid.projectId);
  if (!project) {
    throw ApiError.notFound('Associated project not found.');
  }

  if (project.clientId !== requestingUserId) {
    throw ApiError.forbidden('Only the project owner can accept bids.');
  }

  if (project.status !== 'OPEN') {
    throw ApiError.badRequest(
      `Cannot accept a bid on a project with status '${project.status}'.`
    );
  }

  if (bid.status !== 'PENDING') {
    throw ApiError.badRequest(`This bid has already been ${bid.status.toLowerCase()}.`);
  }

  const result = await bidRepo.acceptBid(bidId, bid.projectId);

  // Audit log
  log({
    actorId: requestingUserId,
    action: AuditActions.BID_ACCEPTED,
    resourceType: 'Bid',
    resourceId: bidId,
    metadata: { projectId: bid.projectId, freelancerId: bid.freelancerId, amount: bid.amount.toString() },
    ip,
  });

  // Notify the winning freelancer via background job queue
  const freelancerBid = await bidRepo.findBidById(bidId);
  const freelancerUser = await require('../config/database').user.findUnique({ where: { id: freelancerBid.freelancerId } });
  
  if (freelancerUser?.email) {
    await emailQueue.add('bid_accepted', {
      to: freelancerUser.email,
      subject: `🎉 Your Bid Was Accepted – ${project.title}`,
      templateName: 'bid_accepted',
      templateData: {
        freelancerName: freelancerUser.firstName || 'Freelancer',
        clientName: project.client ? project.client.firstName : 'The client',
        projectTitle: project.title,
      }
    });
  }

  // --- Stripe Payment Escrow Setup ---
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(bid.amount) * 100), // convert to smallest unit
    currency: 'inr',
    capture_method: 'manual', // authorize only
    metadata: { project_id: project.id, bid_id: bid.id },
  });

  // Update the project with the intent ID and pending escrow status
  await require('../config/database').project.update({
    where: { id: project.id },
    data: {
      stripePaymentIntentId: intent.id,
      escrowStatus: 'pending',
    }
  });

  result.client_secret = intent.client_secret;

  return result;
};

module.exports = { createBid, getBidsForProject, updateBid, deleteBid, acceptBid };
