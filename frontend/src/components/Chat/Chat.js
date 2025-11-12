import React, { useState, useEffect, useRef, useCallback } from 'react';
import { messageAPI } from '../../services/api';
import './Chat.css';

const Chat = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const socket = window.globalSocket; 
  const MESSAGES_PER_PAGE = 10;

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 0);
    }
  };

  const markMessageAsRead = async (messageId, messageData = null) => {
    try {
      let msg = messageData;
      if (!msg) {
        msg = messages.find(m => m.id === messageId);
      }
      
      if (!msg) {
        console.warn('Message not found for ID:', messageId);
        return;
      }

      await messageAPI.markAsRead(messageId);
      
      setMessages((prev) => {
        const messageIndex = prev.findIndex(m => m.id === messageId);
        
        const updatedMessages = prev.map((m, index) => {
          if (m.id === messageId) {
            return { ...m, isRead: true };
          }
          
          if (index < messageIndex && m.senderId === msg.senderId && !m.isRead) {
            return { ...m, isRead: true };
          }
          
          if (index < messageIndex && m.senderId === msg.senderId && m.isRead) {
          }
          
          return m;
        });
        
        return updatedMessages;
      });
      
      
      if (socket) {
        socket.emit('markAsRead', {
          messageId: messageId,
          senderId: msg.senderId, 
          readBy: currentUser?.id,     
        });
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageAPI.getMessages(userId, 1, MESSAGES_PER_PAGE);
      const fetchedMessages = response.data?.data || [];
      setMessages(fetchedMessages.reverse());
      setCurrentPage(1);
      setHasMore(response.data?.pagination?.hasMore || false);
      setTotalCount(response.data?.pagination?.totalCount || 0);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      
      const container = messagesContainerRef.current;
      const scrollHeightBefore = container.scrollHeight;
      const scrollPositionBefore = container.scrollTop;
      
      const nextPage = currentPage + 1;
      const response = await messageAPI.getMessages(userId, nextPage, MESSAGES_PER_PAGE);
      const newMessages = response.data?.data || [];
      
      if (newMessages.length > 0) {
        setMessages((prev) => [...newMessages.reverse(), ...prev]);
        setCurrentPage(nextPage);
        setHasMore(response.data?.pagination?.hasMore || false);
        
        setTimeout(() => {
          const scrollHeightAfter = container.scrollHeight;
          const heightDifference = scrollHeightAfter - scrollHeightBefore;
          container.scrollTop = scrollPositionBefore + heightDifference;
        }, 0);
      }
    } catch (err) {
      console.error('Error loading more messages:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (currentPage === 1) {
      scrollToBottom();
    }
  }, [messages, currentPage]);

  const markAllConversationMessagesAsRead = useCallback(async () => {
    try {
      
      const response = await messageAPI.markConversationAsRead(userId);
      
      setMessages((prev) => {
        const updated = prev.map((msg) => {
          if (msg.senderId === parseInt(userId)) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
        return updated;
      });
      
      
      if (socket) {
        socket.emit('conversationReadByUser', {
          conversationWith: parseInt(userId),
          readBy: currentUser?.id,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  }, [userId, socket, currentUser?.id]);

  useEffect(() => {
    if (userId) {
      markAllConversationMessagesAsRead();
    }
  }, [userId]);

  useEffect(() => {
    fetchMessages();

    if (!socket) {
      console.warn('Socket not initialized');
      return;
    }

    const handleMessage = (data) => {
      if (data.senderId === parseInt(userId) || data.receiverId === parseInt(userId)) {
        
        setMessages((prev) => {
          const updated = prev.map((msg) => ({
            ...msg,
            isRead: true
          }));
          return [...updated, data];
        });
        
        if (data.senderId === parseInt(userId) && !data.isRead) {
          markMessageAsRead(data.id, data);
        }
      } else {
      }
    };

    const handleMessageSent = (data) => {
      if (data.receiverId === parseInt(userId)) {
        setMessages((prev) => [...prev, data]);
      }
    };

    const handleUserTyping = (data) => {
      if (data.senderId === parseInt(userId)) {
        setIsTyping(true);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };

    const handleUserStoppedTyping = () => {
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };

    const handleMessageRead = (data) => {
      
      setMessages((prev) => {
        const messageIndex = prev.findIndex(m => m.id === data.messageId);
        
        const targetMessage = prev.find(m => m.id === data.messageId);
        const senderId = targetMessage?.senderId;
        
        
        const updated = prev.map((msg, index) => {
          if (msg.id === data.messageId) {
            return { ...msg, isRead: true };
          }
          
          if (senderId && index < messageIndex && msg.senderId === senderId && !msg.isRead) {
            return { ...msg, isRead: true };
          }
          
          if (messageIndex === -1 && msg.senderId !== currentUser?.id && !msg.isRead) {
            return { ...msg, isRead: true };
          }
          
          return msg;
        });
        return updated;
      });
    };

    const handleConversationRead = (data) => {
      
      if (data.conversationWith === parseInt(userId)) {
        
        setMessages((prev) => {
          const updated = prev.map((msg) => {
            if (msg.senderId === currentUser?.id) {
              return { ...msg, isRead: true };
            }
            return msg;
          });
          return updated;
        });
      } else {
      }
    };

    socket.on('message', handleMessage);
    socket.on('messageSent', handleMessageSent);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);
    socket.on('messageRead', handleMessageRead);
    socket.on('conversationRead', handleConversationRead);

    return () => {
      socket.off('message', handleMessage);
      socket.off('messageSent', handleMessageSent);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
      socket.off('messageRead', handleMessageRead);
      socket.off('conversationRead', handleConversationRead);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userId, fetchMessages, socket]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    try {
      const messageText = message;
      setMessage(''); 

      const response = await messageAPI.sendMessage(userId, messageText);
      const newMessage = response.data?.data;

      socket.emit('sendMessage', {
        id: newMessage?.id,
        senderId: currentUser?.id,
        senderName: currentUser?.username,
        receiverId: parseInt(userId),
        message: messageText,
        messageId: newMessage?.id,
        createdAt: newMessage?.createdAt || new Date().toISOString(),
        isRead: false
      });

      socket.emit('stopTyping', {
        senderId: currentUser?.id,
        receiverId: userId,
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setMessage(message);
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', {
        senderId: currentUser?.id,
        receiverId: userId,
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className="chat-container">
      {error && <div className="error-message">{error}</div>}
      
      <div className="chat-header">
        <h3>Chat</h3>
      </div>

      <div className="messages-list" ref={messagesContainerRef}>
        {hasMore && messages.length > 0 && (
          <div className="load-more-container">
            <button 
              className="load-more-btn" 
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading...' : 'Load Previous Messages'}
            </button>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.senderId === currentUser?.id ? 'sent' : 'received'
              }`}
            >
              <div className="message-content">
                <p>{msg.message}</p>
              </div>
              <span className="message-time">
                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }) : 'Just now'}
              </span>
              {msg.isRead && msg.senderId === currentUser?.id && (
                <span className="read-status">✓✓</span>
              )}
            </div>
          ))
        )}
        {isTyping && <div className="typing-indicator">Typing...</div>}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button type="submit" disabled={!message.trim() || loading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
