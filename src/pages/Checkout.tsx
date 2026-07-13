import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShoppingBag, CreditCard, Award, ArrowLeft, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { orderService } from '../services/orderService';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

// Checkout Validation Schema
const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(6, 'Phone number is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State / Province is required'),
  postalCode: z.string().min(1, 'Postal Code is required'),
  country: z.string().min(1, 'Country is required'),
  
  sameAsShipping: z.boolean().default(true),
  
  // Optional billing overrides (validated conditionally)
  billingFirstName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingAddressLine1: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCountry: z.string().optional(),
  
  paymentMethod: z.enum(['credit_card', 'paypal', 'cash_on_delivery']).default('credit_card'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items: cartItems, getTotals, clearCart, appliedCoupon } = useCartStore();

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const totals = getTotals();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: {
      firstName: user?.name.split(' ')[0] || '',
      lastName: user?.name.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      sameAsShipping: true,
      paymentMethod: 'credit_card',
    },
  });

  const watchSameAsShipping = watch('sameAsShipping');
  const watchPaymentMethod = watch('paymentMethod');

  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const shippingAddress = {
        id: `addr-${Date.now()}-ship`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      };

      const billingAddress = data.sameAsShipping
        ? shippingAddress
        : {
            id: `addr-${Date.now()}-bill`,
            firstName: data.billingFirstName || data.firstName,
            lastName: data.billingLastName || data.lastName,
            email: data.email,
            phone: data.phone,
            addressLine1: data.billingAddressLine1 || data.addressLine1,
            city: data.billingCity || data.city,
            state: data.billingState || data.state,
            postalCode: data.billingPostalCode || data.postalCode,
            country: data.billingCountry || data.country,
          };

      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        image: item.product.image,
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      }));

      const newOrder = await orderService.createOrder({
        customerId: user?.id || 'guest',
        customerName: `${data.firstName} ${data.lastName}`,
        customerEmail: data.email,
        items: orderItems,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        shippingAddress,
        billingAddress,
        paymentMethod: data.paymentMethod,
      });

      toast.success('Order placed successfully!');
      clearCart();
      
      // Redirect to Account / Orders listing
      navigate('/account');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center gap-3">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white font-heading">No items to checkout</h2>
        <Link to="/products">
          <Button size="sm" className="font-bold">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-5">
        <Link to="/cart" className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white">Shipping &amp; Checkout</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Shipping / Billing Forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Shipping Address */}
          <Card className="p-6 flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-50 pb-3 flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" /> Delivery Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="First Name" placeholder="Jane" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name" placeholder="Doe" error={errors.lastName?.message} {...register('lastName')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Email Address" placeholder="jane@example.com" error={errors.email?.message} {...register('email')} />
              <Input label="Phone Contact" placeholder="+357 99 123456" error={errors.phone?.message} {...register('phone')} />
            </div>

            <Input label="Address Line 1" placeholder="Street name and number" error={errors.addressLine1?.message} {...register('addressLine1')} />
            <Input label="Address Line 2 (Optional)" placeholder="Apt, Suite, Unit" error={errors.addressLine2?.message} {...register('addressLine2')} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <Input label="City" placeholder="Limassol" error={errors.city?.message} {...register('city')} className="md:col-span-2" />
              <Input label="State" placeholder="Limassol" error={errors.state?.message} {...register('state')} />
              <Input label="Postal Code" placeholder="3010" error={errors.postalCode?.message} {...register('postalCode')} />
            </div>

            <Input label="Country" placeholder="Cyprus" error={errors.country?.message} {...register('country')} />
          </Card>

          {/* Billing Address overrides */}
          <Card className="p-6 flex flex-col gap-5">
            <label className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-primary focus:ring-primary/40 w-4 h-4"
                {...register('sameAsShipping')}
              />
              Billing Address Same as Shipping
            </label>

            {!watchSameAsShipping && (
              <div className="flex flex-col gap-4 mt-2 border-t border-slate-50 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Billing First Name" placeholder="Jane" error={errors.billingFirstName?.message} {...register('billingFirstName')} />
                  <Input label="Billing Last Name" placeholder="Doe" error={errors.billingLastName?.message} {...register('billingLastName')} />
                </div>
                
                <Input label="Billing Address" placeholder="Street address" error={errors.billingAddressLine1?.message} {...register('billingAddressLine1')} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Input label="City" placeholder="Nicosia" error={errors.billingCity?.message} {...register('billingCity')} />
                  <Input label="State" placeholder="Nicosia" error={errors.billingState?.message} {...register('billingState')} />
                  <Input label="Postal Code" placeholder="1010" error={errors.billingPostalCode?.message} {...register('billingPostalCode')} />
                </div>

                <Input label="Country" placeholder="Cyprus" error={errors.billingCountry?.message} {...register('billingCountry')} />
              </div>
            )}
          </Card>

          {/* Payment Method */}
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-50 pb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-primary" /> Payment Method
            </h3>

            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-3.5 border border-slate-250 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50/50 transition-colors">
                <span className="flex items-center gap-2.5 text-xs font-bold">
                  <input type="radio" value="credit_card" className="text-primary focus:ring-primary/45" {...register('paymentMethod')} />
                  Credit / Debit Card
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visa, Mastercard</span>
              </label>

              <label className="flex items-center justify-between p-3.5 border border-slate-250 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50/50 transition-colors">
                <span className="flex items-center gap-2.5 text-xs font-bold">
                  <input type="radio" value="paypal" className="text-primary focus:ring-primary/45" {...register('paymentMethod')} />
                  PayPal Express Checkout
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PayPal Balance</span>
              </label>

              <label className="flex items-center justify-between p-3.5 border border-slate-250 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50/50 transition-colors">
                <span className="flex items-center gap-2.5 text-xs font-bold">
                  <input type="radio" value="cash_on_delivery" className="text-primary focus:ring-primary/45" {...register('paymentMethod')} />
                  Cash on Delivery
                </span>
                <Badge variant="warning" className="text-[9px]">COD</Badge>
              </label>
            </div>

            {watchPaymentMethod === 'credit_card' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl flex gap-3 text-xs leading-relaxed text-slate-500 font-semibold mt-2">
                <Award size={18} className="text-primary flex-shrink-0" />
                <span>Simulated gateway active. Checkouts processed successfully without real cards.</span>
              </div>
            )}
          </Card>

        </div>

        {/* Right Side: Order summary breakdown */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-50 pb-3">
              Order Review ({cartCount} items)
            </h3>

            {/* Cart items list */}
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-2.5 pb-2.5 border-b border-slate-50 last:border-0 last:pb-0">
                  <img src={item.product.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-slate-50" />
                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {item.product.name}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      Qty: {item.quantity} {item.selectedColor && ` / Color: ${item.selectedColor}`}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing details */}
            <div className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-455 border-t border-slate-100 dark:border-slate-700 pt-4 font-semibold">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800 dark:text-white">${totals.subtotal.toFixed(2)}</span>
              </div>
              
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount:</span>
                  <span className="font-bold">-${totals.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Tax (8%):</span>
                <span className="font-bold text-slate-800 dark:text-white">${totals.tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Fees:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-4 font-extrabold text-base text-slate-850 dark:text-white">
              <span>Total Amount</span>
              <span className="text-primary text-lg">${totals.total.toFixed(2)}</span>
            </div>

            <Button
              type="submit"
              disabled={checkoutLoading}
              isLoading={checkoutLoading}
              className="w-full font-bold py-2.5 mt-2"
            >
              Complete Checkout
            </Button>
          </Card>
        </div>

      </form>

    </div>
  );
}
