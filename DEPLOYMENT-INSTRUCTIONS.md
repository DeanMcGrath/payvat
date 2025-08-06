# VAT PAY Deployment Instructions

## Step 1: Push to GitHub

Since you don't have GitHub CLI installed, please follow these steps:

### Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and log in to your account
2. Click "New Repository" or visit [github.com/new](https://github.com/new)  
3. Set repository name: `vat-pay-ireland`
4. Set description: `Irish VAT Return Management System for businesses - Complete solution for VAT submission and payment processing`
5. Choose **Public** or **Private** (recommend Private for business app)
6. **Do NOT** initialize with README, .gitignore, or license (we have our own)
7. Click "Create Repository"

### Push Local Code to GitHub
After creating the repository, run these commands in your terminal:

```bash
cd "/Users/deanmcgrath/PAY VAT"

# Add the GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/vat-pay-ireland.git

# Push the code to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 2: Deploy to Vercel

### 2.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project" 
3. Import your `vat-pay-ireland` GitHub repository
4. Vercel will auto-detect it's a Next.js project

### 2.2 Configure Build Settings
Vercel should auto-configure, but verify these settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`  
- **Install Command**: `npm install`
- **Output Directory**: `.next`

### 2.3 Set Up Environment Variables
Add these environment variables in Vercel dashboard:

#### Required Environment Variables
```
# Database (PostgreSQL - use Vercel Postgres)
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Authentication
JWT_SECRET=your_random_jwt_secret_64_chars_long_minimum
NEXTAUTH_SECRET=your_random_nextauth_secret_64_chars_long
NEXTAUTH_URL=https://your-vercel-app.vercel.app

# Stripe (Production keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key  
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# API Configuration
NEXT_PUBLIC_API_URL=https://your-vercel-app.vercel.app/api
API_SECRET_KEY=your_api_secret_key

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,csv,xlsx,xls,jpg,jpeg,png

# Security
CSRF_SECRET=your_csrf_secret_key
RATE_LIMIT_MAX_REQUESTS=100  
RATE_LIMIT_WINDOW_MS=900000
ENCRYPTION_KEY=your_32_char_encryption_key

# Admin (optional)
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password

# Revenue API (for production)
REVENUE_API_URL=https://api.revenue.ie
REVENUE_API_KEY=your_revenue_api_key
REVENUE_CLIENT_ID=your_revenue_client_id
```

### 2.4 Set Up Database (Vercel Postgres)

#### Option 1: Vercel Postgres (Recommended)
1. In Vercel dashboard, go to Storage tab
2. Create new Postgres database  
3. Copy the `DATABASE_URL` to your environment variables
4. The database will be automatically connected to your project

#### Option 2: External PostgreSQL
- Use any PostgreSQL provider (Supabase, PlanetScale, AWS RDS, etc.)
- Get connection string and add as `DATABASE_URL`

### 2.5 Deploy
1. Click "Deploy" in Vercel
2. Wait for build to complete
3. After deployment, run database migrations

### 2.6 Run Database Migrations
After first deployment, you need to set up the database schema:

1. Go to your Vercel project dashboard
2. Go to Functions tab → Edge Runtime
3. Or use Vercel CLI locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel  
vercel login

# Link your project
vercel link

# Run database migration
vercel env pull .env.local
npx prisma migrate deploy
```

## Step 3: Post-Deployment Setup

### 3.1 Test the Application
- Visit your Vercel URL
- Test user registration and login
- Test file upload functionality  
- Test VAT calculation and submission
- Test payment processing (use Stripe test mode first)

### 3.2 Configure Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-vercel-app.vercel.app/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` env var

### 3.3 Set Up Custom Domain (Optional)
1. In Vercel project settings → Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_API_URL` environment variables

## Step 4: Production Checklist

### Security
- [ ] All environment variables configured
- [ ] Database secured with proper credentials
- [ ] Stripe production keys configured
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Security headers enabled (configured in next.config.mjs)

### Functionality Testing
- [ ] User registration and authentication working
- [ ] File upload and document management working
- [ ] VAT calculations accurate for Irish rates
- [ ] Payment processing working with real Stripe account
- [ ] Admin dashboard accessible and functional
- [ ] All API endpoints responding correctly

### Performance
- [ ] Build successful without errors
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] File upload limits configured correctly

### Compliance
- [ ] Privacy policy and terms of service added
- [ ] GDPR compliance implemented
- [ ] Irish VAT regulations compliance verified
- [ ] Audit logging working correctly

## Environment Variables Generator

Use these commands to generate secure secrets:

```bash
# JWT Secret (64+ characters)
openssl rand -base64 64

# NextAuth Secret  
openssl rand -base64 32

# API Secret
openssl rand -base64 32

# CSRF Secret
openssl rand -base64 32

# Encryption Key (32 characters exactly)
openssl rand -hex 16
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check database connection  
3. Verify all environment variables are set
4. Test Stripe webhook endpoint
5. Review application logs in Vercel dashboard

## Quick Deployment Summary

1. **GitHub**: Create repository and push code
2. **Vercel**: Import repository and configure
3. **Database**: Set up PostgreSQL and run migrations
4. **Environment**: Configure all required environment variables
5. **Stripe**: Set up webhooks and production keys
6. **Test**: Verify all functionality works in production

Your VAT PAY application is now ready for production use! 🚀