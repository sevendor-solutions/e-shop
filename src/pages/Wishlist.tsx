import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '../store/wishlistStore';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';

export default function Wishlist() {
  const { items: wishlistItems, clearWishlist } = useWishlistStore();

  const handleClearWishlist = () => {
    if (window.confirm('Clear all items from your wishlist?')) {
      clearWishlist();
      toast.success('Wishlist cleared.');
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <Heart size={32} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Your Wishlist is Empty</h2>
        <p className="text-xs text-slate-450 max-w-sm">Tap the heart icon on product cards to save items here.</p>
        <Link to="/products">
          <Button size="sm" className="font-bold mt-2">
            Continue Browsing
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
          <Heart className="text-primary" size={24} fill="currentColor" /> My Wishlist
        </h1>
        <button
          onClick={handleClearWishlist}
          className="text-xs font-bold text-slate-450 hover:text-red-500 hover:underline uppercase flex items-center gap-1"
        >
          <Trash2 size={14} /> Clear All
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
}
