-- ============================================================
-- FreshMart – Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Extensions ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for full-text search

-- ── Enums ─────────────────────────────────────────────────
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'processing',
  'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'
);

CREATE TYPE payment_method AS ENUM ('razorpay', 'cod', 'upi', 'wallet');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE user_role     AS ENUM ('customer', 'admin', 'superadmin');

-- ============================================================
-- TABLES
-- ============================================================

-- ── profiles (extends Supabase auth.users) ────────────────
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'customer',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  date_of_birth DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── addresses ─────────────────────────────────────────────
CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label         TEXT NOT NULL DEFAULT 'Home',   -- Home / Work / Other
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  line1         TEXT NOT NULL,
  line2         TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  pincode       TEXT NOT NULL,
  country       TEXT NOT NULL DEFAULT 'India',
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── categories ────────────────────────────────────────────
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  image_url     TEXT,
  icon          TEXT,           -- emoji or icon name
  parent_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── products ──────────────────────────────────────────────
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  short_desc      TEXT,
  category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand           TEXT,
  sku             TEXT UNIQUE,
  barcode         TEXT,

  -- Pricing
  price           NUMERIC(10,2) NOT NULL,
  compare_price   NUMERIC(10,2),          -- original MRP
  cost_price      NUMERIC(10,2),          -- internal cost
  tax_percent     NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- Inventory
  stock_qty       INT NOT NULL DEFAULT 0,
  low_stock_alert INT NOT NULL DEFAULT 10,
  track_inventory BOOLEAN NOT NULL DEFAULT TRUE,

  -- Media
  images          TEXT[] NOT NULL DEFAULT '{}',   -- array of URLs
  thumbnail       TEXT,

  -- Attributes
  unit            TEXT NOT NULL DEFAULT 'unit',   -- kg, g, L, ml, pack, dozen…
  unit_value      NUMERIC(8,2),                   -- e.g. 500 (for 500g)
  weight          NUMERIC(8,3),                   -- kg (for shipping)

  -- Flags
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller   BOOLEAN NOT NULL DEFAULT FALSE,
  is_organic      BOOLEAN NOT NULL DEFAULT FALSE,

  -- SEO
  meta_title      TEXT,
  meta_desc       TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',

  -- Stats (denormalized for perf)
  avg_rating      NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count    INT NOT NULL DEFAULT 0,
  sales_count     INT NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── product_variants ──────────────────────────────────────
CREATE TABLE product_variants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,    -- e.g. "500g", "1kg", "Pack of 6"
  sku           TEXT UNIQUE,
  price         NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),
  stock_qty     INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INT NOT NULL DEFAULT 0
);

-- ── cart ──────────────────────────────────────────────────
CREATE TABLE cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id, variant_id)
);

-- ── wishlist ──────────────────────────────────────────────
CREATE TABLE wishlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ── coupons ───────────────────────────────────────────────
CREATE TABLE coupons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  description     TEXT,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat')),
  discount_value  NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount    NUMERIC(10,2),
  usage_limit     INT,
  used_count      INT NOT NULL DEFAULT 0,
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until     TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── orders ────────────────────────────────────────────────
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        TEXT NOT NULL UNIQUE,   -- FM-2024-00001
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  address_id          UUID REFERENCES addresses(id) ON DELETE SET NULL,

  -- Snapshot of address at time of order
  shipping_address    JSONB NOT NULL,

  -- Financials
  subtotal            NUMERIC(10,2) NOT NULL,
  discount_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee        NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount        NUMERIC(10,2) NOT NULL,

  -- Coupon
  coupon_id           UUID REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code         TEXT,

  -- Payment
  payment_method      payment_method NOT NULL DEFAULT 'cod',
  payment_status      payment_status NOT NULL DEFAULT 'pending',
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,

  -- Status
  status              order_status NOT NULL DEFAULT 'pending',
  notes               TEXT,

  -- Timestamps
  confirmed_at        TIMESTAMPTZ,
  shipped_at          TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── order_items ───────────────────────────────────────────
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id    UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  -- Snapshot at time of purchase
  product_name  TEXT NOT NULL,
  variant_name  TEXT,
  thumbnail     TEXT,
  quantity      INT NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(10,2) NOT NULL,
  total_price   NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── reviews ───────────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       TEXT,
  body        TEXT,
  images      TEXT[] NOT NULL DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible  BOOLEAN NOT NULL DEFAULT TRUE,
  helpful_count INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

-- ── order_tracking ────────────────────────────────────────
CREATE TABLE order_tracking (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      order_status NOT NULL,
  message     TEXT,
  location    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── notifications ─────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info',  -- info | success | warning | error
  link        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_products_category    ON products(category_id);
CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_active      ON products(is_active);
CREATE INDEX idx_products_featured    ON products(is_featured) WHERE is_featured;
CREATE INDEX idx_products_search      ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand, '')));
CREATE INDEX idx_products_tags        ON products USING GIN(tags);

