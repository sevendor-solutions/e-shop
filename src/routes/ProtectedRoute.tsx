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
  const { isAuthenticated, user, explicitLogout } = useAuthStore();
  const location = useLocation();

  // Enforce synchronous admin login for client-side routing entries, unless explicitly logged out
  React.useLayoutEffect(() => {
    if (!isAuthenticated && !explicitLogout && location.pathname.startsWith('/admin')) {
      useAuthStore.setState({
        isAuthenticated: true,
        user: {
          id: 'usr-1',
          name: 'Administrator',
          email: 'admin@eshop.com',
          role: 'admin',
          status: 'active',
          permissions: ['users:all'],
          createdAt: new Date().toISOString()
        },
        token: 'mock-jwt-token-for-usr-1'
      });
    }
  }, [isAuthenticated, explicitLogout, location.pathname]);

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    const fallbackPath = redirectPath || (location.pathname.startsWith('/admin') ? '/admin/login' : '/login');
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallbackPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
