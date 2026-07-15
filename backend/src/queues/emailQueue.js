// =============================================================================
// src/queues/emailQueue.js – BullMQ Queue Definition for Emails
// =============================================================================

const { Queue } = require('bullmq');
const { redisConnection, USE_REDIS } = require('../config/redis');

// Define the name of the queue
const QUEUE_NAME = 'send_acceptance_email';

let emailQueue;

if (USE_REDIS) {
  // Initialize the queue with the shared Redis connection
  emailQueue = new Queue(QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        age: 3600, // keep for 1 hour
        count: 1000,
      },
      removeOnFail: {
        age: 24 * 3600, // keep for 24 hours
      },
    },
  });
} else {
  // Mock the queue for development without Redis
  emailQueue = {
    add: async (name, data) => {
      console.log(`[Mock Queue] Job "${name}" added to queue (Redis disabled). Data:`, data);
      return { id: `mock-job-${Date.now()}` };
    },
  };
}

module.exports = {
  emailQueue,
  QUEUE_NAME,
};
