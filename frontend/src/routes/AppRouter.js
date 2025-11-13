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

  // CHECK AUTHENTICATION STATUS ON MOUNT
  // Initialize loading state to complete async auth checks
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
      {/* PUBLIC ROUTES */}
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

      {/* AUTHENTICATION ROUTES - Only accessible to unauthenticated users */}
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

      {/* PROTECTED ROUTES - Only accessible to authenticated users */}
      <Route
        path="/create-post"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <CreatePost />
          </ProtectedRoute>
        }
      />

      {/* USER PROFILE ROUTES */}
      <Route
        path="/profile/:userId"
        element={
          <Profile isAuthenticated={isAuthenticated} currentUserId={user?.id} />
        }
      />

      {/* MESSAGING ROUTES */}
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

      {/* FALLBACK - Redirect all undefined routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
