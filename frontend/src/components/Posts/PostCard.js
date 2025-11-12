import React, { useState } from 'react';
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
      await postAPI.toggleLike(post.id);
      if (onLike) {
        onLike(post.id);
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

      <p className="post-content">{post.content}</p>

      {post.tags && (
        <div className="post-tags">
          {post.tags.split(',').map((tag, idx) => (
            <span key={idx} className="tag">{tag.trim()}</span>
          ))}
        </div>
      )}

      <div className="post-footer">
        <div className="post-actions">
          <button
            className={`like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeClick}
            disabled={isLiking}
            title={currentUserId ? 'Like this post' : 'Log in to like posts'}
          >
            ❤️ {likesCount}
          </button>

          <button
            className={`comments-btn ${showComments ? 'active' : ''}`}
            onClick={() => setShowComments(!showComments)}
            title="View comments"
          >
            💬 {commentsCount}
          </button>
        </div>

        <button
          className="post-author-link"
          onClick={() => onAuthorClick(userId)}
        >
          by {displayName}
        </button>
      </div>

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
