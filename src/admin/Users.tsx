import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit2, Trash2, Key, Shield, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { User, UserRole } from '../types';
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

const userSchema = z.object({
  name: z.string().min(1, 'User Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'customer']),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  permissions: z.array(z.string()).default([]),
});

type UserFormValues = z.infer<typeof userSchema>;

const ALL_PERMISSIONS = [
  { value: 'products:read', label: 'View Products' },
  { value: 'products:write', label: 'Edit / Create Products' },
  { value: 'categories:read', label: 'View Categories' },
  { value: 'categories:write', label: 'Edit / Create Categories' },
  { value: 'orders:read', label: 'View Orders' },
  { value: 'orders:write', label: 'Manage Orders (Update Status)' },
  { value: 'coupons:read', label: 'View Coupons' },
  { value: 'coupons:write', label: 'Create / Edit Coupons' },
  { value: 'users:all', label: 'Admin / Full Permissions' }
];

export default function AdminUsers() {
  const { theme } = useThemeStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const columnDefs: ColDef<User>[] = [
    {
      headerName: 'Name / Email',
      field: 'name',
      flex: 1.2,
      cellRenderer: (params: any) => {
        const u = params.data;
        if (!u) return null;
        return (
          <div className="flex items-center gap-3 h-full py-1">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
              <UserIcon size={14} />
            </div>
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{u.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">{u.email}</span>
            </div>
          </div>
        );
      }
    },
    {
      headerName: 'Role',
      field: 'role',
      width: 110,
      cellRenderer: (params: any) => {
        const role = params.value;
        return (
          <div className="flex items-center h-full">
            <Badge variant={role === 'admin' ? 'danger' : role === 'manager' ? 'primary' : 'secondary'}>
              {role}
            </Badge>
          </div>
        );
      }
    },
    {
      headerName: 'Permissions',
      field: 'permissions',
      flex: 1.5,
      cellRenderer: (params: any) => {
        const u = params.data;
        if (!u) return null;
        return (
          <div className="flex flex-wrap gap-1 items-center h-full max-w-xs md:max-w-md py-1">
            {u.role === 'admin' ? (
              <Badge variant="danger" className="text-[8px] py-0 leading-normal">
                All Permissions
              </Badge>
            ) : u.permissions.length === 0 ? (
              <span className="text-slate-400 italic text-[11px]">No permissions set.</span>
            ) : (
              u.permissions.map((perm: string) => (
                <Badge key={perm} variant="secondary" className="text-[8px] py-0 leading-normal">
                  {perm}
                </Badge>
              ))
            )}
          </div>
        );
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 110,
      cellRenderer: (params: any) => {
        const status = params.value;
        return (
          <div className="flex items-center h-full">
            <Badge variant={status === 'active' ? 'success' : 'danger'}>
              {status}
            </Badge>
          </div>
        );
      }
    },
    {
      headerName: 'Actions',
      field: 'id',
      width: 100,
      sortable: false,
      filter: false,
      cellClass: 'flex justify-end',
      cellRenderer: (params: any) => {
        const u = params.data;
        if (!u) return null;
        return (
          <div className="flex items-center justify-end gap-1.5 h-full">
            <button
              onClick={() => handleOpenEditModal(u)}
              className="p-1.5 text-slate-550 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              title="Edit"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => handleDeleteUser(u.id)}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      }
    }
  ];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: { role: 'manager', status: 'active', permissions: [] }
  });

  const watchRole = watch('role');

  // Handle auto-permission assignment for admin
  useEffect(() => {
    if (watchRole === 'admin') {
      setValue('permissions', ['users:all']);
    }
  }, [watchRole, setValue]);

  const loadUsers = () => {
    setLoading(true);
    adminService.getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    reset({ name: '', email: '', role: 'manager', status: 'active', permissions: ['products:read', 'orders:read'] });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    reset({
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      permissions: u.permissions
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, values);
        toast.success('User updated successfully!');
      } else {
        await adminService.createUser(values);
        toast.success('New user profile created!');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === 'usr-1') {
      toast.error('System Administrator cannot be deleted.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(id);
        toast.success('User profile removed.');
        loadUsers();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Users & Roles</h1>
          <p className="text-sm text-slate-400">Configure administrative operators and managers permissions.</p>
        </div>
        <Button onClick={handleOpenAddModal} leftIcon={<Plus size={16} />}>
          Create User
        </Button>
      </div>

      {/* List Table */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton height={40} />
          <Skeleton height={200} />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden p-4">
          <div 
            className={theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'} 
            style={{ height: '400px', width: '100%', '--ag-font-family': 'Outfit, sans-serif' } as React.CSSProperties}
          >
            <AgGridReact
              rowData={users}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
              domLayout="normal"
              rowHeight={52}
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

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Roles' : 'Create User Account'}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <Input label="Name" placeholder="e.g. John Doe" error={errors.name?.message} {...register('name')} />
          <Input label="Email" placeholder="e.g. manager@eshop.com" error={errors.email?.message} {...register('email')} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                User Role
              </label>
              <select
                className="w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none dark:text-slate-100"
                {...register('role')}
              >
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </label>
              <select
                className="w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none dark:text-slate-100"
                {...register('status')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Permissions array checkboxes (only shown if not admin/customer) */}
          {watchRole === 'manager' && (
            <div className="flex flex-col gap-2 border border-slate-100 dark:border-slate-750 p-4 rounded-xl mt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Permissions Assignment
              </span>
              
              <div className="grid grid-cols-1 gap-2.5 max-h-40 overflow-y-auto pr-1">
                {ALL_PERMISSIONS.filter(p => p.value !== 'users:all').map((perm) => (
                  <label key={perm.value} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      value={perm.value}
                      className="rounded border-slate-300 text-primary focus:ring-primary/45"
                      {...register('permissions')}
                    />
                    {perm.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {watchRole === 'admin' && (
            <div className="p-3 bg-red-50/50 border border-red-200 text-red-700 text-xs rounded-xl flex gap-2 font-medium">
              <Shield size={16} className="flex-shrink-0" />
              <span>Administrators automatically receive full permission controls. No custom toggles are needed.</span>
            </div>
          )}

          {watchRole === 'customer' && (
            <div className="p-3 bg-blue-50/50 border border-blue-200 text-blue-700 text-xs rounded-xl flex gap-2 font-medium">
              <Key size={16} className="flex-shrink-0" />
              <span>Customers are limited to storefront shopping access and standard order profile directories.</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingUser ? 'Save Changes' : 'Create Operator'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
