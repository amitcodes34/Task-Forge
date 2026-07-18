// =============================================================================
// src/repositories/auth.repository.js – Auth Data Access Layer
// =============================================================================
// Contains all database queries related to authentication.
// Services call these methods instead of using Prisma directly.
// This ensures that if we switch ORMs, only this file needs to change.
// =============================================================================

const prisma = require('../config/database');
const jwtConfig = require('../config/jwt');

// ---------------------------------------------------------------------------
// User Queries
// ---------------------------------------------------------------------------

/**
 * Find a user by their email address.
 */
const findUserByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } });
};

/**
 * Find a user by their UUID.
 */
const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      bio: true,
      avatarUrl: true,
      isEmailVerified: true,
      isBanned: true,
      createdAt: true,
    },
  });
};

/**
 * Find a user by UUID, including their relations needed for dashboard stats.
 */
const findUserByIdWithStats = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      projects: {
        select: { status: true },
      },
      bids: {
        select: { status: true, project: { select: { status: true } } },
      },
      reviewsReceived: {
        select: { 
          rating: true, 
          comment: true, 
          createdAt: true,
          reviewer: { select: { firstName: true, lastName: true, avatarUrl: true } } 
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
};

/**
 * Create a new user record.
 */
const createUser = async ({ email, passwordHash, firstName, lastName, role, bio }) => {
  return prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role, bio },
  });
};

// ---------------------------------------------------------------------------
// Refresh Token Queries
// ---------------------------------------------------------------------------

/**
 * Store a new refresh token in the database.
 */
const createRefreshToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + jwtConfig.refreshToken.expiresInMs);
  return prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });
};

/**
 * Find a refresh token record by its token string.
 */
const findRefreshToken = async (token) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
};

/**
 * Delete a refresh token (logout).
 */
const deleteRefreshToken = async (token) => {
  return prisma.refreshToken.deleteMany({ where: { token } });
};

/**
 * Delete all refresh tokens for a user (force logout from all devices).
 */
const deleteAllRefreshTokensForUser = async (userId) => {
  return prisma.refreshToken.deleteMany({ where: { userId } });
};

// ---------------------------------------------------------------------------
// Verification / Password Reset Token Queries
// ---------------------------------------------------------------------------

/**
 * Create a new email verification or password reset token.
 */
const createVerificationToken = async (userId, token, type, expiresInMs) => {
  const expiresAt = new Date(Date.now() + expiresInMs);
  // Invalidate any existing tokens of the same type for this user first
  await prisma.verificationToken.deleteMany({ where: { userId, type } });

  return prisma.verificationToken.create({
    data: { userId, token, type, expiresAt },
  });
};

/**
 * Find a verification token record.
 */
const findVerificationToken = async (token, type) => {
  return prisma.verificationToken.findFirst({
    where: {
      token,
      type,
      usedAt: null, // Not already used
    },
    include: { user: true },
  });
};

/**
 * Mark a verification token as used.
 */
const markTokenAsUsed = async (id) => {
  return prisma.verificationToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
};

/**
 * Mark a user's email as verified.
 */
const markEmailVerified = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isEmailVerified: true },
  });
};

/**
 * Update a user's password hash.
 */
const updatePasswordHash = async (userId, passwordHash) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByIdWithStats,
  createUser,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllRefreshTokensForUser,
  createVerificationToken,
  findVerificationToken,
  markTokenAsUsed,
  markEmailVerified,
  updatePasswordHash,
};
