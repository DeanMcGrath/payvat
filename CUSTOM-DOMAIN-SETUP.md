# Custom Domain Setup: payvat.ie

## 🎉 Professional Domain Configuration

Your VAT PAY application is now configured for the professional domain **payvat.ie**!

## ✅ DNS Configuration Required

**IMPORTANT**: You need to configure these DNS records at your domain provider where you registered `payvat.ie`:

### DNS Records to Add

```
Type: A
Name: @ (or blank/root)
Value: 216.198.79.1
TTL: 300

Type: A  
Name: www
Value: 216.198.79.1
TTL: 300

Type: CNAME (optional, for www redirect)
Name: www
Value: payvat.ie
TTL: 300
```

### DNS Provider Instructions

1. **Log into your DNS provider** (where you registered payvat.ie)
2. **Find DNS Management** (usually called "DNS", "Nameservers", or "Domain Management")
3. **Add the A records** above
4. **Save changes** and wait 5-10 minutes for propagation

## 🔐 Updated Environment Variables for payvat.ie

### Essential Variables (Updated for Custom Domain)

```bash
# Core URLs (MUST match your domain exactly)
NEXTAUTH_URL=https://payvat.ie
NEXT_PUBLIC_API_URL=https://payvat.ie/api

# Authentication Secrets (Generated)
JWT_SECRET=oPf0U5qCXBsx9ThQs8NQ3REnXRoXZvpFue3BJgs+xJszm3f76KYqpc1K+fW19UKtX1T/PksDLAN+QdlhLkxRTg==
NEXTAUTH_SECRET=CyeTOxJs4gXC/Z06tGtoQFXac/SDXTXCM0IWIsvBRaM=
ENCRYPTION_KEY=3cc8c1b586363fa66d7df8e5658e3114

# Additional Domain-Specific Settings
CORS_ORIGIN=https://payvat.ie
ALLOWED_ORIGINS=https://payvat.ie,https://www.payvat.ie
SESSION_DOMAIN=payvat.ie
COOKIE_DOMAIN=.payvat.ie
```

### Quick Vercel CLI Setup

```bash
cd "/Users/deanmcgrath/PAY VAT"

# Set core domain URLs
vercel env add NEXTAUTH_URL production
# Value: https://payvat.ie

vercel env add NEXT_PUBLIC_API_URL production  
# Value: https://payvat.ie/api

# Set authentication secrets
vercel env add JWT_SECRET production
# Value: oPf0U5qCXBsx9ThQs8NQ3REnXRoXZvpFue3BJgs+xJszm3f76KYqpc1K+fW19UKtX1T/PksDLAN+QdlhLkxRTg==

vercel env add NEXTAUTH_SECRET production
# Value: CyeTOxJs4gXC/Z06tGtoQFXac/SDXTXCM0IWIsvBRaM=

vercel env add ENCRYPTION_KEY production
# Value: 3cc8c1b586363fa66d7df8e5658e3114
```

## 💳 Updated Stripe Configuration

### Webhook URLs for payvat.ie

When setting up Stripe webhooks, use these URLs:

```
Primary Webhook URL: https://payvat.ie/api/payments/webhook
Success URL: https://payvat.ie/payment-confirmed  
Cancel URL: https://payvat.ie/payment
```

### Stripe Dashboard Configuration

1. **Go to**: [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. **Add Endpoint**: `https://payvat.ie/api/payments/webhook`
3. **Select Events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed` 
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy Webhook Secret** and add as `STRIPE_WEBHOOK_SECRET` environment variable

## 🗄️ Database Configuration

### Still Required: PostgreSQL Setup

Your database configuration remains the same:

1. **Set up PostgreSQL** (recommend [Vercel Postgres](https://vercel.com/deans-projects-cdf015cf/vat-pay-ireland/stores))
2. **Add DATABASE_URL** environment variable
3. **Deploy schema**: `npx prisma migrate deploy`

## 🚀 Deployment Steps

### After DNS Propagation (5-10 minutes)

```bash
cd "/Users/deanmcgrath/PAY VAT"

# 1. Verify domain is accessible
curl -I https://payvat.ie
# Should return 200 OK with SSL certificate

# 2. Deploy with updated configuration  
vercel deploy --prod --yes

# 3. Test the application
open https://payvat.ie
```

## 📊 Professional Benefits

### Why payvat.ie is Perfect for Your Business

- **🇮🇪 Irish Focus**: .ie domain shows you serve Irish businesses
- **🎯 Brand Clarity**: "payvat" immediately communicates VAT services
- **🔒 Trust Factor**: Professional domain builds user confidence
- **📈 SEO Advantage**: Irish domain ranks better for local searches
- **💼 Business Credibility**: More trustworthy than vercel.app domain

### SEO Keywords Your Domain Targets

- "pay vat ireland" 
- "irish vat returns"
- "vat submission ireland"
- "pay vat online ireland"
- "irish vat calculator"

## 🔗 Your Professional URLs

Once DNS propagates:

- **🏠 Homepage**: https://payvat.ie
- **👨‍💼 Admin Dashboard**: https://payvat.ie/admin  
- **💳 Payment Portal**: https://payvat.ie/payment
- **📊 User Dashboard**: https://payvat.ie/dashboard
- **🔐 Login**: https://payvat.ie/login
- **📝 Registration**: https://payvat.ie/signup

## ⏱️ Timeline & Next Steps

### Immediate (0-10 minutes)
- [ ] Configure DNS records at your domain provider
- [ ] Wait for DNS propagation

### Short Term (10-30 minutes)  
- [ ] Set environment variables in Vercel
- [ ] Set up PostgreSQL database
- [ ] Deploy updated configuration

### Medium Term (30-60 minutes)
- [ ] Configure Stripe with new webhook URLs
- [ ] Test all functionality end-to-end
- [ ] Verify SSL certificate and security

## 🎯 Current Status

- ✅ **Domain Added**: payvat.ie configured in Vercel
- ✅ **Application Updated**: All URLs updated to payvat.ie
- ✅ **Environment Docs**: Updated with custom domain
- ⏳ **DNS Pending**: Need to configure at your DNS provider
- ⏳ **Database Pending**: PostgreSQL setup still required
- ⏳ **Stripe Pending**: Webhook URLs need updating

**You're 90% complete! Just need DNS configuration and database setup.** 🚀

## 📞 Support

If you encounter issues:
- **DNS Problems**: Check [DNS Checker](https://dnschecker.org/payvat.ie)
- **SSL Issues**: Vercel provides automatic HTTPS (may take 5-10 minutes)
- **Application Issues**: Check Vercel deployment logs

Your professional VAT service is almost ready for Irish businesses! 🇮🇪💼