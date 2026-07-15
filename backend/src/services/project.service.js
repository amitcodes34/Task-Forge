// =============================================================================
// src/services/project.service.js – Project Business Logic
// =============================================================================
// Handles all project-related business rules including:
//   - Ownership validation
//   - Status transition enforcement (state machine)
//   - Soft deletes (deletedAt timestamp – never hard delete)
//   - Delivery and completion flow with audit logging
// =============================================================================

const projectRepo = require('../repositories/project.repository');
const { log, AuditActions } = require('./audit.service');
const { emailQueue } = require('../queues/emailQueue');
const ApiError = require('../utils/ApiError');

// ---------------------------------------------------------------------------
// Create a new project (CLIENT only – enforced in route)
// ---------------------------------------------------------------------------
const createProject = async (clientId, projectData, { ip } = {}) => {
  const project = await projectRepo.createProject({ clientId, ...projectData });

  log({ actorId: clientId, action: AuditActions.PROJECT_CREATED, resourceType: 'Project', resourceId: project.id, metadata: { title: project.title }, ip });

  return project;
};

// ---------------------------------------------------------------------------
// List projects with filters, pagination, and search
// ---------------------------------------------------------------------------
const getProjects = async (queryParams) => {
  // Parse and sanitize query params – all values from URL are strings,
  // so we must convert them to the correct types before passing to Prisma.
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 9));

  // Whitelist allowed sort fields to prevent Prisma injection
  const ALLOWED_SORT_FIELDS = ['createdAt', 'budget', 'deadline', 'updatedAt'];
  const sortBy = ALLOWED_SORT_FIELDS.includes(queryParams.sortBy)
    ? queryParams.sortBy
    : 'createdAt';

  const sortOrder = queryParams.sortOrder === 'asc' ? 'asc' : 'desc';

  // Optional filters
  const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'];
  const status = VALID_STATUSES.includes(queryParams.status) ? queryParams.status : undefined;
  const search = queryParams.search ? String(queryParams.search).trim() : undefined;
  const minBudget = queryParams.minBudget ? parseFloat(queryParams.minBudget) : undefined;
  const maxBudget = queryParams.maxBudget ? parseFloat(queryParams.maxBudget) : undefined;
  const skill = queryParams.skill ? String(queryParams.skill).trim() : undefined;

  return projectRepo.findProjects({ page, limit, status, search, sortBy, sortOrder, minBudget, maxBudget, skill });
};

// ---------------------------------------------------------------------------
// Get a single project by ID
// ---------------------------------------------------------------------------
const getProjectById = async (id) => {
  const project = await projectRepo.findProjectById(id);
  if (!project) {
    throw ApiError.notFound(`Project with ID '${id}' not found.`);
  }
  return project;
};

// ---------------------------------------------------------------------------
// Update a project (ownership check enforced here, not in middleware)
// ---------------------------------------------------------------------------
const updateProject = async (projectId, requestingUserId, updateData, { ip } = {}) => {
  const project = await projectRepo.findProjectByIdRaw(projectId);

  if (!project || project.deletedAt) {
    throw ApiError.notFound('Project not found.');
  }

  // Ownership check: only the client who created the project can update it
  if (project.clientId !== requestingUserId) {
    throw ApiError.forbidden('You do not have permission to update this project.');
  }

  // Status check: cannot update a project that is already completed or in progress
  if (['COMPLETED', 'IN_PROGRESS', 'DELIVERED'].includes(project.status)) {
    throw ApiError.badRequest(
      `Cannot update a project with status '${project.status}'. Only OPEN projects can be edited.`
    );
  }

  const updated = await projectRepo.updateProject(projectId, updateData);

  log({ actorId: requestingUserId, action: AuditActions.PROJECT_UPDATED, resourceType: 'Project', resourceId: projectId, metadata: { changes: Object.keys(updateData) }, ip });

  return updated;
};

