// =============================================================================
// src/repositories/project.repository.js – Project Data Access Layer
// =============================================================================

const prisma = require('../config/database');

// Fields to select when returning project data (excludes internal-only fields)
const PROJECT_SELECT = {
  id: true,
  title: true,
  description: true,
  budget: true,
  status: true,
  skillsRequired: true,
  deadline: true,
  winningBidId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  client: {
    select: { 
      id: true, 
      firstName: true, 
      lastName: true, 
      avatarUrl: true,
      hiringRate: true,
      totalSpent: true,
      avgHourlyRatePaid: true,
      location: true,
      reviewsReceived: {
        select: { rating: true }
      }
    },
  },
  winningBid: {
    select: {
      id: true,
      amount: true,
      deliveryDays: true,
      freelancer: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
  },
  _count: { select: { bids: true } },
};

/**
 * Create a new project.
 */
const createProject = async ({
  clientId,
  title,
  description,
  budget,
  skillsRequired,
  deadline,
}) => {
  return prisma.project.create({
    data: { clientId, title, description, budget, skillsRequired, deadline },
    select: PROJECT_SELECT,
  });
};

/**
 * Find a single project by its ID (excludes soft-deleted).
 */
const findProjectById = async (id) => {
  return prisma.project.findFirst({
    where: { id, deletedAt: null },
    select: PROJECT_SELECT,
  });
};

/**
 * Find a project by ID including raw client/winning bid IDs for ownership checks.
 * Returns null if not found (including soft-deleted).
 */
const findProjectByIdRaw = async (id) => {
  return prisma.project.findUnique({ where: { id } });
};

/**
 * List projects with pagination, search, filtering, and sorting.
 * Only returns non-deleted projects (soft-delete aware).
 */
const findProjects = async ({
  page,
  limit,
  status,
  search,
  sortBy,
  sortOrder,
  minBudget,
  maxBudget,
  skill,
}) => {
  const skip = (page - 1) * limit;

  const where = {
    // Always filter out soft-deleted projects on the public feed
    deletedAt: null,
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    // Skill filter: project must include the requested skill
    ...(skill && { skillsRequired: { has: skill } }),
    // Budget range filter
    ...((minBudget !== undefined || maxBudget !== undefined) && {
      budget: {
        ...(minBudget !== undefined && { gte: minBudget }),
        ...(maxBudget !== undefined && { lte: maxBudget }),
      },
    }),
  };

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: PROJECT_SELECT,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Update a project.
 */
const updateProject = async (id, data) => {
  return prisma.project.update({
    where: { id },
    data,
    select: PROJECT_SELECT,
  });
};

/**
 * Soft-delete a project by setting deletedAt to now().
 * The record remains in the database and is visible to admins.
 */
const softDeleteProject = async (id) => {
  return prisma.project.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

module.exports = {
  createProject,
  findProjectById,
  findProjectByIdRaw,
  findProjects,
  updateProject,
  softDeleteProject,
};
