import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Conversations from '../components/Chat/Conversations';
import Chat from '../components/Chat/Chat';
import './MessagesPage.css';

const MessagesPage = () => {
  const { userId } = useParams();
  const [selectedUserId, setSelectedUserId] = useState(userId || null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setSelectedUserId(userId || null);
    if (userId) {
      setIsMobileOpen(true);
    }
  }, [userId]);

  const handleSelectConversation = (newUserId) => {
    setSelectedUserId(newUserId);
    setIsMobileOpen(true);
  };

  const handleBackToConversations = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="messages-page">
      <div className={`conversations-sidebar ${isMobileOpen ? 'hidden' : ''}`}>
        <Conversations onSelectConversation={handleSelectConversation} />
      </div>

      <div className={`chat-area ${isMobileOpen ? 'visible' : ''}`}>
        {selectedUserId ? (
          <>
            <div className="chat-mobile-header">
              <button 
                className="back-button"
                onClick={handleBackToConversations}
              >
                ← Back
              </button>
            </div>
            <Chat userId={selectedUserId} />
          </>
        ) : (
          <div className="empty-state">
            <h2>Select a conversation</h2>
            <p>Choose a friend from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
