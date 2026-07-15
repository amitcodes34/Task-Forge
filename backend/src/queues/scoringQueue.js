const { Queue } = require('bullmq');
const { redisConfig } = require('../config/redis');

// Initialize the AI scoring queue
const USE_REDIS = process.env.USE_REDIS === 'true';
let scoringQueue;

if (USE_REDIS) {
  scoringQueue = new Queue('scoring', { connection: redisConfig });
  console.log('[Queue] BullMQ "scoring" queue initialized (Redis connected).');
} else {
  // Mock the queue for development without Redis
  scoringQueue = {
    add: async (name, data) => {
      console.log(
        `[Mock Queue] Job "${name}" added to scoring queue (Redis disabled). Data:`,
        data
      );
      return { id: `mock-job-${Date.now()}` };
    },
  };
}

module.exports = { scoringQueue };
