import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../services/productService';
import { Product, Category } from '../types';
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

// Product Schema
const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0.01, 'Price must be positive'),
  originalPrice: z.number().min(0.01, 'Original price must be positive'),
  discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Max discount is 100%'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().url('Must be a valid URL'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  popular: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  featured: z.boolean().default(false),
  specs: z.array(
    z.object({
      key: z.string().min(1, 'Spec Name is required'),
      value: z.string().min(1, 'Spec Value is required'),
    })
  ).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AdminProducts() {
  const { theme } = useThemeStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const columnDefs: ColDef<Product>[] = [
    {
      headerName: 'Image',
      field: 'image',
      width: 80,
      minWidth: 80,
      suppressSizeToFit: true,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const product = params.data;
        if (!product) return null;
        return (
          <div className="flex items-center h-full py-1">
            <img
              src={product.image}
              alt={product.name}
              className="w-10 h-10 object-cover rounded-lg bg-slate-50 border border-slate-100 dark:border-slate-700/60"
            />
          </div>
        );
      }
    },
    {
      headerName: 'SKU / Product',
      field: 'name',
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (params: any) => {
        const product = params.data;
        if (!product) return null;
        return (
          <div className="flex flex-col justify-center leading-tight py-1 h-full">
            <span className="text-[10px] text-slate-400 font-bold font-mono leading-none mb-0.5">
              {product.sku}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
              {product.name}
            </span>
            <span className="text-[10px] text-slate-450 leading-none mt-0.5">Brand: {product.brand}</span>
          </div>
        );
      }
    },
    {
      headerName: 'Category',
      field: 'category',
      width: 140,
      minWidth: 120,
      cellRenderer: (params: any) => {
        const val = params.value;
        return (
          <div className="flex items-center h-full font-semibold text-slate-600 dark:text-slate-450 uppercase tracking-wider text-[11px]">
            {val ? val.replace('-', ' ') : ''}
          </div>
        );
      }
    },
    {
      headerName: 'Price',
      field: 'price',
      width: 110,
      minWidth: 100,
      cellRenderer: (params: any) => {
        const product = params.data;
        if (!product) return null;
        return (
          <div className="flex flex-col justify-center leading-tight h-full">
            <span className="font-extrabold text-slate-850 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className="text-[9px] text-red-500 font-bold line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        );
      }
    },
    {
      headerName: 'Stock',
      field: 'stock',
      width: 90,
      minWidth: 80,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full font-bold font-mono">
            {params.value}
          </div>
        );
      }
    },
    {
      headerName: 'Status',
      field: 'stock',
      width: 110,
      minWidth: 100,
      cellRenderer: (params: any) => {
        const stock = params.value;
        const isLowStock = stock > 0 && stock < 15;
        const isOutOfStock = stock === 0;
        return (
          <div className="flex items-center h-full">
            {isOutOfStock ? (
              <Badge variant="danger">Out of stock</Badge>
            ) : isLowStock ? (
              <Badge variant="warning" className="flex items-center gap-1 w-fit">
                <AlertTriangle size={10} /> Low Stock
              </Badge>
            ) : (
              <Badge variant="success">In Stock</Badge>
            )}
          </div>
        );
      }
    },
    {
      headerName: 'Actions',
      field: 'id',
      width: 100,
      minWidth: 90,
      sortable: false,
      filter: false,
      cellClass: 'flex justify-end',
      cellRenderer: (params: any) => {
        const product = params.data;
        if (!product) return null;
        return (
          <div className="flex items-center justify-end gap-1.5 h-full">
            <button
              onClick={() => handleOpenEditModal(product)}
              className="p-1.5 text-slate-550 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => handleDeleteProduct(product.id)}
              className="p-1.5 text-red-500 hover:text-red-755 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      }
    }
  ];
  
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState(''); // 'low' | 'out' | ''

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      popular: false,
      bestSeller: false,
      newArrival: false,
      featured: false,
      specs: [{ key: '', value: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specs' as any
  });

  // Calculate discount automatically from price / originalPrice
  const watchPrice = watch('price');
  const watchOriginalPrice = watch('originalPrice');

  useEffect(() => {
    if (watchPrice && watchOriginalPrice && watchOriginalPrice > watchPrice) {
      const percentage = Math.round(((watchOriginalPrice - watchPrice) / watchOriginalPrice) * 100);
      setValue('discount', Math.min(100, Math.max(0, percentage)));
    }
  }, [watchPrice, watchOriginalPrice, setValue]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      productService.getProducts({ limit: 100 }), // fetch all for list
      productService.getCategories()
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.products);
      setCategories(catRes);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    reset({
      name: '',
      brand: '',
      sku: '',
      price: 0,
      originalPrice: 0,
      discount: 0,
      stock: 10,
      category: '',
      image: '',
      description: '',
      popular: false,
      bestSeller: false,
      newArrival: true,
      featured: false,
      specs: [{ key: 'Warranty', value: '1 Year Manufacturer' }]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      brand: product.brand,
      sku: product.sku,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      stock: product.stock,
      category: product.category,
      image: product.image,
      description: product.description,
      popular: product.popular,
      bestSeller: product.bestSeller,
      newArrival: product.newArrival,
      featured: product.featured,
      specs: product.specs && product.specs.length > 0 ? product.specs : [{ key: '', value: '' }]
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    try {
      const payload = {
        ...values,
        images: [values.image],
        tags: [values.brand, values.category]
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload as any);
        toast.success('Product updated successfully!');
      } else {
        await productService.createProduct(payload as any);
        toast.success('Product created successfully!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        toast.success('Product deleted successfully!');
        loadData();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete product');
      }
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'out') {
      matchesStock = p.stock === 0;
    } else if (stockFilter === 'low') {
      matchesStock = p.stock > 0 && p.stock < 15;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Products Inventory</h1>
          <p className="text-sm text-slate-400">Total catalog: {products.length} products</p>
        </div>
        <Button onClick={handleOpenAddModal} leftIcon={<Plus size={16} />}>
          Add Product
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700/80 rounded-xl shadow-sm">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search SKU, name, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm py-2 pl-9 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        
        {/* Category Select */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm px-3 py-2 rounded-lg text-slate-650 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Stock Level Select */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm px-3 py-2 rounded-lg text-slate-650 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Stock Levels</option>
          <option value="low">Low Stock (&lt; 15)</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Table list */}
      {loading ? (
        <div className="space-y-3">
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
              rowData={filteredProducts}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 25, 50]}
              domLayout="normal"
              rowHeight={56}
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

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Product Name" placeholder="e.g. Apollo headphones" error={errors.name?.message} {...register('name')} />
            <Input label="Brand Name" placeholder="e.g. AeroSound" error={errors.brand?.message} {...register('brand')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input label="SKU Code" placeholder="e.g. AE-AP-100" error={errors.sku?.message} {...register('sku')} />
            <Input
              label="Original Retail Price ($)"
              type="number"
              step="0.01"
              error={errors.originalPrice?.message}
              {...register('originalPrice', { valueAsNumber: true })}
            />
            <Input
              label="Discount Selling Price ($)"
              type="number"
              step="0.01"
              error={errors.price?.message}
              {...register('price', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Category Selection
              </label>
              <select
                className="w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none dark:text-slate-100"
                {...register('category')}
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              {errors.category && (
                <span className="text-xs text-red-500 mt-0.5">{errors.category.message}</span>
              )}
            </div>

            <Input
              label="Inventory Level"
              type="number"
              error={errors.stock?.message}
              {...register('stock', { valueAsNumber: true })}
            />

            <Input
              label="Auto-Calculated Discount (%)"
              type="number"
              disabled
              error={errors.discount?.message}
              {...register('discount', { valueAsNumber: true })}
            />
          </div>

          <Input label="Visual Image URL" placeholder="https://images.unsplash.com/..." error={errors.image?.message} {...register('image')} />

          <Input
            label="Product Description"
            textarea
            rows={4}
            placeholder="Detailed overview specifications..."
            error={errors.description?.message}
            {...register('description')}
          />

          {/* Toggle Flags */}
          <div className="border border-slate-100 dark:border-slate-750 p-4 rounded-xl flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-primary focus:ring-primary/40" {...register('popular')} />
              Popular
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-primary focus:ring-primary/40" {...register('bestSeller')} />
              Best Seller
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-primary focus:ring-primary/40" {...register('newArrival')} />
              New Arrival
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-primary focus:ring-primary/40" {...register('featured')} />
              Featured Product
            </label>
          </div>

          {/* Technical Specs Array */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specifications</h4>
              <button
                type="button"
                onClick={() => append({ key: '', value: '' })}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                <PlusCircle size={14} /> Add Spec row
              </button>
            </div>
            
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2.5 items-center">
                  <input
                    placeholder="e.g. Color"
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none dark:text-slate-100"
                    {...register(`specs.${idx}.key` as const)}
                  />
                  <input
                    placeholder="e.g. Carbon Black"
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none dark:text-slate-100"
                    {...register(`specs.${idx}.value` as const)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <MinusCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
