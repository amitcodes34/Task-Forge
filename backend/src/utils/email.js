// =============================================================================
// src/utils/email.js – Email Sending Utilities
// =============================================================================
// In DEVELOPMENT mode (NODE_ENV=development), emails are NOT sent via SMTP.
// Instead, the email content and links are printed to the server console.
// This allows full testing of the auth flow without any SMTP setup.
//
// In PRODUCTION mode, real emails are sent via the configured SMTP transporter.
// =============================================================================

const { transporter, verifyEmailConnection } = require('../config/email');

const FROM = process.env.EMAIL_FROM || '"TaskForge" <noreply@taskforge.com>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const IS_DEV = process.env.NODE_ENV !== 'production';

// ---------------------------------------------------------------------------
// Dev logger – prints email content to console instead of sending
// ---------------------------------------------------------------------------
const logEmailToConsole = (type, to, link) => {
  console.log('\n' + '='.repeat(60));
  console.log(`📧  DEV EMAIL INTERCEPTED – ${type}`);
  console.log('='.repeat(60));
  console.log(`  To      : ${to}`);
  console.log(`  Link    : ${link}`);
  console.log('='.repeat(60));
  console.log('  ☝️  Copy the link above and open it in your browser.');
  console.log('='.repeat(60) + '\n');
};

// ---------------------------------------------------------------------------
// Email Verification
// ---------------------------------------------------------------------------

/**
 * Send an email verification link to a newly registered user.
 * @param {string} to    - Recipient email address
 * @param {string} token - Unique verification token
 */
const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${CLIENT_URL}/verify-email?token=${token}`;

  // In development, just log to console – no SMTP needed
  if (IS_DEV) {
    logEmailToConsole('EMAIL VERIFICATION', to, verificationUrl);
    return;
  }

  await transporter.sendMail({
    from: FROM,
    to,
    subject: '✅ Verify Your Email – TaskForge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #6C63FF;">Welcome to TaskForge!</h1>
        <p>Thank you for registering. Please verify your email address by clicking the button below.</p>
        <p>This link will expire in <strong>24 hours</strong>.</p>
        <a href="${verificationUrl}"
           style="display: inline-block; padding: 12px 24px; background: #6C63FF; color: #fff;
                  text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">
          Verify Email Address
        </a>
        <p style="color: #666; font-size: 13px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};

// ---------------------------------------------------------------------------
// Password Reset
// ---------------------------------------------------------------------------

/**
 * Send a password reset link to a user who requested it.
 * @param {string} to    - Recipient email address
 * @param {string} token - Unique password reset token
 */
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;

  // In development, just log to console – no SMTP needed
  if (IS_DEV) {
    logEmailToConsole('PASSWORD RESET', to, resetUrl);
    return;
  }

  await transporter.sendMail({
    from: FROM,
    to,
    subject: '🔐 Reset Your Password – TaskForge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #6C63FF;">Password Reset Request</h1>
        <p>We received a request to reset the password for your TaskForge account.</p>
        <p>Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background: #e53e3e; color: #fff;
                  text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">
          Reset My Password
        </a>
        <p style="color: #666; font-size: 13px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">
          If you did not request a password reset, please ignore this email.
          Your password will remain unchanged.
        </p>
      </div>
    `,
  });
};

// ---------------------------------------------------------------------------
// Bid Accepted Notification
// ---------------------------------------------------------------------------

/**
 * Notify a freelancer that their bid was accepted.
 * @param {string} to           - Freelancer's email
 * @param {string} projectTitle - Title of the project
 */
const sendBidAcceptedEmail = async (to, projectTitle) => {
  const dashboardUrl = `${CLIENT_URL}/dashboard`;

  if (IS_DEV) {
    logEmailToConsole('BID ACCEPTED', to, dashboardUrl);
    return;
  }

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `🎉 Your Bid Was Accepted – ${projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #38a169;">Congratulations! Your Bid Was Accepted</h1>
        <p>The client has accepted your bid for the project: <strong>${projectTitle}</strong>.</p>
        <p>Please log in to TaskForge to get started and deliver your best work!</p>
        <a href="${dashboardUrl}"
           style="display: inline-block; padding: 12px 24px; background: #38a169; color: #fff;
                  text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">
          Go to Dashboard
        </a>
      </div>
    `,
  });
};

// ---------------------------------------------------------------------------
// Generic sendEmail helper
// ---------------------------------------------------------------------------

/**
 * Send an arbitrary HTML email. Used by notification.service.js.
 * @param {object} opts
 * @param {string} opts.to      - Recipient email
 * @param {string} opts.subject - Email subject
 * @param {string} opts.html    - HTML body
 */
const sendEmail = async ({ to, subject, html }) => {
  if (IS_DEV) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📧  DEV EMAIL – ${subject}`);
    console.log(`  To: ${to}`);
    console.log('='.repeat(60) + '\n');
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBidAcceptedEmail,
  sendEmail,
};
