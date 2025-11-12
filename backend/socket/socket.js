const socketIO = require('socket.io');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  const userSockets = {}; 

  io.on('connection', (socket) => {

    socket.on('join', (userId) => {
      if (!userSockets[userId]) {
        userSockets[userId] = new Set();
      }

      userSockets[userId].add(socket.id);

      socket.join(`user_${userId}`);
      
      io.emit('userOnline', { userId, message: `${userId} is online` });
    });

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

      if (receiverSockets && receiverSockets.size > 0) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit('message', messageData);
        });
      }

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

      if (receiverSockets && receiverSockets.size > 0) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit('userStoppedTyping', {
            senderId
          });
        });
      }
    });

    socket.on('markAsRead', (data) => {
      const { messageId, senderId, readBy } = data;
      
      const senderSockets = userSockets[senderId];
      
      if (senderSockets && senderSockets.size > 0) {
        senderSockets.forEach((socketId) => {
          io.to(socketId).emit('messageRead', {
            messageId,
            readBy
          });
        });
      } 
    });

    socket.on('conversationReadByUser', (data) => {
      const { conversationWith, readBy } = data;
      
      const otherUserSockets = userSockets[conversationWith];
      
      if (otherUserSockets && otherUserSockets.size > 0) {
        otherUserSockets.forEach((socketId) => {
          io.to(socketId).emit('conversationRead', {
            readBy,
            conversationWith
          });
        });
      }
    });

    socket.on('disconnect', () => {
      
      for (const userId in userSockets) {
        if (userSockets[userId].has(socket.id)) {
          userSockets[userId].delete(socket.id);
          
          if (userSockets[userId].size === 0) {
            delete userSockets[userId];
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
