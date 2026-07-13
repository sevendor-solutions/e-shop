import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  LogOut,
  Settings,
  LayoutDashboard,
  Trash2,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { productService } from '../services/productService';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { Category } from '../types';

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { items: cartItems, getTotals, updateQuantity, removeItem, clearCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSticky, setIsSticky] = useState(false);

  // Authentication pop-up window/dropdown state in the corner
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const totals = getTotals();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Fetch categories for menu
  useEffect(() => {
    productService.getCategories().then((cats) => {
      setCategories(cats.filter((c) => !c.parentId)); // Parent categories only
    });
  }, []);

  // Sticky header check
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
    setIsAccountMenuOpen(false);
    setIsAuthOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
        setIsAuthOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please fill in all fields');
      return;
    }
    try {
      setAuthLoading(true);
      setAuthError(null);
      const result = await authService.login(email, password);
      
      if (result.user.role === 'admin' || result.user.role === 'manager') {
        throw new Error('Access denied. Administrators must login via the Admin Portal.');
      }
      
      login(result.user, result.token, rememberMe);
      toast.success(`Welcome back, ${result.user.name}!`);
      setIsAuthOpen(false);
      // Clear form
      setEmail('');
      setPassword('');
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed.');
      toast.error(err.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setAuthError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    try {
      setAuthLoading(true);
      setAuthError(null);
      const result = await authService.register(name, email);
      login(result.user, result.token, true);
      toast.success('Account created successfully! Welcome to E-Shop.');
      setIsAuthOpen(false);
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
      toast.error(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const queryParams = new URLSearchParams(location.search);
  const activeCategory = queryParams.get('category') || '';
  const isAllProductsActive = location.pathname === '/products' && !activeCategory;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Announcement Bar */}
      <div className="bg-[#aa0000] text-white text-xs font-semibold py-2 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-4 mx-auto md:mx-0">
          <span className="flex items-center gap-1">
            <span className="bg-accent text-white px-2 py-0.5 rounded-full text-[10px] animate-pulse">OFFER</span>
            Free Shipping on Orders over $150!
          </span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">
            Use coupon <strong className="text-accent underline">WELCOME10</strong> for 10% off!
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/contact" className="hover:underline">Contact Us</Link>
          <button
            onClick={toggleTheme}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      {/* Main Header / Sticky Header */}
      <header
        className={`bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-all duration-300 z-30 ${
          isSticky ? 'fixed top-0 left-0 right-0 shadow-md translate-y-0' : 'relative'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white shadow-md shadow-primary/20">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </span>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                ESHOP<span className="text-accent">.</span>
              </span>
            </Link>

            {/* Header Center Navigation Links */}
            <div className="hidden lg:flex items-center justify-center gap-6 flex-1 text-[13px] font-bold text-slate-600 dark:text-slate-300">
              <Link to="/" className="hover:text-primary transition-colors relative group py-2">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link to="/products" className="hover:text-primary transition-colors relative group py-2">
                Catalog
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link to="/products?sort=discount-desc" className="hover:text-red-500 transition-colors text-red-500 dark:text-red-400 relative group py-2 flex items-center gap-1">
                Special Offers
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all group-hover:w-full" />
              </Link>
              <Link to="/account" className="hover:text-primary transition-colors relative group py-2">
                Track Order
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors relative group py-2">
                Help Center
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            </div>

            {/* Spacer for non-lg screens */}
            <div className="flex-1 lg:hidden" />

            {/* User Interaction Icons */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Theme Toggle (Mobile) */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full md:hidden transition-colors"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Desktop Search Bar (Rectangular and next to Wishlist) */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex w-64 relative"
              >
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/45 focus:bg-white transition-all dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  <Search size={15} />
                </button>
              </form>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
                title="Wishlist"
              >
                <Heart size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-accent text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
                title="Cart"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Account Dropdown */}
              <div className="relative" ref={accountMenuRef}>
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center gap-1.5 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <ChevronDown size={14} className="text-slate-500 hidden sm:inline" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthOpen(!isAuthOpen);
                      setAuthTab('login');
                      setAuthError(null);
                    }}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  >
                    <User size={22} />
                    <span className="hidden sm:inline">Login / Sign Up</span>
                  </button>
                )}

                {/* Corner Auth Dropdown Pop-up Window */}
                {isAuthOpen && !isAuthenticated && (
                  <div className="absolute right-[-64px] sm:right-[-24px] md:right-[-74px] mt-2.5 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl p-5 z-50">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-150 dark:border-slate-700 mb-4 pb-0.5">
                      <button
                        onClick={() => {
                          setAuthTab('login');
                          setAuthError(null);
                        }}
                        className={`flex-1 text-center pb-2 text-sm font-bold transition-colors border-b-2 ${
                          authTab === 'login'
                            ? 'text-primary border-primary dark:text-blue-450 dark:border-blue-450'
                            : 'text-slate-400 border-transparent hover:text-slate-650'
                        }`}
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setAuthTab('signup');
                          setAuthError(null);
                        }}
                        className={`flex-1 text-center pb-2 text-sm font-bold transition-colors border-b-2 ${
                          authTab === 'signup'
                            ? 'text-primary border-primary dark:text-blue-450 dark:border-blue-450'
                            : 'text-slate-400 border-transparent hover:text-slate-650'
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>

                    {authError && (
                      <div className="p-2.5 mb-3 bg-red-50 border border-red-205 text-red-650 rounded-xl text-xs font-semibold">
                        {authError}
                      </div>
                    )}

                    {authTab === 'login' ? (
                      <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500">Email Address</label>
                          <div className="relative">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="customer@eshop.com"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"
                              required
                            />
                            <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500">Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"
                              required
                            />
                            <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between text-xs mt-0.5">
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 font-semibold">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="rounded border-slate-300 text-primary focus:ring-primary/40 w-4 h-4"
                            />
                            Remember Me
                          </label>
                          <Link
                            to="/forgot-password"
                            onClick={() => setIsAuthOpen(false)}
                            className="font-bold text-primary hover:underline hover:text-primary-hover"
                          >
                            Forgot Password?
                          </Link>
                        </div>

                        <Button type="submit" isLoading={authLoading} className="w-full font-bold py-2">
                          Sign In
                        </Button>

                        {/* Demo login helper */}
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[9px] flex flex-col gap-0.5 text-slate-500 font-semibold">
                          <span className="font-extrabold text-primary uppercase tracking-wider mb-0.5">Demo Accounts</span>
                          <span>Customer: customer@eshop.com / password123</span>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500">Full Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Robert Smith"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"
                              required
                            />
                            <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500">Email Address</label>
                          <div className="relative">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="robert@example.com"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"
                              required
                            />
                            <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500">Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"
                              required
                            />
                            <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-650"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500">Confirm Password</label>
                          <div className="relative">
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"
                              required
                            />
                            <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                          </div>
                        </div>

                        <Button type="submit" isLoading={authLoading} className="w-full font-bold py-2">
                          Create Account
                        </Button>
                      </form>
                    )}
                  </div>
                )}

                {/* Profile Options Dropdown */}
                {isAccountMenuOpen && isAuthenticated && (
                  <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/account"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        <User size={16} />
                        My Account
                      </Link>
                      
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          Admin Dashboard
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-700 p-1 mt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full md:hidden transition-colors"
              >
                <Menu size={22} />
              </button>
            </div>

          </div>
        </div>

        {/* Desktop Mega Menu Bar */}
        <nav
          className="hidden md:block border-t border-slate-100 dark:border-slate-800"
          style={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff' }}
        >
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center gap-8 h-12">
              <Link
                to="/products"
                className={`text-sm font-bold transition-colors ${
                  isAllProductsActive
                    ? 'text-red-600 dark:text-red-500'
                    : 'text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500'
                }`}
              >
                All Products
              </Link>
              
              {/* Category Mega Menu Hooks */}
              {categories.slice(0, 7).map((category) => {
                const isActive = activeCategory.split(',').includes(category.slug);
                return (
                  <div key={category.id} className="relative group h-full flex items-center">
                    <Link
                      to={`/products?category=${category.slug}`}
                      className={`text-sm font-bold transition-colors flex items-center gap-1 h-full border-b-2 border-transparent group-hover:border-red-600 dark:group-hover:border-red-500 group-hover:text-red-600 dark:group-hover:text-red-500 ${
                        isActive
                          ? 'text-red-600 dark:text-red-500 border-red-600 dark:border-red-500'
                          : 'text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500'
                      }`}
                    >
                      {category.name}
                      <ChevronDown size={14} />
                    </Link>

                    {/* Mega Menu Dropdown */}
                    <div className="absolute top-full left-0 hidden group-hover:block w-[420px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-b-xl p-6 z-50">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Shop {category.name}
                          </h4>
                          <div className="flex flex-col gap-2.5">
                            <Link
                              to={`/products?category=${category.slug}`}
                              className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                            >
                              View All Products
                            </Link>
                            <Link
                              to="/categories"
                              className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                            >
                              Explore Categories
                            </Link>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Quick Links
                          </h4>
                          <div className="flex flex-col gap-2.5">
                            <Link
                              to="/products?sort=discount-desc"
                              className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary transition-colors flex items-center gap-1.5"
                            >
                              Flash Deals
                              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                %
                              </span>
                            </Link>
                            <Link
                              to="/products?sort=newest"
                              className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                            >
                              New Arrivals
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Sticky Header spacer */}
      {isSticky && <div className="h-20 md:h-32" />}

      {/* Mobile Sidebar Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          {/* Menu Panel */}
          <div className="relative w-80 max-w-xs bg-white dark:bg-slate-900 h-full flex flex-col p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between mb-8">
              <span className="font-extrabold text-xl tracking-tight text-primary">ESHOP</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-6">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm py-2 pl-3 pr-8 rounded-lg focus:outline-none dark:text-slate-100"
              />
              <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </button>
            </form>

            {/* Links */}
            <div className="flex flex-col gap-4 overflow-y-auto flex-1">
              <Link to="/products" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary">
                All Products
              </Link>
              <Link to="/categories" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary">
                Categories
              </Link>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
              
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Categories</h4>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/products?category=${c.slug}`}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary ml-2"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sliding Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-primary" size={20} />
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                  Shopping Cart ({cartCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Drawer Items List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <ShoppingCart size={28} />
                  </div>
                  <p className="text-slate-500 font-medium">Your cart is empty</p>
                  <Button size="sm" onClick={() => navigate('/products')}>
                    Go Shopping
                  </Button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`}
                    className="flex gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-4"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg bg-slate-50"
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                        {item.selectedColor && item.selectedSize && ' / '}
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2.5">
                        {/* Quantity adjust */}
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                            className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold dark:text-slate-200">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                            className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-full transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Drawer Footer Summary */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex items-center justify-between text-sm text-emerald-500">
                    <span>Discount</span>
                    <span className="font-bold">-${totals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Shipping</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-extrabold text-slate-850 dark:text-slate-100 border-t border-dashed border-slate-100 dark:border-slate-800 pt-2.5">
                  <span>Total</span>
                  <span className="text-primary">${totals.total.toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsCartOpen(false)}>
                    Close
                  </Button>
                  <Button size="sm" onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}>
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Dynamic View Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Info */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
                  E
                </span>
                <span className="text-white font-extrabold text-lg tracking-tight">ESHOP</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Building original, premium, and responsive eCommerce shopping designs inspired by leading modern layout architectures.
              </p>
              <div className="flex flex-col gap-2.5 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  101 Digital Ave, Floor 4, Limassol, Cyprus
                </span>
                <span className="flex items-center gap-2">
                  <Phone size={14} className="text-primary" />
                  +357 25 123456
                </span>
                <span className="flex items-center gap-2">
                  <Mail size={14} className="text-primary" />
                  support@eshop-cy.com
                </span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Shop Categories</h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li>
                  <Link to="/products?category=smartphones" className="hover:text-white transition-colors">
                    Smartphones
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=laptops" className="hover:text-white transition-colors">
                    Laptops & Computers
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=audio-gear" className="hover:text-white transition-colors">
                    Audio & Headphones
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=footwear" className="hover:text-white transition-colors">
                    Footwear & Shoes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Corporate */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact & Support
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="hover:text-white transition-colors">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="hover:text-white transition-colors">
                    My Wishlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Join Our Newsletter</h4>
              <p className="text-xs text-slate-400">
                Receive weekly coupon codes, special offers, and new release alerts!
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email..."
                  required
                  className="bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg flex-1 text-white focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
                >
                  <ArrowRight size={14} />
                </button>
              </form>
              
              {/* Socials */}
              <div className="flex items-center gap-3.5 mt-2 text-slate-450">
                <a href="#" className="p-1.5 bg-slate-850 hover:bg-primary rounded-full hover:text-white transition-colors" title="Facebook">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="p-1.5 bg-slate-850 hover:bg-primary rounded-full hover:text-white transition-colors" title="Instagram">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>

          {/* Copyrights and Card Icons */}
          <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} E-Shop Inc. All Rights Reserved. Inspired by Cy design patterns.</p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-slate-800 rounded font-semibold text-slate-400 tracking-widest text-[9px]">VISA</span>
              <span className="px-2 py-1 bg-slate-800 rounded font-semibold text-slate-400 tracking-widest text-[9px]">MC</span>
              <span className="px-2 py-1 bg-slate-800 rounded font-semibold text-slate-400 tracking-widest text-[9px]">AMEX</span>
              <span className="px-2 py-1 bg-slate-800 rounded font-semibold text-slate-400 tracking-widest text-[9px]">PP</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
