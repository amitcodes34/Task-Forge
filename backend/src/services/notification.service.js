// =============================================================================
// src/services/notification.service.js – Email Notification Service
// =============================================================================
// Background email notifications for key project lifecycle events.
// All functions are fire-and-forget – callers should NOT await them.
//
// Design: Wraps the raw email utilities with business-level context so that
// controllers / services never need to know about email template details.
// =============================================================================

const { sendEmail } = require('../utils/email');

// ---------------------------------------------------------------------------
// Notify freelancer their bid was accepted
// ---------------------------------------------------------------------------

/**
 * @param {object} params
 * @param {string} params.freelancerEmail  - Recipient email
 * @param {string} params.freelancerName   - "Jane Doe"
 * @param {string} params.projectTitle     - Title of the project
 */
const notifyBidAccepted = async ({ freelancerEmail, freelancerName, projectTitle }) => {
  try {
    await sendEmail({
      to: freelancerEmail,
      subject: `🎉 Your bid on "${projectTitle}" was accepted!`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #13131F; color: #F0F0FF; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6C63FF, #00D4AA); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #fff;">Congratulations! 🎉</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Hi <strong>${freelancerName}</strong>,</p>
            <p style="font-size: 16px; color: #A0A0C0;">
              Great news! The client has accepted your bid on the project:
            </p>
            <div style="background: #1A1A2E; border-left: 4px solid #6C63FF; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <strong style="font-size: 18px;">${projectTitle}</strong>
            </div>
            <p style="color: #A0A0C0;">
              The project is now <strong style="color: #FFA62B;">In Progress</strong>. 
              Log in to TaskForge to get started and deliver amazing work!
            </p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #6C63FF, #5a52d5); color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              Go to Dashboard →
            </a>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.08); color: #6060A0; font-size: 12px; text-align: center;">
            TaskForge — Connecting great talent with great projects
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[NotificationService] Failed to send bid-accepted email:', err.message);
  }
};

// ---------------------------------------------------------------------------
// Notify client about a new bid on their project
// ---------------------------------------------------------------------------

/**
 * Debouncing is handled at the caller level via in-memory tracking.
 * @param {object} params
 * @param {string} params.clientEmail    - Recipient email
 * @param {string} params.clientName     - "John Doe"
 * @param {string} params.projectTitle   - Title of the project
 * @param {string} params.projectId      - UUID for deep-link
 * @param {number} params.totalBids      - Total bids on the project so far
 */
const notifyNewBid = async ({ clientEmail, clientName, projectTitle, projectId, totalBids }) => {
  try {
    await sendEmail({
      to: clientEmail,
      subject: `💼 New bid on your project "${projectTitle}"`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #13131F; color: #F0F0FF; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6C63FF, #00D4AA); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #fff;">New Bid Received</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Hi <strong>${clientName}</strong>,</p>
            <p style="font-size: 16px; color: #A0A0C0;">
              A freelancer has placed a bid on your project:
            </p>
            <div style="background: #1A1A2E; border-left: 4px solid #00D4AA; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <strong style="font-size: 18px;">${projectTitle}</strong>
              <p style="color: #A0A0C0; margin: 8px 0 0;">Total bids: <strong style="color: #00D4AA;">${totalBids}</strong></p>
            </div>
            <p style="color: #A0A0C0;">
              Log in to review all bids and find your perfect match!
            </p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/projects/${projectId}" 
               style="display: inline-block; background: linear-gradient(135deg, #6C63FF, #5a52d5); color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              View Bids →
            </a>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.08); color: #6060A0; font-size: 12px; text-align: center;">
            TaskForge — Connecting great talent with great projects
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[NotificationService] Failed to send new-bid email:', err.message);
  }
};

// ---------------------------------------------------------------------------
// In-memory debounce map: projectId → last notification timestamp
// Max 1 "new bid" email per project per hour (as per spec)
// ---------------------------------------------------------------------------
const lastBidNotificationTime = new Map();
const BID_NOTIFY_DEBOUNCE_MS = 60 * 60 * 1000; // 1 hour

/**
 * Debounced new-bid notification. Sends at most once per project per hour.
 */
const notifyNewBidDebounced = (params) => {
  const now = Date.now();
  const lastSent = lastBidNotificationTime.get(params.projectId) || 0;
  if (now - lastSent < BID_NOTIFY_DEBOUNCE_MS) {
    return; // Debounced – don't spam the client
  }
  lastBidNotificationTime.set(params.projectId, now);
  notifyNewBid(params); // fire-and-forget
};

module.exports = { notifyBidAccepted, notifyNewBid, notifyNewBidDebounced };
