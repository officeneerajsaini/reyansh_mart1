# 🥦 FreshMart - Full-Stack Grocery E-Commerce

A production-ready online grocery store built with Next.js 14, Supabase, and Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Auth**: Supabase Auth
- **State**: Zustand (persisted cart + wishlist)
- **Payments**: Razorpay + Cash on Delivery
- **Deployment**: Vercel-ready

## Features

- 🛒 Shopping cart with persistent state
- ❤️ Wishlist
- 🔐 User authentication (signup/login)
- 📦 Order management + tracking
- 🌿 Organic product filters
- 🌙 Dark mode
- 💳 Razorpay payments + COD
- 🚀 Admin dashboard (products, orders, stats, revenue chart)
- 📱 Fully responsive
- 🔍 Product search + filters (category, price, rating, organic)
- 🎟 Discount/promo badge system

## Setup

### 1. Clone and install
```bash
cd freshmart
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database setup
Run `supabase-schema.sql` in your Supabase SQL Editor. This creates:
- All tables with proper relationships
- Row Level Security policies
- Auto-user-profile trigger on signup
- Sample categories

### 4. Run
```bash
npm run dev
```

## Project Structure
```
src/
├── app/             # Next.js App Router pages + API routes
│   ├── admin/       # Admin dashboard (products, orders)
│   ├── api/         # API endpoints
│   ├── auth/        # Login, signup pages
│   ├── checkout/    # Checkout flow
│   ├── orders/      # Order history + detail
│   ├── products/    # Product listing + detail
│   └── wishlist/    # Wishlist page
├── components/
│   ├── cart/        # CartDrawer
│   ├── layout/      # Navbar, Footer
│   ├── product/     # ProductCard, ProductGrid, Filters
│   └── ui/          # Button, Input, Badge, Modal, etc.
├── hooks/           # useAuth, useProducts, useOrders
├── lib/
│   ├── supabase/    # Client, server, admin clients
│   ├── utils/       # format, cn
│   └── validations/ # Zod schemas
├── store/           # Zustand: cart, wishlist, ui
└── types/           # TypeScript types
```

## Admin Setup
To make a user an admin, run in Supabase SQL Editor:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## Deployment
Deploy to Vercel with zero config. Add your environment variables in the Vercel dashboard.
