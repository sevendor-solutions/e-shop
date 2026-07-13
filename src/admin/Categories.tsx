import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../services/productService';
import { Category } from '../types';
import { Card } from '../components/ui/Card';
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

const categorySchema = z.object({
  name: z.string().min(1, 'Category Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().url('Must be a valid URL').or(z.literal('')),
  parentId: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const { theme } = useThemeStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: { status: 'active', parentId: '' }
  });

  const watchName = watch('name');

  // Auto slug generation
  useEffect(() => {
    if (watchName && !editingCategory) {
      const generatedSlug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug);
    }
  }, [watchName, setValue, editingCategory]);

  const loadCategories = () => {
    setLoading(true);
    productService.getCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    reset({ name: '', slug: '', description: '', image: '', parentId: '', status: 'active' });
    setIsModalOpen(true);
  };

  const handleAddSubCategoryDirect = (parentCat: Category) => {
    setEditingCategory(null);
    reset({
      name: '',
      slug: '',
      description: '',
      image: '',
      parentId: parentCat.id,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      parentId: cat.parentId || '',
      status: cat.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: CategoryFormValues) => {
    try {
      const payload = {
        ...values,
        parentId: values.parentId || undefined,
        image: values.image || undefined,
        description: values.description || undefined
      };

      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, payload as any);
        toast.success('Category updated successfully!');
      } else {
        await productService.createCategory(payload as any);
        toast.success('Category created successfully!');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? All subcategories will become orphan.')) {
      try {
        await productService.deleteCategory(id);
        toast.success('Category deleted successfully!');
        loadCategories();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete category');
      }
    }
  };

  const parentCategories = categories.filter((c) => !c.parentId);

  // Group child categories by their parent ID
  const subCategoriesMap = categories.reduce((acc, cat) => {
    if (cat.parentId) {
      if (!acc[cat.parentId]) acc[cat.parentId] = [];
      acc[cat.parentId].push(cat);
    }
    return acc;
  }, {} as Record<string, Category[]>);

  const filteredParentCategories = parentCategories.filter((parent) => {
    const parentMatches = parent.name.toLowerCase().includes(search.toLowerCase());
    const childrenMatch = (subCategoriesMap[parent.id] || []).some((child) =>
      child.name.toLowerCase().includes(search.toLowerCase())
    );
    return parentMatches || childrenMatch;
  });

  // Flat map parent + subcategories in order for AG Grid rendering
  const rowData: any[] = [];
  filteredParentCategories.forEach((parent) => {
    rowData.push({
      ...parent,
      isParent: true,
      hierarchyName: parent.name,
      level: 'Parent',
      parentName: '-'
    });
    const subs = subCategoriesMap[parent.id] || [];
    subs.forEach((sub) => {
      rowData.push({
        ...sub,
        isParent: false,
        hierarchyName: `↳ ${sub.name}`,
        level: 'Sub-Category',
        parentName: parent.name
      });
    });
  });  const columnDefs: ColDef[] = [
    {
      headerName: 'Image',
      field: 'image',
      width: 80,
      minWidth: 80,
      suppressSizeToFit: true,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const cat = params.data;
        if (!cat || !cat.image) return null;
        return (
          <div className="flex items-center h-full py-1">
            <img
              src={cat.image}
              alt={cat.name}
              className="w-10 h-10 object-cover rounded-lg bg-slate-50 border border-slate-100 dark:border-slate-700/60"
            />
          </div>
        );
      }
    },
    {
      headerName: 'Category Name',
      field: 'hierarchyName',
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (params: any) => {
        const cat = params.data;
        if (!cat) return null;
        return (
          <div className="flex flex-col justify-center h-full leading-tight">
            <span className={`font-bold ${cat.isParent ? 'text-slate-805 dark:text-slate-100 text-sm' : 'text-slate-500 dark:text-slate-400 text-xs pl-4'}`}>
              {cat.hierarchyName}
            </span>
          </div>
        );
      }
    },
    {
      headerName: 'URL Slug',
      field: 'slug',
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: any) => {
        return (
          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
            /{params.value}
          </span>
        );
      }
    },
    {
      headerName: 'Parent Category',
      field: 'parentName',
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: any) => {
        const cat = params.data;
        if (!cat) return null;
        return (
          <span className={`text-xs ${cat.isParent ? 'text-slate-400 italic' : 'text-slate-655 dark:text-slate-300 font-bold'}`}>
            {params.value}
          </span>
        );
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 110,
      minWidth: 100,
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
      width: 180,
      minWidth: 160,
      sortable: false,
      filter: false,
      cellClass: 'flex justify-end items-center',
      cellRenderer: (params: any) => {
        const cat = params.data;
        if (!cat) return null;
        return (
          <div className="flex items-center justify-end gap-1.5 h-full py-1">
            {cat.isParent && (
              <button
                onClick={() => handleAddSubCategoryDirect(cat)}
                className="p-1 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-md border border-primary/20 dark:border-blue-500/20 dark:text-blue-400 transition-all flex items-center gap-1 cursor-pointer"
                title="Add Sub-Category"
              >
                <Plus size={10} /> Add Sub
              </button>
            )}
            <button
              onClick={() => handleOpenEditModal(cat)}
              className="p-1.5 text-slate-550 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="p-1.5 text-red-500 hover:text-red-755 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-md transition-colors cursor-pointer"
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
          <h1 className="text-2xl font-extrabold text-slate-805 dark:text-slate-100">Product Categories</h1>
          <p className="text-sm text-slate-400">Organize products into parent and child classifications.</p>
        </div>
        <Button onClick={handleOpenAddModal} leftIcon={<Plus size={16} />}>
          Create Category
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700/80 rounded-xl shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm py-2 pl-9 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
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
              rowData={rowData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 25, 50]}
              domLayout="normal"
              rowHeight={50}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                flex: 1
              }}
            />
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <Input label="Category Name" placeholder="e.g. Laptops" error={errors.name?.message} {...register('name')} />
          <Input label="URL Slug" placeholder="e.g. laptops" error={errors.slug?.message} {...register('slug')} />

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Parent Category (Optional)
            </label>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mb-1">
              Select a parent category if you are creating a sub-category. Set to "None" for top-level categories.
            </p>
            <select
              className="w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none dark:text-slate-100"
              {...register('parentId')}
            >
              <option value="">None (Top-Level Category)</option>
              {parentCategories
                .filter((p) => p.id !== editingCategory?.id) // Prevent self-referencing parent
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
          </div>

          <Input label="Category Image URL" placeholder="https://images.unsplash.com/..." error={errors.image?.message} {...register('image')} />
          <Input label="Category Description" textarea placeholder="Short description..." error={errors.description?.message} {...register('description')} />

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

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
