const socketIO = require('socket.io');

// SETUP SOCKET.IO FOR REAL-TIME COMMUNICATION
// Configure CORS and initialize event handlers for user connections
const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // TRACK ACTIVE USER CONNECTIONS
  // Map user IDs to their socket IDs for targeted messaging
  const userSockets = {}; 

  io.on('connection', (socket) => {
    // USER JOIN EVENT - ADD USER TO TRACKING AND BROADCAST ONLINE STATUS
    socket.on('join', (userId) => {
      if (!userSockets[userId]) {
        userSockets[userId] = new Set();
      }

      userSockets[userId].add(socket.id);

      // JOIN USER TO THEIR PERSONAL SOCKET ROOM
      socket.join(`user_${userId}`);
      
      // BROADCAST USER ONLINE STATUS TO ALL CLIENTS
      io.emit('userOnline', { userId, message: `${userId} is online` });
    });

    // HANDLE INCOMING MESSAGES
    // Deliver message to receiver if online, notify sender of delivery
    socket.on('sendMessage', (data) => {
      const { senderId, receiverId, message, messageId, createdAt, senderName } = data;
      
      const receiverSockets = userSockets[receiverId];

      const messageData = {
        id: messageId,
        senderId,
        senderName,
        receiverId,
        message,
        createdAt: createdAt || new Date().toISOString(),
        isRead: false
      };

      // EMIT MESSAGE TO RECEIVER IF ONLINE
      if (receiverSockets && receiverSockets.size > 0) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit('message', messageData);
        });
      }

      // EMIT CONFIRMATION TO SENDER
      const senderSockets = userSockets[senderId];
      if (senderSockets) {
        senderSockets.forEach((socketId) => {
          io.to(socketId).emit('messageSent', messageData);
        });
      }
    });

    socket.on('typing', (data) => {
      const { senderId, receiverId } = data;
      const receiverSockets = userSockets[receiverId];

      // EMIT TYPING INDICATOR TO RECEIVER
      if (receiverSockets && receiverSockets.size > 0) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit('userTyping', {
            senderId,
            message: `${senderId} is typing...`,
          });
        });
      }
    });

    socket.on('stopTyping', (data) => {
      const { senderId, receiverId } = data;
      const receiverSockets = userSockets[receiverId];

      // EMIT STOP TYPING INDICATOR TO RECEIVER
      if (receiverSockets && receiverSockets.size > 0) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit('userStoppedTyping', {
            senderId
          });
        });
      }
    });

    // HANDLE MESSAGE READ STATUS UPDATE
    socket.on('markAsRead', (data) => {
      const { messageId, senderId, readBy } = data;
      
      const senderSockets = userSockets[senderId];
      
      // NOTIFY SENDER THAT MESSAGE WAS READ
      if (senderSockets && senderSockets.size > 0) {
        senderSockets.forEach((socketId) => {
          io.to(socketId).emit('messageRead', {
            messageId,
            readBy
          });
        });
      } 
    });

    // HANDLE CONVERSATION READ BY USER
    socket.on('conversationReadByUser', (data) => {
      const { conversationWith, readBy } = data;
      
      const otherUserSockets = userSockets[conversationWith];
      
      // NOTIFY OTHER USER THAT CONVERSATION WAS READ
      if (otherUserSockets && otherUserSockets.size > 0) {
        otherUserSockets.forEach((socketId) => {
          io.to(socketId).emit('conversationRead', {
            readBy,
            conversationWith
          });
        });
      }
    });

    // USER DISCONNECT EVENT
    socket.on('disconnect', () => {
      // FIND AND REMOVE SOCKET FROM USER TRACKING
      for (const userId in userSockets) {
        if (userSockets[userId].has(socket.id)) {
          userSockets[userId].delete(socket.id);
          
          // IF NO MORE SOCKETS FOR THIS USER, MARK THEM AS OFFLINE
          if (userSockets[userId].size === 0) {
            delete userSockets[userId];
            // BROADCAST USER OFFLINE STATUS
            io.emit('userOffline', { userId, message: `${userId} went offline` });
          }
          break;
        }
      }
      
    });
  });

  return io;
};

module.exports = setupSocket;
