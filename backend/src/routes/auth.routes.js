// =============================================================================
// src/routes/auth.routes.js – Authentication Routes
// =============================================================================
// Maps HTTP endpoints to controller methods with appropriate middleware.
// Rate limiting is applied to sensitive endpoints to prevent brute-force.
// =============================================================================

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validators');
const authenticate = require('../middleware/authenticate');

const router = Router();

// ---------------------------------------------------------------------------
// Rate Limiters
// ---------------------------------------------------------------------------

// Strict limiter for login/register to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// More lenient limiter for password reset (one per minute per IP)
const resetLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many reset requests. Please wait a minute.' },
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new CLIENT or FREELANCER account
 * @access  Public
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login and receive JWT access + refresh tokens
 * @access  Public
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Invalidate a refresh token (logout)
 * @access  Public (token in body)
 */
router.post('/logout', validate(refreshTokenSchema), authController.logout);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Exchange a valid refresh token for a new access token
 * @access  Public (refresh token in body)
 */
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify a user's email address using a token from the email link
 * @access  Public
 */
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request a password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  resetLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using the token from the reset email
 * @access  Public
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get the current logged-in user profile with stats
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
