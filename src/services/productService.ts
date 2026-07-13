import { Product, Category, Review, Coupon, Banner } from '../types';
import { mockProducts, mockCategories, mockReviews, mockBanners, mockCoupons } from './mockData';
import { apiClient, USE_MOCK, simulateLatency } from './api';

// Cache data in-memory to persist updates during admin CRUD operations
let activeProducts = [...mockProducts];
let activeCategories = [...mockCategories];
let activeReviews = [...mockReviews];
let activeBanners = [...mockBanners];
let activeCoupons = [...mockCoupons];

export const productService = {
  // --- Public Shop Endpoints ---
  
  getProducts: async (params?: {
    category?: string;
    brand?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; pages: number }> => {
    if (USE_MOCK) {
      await simulateLatency(400);
      
      let filtered = [...activeProducts];
      
      // Apply filters
      if (params?.category) {
        const categoriesList = params.category.split(',').map(c => c.trim().toLowerCase());
        filtered = filtered.filter(
          (p) => categoriesList.includes(p.category.toLowerCase())
        );
      }
      
      if (params?.brand) {
        const brandsList = params.brand.split(',').map(b => b.trim().toLowerCase());
        filtered = filtered.filter(
          (p) => brandsList.includes(p.brand.toLowerCase())
        );
      }
      
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query) ||
            p.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      
      if (params?.minPrice !== undefined) {
        filtered = filtered.filter((p) => p.price >= params.minPrice!);
      }
      
      if (params?.maxPrice !== undefined) {
        filtered = filtered.filter((p) => p.price <= params.maxPrice!);
      }
      
      if (params?.rating !== undefined) {
        filtered = filtered.filter((p) => p.rating >= params.rating!);
      }
      
      // Apply sorting
      if (params?.sort) {
        switch (params.sort) {
          case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'rating-desc':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
          case 'discount-desc':
            filtered.sort((a, b) => b.discount - a.discount);
            break;
          case 'newest':
            filtered.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
            break;
          default: // 'featured' or default
            filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            break;
        }
      }
      
      const total = filtered.length;
      const page = params?.page || 1;
      const limit = params?.limit || 12;
      const pages = Math.ceil(total / limit);
      
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);
      
      return {
        products: paginated,
        total,
        pages
      };
    } else {
      const response = await apiClient.get('/products', { params });
      return response.data;
    }
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    if (USE_MOCK) {
      await simulateLatency(300);
      const product = activeProducts.find((p) => p.slug === slug);
      if (!product) throw new Error('Product not found');
      return product;
    } else {
      const response = await apiClient.get(`/products/slug/${slug}`);
      return response.data;
    }
  },

  getProductById: async (id: string): Promise<Product> => {
    if (USE_MOCK) {
      await simulateLatency(200);
      const product = activeProducts.find((p) => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    } else {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    }
  },

  getReviewsByProductId: async (productId: string): Promise<Review[]> => {
    if (USE_MOCK) {
      await simulateLatency(200);
      return activeReviews.filter((r) => r.productId === productId && r.status === 'approved');
    } else {
      const response = await apiClient.get(`/products/${productId}/reviews`);
      return response.data;
    }
  },

  addReview: async (productId: string, rating: number, comment: string, userName: string): Promise<Review> => {
    if (USE_MOCK) {
      await simulateLatency(500);
      const newReview: Review = {
        id: `rev-${activeReviews.length + 1}`,
        productId,
        userName,
        rating,
        comment,
        date: new Date().toISOString().split('T')[0],
        status: 'approved'
      };
      
      activeReviews.push(newReview);
      
      // Update product rating average and count
      const productIndex = activeProducts.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        const prod = activeProducts[productIndex];
        const prodReviews = activeReviews.filter(r => r.productId === productId);
        const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
        activeProducts[productIndex] = {
          ...prod,
          rating: Number(avg.toFixed(1)),
          reviewCount: prodReviews.length
        };
      }
      
      return newReview;
    } else {
      const response = await apiClient.post(`/products/${productId}/reviews`, { rating, comment, userName });
      return response.data;
    }
  },

  getCategories: async (): Promise<Category[]> => {
    if (USE_MOCK) {
      await simulateLatency(200);
      return activeCategories.filter(c => c.status === 'active');
    } else {
      const response = await apiClient.get('/categories');
      return response.data;
    }
  },

  getBanners: async (): Promise<Banner[]> => {
    if (USE_MOCK) {
      await simulateLatency(200);
      return activeBanners.filter(b => b.status === 'active');
    } else {
      const response = await apiClient.get('/banners');
      return response.data;
    }
  },

  validateCoupon: async (code: string, cartTotal: number): Promise<Coupon> => {
    if (USE_MOCK) {
      await simulateLatency(600);
      const coupon = activeCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
      
      if (!coupon) {
        throw new Error('Invalid coupon code.');
      }
      
      if (coupon.status !== 'active') {
        throw new Error('This coupon is no longer active.');
      }
      
      const isExpired = new Date(coupon.expiryDate) < new Date();
      if (isExpired) {
        throw new Error('This coupon code has expired.');
      }
      
      if (cartTotal < coupon.minPurchase) {
        throw new Error(`Minimum purchase of $${coupon.minPurchase} required for this coupon.`);
      }
      
      if (coupon.usageCount >= coupon.usageLimit) {
        throw new Error('This coupon has reached its maximum usage limit.');
      }
      
      return coupon;
    } else {
      const response = await apiClient.post('/coupons/validate', { code, cartTotal });
      return response.data;
    }
  },

  // --- Administrative CRUD Operations ---
  
  createProduct: async (productData: Omit<Product, 'id' | 'slug' | 'rating' | 'reviewCount'>): Promise<Product> => {
    if (USE_MOCK) {
      await simulateLatency(600);
      
      const newProduct: Product = {
        ...productData,
        id: `prod-${activeProducts.length + 1}`,
        slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        rating: 0,
        reviewCount: 0
      };
      
      activeProducts.push(newProduct);
      return newProduct;
    } else {
      const response = await apiClient.post('/admin/products', productData);
      return response.data;
    }
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    if (USE_MOCK) {
      await simulateLatency(600);
      const idx = activeProducts.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Product not found');
      
      activeProducts[idx] = {
        ...activeProducts[idx],
        ...productData
      };
      
      return activeProducts[idx];
    } else {
      const response = await apiClient.put(`/admin/products/${id}`, productData);
      return response.data;
    }
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    if (USE_MOCK) {
      await simulateLatency(500);
      activeProducts = activeProducts.filter((p) => p.id !== id);
      return true;
    } else {
      await apiClient.delete(`/admin/products/${id}`);
      return true;
    }
  },

  createCategory: async (catData: Omit<Category, 'id'>): Promise<Category> => {
    if (USE_MOCK) {
      await simulateLatency(500);
      const newCat: Category = {
        ...catData,
        id: `cat-${activeCategories.length + 1}`
      };
      activeCategories.push(newCat);
      return newCat;
    } else {
      const response = await apiClient.post('/admin/categories', catData);
      return response.data;
    }
  },

  updateCategory: async (id: string, catData: Partial<Category>): Promise<Category> => {
    if (USE_MOCK) {
      await simulateLatency(500);
      const idx = activeCategories.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Category not found');
      activeCategories[idx] = { ...activeCategories[idx], ...catData };
      return activeCategories[idx];
    } else {
      const response = await apiClient.put(`/admin/categories/${id}`, catData);
      return response.data;
    }
  },

  deleteCategory: async (id: string): Promise<boolean> => {
    if (USE_MOCK) {
      await simulateLatency(400);
      activeCategories = activeCategories.filter(c => c.id !== id);
      return true;
    } else {
      await apiClient.delete(`/admin/categories/${id}`);
      return true;
    }
  },

  // Expose getters to other services if needed
  _getActiveProducts: () => activeProducts,
  _getActiveCategories: () => activeCategories,
  _getActiveReviews: () => activeReviews,
  _getActiveCoupons: () => activeCoupons,
  _getActiveBanners: () => activeBanners
};
