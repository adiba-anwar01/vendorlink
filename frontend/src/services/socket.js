import { io } from 'socket.io-client';

let socket = null;
const readyCallbacks = [];

export const initializeSocket = (token) => {
  if (socket) return socket; // Prevent duplicate connections

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  // Socket.IO should connect to the base URL (not /api)
  const SOCKET_URL = API_URL.replace('/api', '');

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    // Notify any components waiting for the socket to be ready
    readyCallbacks.forEach((cb) => cb(socket));
    readyCallbacks.length = 0;
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

/**
 * Call `cb` immediately if socket is already connected,
 * otherwise queue it to be called once the socket connects.
 * Returns a cleanup function to cancel the pending callback.
 */
export const onSocketReady = (cb) => {
  if (socket && socket.connected) {
    cb(socket);
    return () => {};
  }
  readyCallbacks.push(cb);
  return () => {
    const idx = readyCallbacks.indexOf(cb);
    if (idx !== -1) readyCallbacks.splice(idx, 1);
  };
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};
