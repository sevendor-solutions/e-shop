import { Customer, Coupon, Banner, Review, User } from '../types';
import { mockCustomers, mockUsers, mockCoupons, mockBanners, mockReviews } from './mockData';
import { productService } from './productService';
import { orderService } from './orderService';
import { apiClient, USE_MOCK, simulateLatency } from './api';

// Cache in-memory
let activeCustomers = [...mockCustomers];
let activeUsers = [...mockUsers];
let activeCoupons = [...mockCoupons];
let activeBanners = [...mockBanners];
let activeReviews = [...mockReviews];

// Mock settings
let storeSettings = {
  storeName: 'E-Shop International',
  storeEmail: 'contact@eshop-cy.com',
  currency: 'USD',
  taxRate: 8, // 8%
  shippingFee: 10,
  freeShippingThreshold: 150,
  themeMode: 'light',
  maintenanceMode: false
};

export const adminService = {
  // --- Dashboard Metrics ---
  getDashboardStats: async (): Promise<{
    kpis: {
      totalSales: number;
      revenue: number;
      ordersCount: number;
      customersCount: number;
      productsCount: number;
      lowStockCount: number;
    };
    recentOrders: any[];
    recentCustomers: Customer[];
    latestReviews: Review[];
    topProducts: { name: string; price: number; sales: number; image: string }[];
    chartData: {
      salesHistory: { date: string; sales: number; revenue: number }[];
      categoryDistribution: { name: string; value: number }[];
    };
  }> => {
    if (USE_MOCK) {
      await simulateLatency(500);

      const products = productService._getActiveProducts();
      const orders = orderService._getActiveOrders();
      
      const ordersCount = orders.length;
      const customersCount = activeCustomers.length;
      const productsCount = products.length;
      const lowStockCount = products.filter(p => p.stock < 15).length;
      
      // Calculate total sales and revenue
      const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
      const revenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total - o.shipping - o.tax), 0);

      // Top products (mock calculation)
      const topProducts = [
        { name: products[0]?.name || 'Apollo Headphones', price: products[0]?.price || 249.99, sales: 42, image: products[0]?.image || '' },
        { name: products[2]?.name || 'Zenith Smart Watch', price: products[2]?.price || 189.99, sales: 38, image: products[2]?.image || '' },
        { name: products[4]?.name || 'Velocity Sneakers', price: products[4]?.price || 119.99, sales: 29, image: products[4]?.image || '' }
      ];

      // Recent orders limit 5
      const recentOrders = orders.slice(0, 5);
      // Recent customers limit 5
      const recentCustomers = activeCustomers.slice(0, 5);
      // Latest reviews
      const latestReviews = activeReviews.slice(0, 4);

      // Chart data: past 7 days
      const salesHistory = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Random but deterministic-looking sales
        const baseSales = 2 + (i % 3) * 1.5 + Math.random() * 2;
        return {
          date: dateStr,
          sales: Math.round(baseSales),
          revenue: Math.round(baseSales * 180)
        };
      });

      const categoryDistribution = [
        { name: 'Electronics', value: 45 },
        { name: 'Fashion', value: 30 },
        { name: 'Home & Living', value: 15 },
        { name: 'Sports', value: 10 }
      ];

      return {
        kpis: {
          totalSales: Number(totalSales.toFixed(2)),
          revenue: Number(revenue.toFixed(2)),
          ordersCount,
          customersCount,
          productsCount,
          lowStockCount
        },
        recentOrders,
        recentCustomers,
        latestReviews,
        topProducts,
        chartData: {
          salesHistory,
          categoryDistribution
        }
      };
    } else {
      const response = await apiClient.get('/admin/dashboard-stats');
      return response.data;
    }
  },

  // --- Customers Management ---
  getCustomers: async (search?: string): Promise<Customer[]> => {
    if (USE_MOCK) {
      await simulateLatency(300);
      if (search) {
        const query = search.toLowerCase();
        return activeCustomers.filter(
          c => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
        );
      }
      return activeCustomers;
    } else {
      const response = await apiClient.get('/admin/customers', { params: { search } });
      return response.data;
    }
  },

  updateCustomerStatus: async (id: string, status: Customer['status']): Promise<Customer> => {
    if (USE_MOCK) {
      await simulateLatency(400);
      const idx = activeCustomers.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Customer not found');
      activeCustomers[idx] = { ...activeCustomers[idx], status };
      return activeCustomers[idx];
    } else {
      const response = await apiClient.put(`/admin/customers/${id}/status`, { status });
      return response.data;
    }
  },

  // --- Users Management ---
  getUsers: async (): Promise<User[]> => {
    if (USE_MOCK) {
      await simulateLatency(300);
      return activeUsers;
    } else {
      const response = await apiClient.get('/admin/users');
      return response.data;
    }
  },

  createUser: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    if (USE_MOCK) {
      await simulateLatency(500);
      const newUser: User = {
        ...userData,
        id: `usr-${activeUsers.length + 1}`,
        createdAt: new Date().toISOString()
      };
      activeUsers.push(newUser);
      return newUser;
    } else {
      const response = await apiClient.post('/admin/users', userData);
      return response.data;
    }
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    if (USE_MOCK) {
      await simulateLatency(400);
      const idx = activeUsers.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('User not found');
      activeUsers[idx] = { ...activeUsers[idx], ...userData };
      return activeUsers[idx];
    } else {
      const response = await apiClient.put(`/admin/users/${id}`, userData);
      return response.data;
    }
  },

  deleteUser: async (id: string): Promise<boolean> => {
    if (USE_MOCK) {
      await simulateLatency(300);
      activeUsers = activeUsers.filter(u => u.id !== id);
      return true;
    } else {
      await apiClient.delete(`/admin/users/${id}`);
      return true;
    }
  },

  // --- Coupon Management ---
  getCoupons: async (): Promise<Coupon[]> => {
    if (USE_MOCK) {
      await simulateLatency(300);
      return activeCoupons;
    } else {
      const response = await apiClient.get('/admin/coupons');
      return response.data;
    }
  },

  createCoupon: async (couponData: Omit<Coupon, 'id' | 'usageCount'>): Promise<Coupon> => {
    if (USE_MOCK) {
      await simulateLatency(500);
      const newCoupon: Coupon = {
        ...couponData,
        id: `cp-${activeCoupons.length + 1}`,
        usageCount: 0
      };
      activeCoupons.push(newCoupon);
      return newCoupon;
    } else {
      const response = await apiClient.post('/admin/coupons', couponData);
      return response.data;
    }
  },

  updateCoupon: async (id: string, couponData: Partial<Coupon>): Promise<Coupon> => {
    if (USE_MOCK) {
      await simulateLatency(400);
      const idx = activeCoupons.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Coupon not found');
      activeCoupons[idx] = { ...activeCoupons[idx], ...couponData };
      return activeCoupons[idx];
    } else {
      const response = await apiClient.put(`/admin/coupons/${id}`, couponData);
      return response.data;
    }
  },

  deleteCoupon: async (id: string): Promise<boolean> => {
    if (USE_MOCK) {
      await simulateLatency(300);
      activeCoupons = activeCoupons.filter(c => c.id !== id);
      return true;
    } else {
      await apiClient.delete(`/admin/coupons/${id}`);
      return true;
    }
  },

  // --- Banner Management ---
  getBanners: async (): Promise<Banner[]> => {
    if (USE_MOCK) {
      await simulateLatency(300);
      return activeBanners;
    } else {
      const response = await apiClient.get('/admin/banners');
      return response.data;
    }
  },

  createBanner: async (bannerData: Omit<Banner, 'id'>): Promise<Banner> => {
    if (USE_MOCK) {
      await simulateLatency(500);
      const newBanner: Banner = {
        ...bannerData,
        id: `ban-${activeBanners.length + 1}`
      };
      activeBanners.push(newBanner);
      return newBanner;
    } else {
      const response = await apiClient.post('/admin/banners', bannerData);
      return response.data;
    }
  },

  updateBanner: async (id: string, bannerData: Partial<Banner>): Promise<Banner> => {
    if (USE_MOCK) {
      await simulateLatency(400);
      const idx = activeBanners.findIndex(b => b.id === id);
      if (idx === -1) throw new Error('Banner not found');
      activeBanners[idx] = { ...activeBanners[idx], ...bannerData };
      return activeBanners[idx];
    } else {
      const response = await apiClient.put(`/admin/banners/${id}`, bannerData);
      return response.data;
    }
  },

  deleteBanner: async (id: string): Promise<boolean> => {
    if (USE_MOCK) {
      await simulateLatency(300);
      activeBanners = activeBanners.filter(b => b.id !== id);
      return true;
    } else {
      await apiClient.delete(`/admin/banners/${id}`);
      return true;
    }
  },

  // --- Settings ---
  getSettings: async (): Promise<typeof storeSettings> => {
    if (USE_MOCK) {
      await simulateLatency(200);
      return storeSettings;
    } else {
      const response = await apiClient.get('/admin/settings');
      return response.data;
    }
  },

  updateSettings: async (settingsData: Partial<typeof storeSettings>): Promise<typeof storeSettings> => {
    if (USE_MOCK) {
      await simulateLatency(600);
      storeSettings = { ...storeSettings, ...settingsData };
      return storeSettings;
    } else {
      const response = await apiClient.put('/admin/settings', settingsData);
      return response.data;
    }
  }
};
