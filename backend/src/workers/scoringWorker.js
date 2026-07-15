require('dotenv').config();
const { Worker } = require('bullmq');
const { redisConfig } = require('../config/redis');
const Redis = require('ioredis');
const prisma = require('../config/database');
const { scoreBid } = require('../services/aiScoring.service');

const USE_REDIS = process.env.USE_REDIS === 'true';

if (!USE_REDIS) {
  console.log('[Worker] scoringWorker disabled because USE_REDIS is false.');
} else {
  const redis = new Redis(redisConfig);

  const worker = new Worker(
    'scoring',
    async (job) => {
      if (job.name === 'score_bid') {
        const { bidId } = job.data;

        // Implement rate limiting using Redis counter as instructed
        const currentCount = await redis.incr('ai_calls_count');
        if (currentCount === 1) {
          await redis.expire('ai_calls_count', 60); // 60 seconds
        }

        if (currentCount > 10) {
          console.warn(`[AI Scoring] Rate limit exceeded. Delaying job ${job.id}`);
          // Throw an error so BullMQ retries it (or we could use moveToDelayed)
          throw new Error('Rate limit exceeded (10 calls/min). Please retry later.');
        }

        const bid = await prisma.bid.findUnique({
          where: { id: bidId },
          include: { project: true, freelancer: true },
        });

        if (!bid) {
          console.error(`[AI Scoring] Bid ${bidId} not found.`);
          return;
        }

        console.log(`[AI Scoring] Processing bid ${bidId}...`);
        const { score, reason, flags } = await scoreBid(bid, bid.project, bid.freelancer);

        if (score !== null) {
          await prisma.bid.update({
            where: { id: bidId },
            data: {
              aiScore: score,
              aiReason: reason,
              aiFlags: flags,
              aiScoredAt: new Date(),
            },
          });
          console.log(`[AI Scoring] Bid ${bidId} scored successfully: ${score}`);
        } else {
          console.log(`[AI Scoring] Bid ${bidId} scored failed or disabled.`);
        }
      }
    },
    {
      connection: redisConfig,
      concurrency: 2,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[AI Scoring] Job ${job?.id} failed:`, err.message);
  });

  console.log('[Worker] BullMQ "scoringWorker" is running and listening to "scoring" queue.');
}
