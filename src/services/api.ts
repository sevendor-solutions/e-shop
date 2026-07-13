import axios from 'axios';

// Centralized configuration to toggle between Mock and Live API
export const USE_MOCK = true;

// Axios instance config
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.eshop-cy.com/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eshop_jwt_token') || sessionStorage.getItem('eshop_jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Refresh or Auth Errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Mock token refresh endpoint or real one
        const refreshToken = localStorage.getItem('eshop_refresh_token');
        if (refreshToken) {
          // In real implementation:
          // const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          // const { token } = res.data;
          // localStorage.setItem('eshop_jwt_token', token);
          // originalRequest.headers.Authorization = `Bearer ${token}`;
          // return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear tokens and redirect to login if refresh fails
        localStorage.removeItem('eshop_jwt_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Simulates network latency when mock mode is enabled
export const simulateLatency = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));
