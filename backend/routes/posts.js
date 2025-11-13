const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} = require('../controllers/postController');

// POSTS ENDPOINTS
// GET - Fetch all posts with pagination and filtering
router.get('/', getAllPosts);
// POST - Create new post (requires authentication)
router.post('/', authMiddleware, createPost);

// GET - Fetch specific post by ID
router.get('/:id', getPostById);
// PUT - Update post (requires authentication and ownership)
router.put('/:id', authMiddleware, updatePost);
// DELETE - Delete post (requires authentication and ownership)
router.delete('/:id', authMiddleware, deletePost);
// POST - Toggle like on post (requires authentication)
router.post('/:id/like', authMiddleware, toggleLike);

// COMMENTS ENDPOINTS
// POST - Create comment on post (requires authentication)
router.post('/:id/comments', authMiddleware, createComment);
// GET - Fetch comments for a post with pagination
router.get('/:id/comments', getPostComments);

// COMMENT MANAGEMENT ENDPOINTS
// PUT - Update comment (requires authentication and ownership)
router.put('/comments/:commentId', authMiddleware, updateComment);
// DELETE - Delete comment (requires authentication and ownership)
router.delete('/comments/:commentId', authMiddleware, deleteComment);

module.exports = router;
