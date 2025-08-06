# Generated Production Secrets

## 🔐 Secure Secrets (Generated)

**IMPORTANT**: Use these generated secrets for your production environment variables:

```bash
# Authentication Secrets
JWT_SECRET=oPf0U5qCXBsx9ThQs8NQ3REnXRoXZvpFue3BJgs+xJszm3f76KYqpc1K+fW19UKtX1T/PksDLAN+QdlhLkxRTg==
NEXTAUTH_SECRET=CyeTOxJs4gXC/Z06tGtoQFXac/SDXTXCM0IWIsvBRaM=
ENCRYPTION_KEY=3cc8c1b586363fa66d7df8e5658e3114

# Additional secrets you need to generate:
API_SECRET_KEY=<run: openssl rand -base64 32>
CSRF_SECRET=<run: openssl rand -base64 32>
```

## 🚀 Quick Setup Commands

### Step 1: Set Core Environment Variables

Run these commands to set essential environment variables:

```bash
cd "/Users/deanmcgrath/PAY VAT"

# Core authentication
vercel env add JWT_SECRET
# Paste: oPf0U5qCXBsx9ThQs8NQ3REnXRoXZvpFue3BJgs+xJszm3f76KYqpc1K+fW19UKtX1T/PksDLAN+QdlhLkxRTg==

vercel env add NEXTAUTH_SECRET  
# Paste: CyeTOxJs4gXC/Z06tGtoQFXac/SDXTXCM0IWIsvBRaM=

vercel env add NEXTAUTH_URL
# Paste: https://payvat.ie

vercel env add NEXT_PUBLIC_API_URL
# Paste: https://payvat.ie/api

vercel env add ENCRYPTION_KEY
# Paste: 3cc8c1b586363fa66d7df8e5658e3114
```

### Step 2: Set Up Database

**Option A: Vercel Postgres (Easiest)**
1. Go to [Vercel Dashboard → Storage](https://vercel.com/deans-projects-cdf015cf/vat-pay-ireland/stores)
2. Create Postgres database
3. Copy DATABASE_URL and add to environment variables

**Option B: Quick PostgreSQL Setup**
- Try [Supabase](https://database.new) for instant PostgreSQL
- Copy connection string as DATABASE_URL

### Step 3: Deploy Schema & Test

```bash
# After setting DATABASE_URL, deploy schema
vercel env pull .env.local
npx prisma migrate deploy

# Redeploy with new environment variables
vercel deploy --prod --yes
```

## 📋 Full Environment Variables Checklist

Copy this list and configure in [Vercel Dashboard](https://vercel.com/deans-projects-cdf015cf/vat-pay-ireland/settings/environment-variables):

```
✅ JWT_SECRET (generated above)
✅ NEXTAUTH_SECRET (generated above)  
✅ NEXTAUTH_URL (https://payvat.ie)
✅ NEXT_PUBLIC_API_URL (https://payvat.ie/api)
✅ ENCRYPTION_KEY (generated above)

❌ DATABASE_URL (need PostgreSQL database)
❌ STRIPE_SECRET_KEY (need Stripe account)
❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (need Stripe account)
❌ STRIPE_WEBHOOK_SECRET (need Stripe webhook)

Optional (can set later):
- API_SECRET_KEY
- CSRF_SECRET  
- ADMIN_EMAIL
- ADMIN_PASSWORD_HASH
- MAX_FILE_SIZE=10485760
- ALLOWED_FILE_TYPES=pdf,csv,xlsx,xls,jpg,jpeg,png
```

## 🎯 Next Immediate Steps

1. **Database**: Set up PostgreSQL (recommend Vercel Postgres)
2. **Stripe**: Get production keys from [Stripe Dashboard](https://dashboard.stripe.com)
3. **Deploy**: Run `vercel deploy --prod --yes` after each env var update
4. **Test**: Visit your app URL and test functionality

## 🔗 Your Production URLs

- **Application**: https://payvat.ie
- **Admin Dashboard**: https://payvat.ie/admin
- **API**: https://payvat.ie/api
- **Vercel Dashboard**: https://vercel.com/deans-projects-cdf015cf/vat-pay-ireland
- **Legacy URL**: https://vat-pay-ireland-illu18wg5-deans-projects-cdf015cf.vercel.app (will redirect)

Your application is **deployed and ready** - just needs database and Stripe configuration! 🚀