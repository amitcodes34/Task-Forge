// =============================================================================
// src/middleware/validate.js – Request Validation Middleware
// =============================================================================
// A factory middleware that accepts a Zod schema and validates the incoming
// request body (or query/params as needed). Throws a ZodError on failure which
// the global error handler converts to a 400 response with field-level details.
//
// Usage:
//   const { validate } = require('../middleware/validate');
//   const { registerSchema } = require('../validators/auth.validators');
//
//   router.post('/register', validate(registerSchema), authController.register);
// =============================================================================

/**
 * Validate req.body against a Zod schema.
 * @param {ZodSchema} schema - Zod schema to validate against
 * @param {'body'|'query'|'params'} source - Request property to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      // parse() throws a ZodError on failure; the global handler catches it
      // parseAsync is used for schemas with async refinements
      const parsed = schema.parse(req[source]);

      // Replace req[source] with the sanitized/parsed output (strips unknown fields)
      req[source] = parsed;

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { validate };
