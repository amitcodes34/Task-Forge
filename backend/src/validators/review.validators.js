// =============================================================================
// src/validators/review.validators.js – Review Input Validation Schemas
// =============================================================================

const { z } = require('zod');

const createReviewSchema = z.object({
  projectId: z
    .string({ required_error: 'Project ID is required' })
    .uuid('Project ID must be a valid UUID'),

  targetId: z
    .string({ required_error: 'Target user ID is required' })
    .uuid('Target user ID must be a valid UUID'),

  rating: z
    .number({ required_error: 'Rating is required', invalid_type_error: 'Rating must be a number' })
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),

  comment: z
    .string({ required_error: 'Review comment is required' })
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must not exceed 1000 characters')
    .trim(),
});

module.exports = { createReviewSchema };
