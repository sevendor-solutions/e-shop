import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectPath
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    // If attempting to access admin routes, send to /admin/login
    const fallbackPath = redirectPath || (location.pathname.startsWith('/admin') ? '/admin/login' : '/login');
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If admin path, fallback to admin login, else fallback to home
    const fallbackPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
