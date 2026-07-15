// =============================================================================
// src/config/database.js – Prisma Client Singleton
// =============================================================================
// Exports a single PrismaClient instance used throughout the application.
// In development, the instance is stored on `global` to prevent hot-reload
// from creating multiple connections (a common issue with nodemon).
// =============================================================================

const { PrismaClient } = require('@prisma/client');

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

// Prevent multiple Prisma instances in development (nodemon restarts)
const prisma = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

module.exports = prisma;
