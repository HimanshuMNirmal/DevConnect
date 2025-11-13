const prisma = require('../config/prisma');

// SEARCH FOR USERS BY USERNAME
// Exclude current user from results and limit to 20 results
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user?.id;

    // VALIDATE SEARCH QUERY
    if (!query || query.trim().length === 0) {
      return res.json([]);
    }

    // FIND USERS MATCHING QUERY (CASE-INSENSITIVE)
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive'
        },
        // EXCLUDE CURRENT USER FROM RESULTS
        id: {
          not: currentUserId
        }
      },
      select: {
        id: true,
        username: true,
        bio: true,
        profile_pic: true,
        createdAt: true
      },
      take: 20 
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // VALIDATE USER ID
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // VALIDATE AND SANITIZE PAGINATION PARAMETERS
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNum - 1) * limitNum;

    // FETCH USER PROFILE WITH THEIR POSTS (PAGINATED)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        profile_pic: true,
        createdAt: true,
        skills: true,
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
            tags: true,
            createdAt: true,
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
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // GET TOTAL POST COUNT FOR THIS USER
    const totalPosts = await prisma.post.count({
      where: { userId }
    });

    // CALCULATE LIKES AND COMMENTS COUNTS FOR EACH POST
    const postsWithLikes = user.posts.map(post => ({
      ...post,
      likes_count: post.likes.length,
      comments_count: post.comments.length
    }));

    res.json({
      ...user,
      posts: postsWithLikes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limitNum)
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { bio, profile_pic } = req.body;
    const userId = req.user.id;

    // VALIDATE PROFILE ID
    const profileId = parseInt(id);
    if (isNaN(profileId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // AUTHORIZATION CHECK - Users can only update their own profile
    if (profileId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // UPDATE USER PROFILE DATA
    const updatedUser = await prisma.user.update({
      where: { id: profileId },
      data: {
        bio: bio || undefined,
        profile_pic: profile_pic || undefined
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        profile_pic: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  searchUsers,
  getUserProfile,
  updateUserProfile,
};
