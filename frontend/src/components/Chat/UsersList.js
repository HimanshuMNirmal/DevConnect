import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import './UsersList.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length > 0) {
      setLoading(true);
      setHasSearched(true);

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await userAPI.searchUsers(value);
          setUsers(response.data);
        } catch (err) {
          console.error('Error searching users:', err);
          setUsers([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setUsers([]);
      setHasSearched(false);
    }
  };

  const handleStartChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="users-list-container">
      <h2>Start a Conversation</h2>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Search users by username..."
          value={searchTerm}
          onChange={handleSearchChange}
          autoFocus
        />
        {loading && <span className="search-loading">Searching...</span>}
      </div>

      <div className="search-results">
        {!hasSearched ? (
          <div className="no-search">
            <p>Search for users to start a conversation</p>
          </div>
        ) : loading ? (
          <div className="loading">Loading...</div>
        ) : users.length > 0 ? (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-avatar">
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt={user.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <h3>{user.username}</h3>
                  {user.bio && <p className="user-bio">{user.bio}</p>}
                </div>
                <button
                  className="chat-button"
                  onClick={() => handleStartChat(user.id)}
                >
                  Message
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-users">
            No users found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
