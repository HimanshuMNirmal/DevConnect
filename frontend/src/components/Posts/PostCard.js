import React, { useState } from 'react';
import Markdown from 'markdown-to-jsx';
import Comments from './Comments';
import { postAPI } from '../../services/api';

const PostCard = React.memo(({ post, username, currentUserId, onLike, onAuthorClick, onCommentAdded, onCommentDeleted }) => {
  const userId = post.user?.id;
  const displayName = post.user?.username ?? username ?? 'Unknown';
  const likesCount = post.likes_count ?? post.likes?.length ?? 0;
  const commentsCount = post.comments_count ?? post.comments?.length ?? 0;
  const isLiked = !!post._optimisticLiked; 
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLikeClick = async () => {
    if (!currentUserId) {
      alert('Please log in to like posts');
      return;
    }

    try {
      setIsLiking(true);
      // TOGGLE POST LIKE STATUS
      // Send like/unlike request to backend
      const response = await postAPI.toggleLike(post.id);
      if (onLike) {
        onLike(post.id, response.data.liked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to like post. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <h3>{post.title}</h3>
        <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="post-content">
        <Markdown>{post.content}</Markdown>
      </div>

      {/* DISPLAY POST TAGS IF AVAILABLE */}
      {post.tags && (
        <div className="post-tags">
          {post.tags.split(',').map((tag, idx) => (
            <span key={idx} className="tag">{tag.trim()}</span>
          ))}
        </div>
      )}

      <div className="post-footer">
        <div className="post-actions">
          {/* LIKE BUTTON - ALLOWS AUTHENTICATED USERS TO LIKE POSTS */}
          <button
            className={`like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeClick}
            disabled={isLiking}
            title={currentUserId ? 'Like this post' : 'Log in to like posts'}
          >
            ❤️ {likesCount}
          </button>

          {/* COMMENTS TOGGLE - SHOW/HIDE COMMENTS SECTION */}
          <button
            className={`comments-btn ${showComments ? 'active' : ''}`}
            onClick={() => setShowComments(!showComments)}
            title="View comments"
          >
            💬 {commentsCount}
          </button>
        </div>

        {/* AUTHOR LINK - NAVIGATE TO AUTHOR'S PROFILE */}
        <button
          className="post-author-link"
          onClick={() => onAuthorClick(userId)}
        >
          by {displayName}
        </button>
      </div>

      {/* RENDER COMMENTS SECTION WHEN TOGGLED */}
      {showComments && (
        <Comments
          postId={post.id}
          currentUserId={currentUserId}
          username={username}
          onCommentAdded={() => {
            if (onCommentAdded) {
              onCommentAdded();
            }
          }}
          onCommentDeleted={() => {
            if (onCommentDeleted) {
              onCommentDeleted();
            }
          }}
          onAuthorClick={onAuthorClick}
        />
      )}
    </div>
  );
}, (prev, next) => {
  return prev.post === next.post && prev.username === next.username && prev.currentUserId === next.currentUserId;
});

export default PostCard;
