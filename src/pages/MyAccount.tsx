import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User as UserIcon, ShoppingBag, MapPin, Eye, Calendar, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { Order, Address } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';

const profileSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function MyAccount() {
  const { user, token, updateUser } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('orders');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema)
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.permissions?.[0] || '' // Mock phone lookup or empty
      });
      
      // Fetch orders
      setOrdersLoading(true);
      orderService.getOrdersByCustomerId(user.id).then((data) => {
        setOrders(data);
        setOrdersLoading(false);
      });
    }
  }, [user, reset]);

  const handleUpdateProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    try {
      const updated = await authService.updateProfile(user.id, values as any);
      updateUser(updated);
      toast.success('Profile details saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes');
    }
  };

  const handleOpenInvoice = (order: Order) => {
    setSelectedOrder(order);
    setIsInvoiceOpen(true);
  };

  const mockAddresses: Address[] = [
    {
      id: 'addr-default',
      firstName: user?.name.split(' ')[0] || 'Arthur',
      lastName: user?.name.split(' ').slice(1).join(' ') || 'Pendelton',
      email: user?.email || 'customer@eshop.com',
      phone: '+357 99 123456',
      addressLine1: '12 Franklin Street',
      city: 'Limassol',
      state: 'Limassol',
      postalCode: '3012',
      country: 'Cyprus',
      isDefault: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 items-start">
      
      {/* Left Navigation Bar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {user?.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.name}</span>
            <span className="text-[10px] text-slate-400 capitalize">{user?.role} Portal</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
              activeTab === 'orders' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
            }`}
          >
            <ShoppingBag size={15} /> Order History
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
              activeTab === 'profile' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
            }`}
          >
            <UserIcon size={15} /> Personal Details
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
              activeTab === 'addresses' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
            }`}
          >
            <MapPin size={15} /> Address Book
          </button>
        </nav>
      </aside>

      {/* Right Dynamic Content panel */}
      <section className="flex-1 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-6 sm:p-8 rounded-2xl shadow-xs min-h-[400px]">
        
        {/* Dynamic tabs renders */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-50 dark:border-slate-700 pb-3">
              <h2 className="text-base font-extrabold text-slate-850 dark:text-white">Profile Details</h2>
              <p className="text-xs text-slate-400">Update your email, name and contact phone details.</p>
            </div>
            
            <form onSubmit={handleSubmit(handleUpdateProfileSubmit)} className="flex flex-col gap-5 max-w-lg">
              <Input label="Full Name" error={errors.name?.message} {...register('name')} />
              <Input label="Email Address" error={errors.email?.message} {...register('email')} />
              <Input label="Phone Contact" placeholder="+357 99 123456" error={errors.phone?.message} {...register('phone')} />
              
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={!isDirty} size="sm">
                  Save Details
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-slate-50 dark:border-slate-700 pb-3">
              <h2 className="text-base font-extrabold text-slate-850 dark:text-white">Order History</h2>
              <p className="text-xs text-slate-400 font-medium">Track your shipping stages and receipt invoices.</p>
            </div>

            {ordersLoading ? (
              <div className="space-y-3">
                <Skeleton height={50} />
                <Skeleton height={50} />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6">You have not placed any orders yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((o) => {
                  const qty = o.items.reduce((sum, item) => sum + item.quantity, 0);
                  return (
                    <Card key={o.id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-750 text-slate-400">
                          <ShoppingBag size={18} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-850 dark:text-slate-205">{o.orderNumber}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar size={10} /> {o.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 flex-wrap justify-between sm:justify-end w-full sm:w-auto">
                        <div className="flex flex-col items-start sm:items-end">
                          <span className="text-xs font-bold text-slate-850 dark:text-white">${o.total.toFixed(2)}</span>
                          <span className="text-[9px] text-slate-455 font-semibold uppercase">{qty} Items</span>
                        </div>

                        <Badge
                          variant={
                            o.status === 'delivered'
                              ? 'success'
                              : o.status === 'processing'
                              ? 'info'
                              : o.status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {o.status}
                        </Badge>

                        <Button size="xs" variant="outline" onClick={() => handleOpenInvoice(o)} leftIcon={<Eye size={12} />}>
                          View Invoice
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-slate-50 dark:border-slate-700 pb-3">
              <h2 className="text-base font-extrabold text-slate-850 dark:text-white">Address Book</h2>
              <p className="text-xs text-slate-400">Manage default shipping destinations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockAddresses.map((addr) => (
                <Card key={addr.id} className="p-4 border-l-4 border-l-primary flex gap-3 text-xs leading-relaxed text-slate-550 dark:text-slate-400 relative">
                  <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 mb-1">
                      {addr.firstName} {addr.lastName}
                      {addr.isDefault && <Badge variant="primary" className="text-[8px] py-0">Default</Badge>}
                    </span>
                    <span>{addr.addressLine1}</span>
                    <span>{addr.city}, {addr.state} {addr.postalCode}</span>
                    <span>{addr.country}</span>
                    <span className="font-semibold mt-1">Phone: {addr.phone}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* Invoice Modal Overlay */}
      {selectedOrder && (
        <Modal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          title={`Invoice ${selectedOrder.orderNumber}`}
          size="lg"
        >
          {/* Printable Invoice Container */}
          <div id="printable-invoice" className="flex flex-col gap-6 text-sm text-slate-750 dark:text-slate-350">
            {/* Header */}
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-extrabold text-primary">ESHOP CO.</span>
                <span className="text-xs text-slate-400">101 Digital Ave, Limassol, Cyprus</span>
              </div>
              <div className="flex flex-col items-end text-xs gap-1">
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase">
                  Invoice
                </span>
                <span>Date: <strong>{selectedOrder.date}</strong></span>
                <span>Payment: <strong className="uppercase">{selectedOrder.paymentMethod.replace(/_/g, ' ')}</strong></span>
              </div>
            </div>

            {/* Address grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                <span className="font-bold text-slate-400 uppercase tracking-wider mb-1">Shipping To</span>
                <strong className="text-slate-800 dark:text-white">
                  {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                </strong>
                <span>{selectedOrder.shippingAddress.addressLine1}</span>
                <span>
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                </span>
                <span>{selectedOrder.shippingAddress.country}</span>
              </div>
              
              <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                <span className="font-bold text-slate-400 uppercase tracking-wider mb-1">Billing To</span>
                <strong className="text-slate-800 dark:text-white">
                  {selectedOrder.billingAddress.firstName} {selectedOrder.billingAddress.lastName}
                </strong>
                <span>{selectedOrder.billingAddress.addressLine1}</span>
                <span>
                  {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.postalCode}
                </span>
                <span>{selectedOrder.billingAddress.country}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
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
                        <span className="font-bold text-slate-850 dark:text-slate-202">{item.name}</span>
                      </td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end text-xs">
              <div className="w-56 flex flex-col gap-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-bold">${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount:</span>
                    <span className="font-bold">-${selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax:</span>
                  <span className="font-bold">${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-850 pt-2 font-bold text-primary">
                  <span>Total Paid:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button size="xs" variant="outline" onClick={() => window.print()} leftIcon={<Printer size={12} />}>
                Print Receipt
              </Button>
              <Button size="xs" onClick={() => setIsInvoiceOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
