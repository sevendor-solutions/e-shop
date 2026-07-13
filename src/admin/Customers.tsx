import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ToggleLeft, ToggleRight, MapPin, Mail, Phone, Calendar, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { Customer } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { useThemeStore } from '../store/themeStore';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, ColDef } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AdminCustomers() {
  const { theme } = useThemeStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  const columnDefs: ColDef<Customer>[] = [
    {
      headerName: 'Customer Details',
      field: 'name',
      flex: 1.5,
      cellRenderer: (params: any) => {
        const c = params.data;
        if (!c) return null;
        return (
          <div className="flex items-center gap-3 h-full py-1">
            <img
              src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}
              alt={c.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
            />
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{c.name}</span>
              <span className="text-[10px] text-slate-450">{c.email}</span>
            </div>
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
      headerName: 'Total Orders',
      field: 'totalOrders',
      width: 140,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full font-mono font-bold">
            {params.value} checkouts
          </div>
        );
      }
    },
    {
      headerName: 'Total Spent',
      field: 'totalSpent',
      width: 120,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full font-extrabold text-slate-800 dark:text-white">
            ${params.value.toFixed(2)}
          </div>
        );
      }
    },
    {
      headerName: 'Actions',
      field: 'id',
      width: 150,
      sortable: false,
      filter: false,
      cellClass: 'flex justify-end',
      cellRenderer: (params: any) => {
        const c = params.data;
        if (!c) return null;
        return (
          <div className="flex items-center justify-end gap-2 h-full">
            <Button size="xs" variant="outline" onClick={() => handleOpenDetails(c)}>
              View Info
            </Button>
            <button
              onClick={() => handleToggleStatus(c)}
              className="p-1 rounded text-slate-400 hover:text-slate-650 transition-colors"
              title={c.status === 'active' ? 'Suspend Account' : 'Activate Account'}
            >
              {c.status === 'active' ? (
                <ToggleRight size={24} className="text-emerald-500" />
              ) : (
                <ToggleLeft size={24} className="text-slate-400" />
              )}
            </button>
          </div>
        );
      }
    }
  ];
  
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadCustomers = () => {
    setLoading(true);
    adminService.getCustomers().then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleToggleStatus = async (cust: Customer) => {
    const nextStatus: Customer['status'] = cust.status === 'active' ? 'suspended' : 'active';
    try {
      const updated = await adminService.updateCustomerStatus(cust.id, nextStatus);
      setCustomers(customers.map(c => c.id === cust.id ? updated : c));
      if (selectedCust && selectedCust.id === cust.id) {
        setSelectedCust(updated);
      }
      toast.success(`Account status for ${cust.name} updated to ${nextStatus}!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleOpenDetails = (cust: Customer) => {
    setSelectedCust(cust);
    setIsDetailsOpen(true);
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Customers Database</h1>
        <p className="text-sm text-slate-400">Review buyer accounts, order transactions, and status constraints.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700/80 rounded-xl shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm py-2 pl-9 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
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
            style={{ height: '450px', width: '100%', '--ag-font-family': 'Outfit, sans-serif' } as React.CSSProperties}
          >
            <AgGridReact
              rowData={filtered}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
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

      {/* Details Profile Overlay */}
      {selectedCust && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title="Customer Profile Info"
          size="md"
        >
          <div className="flex flex-col gap-6 text-sm text-slate-700 dark:text-slate-350">
            {/* Header info */}
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-750 pb-5">
              <img
                src={selectedCust.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}
                alt={selectedCust.name}
                className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {selectedCust.name}
                </span>
                <span className="text-xs text-slate-400">{selectedCust.email}</span>
                <Badge variant={selectedCust.status === 'active' ? 'success' : 'danger'} className="w-fit text-[9px] py-0">
                  {selectedCust.status}
                </Badge>
              </div>
            </div>

            {/* Quick KPIs stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Orders</span>
                <strong className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">
                  {selectedCust.totalOrders}
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Spent</span>
                <strong className="text-lg font-extrabold text-primary mt-1">
                  ${selectedCust.totalSpent.toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Address specifications list */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Registered Addresses ({selectedCust.addresses.length})
              </h4>
              
              {selectedCust.addresses.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No addresses saved.</span>
              ) : (
                selectedCust.addresses.map((addr) => (
                  <div key={addr.id} className="border border-slate-100 dark:border-slate-700/60 p-3 rounded-xl flex gap-3 text-xs">
                    <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {addr.firstName} {addr.lastName} {addr.isDefault && <Badge variant="primary" className="text-[8px] py-0 ml-1">Default</Badge>}
                      </span>
                      <span>{addr.addressLine1}</span>
                      {addr.addressLine2 && <span>{addr.addressLine2}</span>}
                      <span>
                        {addr.city}, {addr.state} {addr.postalCode}
                      </span>
                      <span>{addr.country}</span>
                      <span className="mt-1 font-semibold">Phone: {addr.phone}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Profile dates */}
            <div className="flex flex-col gap-2 text-xs border-t border-slate-100 dark:border-slate-750 pt-4 text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar size={14} /> Registered: <strong>{selectedCust.createdAt}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} /> Contact Phone: <strong>{selectedCust.phone || 'Not specified'}</strong>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 border-t border-slate-150 dark:border-slate-750 pt-4 mt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)}>
                Close Profile
              </Button>
              <Button
                variant={selectedCust.status === 'active' ? 'danger' : 'primary'}
                size="sm"
                onClick={() => handleToggleStatus(selectedCust)}
              >
                {selectedCust.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
