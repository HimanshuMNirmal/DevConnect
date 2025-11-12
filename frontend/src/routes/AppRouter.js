import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Home from '../pages/Home';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import CreatePost from '../components/Posts/CreatePost';
import Profile from '../components/Profile/Profile';
import MessagesPage from '../pages/MessagesPage';

import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

const AppRouter = ({ isAuthenticated, onLogin, onLogout, user }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    onLogin();
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            currentUserId={user?.id}
            username={user?.username}
          />
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute isAuthenticated={isAuthenticated} restrictAuthUsers={true}>
            <Login onLogin={handleLogin} />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute isAuthenticated={isAuthenticated} restrictAuthUsers={true}>
            <Register onLogin={handleLogin} />
          </PublicRoute>
        }
      />

      <Route
        path="/create-post"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <CreatePost />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:userId"
        element={
          <Profile isAuthenticated={isAuthenticated} currentUserId={user?.id} />
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <MessagesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages/:userId"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <MessagesPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
