'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlistStore';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types';

export default function WishlistPage() {
  const { productIds } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (productIds.length === 0) { setLoading(false); setProducts([]); return; }
      setLoading(true);
      try {
        const res = await fetch(`/api/products?ids=${productIds.join(',')}&limit=50`);
        const data = await res.json();
        const fetched = data.data || [];
        // Filter to only those in wishlist
        setProducts(fetched.filter((p: Product) => productIds.includes(p.id)));
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [productIds.length]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={28} className="text-red-500 fill-red-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
          <p className="text-sm text-gray-500">{productIds.length} saved items</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : productIds.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={56} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love to revisit later.</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
