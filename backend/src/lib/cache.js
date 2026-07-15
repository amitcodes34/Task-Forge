const { redisConnection, USE_REDIS } = require('../config/redis');

/**
 * Get a value from the Redis cache.
 * @param {string} key
 * @returns {object|null}
 */
const getCache = async (key) => {
  if (!USE_REDIS || !redisConnection) return null;
  try {
    const value = await redisConnection.get(key);
    if (value) return JSON.parse(value);
  } catch (err) {
    console.error(`[Cache] Error reading ${key}:`, err.message);
  }
  return null;
};

/**
 * Set a value in the Redis cache.
 * @param {string} key
 * @param {object} value
 * @param {number} ttl - Time to live in seconds (default 60)
 */
const setCache = async (key, value, ttl = 60) => {
  if (!USE_REDIS || !redisConnection) return;
  try {
    await redisConnection.setex(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error(`[Cache] Error setting ${key}:`, err.message);
  }
};

/**
 * Invalidate all keys matching a pattern (e.g. 'projects:*')
 * @param {string} pattern
 */
const invalidatePattern = async (pattern) => {
  if (!USE_REDIS || !redisConnection) return;
  try {
    let cursor = '0';
    do {
      const res = await redisConnection.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = res[0];
      const keys = res[1];
      if (keys.length > 0) {
        await redisConnection.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    console.error(`[Cache] Error invalidating ${pattern}:`, err.message);
  }
};

module.exports = { getCache, setCache, invalidatePattern };
