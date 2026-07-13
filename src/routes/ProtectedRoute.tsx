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
  const { isAuthenticated, user, login } = useAuthStore();
  const location = useLocation();

  // Auto-login admin on access for demo bypassing
  React.useEffect(() => {
    if (!isAuthenticated && location.pathname.startsWith('/admin')) {
      login({
        id: 'usr-1',
        name: 'Administrator',
        email: 'admin@eshop.com',
        role: 'admin',
        status: 'active',
        permissions: ['users:all'],
        createdAt: new Date().toISOString()
      }, 'mock-jwt-token-for-usr-1', true);
    }
  }, [isAuthenticated, location.pathname, login]);

  // Loader during instant authentication bypass
  if (!isAuthenticated && location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#1c1c1e] text-white">
        <p className="text-sm font-semibold animate-pulse tracking-widest uppercase">Loading Admin Dashboard...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    const fallbackPath = redirectPath || '/login';
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallbackPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
