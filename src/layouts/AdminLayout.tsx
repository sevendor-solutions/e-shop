import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  ShoppingCart,
  Users,
  ShieldCheck,
  Ticket,
  Star,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Globe,
  Search
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useCartStore } from '../store/cartStore';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    navigate('/admin/login?logout=true', { replace: true });
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Global search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchProducts, setSearchProducts] = useState<any[]>([]);
  const [searchOrders, setSearchOrders] = useState<any[]>([]);
  const [searchCustomers, setSearchCustomers] = useState<any[]>([]);
  const [searchCategories, setSearchCategories] = useState<any[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch search indexes on mount
  useEffect(() => {
    productService.getProducts({ limit: 100 }).then((res) => setSearchProducts(res.products));
    orderService.getAllOrders().then((res) => setSearchOrders(res));
    adminService.getCustomers().then((res) => setSearchCustomers(res));
    productService.getCategories().then((res) => setSearchCategories(res));
  }, []);

  // Keyboard shortcut Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside search handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSearchResults = () => {
    if (!searchQuery.trim()) return { pages: [], products: [], orders: [], customers: [], categories: [] };
    const query = searchQuery.toLowerCase();

    // 1. Pages matching
    const pagesList = [
      { name: 'Dashboard', path: '/admin/dashboard' },
      { name: 'Products Inventory', path: '/admin/products' },
      { name: 'Categories', path: '/admin/categories' },
      { name: 'Orders Management', path: '/admin/orders' },
      { name: 'Customers Database', path: '/admin/customers' },
      { name: 'Users & Roles', path: '/admin/users' },
      { name: 'Coupons Settings', path: '/admin/coupons' },
      { name: 'Reviews Moderation', path: '/admin/reviews' },
      { name: 'Banners Config', path: '/admin/banners' },
      { name: 'Reports & Analytics', path: '/admin/reports' },
      { name: 'Store Settings', path: '/admin/settings' },
    ];
    const matchedPages = pagesList.filter(p => p.name.toLowerCase().includes(query));

    // 2. Products matching (by name, SKU, brand)
    const matchedProducts = searchProducts.filter(
      p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    ).slice(0, 5);

    // 3. Orders matching (by orderNumber, customerName, customerEmail)
    const matchedOrders = searchOrders.filter(
      o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerEmail.toLowerCase().includes(query)
    ).slice(0, 5);

    // 4. Customers matching (by name, email)
    const matchedCustomers = searchCustomers.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    ).slice(0, 5);

    // 5. Categories matching (by name)
    const matchedCategories = searchCategories.filter(
      cat => cat.name.toLowerCase().includes(query)
    ).slice(0, 5);

    return {
      pages: matchedPages,
      products: matchedProducts,
      orders: matchedOrders,
      customers: matchedCustomers,
      categories: matchedCategories
    };
  };

  const searchResults = getSearchResults();
  const hasResults = Object.values(searchResults).some(arr => arr.length > 0);

  const handleSearchResultClick = (type: string, item: any) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    
    if (type === 'pages') {
      navigate(item.path);
    } else if (type === 'products') {
      navigate(`/admin/products?search=${encodeURIComponent(item.sku || item.name)}`);
    } else if (type === 'orders') {
      navigate(`/admin/orders?search=${encodeURIComponent(item.orderNumber)}`);
    } else if (type === 'customers') {
      navigate(`/admin/customers?search=${encodeURIComponent(item.name)}`);
    } else if (type === 'categories') {
      navigate(`/admin/categories?search=${encodeURIComponent(item.name)}`);
    }
  };

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Fetch low stock alerts as notifications
  useEffect(() => {
    adminService.getDashboardStats().then((stats) => {
      const alerts = [];
      if (stats.kpis.lowStockCount > 0) {
        alerts.push({
          id: 'notif-1',
          type: 'warning',
          message: `${stats.kpis.lowStockCount} products are running low on stock!`,
          time: 'Just now'
        });
      }
      alerts.push({
        id: 'notif-2',
        type: 'info',
        message: `New order pending verification: ${stats.recentOrders[0]?.orderNumber || 'ESHOP-9843'}`,
        time: '5 mins ago'
      });
      setNotifications(alerts);
    });
  }, []);

  // Close dropdowns on route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Store Management',
      items: [
        { name: 'Products', path: '/admin/products', icon: ShoppingBag },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Customers', path: '/admin/customers', icon: Users },
      ]
    },
    {
      title: 'Promotions & Content',
      items: [
        { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
        { name: 'Reviews', path: '/admin/reviews', icon: Star },
        { name: 'Banners', path: '/admin/banners', icon: ImageIcon },
      ]
    },
    {
      title: 'Administration',
      items: [
        { name: 'Users / Roles', path: '/admin/users', icon: ShieldCheck },
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  // Helper to check active nav state
  const isActive = (path: string) => location.pathname === path;

  // Breadcrumbs calculation
  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const url = `/${parts.slice(0, index + 1).join('/')}`;
      const name = part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');
      return { name, url, isLast: index === parts.length - 1 };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="h-screen w-screen flex bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#1c1c1e] text-slate-300 transition-all duration-300 overflow-hidden ${
          isSidebarOpen ? 'w-56 border-r border-[#2c2c2e]' : 'w-0 border-r-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#2c2c2e] flex-shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-2 cursor-pointer hover:opacity-90">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-extrabold text-sm shadow shadow-primary/25">
              E
            </span>
            <span className="font-extrabold text-md tracking-wider text-white font-heading">
              ESHOP
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-md text-slate-550 hover:bg-[#2c2c2e] hover:text-white transition-colors"
            title="Hide Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Navigation Items (Grouped) */}
        <nav className="flex-1 px-3.5 py-5 space-y-6 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <h4 className="px-3.5 text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 leading-none">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`group flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/20'
                          : 'text-slate-400 hover:bg-[#2c2c2e] hover:text-white'
                      }`}
                      title={item.name}
                    >
                      <Icon size={16} className={active ? 'text-white' : 'text-slate-550 group-hover:text-slate-200 transition-colors'} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>


      </aside>

      {/* Mobile Navigation Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          {/* Panel */}
          <div className="relative w-56 bg-[#1c1c1e] h-full flex flex-col p-6 shadow-2xl z-10 text-slate-300 border-r border-[#2c2c2e]">
            <div className="flex items-center justify-between mb-6">
              <Link to="/admin/dashboard" className="flex items-center gap-2 cursor-pointer hover:opacity-90">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-extrabold text-xs shadow shadow-primary/25">
                  E
                </span>
                <span className="font-extrabold text-lg text-white font-heading">ESHOP</span>
              </Link>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-full hover:bg-[#2c2c2e] text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-6 overflow-y-auto">
              {menuGroups.map((group) => (
                <div key={group.title} className="space-y-1.5">
                  <h4 className="px-3.5 text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 leading-none">
                    {group.title}
                  </h4>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            active
                              ? 'bg-gradient-to-r from-primary to-blue-600 text-white'
                              : 'text-slate-400 hover:bg-[#2c2c2e] hover:text-white'
                          }`}
                        >
                          <Icon size={16} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            
            <div className="border-t border-[#2c2c2e] pt-4 flex flex-col gap-2 mt-4">
              <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white">
                <Globe size={14} /> Go to Storefront
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top TopBar */}
        <header className="h-16 bg-[#1c1c1e] border-b border-[#2c2c2e] px-6 flex items-center justify-between shadow-sm sticky top-0 z-20 text-slate-300">
          
          {/* Sidebar Toggle & Global Search */}
          <div className="flex items-center gap-3.5 flex-1 max-w-lg">
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileSidebarOpen(true);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
              className="p-1.5 text-slate-450 hover:bg-[#2c2c2e] hover:text-white rounded-md transition-colors flex-shrink-0"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-full max-w-xs md:max-w-md" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Global search (Ctrl + K)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-slate-100/90 focus:bg-white text-slate-900 placeholder-slate-500 text-xs py-2 pl-9 pr-4 rounded-xl border border-transparent focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-200"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown Overlay */}
              {isSearchFocused && searchQuery.trim() && (
                <div className="absolute left-0 top-full mt-2 w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[350px] overflow-y-auto text-slate-800">
                  {!hasResults ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-500">
                      No results found for "<span className="text-slate-900 font-bold">{searchQuery}</span>"
                    </div>
                  ) : (
                    <div className="py-2 text-xs">
                      {/* Pages Section */}
                      {searchResults.pages.length > 0 && (
                        <div>
                          <div className="px-3.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-50">
                            Navigation Pages
                          </div>
                          {searchResults.pages.map(page => (
                            <button
                              key={page.path}
                              onClick={() => handleSearchResultClick('pages', page)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium flex items-center justify-between"
                            >
                              <span>{page.name}</span>
                              <span className="text-[9px] text-slate-400">Navigate</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Products Section */}
                      {searchResults.products.length > 0 && (
                        <div>
                          <div className="px-3.5 py-1 mt-2 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-50">
                            Products
                          </div>
                          {searchResults.products.map(prod => (
                            <button
                              key={prod.id}
                              onClick={() => handleSearchResultClick('products', prod)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-55 text-slate-700 hover:text-slate-900 font-medium flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {prod.image && <img src={prod.image} className="w-6 h-6 object-cover rounded" alt="" />}
                                <div className="flex flex-col text-left">
                                  <span className="font-bold">{prod.name}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">{prod.sku}</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-700 font-bold font-mono">${prod.price.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Orders Section */}
                      {searchResults.orders.length > 0 && (
                        <div>
                          <div className="px-3.5 py-1 mt-2 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-50">
                            Orders
                          </div>
                          {searchResults.orders.map(order => (
                            <button
                              key={order.id}
                              onClick={() => handleSearchResultClick('orders', order)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-55 text-slate-700 hover:text-slate-900 font-medium flex items-center justify-between"
                            >
                              <div className="flex flex-col text-left">
                                <span className="font-bold">{order.orderNumber}</span>
                                <span className="text-[9px] text-slate-400">{order.customerName}</span>
                              </div>
                              <span className="text-[10px] text-slate-700 font-bold font-mono">${order.total.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Customers Section */}
                      {searchResults.customers.length > 0 && (
                        <div>
                          <div className="px-3.5 py-1 mt-2 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-50">
                            Customers
                          </div>
                          {searchResults.customers.map(cust => (
                            <button
                              key={cust.id}
                              onClick={() => handleSearchResultClick('customers', cust)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-55 text-slate-700 hover:text-slate-900 font-medium flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {cust.avatar && <img src={cust.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />}
                                <div className="flex flex-col text-left">
                                  <span className="font-bold">{cust.name}</span>
                                  <span className="text-[9px] text-slate-400">{cust.email}</span>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold text-slate-650 uppercase tracking-wider">{cust.status}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Categories Section */}
                      {searchResults.categories.length > 0 && (
                        <div>
                          <div className="px-3.5 py-1 mt-2 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-50">
                            Categories
                          </div>
                           {searchResults.categories.map(cat => (
                             <button
                               key={cat.id}
                               onClick={() => handleSearchResultClick('categories', cat)}
                               className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium flex items-center justify-between"
                             >
                               <span>{cat.name}</span>
                               <span className="text-[9px] text-slate-400">Category</span>
                             </button>
                           ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Top Actions: Theme, Alerts, Profile info */}
          <div className="flex items-center gap-4 flex-shrink-0">
            
            {/* Go to Storefront */}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-slate-400 hover:bg-[#2c2c2e] hover:text-white rounded-xl transition-all"
              title="Go to Storefront"
            >
              <Globe size={16} />
              <span className="hidden sm:inline">Storefront</span>
            </Link>



            {/* Notifications Alert Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-slate-400 hover:bg-[#2c2c2e] hover:text-white rounded-full relative transition-colors"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#1c1c1e] rounded-full"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#2c2c2e] flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-100">Notifications</span>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[10px] text-primary hover:underline font-semibold"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="px-4 py-3 border-b border-[#2c2c2e] hover:bg-[#2c2c2e]/45 flex gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notif.type === 'warning' ? 'bg-amber-500' : 'bg-primary'
                          }`} />
                          <div className="flex-1 text-left">
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-[#2c2c2e] rounded-xl transition-all"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border border-[#2c2c2e] object-cover"
                />
                <div className="hidden lg:flex flex-col items-start leading-none text-left">
                  <span className="text-xs font-bold text-slate-200">{user?.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5 tracking-wider">
                    {user?.role}
                  </span>
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl shadow-xl py-2 z-50">
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#2c2c2e] transition-colors"
                  >
                    <Settings size={14} /> Store Settings
                  </Link>
                  <div className="border-t border-[#2c2c2e] my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-955/20 w-full text-left"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Sub-view Outlet Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
