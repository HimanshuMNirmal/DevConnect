const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { searchUsers, getUserProfile, updateUserProfile } = require('../controllers/userController');

router.get('/search', authMiddleware, searchUsers);
router.get('/:id', getUserProfile);
router.put('/:id', authMiddleware, updateUserProfile);

module.exports = router;
