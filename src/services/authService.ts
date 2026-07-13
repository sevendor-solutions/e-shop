import { User, UserRole } from '../types';
import { mockUsers } from './mockData';
import { apiClient, USE_MOCK, simulateLatency } from './api';

// Cache mock users in-memory to persist updates during session
let activeMockUsers = [...mockUsers];

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    if (USE_MOCK) {
      await simulateLatency(800);
      
      // Simple validation for mock
      const user = activeMockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user || password !== 'password123') {
        throw new Error('Invalid email or password. Hint: Use password123');
      }
      
      if (user.status !== 'active') {
        throw new Error('This account has been suspended or deactivated.');
      }
      
      // Mock JWT token
      const mockToken = `mock-jwt-token-for-${user.id}-${Date.now()}`;
      return { user, token: mockToken };
    } else {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    }
  },

  register: async (name: string, email: string): Promise<{ user: User; token: string }> => {
    if (USE_MOCK) {
      await simulateLatency(800);
      
      const emailExists = activeMockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        throw new Error('Email is already registered.');
      }

      const newUser: User = {
        id: `usr-${activeMockUsers.length + 1}`,
        name,
        email,
        role: 'customer',
        status: 'active',
        permissions: [],
        createdAt: new Date().toISOString()
      };

      activeMockUsers.push(newUser);
      
      const mockToken = `mock-jwt-token-for-${newUser.id}-${Date.now()}`;
      return { user: newUser, token: mockToken };
    } else {
      const response = await apiClient.post('/auth/register', { name, email });
      return response.data;
    }
  },

  getProfile: async (): Promise<User> => {
    if (USE_MOCK) {
      await simulateLatency(300);
      // Grab token from storage and parse user
      const token = localStorage.getItem('eshop_jwt_token') || sessionStorage.getItem('eshop_jwt_token');
      if (!token) throw new Error('Not authenticated');
      
      const userId = token.split('-')[4]; // extract id from mock token format
      const user = activeMockUsers.find((u) => u.id === userId);
      if (!user) throw new Error('User not found');
      return user;
    } else {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    }
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    if (USE_MOCK) {
      await simulateLatency(600);
      
      const index = activeMockUsers.findIndex((u) => u.id === userId);
      if (index === -1) throw new Error('User not found');
      
      activeMockUsers[index] = {
        ...activeMockUsers[index],
        ...data
      };
      
      return activeMockUsers[index];
    } else {
      const response = await apiClient.put(`/auth/profile/${userId}`, data);
      return response.data;
    }
  },

  forgotPassword: async (email: string): Promise<string> => {
    if (USE_MOCK) {
      await simulateLatency(800);
      const userExists = activeMockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!userExists) {
        throw new Error('No account found with this email address.');
      }
      return 'Password reset link has been sent to your email.';
    } else {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data.message;
    }
  },

  resetPassword: async (token: string, password: string): Promise<string> => {
    if (USE_MOCK) {
      await simulateLatency(1000);
      return 'Your password has been reset successfully. Please log in with your new password.';
    } else {
      const response = await apiClient.post('/auth/reset-password', { token, password });
      return response.data.message;
    }
  }
};
