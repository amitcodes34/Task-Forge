// =============================================================================
// src/controllers/auth.controller.js – Auth HTTP Request Handlers
// =============================================================================
// Controllers are thin – they extract data from req, call the service, and
// return the response. No business logic lives here.
// =============================================================================

const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    ApiResponse.created(
      res,
      'Registration successful! Please check your email to verify your account.',
      { user }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body, { ip: req.ip });
    ApiResponse.success(res, 200, 'Login successful.', { accessToken, refreshToken, user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    ApiResponse.noContent(res, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/refresh-token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const { accessToken } = await authService.refreshAccessToken(refreshToken);
    ApiResponse.success(res, 200, 'Access token refreshed.', { accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/verify-email
 */
const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.body.token);
    ApiResponse.success(res, 200, 'Email verified successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    // Always return 200 to prevent user enumeration
    ApiResponse.success(
      res,
      200,
      'If an account with that email exists, a password reset link has been sent.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    ApiResponse.success(
      res,
      200,
      'Password reset successfully. Please log in with your new password.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.userId);
    ApiResponse.success(res, 200, 'User profile retrieved.', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
};
