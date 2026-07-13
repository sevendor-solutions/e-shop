import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Loading indicator component for page splits
const PageLoader = () => (
  <div className="min-h-[60svh] w-full flex flex-col items-center justify-center gap-3">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading experience...</p>
  </div>
);

// Layout wrappers
const PublicLayout = lazy(() => import('../layouts/PublicLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));

// Customer Views
const Home = lazy(() => import('../pages/Home'));
const Products = lazy(() => import('../pages/Products'));
const Categories = lazy(() => import('../pages/Categories'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const MyAccount = lazy(() => import('../pages/MyAccount'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));

// Auth Views
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));

// Admin Views
const AdminDashboard = lazy(() => import('../admin/Dashboard'));
const AdminLogin = lazy(() => import('../admin/Login'));
const AdminProducts = lazy(() => import('../admin/Products'));
const AdminCategories = lazy(() => import('../admin/Categories'));
const AdminOrders = lazy(() => import('../admin/Orders'));
const AdminCustomers = lazy(() => import('../admin/Customers'));
const AdminUsers = lazy(() => import('../admin/Users'));
const AdminCoupons = lazy(() => import('../admin/Coupons'));
const AdminReviews = lazy(() => import('../admin/Reviews'));
const AdminBanners = lazy(() => import('../admin/Banners'));
const AdminReports = lazy(() => import('../admin/Reports'));
const AdminSettings = lazy(() => import('../admin/Settings'));

// 404 View
const NotFound = lazy(() => import('../pages/NotFound'));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Public Website Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="categories" element={<Categories />} />
          <Route path="cart" element={<Cart />} />
          
          {/* Protected Customer Routes */}
          <Route
            path="checkout"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'manager']}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="wishlist"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'manager']}>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="account"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'manager']}>
                <MyAccount />
              </ProtectedRoute>
            }
          />
          
          {/* Public Content Routes */}
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          
          {/* Customer Auth Routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected Administrative Dashboard Layout */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};
