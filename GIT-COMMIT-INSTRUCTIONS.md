# Git Commit Instructions

Due to permission restrictions, please run these commands manually in your terminal.

## Step 1: Remove Git Lock File (if exists)
```powershell
cd c:\Users\HP\Downloads\restaurant-app
if (Test-Path ".git/index.lock") { Remove-Item ".git/index.lock" -Force }
```

## Step 2: Commit Changes in Logical Groups

### Commit 1: Security Fixes
```powershell
git add src/mobile/api/paystack.api.ts
git add src/mobile/api/paystack-web.api.ts
git add src/mobile/.env.example
git commit -m "security: remove hardcoded API keys and add environment variable validation

- Remove hardcoded Paystack public key fallbacks from paystack.api.ts and paystack-web.api.ts
- Add error handling to require environment variables instead of silent fallbacks
- Create .env.example template file with security notes
- Ensure all sensitive data is loaded from environment variables only"
```

### Commit 2: Code Cleanup
```powershell
git add src/mobile/app/(main)/Cart.tsx
git add src/mobile/app/(main)/Home.tsx
git add src/mobile/app/(main)/Orders.tsx
git add src/mobile/store/slices/cartSlice.ts
git add src/mobile/store/slices/menuSlice.ts
git add src/mobile/store/slices/orderSlice.ts
git add src/mobile/store/slices/authSlice.ts
git add src/mobile/store/slices/authThunks.ts
git commit -m "refactor: remove unnecessary comments from codebase

- Remove obvious comments that restate what code does
- Remove section divider comments that don't add value
- Remove 'Async thunks' and 'Re-export' comments
- Keep useful comments explaining complex logic and error handling patterns"
```

### Commit 3: Documentation
```powershell
git add README.md
git add database-*.sql
git commit -m "docs: add README and database migration scripts

- Add comprehensive README with setup instructions
- Add database migration and setup SQL scripts
- Include RLS policies, triggers, and seed data scripts"
```

### Commit 4: New Features
```powershell
git add src/mobile/app/(main)/Payment.tsx
git add src/mobile/app/(main)/OrderDetails.tsx
git add src/mobile/app/(main)/EditProfile.tsx
git add src/mobile/components/EmptyState.tsx
git add src/mobile/components/SkeletonLoader.tsx
git add src/mobile/components/auth/
git add src/mobile/components/home/
git add src/mobile/components/orders/
git add src/mobile/store/slices/paymentSlice.ts
git add src/mobile/store/slices/authThunks/
git commit -m "feat: add payment processing, order details, and profile editing

- Implement Paystack payment integration with WebView and native SDK support
- Add order details screen with full order information display
- Add profile editing functionality
- Add reusable EmptyState and SkeletonLoader components
- Add payment slice for state management
- Refactor auth thunks into separate files for better organization"
```

### Commit 5: Remaining Changes
```powershell
git add -A
git commit -m "chore: update remaining files and dependencies

- Update package.json and package-lock.json with new dependencies
- Update component styles and theme files
- Update store configuration and slices
- Update app configuration and navigation"
```

## Step 3: Push to GitHub
```powershell
git push origin main
```

## Alternative: Single Commit (if you prefer)
If you prefer a single commit instead of multiple logical commits:

```powershell
git add -A
git commit -m "chore: security improvements, code cleanup, and feature additions

Security:
- Remove hardcoded API keys and add environment variable validation
- Create .env.example template file

Code Quality:
- Remove unnecessary comments from codebase
- Clean up code structure

Features:
- Add payment processing with Paystack integration
- Add order details screen
- Add profile editing functionality
- Add reusable UI components

Documentation:
- Add comprehensive README
- Add database migration scripts"
git push origin main
```

## Troubleshooting

If you encounter permission errors:
1. Close any Git GUI applications (GitHub Desktop, SourceTree, etc.)
2. Close your IDE/editor temporarily
3. Run commands as Administrator if needed
4. Check if any git processes are running: `Get-Process git`

If you encounter authentication errors when pushing:
- Make sure you're authenticated with GitHub (use GitHub CLI or SSH keys)
- Or use: `git push https://YOUR_USERNAME@github.com/YOUR_REPO.git main`
