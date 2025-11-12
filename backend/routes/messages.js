const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getConversations, getMessages, sendMessage, markAsRead, markConversationAsRead } = require('../controllers/messageController');

router.get('/conversations/list', authMiddleware, getConversations);
router.get('/:userId', authMiddleware, getMessages);
router.post('/', authMiddleware, sendMessage);
router.put('/:messageId/read', authMiddleware, markAsRead);
router.put('/:userId/conversation/read', authMiddleware, markConversationAsRead);

module.exports = router;
