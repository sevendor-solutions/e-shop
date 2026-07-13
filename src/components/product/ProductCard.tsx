import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { Rating } from '../ui/Rating';
import { Card } from '../ui/Card';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid' }) => {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if variants are present and pick default
    const size = product.variants?.sizes?.[0];
    const color = product.variants?.colors?.[0]?.name;
    
    addItem(product, 1, size, color);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (isWishlisted) {
      toast.success('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  if (layout === 'list') {
    return (
      <Card className="flex flex-col sm:flex-row gap-4 p-4 hover:shadow-md transition-shadow">
        <Link to={`/product/${product.id}`} className="w-full sm:w-44 h-44 flex-shrink-0 rounded-lg overflow-hidden relative bg-slate-50 border border-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.discount > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
              -{product.discount}%
            </span>
          )}
        </Link>

        <div className="flex-1 flex flex-col justify-between py-1 gap-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                {product.brand}
              </span>
              <Rating value={product.rating} size={13} />
            </div>

            <Link
              to={`/product/${product.id}`}
              className="text-base font-extrabold text-slate-800 dark:text-slate-100 hover:text-primary transition-colors line-clamp-1"
            >
              {product.name}
            </Link>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-primary">${product.price.toFixed(2)}</span>
              {product.discount > 0 && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleWishlist}
                className={`p-2 rounded-full border transition-colors ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-950/20'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-red-500 dark:bg-slate-900 dark:border-slate-750'
                }`}
                title="Wishlist"
              >
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              
              <button
                onClick={handleAddToCart}
                className="bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ShoppingCart size={14} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Standard Grid view
  return (
    <Card className="flex flex-col h-full group hover:shadow-md transition-shadow relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
      {/* Product Image and badges */}
      <Link
        to={`/product/${product.id}`}
        className="block relative aspect-square overflow-hidden bg-slate-50 border-b border-slate-50 dark:border-slate-700/40"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-350"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              -{product.discount}%
            </span>
          )}
          {product.newArrival && (
            <span className="bg-primary text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Quick action buttons (appears on hover) */}
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={handleToggleWishlist}
            className={`p-2.5 rounded-full shadow-lg transition-all duration-200 transform scale-90 group-hover:scale-100 ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white text-slate-700 hover:text-red-500 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          
          <Link
            to={`/product/${product.id}`}
            className="p-2.5 bg-white text-slate-700 hover:text-primary dark:bg-slate-800 dark:text-slate-200 rounded-full shadow-lg transition-transform duration-200 transform scale-90 group-hover:scale-100"
          >
            <Eye size={16} />
          </Link>
        </div>
      </Link>

      {/* Info panel */}
      <div className="p-4 flex flex-col gap-2.5 flex-grow justify-between bg-white dark:bg-slate-800">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1 text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
            <span>{product.brand}</span>
            <Rating value={product.rating} size={11} />
          </div>

          <Link
            to={`/product/${product.id}`}
            className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-primary transition-colors line-clamp-2"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-50 dark:border-slate-700/60 pt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-primary">${product.price.toFixed(2)}</span>
            {product.discount > 0 && (
              <span className="text-[10px] text-slate-400 line-through font-semibold">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-colors"
            title="Add to Cart"
          >
            <ShoppingCart size={13} />
          </button>
        </div>
      </div>
    </Card>
  );
};
export default ProductCard;
