# PostgreSQL Database Setup Guide - VAT PAY

## ✅ **Schema Updated: SQLite → PostgreSQL**

Your Prisma schema has been updated for PostgreSQL compatibility. Now let's set up your production database!

## 🎯 **Step-by-Step Database Setup**

### **Step 1: Create Vercel PostgreSQL Database (Recommended)**

#### **1.1 Access Vercel Dashboard**
1. **Go to your project**: [https://vercel.com/deans-projects-cdf015cf/vat-pay-ireland](https://vercel.com/deans-projects-cdf015cf/vat-pay-ireland)
2. **Click "Storage" tab** in the top navigation
3. **Click "Create Database"**

#### **1.2 Configure Database**
- **Database Type**: Select **"Postgres"**
- **Database Name**: `vat-pay-production`
- **Region**: Choose **"Washington, D.C. (iad1)"** (matches your app deployment)
- **Click "Create"**

#### **1.3 Get Connection String**
After creation, you'll see:
```
DATABASE_URL=postgresql://default:ABC123XYZ@ep-cool-name-123456.us-east-1.postgres.vercel-storage.com:5432/verceldb
```

**Copy this entire connection string** - you'll need it in Step 2.

### **Step 2: Configure Environment Variable**

Run this command in your terminal:

```bash
cd "/Users/deanmcgrath/PAY VAT"

# Add database URL (paste your actual connection string)
vercel env add DATABASE_URL production
```

**When prompted, paste your PostgreSQL connection string from Step 1.3**

### **Step 3: Deploy Database Schema**

#### **3.1 Update Local Environment**
```bash
cd "/Users/deanmcgrath/PAY VAT"

# Pull environment variables locally
vercel env pull .env.local

# Generate Prisma client for PostgreSQL
npx prisma generate
```

#### **3.2 Create Production Migration**
```bash
# Create a fresh migration for PostgreSQL
npx prisma migrate dev --name init_postgresql

# Deploy to production database
npx prisma migrate deploy
```

#### **3.3 Verify Schema Deployment**
```bash
# Open database browser (optional)
npx prisma studio
```

This will open a browser interface where you can verify these tables were created:
- ✅ **users** - User accounts and business info
- ✅ **vat_returns** - VAT submissions and calculations  
- ✅ **documents** - File uploads and metadata
- ✅ **payments** - Payment processing records
- ✅ **audit_logs** - System activity tracking

### **Step 4: Deploy Updated Application**

```bash
# Deploy with database integration
vercel deploy --prod --yes
```

## 🔄 **Alternative: Supabase Database (If Vercel Postgres Unavailable)**

### **4.1 Create Supabase Database**
1. **Go to**: [database.new](https://database.new) (Supabase quick start)
2. **Sign up/login** with GitHub
3. **Create new project**:
   - Project name: `vat-pay-production`
   - Database password: (create strong password)
   - Region: `East US (North Virginia)`
4. **Wait 2-3 minutes** for database provisioning

### **4.2 Get Connection String**
1. **Go to Project Settings** → **Database**
2. **Copy "Connection string"** under "Connection pooling"
3. **Replace `[YOUR-PASSWORD]`** with your database password

Example format:
```
postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### **4.3 Continue with Step 2** above (same process)

## 📊 **Database Schema Overview**

### **Your VAT PAY database includes:**

#### **🏢 User Management**
- **users table**: 20+ fields including business info, VAT numbers, authentication
- **Unique constraints**: Email, VAT numbers
- **Role-based access**: USER, ADMIN, SUPER_ADMIN

#### **📋 VAT Returns**
- **vat_returns table**: Complete Irish VAT return data
- **Calculations**: Sales VAT, Purchase VAT, Net VAT
- **Status tracking**: DRAFT → SUBMITTED → APPROVED → PAID
- **Due dates**: Automatic calculation based on period

#### **📄 Document Management**
- **documents table**: File metadata and categorization  
- **Categories**: SALES, PURCHASES, EXPENSES, OTHER
- **File types**: PDF, Excel, images
- **Scanning**: Integration ready for OCR processing

#### **💳 Payment Processing**
- **payments table**: Complete payment lifecycle
- **Stripe integration**: Payment intents, webhooks, receipts
- **Status tracking**: PENDING → PROCESSING → COMPLETED/FAILED
- **Audit trail**: All payment events logged

#### **🔍 Compliance & Auditing**
- **audit_logs table**: Every system action tracked
- **IP addresses**: Security monitoring
- **User actions**: Login, uploads, payments, admin actions
- **Metadata**: Detailed event information for compliance

## 🚀 **Expected Results After Setup**

### **✅ What Will Work Immediately:**
- **User Registration**: Create business accounts
- **User Login**: JWT authentication with database
- **Document Uploads**: File storage with database records
- **VAT Calculations**: Create and save VAT returns
- **Admin Dashboard**: User management, document oversight
- **Audit Logging**: All system activities tracked

### **⏳ Still Needs (After Database):**
- **Payment Processing**: Requires Stripe production keys
- **Email Verification**: Optional feature
- **Revenue API**: Irish government integration

## 🔧 **Troubleshooting**

### **Connection Issues:**
```bash
# Test connection
npx prisma db pull

# If connection fails, check:
# 1. DATABASE_URL is correctly set
# 2. Database is running (for Supabase/external)
# 3. IP allowlist (some providers require this)
```

### **Migration Issues:**
```bash
# Reset migrations if needed
rm -rf prisma/migrations
npx prisma migrate dev --name init

# Force deploy to production
npx prisma migrate deploy --force
```

### **Schema Issues:**
```bash
# Compare local vs production schema
npx prisma db pull
npx prisma generate
```

## 📈 **Performance Optimization**

### **Connection Pooling** (Automatic with Vercel Postgres)
- **Vercel**: Built-in connection pooling
- **Supabase**: Connection pooling enabled by default
- **Manual setup**: Not required for either option

### **Indexing** (Already Optimized)
Your schema includes optimized indexes for:
- User lookups (email, VAT number)
- VAT return searches (user, period, status)
- Document categorization
- Payment tracking
- Audit log queries

## 🎯 **Next Steps After Database Setup**

1. **✅ Test Database**: Verify connection and tables
2. **✅ Test Registration**: Create a test business account
3. **✅ Test Login**: Verify authentication works
4. **✅ Test File Upload**: Upload a test document
5. **✅ Test Admin**: Access admin dashboard
6. **⏳ Stripe Setup**: Configure payment processing
7. **🚀 Go Live**: payvat.ie ready for Irish businesses!

## 📞 **Need Help?**

**If you encounter issues:**
- **Database connection**: Check environment variables with `vercel env ls`
- **Migration problems**: Review error messages carefully
- **Schema issues**: Compare with working SQLite version

Your database setup should take **15-20 minutes** and will unlock **90% of your application functionality**! 🎉

---

**Ready to serve Irish businesses with professional VAT management!** 🇮🇪💼