# BiteX Restaurant App

A mobile app for browsing menus, placing orders, and managing your account—built with React Native (Expo) and Supabase.

---

## What you need before you start

- **Node.js** (v18 or newer) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Expo Go** on your phone (optional, for testing on a real device) — [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **A Supabase account** (free tier is fine) — [Sign up](https://supabase.com/)

---

## Quick start (run the app in a few minutes)

### 1. Clone and go into the project

```bash
git clone https://github.com/Andile45/restaurant-app.git
cd restaurant-app
```

### 2. Install dependencies

All app code lives in `src/mobile`, so install there:

```bash
cd src/mobile
npm install
```

### 3. Set up your environment variables

Create a file named `.env` inside `src/mobile/` (same folder as `package.json`).

Add these lines and replace the placeholders with your own values from the [Supabase Dashboard](https://app.supabase.com/) → your project → **Settings** → **API**:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_APP_NAME=Restaurant-App
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_if_using_payments
```

- **EXPO_PUBLIC_SUPABASE_URL** — Project URL  
- **EXPO_PUBLIC_SUPABASE_ANON_KEY** — `anon` public key  
- **EXPO_PUBLIC_APP_NAME** — App name (e.g. `Restaurant-App`)  
- **EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY** — Only needed if you use Paystack for payments  

> Don’t commit `.env` or share your keys. The repo is set up to ignore `.env`.

### 4. Run the app

From `src/mobile/`:

```bash
npm start
```

This opens the Expo dev server. Then you can:

- Press **`w`** — open in a web browser  
- Press **`a`** — open in Android emulator (if installed)  
- Press **`i`** — open in iOS simulator (Mac only)  
- **Scan the QR code** with Expo Go on your phone (same Wi‑Fi as your computer)

To use your phone when it’s not on the same network (e.g. from another place), run:

```bash
npx expo start --tunnel
```

Then scan the new QR code with Expo Go.

---

## Full setup (database and backend)

To use login, orders, and payments, you need a Supabase project and the database set up.

### 1. Create a Supabase project

1. Go to [Supabase](https://supabase.com/) and create a project.  
2. In **Settings** → **API**, copy:  
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`  
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`  

### 2. Run the database scripts

In the Supabase **SQL Editor**, run the SQL files from the **project root** in this order:

| Order | File | Purpose |
|-------|------|--------|
| 1 | `database-complete-rls-policies.sql` | Tables and RLS policies |
| 2 | `database-final-trigger-fix.sql` | Profile creation trigger |
| 3 | `database-add-price-at-purchase.sql` | Price-at-purchase field |
| 4 | `database-cleanup-duplicates.sql` | Optional: clean duplicates |
| 5 | `database-seed-data.sql` | Sample menu and data |

Run each script once, in order. If a script says something already exists, that’s usually fine.

### 3. Database schema

The database consists of the following tables:

#### Tables overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User and admin accounts | `auth_uid`, `name`, `email`, `role` |
| `categories` | Menu categories | `name` |
| `food_items` | Menu items | `name`, `price`, `category_id`, `image_url` |
| `orders` | Customer orders | `user_id`, `total`, `status`, `address` |
| `order_items` | Items in each order | `order_id`, `food_id`, `quantity`, `price_at_purchase` |
| `payments` | Payment records | `order_id`, `amount`, `payment_status` |

#### Complete schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1️⃣ Profiles Table (Users & Admins)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_uid UUID UNIQUE, -- Supabase Auth UID
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    contact_number TEXT,
    address TEXT,
    card_last4 TEXT,      
    role TEXT DEFAULT 'user', -- 'user' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2️⃣ Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3️⃣ Food Items Table
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4️⃣ Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5️⃣ Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES food_items(id) ON DELETE RESTRICT,
    quantity INT DEFAULT 1,
    price_at_purchase NUMERIC(10,2), -- Price at time of purchase
    extras JSONB, -- sides, drinks, add-ons, removals
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6️⃣ Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    card_last4 TEXT,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Row Level Security (RLS)

Row Level Security is enabled on all tables to ensure users can only access their own data:

- **Profiles**: Users can view/update only their own profile
- **Orders**: Users can view/update only their own orders
- **Order Items**: Users can view only items from their own orders
- **Categories & Food Items**: Publicly readable (anyone can view the menu)
- **Payments**: Users can view only payments for their own orders
- **Admins**: Can manage everything (configured via `role = 'admin'` in profiles)

> **Note**: The complete RLS policies are set up by running `database-complete-rls-policies.sql` as part of the setup process.

#### Relationships

```
profiles (1) ──→ (many) orders
orders (1) ──→ (many) order_items
orders (1) ──→ (many) payments
categories (1) ──→ (many) food_items
food_items (1) ──→ (many) order_items
```

For the complete SQL schema file, see **`Database-Schema.sql`** in the project root.

---

## Available scripts

Run these from **`src/mobile/`**:

| Command | What it does |
|--------|----------------|
| `npm start` | Start Expo dev server (default) |
| `npm run android` | Start and open on Android |
| `npm run ios` | Start and open on iOS (Mac only) |
| `npm run web` | Start and open in the browser |
| `npx expo start --tunnel` | Start with tunnel (for remote devices) |

---

## Features

- **Auth** — Sign up, log in, forgot password  
- **Menu** — Browse categories and food items  
- **Cart** — Add items, adjust quantities  
- **Orders** — View and track orders  
- **Profile** — Edit profile and view account info  
- **Payments** — Paystack integration (when configured)  

---

## Tech stack

- **App**: React Native (Expo)  
- **Backend**: Supabase (PostgreSQL + Auth)  
- **State**: Redux Toolkit  
- **Navigation**: React Navigation  
- **Forms**: Formik + Yup  
- **Icons**: @expo/vector-icons  

---

## Troubleshooting

- **“Cannot find module” or similar**  
  From `src/mobile/` run `npm install` again.

- **Blank screen or “Something went wrong”**  
  Check that `.env` is in `src/mobile/` and that `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are correct. Restart with `npm start` after changing `.env`.

- **QR code won’t connect on phone**  
  Use tunnel mode: `npx expo start --tunnel`, and ensure your phone has the latest Expo Go.

- **Database errors (RLS, missing table)**  
  Run the SQL scripts in the order listed in **Full setup** above.

---

## Security

- Never commit `.env` or real API keys.  
- Row Level Security (RLS) is enabled on Supabase tables.  
- Database scripts in this repo do not contain credentials.

---

## License

ISC.
