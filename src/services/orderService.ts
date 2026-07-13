import { Order, OrderItem, Address } from '../types';
import { mockOrders } from './mockData';
import { apiClient, USE_MOCK, simulateLatency } from './api';

let activeOrders = [...mockOrders];

export const orderService = {
  createOrder: async (orderData: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    items: Omit<OrderItem, 'id'>[];
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery';
  }): Promise<Order> => {
    if (USE_MOCK) {
      await simulateLatency(1200);
      
      const newOrderItems: OrderItem[] = orderData.items.map((item, idx) => ({
        ...item,
        id: `oi-${Date.now()}-${idx}`
      }));

      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newOrder: Order = {
        ...orderData,
        id: `ord-${activeOrders.length + 1}`,
        orderNumber: `ESHOP-2026-${randomNum}`,
        date: new Date().toISOString().split('T')[0],
        items: newOrderItems,
        status: 'pending',
        paymentStatus: orderData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
        invoiceUrl: '#'
      };

      activeOrders.unshift(newOrder); // Add to the top of list
      return newOrder;
    } else {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    }
  },

  getOrdersByCustomerId: async (customerId: string): Promise<Order[]> => {
    if (USE_MOCK) {
      await simulateLatency(400);
      return activeOrders.filter((o) => o.customerId === customerId);
    } else {
      const response = await apiClient.get(`/orders/customer/${customerId}`);
      return response.data;
    }
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    if (USE_MOCK) {
      await simulateLatency(300);
      const order = activeOrders.find((o) => o.id === orderId);
      if (!order) throw new Error('Order not found');
      return order;
    } else {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    }
  },

  // Admin Endpoints
  getAllOrders: async (params?: { status?: string }): Promise<Order[]> => {
    if (USE_MOCK) {
      await simulateLatency(400);
      let orders = [...activeOrders];
      if (params?.status) {
        orders = orders.filter((o) => o.status === params.status);
      }
      return orders;
    } else {
      const response = await apiClient.get('/admin/orders', { params });
      return response.data;
    }
  },

  updateOrderStatus: async (
    orderId: string,
    status: Order['status'],
    paymentStatus?: Order['paymentStatus']
  ): Promise<Order> => {
    if (USE_MOCK) {
      await simulateLatency(500);
      const idx = activeOrders.findIndex((o) => o.id === orderId);
      if (idx === -1) throw new Error('Order not found');
      
      activeOrders[idx] = {
        ...activeOrders[idx],
        status,
        ...(paymentStatus ? { paymentStatus } : {})
      };
      
      return activeOrders[idx];
    } else {
      const response = await apiClient.put(`/admin/orders/${orderId}/status`, { status, paymentStatus });
      return response.data;
    }
  },

  _getActiveOrders: () => activeOrders
};
