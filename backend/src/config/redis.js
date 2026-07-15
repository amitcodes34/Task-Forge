// =============================================================================
// src/config/redis.js – Redis Connection Setup
// =============================================================================

const Redis = require('ioredis');

// Default Redis connection settings
// In production, you would configure this via process.env.REDIS_URL
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    if (times > 3) {
      console.warn('⚠️  Giving up on Redis connection. Background jobs will not work.');
      return null; // Stop retrying
    }
    return Math.min(times * 1000, 3000); // Wait 1s, 2s, 3s between retries
  },
};

const USE_REDIS = process.env.USE_REDIS === 'true';

// Create a single shared Redis instance to be used across the app
const redisConnection = USE_REDIS ? new Redis(redisConfig) : null;

if (redisConnection) {
  redisConnection.on('connect', () => {
    console.log('✅ Connected to Redis successfully.');
  });

  redisConnection.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
  });
}

module.exports = {
  redisConnection,
  redisConfig,
  USE_REDIS,
};
