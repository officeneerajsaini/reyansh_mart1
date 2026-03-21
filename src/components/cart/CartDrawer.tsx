'use client';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, getSubtotal, getDeliveryFee, getTotal } = useCartStore();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const FREE_THRESHOLD = 499;
  const progressPct = Math.min((subtotal / FREE_THRESHOLD) * 100, 100);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className={cn(
        'fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-gray-950 z-50 flex flex-col',
        'transition-transform duration-300 ease-out shadow-modal',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cart <span className="text-sm text-gray-400 font-normal">({items.length} items)</span>
            </h2>
          </div>
          <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <ShoppingBag size={40} className="text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Your cart is empty</p>
              <p className="text-sm text-gray-500">Add items to get started</p>
            </div>
            <Button onClick={() => setCartOpen(false)} variant="outline">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free delivery progress */}
            {subtotal < FREE_THRESHOLD && (
              <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/30">
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-1.5">
                  Add {formatPrice(FREE_THRESHOLD - subtotal)} more for <strong>FREE delivery</strong>!
                </p>
                <div className="h-1.5 bg-amber-200 dark:bg-amber-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}
            {subtotal >= FREE_THRESHOLD && (
              <div className="px-5 py-2.5 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800/30">
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">🎉 You've unlocked free delivery!</p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🛒</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.product?.unit}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                        {formatPrice((item.product?.price ?? 0) * item.quantity)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand-400 hover:text-brand-600 transition-colors"
                        >
                          {item.quantity === 1 ? <Trash2 size={11} className="text-red-500" /> : <Minus size={11} />}
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand-400 hover:text-brand-600 transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-5 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-500 font-medium' : ''}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>
              <Link href="/checkout" onClick={() => setCartOpen(false)}>
                <Button fullWidth size="lg" className="gap-2">
                  Proceed to Checkout <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/cart" onClick={() => setCartOpen(false)}
                className="block text-center text-sm text-gray-500 hover:text-brand-500 transition-colors">
                View full cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
