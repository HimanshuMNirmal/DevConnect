import React from 'react';
import { Link } from 'react-router-dom';
import PostList from '../components/Posts/PostList';
import { useTheme } from '../theme';
import './Home.css';

const Home = ({ isAuthenticated, onLogout, currentUserId, username }) => {
  const { theme } = useTheme();

  return (
    <div className="home-container">
      <main className="main-content">
        <div 
          className="welcome-section"
          style={{
            background: theme.colors.bgPrimary,
            borderColor: theme.colors.borderColor,
            boxShadow: `0 2px 8px ${theme.colors.shadowColor}`
          }}
        >
          <h2 style={{ color: theme.colors.darkText }}>
            {isAuthenticated ? 'Welcome to DevConnect! 👋' : 'Welcome to DevConnect'}
          </h2>
          <p style={{ color: theme.colors.lightText }}>
            {isAuthenticated 
              ? 'Connect with developers, share knowledge, and grow together.'
              : 'A platform for developers to connect, share, and grow together.'
            }
          </p>
          {!isAuthenticated && (
            <p style={{ color: theme.colors.lightText }}>
              Please <Link to="/login" style={{ color: theme.colors.primary }}>login</Link> or{' '}
              <Link to="/register" style={{ color: theme.colors.primary }}>register</Link> to get started.
            </p>
          )}
        </div>
        <PostList currentUserId={currentUserId} username={username} />
      </main>
    </div>
  );
};

export default Home;
