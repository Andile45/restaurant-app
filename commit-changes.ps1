# Git commit script for restaurant app changes
# This script organizes changes into logical commits with proper messages

Write-Host "Starting git commit process..." -ForegroundColor Green

# Check if git lock file exists and remove it
if (Test-Path ".git/index.lock") {
    Write-Host "Removing git lock file..." -ForegroundColor Yellow
    Remove-Item ".git/index.lock" -Force
}

# Commit 1: Security fixes
Write-Host "`n[1/5] Committing security fixes..." -ForegroundColor Cyan
git add "src/mobile/api/paystack.api.ts"
git add "src/mobile/api/paystack-web.api.ts"
git add "src/mobile/.env.example"
git commit -m "security: remove hardcoded API keys and add environment variable validation

- Remove hardcoded Paystack public key fallbacks from paystack.api.ts and paystack-web.api.ts
- Add error handling to require environment variables instead of silent fallbacks
- Create .env.example template file with security notes
- Ensure all sensitive data is loaded from environment variables only"

# Commit 2: Code cleanup - remove unnecessary comments
Write-Host "`n[2/5] Committing code cleanup..." -ForegroundColor Cyan
git add "src/mobile/app/(main)/Cart.tsx"
git add "src/mobile/app/(main)/Home.tsx"
git add "src/mobile/app/(main)/Orders.tsx"
git add "src/mobile/store/slices/cartSlice.ts"
git add "src/mobile/store/slices/menuSlice.ts"
git add "src/mobile/store/slices/orderSlice.ts"
git add "src/mobile/store/slices/authSlice.ts"
git add "src/mobile/store/slices/authThunks.ts"
git commit -m "refactor: remove unnecessary comments from codebase

- Remove obvious comments that restate what code does
- Remove section divider comments that don't add value
- Remove 'Async thunks' and 'Re-export' comments
- Keep useful comments explaining complex logic and error handling patterns"

# Commit 3: Documentation
Write-Host "`n[3/5] Committing documentation..." -ForegroundColor Cyan
git add "README.md"
git add "database-*.sql"
git commit -m "docs: add README and database migration scripts

- Add comprehensive README with setup instructions
- Add database migration and setup SQL scripts
- Include RLS policies, triggers, and seed data scripts"

# Commit 4: New features
Write-Host "`n[4/5] Committing new features..." -ForegroundColor Cyan
git add "src/mobile/app/(main)/Payment.tsx"
git add "src/mobile/app/(main)/OrderDetails.tsx"
git add "src/mobile/app/(main)/EditProfile.tsx"
git add "src/mobile/components/EmptyState.tsx"
git add "src/mobile/components/SkeletonLoader.tsx"
git add "src/mobile/components/auth/"
git add "src/mobile/components/home/"
git add "src/mobile/components/orders/"
git add "src/mobile/store/slices/paymentSlice.ts"
git add "src/mobile/store/slices/authThunks/"
git commit -m "feat: add payment processing, order details, and profile editing

- Implement Paystack payment integration with WebView and native SDK support
- Add order details screen with full order information display
- Add profile editing functionality
- Add reusable EmptyState and SkeletonLoader components
- Add payment slice for state management
- Refactor auth thunks into separate files for better organization"

# Commit 5: Remaining changes
Write-Host "`n[5/5] Committing remaining changes..." -ForegroundColor Cyan
git add -A
git commit -m "chore: update remaining files and dependencies

- Update package.json and package-lock.json with new dependencies
- Update component styles and theme files
- Update store configuration and slices
- Update app configuration and navigation"

Write-Host "`nAll commits completed successfully!" -ForegroundColor Green
Write-Host "`nReady to push. Run: git push origin main" -ForegroundColor Yellow
