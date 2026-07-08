import { io } from 'socket.io-client';

let socket = null;
const readyCallbacks = [];

export const initializeSocket = (token) => {
  if (socket) return socket;
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const SOCKET_URL = API_URL.replace('/api', '');

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
  });

  socket.on('connect', () => {
    readyCallbacks.forEach((cb) => cb(socket));
    readyCallbacks.length = 0;
  });

  socket.on('connect_error', (error) => {
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

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
  }
};
