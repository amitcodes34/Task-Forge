// =============================================================================
// src/validators/bid.validators.js – Bid Input Validation Schemas
// =============================================================================

const { z } = require('zod');

// ---------------------------------------------------------------------------
// Create Bid
// ---------------------------------------------------------------------------
const createBidSchema = z.object({
  amount: z
    .number({
      required_error: 'Bid amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Bid amount must be a positive number')
    .max(1000000, 'Bid amount cannot exceed $1,000,000'),

  proposal: z
    .string({ required_error: 'Proposal is required' })
    .min(50, 'Proposal must be at least 50 characters to be competitive')
    .max(2000, 'Proposal must not exceed 2000 characters')
    .trim(),

  deliveryDays: z
    .number({
      required_error: 'Delivery time is required',
      invalid_type_error: 'Delivery days must be a number',
    })
    .int('Delivery days must be a whole number')
    .positive('Delivery days must be positive')
    .max(365, 'Delivery time cannot exceed 365 days'),
});

// ---------------------------------------------------------------------------
// Update Bid (all fields optional)
// ---------------------------------------------------------------------------
const updateBidSchema = createBidSchema.partial();

module.exports = { createBidSchema, updateBidSchema };
