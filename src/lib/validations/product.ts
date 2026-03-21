import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(5000),
  short_description: z.string().max(500).optional(),
  category_id: z.string().uuid(),
  brand: z.string().max(100).optional(),
  sku: z.string().min(2).max(50),
  price: z.number().positive(),
  compare_at_price: z.number().positive().optional(),
  stock_quantity: z.number().int().min(0),
  unit: z.string().min(1).max(20),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_organic: z.boolean(),
  tags: z.array(z.string()),
});
