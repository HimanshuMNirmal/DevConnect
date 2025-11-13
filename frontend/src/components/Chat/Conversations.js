import React, { useState, useEffect, useCallback, useRef } from 'react';
import { messageAPI, userAPI } from '../../services/api';
import './Conversations.css';

const Conversations = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const socket = window.globalSocket;
  const refetchTimeoutRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversations();
      setConversations(response.data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNewMessage = useCallback((messageData) => {
    // Update the conversation with the new message without refetching
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        // Check if this message belongs to this conversation
        const isRelevant = 
          (messageData.senderId === conv.user.id) || 
          (messageData.receiverId === conv.user.id);
        
        if (isRelevant) {
          return {
            ...conv,
            lastMessage: {
              id: messageData.id || messageData.messageId,
              senderId: messageData.senderId,
              receiverId: messageData.receiverId,
              message: messageData.message,
              createdAt: messageData.createdAt,
              isRead: messageData.isRead || false
            },
            lastMessageTime: messageData.createdAt || new Date().toISOString(),
            unreadCount: messageData.senderId === currentUser?.id ? conv.unreadCount : (messageData.isRead ? conv.unreadCount : (conv.unreadCount || 0) + 1)
          };
        }
        return conv;
      });
    });
  }, [currentUser?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

    useEffect(() => {
    if (!socket) {
      return;
    }

    const handleMessage = (data) => {
      handleNewMessage(data);
    };

    const handleMessageSent = (data) => {
      handleNewMessage(data);
    };

    const handleMessageRead = (data) => {
      // Update the message read status locally without refetching
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          // Check if this conversation's last message was just read
          if (conv.lastMessage && (conv.lastMessage.id === data.messageId)) {
            return {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                isRead: true
              },
              // Reduce unread count if the message was from the sender (other user)
              unreadCount: conv.lastMessage.senderId !== currentUser?.id && !conv.lastMessage.isRead ? Math.max(0, conv.unreadCount - 1) : conv.unreadCount
            };
          }
          return conv;
        });
      });
    };

    socket.on('message', handleMessage);
    socket.on('messageSent', handleMessageSent);
    socket.on('messageRead', handleMessageRead);
    
    return () => {
      socket.off('message', handleMessage);
      socket.off('messageSent', handleMessageSent);
      socket.off('messageRead', handleMessageRead);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const timeoutId = refetchTimeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [socket, handleNewMessage,currentUser?.id]);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      try {
        const response = await userAPI.searchUsers(value);
        setSearchResults(response.data);
      } catch (err) {
        console.error('Error searching users:', err);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleOpenConversation = async (userId) => {
    try {
      const response = await messageAPI.markConversationAsRead(userId);
      setConversations((prevConversations) =>
        prevConversations.map((conv) => {
          if (conv.user.id === userId) {
            return {
              ...conv,
              unreadCount: 0, 
              lastMessage: {
                ...conv.lastMessage,
                isRead: true 
              }
            };
          }
          return conv;
        })
      );
      
      if (socket) {
        socket.emit('conversationMarkedAsRead', { 
          userId,
          markedCount: response.data?.updatedCount || 0
        });
      }
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
    
    onSelectConversation(userId);
    setShowSearch(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="conversations-container">
      <div className="conversations-header">
        <h2>Messages</h2>
        <button
          className="new-message-btn"
          onClick={() => setShowSearch(!showSearch)}
        >
          {showSearch ? '✕' : '+ New'}
        </button>
      </div>

      {showSearch && (
        <div className="search-section">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus
            className="search-input"
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="search-result-item"
                  onClick={() => handleOpenConversation(user.id)}
                >
                  <div className="user-avatar-small">
                    {user.profile_pic ? (
                      <img src={user.profile_pic} alt={user.username} />
                    ) : (
                      <div className="avatar-placeholder-small">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-info-small">
                    <p className="username">{user.username}</p>
                    {user.bio && <p className="bio">{user.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="conversations-list">
        {loading ? (
          <div className="loading">Loading conversations...</div>
        ) : conversations.length > 0 ? (
          conversations.map((conv) => (
            <div
              key={conv.user.id}
              className="conversation-item"
              onClick={() => handleOpenConversation(conv.user.id)}
            >
              <div className="conv-avatar">
                {conv.user.profile_pic ? (
                  <img src={conv.user.profile_pic} alt={conv.user.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {conv.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                {conv.unreadCount > 0 && (
                  <span className="unread-badge">{conv.unreadCount}</span>
                )}
              </div>

              <div className="conv-details">
                <div className="conv-header">
                  <h3>{conv.user.username}</h3>
                  <span className="conv-time">
                    {new Date(conv.lastMessageTime).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className={`last-message ${conv.unreadCount > 0 ? 'unread' : ''}`}>
                  {conv.lastMessage.senderId === currentUser?.id ? 'You: ' : ''}
                  {conv.lastMessage.message.substring(0, 40)}
                  {conv.lastMessage.message.length > 40 ? '...' : ''}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-conversations">
            <p>No conversations yet</p>
            <p className="help-text">Search for a user to start a conversation</p>
            <button
              className="start-btn"
              onClick={() => setShowSearch(true)}
            >
              Start a Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;
