export const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || '/socket.io';

export const createSocketOptions = (options = {}) => ({
  path: SOCKET_PATH,
  transports: ['websocket', 'polling'],
  withCredentials: true,
  ...options,
});
