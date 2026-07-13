export interface ProductSpec {
  key: string;
  value: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'spam';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number; // percentage
  rating: number;
  reviewCount: number;
  category: string; // Category slug
  brand: string;
  image: string;
  images: string[];
  stock: number;
  sku: string;
  specs: ProductSpec[];
  popular: boolean;
  bestSeller: boolean;
  flashDeal?: {
    discountPrice: number;
    endDate: string; // ISO string
  };
  newArrival: boolean;
  featured: boolean;
  tags: string[];
  variants?: {
    sizes?: string[];
    colors?: { name: string; hex: string }[];
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string; // For nested categories
  status: 'active' | 'inactive';
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  trackingNumber?: string;
  invoiceUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  totalOrders: number;
  totalSpent: number;
  addresses: Address[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage value or dollar amount
  minPurchase: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'expired' | 'disabled';
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  type: 'hero' | 'promo_grid' | 'promotional';
  status: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
}

export type UserRole = 'admin' | 'manager' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  createdAt: string;
  avatar?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
