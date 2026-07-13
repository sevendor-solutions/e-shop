import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { Banner } from '../types';
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

const bannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  image: z.string().url('Must be a valid URL'),
  link: z.string().min(1, 'Link redirect is required'),
  type: z.enum(['hero', 'promo_grid', 'promotional']),
  status: z.enum(['active', 'inactive']).default('active'),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

export default function AdminBanners() {
  const { theme } = useThemeStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema) as any,
    defaultValues: { type: 'hero', status: 'active' }
  });

  const loadBanners = () => {
    setLoading(true);
    adminService.getBanners().then((data) => {
      setBanners(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    reset({ title: '', subtitle: '', image: '', link: '/products', type: 'hero', status: 'active' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: Banner) => {
    setEditingBanner(b);
    reset({
      title: b.title,
      subtitle: b.subtitle || '',
      image: b.image,
      link: b.link,
      type: b.type,
      status: b.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: BannerFormValues) => {
    try {
      const payload = {
        ...values,
        subtitle: values.subtitle || undefined
      };

      if (editingBanner) {
        await adminService.updateBanner(editingBanner.id, payload as any);
        toast.success('Banner configuration updated!');
      } else {
        await adminService.createBanner(payload as any);
        toast.success('New banner added successfully!');
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await adminService.deleteBanner(id);
        toast.success('Banner configuration deleted.');
        loadBanners();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete banner');
      }
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Banner Image',
      field: 'image',
      width: 140,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const b = params.data;
        if (!b || !b.image) return null;
        return (
          <div className="flex items-center h-full py-1">
            <img
              src={b.image}
              alt={b.title}
              className="w-20 h-10 object-cover rounded-md bg-slate-50 border border-slate-200 dark:border-slate-700 shadow-sm"
            />
          </div>
        );
      }
    },
    {
      headerName: 'Title',
      field: 'title',
      flex: 1.5,
      cellRenderer: (params: any) => {
        const b = params.data;
        if (!b) return null;
        return (
          <div className="flex flex-col justify-center h-full leading-tight">
            <span className="font-bold text-slate-805 dark:text-slate-100 text-xs truncate">
              {b.title}
            </span>
            {b.subtitle && (
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold truncate mt-0.5">
                {b.subtitle}
              </span>
            )}
          </div>
        );
      }
    },
    {
      headerName: 'Placement Position',
      field: 'type',
      width: 150,
      cellRenderer: (params: any) => {
        const val = params.value;
        return (
          <div className="flex items-center h-full">
            <Badge variant={val === 'hero' ? 'primary' : val === 'promo_grid' ? 'info' : 'warning'}>
              {val === 'hero' ? 'Hero Slider' : val === 'promo_grid' ? 'Promo Grid' : 'Standard Banner'}
            </Badge>
          </div>
        );
      }
    },
    {
      headerName: 'Redirect Link',
      field: 'link',
      flex: 1.2,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center gap-1.5 h-full text-xs font-semibold text-slate-500 dark:text-slate-400">
            <LinkIcon size={11} className="text-slate-400" />
            <span className="font-mono text-[10px]">
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
        const val = params.value;
        return (
          <div className="flex items-center h-full">
            <Badge variant={val === 'active' ? 'success' : 'danger'}>
              {val}
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
        const b = params.data;
        if (!b) return null;
        return (
          <div className="flex items-center justify-end gap-1.5 h-full py-1">
            <button
              onClick={() => handleOpenEditModal(b)}
              className="p-1.5 text-slate-550 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => handleDeleteBanner(b.id)}
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
          <h1 className="text-2xl font-extrabold text-slate-805 dark:text-slate-100">Banners Management</h1>
          <p className="text-sm text-slate-400">Configure promotional slides, grid banners, and discounts links.</p>
        </div>
        <Button onClick={handleOpenAddModal} leftIcon={<Plus size={16} />}>
          Add Banner
        </Button>
      </div>

      {/* Table grid listing */}
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
              rowData={banners}
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
        title={editingBanner ? 'Modify Banner' : 'Create Banner'}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <Input label="Banner Title" placeholder="e.g. Summer Blowout Sales" error={errors.title?.message} {...register('title')} />
          <Input label="Subtitle (Optional)" placeholder="e.g. Up to 70% Off headphones" error={errors.subtitle?.message} {...register('subtitle')} />
          <Input label="Banner Image URL" placeholder="https://images.unsplash.com/..." error={errors.image?.message} {...register('image')} />
          <Input label="Redirect Link URL" placeholder="e.g. /products?category=audio-gear" error={errors.link?.message} {...register('link')} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Placement Placement
              </label>
              <select
                className="w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none dark:text-slate-100"
                {...register('type')}
              >
                <option value="hero">Hero Slider (Main Carousel)</option>
                <option value="promo_grid">Promo Grid Banner</option>
                <option value="promotional">Standard Single Banner</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </label>
              <select
                className="w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none dark:text-slate-100"
                {...register('status')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingBanner ? 'Save Changes' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
