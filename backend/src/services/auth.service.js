// =============================================================================
// src/services/auth.service.js – Authentication Business Logic
// =============================================================================
// This layer contains all auth-related business rules. It orchestrates
// repositories and utilities but has NO knowledge of HTTP (req/res).
// =============================================================================

const crypto = require('crypto');
const authRepo = require('../repositories/auth.repository');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const jwtConfig = require('../config/jwt');
const ApiError = require('../utils/ApiError');
const { log, AuditActions } = require('./audit.service');

// ---------------------------------------------------------------------------
// Register a new user
// ---------------------------------------------------------------------------
const register = async ({ firstName, lastName, email, password, role, bio }) => {
  // 1. Ensure email is not already taken
  const existingUser = await authRepo.findUserByEmail(email);
  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists.');
  }

  // 2. Hash password before storage
  const passwordHash = await hashPassword(password);

  // 3. Create the user record
  const user = await authRepo.createUser({ email, passwordHash, firstName, lastName, role, bio });

  // 4. Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await authRepo.createVerificationToken(
    user.id,
    verificationToken,
    'EMAIL_VERIFICATION',
    jwtConfig.verificationTokenExpiresInMs
  );

  // 5. Send verification email (fire-and-forget – don't block registration)
  sendVerificationEmail(email, verificationToken).catch((err) =>
    console.error('⚠️  Failed to send verification email:', err.message)
  );

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
};

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
const login = async ({ email, password }, { ip } = {}) => {
  // 1. Find user (include password hash for comparison)
  const user = await authRepo.findUserByEmail(email);
  if (!user) {
    // Use a generic message to prevent user enumeration attacks
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // 2. Check if account is banned
  if (user.isBanned) {
    throw ApiError.forbidden('Your account has been suspended. Please contact support.');
  }

  // 3. Compare passwords
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // 4. Check email verification
  // NOTE: In development mode, email verification is skipped so you can test
  // without a real SMTP server. In production (NODE_ENV=production), this check
  // is enforced and users must verify their email before logging in.
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !user.isEmailVerified) {
    throw ApiError.forbidden(
      'Please verify your email address before logging in. Check your inbox.'
    );
  }

  // 5. Generate tokens
  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  // 6. Persist refresh token
  await authRepo.createRefreshToken(user.id, refreshToken);

  // Fire-and-forget audit log
  log({
    actorId: user.id,
    action: AuditActions.USER_LOGIN,
    resourceType: 'User',
    resourceId: user.id,
    metadata: { email: user.email, role: user.role },
    ip,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
};

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
const logout = async (refreshToken) => {
  if (!refreshToken) {
    throw ApiError.badRequest('Refresh token is required to logout.');
  }
  await authRepo.deleteRefreshToken(refreshToken);
};

// ---------------------------------------------------------------------------
// Refresh Access Token
// ---------------------------------------------------------------------------
const refreshAccessToken = async (refreshToken) => {
  // 1. Verify the JWT signature and expiry
  const decoded = verifyRefreshToken(refreshToken);

  // 2. Check if token exists in DB (it may have been revoked)
  const storedToken = await authRepo.findRefreshToken(refreshToken);
  if (!storedToken) {
    throw ApiError.unauthorized('Refresh token has been revoked. Please log in again.');
  }

  // 3. Check DB-level expiry (double safety)
  if (storedToken.expiresAt < new Date()) {
    await authRepo.deleteRefreshToken(refreshToken);
    throw ApiError.unauthorized('Refresh token has expired. Please log in again.');
  }

  const user = storedToken.user;

  // 4. Check if user is still active
  if (user.isBanned) {
    throw ApiError.forbidden('Your account has been suspended.');
  }

  // 5. Issue new access token
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { accessToken: newAccessToken };
};

// ---------------------------------------------------------------------------
// Verify Email
// ---------------------------------------------------------------------------
const verifyEmail = async (token) => {
  const record = await authRepo.findVerificationToken(token, 'EMAIL_VERIFICATION');

  if (!record) {
    throw ApiError.badRequest('Invalid or expired verification token.');
  }

  if (record.expiresAt < new Date()) {
    throw ApiError.badRequest('This verification link has expired. Please request a new one.');
  }

  if (record.user.isEmailVerified) {
    throw ApiError.conflict('Your email is already verified.');
  }

  // Mark email as verified and invalidate the token
  await Promise.all([
    authRepo.markEmailVerified(record.userId),
    authRepo.markTokenAsUsed(record.id),
  ]);
};

// ---------------------------------------------------------------------------
// Forgot Password
// ---------------------------------------------------------------------------
const forgotPassword = async (email) => {
  const user = await authRepo.findUserByEmail(email);

  // Always respond with success even if user not found (prevents enumeration)
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  // Password reset tokens expire in 1 hour
  await authRepo.createVerificationToken(user.id, resetToken, 'PASSWORD_RESET', 60 * 60 * 1000);

  sendPasswordResetEmail(email, resetToken).catch((err) =>
    console.error('⚠️  Failed to send password reset email:', err.message)
  );
};

// ---------------------------------------------------------------------------
// Reset Password
// ---------------------------------------------------------------------------
const resetPassword = async (token, newPassword) => {
  const record = await authRepo.findVerificationToken(token, 'PASSWORD_RESET');

  if (!record) {
    throw ApiError.badRequest('Invalid or expired password reset token.');
  }

  if (record.expiresAt < new Date()) {
    throw ApiError.badRequest('This reset link has expired. Please request a new password reset.');
  }

  const newPasswordHash = await hashPassword(newPassword);

  await Promise.all([
    authRepo.updatePasswordHash(record.userId, newPasswordHash),
    authRepo.markTokenAsUsed(record.id),
    // Revoke all refresh tokens to force re-login on all devices
    authRepo.deleteAllRefreshTokensForUser(record.userId),
  ]);
};

// ---------------------------------------------------------------------------
// Get User Profile with Stats
// ---------------------------------------------------------------------------
const getUserProfile = async (userId) => {
  const user = await authRepo.findUserByIdWithStats(userId);
  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  // Calculate average rating
  let avgRating = 0;
  if (user.reviewsReceived && user.reviewsReceived.length > 0) {
    const sum = user.reviewsReceived.reduce((acc, curr) => acc + curr.rating, 0);
    avgRating = Number((sum / user.reviewsReceived.length).toFixed(1));
  }

  let stats = {};
  if (user.role === 'CLIENT') {
    stats = {
      total: user.projects.length,
      active: user.projects.filter((p) => ['IN_PROGRESS', 'DELIVERED'].includes(p.status)).length,
      completed: user.projects.filter((p) => p.status === 'COMPLETED').length,
      pendingProposals: user.bids ? user.bids.filter((b) => b.status === 'PENDING').length : 0,
      avgRating,
    };
  } else {
    stats = {
      bidsPlaced: user.bids.length,
      projectsWon: user.bids.filter((b) => b.status === 'ACCEPTED').length,
      inProgress: user.bids.filter(
        (b) => b.status === 'ACCEPTED' && ['IN_PROGRESS', 'DELIVERED'].includes(b.project.status)
      ).length,
      pendingProposals: user.bids.filter((b) => b.status === 'PENDING').length,
      completed: user.bids.filter(
        (b) => b.status === 'ACCEPTED' && b.project.status === 'COMPLETED'
      ).length,
      avgRating,
    };
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    skills: user.skills,
    jobTitle: user.jobTitle,
    location: user.location,
    hourlyRate: user.hourlyRate ? Number(user.hourlyRate) : null,
    recentEarnings: user.recentEarnings ? Number(user.recentEarnings) : 0,
    activeHours: user.activeHours ? Number(user.activeHours) : 0,
    topRated: user.topRated,
    stats,
    reviews: user.reviewsReceived || [],
  };
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getUserProfile,
};
