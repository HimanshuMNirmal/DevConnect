import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children, isAuthenticated, restrictAuthUsers = true }) => {
  if (isAuthenticated && restrictAuthUsers) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
