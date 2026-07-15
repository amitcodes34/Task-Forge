// =============================================================================
// src/validators/project.validators.js – Project Input Validation Schemas
// =============================================================================

const { z } = require('zod');

// ---------------------------------------------------------------------------
// Create Project
// ---------------------------------------------------------------------------
const createProjectSchema = z.object({
  title: z
    .string({ required_error: 'Project title is required' })
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title must not exceed 150 characters')
    .trim(),

  description: z
    .string({ required_error: 'Project description is required' })
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must not exceed 5000 characters')
    .trim(),

  budget: z
    .number({ required_error: 'Budget is required', invalid_type_error: 'Budget must be a number' })
    .positive('Budget must be a positive number')
    .max(1000000, 'Budget cannot exceed $1,000,000'),

  skillsRequired: z
    .array(z.string().trim().min(1))
    .min(1, 'At least one skill is required')
    .max(15, 'Cannot specify more than 15 skills')
    .optional()
    .default([]),

  deadline: z
    .string()
    .datetime({ message: 'Deadline must be a valid ISO 8601 date string' })
    .refine((date) => new Date(date) > new Date(), 'Deadline must be a future date')
    .optional()
    .nullable(),
});

// ---------------------------------------------------------------------------
// Update Project
// ---------------------------------------------------------------------------
const updateProjectSchema = createProjectSchema.partial();

// ---------------------------------------------------------------------------
// Query params for listing projects
// ---------------------------------------------------------------------------
const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED']).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['createdAt', 'budget', 'deadline']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  minBudget: z.coerce.number().positive().optional(),
  maxBudget: z.coerce.number().positive().optional(),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
};
