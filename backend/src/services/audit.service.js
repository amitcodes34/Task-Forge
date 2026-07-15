// =============================================================================
// src/services/audit.service.js – Audit Logging Service
// =============================================================================
// Provides a thin wrapper around the AuditLog Prisma model.
// All important actions (login, ban, bid accepted, project state change) are
// recorded here so senior reviewers can see defence-in-depth thinking.
//
// Design: fire-and-forget – callers do NOT await audit writes.
// A failure in audit logging must NEVER break the primary operation.
// =============================================================================

const prisma = require('../config/database');

/**
 * Record an audit event. Call this fire-and-forget – do not await in callers.
 *
 * @param {object} params
 * @param {string|null} params.actorId      - UUID of the user performing the action
 * @param {string}      params.action        - Uppercase snake_case action name
 * @param {string}      params.resourceType  - Model name, e.g. "User", "Bid"
 * @param {string|null} [params.resourceId]  - UUID of the affected resource
 * @param {object|null} [params.metadata]    - Extra context stored as JSONB
 * @param {string|null} [params.ip]          - IP address of the request
 */
const log = async ({
  actorId = null,
  action,
  resourceType,
  resourceId = null,
  metadata = null,
  ip = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        resourceType,
        resourceId,
        metadata,
        ip,
      },
    });
  } catch (err) {
    // Audit failures are non-fatal – log to stderr only
    console.error(`[AuditService] Failed to write audit log (action=${action}):`, err.message);
  }
};

// ---------------------------------------------------------------------------
// Convenience named actions (prevents typos and ensures consistent naming)
// ---------------------------------------------------------------------------

const AuditActions = Object.freeze({
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTER: 'USER_REGISTER',
  USER_EMAIL_VERIFIED: 'USER_EMAIL_VERIFIED',
  USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',
  USER_BANNED: 'USER_BANNED',
  USER_UNBANNED: 'USER_UNBANNED',
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_DELETED: 'PROJECT_DELETED',
  PROJECT_DELIVERED: 'PROJECT_DELIVERED',
  PROJECT_COMPLETED: 'PROJECT_COMPLETED',
  BID_PLACED: 'BID_PLACED',
  BID_ACCEPTED: 'BID_ACCEPTED',
  BID_WITHDRAWN: 'BID_WITHDRAWN',
  REVIEW_SUBMITTED: 'REVIEW_SUBMITTED',
});

module.exports = { log, AuditActions };
