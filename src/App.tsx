import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './store/authStore';
import { authService } from './services/authService';
import { useThemeStore } from './store/themeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const { login, logout } = useAuthStore();
  const { theme } = useThemeStore();

  // Try to restore user session on mount
  useEffect(() => {
    const token = localStorage.getItem('eshop_jwt_token') || sessionStorage.getItem('eshop_jwt_token');
    
    if (token) {
      authService.getProfile()
        .then((user) => {
          login(user, token, !!localStorage.getItem('eshop_jwt_token'));
        })
        .catch(() => {
          // Token is invalid or expired
          logout();
        });
    }

    // Apply dark class to HTML on load
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [login, logout, theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Toast Container */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1c1c1e',
              color: '#ffffff',
              border: '1px solid #2c2c2e',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600',
              padding: '12px 16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#1c1c1e',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1c1c1e',
              },
            },
          }}
        />
        
        {/* Navigation Router Paths */}
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
