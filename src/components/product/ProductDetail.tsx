'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Plus, Minus, Share2, Truck, Shield, RotateCcw, Leaf, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice, calculateDiscount, formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { ProductCard } from './ProductCard';
import type { Product, Review } from '@/types';

interface ProductDetailProps {
  product: Product;
  reviews: Review[];
  relatedProducts: Product[];
}

export function ProductDetail({ product, reviews, relatedProducts }: ProductDetailProps) {
  const { addItem, items, updateQuantity } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'nutrition'>('description');

  const cartItem = items.find(i => i.product_id === product.id);
  const inWishlist = isInWishlist(product.id);
  const discount = product.compare_at_price ? calculateDiscount(product.price, product.compare_at_price) : 0;

  const handleAddToCart = () => {
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity + quantity);
    } else {
      for (let i = 0; i < quantity; i++) addItem(product);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand-500">Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:text-brand-500">Products</Link>
        {product.category && (
          <><ChevronRight size={14} />
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-500">{product.category.name}</Link></>
        )}
        <ChevronRight size={14} />
        <span className="text-gray-900 dark:text-white truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-800 mb-3">
            {product.images?.[activeImage] ? (
              <Image src={product.images[activeImage]} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🛒</div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl">-{discount}% OFF</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${i === activeImage ? 'border-brand-500' : 'border-gray-200 dark:border-gray-700'}`}>
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.is_organic && <Badge variant="organic"><Leaf size={11} className="mr-1" />Organic</Badge>}
            {product.is_featured && <Badge variant="warning">⭐ Featured</Badge>}
            {product.stock_quantity === 0 && <Badge variant="danger">Out of Stock</Badge>}
            {product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold && (
              <Badge variant="warning">⚠ Only {product.stock_quantity} left</Badge>
            )}
          </div>

          {product.brand && <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">{product.brand}</p>}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>

          {product.avg_rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.avg_rating} size="md" />
              <span className="text-sm text-gray-500">({product.review_count} reviews)</span>
            </div>
          )}

          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{product.short_description}</p>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-xl text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
            )}
            <span className="text-sm text-gray-500">{product.unit}</span>
          </div>

          {/* Quantity + Cart */}
          {product.stock_quantity > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                  className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                  <Plus size={14} />
                </button>
              </div>
              <Button onClick={handleAddToCart} size="lg" className="flex-1 gap-2">
                <ShoppingCart size={18} />
                {cartItem ? 'Update Cart' : 'Add to Cart'}
              </Button>
              <button onClick={() => toggleWishlist(product.id)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${inWishlist ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-950' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300'}`}>
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Truck, label: 'Free delivery above ₹499' },
              { icon: Shield, label: '100% quality assured' },
              { icon: RotateCcw, label: 'Easy returns in 24h' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
                <Icon size={18} className="text-brand-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight">{label}</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-600">SKU: {product.sku}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-12">
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
          {(['description', 'reviews', 'nutrition'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {tab} {tab === 'reviews' && `(${reviews.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
            {product.description || 'No description available.'}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {(review.user as any)?.full_name ?? 'Anonymous'}
                        </p>
                        <StarRating rating={review.rating} />
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                    </div>
                    {review.title && <p className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">{review.title}</p>}
                    {review.body && <p className="text-gray-600 dark:text-gray-400 text-sm">{review.body}</p>}
                    {review.is_verified_purchase && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        ✅ Verified Purchase
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'nutrition' && product.nutritional_info && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Nutritional Information</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Object.entries(product.nutritional_info).map(([key, val]) => (
                  <tr key={key}>
                    <td className="py-2 text-gray-600 dark:text-gray-400 capitalize">{key}</td>
                    <td className="py-2 font-medium text-gray-900 dark:text-white text-right">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
