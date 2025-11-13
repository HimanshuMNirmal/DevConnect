const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getConversations, getMessages, sendMessage, markAsRead, markConversationAsRead } = require('../controllers/messageController');

// CONVERSATION ENDPOINTS
// GET - Fetch all conversations for current user (requires authentication)
router.get('/conversations/list', authMiddleware, getConversations);

// MESSAGE ENDPOINTS
// GET - Fetch messages between current user and specified user (requires authentication)
router.get('/:userId', authMiddleware, getMessages);
// POST - Send new message to user (requires authentication)
router.post('/', authMiddleware, sendMessage);

// MESSAGE STATUS ENDPOINTS
// PUT - Mark individual message as read (requires authentication)
router.put('/:messageId/read', authMiddleware, markAsRead);
// PUT - Mark all messages in conversation as read (requires authentication)
router.put('/:userId/conversation/read', authMiddleware, markConversationAsRead);

module.exports = router;
