// =============================================================================
// src/websockets/socketHandler.js – Socket.io Event Handler (ws route)
// =============================================================================
//
// WHAT THIS DOES (explained simply):
// This is the "front desk" of our hotel (ConnectionManager).
// When a browser connects via WebSocket, this code:
//   1. Checks their JWT token to make sure they are logged in (Authentication)
//   2. When they tell us which project page they are looking at, we add them
//      to that project's "room"
//   3. When they close the tab or lose internet, we handle that gracefully
//      without crashing the server
//
// FLOW:
//   Browser connects → we verify JWT → browser sends "join_project" →
//   server joins socket to room "project:<id>" → any bid on that project
//   broadcasts "new_bid" to this socket via connectionManager.broadcastToProject()
// =============================================================================

const jwt = require('jsonwebtoken');

/**
 * Attaches all Socket.io event listeners to the server.
 * Called once from server.js after Socket.io is initialised.
 * @param {import('socket.io').Server} io
 */
const registerSocketHandlers = (io) => {
  // ---------------------------------------------------------------------------
  // Middleware: Authenticate EVERY incoming WebSocket connection with JWT
  // ---------------------------------------------------------------------------
  // The frontend sends the JWT as a query param: ws://...?token=<jwt>
  // This is the standard approach for WebSocket auth since browsers cannot
  // set custom headers on WebSocket connections (unlike regular fetch/axios).
  // ---------------------------------------------------------------------------
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      console.log(`🔒 [WS] Rejected unauthenticated connection from ${socket.id}`);
      return next(new Error('Authentication required. Provide a JWT token.'));
    }

    try {
      // Use JWT_ACCESS_SECRET (matching the variable name in .env)
      const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT secret not configured on server.');
      const decoded = jwt.verify(token, secret);
      // Attach the decoded user payload to the socket object for later use
      socket.user = decoded;
      console.log(`🔑 [WS] Authenticated: user=${decoded.userId} (${decoded.role}), socket=${socket.id}`);
      next();
    } catch (err) {
      console.log(`🔒 [WS] Invalid token from socket ${socket.id}: ${err.message}`);
      next(new Error('Invalid or expired token.'));
    }
  });

  // ---------------------------------------------------------------------------
  // Connection handler: runs for every successfully authenticated socket
  // ---------------------------------------------------------------------------
  io.on('connection', (socket) => {
    console.log(`✅ [WS] Socket connected: ${socket.id} (user: ${socket.user?.userId})`);

    // -------------------------------------------------------------------------
    // Event: "join_project"
    // -------------------------------------------------------------------------
    // The frontend emits this event immediately after connecting, passing the
    // project ID of the page the user is currently viewing.
    // We use Socket.io's built-in room system to group this socket with all
    // other sockets watching the same project.
    // -------------------------------------------------------------------------
    socket.on('join_project', (projectId) => {
      if (!projectId || typeof projectId !== 'string') {
        socket.emit('error', { message: 'Invalid project ID.' });
        return;
      }

      const room = `project:${projectId}`;

      // Leave any previously joined project rooms (user navigated to a new project)
      // A socket can only "actively view" one project at a time
      socket.rooms.forEach((r) => {
        if (r.startsWith('project:') && r !== room) {
          socket.leave(r);
          console.log(`🚪 [WS] Socket ${socket.id} left room: ${r}`);
        }
      });

      socket.join(room);
      console.log(`📌 [WS] Socket ${socket.id} joined room: ${room}`);

      // Acknowledge the join so the frontend can show the "Live" badge
      socket.emit('joined_project', { projectId, room });
    });

    // -------------------------------------------------------------------------
    // Event: "leave_project"
    // -------------------------------------------------------------------------
    // Emitted by the frontend cleanup function when the component unmounts
    // (user navigates away from the project page).
    // -------------------------------------------------------------------------
    socket.on('leave_project', (projectId) => {
      const room = `project:${projectId}`;
      socket.leave(room);
      console.log(`🚪 [WS] Socket ${socket.id} left room: ${room}`);
    });

    // -------------------------------------------------------------------------
    // Event: "disconnect"
    // -------------------------------------------------------------------------
    // Socket.io automatically removes the socket from all rooms on disconnect,
    // so we just need to log it. No manual cleanup needed — this is one of the
    // key advantages of using Socket.io over raw WebSockets.
    // -------------------------------------------------------------------------
    socket.on('disconnect', (reason) => {
      console.log(`❌ [WS] Socket disconnected: ${socket.id} — Reason: ${reason}`);
    });

    // -------------------------------------------------------------------------
    // Event: "error" (catch-all for socket errors)
    // -------------------------------------------------------------------------
    socket.on('error', (err) => {
      console.error(`⚠️  [WS] Socket error on ${socket.id}:`, err.message);
    });
  });
};

module.exports = { registerSocketHandlers };
