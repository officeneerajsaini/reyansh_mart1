import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Profile, CartItem, WishlistItem, Product } from "@/types";

// ── Auth Store ────────────────────────────────────────────────
interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (v: boolean) => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  isAdmin: () => {
    const role = get().user?.role;
    return role === "admin" || role === "superadmin";
  },
}));

// ── Cart Store ────────────────────────────────────────────────
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string;
  discount: number;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: "",
      discount: 0,

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => {
          const exists = state.items.find(
            (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
          );
          if (exists) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id && i.variant_id === item.variant_id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product_id === productId && i.variant_id === (variantId ?? null))
          ),
        })),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => !(i.product_id === productId && i.variant_id === (variantId ?? null))
                )
              : state.items.map((i) =>
                  i.product_id === productId && i.variant_id === (variantId ?? null)
                    ? { ...i, quantity }
                    : i
                ),
        })),

      clearCart: () => set({ items: [], couponCode: "", discount: 0 }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      setCoupon: (couponCode, discount) => set({ couponCode, discount }),
      clearCoupon: () => set({ couponCode: "", discount: 0 }),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0),

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const delivery = subtotal > 499 ? 0 : 49;
        return subtotal + delivery - get().discount;
      },
    }),
    {
      name: "freshmart-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode, discount: state.discount }),
    }
  )
);

// ── Wishlist Store ─────────────────────────────────────────────
interface WishlistState {
  items: WishlistItem[];
  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      addItem: (item) =>
        set((s) => ({ items: s.items.some((i) => i.product_id === item.product_id) ? s.items : [...s.items, item] })),
      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.product_id !== productId) })),
      isWishlisted: (productId) => get().items.some((i) => i.product_id === productId),
    }),
    { name: "freshmart-wishlist", storage: createJSONStorage(() => localStorage) }
  )
);

// ── UI Store ──────────────────────────────────────────────────
interface UIState {
  searchQuery: string;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  isMiniCartOpen: boolean;
  setSearchQuery: (q: string) => void;
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  toggleMiniCart: () => void;
  closeMiniCart: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: "",
  isSearchOpen: false,
  isMobileMenuOpen: false,
  isMiniCartOpen: false,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  toggleMiniCart: () => set((s) => ({ isMiniCartOpen: !s.isMiniCartOpen })),
  closeMiniCart: () => set({ isMiniCartOpen: false }),
}));

// ── Recently Viewed Store ─────────────────────────────────────
interface RecentlyViewedState {
  products: Product[];
  addProduct: (product: Product) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) => {
        const filtered = get().products.filter((p) => p.id !== product.id);
        set({ products: [product, ...filtered].slice(0, 20) });
      },
    }),
    { name: "freshmart-recently-viewed", storage: createJSONStorage(() => localStorage) }
  )
);
