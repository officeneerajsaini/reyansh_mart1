'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, Minus, ShoppingCart, Leaf, Zap } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice, calculateDiscount } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [imageError, setImageError] = useState(false);

  const cartItem = items.find(i => i.product_id === product.id);
  const inWishlist = isInWishlist(product.id);
  const discount = product.compare_at_price ? calculateDiscount(product.price, product.compare_at_price) : 0;
  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOutOfStock) addItem(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className={cn(
        'relative bg-white dark:bg-gray-900 rounded-2xl transition-all duration-300',
        'border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-800',
        'shadow-card hover:shadow-card-hover',
        'overflow-hidden',
      )}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
          {!imageError && product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🛒</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
            )}
            {product.is_organic && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                <Leaf size={10} />Organic
              </span>
            )}
            {product.is_featured && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                <Zap size={10} />Featured
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
              'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm',
              inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-400',
            )}
          >
            <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 text-sm font-semibold px-3 py-1 rounded-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5">
          {product.brand && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{product.brand}</p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.unit}</p>

          {product.avg_rating > 0 && (
            <div className="mb-2">
              <StarRating rating={product.avg_rating} showCount count={product.review_count} />
            </div>
          )}

          {isLowStock && !isOutOfStock && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-1.5 font-medium">
              Only {product.stock_quantity} left!
            </p>
          )}

          {/* Price + Cart */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-base font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.compare_at_price)}</span>
              )}
            </div>

            {!isOutOfStock && (
              cartItem ? (
                <div className="flex items-center gap-1" onClick={e => e.preventDefault()}>
                  <button
                    onClick={() => cartItem.quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, cartItem.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 flex items-center justify-center hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-brand-600 dark:text-brand-400">{cartItem.quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-all duration-200 hover:shadow-brand active:scale-95 flex-shrink-0"
                >
                  <Plus size={16} />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
