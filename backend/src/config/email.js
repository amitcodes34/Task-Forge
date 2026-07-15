// =============================================================================
// src/config/email.js – Nodemailer Transporter Configuration
// =============================================================================
// Creates and exports a reusable Nodemailer transport instance. Supports any
// SMTP provider (Mailtrap for development, SendGrid/SES for production).
// =============================================================================

const nodemailer = require('nodemailer');

/**
 * Create SMTP transporter using environment variables.
 * Supports Mailtrap, Gmail, SendGrid, AWS SES, etc.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Verify the SMTP connection on startup (only in non-test environments).
 */
const verifyEmailConnection = async () => {
  if (process.env.NODE_ENV === 'test') return;

  try {
    await transporter.verify();
    console.log('📧 Email transporter connected successfully.');
  } catch (error) {
    console.warn('⚠️  Email transporter connection failed:', error.message);
    console.warn('   Email features will not work. Check your SMTP settings in .env');
  }
};

module.exports = { transporter, verifyEmailConnection };
