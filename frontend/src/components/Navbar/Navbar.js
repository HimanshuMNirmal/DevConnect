import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/useTheme';
import { messageAPI } from '../../services/api';
import './Navbar.css';

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const { theme, gradients } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const socket = window.globalSocket;

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUnreadCount();
      
      if (socket) {
        const handleMessageReceived = () => {
          fetchUnreadCount();
        };

        const handleConversationMarkedAsRead = (data) => {
          setUnreadCount((prev) => Math.max(0, prev - (data.markedCount || 0)));
        };

        socket.on('message', handleMessageReceived);
        socket.on('messageRead', handleMessageReceived);
        socket.on('conversationMarkedAsRead', handleConversationMarkedAsRead);
        
        return () => {
          socket.off('message', handleMessageReceived);
          socket.off('messageRead', handleMessageReceived);
          socket.off('conversationMarkedAsRead', handleConversationMarkedAsRead);
        };
      }
    }
  }, [isAuthenticated, user, socket]);

  const fetchUnreadCount = async () => {
    try {
      const response = await messageAPI.getConversations();
      const totalUnread = response.data?.reduce((sum, conv) => sum + conv.unreadCount, 0) || 0;
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar" style={{ 
      background: theme.colors.bgPrimary,
      boxShadow: `0 2px 8px ${theme.colors.shadowColor}`
    }}>
      <div className="navbar-container" style={{ maxWidth: '1200px' }}>
        <Link 
          to="/" 
          className="navbar-logo"
          style={{
            background: gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          DevConnect
        </Link>

        <button
          className="hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            color: theme.colors.darkText
          }}
        >
          ☰
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          {isAuthenticated && user ? (
            <>
              <Link
                to="/"
                className={`nav-link ${isActive('/')}`}
                onClick={handleNavClick}
                style={{
                  color: location.pathname === '/' ? theme.colors.primary : theme.colors.lightText,
                }}
              >
                Home
              </Link>

              <Link
                to="/create-post"
                className={`nav-link ${isActive('/create-post')}`}
                onClick={handleNavClick}
                style={{
                  color: location.pathname === '/create-post' ? theme.colors.primary : theme.colors.lightText,
                }}
              >
                Create Post
              </Link>

              <Link
                to={`/profile/${user.id}`}
                className={`nav-link ${isActive(`/profile/${user.id}`)}`}
                onClick={handleNavClick}
                style={{
                  color: location.pathname.includes('/profile') ? theme.colors.primary : theme.colors.lightText,
                }}
              >
                Profile
              </Link>

              <Link
                to="/messages"
                className={`nav-link messages-link ${isActive('/messages')}`}
                onClick={handleNavClick}
                style={{
                  color: location.pathname.includes('/messages') ? theme.colors.primary : theme.colors.lightText,
                }}
              >
                Messages
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount}</span>
                )}
              </Link>

              <div className="nav-divider" style={{ 
                borderColor: theme.colors.borderColorLight 
              }} />

              <div className="user-info" style={{
                color: theme.colors.lightText
              }}>
                <span>{user.username}</span>
              </div>

              <button
                onClick={handleLogout}
                className="logout-btn"
                style={{
                  background: gradients.primary,
                  color: theme.colors.white,
                  border: 'none'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`nav-link ${isActive('/')}`}
                onClick={handleNavClick}
                style={{
                  color: theme.colors.lightText,
                }}
              >
                Home
              </Link>

              <div className="nav-divider" style={{ 
                borderColor: theme.colors.borderColorLight 
              }} />

              <Link
                to="/login"
                className={`nav-link ${isActive('/login')}`}
                onClick={handleNavClick}
                style={{
                  color: theme.colors.primary,
                  fontWeight: 600
                }}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="register-btn"
                onClick={handleNavClick}
                style={{
                  background: gradients.primary,
                  color: theme.colors.white,
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
