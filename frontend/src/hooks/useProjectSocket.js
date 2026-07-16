// =============================================================================
// src/hooks/useProjectSocket.js – Custom Hook for Project WebSocket
// =============================================================================
//
// WHAT THIS DOES (explained simply):
// This is a "plug" you attach to any React component.
// When the component mounts (appears on screen), this hook:
//   1. Opens a WebSocket connection to the backend using the user's JWT token
//   2. Tells the server "I am watching project <projectId>" (join_project event)
//   3. Listens for "new_bid" events and calls your callback with the bid data
//   4. Shows a "Live" badge while connected
//   5. When the component unmounts (user leaves the page), it automatically
//      cleans up the connection so we don't have "ghost" connections
//
// HOW TO USE:
//   const { isLive } = useProjectSocket({
//     projectId: '123',
//     token: 'jwt...',
//     onNewBid: (bid) => setBids(prev => [bid, ...prev]),
//   });
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

/**
 * @param {object} options
 * @param {string}   options.projectId  – The project to watch
 * @param {string}   options.token      – JWT access token for authentication
 * @param {function} options.onNewBid   – Callback called with the new bid object
 * @param {boolean}  options.enabled    – Only connect if true (e.g. only for project owners/viewers)
 */
const useProjectSocket = ({ projectId, token, onNewBid, enabled = true }) => {
  const socketRef = useRef(null);
  const [isLive, setIsLive] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Only connect if we have a project ID, a token, and it's enabled
    if (!projectId || !token || !enabled) return;

    // -------------------------------------------------------------------------
    // 1. Create the Socket.io connection
    // -------------------------------------------------------------------------
    // We pass the JWT in the `auth` object (socket.handshake.auth.token on
    // the server). Socket.io sends this during the handshake before any events.
    // -------------------------------------------------------------------------
    const socket = io(SOCKET_URL, {
      auth: { token },
      // Use WebSocket transport first (faster), fall back to polling if needed
      transports: ['websocket', 'polling'],
      // Automatically try to reconnect up to 5 times if connection drops
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // -------------------------------------------------------------------------
    // 2. Connection established → join the project's room
    // -------------------------------------------------------------------------
    socket.on('connect', () => {
      console.log(`🔌 [WS] Connected: ${socket.id}`);
      setConnectionError(null);
      // Tell the server which project we're watching
      socket.emit('join_project', projectId);
    });

    // -------------------------------------------------------------------------
    // 3. Server confirms we joined the room → show "Live" badge
    // -------------------------------------------------------------------------
    socket.on('joined_project', ({ projectId: joinedId }) => {
      console.log(`📌 [WS] Joined project room: project:${joinedId}`);
      setIsLive(true);
    });

    // -------------------------------------------------------------------------
    // 4. New bid arrived → call the parent component's callback
    // -------------------------------------------------------------------------
    socket.on('new_bid', (payload) => {
      console.log('📨 [WS] new_bid received:', payload);
      if (payload?.data && typeof onNewBid === 'function') {
        onNewBid(payload.data);
      }
    });

    // -------------------------------------------------------------------------
    // 5. Handle disconnection and errors
    // -------------------------------------------------------------------------
    socket.on('disconnect', (reason) => {
      console.log(`❌ [WS] Disconnected: ${reason}`);
      setIsLive(false);
    });

    socket.on('connect_error', (err) => {
      console.error(`⚠️  [WS] Connection error: ${err.message}`);
      setIsLive(false);
      setConnectionError(err.message);
    });

    // -------------------------------------------------------------------------
    // 6. Cleanup — runs when component unmounts (user navigates away)
    // -------------------------------------------------------------------------
    // This is critical: without cleanup, sockets accumulate and waste server
    // resources every time the user navigates back and forth.
    // -------------------------------------------------------------------------
    return () => {
      console.log(`🔌 [WS] Disconnecting socket: ${socket.id}`);
      socket.emit('leave_project', projectId);
      socket.disconnect();
      setIsLive(false);
    };
  }, [projectId, token, enabled]); // Re-run if any of these change

  return { isLive, connectionError };
};

export default useProjectSocket;
