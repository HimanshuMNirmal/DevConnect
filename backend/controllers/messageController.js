const prisma = require('../config/prisma');

// FETCH ALL CONVERSATIONS FOR CURRENT USER
// Returns list of unique conversation partners with last message and unread count
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // QUERY ALL UNIQUE CONVERSATION PARTNERS
    // Identify both sent and received conversations
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT 
        CASE 
          WHEN "senderId" = ${currentUserId} THEN "receiverId"
          ELSE "senderId"
        END as "userId",
        MAX("createdAt") as "lastMessageTime"
      FROM "messages"
      WHERE "senderId" = ${currentUserId} OR "receiverId" = ${currentUserId}
      GROUP BY "userId"
      ORDER BY "lastMessageTime" DESC
    `;

    // ENRICH CONVERSATION DATA WITH USER INFO, LAST MESSAGE, AND UNREAD COUNT
    const conversationDetails = await Promise.all(
      conversations.map(async (conv) => {
        // FETCH CONVERSATION PARTNER DATA
        const user = await prisma.user.findUnique({
          where: { id: conv.userId },
          select: {
            id: true,
            username: true,
            bio: true,
            profile_pic: true
          }
        });

        // GET LAST MESSAGE IN CONVERSATION
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: conv.userId },
              { senderId: conv.userId, receiverId: currentUserId }
            ]
          },
          orderBy: { createdAt: 'desc' },
          select: {
            message: true,
            senderId: true,
            createdAt: true,
            isRead: true
          }
        });

        // COUNT UNREAD MESSAGES FROM THIS CONVERSATION PARTNER
        const unreadCount = await prisma.message.count({
          where: {
            senderId: conv.userId,
            receiverId: currentUserId,
            isRead: false
          }
        });

        return {
          user,
          lastMessage,
          unreadCount,
          lastMessageTime: conv.lastMessageTime
        };
      })
    );

    res.json(conversationDetails);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.user.id;

    // VALIDATE USER ID PARAMETER
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // VALIDATE AND SANITIZE PAGINATION PARAMETERS
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 50));
    const skip = (parsedPage - 1) * parsedLimit;

    // GET TOTAL MESSAGE COUNT FOR CONVERSATION
    const totalCount = await prisma.message.count({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: parsedUserId
          },
          {
            senderId: parsedUserId,
            receiverId: currentUserId
          }
        ]
      }
    });

    // FETCH PAGINATED MESSAGES BETWEEN TWO USERS
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: parsedUserId
          },
          {
            senderId: parsedUserId,
            receiverId: currentUserId
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' 
      },
      skip,
      take: parsedLimit
    });

    const totalPages = Math.ceil(totalCount / parsedLimit);

    res.json({
      data: messages,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        totalCount,
        totalPages,
        hasMore: parsedPage < totalPages
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    // VALIDATE REQUIRED FIELDS
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver ID and message are required' });
    }

    // VALIDATE RECEIVER ID
    const parsedReceiverId = parseInt(receiverId);
    if (isNaN(parsedReceiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    // VERIFY SENDER EXISTS
    const senderExists = await prisma.user.findUnique({
      where: { id: senderId }
    });

    if (!senderExists) {
      return res.status(401).json({ message: 'Sender not found' });
    }

    // VERIFY RECEIVER EXISTS
    const receiverExists = await prisma.user.findUnique({
      where: { id: parsedReceiverId }
    });

    if (!receiverExists) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // CREATE MESSAGE IN DATABASE
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId: parsedReceiverId,
        message: message.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const parsedMessageId = parseInt(messageId);
    if (isNaN(parsedMessageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    await prisma.message.update({
      where: { id: parsedMessageId },
      data: { isRead: true }
    });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const markConversationAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // VALIDATE USER ID
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // UPDATE ALL UNREAD MESSAGES FROM THIS USER TO READ
    const result = await prisma.message.updateMany({
      where: {
        senderId: parsedUserId,
        receiverId: currentUserId,
        isRead: false
      },
      data: { isRead: true }
    });

    const io = req.app.get('io');
    
    // EMIT SOCKET EVENTS TO BOTH USERS IF MESSAGES WERE MARKED AS READ
    if (io && result.count > 0) {
      // NOTIFY CURRENT USER ABOUT THE READ STATUS UPDATE
      io.to(`user_${currentUserId}`).emit('conversationMarkedAsRead', {
        userId: parsedUserId,
        markedCount: result.count
      });

      // NOTIFY OTHER USER THAT THEIR MESSAGES WERE READ
      io.to(`user_${parsedUserId}`).emit('conversationMarkedAsRead', {
        readBy: currentUserId,
        markedCount: result.count
      });
    }

    res.json({ 
      message: 'Conversation marked as read',
      updatedCount: result.count 
    });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  markConversationAsRead,
};
