// =============================================================================
// src/components/ProtectedRoute.jsx – Route Guard Component
// =============================================================================
// Wraps routes that require authentication. Redirects unauthenticated users
// to the login page. Optionally checks for required roles.
// =============================================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the intended destination so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
