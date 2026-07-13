import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Flame, ShieldCheck, Truck, RefreshCw, BadgePercent, Star } from 'lucide-react';
import { productService } from '../services/productService';
import { Product, Category, Banner } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// Live Countdown Timer for Flash Deals
const FlashCountdown = ({ endDate }: { endDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(endDate) - +new Date();
      let tempTime = { hours: 0, minutes: 0, seconds: 0 };
      
      if (difference > 0) {
        tempTime = {
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      setTimeLeft(tempTime);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  const pad = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="flex items-center gap-1 text-xs sm:text-sm font-extrabold text-white">
      <span className="bg-red-600 px-2.5 py-1.5 rounded-lg shadow-sm">{pad(timeLeft.hours)}</span>
      <span>:</span>
      <span className="bg-red-600 px-2.5 py-1.5 rounded-lg shadow-sm">{pad(timeLeft.minutes)}</span>
      <span>:</span>
      <span className="bg-red-600 px-2.5 py-1.5 rounded-lg shadow-sm">{pad(timeLeft.seconds)}</span>
    </div>
  );
};

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  
  const [flashProducts, setFlashProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    productService.getBanners().then(setBanners);
    productService.getCategories().then((cats) => {
      setCategories(cats.filter((c) => !c.parentId)); // Parent only
    });

    productService.getProducts({ limit: 20 }).then((res) => {
      const all = res.products;
      setFlashProducts(all.filter((p) => !!p.flashDeal));
      setBestSellers(all.filter((p) => p.bestSeller));
      setNewArrivals(all.filter((p) => p.newArrival));
    });
  }, []);

  // Banner slideshow auto loop
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const featuresList = [
    { name: 'Free Shipping', icon: Truck, text: 'For all orders over $150' },
    { name: '100% Secure Payments', icon: ShieldCheck, text: 'SSL encrypted checkouts' },
    { name: 'Easy Return Policy', icon: RefreshCw, text: '30 days exchange window' },
    { name: 'Exclusive Coupons', icon: BadgePercent, text: 'Subscribers save up to 20%' }
  ];

  const brands = ['AeroSound', 'HexaTech', 'NovaFit', 'Luxor', 'Outward', 'Stryder'];

  const testimonials = [
    { name: 'Arthur Pendelton', text: 'Exceptional build quality on my new workstation laptop. The compile speed is incredibly fast. Delivery arrived in Cyprus within 24 hours!', rating: 5 },
    { name: 'Mariana Silva', text: 'Absolutely love the wireless headphones. The noise cancellation works great on flights. Customer support was helpful when applying my coupon.', rating: 5 }
  ];

  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* Hero Banner Carousel (Framer Motion driven) */}
      <div className="relative h-[280px] sm:h-[450px] overflow-hidden bg-slate-900">
        <AnimatePresence mode="wait">
          {banners.length > 0 && (
            <motion.div
              key={activeBannerIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Full-width Image Background */}
              <img
                src={banners[activeBannerIdx].image}
                alt={banners[activeBannerIdx].title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent" />

              {/* Text Overlay Container */}
              <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-6 sm:px-12 text-white">
                <div className="max-w-md flex flex-col gap-3 sm:gap-5">
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-5xl font-extrabold tracking-tight leading-tight"
                  >
                    {banners[activeBannerIdx].title}
                  </motion.h2>
                  <motion.p
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-2"
                  >
                    {banners[activeBannerIdx].subtitle}
                  </motion.p>
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-2"
                  >
                    <Link to={banners[activeBannerIdx].link}>
                      <Button rightIcon={<ArrowRight size={14} />} className="text-xs sm:text-sm">
                        Shop Collection
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slides dots indicator */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBannerIdx(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeBannerIdx === idx ? 'w-6 bg-primary' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Feature Badges */}
      <section className="max-w-7xl mx-auto px-6 w-full grid grid-cols-2 lg:grid-cols-4 gap-6">
        {featuresList.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-850 dark:text-slate-100">{item.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{item.text}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white">Featured Categories</h2>
          <Link to="/categories" className="text-xs font-bold text-primary hover:underline">
            Explore All Categories
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="flex flex-col items-center text-center gap-3 p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-750/50 hover:shadow-md transition-shadow group"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-50 border border-slate-100 dark:border-slate-800">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Live Flash Deals */}
      {flashProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 w-full p-6 sm:p-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl text-white shadow-xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Flame size={24} className="text-amber-300 animate-bounce" />
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-extrabold leading-tight">Flash Promotion deals</h2>
                <span className="text-xs text-red-100">Highly limited stocks, checkout now!</span>
              </div>
            </div>
            
            <FlashCountdown endDate={flashProducts[0]?.flashDeal?.endDate || new Date().toISOString()} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers Grid */}
      <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white">Best Selling Products</h2>
          <Link to="/products?sort=rating-desc" className="text-xs font-bold text-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* New Arrivals Banner section */}
      <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white">New Arrivals</h2>
          <Link to="/products?sort=newest" className="text-xs font-bold text-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Brand Logos */}
      <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-6">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center">
          Trusted by Top Global Brands
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-60">
          {brands.map((b) => (
            <span key={b} className="text-sm font-extrabold text-slate-650 font-heading dark:text-slate-400">
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-850/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-750/30">
        {testimonials.map((t, idx) => (
          <div key={idx} className="flex flex-col gap-3 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 dark:text-white">{t.name}</span>
              <div className="flex text-amber-400">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={12} fill="currentColor" />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-550 dark:text-slate-400 italic leading-relaxed">
              "{t.text}"
            </p>
          </div>
        ))}
      </section>

    </div>
  );
}
