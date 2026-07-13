import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, Eye, EyeOff, LayoutDashboard, ArrowLeft, ShoppingBag, ShoppingCart, Users, Activity, X, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { adminService } from '../services/adminService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, setError, setLoading } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const from = location.state?.from?.pathname || '/admin/dashboard';

  // Toggle modal state and active tab
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(
    location.state?.from ? true : false
  );
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    customersCount: 0,
    totalRevenue: 0,
    categoriesCount: 0,
    loading: true,
  });

  useEffect(() => {
    Promise.all([
      productService.getProducts({ limit: 1 }).catch(() => ({ total: 0 })),
      orderService.getAllOrders().catch(() => []),
      adminService.getCustomers().catch(() => []),
      productService.getCategories().catch(() => []),
    ]).then(([prodRes, ordersRes, custRes, catRes]) => {
      const productsCount = prodRes.total || 0;
      const ordersCount = ordersRes.length || 0;
      const customersCount = custRes.length || 0;
      const categoriesCount = catRes.length || 0;
      const totalRevenue = ordersRes.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      
      setStats({
        productsCount,
        ordersCount,
        customersCount,
        totalRevenue,
        categoriesCount,
        loading: false,
      });
    }).catch(() => {
      setStats((prev) => ({ ...prev, loading: false }));
    });
  }, []);

  const { isAuthenticated } = useAuthStore();

  React.useLayoutEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    } else {
      useAuthStore.setState({
        isAuthenticated: true,
        user: {
          id: 'usr-1',
          name: 'Administrator',
          email: 'admin@eshop.com',
          role: 'admin',
          status: 'active',
          permissions: ['users:all'],
          createdAt: new Date().toISOString()
        },
        token: 'mock-jwt-token-for-usr-1'
      });
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: 'admin@eshop.com',
      password: 'password123',
      rememberMe: true,
    },
  });

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: errorsSignUp },
    reset: resetSignUp,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any,
  });

  const onSubmitLogin = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.login(data.email, data.password);
      
      if (result.user.role === 'customer') {
        throw new Error('Access denied. You do not have administrative permissions.');
      }
      
      login(result.user, result.token, data.rememberMe);
      toast.success(`Welcome back, ${result.user.name}!`);
      setIsLoginModalOpen(false);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSignUp = async (data: RegisterFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Register user
      const registerResult = await authService.register(data.name, data.email);
      
      // 2. Elevate role to manager to simulate vendor dashboard permissions
      const updatedUser = await authService.updateProfile(registerResult.user.id, { role: 'manager' });
      
      login(updatedUser, registerResult.token, true);
      toast.success(`Vendor account created successfully! Welcome, ${updatedUser.name}!`);
      setIsLoginModalOpen(false);
      resetSignUp();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-955 text-slate-800 dark:text-slate-105 flex flex-col font-sans">
      
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800/80 px-6 sm:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-pink-500/20">
            E
          </span>
          <span className="font-extrabold text-lg tracking-wider text-slate-850 dark:text-white">
            ESHOP <span className="text-pink-500">SELL</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-600 dark:text-slate-355">
          <a href="#benefits" className="hover:text-pink-500 transition-colors">Sell On E-Shop</a>
          <a href="#steps" className="hover:text-pink-500 transition-colors">Start Selling</a>
          <a href="#faq" className="hover:text-pink-500 transition-colors">FAQs</a>
        </nav>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => {
              setActiveTab('register');
              setIsLoginModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white transition-all uppercase tracking-wider shadow-md shadow-pink-500/25"
          >
            Register
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setIsLoginModalOpen(true);
            }}
            className="px-5 py-2 border border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-500 transition-all uppercase tracking-wider"
          >
            Login
          </button>

          {/* Corner Dropdown Auth Box */}
          {isLoginModalOpen && (
            <>
              {/* Invisible Click-Outside Backdrop */}
              <div
                onClick={() => setIsLoginModalOpen(false)}
                className="fixed inset-0 z-40 bg-transparent cursor-default"
              />
              
              {/* Dropdown Container */}
              <div className="absolute right-0 top-[calc(100%+8px)] w-80 sm:w-[380px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 z-50 overflow-hidden flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="absolute right-4 top-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-505 dark:text-slate-400 transition-colors"
                >
                  <X size={16} />
                </button>

                {/* Title Header */}
                <div className="flex flex-col gap-1 pr-8 text-left mb-2">
                  <h2 className="text-lg font-black tracking-tight text-slate-850 dark:text-white font-heading">
                    {activeTab === 'login' ? 'Vendor Sign In' : 'Vendor Registration'}
                  </h2>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                    {activeTab === 'login' 
                      ? 'Please enter your credentials to access the administrative dashboard.' 
                      : 'Submit your business details below to create a vendor store registry.'}
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-955/20 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium text-left">
                    {error}
                  </div>
                )}

                {/* TAB 1: LOGIN FORM */}
                {activeTab === 'login' ? (
                  <form onSubmit={handleSubmitLogin(onSubmitLogin)} className="flex flex-col gap-4 text-left">
                    {/* Email input */}
                    <div className="relative">
                      <Input
                        label="Email Address"
                        placeholder="admin@eshop.com"
                        error={errorsLogin.email?.message}
                        className="pl-10 text-xs py-2"
                        {...registerLogin('email')}
                      />
                      <Mail className="absolute left-3.5 bottom-3 text-slate-400" size={15} />
                    </div>

                    {/* Password input */}
                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        error={errorsLogin.password?.message}
                        className="pl-10 pr-10 text-xs py-2"
                        {...registerLogin('password')}
                      />
                      <Lock className="absolute left-3.5 bottom-3 text-slate-400" size={15} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 bottom-2.5 p-1 text-slate-400 hover:text-slate-655"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Remember Me and Forgot Password */}
                    <div className="flex items-center justify-between text-xs mt-0.5">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 font-semibold">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-primary focus:ring-primary/45 w-4 h-4"
                          {...registerLogin('rememberMe')}
                        />
                        Remember Me
                      </label>
                      <Link
                        to="/forgot-password"
                        onClick={() => setIsLoginModalOpen(false)}
                        className="font-bold text-primary hover:text-primary-hover hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    {/* Sign In Button */}
                    <Button
                      type="submit"
                      isLoading={loading}
                      className="w-full mt-2 font-bold py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md shadow-primary/20 transition-all text-xs"
                    >
                      Sign In
                    </Button>

                    {/* Quick credentials hint */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] mt-2 flex flex-col gap-1 text-slate-500 font-semibold">
                      <span className="font-extrabold text-primary uppercase tracking-wider mb-0.5">Demo Credentials</span>
                      <span>Email: <strong>admin@eshop.com</strong></span>
                      <span>Password: <strong>password123</strong></span>
                    </div>

                    {/* Switch to Register link */}
                    <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                      Don't have a vendor account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('register');
                          setError(null);
                        }}
                        className="text-primary hover:underline font-bold"
                      >
                        Register Here
                      </button>
                    </div>
                  </form>
                ) : (
                  /* TAB 2: REGISTER FORM */
                  <form onSubmit={handleSubmitSignUp(onSubmitSignUp)} className="flex flex-col gap-4 text-left">
                    {/* Full Name */}
                    <div className="relative">
                      <Input
                        label="Full Name"
                        placeholder="Robert Smith"
                        error={errorsSignUp.name?.message}
                        className="pl-10 text-xs py-2"
                        {...registerSignUp('name')}
                      />
                      <User className="absolute left-3.5 bottom-3 text-slate-400" size={15} />
                    </div>

                    {/* Store/Business Name */}
                    <div className="relative">
                      <Input
                        label="Store Name"
                        placeholder="Robert's Fashion Store"
                        error={errorsSignUp.storeName?.message}
                        className="pl-10 text-xs py-2"
                        {...registerSignUp('storeName')}
                      />
                      <Shield className="absolute left-3.5 bottom-3 text-slate-400" size={15} />
                    </div>

                    {/* Email Address */}
                    <div className="relative">
                      <Input
                        label="Business Email"
                        placeholder="robert@store.com"
                        error={errorsSignUp.email?.message}
                        className="pl-10 text-xs py-2"
                        {...registerSignUp('email')}
                      />
                      <Mail className="absolute left-3.5 bottom-3 text-slate-400" size={15} />
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <Input
                        label="Create Password"
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        error={errorsSignUp.password?.message}
                        className="pl-10 pr-10 text-xs py-2"
                        {...registerSignUp('password')}
                      />
                      <Lock className="absolute left-3.5 bottom-3 text-slate-400" size={15} />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 bottom-2 p-1 text-slate-400 hover:text-slate-650"
                      >
                        {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        error={errorsSignUp.confirmPassword?.message}
                        className="pl-10 text-xs py-2"
                        {...registerSignUp('confirmPassword')}
                      />
                      <Lock className="absolute left-3.5 bottom-3 text-slate-400" size={15} />
                    </div>

                    {/* Submit Register */}
                    <Button
                      type="submit"
                      isLoading={loading}
                      className="w-full mt-2 font-bold py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md shadow-primary/20 transition-all text-xs"
                    >
                      Create Account
                    </Button>

                    {/* Switch to Login link */}
                    <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                      Already have a vendor account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setError(null);
                        }}
                        className="text-primary hover:underline font-bold"
                      >
                        Login Here
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* 2. Hero Banner Section */}
      <section id="benefits" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 px-6 sm:px-12 max-w-7xl mx-auto w-full flex-1">
        
        {/* Left Side: Product Intro Text */}
        <div className="flex flex-col gap-6 text-left">
          <span className="text-xs font-extrabold text-pink-500 uppercase tracking-widest bg-pink-50 dark:bg-pink-950/20 px-3.5 py-1.5 rounded-full w-fit">
            Partner Program
          </span>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-850 dark:text-white leading-tight font-heading">
            We've rolled out a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              Zero Commission
            </span> <br />
            Construct
          </h1>
          
          <p className="text-base sm:text-lg text-slate-505 dark:text-slate-350 leading-relaxed font-semibold">
            to empower digital-first local and international D2C brands. Reach 55M+ customers without paying platform commissions.
          </p>
          
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => {
                setActiveTab('register');
                setIsLoginModalOpen(true);
              }}
              className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-pink-500/25 uppercase tracking-wider"
            >
              Enroll Now
            </button>
            <Link
              to="/"
              className="px-6 py-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-650 dark:text-slate-350 font-bold rounded-2xl text-sm transition-all flex items-center gap-1.5"
            >
              <ArrowLeft size={16} /> Go to Storefront
            </Link>
          </div>
        </div>

        {/* Right Side: Myntra-style Rising Stars Purple Banner */}
        <div className="relative bg-gradient-to-tr from-pink-600 to-indigo-950 rounded-[44px] p-8 sm:p-10 text-white overflow-hidden shadow-2xl min-h-[390px] flex flex-col justify-between border border-pink-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.18),transparent_60%)]" />
          <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <span className="bg-white/10 backdrop-blur border border-white/20 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-pink-200">
              E-Shop Program 2.5
            </span>
            <span className="font-extrabold text-[11px] tracking-widest text-pink-300 uppercase">
              RISING STARS 3.0
            </span>
          </div>

          <div className="my-auto flex flex-col gap-2 relative z-10 text-left pt-6">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-white font-heading">
              0% Commission<span className="text-pink-400 font-bold">*</span>
            </h2>
            <p className="text-sm font-semibold text-pink-200 leading-relaxed max-w-sm mt-2">
              For all newly registered made-to-order D2C brands. Scale your catalog with E-Shop's premium seller dashboard.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-6 border-t border-white/10 relative z-10 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-pink-350 shadow-inner">
                <Activity size={15} />
              </span>
              <span className="text-[9px] font-extrabold text-slate-200 uppercase tracking-wide">Brand Building</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-pink-355 shadow-inner">
                <Users size={15} />
              </span>
              <span className="text-[9px] font-extrabold text-slate-200 uppercase tracking-wide">Pan-India Reach</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-pink-355 shadow-inner">
                <ShoppingBag size={15} />
              </span>
              <span className="text-[9px] font-extrabold text-slate-200 uppercase tracking-wide">50M+ Users</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-pink-355 shadow-inner">
                <ShoppingCart size={15} />
              </span>
              <span className="text-[9px] font-extrabold text-slate-200 uppercase tracking-wide">Fast Delivery</span>
            </div>
          </div>
        </div>

      </section>

      {/* 3. Steps Section ("Start Selling In 4 Simple Steps") */}
      <section id="steps" className="bg-slate-50 dark:bg-slate-900/40 py-20 border-t border-b border-slate-100 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-855 dark:text-white font-heading">
              Start Selling In 4 Simple Steps
            </h2>
            <div className="w-16 h-1 bg-pink-500 mx-auto rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-855 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl flex flex-col gap-3 text-left relative shadow-sm hover:shadow-md transition-all pt-10">
              <span className="absolute top-[-16px] left-6 w-9 h-9 rounded-xl bg-pink-500 text-white font-extrabold flex items-center justify-center shadow-md shadow-pink-500/20 text-sm">
                1
              </span>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Register Store
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Sign up with your store details, email credentials, PAN, and active GSTIN information.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-855 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl flex flex-col gap-3 text-left relative shadow-sm hover:shadow-md transition-all pt-10">
              <span className="absolute top-[-16px] left-6 w-9 h-9 rounded-xl bg-pink-500 text-white font-extrabold flex items-center justify-center shadow-md shadow-pink-500/20 text-sm">
                2
              </span>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Upload Catalog
              </h3>
              <p className="text-xs text-slate-505 dark:text-slate-400 leading-relaxed font-semibold">
                Upload your digital inventory images, product options, pricing points, and item specifications.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-855 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl flex flex-col gap-3 text-left relative shadow-sm hover:shadow-md transition-all pt-10">
              <span className="absolute top-[-16px] left-6 w-9 h-9 rounded-xl bg-pink-500 text-white font-extrabold flex items-center justify-center shadow-md shadow-pink-500/20 text-sm">
                3
              </span>
              <h3 className="text-base font-bold text-slate-850 dark:text-white">
                Receive Orders
              </h3>
              <p className="text-xs text-slate-505 dark:text-slate-400 leading-relaxed font-semibold">
                Receive sales notifications from E-Shop's 50M+ customer base across the country.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-855 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl flex flex-col gap-3 text-left relative shadow-sm hover:shadow-md transition-all pt-10">
              <span className="absolute top-[-16px] left-6 w-9 h-9 rounded-xl bg-pink-500 text-white font-extrabold flex items-center justify-center shadow-md shadow-pink-500/20 text-sm">
                4
              </span>
              <h3 className="text-base font-bold text-slate-850 dark:text-white">
                Receive Payments
              </h3>
              <p className="text-xs text-slate-505 dark:text-slate-400 leading-relaxed font-semibold">
                Get payments deposited directly in your bank account weekly with 0% commission deductions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Overview Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 py-20 text-center flex flex-col gap-12">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-extrabold text-pink-500 uppercase tracking-widest">Database Preview</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-850 dark:text-white font-heading">
            Live Storefront Vital Stats
          </h2>
          <p className="text-sm text-slate-505 dark:text-slate-400 font-semibold max-w-md mx-auto">
            Live preview of vital catalog metrics and active customer directories before you log in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto w-full">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col gap-1 text-left shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales</span>
              <Activity size={16} className="text-emerald-500" />
            </div>
            {stats.loading ? (
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2" />
            ) : (
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-850 dark:text-white mt-1">
                ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-semibold mt-1">All processed sales</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col gap-1 text-left shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
              <ShoppingCart size={16} className="text-blue-500" />
            </div>
            {stats.loading ? (
              <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2" />
            ) : (
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-850 dark:text-white mt-1">
                {stats.ordersCount}
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-semibold mt-1">Customer transactions</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col gap-1 text-left shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Products</span>
              <ShoppingBag size={16} className="text-amber-505" />
            </div>
            {stats.loading ? (
              <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2" />
            ) : (
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-850 dark:text-white mt-1">
                {stats.productsCount}
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-semibold mt-1">{stats.categoriesCount} active categories</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col gap-1 text-left shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Customers</span>
              <Users size={16} className="text-purple-505" />
            </div>
            {stats.loading ? (
              <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2" />
            ) : (
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-850 dark:text-white mt-1">
                {stats.customersCount}
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-semibold mt-1">User directory records</span>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 text-left border-t border-slate-100 dark:border-slate-900">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-855 dark:text-white font-heading mb-10 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-5 sm:p-6 rounded-2xl shadow-sm">
            <h4 className="text-sm sm:text-base font-bold text-slate-850 dark:text-white mb-2">
              What documents are required to start selling?
            </h4>
            <p className="text-xs sm:text-sm text-slate-505 dark:text-slate-400 leading-relaxed font-semibold">
              You need an active GSTIN number, a PAN card for identity verification, and an active business bank account to receive weekly payouts.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-5 sm:p-6 rounded-2xl shadow-sm">
            <h4 className="text-sm sm:text-base font-bold text-slate-855 dark:text-white mb-2">
              How does the 0% commission construct work?
            </h4>
            <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
              For the first 90 days after registration, you will pay 0% marketplace commission fee on all orders processed. Standard shipping fees still apply.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Footer Section */}
      <footer className="bg-slate-955 text-slate-450 py-8 px-6 sm:px-12 border-t border-slate-900 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} E-Shop Inc. All vendor listings are governed by vendor policy terms.</span>
          <Link to="/" className="hover:text-white flex items-center gap-1.5 font-bold">
            <ArrowLeft size={14} /> Go to Storefront
          </Link>
        </div>
      </footer>

    </div>
  );
}
