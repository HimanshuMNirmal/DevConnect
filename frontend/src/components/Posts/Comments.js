import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../theme/useTheme';
import { postAPI } from '../../services/api';
import Markdown from 'markdown-to-jsx';
import CommentCard from './CommentCard';
import './Comments.css';

const Comments = ({ 
  postId, 
  currentUserId, 
  username,
  onCommentAdded,
  onCommentDeleted,
  onAuthorClick 
}) => {
  const { theme } = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchComments = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await postAPI.getComments(postId, pageNum, 10);
      const newComments = response.data.data || [];

      if (append) {
        setComments(prev => [...prev, ...newComments]);
      } else {
        setComments(newComments);
      }

      if (response.data.pagination) {
        setHasMore(pageNum < response.data.pagination.totalPages);
      }

      setError('');
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to fetch comments');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [postId]);

  useEffect(() => {
    setPage(1);
    fetchComments(1, false);
  }, [postId, fetchComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    if (!currentUserId) {
      setError('You must be logged in to comment');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await postAPI.createComment(postId, newComment);
      
      setComments(prev => [response.data.comment, ...prev]);
      setNewComment('');
      setError('');

      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      console.error('Error creating comment:', err);
      setError(err.response?.data?.message || 'Failed to create comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      const response = await postAPI.updateComment(commentId, content);
      
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? response.data.comment
            : comment
        )
      );
      
      setError('');
    } catch (err) {
      console.error('Error editing comment:', err);
      setError(err.response?.data?.message || 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postAPI.deleteComment(commentId);
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setError('');

      if (onCommentDeleted) {
        onCommentDeleted();
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  const commentsStyles = {
    container: {
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      borderTop: `1px solid ${theme.colors.borderColorLight}`,
    },
    title: {
      color: theme.colors.darkText,
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.semibold,
      marginBottom: theme.spacing.lg,
    },
    markdownNotice: {
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      border: `1px solid ${theme.colors.primary}`,
      color: theme.colors.darkText,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.lg,
      fontSize: theme.fontSizes.sm,
    },
    addCommentForm: {
      marginBottom: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
      borderBottom: `1px solid ${theme.colors.borderColorLight}`,
    },
    editorPreviewContainer: {
      display: 'flex',
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      '@media (max-width: 768px)': {
        flexDirection: 'column',
      },
    },
    editorSection: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.sm,
    },
    previewSection: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.sm,
    },
    label: {
      color: theme.colors.darkText,
      fontWeight: theme.fontWeights.semibold,
      fontSize: theme.fontSizes.sm,
    },
    textarea: {
      padding: theme.spacing.md,
      border: `1px solid ${theme.colors.borderColor}`,
      borderRadius: theme.borderRadius.sm,
      fontFamily: 'inherit',
      fontSize: theme.fontSizes.base,
      color: theme.colors.darkText,
      backgroundColor: theme.colors.bgPrimary,
      resize: 'vertical',
      minHeight: '100px',
      transition: `border-color ${theme.transitions.base}`,
    },
    markdownPreview: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.bgSecondary,
      border: `1px solid ${theme.colors.borderColor}`,
      borderRadius: theme.borderRadius.sm,
      minHeight: '100px',
      color: theme.colors.mediumText,
      lineHeight: '1.6',
      overflowY: 'auto',
      wordBreak: 'break-word',
    },
    previewPlaceholder: {
      color: theme.colors.darkGray,
      fontStyle: 'italic',
    },
    submitButton: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: 'none',
      borderRadius: theme.borderRadius.sm,
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.medium,
      cursor: 'pointer',
      transition: `background-color ${theme.transitions.base}`,
      alignSelf: 'flex-start',
    },
    commentsList: {
      display: 'flex',
      flexDirection: 'column',
    },
    loadMoreButton: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      backgroundColor: theme.colors.bgSecondary,
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,
      borderRadius: theme.borderRadius.sm,
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.medium,
      cursor: 'pointer',
      transition: `all ${theme.transitions.base}`,
      alignSelf: 'center',
      marginTop: theme.spacing.lg,
    },
    noComments: {
      textAlign: 'center',
      color: theme.colors.darkGray,
      fontSize: theme.fontSizes.base,
      padding: theme.spacing.xl,
    },
    error: {
      backgroundColor: theme.colors.errorLight,
      color: theme.colors.errorDark,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.lg,
      border: `1px solid ${theme.colors.error}`,
    },
  };

  return (
    <div style={commentsStyles.container}>
      <h3 style={commentsStyles.title}>Comments ({comments.length})</h3>

      <div style={commentsStyles.markdownNotice}>
        ✨ <strong>Markdown is supported!</strong> Format your comments with markdown syntax.
      </div>

      {error && (
        <div style={commentsStyles.error}>{error}</div>
      )}

      {currentUserId && (
        <form style={commentsStyles.addCommentForm} onSubmit={handleAddComment}>
          <div style={commentsStyles.editorPreviewContainer}>
            <div style={commentsStyles.editorSection}>
              <label style={commentsStyles.label}>Your Comment</label>
              <textarea
                style={commentsStyles.textarea}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.boxShadow = `0 0 5px rgba(102, 126, 234, 0.3)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.borderColor;
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Share your thoughts...&#10;&#10;You can use markdown:&#10;**bold** *italic* `code`&#10;- Lists&#10;[links](url)"
                disabled={isSubmitting}
              />
            </div>

            <div style={commentsStyles.previewSection}>
              <label style={commentsStyles.label}>Preview</label>
              <div style={commentsStyles.markdownPreview}>
                {newComment ? (
                  <Markdown>{newComment}</Markdown>
                ) : (
                  <p style={commentsStyles.previewPlaceholder}>Your markdown preview will appear here...</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={commentsStyles.submitButton}
            disabled={isSubmitting || !newComment.trim()}
            onMouseEnter={(e) => {
              if (!isSubmitting && newComment.trim()) {
                e.target.style.backgroundColor = theme.colors.primaryDark;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.primary;
            }}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {loading && comments.length === 0 ? (
        <div style={commentsStyles.noComments}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={commentsStyles.noComments}>No comments yet. Be the first to comment!</div>
      ) : (
        <>
          <div style={commentsStyles.commentsList}>
            {comments.map(comment => (
              <CommentCard
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onAuthorClick={onAuthorClick}
              />
            ))}
          </div>

          {hasMore && !isLoadingMore && (
            <button
              style={commentsStyles.loadMoreButton}
              onClick={handleLoadMore}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.primary;
                e.target.style.color = theme.colors.white;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.colors.bgSecondary;
                e.target.style.color = theme.colors.primary;
              }}
            >
              Load More Comments
            </button>
          )}

          {isLoadingMore && (
            <div style={commentsStyles.noComments}>Loading more comments...</div>
          )}
        </>
      )}
    </div>
  );
};

export default Comments;
