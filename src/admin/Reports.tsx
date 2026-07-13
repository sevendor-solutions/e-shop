import React, { useEffect, useState } from 'react';
import { BarChart3, Download, Printer, Filter, Calendar, DollarSign, TrendingUp, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useThemeStore } from '../store/themeStore';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, ColDef } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AdminReports() {
  const { theme } = useThemeStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('week'); // 'today' | 'week' | 'month'

  const loadData = () => {
    setLoading(true);
    adminService.getDashboardStats().then((stats) => {
      setData(stats);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [reportPeriod]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    toast.success('Report exported as CSV file.');
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 text-left">
        <Skeleton height={40} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={100} className="w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton height={300} className="w-full rounded-2xl" />
      </div>
    );
  }

  // Calculate reporting parameters
  const totalSalesCount = data.kpis.ordersCount;
  const grossSales = data.kpis.totalSales;
  const avgOrderValue = totalSalesCount > 0 ? grossSales / totalSalesCount : 0;
  const shippingCharged = totalSalesCount * 10;
  const estimatedTax = grossSales * 0.08;

  // Process rows for AG Grid
  const rowData = data.chartData.salesHistory.map((day: any) => {
    const dayTax = day.revenue * 0.08;
    const dayShipping = day.sales * 10;
    const dayNet = day.revenue - dayTax - dayShipping;
    return {
      date: day.date,
      sales: day.sales,
      avgBasket: day.revenue / Math.max(1, day.sales),
      tax: dayTax,
      shipping: dayShipping,
      netEarnings: dayNet
    };
  });

  const columnDefs: ColDef[] = [
    {
      headerName: 'Reporting Date',
      field: 'date',
      flex: 1.2,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center gap-1.5 h-full font-bold text-slate-800 dark:text-slate-200">
            <Calendar size={12} className="text-slate-400" />
            <span>{params.value}</span>
          </div>
        );
      }
    },
    {
      headerName: 'Orders Placed',
      field: 'sales',
      width: 140,
      cellClass: 'text-center font-bold font-mono',
      cellRenderer: (params: any) => {
        return <span className="text-slate-600 dark:text-slate-400">{params.value} sales</span>;
      }
    },
    {
      headerName: 'Avg Basket Size',
      field: 'avgBasket',
      flex: 1,
      cellClass: 'text-right font-mono font-semibold',
      cellRenderer: (params: any) => {
        return <span>${params.value.toFixed(2)}</span>;
      }
    },
    {
      headerName: 'Tax Collected',
      field: 'tax',
      flex: 1,
      cellClass: 'text-right font-mono text-slate-500 dark:text-slate-450',
      cellRenderer: (params: any) => {
        return <span>${params.value.toFixed(2)}</span>;
      }
    },
    {
      headerName: 'Shipping Cost',
      field: 'shipping',
      flex: 1,
      cellClass: 'text-right font-mono text-slate-505 dark:text-slate-450',
      cellRenderer: (params: any) => {
        return <span>${params.value.toFixed(2)}</span>;
      }
    },
    {
      headerName: 'Total Net Earnings',
      field: 'netEarnings',
      flex: 1.2,
      cellClass: 'text-right font-mono font-extrabold',
      cellRenderer: (params: any) => {
        return (
          <span className="text-emerald-555 dark:text-emerald-450">
            ${params.value.toFixed(2)}
          </span>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold text-slate-805 dark:text-slate-100 font-heading">Financial Reports</h1>
          <p className="text-sm text-slate-400">View sales figures, estimated taxes, and shipping expenses.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<Download size={14} />}>
            Export CSV
          </Button>
          <Button size="sm" onClick={handlePrint} leftIcon={<Printer size={14} />}>
            Print Report
          </Button>
        </div>
      </div>

      {/* Period Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700/80 rounded-xl shadow-sm text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Filter size={14} /> Period:
        </div>
        
        <div className="flex gap-1.5">
          <button
            onClick={() => setReportPeriod('today')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              reportPeriod === 'today' ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setReportPeriod('week')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              reportPeriod === 'week' ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setReportPeriod('month')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              reportPeriod === 'month' ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Analytics KPI details - Premium Coordinated Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Gross Sales */}
        <div className="bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-400 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 ease-out flex items-start justify-between relative overflow-hidden h-[120px]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex flex-col justify-between h-full pt-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Sales</span>
            <strong className="text-xl font-extrabold text-slate-800 dark:text-white mt-2 font-mono">
              ${grossSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center mt-1">
            <DollarSign size={16} />
          </span>
        </div>

        {/* KPI 2: Average Order Value */}
        <div className="bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-blue-900/30 hover:border-blue-400 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 ease-out flex items-start justify-between relative overflow-hidden h-[120px]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex flex-col justify-between h-full pt-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Order Value (AOV)</span>
            <strong className="text-xl font-extrabold text-slate-800 dark:text-white mt-2 font-mono">
              ${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center mt-1">
            <TrendingUp size={16} />
          </span>
        </div>

        {/* KPI 3: Estimated Tax Collected */}
        <div className="bg-white dark:bg-slate-800/80 border border-purple-100 dark:border-purple-900/30 hover:border-purple-400 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 ease-out flex items-start justify-between relative overflow-hidden h-[120px]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
          <div className="flex flex-col justify-between h-full pt-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Tax Collected</span>
            <strong className="text-xl font-extrabold text-slate-800 dark:text-white mt-2 font-mono">
              ${estimatedTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <span className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-505 flex items-center justify-center mt-1">
            <ShieldCheck size={16} />
          </span>
        </div>

        {/* KPI 4: Shipping Revenue */}
        <div className="bg-white dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/30 hover:border-amber-400 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300 ease-out flex items-start justify-between relative overflow-hidden h-[120px]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex flex-col justify-between h-full pt-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shipping Revenue</span>
            <strong className="text-xl font-extrabold text-slate-800 dark:text-white mt-2 font-mono">
              ${shippingCharged.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center mt-1">
            <Truck size={16} />
          </span>
        </div>

      </div>

      {/* Detailed Financial Summary Table - AG Grid Upgrade */}
      <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden p-4">
        <h3 className="text-sm font-bold text-slate-850 dark:text-white mb-4 pl-1">Weekly Transaction Ledger</h3>
        <div 
          className={theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'} 
          style={{ height: '420px', width: '100%', '--ag-font-family': 'Outfit, sans-serif' } as React.CSSProperties}
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={false}
            domLayout="normal"
            rowHeight={48}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              flex: 1
            }}
          />
        </div>
      </div>

    </div>
  );
}
