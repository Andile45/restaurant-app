# BiteX CMS (Web)

Restaurant management dashboard for staff, managers, and administrators. Built with React, TypeScript, and Vite.

---

## Quick run (TL;DR)

From the **project root** (`restaurant-app`):

```bash
cd src/web
npm install
```

Create `src/web/.env` with:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

Then:
```bash
npm run dev
```

Open **http://localhost:3000**. Log in with a user whose profile has role `admin`, `manager`, or `staff` (see [Database setup](#database-setup-for-cms) below).

---

## What you need

- **Node.js** v18 or newer — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Supabase project** — same as the mobile app ([Sign up](https://supabase.com/))

---

## How to run the web app

### 1. Go to the web app folder

From the **project root** (`restaurant-app`):

```bash
cd src/web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file inside `src/web/` (same folder as `package.json`).

Add (replace with your Supabase values from **Settings → API**):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

- **VITE_SUPABASE_URL** — Project URL  
- **VITE_SUPABASE_ANON_KEY** — `anon` public key  

Do not commit `.env`. It is listed in `.gitignore`.

### 4. Start the development server

```bash
npm run dev
```

The app opens at **http://localhost:3000**. Use it in your browser.

To log in you need a user whose profile has role `admin`, `manager`, or `staff` (see Database setup below).

---

## Scripts

Run these from **`src/web/`**:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | TypeScript check + production build (output in `dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

---

## Deploy on Vercel

The CMS works on [Vercel](https://vercel.com). The repo includes `vercel.json` so client-side routing (e.g. `/orders`, `/settings`) works when you refresh or open a link directly.

1. **Import the repo** in Vercel (GitHub/GitLab/Bitbucket).
2. **Set the root directory** to `src/web` (Project Settings → General → Root Directory).
3. **Add environment variables** (Project Settings → Environment Variables):
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon public key
4. **Deploy.** Vercel will run `npm install` and `npm run build` from `src/web` and serve the `dist/` output.

Use the same Supabase project and env values as in local development. No code changes are required.

---

## Database setup (for CMS)

The CMS needs the same Supabase project as the mobile app. In addition to the base schema and RLS, run these in the **Supabase SQL Editor** (from project root, in this order):

| Order | File | Purpose |
|-------|------|---------|
| 1 | `database-add-cms-roles.sql` | CMS roles (staff, manager, admin) and policies |
| 2 | `database-restaurant-settings.sql` | Restaurant settings table (single row) |
| 3 | `database-connect-restaurant-settings.sql` | Link `restaurant_settings` to orders/payments |
| 4 | `database-order-number.sql` | Add `order_number` to orders |

Then ensure at least one user has role `admin` (or `manager` / `staff`) in the `profiles` table so they can log in to the CMS.

**Invite user (optional):** To use “Invite user” from the CMS, deploy the Supabase Edge Function and set the secret. See `supabase/functions/invite-user/README.md`.

---

## Features

- **Dashboard** — Orders count, revenue, active items; date range (Today, 7 days, 30 days, month); recent orders; top items; export CSV  
- **Orders** — List, filter by status, update status (Accept → Preparing → Ready → Complete), cancel; order detail modal  
- **Menu** — Categories and Items (create, edit, delete); toggle item availability  
- **Payments** — List payments, filter by status and date; link to order  
- **Settings** — Restaurant name, address, contact; operating hours; VAT and service fee; saved to `restaurant_settings`  
- **Users** — List users, filter by role, search; change role (admin); invite user (admin, via Edge Function)  

Access to pages is role-based: Staff see Dashboard, Orders, Payments; Manager adds Menu; Admin adds Settings and Users.

---

## Tech stack

- **React 19** — UI  
- **TypeScript** — Types  
- **Vite** — Build and dev server  
- **Tailwind CSS v4** — Styling  
- **Redux Toolkit** — Auth state  
- **React Router v7** — Routing  
- **Supabase** — Auth and database  

---

## Project structure (main parts)

```
src/web/
├── src/
│   ├── api/           # Supabase client
│   ├── components/    # Layout, Typography, etc.
│   ├── pages/         # Dashboard, Orders, Menu, Settings, Users, Payments
│   ├── store/         # Redux (auth)
│   ├── theme/         # Colors, typography
│   ├── types/         # Shared TypeScript types
│   ├── utils/         # roleHelpers, errorUtils
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── .env                # You create this; not committed
```

---

## Troubleshooting

- **“Cannot find module” or install errors**  
  From `src/web/` run `npm install` again.

- **Blank page or “Failed to fetch”**  
  Check `.env`: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must match your Supabase project. Restart with `npm run dev` after changing `.env`. If the project is paused (free tier), resume it in the Supabase dashboard.

- **Login fails or “Access denied”**  
  The CMS is for users with role `admin`, `manager`, or `staff`. In Supabase, set your user’s `role` in the `profiles` table (after running `database-add-cms-roles.sql`).

- **Settings or Payments not loading**  
  Run `database-restaurant-settings.sql` and `database-connect-restaurant-settings.sql` (and for order numbers, `database-order-number.sql`) in the Supabase SQL Editor.

- **Port 3000 already in use**  
  Change `server.port` in `vite.config.ts` or stop the other app using port 3000.

---

## Security

- Do not commit `.env` or expose `VITE_SUPABASE_ANON_KEY` in server-side code. The anon key is intended for browser use with RLS.  
- CMS routes are protected; only authenticated users with a CMS role can access.  
- Sensitive operations (e.g. invite user) use Supabase Auth and RLS; the invite Edge Function uses a secret (e.g. service role key) stored in Supabase, not in the repo.

---

## License

ISC.
