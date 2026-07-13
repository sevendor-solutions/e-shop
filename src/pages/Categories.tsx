import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { productService } from '../services/productService';
import { Category } from '../types';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  const parents = categories.filter((c) => !c.parentId);
  const childrenMap = categories.reduce((acc, cat) => {
    if (cat.parentId) {
      if (!acc[cat.parentId]) acc[cat.parentId] = [];
      acc[cat.parentId].push(cat);
    }
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
          <Layers className="text-primary" size={24} /> Explore Departments
        </h1>
        <p className="text-sm text-slate-400">Navigate catalog items by product category.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton height={180} />
          <Skeleton height={180} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {parents.map((p) => {
            const subs = childrenMap[p.id] || [];
            return (
              <Card key={p.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                <Link to={`/products?category=${p.slug}`} className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100/60 dark:border-slate-850 flex-shrink-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-grow flex flex-col gap-3 justify-between py-1">
                  <div className="flex flex-col gap-1.5">
                    <Link
                      to={`/products?category=${p.slug}`}
                      className="text-lg font-extrabold text-slate-800 dark:text-slate-100 hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      {p.name} <ArrowRight size={16} />
                    </Link>
                    {p.description && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{p.description}</p>
                    )}
                  </div>

                  {/* Subcategories list */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {subs.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">No subcategories</span>
                    ) : (
                      subs.map((s) => (
                        <Link
                          key={s.id}
                          to={`/products?category=${s.slug}`}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 px-2.5 py-1 rounded-lg text-slate-650 dark:text-slate-350 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all"
                        >
                          {s.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
