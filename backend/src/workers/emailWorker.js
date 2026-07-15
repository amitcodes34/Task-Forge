// =============================================================================
// src/workers/emailWorker.js – BullMQ Worker for Emails
// =============================================================================
// Runs as a background process to process jobs from the email queue.
// Contains simple HTML templates and handles retries automatically.
// =============================================================================

require('dotenv').config();

const { Worker } = require('bullmq');
const { redisConnection, USE_REDIS } = require('../config/redis');
const { transporter } = require('../config/email');
const { QUEUE_NAME } = require('../queues/emailQueue');

// Start the scoring worker in the same process for convenience
require('./scoringWorker');

const FROM = process.env.EMAIL_FROM || '"TaskForge" <noreply@taskforge.com>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const IS_DEV = process.env.NODE_ENV !== 'production';

// ---------------------------------------------------------------------------
// HTML Email Templates
// ---------------------------------------------------------------------------
const getTemplateHtml = (templateName, data) => {
  const baseStyle = `font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #13131F; color: #F0F0FF; border-radius: 16px; overflow: hidden;`;
  const footer = `
    <div style="padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.08); color: #6060A0; font-size: 12px; text-align: center;">
      TaskForge — Connecting great talent with great projects
    </div>
  `;

  switch (templateName) {
    case 'bid_accepted':
      return `
        <div style="${baseStyle}">
          <div style="background: linear-gradient(135deg, #6C63FF, #00D4AA); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #fff;">Congratulations! 🎉</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Hi <strong>${data.freelancerName}</strong>,</p>
            <p style="font-size: 16px; color: #A0A0C0;">Your bid was accepted! The client <strong>${data.clientName}</strong> chose you for:</p>
            <div style="background: #1A1A2E; border-left: 4px solid #6C63FF; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <strong style="font-size: 18px;">${data.projectTitle}</strong>
            </div>
            <p style="color: #A0A0C0;">Start working now. Log in to TaskForge to get started!</p>
            <a href="${CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6C63FF, #5a52d5); color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 16px;">Go to Dashboard →</a>
          </div>
          ${footer}
        </div>
      `;
    case 'new_bid_notification':
      return `
        <div style="${baseStyle}">
          <div style="background: linear-gradient(135deg, #6C63FF, #00D4AA); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #fff;">New Bid Received</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Hi <strong>${data.clientName}</strong>,</p>
            <p style="font-size: 16px; color: #A0A0C0;">A new bid arrived on your project:</p>
            <div style="background: #1A1A2E; border-left: 4px solid #00D4AA; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <strong style="font-size: 18px;">${data.projectTitle}</strong>
              <p style="color: #A0A0C0; margin: 8px 0 0;">Total bids: <strong style="color: #00D4AA;">${data.totalBids}</strong></p>
            </div>
            <a href="${CLIENT_URL}/projects/${data.projectId}" style="display: inline-block; background: linear-gradient(135deg, #6C63FF, #5a52d5); color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 16px;">View Bids →</a>
          </div>
          ${footer}
        </div>
      `;
    case 'project_completed':
      return `
        <div style="${baseStyle}">
          <div style="background: linear-gradient(135deg, #38a169, #00D4AA); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #fff;">Project Completed! 🏆</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Hi <strong>${data.freelancerName}</strong>,</p>
            <p style="font-size: 16px; color: #A0A0C0;">The client has marked your project as completed:</p>
            <div style="background: #1A1A2E; border-left: 4px solid #38a169; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <strong style="font-size: 18px;">${data.projectTitle}</strong>
            </div>
            <p style="color: #A0A0C0; font-size: 16px;"><strong>Payment will be released to your account within 24 hours.</strong></p>
            <p style="color: #A0A0C0;">Don't forget to leave a review for the client!</p>
            <a href="${CLIENT_URL}/projects/${data.projectId}" style="display: inline-block; background: linear-gradient(135deg, #38a169, #2b7a4f); color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 16px;">View Project →</a>
          </div>
          ${footer}
        </div>
      `;
    default:
      return `<p>Hello, this is a notification from TaskForge.</p>`;
  }
};

// ---------------------------------------------------------------------------
// Worker Setup
// ---------------------------------------------------------------------------
if (USE_REDIS) {
  const emailWorker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { to, subject, templateName, templateData } = job.data;

      console.log(`[Worker] Processing job ${job.id} for ${to} (Template: ${templateName})`);

      const html = getTemplateHtml(templateName, templateData);

      if (IS_DEV) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📧  DEV EMAIL (from Worker) – ${subject}`);
        console.log(`  To: ${to}`);
        console.log(`  Template: ${templateName}`);
        console.log('='.repeat(60) + '\n');
        return; // Skip actual SMTP in dev
      }

      try {
        await transporter.sendMail({
          from: FROM,
          to,
          subject,
          html,
        });
        console.log(`[Worker] Job ${job.id} processed successfully.`);
      } catch (error) {
        console.error(`[Worker] Failed to send email for job ${job.id}:`, error.message);
        throw error; // Throwing triggers BullMQ's automatic retry mechanism
      }
    },
    {
      connection: redisConnection,
      // Concurrency limit
      concurrency: 5,
    }
  );

  emailWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} has completed!`);
  });

  emailWorker.on('failed', (job, err) => {
    console.log(`❌ Job ${job.id} has failed with ${err.message}`);
  });

  console.log('👷 Background Email Worker is running...');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down worker...');
    await emailWorker.close();
    process.exit(0);
  });
} else {
  console.log('⚠️  Redis is disabled. Email worker will not start.');
}
