const prisma = require('../config/prisma');

const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tags = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(parseInt(limit, 10), 50); 
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      if (tagArray.length > 0) {
        where.OR = (where.OR || []).length > 0 
          ? where.OR 
          : tagArray.map(tag => ({ tags: { contains: tag, mode: 'insensitive' } }));
        if (where.OR && where.OR.length > 0 && tags) {
          where.tags = { contains: tagArray[0], mode: 'insensitive' };
        }
      }
    }

    const total = await prisma.post.count({ where });

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_pic: true
          }
        },
        likes: true,
        comments: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNum
    });

    const postsWithCounts = posts.map(post => ({
      ...post,
      likes_count: post.likes.length,
      comments_count: post.comments.length
    }));

    res.json({
      data: postsWithCounts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_pic: true
          }
        },
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      ...post,
      likes_count: post.likes.length,
      comments_count: post.comments.length
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        tags,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_pic: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title: title || post.title,
        content: content || post.content,
        tags
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_pic: true
          }
        }
      }
    });

    res.json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.post.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = await prisma.postLike.findFirst({
      where: {
        postId: parseInt(id),
        userId
      }
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      });
      res.json({ message: 'Post unliked' });
    } else {
      await prisma.postLike.create({
        data: {
          postId: parseInt(id),
          userId
        }
      });
      res.json({ message: 'Post liked' });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const postId = parseInt(id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_pic: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const postId = parseInt(id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(parseInt(limit, 10), 50); 
    const skip = (pageNum - 1) * limitNum;

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const total = await prisma.comment.count({
      where: { postId }
    });

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_pic: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNum
    });

    res.json({
      data: comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const parsedCommentId = parseInt(commentId);
    if (isNaN(parsedCommentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parsedCommentId }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parsedCommentId },
      data: {
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_pic: true
          }
        }
      }
    });

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const parsedCommentId = parseInt(commentId);
    if (isNaN(parsedCommentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parsedCommentId }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.comment.delete({
      where: { id: parsedCommentId }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
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
};
