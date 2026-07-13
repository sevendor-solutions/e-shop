import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, Ticket, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { productService } from '../services/productService';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export default function Cart() {
  const navigate = useNavigate();
  const {
    items: cartItems,
    getTotals,
    updateQuantity,
    removeItem,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const totals = getTotals();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a coupon code.');
      return;
    }

    setCouponLoading(true);
    try {
      const couponObj = await productService.validateCoupon(code, totals.subtotal);
      applyCoupon(couponObj);
      toast.success(`Coupon ${code} applied successfully!`);
      setCouponCode('');
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Coupon removed.');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <ShoppingCart size={36} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-450 max-w-sm">Add some items from our product catalog to get started.</p>
        <Link to="/products">
          <Button size="sm" className="font-bold mt-2">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
          <ShoppingCart className="text-primary" size={24} /> Shopping Cart
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-500 hover:text-red-750 hover:underline uppercase"
        >
          Clear Cart
        </button>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Cart Items list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartItems.map((item) => {
            const key = `${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
            return (
              <Card key={key} className="p-4 flex flex-col sm:flex-row gap-4 items-center relative">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-xl bg-slate-50 border border-slate-100 dark:border-slate-750"
                />

                <div className="flex-1 flex flex-col gap-1.5 min-w-0 text-center sm:text-left">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">
                    {item.product.brand}
                  </span>
                  <Link
                    to={`/product/${item.product.id}`}
                    className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-primary transition-colors truncate"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-[10px] text-slate-450">
                    {item.selectedColor && `Color: ${item.selectedColor}`}
                    {item.selectedColor && item.selectedSize && ' / '}
                    {item.selectedSize && `Size: ${item.selectedSize}`}
                  </p>
                </div>

                {/* Price and Quantities adjustment */}
                <div className="flex items-center gap-6 flex-wrap justify-center">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 font-bold"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-extrabold text-slate-850 dark:text-white">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                    
                    <button
                      onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                      className="p-1.5 text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-700 pb-3">
              Order Summary
            </h3>

            {/* Calculations breakdown */}
            <div className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-bold text-slate-800 dark:text-white">${totals.subtotal.toFixed(2)}</span>
              </div>
              
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Coupon Discount:</span>
                  <span className="font-bold">-${totals.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-bold text-slate-800 dark:text-white">${totals.tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Fees</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {totals.shipping === 0 ? (
                    <span className="text-emerald-500 font-extrabold">FREE</span>
                  ) : (
                    `$${totals.shipping.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            {/* Free shipping progress bar */}
            {totals.subtotal < 150 ? (
              <div className="p-3 bg-blue-50/50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-xl text-[10px] flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>Add <strong>${(150 - totals.subtotal).toFixed(2)}</strong> more to get Free Shipping!</span>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-[10px] flex items-center gap-2 text-emerald-650 dark:text-emerald-400 font-semibold">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>Congratulations! Your order qualifies for <strong>Free Shipping</strong>.</span>
              </div>
            )}

            {/* Applied coupon alert */}
            {appliedCoupon && (
              <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-650 dark:text-emerald-450 font-bold">
                <span className="flex items-center gap-1">
                  <Ticket size={14} /> Coupon applied: {appliedCoupon.code}
                </span>
                <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-750 underline">
                  Remove
                </button>
              </div>
            )}

            {/* Grand Total */}
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-4 mt-1 font-extrabold text-base text-slate-850 dark:text-white">
              <span>Grand Total</span>
              <span className="text-primary text-lg">${totals.total.toFixed(2)}</span>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              rightIcon={<ArrowRight size={14} />}
              className="w-full font-bold py-2.5 mt-2"
            >
              Proceed to Checkout
            </Button>
          </Card>

          {/* Coupon Code input form */}
          {!appliedCoupon && (
            <Card className="p-5">
              <form onSubmit={handleApplyCoupon} className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Promo / Coupon Code
                </span>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    containerClassName="flex-grow"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    disabled={couponLoading}
                    className="font-bold flex-shrink-0 self-end h-[38px]"
                  >
                    Apply
                  </Button>
                </div>
              </form>
            </Card>
          )}

        </div>

      </div>

    </div>
  );
}
