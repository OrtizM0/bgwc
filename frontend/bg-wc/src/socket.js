// socket.js
// Initializes and exports a Socket.IO client for real-time communication with the backend

import { io } from 'socket.io-client';

// Backend server URL from environment variable, fallback to localhost
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Create a Socket.IO client instance
const socket = io(BACKEND_URL);

// Export the socket instance for use in other components/pages
export default socket;