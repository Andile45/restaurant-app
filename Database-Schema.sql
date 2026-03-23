-- Enable UUID extension
create extension if not exists "uuid-ossp";

------------------------------------------------------
-- 1️⃣ Profiles Table (Users & Admins)
------------------------------------------------------
create table profiles (
    id uuid primary key default uuid_generate_v4(),
    auth_uid uuid unique, -- Supabase Auth UID
    name text not null,
    surname text not null,
    email text unique not null,
    contact_number text,
    address text,
    card_last4 text,      
    role text default 'user', -- 'user' or 'admin'
    created_at timestamp default current_timestamp
);

------------------------------------------------------
-- 2️⃣ Categories Table
------------------------------------------------------
create table categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    created_at timestamp default current_timestamp
);

------------------------------------------------------
-- 3️⃣ Food Items Table
------------------------------------------------------
create table food_items (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid not null references categories(id) on delete cascade,
    name text not null,
    description text,
    price numeric(10,2) not null,
    image_url text,
    is_available boolean default true,
    created_at timestamp default current_timestamp
);

------------------------------------------------------
-- 4️⃣ Orders Table
------------------------------------------------------
create table orders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references profiles(id) on delete cascade,
    total numeric(10,2) not null,
    status text default 'pending',
    -- Order lifecycle statuses:
    -- 'pending' = awaiting payment
    -- 'new' = paid, awaiting staff preparation/acceptance
    -- 'preparing' -> 'ready' -> 'completed' = staff progression
    -- 'payment_failed' = payment attempt failed/cancelled after order creation
    address text,
    created_at timestamp default current_timestamp
);

-- Ensure valid order.status values.
-- This is required because the app uses more statuses than the original schema.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS order_status_check;
ALTER TABLE orders
  ADD CONSTRAINT order_status_check
  CHECK (
    status IN (
      'pending',
      'new',
      'preparing',
      'ready',
      'completed',
      'cancelled',
      'payment_failed'
    )
  );

------------------------------------------------------
-- 5️⃣ Order Items Table
------------------------------------------------------
create table order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references orders(id) on delete cascade,
    food_id uuid not null references food_items(id) on delete restrict,
    quantity int default 1,
    price_at_purchase numeric(10,2),
    extras jsonb, -- sides, drinks, add-ons, removals
    created_at timestamp default current_timestamp
);

------------------------------------------------------
-- 6️⃣ Payments Table
------------------------------------------------------
create table payments (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references orders(id) on delete cascade,
    amount numeric(10,2) not null,
    card_last4 text,
    payment_status text default 'pending', -- 'pending', 'completed', 'failed'
    created_at timestamp default current_timestamp
);

------------------------------------------------------
-- 7️⃣ Row Level Security (RLS)
------------------------------------------------------
-- Enable RLS
alter table orders enable row level security;
alter table order_items enable row level security;
alter table profiles enable row level security;

-- Users can access only their own profiles
create policy "users can view own profile"
on profiles
for select, update
using (auth.uid() = auth_uid);

-- Users can access only their own orders
create policy "users can view own orders"
on orders
for select, update
using (auth.uid() = (select auth_uid from profiles where profiles.id = orders.user_id));

-- Users can access only their own order items
create policy "users can view own order items"
on order_items
for select
using (auth.uid() = (select auth_uid from profiles where profiles.id = (select user_id from orders where orders.id = order_items.order_id)));

-- Admin can view everything
create policy "admins can manage everything"
on orders
for all
using ((select role from profiles where profiles.id = orders.user_id) = 'admin');
