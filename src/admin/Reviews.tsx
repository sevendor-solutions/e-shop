import React, { useEffect, useState } from 'react';
import { Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { Review, Product } from '../types';
import { Badge } from '../components/ui/Badge';
import { Rating } from '../components/ui/Rating';
import { Skeleton } from '../components/ui/Skeleton';
import { productService } from '../services/productService';
import { useThemeStore } from '../store/themeStore';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, ColDef } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AdminReviews() {
  const { theme } = useThemeStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminService.getDashboardStats(), // to extract reviews cache
      productService.getProducts({ limit: 100 })
    ]).then(([stats, prodRes]) => {
      setReviews(stats.latestReviews);
      setProducts(prodRes.products);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (id: string, status: Review['status']) => {
    setReviews(prev => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Review marked as ${status}!`);
  };

  const handleDeleteReview = (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      setReviews(prev => prev.filter((r) => r.id !== id));
      toast.success('Review deleted.');
    }
  };

  const getProductTitle = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    return p ? p.name : 'Unknown Product';
  };

  const filtered = reviews.filter((r) => !statusFilter || r.status === statusFilter);

  const columnDefs: ColDef[] = [
    {
      headerName: 'User',
      field: 'userName',
      width: 160,
      cellRenderer: (params: any) => {
        const rev = params.data;
        if (!rev) return null;
        return (
          <div className="flex items-center gap-2.5 h-full py-1">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold flex items-center justify-center text-xs border border-slate-200 dark:border-slate-800">
              {rev.userName.charAt(0)}
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-205 text-xs truncate">
              {rev.userName}
            </span>
          </div>
        );
      }
    },
    {
      headerName: 'Product',
      field: 'productId',
      flex: 1,
      cellRenderer: (params: any) => {
        return (
          <span className="font-bold text-primary dark:text-blue-400 text-xs truncate block py-1">
            {getProductTitle(params.value)}
          </span>
        );
      }
    },
    {
      headerName: 'Rating',
      field: 'rating',
      width: 120,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full">
            <Rating value={params.value} size={11} />
          </div>
        );
      }
    },
    {
      headerName: 'Comment',
      field: 'comment',
      flex: 2,
      cellRenderer: (params: any) => {
        return (
          <span className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1 py-1 block">
            "{params.value}"
          </span>
        );
      }
    },
    {
      headerName: 'Date',
      field: 'date',
      width: 110,
      cellRenderer: (params: any) => {
        return (
          <span className="text-[11px] text-slate-400 font-semibold font-mono">
            {params.value}
          </span>
        );
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 110,
      cellRenderer: (params: any) => {
        const val = params.value;
        return (
          <div className="flex items-center h-full">
            <Badge variant={val === 'approved' ? 'success' : val === 'spam' ? 'danger' : 'warning'}>
              {val}
            </Badge>
          </div>
        );
      }
    },
    {
      headerName: 'Actions',
      field: 'id',
      width: 130,
      sortable: false,
      filter: false,
      cellClass: 'flex justify-end items-center',
      cellRenderer: (params: any) => {
        const rev = params.data;
        if (!rev) return null;
        return (
          <div className="flex items-center justify-end gap-1 h-full py-1">
            {rev.status !== 'approved' && (
              <button
                onClick={() => handleUpdateStatus(rev.id, 'approved')}
                className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-md cursor-pointer"
                title="Approve Review"
              >
                <ShieldCheck size={14} />
              </button>
            )}
            {rev.status !== 'spam' && (
              <button
                onClick={() => handleUpdateStatus(rev.id, 'spam')}
                className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-955/20 rounded-md cursor-pointer"
                title="Mark Spam"
              >
                <ShieldAlert size={14} />
              </button>
            )}
            <button
              onClick={() => handleDeleteReview(rev.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md cursor-pointer"
              title="Delete Permanently"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-extrabold text-slate-805 dark:text-slate-100">Reviews Moderation</h1>
        <p className="text-sm text-slate-400">Moderate product ratings and comments posted by buyers.</p>
      </div>

      {/* Toolbar */}
      <div className="flex bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700/80 rounded-xl shadow-sm">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm px-3 py-2 rounded-lg text-slate-655 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Moderations</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending Approval</option>
          <option value="spam">Spam / Flagged</option>
        </select>
      </div>

      {/* AG Grid View */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton height={40} />
          <Skeleton height={300} />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden p-4">
          <div 
            className={theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'} 
            style={{ height: '550px', width: '100%', '--ag-font-family': 'Outfit, sans-serif' } as React.CSSProperties}
          >
            <AgGridReact
              rowData={filtered}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 25, 50]}
              domLayout="normal"
              rowHeight={52}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                flex: 1,
                minWidth: 100
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
