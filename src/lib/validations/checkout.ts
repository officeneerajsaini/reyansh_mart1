import { z } from 'zod';

export const checkoutSchema = z.object({
  full_name: z.string().min(2, 'Name is required').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  address_line1: z.string().min(5, 'Address is required').max(200),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  payment_method: z.enum(['razorpay', 'cod']),
  notes: z.string().max(500).optional(),
});
