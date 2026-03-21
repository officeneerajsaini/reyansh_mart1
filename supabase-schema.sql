-- FreshMart Supabase Schema
-- Run this in the Supabase SQL editor

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Users table (extends auth.users)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Addresses
create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  short_description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  cost_price numeric(10,2),
  category_id uuid references public.categories(id),
  brand text,
  unit text not null default '1 piece',
  images text[] default '{}',
  tags text[] default '{}',
  stock_quantity int not null default 0,
  low_stock_threshold int not null default 10,
  is_active boolean default true,
  is_featured boolean default false,
  is_organic boolean default false,
  avg_rating numeric(3,2) default 0,
  review_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Wishlist
create table if not exists public.wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  user_id uuid references public.users(id) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_method text not null check (payment_method in ('cod','razorpay','upi')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2) not null,
  address jsonb not null,
  notes text,
  razorpay_order_id text,
  razorpay_payment_id text,
  estimated_delivery timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  product_name text not null,
  product_image text,
  quantity int not null,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  created_at timestamptz default now()
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  body text,
  is_verified_purchase boolean default false,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- Indexes
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_reviews_product on public.reviews(product_id);

-- Function to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to decrement stock
create or replace function public.decrement_stock(product_id uuid, qty int)
returns void as $$
  update public.products
  set stock_quantity = greatest(0, stock_quantity - qty),
      updated_at = now()
  where id = product_id;
$$ language sql;

-- Row Level Security
alter table public.users enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.reviews enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;

-- RLS Policies
-- Users: can read/update own profile
create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Service role full access" on public.users using (true) with check (true);

-- Products & categories: public read
create policy "Products public read" on public.products for select using (is_active = true);
create policy "Categories public read" on public.categories for select using (is_active = true);
create policy "Admins can manage products" on public.products for all using (exists(select 1 from public.users where id = auth.uid() and role = 'admin'));
create policy "Admins can manage categories" on public.categories for all using (exists(select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Orders: users see own
create policy "Users see own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users create orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins see all orders" on public.orders for all using (exists(select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Order items: follow order access
create policy "Order items read" on public.order_items for select using (exists(select 1 from public.orders where id = order_id and user_id = auth.uid()));
create policy "Order items insert" on public.order_items for insert with check (true);

-- Addresses
create policy "Users manage own addresses" on public.addresses for all using (auth.uid() = user_id);

-- Wishlist
create policy "Users manage wishlist" on public.wishlist for all using (auth.uid() = user_id);

-- Reviews
create policy "Reviews public read" on public.reviews for select using (true);
create policy "Users manage own reviews" on public.reviews for all using (auth.uid() = user_id);

-- Insert sample categories
insert into public.categories (name, slug, sort_order) values
  ('Fresh Produce', 'fresh-produce', 1),
  ('Dairy & Eggs', 'dairy-eggs', 2),
  ('Meat & Fish', 'meat-fish', 3),
  ('Bakery', 'bakery', 4),
  ('Beverages', 'beverages', 5),
  ('Snacks', 'snacks', 6),
  ('Pantry', 'pantry', 7),
  ('Personal Care', 'personal-care', 8)
on conflict (slug) do nothing;
