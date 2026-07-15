// =============================================================================
// src/services/admin.service.js – Admin Business Logic
// =============================================================================

const adminRepo = require('../repositories/admin.repository');
const { log, AuditActions } = require('./audit.service');
const ApiError = require('../utils/ApiError');

const getAllUsers = async (queryParams) => {
  return adminRepo.findAllUsers(queryParams);
};

const getAllProjects = async (queryParams) => {
  return adminRepo.findAllProjects(queryParams);
};

const getStats = async () => {
  return adminRepo.getPlatformStats();
};

const getAuditLogs = async (queryParams) => {
  return adminRepo.findAuditLogs(queryParams);
};

const banUser = async (targetUserId, adminId, { ip } = {}) => {
  const user = await adminRepo.findUserByIdAdmin(targetUserId);
  if (!user) throw ApiError.notFound('User not found.');

  // Prevent admin from banning themselves
  if (user.id === adminId) throw ApiError.badRequest('Admins cannot ban themselves.');

  // Prevent banning other admins
  if (user.role === 'ADMIN') throw ApiError.forbidden('Admin accounts cannot be banned.');

  if (user.isBanned) throw ApiError.conflict('This user is already banned.');

  const updated = await adminRepo.setUserBanStatus(targetUserId, true);

  // Audit log (fire-and-forget)
  log({
    actorId: adminId,
    action: AuditActions.USER_BANNED,
    resourceType: 'User',
    resourceId: targetUserId,
    metadata: { email: user.email, role: user.role },
    ip,
  });

  return updated;
};

const unbanUser = async (targetUserId, adminId, { ip } = {}) => {
  const user = await adminRepo.findUserByIdAdmin(targetUserId);
  if (!user) throw ApiError.notFound('User not found.');
  if (!user.isBanned) throw ApiError.conflict('This user is not banned.');

  const updated = await adminRepo.setUserBanStatus(targetUserId, false);

  // Audit log
  log({
    actorId: adminId,
    action: AuditActions.USER_UNBANNED,
    resourceType: 'User',
    resourceId: targetUserId,
    metadata: { email: user.email },
    ip,
  });

  return updated;
};

module.exports = { getAllUsers, getAllProjects, getStats, getAuditLogs, banUser, unbanUser };
