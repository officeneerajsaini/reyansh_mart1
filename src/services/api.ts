import type { ProductFilters, PaginatedResult, Product, Review } from "@/types";
import { buildSearchParams } from "@/lib/utils";

const BASE = "/api";

// ── Products ──────────────────────────────────────────────────
export async function fetchProducts(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
  const qs = buildSearchParams(filters as Record<string, string | number | boolean | undefined>);
  const res = await fetch(`${BASE}/products?${qs}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${BASE}/products/${slug}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/products?isFeatured=true&limit=12`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

export async function fetchBestsellerProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/products?sortBy=bestseller&limit=12`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

export async function searchProducts(query: string, limit = 8): Promise<Product[]> {
  if (!query.trim()) return [];
  const res = await fetch(`${BASE}/products?search=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

// ── Reviews ───────────────────────────────────────────────────
export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const res = await fetch(`${BASE}/reviews?productId=${productId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function submitReview(data: { productId: string; rating: number; title?: string; body?: string }): Promise<Review> {
  const res = await fetch(`${BASE}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to submit review");
  }
  return res.json();
}

// ── Cart ──────────────────────────────────────────────────────
export async function fetchCart() {
  const res = await fetch(`${BASE}/cart`);
  if (!res.ok) return [];
  return res.json();
}

export async function addToCart(productId: string, variantId?: string, quantity = 1) {
  const res = await fetch(`${BASE}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, variantId, quantity }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to add to cart");
  }
  return res.json();
}

export async function updateCartItem(productId: string, variantId: string | null, quantity: number) {
  const res = await fetch(`${BASE}/cart`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, variantId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to update cart");
  return res.json();
}

export async function removeFromCart(productId: string, variantId?: string | null) {
  const res = await fetch(`${BASE}/cart`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, variantId }),
  });
  if (!res.ok) throw new Error("Failed to remove from cart");
  return res.json();
}

// ── Wishlist ──────────────────────────────────────────────────
export async function fetchWishlist() {
  const res = await fetch(`${BASE}/wishlist`);
  if (!res.ok) return [];
  return res.json();
}

export async function toggleWishlist(productId: string) {
  const res = await fetch(`${BASE}/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error("Failed to update wishlist");
  return res.json();
}

// ── Orders ─────────────────────────────────────────────────────
export async function fetchOrders() {
  const res = await fetch(`${BASE}/orders`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchOrder(id: string) {
  const res = await fetch(`${BASE}/orders/${id}`);
  if (!res.ok) throw new Error("Order not found");
  return res.json();
}

export async function createOrder(data: {
  addressId: string;
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
}) {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to create order");
  }
  return res.json();
}

export async function cancelOrder(orderId: string) {
  const res = await fetch(`${BASE}/orders/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "cancelled" }),
  });
  if (!res.ok) throw new Error("Failed to cancel order");
  return res.json();
}
