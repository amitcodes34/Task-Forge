// =============================================================================
// src/app.js – Express Application Setup
// =============================================================================
// Configures and exports the Express app instance.
// Does NOT start the HTTP server (that's done in server.js).
// This separation allows the app to be imported in tests without starting a server.
// =============================================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Route imports
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const bidRoutes = require('./routes/bid.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');

// Bull Board imports
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { emailQueue } = require('./queues/emailQueue');
const { USE_REDIS } = require('./config/redis');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------

// Helmet sets secure HTTP headers (XSS protection, HSTS, etc.)
app.use(helmet());

// CORS – allow only the frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global rate limiter (safety net – individual routes have stricter limits)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 requests per IP per window
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ---------------------------------------------------------------------------
// Stripe Webhooks (Must be mounted BEFORE express.json)
// ---------------------------------------------------------------------------
const webhookRoutes = require('./routes/webhook.routes');
app.use('/webhooks', webhookRoutes);

// ---------------------------------------------------------------------------
// Body Parsing Middleware
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10kb' })); // Reject bodies > 10KB
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Logging Middleware
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskForge API is running.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Bull Board Dashboard (Queue Monitor)
// ---------------------------------------------------------------------------
let serverAdapter;
if (USE_REDIS) {
  serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({
    queues: [new BullMQAdapter(emailQueue)],
    serverAdapter: serverAdapter,
  });
}

// Basic Auth Middleware for Bull Board
const adminEmail = process.env.ADMIN_EMAIL || 'admin@taskforge.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@TaskForge123';

const basicAuthMiddleware = (req, res, next) => {
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login && password && login === adminEmail && password === adminPassword) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="401"');
  res.status(401).send('Authentication required.');
};

// Mount Bull Board with basic auth
if (USE_REDIS) {
  app.use('/admin/queues', basicAuthMiddleware, serverAdapter.getRouter());
}

// ---------------------------------------------------------------------------
// API Routes (all prefixed with /api/v1)
// ---------------------------------------------------------------------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/bids', bidRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);

// ---------------------------------------------------------------------------
// 404 Handler – Catch unmatched routes
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.originalUrl}' not found.`,
  });
});

// ---------------------------------------------------------------------------
// Global Error Handler (must be last middleware)
// ---------------------------------------------------------------------------
app.use(errorHandler);

module.exports = app;
