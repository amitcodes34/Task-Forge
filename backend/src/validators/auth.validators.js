// =============================================================================
// src/validators/auth.validators.js – Auth Input Validation Schemas
// =============================================================================
// Zod schemas for all authentication-related request bodies.
// These schemas define the contract between the client and the API.
// =============================================================================

const { z } = require('zod');

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
const registerSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .trim(),

  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .trim(),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  role: z.enum(['CLIENT', 'FREELANCER'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be either CLIENT or FREELANCER',
  }),

  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),

  password: z.string({ required_error: 'Password is required' }),
});

// ---------------------------------------------------------------------------
// Refresh Token
// ---------------------------------------------------------------------------
const refreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token is required' }),
});

// ---------------------------------------------------------------------------
// Email Verification
// ---------------------------------------------------------------------------
const verifyEmailSchema = z.object({
  token: z.string({ required_error: 'Verification token is required' }),
});

// ---------------------------------------------------------------------------
// Forgot Password
// ---------------------------------------------------------------------------
const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
});

// ---------------------------------------------------------------------------
// Reset Password
// ---------------------------------------------------------------------------
const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Reset token is required' }),
  password: z
    .string({ required_error: 'New password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
