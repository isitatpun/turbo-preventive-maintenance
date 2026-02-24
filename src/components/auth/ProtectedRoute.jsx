import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // 1. ADD THIS LOG to catch the state drop in the act
  console.log("ProtectedRoute Check:", { 
    path: location.pathname, 
    isAuthenticated, 
    isLoading, 
    role: user?.role 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If this triggers, your authStore is losing its memory!
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. FIX: Ensure master_admin automatically bypasses all role restrictions
  if (allowedRoles && !allowedRoles.includes(user?.role) && user?.role !== 'master_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;