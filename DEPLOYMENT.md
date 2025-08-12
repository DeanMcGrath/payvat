# PayVAT Deployment Guide

## 🚀 Quick Deploy

### Option 1: Automated Script (Recommended)
```bash
./scripts/deploy.sh "Your commit message"
```

This script will:
1. Run tests
2. Commit changes
3. Push to GitHub
4. Deploy to Vercel production

### Option 2: Manual Commands
```bash
# 1. Test your changes
npm run build

# 2. Commit changes
git add -A
git commit -m "Your commit message"

# 3. Push to GitHub
git push origin main

# 4. Deploy to Vercel
vercel --prod
```

### Option 3: Automatic via GitHub Push
Simply push to the `main` branch and GitHub Actions will automatically:
- Run tests
- Deploy to Vercel if tests pass
- Comment on the commit with deployment URL

## 🔧 Setup Requirements

### For Local Deployment Script
1. Make the script executable:
   ```bash
   chmod +x scripts/deploy.sh
   ```

2. Ensure Vercel CLI is installed:
   ```bash
   npm i -g vercel
   ```

3. Link your project to Vercel:
   ```bash
   vercel link
   ```

### For GitHub Actions (CI/CD)
Add these secrets to your GitHub repository (Settings → Secrets):

- `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - Found in `.vercel/project.json`
- `VERCEL_PROJECT_ID` - Found in `.vercel/project.json`
- `DATABASE_URL` - Your database connection string
- `JWT_SECRET` - Your JWT secret
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Your app URL
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `OPENAI_API_KEY` - OpenAI API key
- `ENCRYPTION_KEY` - Your encryption key

## 📋 Deployment Checklist

Before deploying:
- [ ] Test locally with `npm run build`
- [ ] Check for TypeScript errors with `npx tsc --noEmit`
- [ ] Run linter with `npm run lint`
- [ ] Test critical features (VAT extraction, WooCommerce)
- [ ] Review environment variables

## 🎯 Recent Fixes Deployed

### WooCommerce VAT Extraction Fix (Latest)
- **Problem**: Extracted €10,950.48 instead of €5,475.24
- **Solution**: Integrated specialized WooCommerce processor
- **Files**: `lib/documentProcessor.ts`
- **Result**: Now correctly sums "Net Total Tax" by country

## 🔍 Monitoring Deployments

### Vercel Dashboard
https://vercel.com/dashboard

### GitHub Actions
https://github.com/DeanMcGrath/payvat/actions

### Production URL
https://payvat.ie (or your production domain)

## 🆘 Troubleshooting

### Deployment Failed
1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Run `npm run build` locally to check for errors

### Vercel CLI Issues
```bash
# Reinstall Vercel CLI
npm uninstall -g vercel
npm install -g vercel@latest

# Re-link project
vercel link
```

### Test Failures
```bash
# Run specific test
npx tsx scripts/test-woocommerce-fix.ts

# Check build
npm run build
```

## 📝 Notes

- Deployments typically take 2-3 minutes
- Production deployments are automatic on push to `main`
- Preview deployments are created for pull requests
- Always test locally before deploying to production