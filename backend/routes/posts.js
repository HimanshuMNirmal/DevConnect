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

router.get('/', getAllPosts);
router.post('/', authMiddleware, createPost);

router.get('/:id', getPostById);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);
router.post('/:id/like', authMiddleware, toggleLike);

router.post('/:id/comments', authMiddleware, createComment);
router.get('/:id/comments', getPostComments);

router.put('/comments/:commentId', authMiddleware, updateComment);
router.delete('/comments/:commentId', authMiddleware, deleteComment);

module.exports = router;
