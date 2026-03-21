import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

// ── Address ───────────────────────────────────────────────────
export const addressSchema = z.object({
  label: z.string().min(1).max(20).default("Home"),
  full_name: z.string().min(2, "Name is required").max(60),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  line1: z.string().min(5, "Address is too short").max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  country: z.string().default("India"),
  is_default: z.boolean().default(false),
});

// ── Product ───────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  description: z.string().max(5000).optional(),
  short_desc: z.string().max(300).optional(),
  category_id: z.string().uuid("Select a category"),
  brand: z.string().max(100).optional(),
  sku: z.string().max(50).optional(),
  price: z.number().positive("Price must be greater than 0"),
  compare_price: z.number().positive().optional(),
  cost_price: z.number().positive().optional(),
  tax_percent: z.number().min(0).max(100).default(0),
  stock_qty: z.number().int().min(0).default(0),
  low_stock_alert: z.number().int().min(0).default(10),
  unit: z.string().max(20).default("unit"),
  unit_value: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_organic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  meta_title: z.string().max(70).optional(),
  meta_desc: z.string().max(160).optional(),
});

// ── Review ────────────────────────────────────────────────────
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(2000).optional(),
});

// ── Category ──────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  parent_id: z.string().uuid().optional().nullable(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

// ── Checkout ──────────────────────────────────────────────────
export const checkoutSchema = z.object({
  address_id: z.string().uuid("Select a delivery address"),
  payment_method: z.enum(["razorpay", "cod", "upi", "wallet"]),
  coupon_code: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// ── Profile Update ────────────────────────────────────────────
export const profileSchema = z.object({
  full_name: z.string().min(2).max(60),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid mobile number").optional().or(z.literal("")),
  date_of_birth: z.string().optional(),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
