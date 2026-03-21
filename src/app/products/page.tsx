'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { Product, ProductFilters } from '@/types';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'fruits-veggies', label: '🥦 Fruits & Veggies' },
  { value: 'dairy-eggs', label: '🥛 Dairy & Eggs' },
  { value: 'snacks', label: '🍿 Snacks' },
  { value: 'beverages', label: '☕ Beverages' },
  { value: 'bakery', label: '🍞 Bakery' },
  { value: 'meat-fish', label: '🐟 Meat & Fish' },
  { value: 'household', label: '🧹 Household' },
  { value: 'personal-care', label: '🧴 Personal Care' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: 'newest',
    min_price: undefined,
    max_price: undefined,
    is_organic: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const limit = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries({ ...filters, page: String(page), limit: String(limit) }).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
      });
      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      setProducts(json.data || []);
      setTotal(json.count || 0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    setFilters(f => ({
      ...f,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
    }));
    setPage(1);
  }, [searchParams]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {filters.search ? `Results for "${filters.search}"` : filters.category ? CATEGORIES.find(c => c.value === filters.category)?.label?.replace(/^[^ ]+ /, '') || 'Products' : 'All Products'}
          </h1>
          {!loading && <p className="text-sm text-gray-500 mt-0.5">{total} products found</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <SlidersHorizontal size={15} />
            Filters
            {(filters.is_organic || filters.min_price || filters.max_price) && (
              <span className="w-4 h-4 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center">!</span>
            )}
          </button>
          <Select
            options={SORT_OPTIONS}
            value={filters.sort}
            onChange={e => setFilters(f => ({ ...f, sort: e.target.value as ProductFilters['sort'] }))}
            className="h-10 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-64 flex-shrink-0 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button onClick={() => setFilters(f => ({ ...f, is_organic: undefined, min_price: undefined, max_price: undefined }))} className="text-xs text-brand-500 hover:text-brand-600">Clear all</button>
              </div>

              {/* Category */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Category</p>
                <div className="space-y-1">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value}
                      onClick={() => setFilters(f => ({ ...f, category: cat.value }))}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${filters.category === cat.value ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Price Range</p>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.min_price ?? ''} onChange={e => setFilters(f => ({ ...f, min_price: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white" />
                  <input type="number" placeholder="Max" value={filters.max_price ?? ''} onChange={e => setFilters(f => ({ ...f, max_price: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white" />
                </div>
              </div>

              {/* Organic */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Type</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.is_organic === true} onChange={e => setFilters(f => ({ ...f, is_organic: e.target.checked ? true : undefined }))}
                    className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🌿 Organic only</span>
                </label>
              </div>
            </div>
          </aside>
        )}

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</p>
              <p className="text-gray-500">Try adjusting your search or filters</p>
              <Button variant="outline" className="mt-4" onClick={() => setFilters({ sort: 'newest' })}>Clear filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-brand-500 text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      {p}
                    </button>
                  ))}
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
