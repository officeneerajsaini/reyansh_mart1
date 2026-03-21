"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore, useCartStore, useWishlistStore } from "@/store";
import { supabase } from "@/lib/supabase/client";
import { fetchCart, fetchWishlist, addToCart, removeFromCart, updateCartItem, toggleWishlist } from "@/services/api";
import type { Product, Address, CartItem } from "@/types";
import toast from "react-hot-toast";

// ── Auth sync hook ────────────────────────────────────────────
export function useAuthSync() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setUser(data ?? null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setUser(data ?? null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);
}

// ── Cart hook ─────────────────────────────────────────────────
export function useCart() {
  const { items, setItems, addItem, removeItem, updateQuantity, getItemCount, getSubtotal, getTotal, discount } = useCartStore();
  const { user } = useAuthStore();
  const [syncing, setSyncing] = useState(false);

  const syncCart = useCallback(async () => {
    if (!user) return;
    try {
      setSyncing(true);
      const serverItems = await fetchCart();
      setItems(serverItems);
    } catch {
      // silent
    } finally {
      setSyncing(false);
    }
  }, [user, setItems]);

  useEffect(() => { syncCart(); }, [syncCart]);

  const handleAddToCart = async (product: Product, variantId?: string, qty = 1) => {
    const optimisticItem: CartItem = {
      id: `temp-${Date.now()}`,
      user_id: user?.id ?? "guest",
      product_id: product.id,
      variant_id: variantId ?? null,
      quantity: qty,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product,
    };
    addItem(optimisticItem);

    if (user) {
      try {
        await addToCart(product.id, variantId, qty);
        await syncCart();
      } catch (err) {
        removeItem(product.id, variantId);
        toast.error("Failed to add to cart");
      }
    }
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemoveFromCart = async (productId: string, variantId?: string | null) => {
    removeItem(productId, variantId);
    if (user) {
      try {
        await removeFromCart(productId, variantId);
      } catch {
        toast.error("Failed to remove item");
      }
    }
  };

  const handleUpdateQuantity = async (productId: string, variantId: string | null | undefined, qty: number) => {
    updateQuantity(productId, variantId, qty);
    if (user) {
      try {
        await updateCartItem(productId, variantId ?? null, qty);
      } catch {
        toast.error("Failed to update quantity");
      }
    }
  };

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 499 ? 0 : 49;
  const total = getTotal();

  return {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    discount,
    total,
    syncing,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
  };
}

// ── Wishlist hook ─────────────────────────────────────────────
export function useWishlist() {
  const { items, setItems, addItem, removeItem, isWishlisted } = useWishlistStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    fetchWishlist().then(setItems).catch(() => {});
  }, [user, setItems]);

  const toggle = async (product: Product) => {
    if (!user) { toast.error("Please login to save items"); return; }

    const wishlisted = isWishlisted(product.id);
    if (wishlisted) {
      removeItem(product.id);
      toast.success("Removed from wishlist");
    } else {
      addItem({ id: `temp-${Date.now()}`, user_id: user.id, product_id: product.id, created_at: new Date().toISOString(), product });
      toast.success("Added to wishlist ❤️");
    }

    try {
      await toggleWishlist(product.id);
    } catch {
      // revert
      if (wishlisted) addItem({ id: `temp-${Date.now()}`, user_id: user.id, product_id: product.id, created_at: new Date().toISOString(), product });
      else removeItem(product.id);
      toast.error("Failed to update wishlist");
    }
  };

  return { items, toggle, isWishlisted };
}

// ── Debounced search hook ─────────────────────────────────────
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ── Intersection observer hook ────────────────────────────────
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);
  return { ref, inView };
}

// ── Address hook ──────────────────────────────────────────────
export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("addresses").select("*").order("is_default", { ascending: false });
    setAddresses(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addAddress = async (data: Omit<Address, "id" | "user_id" | "created_at">) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { error } = await supabase.from("addresses").insert({ ...data, user_id: user.user.id });
    if (!error) { toast.success("Address saved!"); fetch(); }
  };

  const deleteAddress = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    fetch();
  };

  return { addresses, loading, addAddress, deleteAddress, refresh: fetch };
}

// ── Scroll position hook ──────────────────────────────────────
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return scrollY;
}

// ── Local storage hook ────────────────────────────────────────
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) { console.error(err); }
  };

  return [storedValue, setValue] as const;
}