// ---------------------------------------------------------------------------
// Soft Delete a project (ownership check)
// Never hard-delete – set deletedAt instead. Deleted projects remain in DB.
// ---------------------------------------------------------------------------
const deleteProject = async (projectId, requestingUserId, { ip } = {}) => {
  const project = await projectRepo.findProjectByIdRaw(projectId);

  if (!project || project.deletedAt) {
    throw ApiError.notFound('Project not found.');
  }

  if (project.clientId !== requestingUserId) {
    throw ApiError.forbidden('You do not have permission to delete this project.');
  }

  if (['IN_PROGRESS', 'DELIVERED'].includes(project.status)) {
    throw ApiError.badRequest(
      'Cannot delete a project that is currently in progress or has been delivered.'
    );
  }

  // Soft delete: set deletedAt timestamp
  await projectRepo.softDeleteProject(projectId);

  log({ actorId: requestingUserId, action: AuditActions.PROJECT_DELETED, resourceType: 'Project', resourceId: projectId, metadata: { title: project.title }, ip });
};

// ---------------------------------------------------------------------------
// Mark as Delivered (FREELANCER who won the bid)
// ---------------------------------------------------------------------------
const deliverProject = async (projectId, requestingUserId, deliveryData, { ip } = {}) => {
  const project = await projectRepo.findProjectByIdRaw(projectId);

  if (!project || project.deletedAt) {
    throw ApiError.notFound('Project not found.');
  }

  if (project.status !== 'IN_PROGRESS') {
    throw ApiError.badRequest(
      `Cannot deliver a project with status '${project.status}'. Project must be IN_PROGRESS.`
    );
  }

  // Verify that the requesting user is the accepted freelancer
  if (!project.winningBidId) {
    throw ApiError.badRequest('No winning bid found for this project.');
  }

  // We need to check against the winning bid's freelancer ID
  const prisma = require('../config/database');
  const winningBid = await prisma.bid.findUnique({ where: { id: project.winningBidId } });

  if (!winningBid || winningBid.freelancerId !== requestingUserId) {
    throw ApiError.forbidden('Only the accepted freelancer can deliver this project.');
  }

  // Record the delivery note in the Delivery table
  await prisma.delivery.create({
    data: {
      projectId,
      freelancerId: requestingUserId,
      note: deliveryData?.note || 'Work delivered.',
      attachmentUrl: deliveryData?.attachmentUrl || null,
    },
  });

  const updated = await projectRepo.updateProject(projectId, { status: 'DELIVERED' });

  log({ actorId: requestingUserId, action: AuditActions.PROJECT_DELIVERED, resourceType: 'Project', resourceId: projectId, ip });

  return updated;
};

// ---------------------------------------------------------------------------
// Mark as Completed (project owner / CLIENT)
// ---------------------------------------------------------------------------
const completeProject = async (projectId, requestingUserId, { ip } = {}) => {
  const project = await projectRepo.findProjectByIdRaw(projectId);

  if (!project || project.deletedAt) {
    throw ApiError.notFound('Project not found.');
  }

  if (project.clientId !== requestingUserId) {
    throw ApiError.forbidden('Only the project owner can mark a project as completed.');
  }

  if (project.status !== 'DELIVERED') {
    throw ApiError.badRequest(
      `Cannot complete a project with status '${project.status}'. Project must be DELIVERED first.`
    );
  }

  const updated = await projectRepo.updateProject(projectId, { status: 'COMPLETED' });

  log({ actorId: requestingUserId, action: AuditActions.PROJECT_COMPLETED, resourceType: 'Project', resourceId: projectId, ip });

  // Notify freelancer via background job
  if (project.winningBidId) {
    const prisma = require('../config/database');
    const winningBid = await prisma.bid.findUnique({
      where: { id: project.winningBidId },
      include: { freelancer: true }
    });
    
    if (winningBid?.freelancer?.email) {
      await emailQueue.add('project_completed', {
        to: winningBid.freelancer.email,
        subject: `🏆 Project Completed! – ${project.title}`,
        templateName: 'project_completed',
        templateData: {
          freelancerName: winningBid.freelancer.firstName || 'Freelancer',
          projectTitle: project.title,
          projectId: project.id
        }
      });
    }
  }

  return updated;
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
