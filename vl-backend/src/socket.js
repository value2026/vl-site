const { Server } = require('socket.io');
const prisma = require('./db');

// Map to store online users: userId -> socket.id
const onlineUsers = new Map();

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join session mapping userId -> socket.id
    socket.on('join-session', (userId) => {
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      console.log(`👤 User joined session: ${userId} (Socket: ${socket.id})`);
      
      // Notify online status change to everyone
      io.emit('online-users-list', Array.from(onlineUsers.keys()));
    });

    // Request active online list
    socket.on('get-online-users', () => {
      socket.emit('online-users-list', Array.from(onlineUsers.keys()));
    });

    // Chat messaging
    socket.on('send-chat-message', async (data) => {
      const { senderId, receiverId, content } = data;
      if (!senderId || !receiverId || !content?.trim()) return;

      try {
        // Save to database
        const msg = await prisma.chatMessage.create({
          data: {
            senderId,
            receiverId,
            content: content.trim()
          }
        });

        // Emit to sender for feedback / message sync
        socket.emit('receive-chat-message', msg);

        // Emit to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive-chat-message', msg);
        }
      } catch (err) {
        console.error('Error saving chat message:', err);
      }
    });

    // ── WebRTC Video Calling Signaling ───────────────────────

    // Call User (Sender initiating call)
    socket.on('call-user', (data) => {
      const { to, offer, callerId, callerName } = data;
      const targetSocketId = onlineUsers.get(to);
      
      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming-call', {
          from: socket.userId,
          offer,
          callerId,
          callerName
        });
      } else {
        socket.emit('call-failed', { reason: 'User is offline' });
      }
    });

    // Answer Call (Receiver accepting call)
    socket.on('answer-call', (data) => {
      const { to, answer } = data;
      const targetSocketId = onlineUsers.get(to);
      
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-answered', {
          from: socket.userId,
          answer
        });
      }
    });

    // Relay ICE Candidates
    socket.on('ice-candidate', (data) => {
      const { to, candidate } = data;
      const targetSocketId = onlineUsers.get(to);
      
      if (targetSocketId) {
        io.to(targetSocketId).emit('ice-candidate', {
          from: socket.userId,
          candidate
        });
      }
    });

    // Relay Call Hang Up / Cancel / Decline
    socket.on('hang-up', (data) => {
      const { to } = data;
      const targetSocketId = onlineUsers.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-ended', {
          from: socket.userId
        });
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online-users-list', Array.from(onlineUsers.keys()));
      }
    });
  });

  return io;
}

module.exports = { initSocket, onlineUsers };
