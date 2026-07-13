import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Eye, Download, Printer, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useThemeStore } from '../store/themeStore';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, ColDef } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AdminOrders() {
  const { theme } = useThemeStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  const [statusFilter, setStatusFilter] = useState('');

  const columnDefs: ColDef<Order>[] = [
    {
      headerName: 'Order ID',
      field: 'orderNumber',
      width: 120,
      minWidth: 100,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full font-bold text-slate-800 dark:text-slate-200">
            {params.value}
          </div>
        );
      }
    },
    {
      headerName: 'Date',
      field: 'date',
      width: 120,
      minWidth: 100,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full text-slate-550 dark:text-slate-400">
            {params.value}
          </div>
        );
      }
    },
    {
      headerName: 'Customer',
      field: 'customerName',
      flex: 1.2,
      minWidth: 180,
      cellRenderer: (params: any) => {
        const o = params.data;
        if (!o) return null;
        return (
          <div className="flex flex-col justify-center leading-tight py-1 h-full">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{o.customerName}</span>
            <span className="text-[10px] text-slate-455">{o.customerEmail}</span>
          </div>
        );
      }
    },
    {
      headerName: 'Items',
      field: 'items',
      width: 100,
      minWidth: 90,
      cellRenderer: (params: any) => {
        const items = params.value || [];
        const itemsCount = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
        return (
          <div className="flex items-center h-full font-mono font-bold">
            {itemsCount} items
          </div>
        );
      }
    },
    {
      headerName: 'Total',
      field: 'total',
      width: 110,
      minWidth: 100,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full font-extrabold text-slate-850 dark:text-white">
            ${params.value.toFixed(2)}
          </div>
        );
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 120,
      minWidth: 110,
      cellRenderer: (params: any) => {
        const val = params.value;
        return (
          <div className="flex items-center h-full">
            <Badge
              variant={
                val === 'delivered'
                  ? 'success'
                  : val === 'processing'
                  ? 'info'
                  : val === 'pending'
                  ? 'warning'
                  : 'danger'
              }
            >
              {val}
            </Badge>
          </div>
        );
      }
    },
    {
      headerName: 'Payment',
      field: 'paymentStatus',
      width: 110,
      minWidth: 100,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full">
            <Badge variant={params.value === 'paid' ? 'success' : 'danger'}>
              {params.value}
            </Badge>
          </div>
        );
      }
    },
    {
      headerName: 'Actions',
      field: 'id',
      width: 90,
      minWidth: 80,
      sortable: false,
      filter: false,
      cellClass: 'flex justify-end',
      cellRenderer: (params: any) => {
        const o = params.data;
        if (!o) return null;
        return (
          <div className="flex items-center justify-end gap-1.5 h-full">
            <button
              onClick={() => handleOpenDetails(o)}
              className="p-1.5 text-slate-550 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              title="View Details"
            >
              <Eye size={13} />
            </button>
          </div>
        );
      }
    }
  ];
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    orderService.getAllOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      let paymentStatus: Order['paymentStatus'] | undefined;
      if (status === 'delivered') {
        paymentStatus = 'paid';
      }
      
      const updated = await orderService.updateOrderStatus(orderId, status, paymentStatus);
      
      // Update local states
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      
      toast.success(`Order status updated to ${status}!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = !statusFilter || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Orders Management</h1>
        <p className="text-sm text-slate-400">Process user shipments, receipts, invoices and returns.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700/80 rounded-xl shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search Order Number, Customer, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm py-2 pl-9 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm px-3 py-2 rounded-lg text-slate-655 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Grid list table */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton height={40} />
          <Skeleton height={200} />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden p-4">
          <div 
            className={theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'} 
            style={{ height: '480px', width: '100%', '--ag-font-family': 'Outfit, sans-serif' } as React.CSSProperties}
          >
            <AgGridReact
              rowData={filteredOrders}
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
                flex: 1,
                minWidth: 100
              }}
            />
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={`Invoice ${selectedOrder.orderNumber}`}
          size="lg"
        >
          {/* Printable Invoice Container */}
          <div id="printable-invoice" className="flex flex-col gap-6 text-sm text-slate-750 dark:text-slate-350">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row justify-between border-b border-slate-100 dark:border-slate-700 pb-5 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-extrabold text-primary">ESHOP INTERNATIONAL</span>
                <span className="text-xs text-slate-400">101 Digital Ave, Limassol, Cyprus</span>
                <span className="text-xs text-slate-400">Phone: +357 25 123456</span>
              </div>
              <div className="flex flex-col items-start sm:items-end text-xs gap-1">
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Invoice Receipt
                </span>
                <span>Date: <strong>{selectedOrder.date}</strong></span>
                <span>Payment: <strong className="uppercase">{selectedOrder.paymentMethod.replace(/_/g, ' ')}</strong></span>
                <span>Status: <strong className="uppercase">{selectedOrder.status}</strong></span>
              </div>
            </div>

            {/* Billing addresses split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                <span className="font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Billing To
                </span>
                <strong className="text-slate-850 dark:text-slate-100">
                  {selectedOrder.billingAddress.firstName} {selectedOrder.billingAddress.lastName}
                </strong>
                <span>{selectedOrder.billingAddress.addressLine1}</span>
                {selectedOrder.billingAddress.addressLine2 && <span>{selectedOrder.billingAddress.addressLine2}</span>}
                <span>
                  {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.postalCode}
                </span>
                <span>{selectedOrder.billingAddress.country}</span>
                <span>{selectedOrder.billingAddress.phone}</span>
              </div>

              <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                <span className="font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Shipping To
                </span>
                <strong className="text-slate-850 dark:text-slate-100">
                  {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                </strong>
                <span>{selectedOrder.shippingAddress.addressLine1}</span>
                {selectedOrder.shippingAddress.addressLine2 && <span>{selectedOrder.shippingAddress.addressLine2}</span>}
                <span>
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                </span>
                <span>{selectedOrder.shippingAddress.country}</span>
                <span>{selectedOrder.shippingAddress.phone}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-slate-100 dark:border-slate-700/80 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-850 dark:text-slate-200">{item.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {item.selectedColor && `Color: ${item.selectedColor}`}
                            {item.selectedColor && item.selectedSize && ' / '}
                            {item.selectedSize && `Size: ${item.selectedSize}`}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right font-medium">${item.price.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total summaries split */}
            <div className="flex justify-end text-xs">
              <div className="w-56 flex flex-col gap-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Subtotal:</span>
                  <span className="font-bold">${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount:</span>
                    <span className="font-bold">-${selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Tax:</span>
                  <span className="font-bold">${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Shipping:</span>
                  <span className="font-bold">
                    {selectedOrder.shipping === 0 ? 'FREE' : `$${selectedOrder.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-750 pt-2 font-extrabold text-sm text-primary">
                  <span>Grand Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status updates action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
              <div className="flex gap-2">
                <Button
                  onClick={handlePrintInvoice}
                  variant="outline"
                  size="xs"
                  leftIcon={<Printer size={12} />}
                >
                  Print Invoice
                </Button>
              </div>

              {/* Status adjust buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedOrder.status === 'pending' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                    size="xs"
                    leftIcon={<AlertCircle size={12} />}
                  >
                    Accept Order
                  </Button>
                )}
                
                {selectedOrder.status === 'processing' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                    size="xs"
                    leftIcon={<Truck size={12} />}
                  >
                    Ship Package
                  </Button>
                )}

                {selectedOrder.status === 'shipped' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                    size="xs"
                    leftIcon={<CheckCircle size={12} />}
                  >
                    Mark Delivered
                  </Button>
                )}

                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                    variant="danger"
                    size="xs"
                    leftIcon={<XCircle size={12} />}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
