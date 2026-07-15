// =============================================================================
// src/websockets/connectionManager.js  – WebSocket Connection Manager
// =============================================================================
//
// WHAT THIS DOES (explained simply):
// Think of this as a "room registry" for a hotel. Each project page is a room.
// When a browser opens a project page, this manager records:
//   "Socket ABC is now watching project-123"
// When a freelancer submits a bid, the bid.service calls:
//   manager.broadcastToProject("project-123", { event: "new_bid", data: {...} })
// This manager finds ALL sockets currently in "room: project-123" and sends
// the message to each one.
//
// Socket.io handles the actual room logic for us. We just provide a clean API
// on top of it so the bid.service doesn't need to know about Socket.io details.
// =============================================================================

let _io = null; // The Socket.io server instance (set once on startup)

/**
 * Initialise the manager with the Socket.io server instance.
 * Called once from server.js after the Socket.io server is created.
 * @param {import('socket.io').Server} io
 */
const init = (io) => {
  _io = io;
};

/**
 * Broadcast a JSON payload to every socket currently watching a project.
 *
 * In Socket.io, a "room" is just a named channel. When a user joins the
 * project detail page, their socket joins room `project:<id>`. This function
 * emits to everyone in that room.
 *
 * @param {string} projectId  – The project UUID
 * @param {string} event      – Event name, e.g. "new_bid"
 * @param {object} data       – The payload to send (plain JS object → auto-JSON)
 */
const broadcastToProject = (projectId, event, data) => {
  if (!_io) {
    console.warn('⚠️  WebSocket manager not initialised yet. Skipping broadcast.');
    return;
  }
  const room = `project:${projectId}`;
  _io.to(room).emit(event, data);
  console.log(`📡 [WS] Broadcasted '${event}' to room '${room}'`);
};

/**
 * Return how many sockets are connected to a given project room.
 * Useful for debugging / admin dashboards.
 * @param {string} projectId
 * @returns {Promise<number>}
 */
const getRoomSize = async (projectId) => {
  if (!_io) return 0;
  const room = _io.sockets.adapter.rooms.get(`project:${projectId}`);
  return room ? room.size : 0;
};

module.exports = { init, broadcastToProject, getRoomSize };
