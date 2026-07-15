// =============================================================================
// src/repositories/admin.repository.js – Admin Data Access Layer
// =============================================================================

const prisma = require('../config/database');

/**
 * List all users (with optional pagination).
 */
const findAllUsers = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        isBanned: true,
        skills: true,
        createdAt: true,
        deletedAt: true,
        _count: { select: { projects: true, bids: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Toggle a user's banned status.
 */
const setUserBanStatus = async (userId, isBanned) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isBanned },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isBanned: true,
    },
  });
};

/**
 * Find a user by ID (admin context – includes sensitive fields).
 */
const findUserByIdAdmin = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      isBanned: true,
    },
  });
};

/**
 * List all projects (admin overview) – includes soft-deleted.
 */
const findAllProjects = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      // Admin sees ALL projects, including soft-deleted
      select: {
        id: true,
        title: true,
        budget: true,
        status: true,
        createdAt: true,
        deletedAt: true,
        client: { select: { id: true, email: true, firstName: true, lastName: true } },
        _count: { select: { bids: true } },
      },
    }),
    prisma.project.count(),
  ]);

  return {
    projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Aggregate platform-wide stats for the admin dashboard.
 */
const getPlatformStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalFreelancers,
    totalClients,
    activeProjects,
    completedProjects,
    bidsToday,
    totalBids,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: 'FREELANCER', deletedAt: null } }),
    prisma.user.count({ where: { role: 'CLIENT', deletedAt: null } }),
    prisma.project.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS', 'DELIVERED'] }, deletedAt: null },
    }),
    prisma.project.count({ where: { status: 'COMPLETED', deletedAt: null } }),
    prisma.bid.count({ where: { createdAt: { gte: today } } }),
    prisma.bid.count(),
  ]);

  // Revenue estimate: sum of accepted bids' amounts
  const revenueData = await prisma.bid.aggregate({
    _sum: { amount: true },
    where: { status: 'ACCEPTED' },
  });

  return {
    totalUsers,
    totalFreelancers,
    totalClients,
    activeProjects,
    completedProjects,
    bidsToday,
    totalBids,
    revenueEstimate: Number(revenueData._sum.amount || 0),
  };
};

/**
 * Fetch audit logs (paginated, newest first).
 */
const findAuditLogs = async ({ page = 1, limit = 30, action } = {}) => {
  const skip = (page - 1) * limit;
  const where = action ? { action } : {};

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        resourceType: true,
        resourceId: true,
        metadata: true,
        ip: true,
        createdAt: true,
        actor: {
          select: { id: true, email: true, firstName: true, lastName: true, role: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  findAllUsers,
  setUserBanStatus,
  findUserByIdAdmin,
  findAllProjects,
  getPlatformStats,
  findAuditLogs,
};
