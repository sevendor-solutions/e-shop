import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Grid, List, Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { productService } from '../services/productService';
import { Product, Category } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [openDropdown, setOpenDropdown] = useState<'category' | 'brand' | 'price' | 'rating' | null>(null);
  
  // Pagination stats
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters state
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortOption, setSortOption] = useState<string>('featured');

  // URL query variables
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const searchParam = searchParams.get('search') || '';

  // Parse multi-select arrays
  const selectedCategories = categoryParam ? categoryParam.split(',') : [];
  const selectedBrands = brandParam ? brandParam.split(',') : [];

  // Brand Options derived from mock products
  const brandOptions = ['AeroSound', 'HexaTech', 'NovaFit', 'Luxor', 'Stryder', 'ClayWorks', 'Skinsync'];

  // Fetch categories on load
  useEffect(() => {
    productService.getCategories().then((cats) => {
      setCategories(cats.filter((c) => !c.parentId)); // Parent categories only
    });
  }, []);

  // Fetch catalog when filters or page changes
  useEffect(() => {
    fetchCatalog();
  }, [categoryParam, brandParam, searchParam, minPrice, maxPrice, selectedRating, sortOption, page]);

  // Reset page when filter inputs change
  useEffect(() => {
    setPage(1);
  }, [categoryParam, brandParam, searchParam, selectedRating, sortOption]);

  const fetchCatalog = () => {
    setLoading(true);
    productService
      .getProducts({
        category: categoryParam || undefined,
        brand: brandParam || undefined,
        search: searchParam || undefined,
        minPrice,
        maxPrice,
        rating: selectedRating || undefined,
        sort: sortOption,
        page,
        limit: 12 // 12 items is divisible by 4, 3, and 2
      })
      .then((res) => {
        setProducts(res.products);
        setTotalProducts(res.total);
        setTotalPages(res.pages);
        setLoading(false);
      });
  };

  const handleResetFilters = () => {
    setMinPrice(0);
    setMaxPrice(2000);
    setSelectedRating(0);
    setSortOption('featured');
    setSearchParams({});
    setOpenDropdown(null);
  };

  const handleCategoryToggle = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    let list = categoryParam ? categoryParam.split(',') : [];
    if (list.includes(slug)) {
      list = list.filter((item) => item !== slug);
    } else {
      list.push(slug);
    }
    if (list.length > 0) {
      params.set('category', list.join(','));
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleBrandToggle = (brandName: string) => {
    const params = new URLSearchParams(searchParams);
    let list = brandParam ? brandParam.split(',') : [];
    if (list.includes(brandName)) {
      list = list.filter((item) => item !== brandName);
    } else {
      list.push(brandName);
    }
    if (list.length > 0) {
      params.set('brand', list.join(','));
    } else {
      params.delete('brand');
    }
    setSearchParams(params);
  };

  const toggleDropdown = (type: 'category' | 'brand' | 'price' | 'rating') => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    minPrice > 0 ||
    maxPrice < 2000 ||
    selectedRating > 0 ||
    searchParam;

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-3 pb-8 flex flex-col gap-6">
      
      {/* Unified Single-Lane Header Toolbar (Title + Count + Filters + Sorting + Layout Mode) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 relative">
        
        {/* Left Section: Title and Count */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 flex-shrink-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white whitespace-nowrap">
            {categoryParam
              ? `Department: ${selectedCategories.map((s) => s.replace('-', ' ')).join(', ')}`
              : 'Store Catalog'}
          </h1>
          <p className="text-xs text-slate-400 font-semibold whitespace-nowrap">
            Showing {products.length} of {totalProducts} products
          </p>
        </div>

        {/* Right Section: Inline Dropdown Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Categories Dropdown Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('category')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
            >
              Category {selectedCategories.length > 0 && `(${selectedCategories.length})`}
              <ChevronDown size={12} />
            </button>
            
            {openDropdown === 'category' && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 shadow-xl rounded-xl p-4 z-40 flex flex-col gap-2.5 max-h-60 overflow-y-auto">
                  <span className="text-xs font-bold text-slate-400 border-b pb-1 dark:border-slate-700 uppercase">Select Categories</span>
                  {categories.map((c) => {
                    const isSelected = selectedCategories.includes(c.slug);
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-655 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCategoryToggle(c.slug)}
                          className="rounded border-slate-300 text-primary focus:ring-primary/40 w-4 h-4"
                        />
                        {c.name}
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Brands Dropdown Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('brand')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
            >
              Brand {selectedBrands.length > 0 && `(${selectedBrands.length})`}
              <ChevronDown size={12} />
            </button>
            
            {openDropdown === 'brand' && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
                <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-155 dark:border-slate-700 shadow-xl rounded-xl p-4 z-40 flex flex-col gap-2.5 max-h-60 overflow-y-auto">
                  <span className="text-xs font-bold text-slate-400 border-b pb-1 dark:border-slate-700 uppercase">Select Brands</span>
                  {brandOptions.map((brand) => {
                    const isSelected = selectedBrands.includes(brand);
                    return (
                      <label key={brand} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-655 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleBrandToggle(brand)}
                          className="rounded border-slate-300 text-primary focus:ring-primary/40 w-4 h-4"
                        />
                        {brand}
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Price Range Dropdown Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('price')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
            >
              Price Range {(minPrice > 0 || maxPrice < 2000) && `($${minPrice}-$${maxPrice})`}
              <ChevronDown size={12} />
            </button>
            
            {openDropdown === 'price' && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-155 dark:border-slate-700 shadow-xl rounded-xl p-4 z-40 flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-455 border-b pb-1 dark:border-slate-700 uppercase">Set Price Range</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice || ''}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-xs">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice || ''}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none dark:text-slate-100"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Rating Dropdown Filter */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('rating')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
            >
              Rating {selectedRating > 0 && `(${selectedRating}★+)`}
              <ChevronDown size={12} />
            </button>
            
            {openDropdown === 'rating' && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-155 dark:border-slate-700 shadow-xl rounded-xl p-4 z-40 flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-slate-455 border-b pb-1 dark:border-slate-700 uppercase">Minimum Rating</span>
                  {[4, 3, 2].map((stars) => (
                    <label key={stars} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-655 dark:text-slate-300">
                      <input
                        type="radio"
                        name="dropdown-rating-filter"
                        checked={selectedRating === stars}
                        onChange={() => {
                          setSelectedRating(stars);
                          setOpenDropdown(null);
                        }}
                        className="rounded-full text-primary focus:ring-primary/40 w-4 h-4"
                      />
                      <span>{stars} Stars &amp; Up</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-655 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-2">
                    <input
                      type="radio"
                      name="dropdown-rating-filter"
                      checked={selectedRating === 0}
                      onChange={() => {
                        setSelectedRating(0);
                        setOpenDropdown(null);
                      }}
                      className="rounded-full text-primary focus:ring-primary/40 w-4 h-4"
                    />
                    <span>All Ratings</span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Reset Filters Trigger */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-extrabold text-red-500 hover:text-red-750 hover:underline uppercase flex items-center gap-1.5 ml-2"
            >
              <X size={13} /> Reset
            </button>
          )}

          {/* Small divider line */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="rating-desc">Highly Rated</option>
              <option value="discount-desc">Discount %</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>

          {/* Layout Mode Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-100'
              }`}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-100'
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>

        </div>

      </div>

      {/* Render active filter badges row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-[-8px]">
          {selectedCategories.map((slug) => (
            <Badge key={slug} variant="primary" className="flex items-center gap-1 text-[10px]">
              Category: {slug.replace('-', ' ')}
              <X size={10} className="cursor-pointer" onClick={() => handleCategoryToggle(slug)} />
            </Badge>
          ))}

          {selectedBrands.map((brandName) => (
            <Badge key={brandName} variant="info" className="flex items-center gap-1 text-[10px]">
              Brand: {brandName}
              <X size={10} className="cursor-pointer" onClick={() => handleBrandToggle(brandName)} />
            </Badge>
          ))}

          {searchParam && (
            <Badge variant="accent" className="flex items-center gap-1 text-[10px]">
              Search: "{searchParam}"
              <X size={10} className="cursor-pointer" onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('search');
                setSearchParams(params);
              }} />
            </Badge>
          )}
        </div>
      )}

      {/* Main Full-Width Product Grid */}
      <section className="flex flex-col gap-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height={320} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="p-16 text-center flex flex-col gap-3 justify-center items-center">
            <SlidersHorizontal size={40} className="text-slate-300" />
            <p className="text-slate-500 font-bold">No products match your criteria</p>
            <Button size="sm" onClick={handleResetFilters} className="mt-2">
              Reset All Filters
            </Button>
          </Card>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} layout={viewMode} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg font-bold text-xs transition-colors ${
                    page === pageNum
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-650 hover:bg-slate-50 dark:text-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </section>

    </div>
  );
}
