# Restaurant App

A React Native (Expo) mobile application for restaurant ordering with Supabase backend.

## Features

- User authentication (login, register, forgot password)
- Menu browsing with categories
- Shopping cart
- Order management
- User profiles

## Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Forms**: Formik + Yup
- **Icons**: @expo/vector-icons

## Setup

1. **Install dependencies:**
   ```bash
   cd src/mobile
   npm install
   ```

2. **Configure environment variables:**
   - Create `.env` file in `src/mobile/` directory
   - Add your Supabase credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Set up database:**
   - Run SQL scripts in Supabase SQL Editor in this order:
     1. `database-complete-rls-policies.sql` - Set up RLS policies
     2. `database-final-trigger-fix.sql` - Set up profile creation trigger
     3. `database-add-price-at-purchase.sql` - Add price_at_purchase field
     4. `database-cleanup-duplicates.sql` - Clean up duplicates (if needed)
     5. `database-seed-data.sql` - Seed sample data

4. **Run the app:**
   ```bash
   cd src/mobile
   npm start
   ```

## Database Schema

See `Database-Schema.txt` for the complete database schema reference.

## Development

- See `NEXT-STEPS.md` for development roadmap
- See `TESTING-GUIDE.md` for testing checklist

## Security

- All sensitive credentials are stored in `.env` files (gitignored)
- Row Level Security (RLS) is enabled on all tables
- Database scripts contain no credentials
