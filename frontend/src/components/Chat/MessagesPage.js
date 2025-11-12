import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Conversations from './Conversations';
import Chat from './Chat';
import './MessagesPage.css';

const MessagesPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState(userId || null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      setSelectedUserId(parseInt(userId));
    }
  }, [userId]);

  const handleSelectConversation = (id) => {
    setSelectedUserId(id);
    navigate(`/messages/${id}`);
    setIsMobileOpen(false);
  };

  return (
    <div className="messages-page">
      <button
        className="mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      <div className={`messages-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <Conversations onSelectConversation={handleSelectConversation} />
      </div>

      <div className="messages-chat">
        {selectedUserId ? (
          <Chat userId={selectedUserId} />
        ) : (
          <div className="no-chat-selected">
            <div className="empty-state">
              <h2>Select a conversation</h2>
              <p>Choose a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
