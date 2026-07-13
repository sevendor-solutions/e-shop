import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { Coupon } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useThemeStore } from '../store/themeStore';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, ColDef } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const couponSchema = z.object({
  code: z.string().min(1, 'Coupon Code is required').regex(/^[A-Z0-9_-]+$/, 'Must be uppercase alphanumeric characters'),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0.01, 'Value must be positive'),
  minPurchase: z.number().min(0, 'Minimum purchase cannot be negative'),
  maxDiscount: z.number().optional(),
  expiryDate: z.string().min(1, 'Expiry Date is required'),
  usageLimit: z.number().min(1, 'Usage Limit must be at least 1'),
  status: z.enum(['active', 'expired', 'disabled']).default('active'),
});

type CouponFormValues = z.infer<typeof couponSchema>;

export default function AdminCoupons() {
  const { theme } = useThemeStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues: { type: 'percentage', minPurchase: 0, usageLimit: 100, status: 'active' }
  });

  const watchType = watch('type');

  const loadCoupons = () => {
    setLoading(true);
    adminService.getCoupons().then((data) => {
      setCoupons(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    reset({ code: '', type: 'percentage', value: 10, minPurchase: 50, expiryDate: '2026-12-31', usageLimit: 500, status: 'active' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    reset({
      code: c.code,
      type: c.type,
      value: c.value,
      minPurchase: c.minPurchase,
      maxDiscount: c.maxDiscount || undefined,
      expiryDate: c.expiryDate,
      usageLimit: c.usageLimit,
      status: c.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: CouponFormValues) => {
    try {
      const payload = {
        ...values,
        maxDiscount: values.maxDiscount || undefined
      };

      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon.id, payload as any);
        toast.success('Coupon discount updated!');
      } else {
        await adminService.createCoupon(payload as any);
        toast.success('New coupon code created successfully!');
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await adminService.deleteCoupon(id);
        toast.success('Coupon code deleted.');
        loadCoupons();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete coupon');
      }
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Coupon Code',
      field: 'code',
      flex: 1.2,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full">
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 shadow-inner">
              {params.value}
            </span>
          </div>
        );
      }
    },
    {
      headerName: 'Discount Offer',
      field: 'value',
      flex: 1.2,
      cellRenderer: (params: any) => {
        const c = params.data;
        if (!c) return null;
        return (
          <span className="font-extrabold text-emerald-550 dark:text-emerald-450 text-sm">
            {c.type === 'percentage' ? `${c.value}% OFF` : `$${c.value.toFixed(2)} OFF`}
          </span>
        );
      }
    },
    {
      headerName: 'Type',
      field: 'type',
      width: 120,
      cellRenderer: (params: any) => {
        return (
          <span className="text-xs font-bold text-slate-500 capitalize">
            {params.value === 'percentage' ? 'Percentage' : 'Fixed Flat'}
          </span>
        );
      }
    },
    {
      headerName: 'Min Purchase',
      field: 'minPurchase',
      flex: 1,
      cellRenderer: (params: any) => {
        return (
          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
            ${params.value.toFixed(2)}
          </span>
        );
      }
    },
    {
      headerName: 'Usage Tracker',
      field: 'usageCount',
      flex: 1.5,
      cellRenderer: (params: any) => {
        const c = params.data;
        if (!c) return null;
        const percentage = Math.min(100, (c.usageCount / c.usageLimit) * 100);
        return (
          <div className="flex flex-col justify-center h-full gap-1 w-full py-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-none">
              {c.usageCount} / {c.usageLimit} checkouts
            </span>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${percentage >= 90 ? 'bg-rose-500' : 'bg-primary'}`} 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      headerName: 'Expiry Date',
      field: 'expiryDate',
      flex: 1.2,
      cellRenderer: (params: any) => {
        const isExpired = new Date(params.value) < new Date();
        return (
          <div className="flex items-center gap-1.5 h-full text-xs font-semibold">
            <Calendar size={12} className={isExpired ? 'text-rose-500' : 'text-slate-400'} />
            <span className={isExpired ? 'text-rose-500 font-bold' : 'text-slate-550 dark:text-slate-300'}>
              {params.value}
            </span>
          </div>
        );
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 110,
      cellRenderer: (params: any) => {
        const c = params.data;
        if (!c) return null;
        const isExpired = new Date(c.expiryDate) < new Date() || c.status === 'expired';
        return (
          <div className="flex items-center h-full">
            <Badge variant={isExpired ? 'danger' : c.status === 'disabled' ? 'secondary' : 'success'}>
              {isExpired ? 'Expired' : c.status}
            </Badge>
          </div>
        );
      }
    },
    {
      headerName: 'Actions',
      field: 'id',
      width: 110,
      sortable: false,
      filter: false,
      cellClass: 'flex justify-end items-center',
      cellRenderer: (params: any) => {
        const coupon = params.data;
        if (!coupon) return null;
        return (
          <div className="flex items-center justify-end gap-1.5 h-full py-1">
            <button
              onClick={() => handleOpenEditModal(coupon)}
              className="p-1.5 text-slate-550 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => handleDeleteCoupon(coupon.id)}
              className="p-1.5 text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold text-slate-805 dark:text-slate-100">Coupon Management</h1>
          <p className="text-sm text-slate-400">Offer percentage or fixed deductions on buyer checkout transactions.</p>
        </div>
        <Button onClick={handleOpenAddModal} leftIcon={<Plus size={16} />}>
          Create Coupon
        </Button>
      </div>

      {/* Table list */}
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
              rowData={coupons}
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

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? 'Modify Coupon' : 'Create Coupon Code'}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <Input
            label="Coupon Code"
            placeholder="e.g. SUMMER20"
            error={errors.code?.message}
            {...register('code')}
          />
          <p className="text-[10px] text-slate-400 -mt-2">Uppercase alphanumeric characters and underscores only.</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Discount Type
              </label>
              <select
                className="w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none dark:text-slate-100"
                {...register('type')}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Flat ($)</option>
              </select>
            </div>

            <Input
              label="Discount Value"
              type="number"
              step="0.01"
              error={errors.value?.message}
              {...register('value', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Purchase ($)"
              type="number"
              error={errors.minPurchase?.message}
              {...register('minPurchase', { valueAsNumber: true })}
            />
            <Input
              label="Usage Limit count"
              type="number"
              error={errors.usageLimit?.message}
              {...register('usageLimit', { valueAsNumber: true })}
            />
          </div>

          {watchType === 'percentage' && (
            <Input
              label="Maximum Cap Limit ($) - Optional"
              type="number"
              placeholder="e.g. 50"
              error={errors.maxDiscount?.message}
              {...register('maxDiscount', { valueAsNumber: true })}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry Date"
              type="date"
              error={errors.expiryDate?.message}
              {...register('expiryDate')}
            />

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </label>
              <select
                className="w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none dark:text-slate-100"
                {...register('status')}
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingCoupon ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
