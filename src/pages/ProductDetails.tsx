import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../services/productService';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { Product, Review } from '../types';
import { Rating } from '../components/ui/Rating';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ProductCard } from '../components/product/ProductCard';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery states
  const [activeImage, setActiveImage] = useState('');
  
  // Selected variants
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Form states for reviews
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewName, setReviewName] = useState('');

  const loadProductData = () => {
    if (!id) return;
    setLoading(true);
    
    productService.getProductById(id)
      .then((prod) => {
        setProduct(prod);
        setActiveImage(prod.image);
        
        // Pick default variants
        setSelectedSize(prod.variants?.sizes?.[0] || '');
        setSelectedColor(prod.variants?.colors?.[0]?.name || '');
        
        // Fetch reviews
        return productService.getReviewsByProductId(prod.id).then((revs) => {
          setReviews(revs);
          // Fetch related
          return productService.getProducts({ category: prod.category }).then((relRes) => {
            setRelated(relRes.products.filter(p => p.id !== prod.id).slice(0, 4));
            setLoading(false);
          });
        });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProductData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Skeleton height={400} />
        <div className="space-y-4">
          <Skeleton height={30} className="w-3/4" />
          <Skeleton height={20} className="w-1/2" />
          <Skeleton height={150} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Product not found.</h2>
        <Link to="/products" className="text-primary hover:underline mt-2 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    if (isWishlisted) {
      toast.success('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = reviewName.trim() || user?.name || 'Anonymous User';
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment.');
      return;
    }

    try {
      const added = await productService.addReview(product.id, newRating, newComment, name);
      setReviews([added, ...reviews]);
      setNewComment('');
      setReviewName('');
      toast.success('Review submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-12">
      
      {/* Product top row details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Side: Images Gallery */}
        <div className="flex flex-col gap-4">
          {/* Active Zoom Frame */}
          <div className="aspect-square bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-xs relative">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Thumbnails row */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border flex-shrink-0 transition-all ${
                    activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Configuration panel */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                {product.brand}
              </span>
              <Badge variant={product.stock > 0 ? 'success' : 'danger'}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-805 dark:text-white">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-2 mt-1">
              <Rating value={product.rating} size={14} />
              <span className="text-xs text-slate-400 font-semibold">({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <span className="text-2xl font-extrabold text-primary">${product.price.toFixed(2)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-sm text-slate-450 line-through font-semibold">
                  ${product.originalPrice.toFixed(2)}
                </span>
                <span className="text-xs bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full">
                  Save {product.discount}%
                </span>
              </>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {product.description}
          </p>

          {/* Size Variant Picker */}
          {product.variants?.sizes && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                Select Size: <strong className="text-slate-850 dark:text-white">{selectedSize}</strong>
              </span>
              <div className="flex gap-2">
                {product.variants.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:text-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Variant Picker */}
          {product.variants?.colors && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                Select Color: <strong className="text-slate-850 dark:text-white">{selectedColor}</strong>
              </span>
              <div className="flex gap-3">
                {product.variants.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-7 h-7 rounded-full border-2 transition-all relative flex items-center justify-center ${
                      selectedColor === color.name
                        ? 'border-primary ring-2 ring-primary/10'
                        : 'border-slate-250 dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cart Quantity and Trigger Button */}
          <div className="flex items-center gap-4 mt-2">
            {/* Quantity */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-2 text-slate-500 hover:bg-slate-50 font-bold"
              >
                -
              </button>
              <span className="px-3 font-bold dark:text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3.5 py-2 text-slate-500 hover:bg-slate-50 font-bold"
              >
                +
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              leftIcon={<ShoppingCart size={16} />}
              className="flex-1 font-bold py-2.5"
            >
              Add to Cart
            </Button>
            
            <button
              onClick={handleToggleWishlist}
              className={`p-3 rounded-xl border transition-colors ${
                isWishlisted
                  ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-950/20'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-red-500 dark:bg-slate-900 dark:border-slate-700'
              }`}
              title="Add to Wishlist"
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Shipping Badges */}
          <div className="grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 mt-2 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold">
              <Truck size={14} className="text-primary" /> Free Shipping &gt; $150
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold">
              <ShieldCheck size={14} className="text-primary" /> 1 Year Warranty
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold">
              <RefreshCw size={14} className="text-primary" /> 30-Day Returns
            </span>
          </div>

          {/* Share buttons */}
          <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 text-xs text-slate-455 font-semibold">
            <span>Share Item:</span>
            <a href="#" className="hover:text-primary" title="Facebook">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="#" className="hover:text-primary" title="Twitter">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* Tabs segment: Specs and reviews */}
      <section className="flex flex-col gap-6 mt-6">
        <div className="flex border-b border-slate-150 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('desc')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'desc' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-655'
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'specs' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-655'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-655'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab content frames */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-6 rounded-2xl shadow-xs min-h-36">
          {activeTab === 'desc' && (
            <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{product.description}</p>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-xl">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  {product.specs && product.specs.length > 0 ? (
                    product.specs.map((s, idx) => (
                      <tr key={idx} className="border-b border-slate-50 dark:border-slate-700 last:border-0">
                        <td className="py-2.5 font-bold text-slate-450 uppercase tracking-wider w-1/3">{s.key}</td>
                        <td className="py-2.5 font-semibold text-slate-750 dark:text-slate-205">{s.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-2 text-slate-400 italic">No specific specs listed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Reviews List */}
              <div className="flex-1 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Feedback</h3>
                
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to leave one!</p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="pb-4 border-b border-slate-50 dark:border-slate-700/60 last:border-0 last:pb-0 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-750 flex items-center justify-center text-slate-550 font-bold text-xs uppercase">
                            {r.userName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.userName}</span>
                            <span className="text-[10px] text-slate-400">{r.date}</span>
                          </div>
                        </div>
                        <Rating value={r.rating} size={11} />
                      </div>
                      <p className="text-xs text-slate-500 pl-10 italic">"{r.comment}"</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add review form */}
              <div className="w-full lg:w-96 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
                  Write a Review
                </h3>
                
                <form onSubmit={handleAddReviewSubmit} className="flex flex-col gap-4">
                  {/* Rating Selector */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">Your Rating</span>
                    <div className="flex gap-1.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star size={18} fill={newRating >= star ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {!user && (
                    <Input
                      label="Your Name"
                      placeholder="e.g. Robert Smith"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                    />
                  )}

                  <Input
                    label="Review Comment"
                    textarea
                    rows={3}
                    placeholder="Write details about the product experience..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />

                  <Button type="submit" size="sm" className="font-bold">
                    Submit Review
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Grid */}
      {related.length > 0 && (
        <section className="flex flex-col gap-6 mt-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
