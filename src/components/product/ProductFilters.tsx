'use client';
import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { ProductFilters as Filters } from '@/types';

interface ProductFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  categories: { id: string; name: string; slug: string }[];
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export function ProductFiltersPanel({ filters, onChange, categories }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = !!(filters.category || filters.min_price || filters.max_price || filters.min_rating || filters.is_organic);

  const update = (key: keyof Filters, value: unknown) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const reset = () => onChange({ sort: filters.sort, page: 1 });

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="flex items-center gap-3 mb-4 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brand-500" />}
        </Button>
        <div className="flex-1 overflow-x-auto flex gap-2">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => update('sort', opt.value as Filters['sort'])}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 text-xs rounded-full border transition-colors',
                filters.sort === opt.value
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-400'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn('lg:block', isOpen ? 'block' : 'hidden')}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-card sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            {hasActiveFilters && (
              <button onClick={reset} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>

          {/* Sort (desktop) */}
          <div className="mb-5 hidden lg:block">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</p>
            <div className="space-y-1">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update('sort', opt.value as Filters['sort'])}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm rounded-xl transition-colors',
                    filters.sort === opt.value
                      ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => update('category', undefined)}
                  className={cn('w-full text-left px-3 py-2 text-sm rounded-xl transition-colors',
                    !filters.category ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => update('category', cat.slug)}
                    className={cn('w-full text-left px-3 py-2 text-sm rounded-xl transition-colors',
                      filters.category === cat.slug ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</p>
            <div className="flex gap-2">
              <input
                type="number" placeholder="Min" min={0}
                value={filters.min_price ?? ''}
                onChange={e => update('min_price', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="number" placeholder="Max" min={0}
                value={filters.max_price ?? ''}
                onChange={e => update('max_price', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Rating</p>
            <div className="flex gap-1">
              {[4, 3, 2, 1].map(r => (
                <button
                  key={r}
                  onClick={() => update('min_rating', filters.min_rating === r ? undefined : r)}
                  className={cn(
                    'flex-1 py-1.5 text-xs rounded-lg border transition-colors',
                    filters.min_rating === r
                      ? 'bg-amber-400 border-amber-400 text-white font-medium'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                  )}
                >
                  {r}★+
                </button>
              ))}
            </div>
          </div>

          {/* Organic filter */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={cn(
              'w-10 h-6 rounded-full transition-colors relative',
              filters.is_organic ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'
            )} onClick={() => update('is_organic', filters.is_organic ? undefined : true)}>
              <div className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                filters.is_organic ? 'translate-x-5' : 'translate-x-1'
              )} />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-brand-600 transition-colors">
              🌿 Organic Only
            </span>
          </label>
        </div>
      </div>
    </>
  );
}
