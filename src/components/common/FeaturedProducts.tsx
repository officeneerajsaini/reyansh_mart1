import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';

interface FeaturedProductsProps {
  title: string;
  category?: string;
  limit?: number;
}

async function getProducts(category?: string, limit = 10): Promise<Product[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category === 'featured') {
      query = query.eq('is_featured', true);
    } else if (category) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single();
      if (cat) query = query.eq('category_id', cat.id);
    }

    const { data } = await query;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function FeaturedProducts({ title, category, limit = 10 }: FeaturedProductsProps) {
  const products = await getProducts(category, limit);
  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <Link href={`/products${category && category !== 'featured' ? `?category=${category}` : ''}`}
          className="flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 hover:gap-2 transition-all">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
