const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { searchUsers, getUserProfile, updateUserProfile } = require('../controllers/userController');

// USER SEARCH ENDPOINT
// GET - Search users by username (requires authentication)
router.get('/search', authMiddleware, searchUsers);

// USER PROFILE ENDPOINTS
// GET - Fetch user profile with their posts
router.get('/:id', getUserProfile);
// PUT - Update user profile (requires authentication and ownership)
router.put('/:id', authMiddleware, updateUserProfile);

module.exports = router;