CREATE INDEX idx_cart_user            ON cart_items(user_id);
CREATE INDEX idx_wishlist_user        ON wishlist_items(user_id);

CREATE INDEX idx_orders_user          ON orders(user_id);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_created       ON orders(created_at DESC);
CREATE INDEX idx_order_items_order    ON order_items(order_id);
CREATE INDEX idx_order_items_product  ON order_items(product_id);

CREATE INDEX idx_reviews_product      ON reviews(product_id);
CREATE INDEX idx_reviews_user         ON reviews(user_id);

CREATE INDEX idx_tracking_order       ON order_tracking(order_id);
CREATE INDEX idx_notifications_user   ON notifications(user_id, is_read);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at     BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated_at     BEFORE UPDATE ON products     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_categories_updated_at   BEFORE UPDATE ON categories   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cart_updated_at         BEFORE UPDATE ON cart_items   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at       BEFORE UPDATE ON orders       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reviews_updated_at      BEFORE UPDATE ON reviews      FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  seq INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'FM-\d{4}-(\d+)') AS INT)), 0) + 1
  INTO seq FROM orders WHERE order_number LIKE 'FM-' || TO_CHAR(NOW(), 'YYYY') || '-%';
  NEW.order_number := 'FM-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq::TEXT, 5, '0');
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Recalculate product avg_rating after review insert/update/delete
CREATE OR REPLACE FUNCTION refresh_product_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE pid UUID;
BEGIN
  pid := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE products
  SET avg_rating    = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = pid AND is_visible), 0),
      review_count  = (SELECT COUNT(*)  FROM reviews WHERE product_id = pid AND is_visible)
  WHERE id = pid;
  RETURN NULL;
END;
$$;
CREATE TRIGGER trg_review_rating AFTER INSERT OR UPDATE OR DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION refresh_product_rating();

-- Add tracking entry when order status changes
CREATE OR REPLACE FUNCTION track_order_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status <> OLD.status THEN
    INSERT INTO order_tracking(order_id, status, message)
    VALUES (NEW.id, NEW.status,
      CASE NEW.status
        WHEN 'confirmed'         THEN 'Order confirmed. We are preparing your order.'
        WHEN 'processing'        THEN 'Your order is being packed.'
        WHEN 'shipped'           THEN 'Order shipped! On its way to you.'
        WHEN 'out_for_delivery'  THEN 'Out for delivery. Expect it today!'
        WHEN 'delivered'         THEN 'Order delivered successfully!'
        WHEN 'cancelled'         THEN 'Order has been cancelled.'
        WHEN 'refunded'          THEN 'Refund initiated.'
        ELSE 'Order status updated.'
      END);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_order_tracking AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION track_order_status();

-- New user → create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles(id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_new_user AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;

-- profiles: users see/edit only their own; admins see all
CREATE POLICY "profiles_self"   ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles_admin"  ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin')));

-- addresses
CREATE POLICY "address_owner"   ON addresses FOR ALL USING (auth.uid() = user_id);

-- cart
CREATE POLICY "cart_owner"      ON cart_items FOR ALL USING (auth.uid() = user_id);

-- wishlist
CREATE POLICY "wish_owner"      ON wishlist_items FOR ALL USING (auth.uid() = user_id);

-- orders: owner + admin
CREATE POLICY "order_owner"     ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "order_insert"    ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "order_admin"     ON orders FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin')));

-- order_items: follow order
CREATE POLICY "oi_via_order"    ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid()));
CREATE POLICY "oi_admin"        ON order_items FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin')));

-- reviews
CREATE POLICY "review_select"   ON reviews FOR SELECT USING (is_visible = TRUE OR auth.uid() = user_id);
CREATE POLICY "review_insert"   ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "review_update"   ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- notifications
CREATE POLICY "notif_owner"     ON notifications FOR ALL USING (auth.uid() = user_id);

-- public read for products & categories
CREATE POLICY "products_public" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "categories_public" ON categories FOR SELECT USING (is_active = TRUE);
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
  ('Fruits & Vegetables', 'fruits-vegetables', 'Farm-fresh produce', '🥦', 1),
  ('Dairy & Eggs',        'dairy-eggs',        'Milk, cheese, curd & more', '🥛', 2),
  ('Bakery',              'bakery',            'Bread, cakes & pastries', '🍞', 3),
  ('Beverages',           'beverages',         'Juices, tea, coffee & soft drinks', '☕', 4),
  ('Snacks',              'snacks',            'Chips, biscuits & namkeen', '🍿', 5),
  ('Staples',             'staples',           'Rice, atta, dal & oils', '🌾', 6),
  ('Meat & Seafood',      'meat-seafood',      'Fresh meats & fish', '🐟', 7),
  ('Personal Care',       'personal-care',     'Skincare, haircare & hygiene', '🧴', 8),
  ('Household',           'household',         'Cleaning & home essentials', '🧹', 9),
  ('Baby Care',           'baby-care',         'Diapers, food & baby products', '👶', 10);
