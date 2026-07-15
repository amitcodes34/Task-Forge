// =============================================================================
// server.js – HTTP Server Entry Point
// =============================================================================
// Starts the HTTP server and connects to the database.
// Attaches Socket.io to the HTTP server for real-time WebSocket support.
// Handles graceful shutdown on SIGTERM/SIGINT (important for production/Docker).
// =============================================================================

require('dotenv').config();

const http = require('http'); // Node's built-in HTTP module
const { Server } = require('socket.io'); // Socket.io server

const app = require('./src/app');
const prisma = require('./src/config/database');
const { verifyEmailConnection } = require('./src/config/email');
const { init: initConnectionManager } = require('./src/websockets/connectionManager');
const { registerSocketHandlers } = require('./src/websockets/socketHandler');

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------
const startServer = async () => {
  try {
    // 1. Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    // 2. Test email connection (non-blocking)
    await verifyEmailConnection();

    // 3. Create HTTP server wrapping the Express app
    //    (This is the KEY change — instead of app.listen(), we use
    //     http.createServer(app) so Socket.io can share the same port)
    const httpServer = http.createServer(app);

    // 4. Attach Socket.io to the HTTP server
    //    CORS is configured here too so the frontend can connect via WebSocket
    const io = new Server(httpServer, {
      cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // How long to wait before giving up on a reconnect attempt
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // 5. Initialise our ConnectionManager with the io instance
    //    (This makes io available to bid.service.js via require)
    initConnectionManager(io);

    // 6. Register all socket event handlers (auth, join_project, disconnect, etc.)
    registerSocketHandlers(io);

    // 7. Start listening on the port
    httpServer.listen(PORT, () => {
      console.log('');
      console.log('🚀 ================================================');
      console.log(`🚀  TaskForge API Server`);
      console.log(`🚀  Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀  Port        : ${PORT}`);
      console.log(`🚀  URL         : http://localhost:${PORT}`);
      console.log(`🚀  Health      : http://localhost:${PORT}/health`);
      console.log(`🚀  WebSocket   : ws://localhost:${PORT}`);
      console.log('🚀 ================================================');
      console.log('');
    });

    // 8. Graceful shutdown — close socket connections too
    const shutdown = async (signal) => {
      console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);
      io.close(() => console.log('✅ Socket.io closed.'));
      httpServer.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Database disconnected. Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
