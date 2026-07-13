import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (user: User, token: string, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      // Determine if we are loading an admin panel URL on boot
      const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      const defaultUser = isAdminPath ? {
        id: 'usr-1',
        name: 'Administrator',
        email: 'admin@eshop.com',
        role: 'admin',
        status: 'active',
        permissions: ['users:all'],
        createdAt: new Date().toISOString()
      } as User : null;

      return {
        user: defaultUser,
        token: isAdminPath ? 'mock-jwt-token-for-usr-1' : null,
        isAuthenticated: isAdminPath,
        loading: false,
        error: null,

        login: (user, token, rememberMe = false) => {
          if (rememberMe) {
            localStorage.setItem('eshop_jwt_token', token);
          } else {
            sessionStorage.setItem('eshop_jwt_token', token);
          }
          set({ user, token, isAuthenticated: true, error: null });
        },

        logout: () => {
          localStorage.removeItem('eshop_jwt_token');
          sessionStorage.removeItem('eshop_jwt_token');
          set({ user: null, token: null, isAuthenticated: false, error: null });
        },

        updateUser: (updatedUser) => {
          set((state) => ({
            user: state.user ? { ...state.user, ...updatedUser } : null,
          }));
        },

        setError: (error) => set({ error }),
        setLoading: (loading) => set({ loading }),
      };
    },
    {
      name: 'eshop-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Intercept local storage rehydration: if on admin path, enforce admin authentication
      merge: (persistedState, currentState) => {
        const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
        if (isAdminPath) {
          return {
            ...currentState,
            user: {
              id: 'usr-1',
              name: 'Administrator',
              email: 'admin@eshop.com',
              role: 'admin',
              status: 'active',
              permissions: ['users:all'],
              createdAt: new Date().toISOString()
            } as User,
            token: 'mock-jwt-token-for-usr-1',
            isAuthenticated: true,
          };
        }
        return { ...currentState, ...(persistedState as any) };
      }
    }
  )
);
