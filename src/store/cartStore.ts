import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 49;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        set(state => {
          const existing = state.items.find(i => i.product_id === product.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product_id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock_quantity) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, {
              id: `${product.id}-${Date.now()}`,
              cart_id: 'local',
              product_id: product.id,
              quantity: Math.min(quantity, product.stock_quantity),
              product,
              created_at: new Date().toISOString(),
            }],
          };
        });
      },

      removeItem: (productId) => {
        set(state => ({ items: state.items.filter(i => i.product_id !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set(state => ({
          items: state.items.map(i =>
            i.product_id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
      },

      getTotal: () => get().getSubtotal() + get().getDeliveryFee(),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'freshmart-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
