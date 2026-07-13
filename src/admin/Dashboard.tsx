import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  Star,
  X,
  BarChart3,
  MessageSquare,
  Activity,
  ShoppingCart,
  Ticket,
  Image as ImageIcon,
  ShieldCheck,
  Settings as SettingsIcon
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Rating } from '../components/ui/Rating';
import { Skeleton } from '../components/ui/Skeleton';
import { DashboardCharts } from '../components/charts/DashboardCharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'kpi' | 'charts' | 'orders' | 'customers' | 'coupons' | 'banners' | 'users' | 'settings' | null>(null);

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getCoupons().catch(() => []),
      adminService.getBanners().catch(() => []),
      adminService.getUsers().catch(() => []),
      adminService.getSettings().catch(() => null)
    ]).then(([statsData, couponsData, bannersData, usersData, settingsData]) => {
      setStats(statsData);
      setCoupons(couponsData);
      setBanners(bannersData);
      setUsers(usersData);
      setSettings(settingsData);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={120} className="w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const kpiItems = [
    {
      name: 'Total Sales',
      value: `$${stats.kpis.totalSales.toLocaleString()}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-primary bg-primary/10',
      description: 'Sum of all orders placed'
    },
    {
      name: 'Store Revenue',
      value: `$${stats.kpis.revenue.toLocaleString()}`,
      change: '+8.4%',
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-500/10',
      description: 'Delivered/processing total earnings'
    },
    {
      name: 'Total Orders',
      value: stats.kpis.ordersCount,
      change: '+15.2%',
      icon: ShoppingBag,
      color: 'text-accent bg-accent/10',
      description: 'Total number of checkouts'
    },
    {
      name: 'Active Customers',
      value: stats.kpis.customersCount,
      change: '+4.1%',
      icon: Users,
      color: 'text-indigo-500 bg-indigo-500/10',
      description: 'Subscribed buyer profiles'
    }
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] md:h-[calc(100vh-10.5rem)] overflow-hidden flex flex-col gap-4 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-heading">Store Dashboard</h1>
        <p className="text-sm text-slate-455 dark:text-slate-400 font-semibold">Overview of your store's sales and analytical reports.</p>
      </div>

      {/* Low Stock Warnings Banner */}
      {stats.kpis.lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/30 rounded-xl text-amber-800 dark:text-amber-300">
          <AlertTriangle className="text-amber-500 flex-shrink-0" size={18} />
          <div className="text-xs font-semibold">
            Warning: there are <strong className="underline">{stats.kpis.lowStockCount} products</strong> running below safe inventory thresholds.
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-extrabold underline ml-auto text-amber-600 dark:text-amber-400 hover:text-amber-850"
          >
            Review Stock
          </Link>
        </div>
      )}

      {/* 8 Compact Overview Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto flex-grow pb-4 pr-1">
        
        {/* Card 1: Store Performance Summary */}
        <div
          onClick={() => setActiveModal('kpi')}
          className="bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-blue-900/30 hover:border-blue-400 dark:hover:border-blue-500/55 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col justify-between relative overflow-hidden h-[135px]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-blue-500" />
          </div>
          <div className="flex flex-col gap-0.5 text-left pt-1">
            <span className="text-[9px] font-extrabold text-blue-500 uppercase tracking-widest">KPI Metrics</span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">Store Performance</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              Rev: <strong>${stats.kpis.revenue.toLocaleString()}</strong> ({stats.kpis.ordersCount} orders)
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-750/50">
            <span className="text-[9px] font-bold text-slate-400">View KPI metrics</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center">
              <DollarSign size={14} />
            </span>
          </div>
        </div>

        {/* Card 2: Sales & Revenue Analytics */}
        <div
          onClick={() => setActiveModal('charts')}
          className="bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-500/55 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col justify-between relative overflow-hidden h-[135px]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-emerald-500" />
          </div>
          <div className="flex flex-col gap-0.5 text-left pt-1">
            <span className="text-[9px] font-extrabold text-emerald-500 uppercase tracking-widest">Charts & Trends</span>
            <h3 className="text-sm font-bold text-slate-850 dark:text-white mt-0.5">Sales & Category</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              7-day performance logs.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-750/50">
            <span className="text-[9px] font-bold text-slate-400">View performance charts</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center">
              <BarChart3 size={14} />
            </span>
          </div>
        </div>

        {/* Card 3: Recent Orders & Top Products */}
        <div
          onClick={() => setActiveModal('orders')}
          className="bg-white dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/30 hover:border-amber-400 dark:hover:border-amber-500/55 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col justify-between relative overflow-hidden h-[135px]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-amber-500" />
          </div>
          <div className="flex flex-col gap-0.5 text-left pt-1">
            <span className="text-[9px] font-extrabold text-amber-550 uppercase tracking-widest">Transactions</span>
            <h3 className="text-sm font-bold text-slate-855 dark:text-white mt-0.5">Orders & Catalog</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              Recent orders & top products.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-750/50">
            <span className="text-[9px] font-bold text-slate-400">View orders table</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center">
              <ShoppingBag size={14} />
            </span>
          </div>
        </div>

        {/* Card 4: Customers & Feedback */}
        <div
          onClick={() => setActiveModal('customers')}
          className="bg-white dark:bg-slate-800/80 border border-purple-100 dark:border-purple-900/30 hover:border-purple-400 dark:hover:border-purple-500/55 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col justify-between relative overflow-hidden h-[135px]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
          <div className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-purple-500" />
          </div>
          <div className="flex flex-col gap-0.5 text-left pt-1">
            <span className="text-[9px] font-extrabold text-purple-500 uppercase tracking-widest">Feedback</span>
            <h3 className="text-sm font-bold text-slate-855 dark:text-white mt-0.5">Customers & Reviews</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              User listings & reviews.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-750/50">
            <span className="text-[9px] font-bold text-slate-400">View registrations</span>
            <span className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-500 flex items-center justify-center">
              <MessageSquare size={14} />
            </span>
          </div>
        </div>

        {/* Card 5: Coupons & Promotions */}
        <div
          onClick={() => setActiveModal('coupons')}
          className="bg-white dark:bg-slate-800/80 border border-rose-100 dark:border-rose-900/30 hover:border-rose-400 dark:hover:border-rose-500/55 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:shadow-rose-500/5 cursor-pointer hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col justify-between relative overflow-hidden h-[135px]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500" />
          <div className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-rose-500" />
          </div>
          <div className="flex flex-col gap-0.5 text-left pt-1">
            <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-widest">Discounts</span>
            <h3 className="text-sm font-bold text-slate-855 dark:text-white mt-0.5">Coupons & Campaigns</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {coupons.length} promotional vouchers active.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-750/50">
            <span className="text-[9px] font-bold text-slate-400">View active codes</span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center">
              <Ticket size={14} />
            </span>
          </div>
        </div>

        {/* Card 6: Homepage Banners */}
        <div
          onClick={() => setActiveModal('banners')}
          className="bg-white dark:bg-slate-800/80 border border-teal-100 dark:border-teal-900/30 hover:border-teal-400 dark:hover:border-teal-500/55 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:shadow-teal-500/5 cursor-pointer hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col justify-between relative overflow-hidden h-[135px]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
          <div className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-teal-500" />
          </div>
          <div className="flex flex-col gap-0.5 text-left pt-1">
            <span className="text-[9px] font-extrabold text-teal-500 uppercase tracking-widest">CMS Content</span>
            <h3 className="text-sm font-bold text-slate-855 dark:text-white mt-0.5">System Banners</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {banners.length} layout slides configured.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-750/50">
            <span className="text-[9px] font-bold text-slate-400">View banner slides</span>
            <span className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/30 text-teal-500 flex items-center justify-center">
              <ImageIcon size={14} />
            </span>
          </div>
        </div>

        {/* Card 7: Administrative Users */}
        <div
          onClick={() => setActiveModal('users')}
          className="bg-white dark:bg-slate-800/80 border border-violet-100 dark:border-violet-900/30 hover:border-violet-400 dark:hover:border-violet-500/55 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:shadow-violet-500/5 cursor-pointer hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col justify-between relative overflow-hidden h-[135px]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-violet-500" />
          </div>
          <div className="flex flex-col gap-0.5 text-left pt-1">
            <span className="text-[9px] font-extrabold text-violet-500 uppercase tracking-widest">Roles</span>
            <h3 className="text-sm font-bold text-slate-855 dark:text-white mt-0.5">Administrators</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {users.length} staff users set in database.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-750/50">
            <span className="text-[9px] font-bold text-slate-400">View staff accounts</span>
            <span className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-violet-500 flex items-center justify-center">
              <ShieldCheck size={14} />
            </span>
          </div>
        </div>

        {/* Card 8: Store Configuration */}
        <div
          onClick={() => setActiveModal('settings')}
          className="bg-white dark:bg-slate-800/80 border border-slate-105 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:shadow-slate-500/5 cursor-pointer hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col justify-between relative overflow-hidden h-[135px]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
          <div className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-slate-550" />
          </div>
          <div className="flex flex-col gap-0.5 text-left pt-1">
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Config</span>
            <h3 className="text-sm font-bold text-slate-855 dark:text-white mt-0.5">Store Settings</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              Global config settings & status logs.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-750/50">
            <span className="text-[9px] font-bold text-slate-400">View general config</span>
            <span className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-500 flex items-center justify-center">
              <SettingsIcon size={14} />
            </span>
          </div>
        </div>

      </div>

      {/* -------------------- DETAILS MODALS -------------------- */}

      {/* Modal 1: KPI Details Modal */}
      {activeModal === 'kpi' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-1 text-left mb-6 pr-8">
              <h3 className="text-lg font-black text-slate-850 dark:text-white font-heading">
                Detailed Store Analytics
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                Breakdown of key performance indicators for your store registry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiItems.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.name} className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-5 flex items-start justify-between text-left">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {kpi.name}
                      </span>
                      <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-2 font-mono">
                        {kpi.value}
                      </span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">{kpi.description}</span>
                      <span className={`text-[10px] font-extrabold mt-2 px-2 py-0.5 rounded-full w-fit ${
                        kpi.change.startsWith('+') ? 'text-emerald-505 bg-emerald-500/10' : 'text-rose-505 bg-rose-500/10'
                      }`}>
                        {kpi.change}
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl ${kpi.color}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Analytics Charts Modal */}
      {activeModal === 'charts' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-855 text-slate-505 dark:text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-1 text-left mb-6 pr-8">
              <h3 className="text-lg font-black text-slate-855 dark:text-white font-heading">
                Sales & Revenue Charts
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                7-day performance statistics and top performing sales categories.
              </p>
            </div>

            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <DashboardCharts
                salesData={stats.chartData.salesHistory}
                categoryData={stats.chartData.categoryDistribution}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Orders & Products Modal */}
      {activeModal === 'orders' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-1 text-left mb-6 pr-8">
              <h3 className="text-lg font-black text-slate-850 dark:text-white font-heading">
                Orders & Catalog Registry
              </h3>
              <p className="text-xs text-slate-455 dark:text-slate-400 font-semibold leading-relaxed">
                Recent customer checkouts and top selling digital products.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-1">
              
              {/* Recent Orders Table */}
              <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 text-left">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150">Recent Orders</h3>
                    <span className="text-xs text-slate-400 mt-0.5 font-semibold">Summary of latest transactions</span>
                  </div>
                  <Link
                    to="/admin/orders"
                    onClick={() => setActiveModal(null)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    All Orders <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                      {stats.recentOrders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                          <td className="py-3 font-bold text-slate-700 dark:text-slate-300">
                            {order.orderNumber}
                          </td>
                          <td className="py-3 font-semibold">{order.customerName}</td>
                          <td className="py-3 font-bold text-slate-850 dark:text-slate-100 font-mono">
                            ${order.total.toFixed(2)}
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                order.status === 'delivered'
                                  ? 'success'
                                  : order.status === 'processing'
                                  ? 'info'
                                  : order.status === 'pending'
                                  ? 'warning'
                                  : 'danger'
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'danger'}>
                              {order.paymentStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Performing Products */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between text-left">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-155">Top Selling Products</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-semibold">Highest order volume items</p>
                </div>
                
                <div className="flex flex-col gap-4 my-5 flex-grow">
                  {stats.topProducts.map((prod: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-750 last:border-0 last:pb-0">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-10 h-10 object-cover rounded-lg bg-slate-100 border border-slate-205 dark:border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-750 dark:text-slate-250 truncate">
                          {prod.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
                          {prod.sales} items sold
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-primary font-mono">${prod.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/admin/products"
                  onClick={() => setActiveModal(null)}
                  className="text-xs font-bold text-center text-primary hover:underline mt-2"
                >
                  Manage Products Catalogue
                </Link>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Customers & Feedback Modal */}
      {activeModal === 'customers' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-1 text-left mb-6 pr-8">
              <h3 className="text-lg font-black text-slate-855 dark:text-white font-heading">
                Customers & Feedback
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                Registered profiles list and recent product feedback moderation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-1">
              
              {/* Recent Customers */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 text-left">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 mb-5">
                  New Customer Registrations
                </h3>
                <div className="flex flex-col gap-4">
                  {stats.recentCustomers.map((cust: any) => (
                    <div key={cust.id} className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-750 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={cust.avatar}
                          alt={cust.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{cust.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{cust.email}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                          ${cust.totalSpent.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase">
                          {cust.totalOrders} Orders
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Reviews */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 text-left">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-155 mb-5">
                  Recent Product Reviews
                </h3>
                <div className="flex flex-col gap-4">
                  {stats.latestReviews.map((rev: any) => (
                    <div key={rev.id} className="flex flex-col gap-2 pb-3.5 border-b border-slate-100 dark:border-slate-750 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}
                            alt={rev.userName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.userName}</span>
                        </div>
                        <Rating value={rev.rating} size={12} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 pl-9">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Coupons Modal */}
      {activeModal === 'coupons' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-1 text-left mb-6 pr-8">
              <h3 className="text-lg font-black text-slate-850 dark:text-white font-heading">
                Discounts & Coupon Campaigns
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                Active promotional vouchers, campaign codes, and usage logs.
              </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Discount</th>
                    <th className="pb-3">Expiry</th>
                    <th className="pb-3">Usage</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                      <td className="py-3 font-bold text-slate-700 dark:text-slate-200">{coupon.code}</td>
                      <td className="py-3 font-semibold text-emerald-500">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`} Off
                      </td>
                      <td className="py-3 text-slate-550 dark:text-slate-400">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                      <td className="py-3 text-slate-550 dark:text-slate-400 font-mono">{coupon.usageCount} used</td>
                      <td className="py-3">
                        <Badge variant={coupon.status === 'active' ? 'success' : 'danger'}>{coupon.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Banners Modal */}
      {activeModal === 'banners' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-1 text-left mb-6 pr-8">
              <h3 className="text-lg font-black text-slate-850 dark:text-white font-heading">
                CMS Layout Banners
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                Active hero slide banners and landing page sliders configuration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {banners.map((banner) => (
                <div key={banner.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex gap-4 text-left">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-20 h-20 object-cover rounded-lg bg-slate-100 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{banner.title}</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold mt-1 line-clamp-2">{banner.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Badge variant={banner.status === 'active' ? 'success' : 'danger'}>{banner.status}</Badge>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">{banner.position}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 7: Users Modal */}
      {activeModal === 'users' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-1 text-left mb-6 pr-8">
              <h3 className="text-lg font-black text-slate-850 dark:text-white font-heading">
                Staff & Administrators
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                Registered staff team directory and permission profile roles.
              </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                      <td className="py-3 font-bold text-slate-750 dark:text-slate-200">{u.name}</td>
                      <td className="py-3 font-semibold text-slate-500">{u.email}</td>
                      <td className="py-3">
                        <Badge variant={u.role === 'admin' ? 'info' : 'warning'}>{u.role}</Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge>
                      </td>
                      <td className="py-3 text-slate-400 font-semibold">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal 8: Settings Modal */}
      {activeModal === 'settings' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-855 text-slate-505 dark:text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-1 text-left mb-6 pr-8">
              <h3 className="text-lg font-black text-slate-850 dark:text-white font-heading">
                Store Configurations
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                Global settings values configured for your storefront registry.
              </p>
            </div>

            {settings && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-h-[60vh] overflow-y-auto pr-1">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-805 rounded-xl p-5 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-primary dark:text-blue-400 uppercase tracking-wider mb-1">General Info</h4>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Store Name</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-white">{settings.storeName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Store Email</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-white">{settings.storeEmail}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Currency</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-white">{settings.currency}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-805 rounded-xl p-5 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-primary dark:text-blue-400 uppercase tracking-wider mb-1">Rates & Mode</h4>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Tax Rate</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-white">{settings.taxRate}%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Shipping Fee</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-white">${settings.shippingFee}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Maintenance Mode</span>
                    <Badge variant={settings.maintenanceMode ? 'danger' : 'success'}>
                      {settings.maintenanceMode ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
