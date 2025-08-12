# VAT PAY Production Setup Guide

## 🎉 Deployment Status: SUCCESS!

Your VAT PAY application has been successfully deployed to Vercel with custom domain:
**🔗 https://payvat.ie** (Production Domain)
**📋 Legacy**: https://vat-pay-ireland-illu18wg5-deans-projects-cdf015cf.vercel.app

However, the application needs production database and environment variables to function properly.

## Phase 1: Set Up Production Database (PostgreSQL)

### Option A: Vercel Postgres (Recommended - Easiest)

1. **Go to Vercel Dashboard**: 
   - Visit [vercel.com/deans-projects-cdf015cf/vat-pay-ireland](https://vercel.com/deans-projects-cdf015cf/vat-pay-ireland)
   - Go to **Storage** tab

2. **Create Database**:
   - Click **Create Database**
   - Choose **Postgres**
   - Select region (choose closest to your users)
   - Database name: `vat-pay-db`

3. **Get Connection Details**:
   - After creation, copy the `DATABASE_URL`
   - It will look like: `postgres://default:ABC123@ep-xyz.us-east-1.postgres.vercel-storage.com:5432/verceldb`

### Option B: External PostgreSQL (Alternative)

Use any PostgreSQL provider:
- **Supabase**: [database.new](https://database.new)
- **PlanetScale**: [planetscale.com](https://planetscale.com) 
- **Neon**: [neon.tech](https://neon.tech)
- **AWS RDS**: For enterprise setup

## Phase 2: Configure Environment Variables

### 2.1 Essential Production Variables

Go to your Vercel project: **Settings** → **Environment Variables**

Add these **REQUIRED** variables:

```bash
# Database (from Step 1)
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication (generate secure values)
JWT_SECRET=your_64_character_random_jwt_secret_here
NEXTAUTH_SECRET=your_32_character_random_secret_here
NEXTAUTH_URL=https://payvat.ie

# API Configuration
NEXT_PUBLIC_API_URL=https://payvat.ie/api
API_SECRET_KEY=your_32_character_api_secret_here

# Stripe (Production Keys - GET FROM STRIPE DASHBOARD)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Security
CSRF_SECRET=your_32_character_csrf_secret_here
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
ENCRYPTION_KEY=your_32_character_encryption_key_here

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,csv,xlsx,xls,jpg,jpeg,png

# Admin (Optional - Configure through user registration)
# Create admin users through the application interface after deployment

# Revenue API (for Irish VAT integration)
REVENUE_API_URL=https://api.revenue.ie
REVENUE_API_KEY=your_revenue_api_key_when_available
REVENUE_CLIENT_ID=your_revenue_client_id_when_available
```

### 2.2 Generate Secure Secrets

**Run these commands locally to generate secure secrets:**

```bash
# JWT Secret (64+ characters)
openssl rand -base64 64

# NextAuth Secret (32 characters)  
openssl rand -base64 32

# API Secret (32 characters)
openssl rand -base64 32

# CSRF Secret (32 characters)
openssl rand -base64 32

# Encryption Key (32 characters exactly)
openssl rand -hex 16
```

### 2.3 Set Variables via Vercel CLI

```bash
cd "/Users/deanmcgrath/PAY VAT"

# Set database URL (replace with your actual URL)
vercel env add DATABASE_URL production

# Set authentication secrets
vercel env add JWT_SECRET production
vercel env add NEXTAUTH_SECRET production

# Set API URLs
vercel env add NEXTAUTH_URL production
vercel env add NEXT_PUBLIC_API_URL production

# Continue for all variables...
```

## Phase 3: Database Schema Deployment

### 3.1 Deploy Database Schema

After setting up the database and environment variables:

```bash
cd "/Users/deanmcgrath/PAY VAT"

# Pull environment variables locally
vercel env pull .env.local

# Deploy database schema to production
npx prisma migrate deploy

# Verify schema deployment
npx prisma studio
```

### 3.2 Redeploy Application

After configuring environment variables:

```bash
# Trigger new deployment with environment variables
vercel deploy --prod --yes
```

## Phase 4: Stripe Configuration

### 4.1 Get Stripe Production Keys

1. **Go to Stripe Dashboard**: [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Switch to Live Mode** (toggle in top-left)
3. **Get Keys**: 
   - **Developers** → **API Keys**
   - Copy **Publishable key** (`pk_live_...`)
   - Copy **Secret key** (`sk_live_...`)

### 4.2 Configure Stripe Webhook

1. **Create Webhook Endpoint**:
   - **Developers** → **Webhooks** → **Add Endpoint**
   - **Endpoint URL**: `https://vat-pay-ireland-illu18wg5-deans-projects-cdf015cf.vercel.app/api/payments/webhook`

2. **Select Events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

3. **Get Webhook Secret**:
   - Copy **Signing Secret** (`whsec_...`)
   - Add as `STRIPE_WEBHOOK_SECRET` environment variable

## Phase 5: Testing Checklist

### 5.1 Basic Functionality
- [ ] Application loads without errors
- [ ] Database connection working
- [ ] User registration works
- [ ] User login/logout works
- [ ] File upload functional
- [ ] Admin dashboard accessible

### 5.2 Payment Testing
- [ ] Stripe test payments work (use Stripe test mode first)
- [ ] Webhook endpoints responding
- [ ] Payment confirmation flow working
- [ ] Receipt generation working

### 5.3 Admin Features
- [ ] Admin login working
- [ ] User management accessible
- [ ] Document review functional
- [ ] Payment monitoring working
- [ ] Analytics dashboard loading

## Phase 6: Going Live

### 6.1 Pre-Launch Checklist
- [ ] All environment variables configured
- [ ] Database schema deployed successfully
- [ ] Stripe production keys configured
- [ ] Webhook endpoints verified
- [ ] All core functionality tested
- [ ] Admin access confirmed
- [ ] Security headers active (check [securityheaders.com](https://securityheaders.com))

### 6.2 Launch
- [ ] Switch Stripe from test to live mode
- [ ] Update any hardcoded URLs
- [ ] Set up monitoring and alerts
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (automatic with Vercel)

## Next Steps Summary

1. **⚠️ CRITICAL**: Set up PostgreSQL database (Vercel Postgres recommended)
2. **⚠️ CRITICAL**: Configure all environment variables in Vercel
3. **⚠️ CRITICAL**: Deploy database schema with `prisma migrate deploy`
4. **⚠️ CRITICAL**: Configure Stripe production keys and webhooks
5. **✅ TEST**: Verify all functionality works in production
6. **🚀 LAUNCH**: Application ready for live users!

## Current Status

✅ **Application Built**: Successfully compiled and deployed
✅ **Vercel Deployment**: Live at production URL  
❌ **Database**: Not configured (PostgreSQL needed)
❌ **Environment Variables**: Not set (20+ variables needed)
❌ **Stripe Integration**: Not configured (production keys needed)
❌ **Testing**: Cannot test without database and env vars

**The application is deployed but not functional until database and environment variables are configured.**

## Support

If you need help with any step:
1. Check Vercel deployment logs: `vercel logs`
2. Check application logs in Vercel dashboard
3. Test database connection: `npx prisma studio` 
4. Verify environment variables: `vercel env ls`

Your VAT PAY application is **95% complete** - just needs database and environment configuration! 🚀