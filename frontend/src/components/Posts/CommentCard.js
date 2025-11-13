import React, { useState } from 'react';
import { useTheme } from '../../theme/useTheme';
import Markdown from 'markdown-to-jsx';

const CommentCard = React.memo(({ 
  comment, 
  currentUserId, 
  onEdit, 
  onDelete,
  onAuthorClick 
}) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const isCommentAuthor = comment.user?.id === currentUserId;

  const handleEditSave = () => {
    if (editedContent.trim() && editedContent !== comment.content) {
      onEdit(comment.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  const commentStyles = {
    container: {
      backgroundColor: theme.colors.bgSecondary,
      borderLeft: `3px solid ${theme.colors.primary}`,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      transition: `background-color ${theme.transitions.base}`,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.md,
      flexWrap: 'wrap',
    },
    authorName: {
      color: theme.colors.darkText,
      fontWeight: theme.fontWeights.semibold,
      cursor: 'pointer',
      transition: `all ${theme.transitions.base}`,
      fontSize: theme.fontSizes.sm,
      background: 'none',
      border: 'none',
      padding: 0,
      fontFamily: 'inherit',
      textDecoration: 'none',
      textAlign: 'left',
    },
    authorNameHover: {
      color: theme.colors.primary,
    },
    timestamp: {
      color: theme.colors.darkGray,
      fontSize: theme.fontSizes.xs,
    },
    content: {
      color: theme.colors.mediumText,
      lineHeight: '1.5',
      marginBottom: theme.spacing.md,
      wordBreak: 'break-word',
    },
    editArea: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.sm,
    },
    editTextarea: {
      padding: theme.spacing.md,
      border: `1px solid ${theme.colors.borderColor}`,
      borderRadius: theme.borderRadius.sm,
      fontFamily: 'inherit',
      fontSize: theme.fontSizes.base,
      color: theme.colors.darkText,
      backgroundColor: theme.colors.bgPrimary,
      resize: 'vertical',
      minHeight: '80px',
      transition: `border-color ${theme.transitions.base}`,
    },
    editButtonsContainer: {
      display: 'flex',
      gap: theme.spacing.sm,
    },
    actionButtons: {
      display: 'flex',
      gap: theme.spacing.sm,
      alignItems: 'center',
    },
    button: {
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.colors.darkGray,
      cursor: 'pointer',
      fontSize: theme.fontSizes.sm,
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      transition: `color ${theme.transitions.base}`,
      fontWeight: theme.fontWeights.medium,
    },
    editButton: {
      color: theme.colors.info,
    },
    deleteButton: {
      color: theme.colors.error,
    },
    saveButton: {
      backgroundColor: theme.colors.success,
      color: theme.colors.white,
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      borderRadius: theme.borderRadius.sm,
      flex: 1,
      transition: `opacity ${theme.transitions.base}`,
    },
    cancelButton: {
      backgroundColor: theme.colors.borderColor,
      color: theme.colors.darkText,
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      borderRadius: theme.borderRadius.sm,
      flex: 1,
      transition: `opacity ${theme.transitions.base}`,
    },
  };

  return (
    <div style={commentStyles.container}>
      <div style={commentStyles.header}>
        <button
          style={commentStyles.authorName}
          onClick={() => onAuthorClick(comment.user?.id)}
          onMouseEnter={(e) => {
            e.target.style.color = theme.colors.primary;
          }}
          onMouseLeave={(e) => {
            e.target.style.color = theme.colors.darkText;
          }}
        >
          {comment.user?.username || 'Unknown'}
        </button>
        <span style={commentStyles.timestamp}>
          {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isEditing ? (
        <div style={commentStyles.editArea}>
          <textarea
            style={commentStyles.editTextarea}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = theme.colors.primary;
              e.target.style.boxShadow = `0 0 5px rgba(102, 126, 234, 0.3)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.borderColor;
              e.target.style.boxShadow = 'none';
            }}
            placeholder="Edit your comment..."
          />
          <div style={commentStyles.editButtonsContainer}>
            <button
              style={{
                ...commentStyles.saveButton,
              }}
              onClick={handleEditSave}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
              }}
            >
              Save
            </button>
            <button
              style={{
                ...commentStyles.cancelButton,
              }}
              onClick={handleEditCancel}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={commentStyles.content}>
            <Markdown>{comment.content}</Markdown>
          </div>

          {isCommentAuthor && (
            <div style={commentStyles.actionButtons}>
              <button
                style={{ ...commentStyles.button, ...commentStyles.editButton }}
                onClick={() => setIsEditing(true)}
                onMouseEnter={(e) => {
                  e.target.style.color = theme.colors.info;
                  e.target.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = theme.colors.info;
                  e.target.style.opacity = '1';
                }}
              >
                Edit
              </button>
              <button
                style={{ ...commentStyles.button, ...commentStyles.deleteButton }}
                onClick={() => onDelete(comment.id)}
                onMouseEnter={(e) => {
                  e.target.style.color = theme.colors.error;
                  e.target.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = theme.colors.error;
                  e.target.style.opacity = '1';
                }}
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}, (prev, next) => {
  return (
    prev.comment === next.comment &&
    prev.currentUserId === next.currentUserId &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete
  );
});

CommentCard.displayName = 'CommentCard';

export default CommentCard;
