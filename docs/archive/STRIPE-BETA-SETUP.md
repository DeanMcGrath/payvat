# 🔧 Stripe Beta Testing Setup

## Step 1: Get Your Stripe Test Keys

1. **Sign up/Login**: Go to https://dashboard.stripe.com
2. **Switch to TEST mode**: Toggle in top-left corner should show "Test mode"
3. **Get API Keys**: 
   - Go to **Developers** → **API Keys**
   - Copy **Publishable key** (starts with `pk_test_`)
   - Click **Reveal test key** and copy **Secret key** (starts with `sk_test_`)

## Step 2: Add Environment Variables

Run these commands in your terminal (in the PAY VAT directory):

```bash
# Add Stripe Secret Key (starts with sk_test_)
vercel env add STRIPE_SECRET_KEY

# Add Publishable Key (starts with pk_test_)  
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# You'll add webhook secret in Step 3
```

## Step 3: Set Up Webhook (Important!)

1. **In Stripe Dashboard**: Go to **Developers** → **Webhooks**
2. **Add endpoint**: Click **"+ Add endpoint"**
3. **Endpoint URL**: Enter `https://payvat.ie/api/payments/webhook`
4. **Select events**: Add these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed` 
   - `payment_intent.canceled`
   - `payment_intent.requires_action`
5. **Create endpoint**
6. **Copy Signing Secret**: Click on your new webhook → copy the **Signing secret** (starts with `whsec_`)
7. **Add to Vercel**:
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET
   # Paste the whsec_... value
   ```

## Step 4: Deploy Changes

```bash
# Deploy with new Stripe configuration
vercel --prod
```

## Step 5: Test Payment Flow

### Test Credit Cards (USE THESE IN TEST MODE):
- **Successful payment**: `4242 4242 4242 4242`
- **Payment fails**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`
- **Any future date for expiry**, **any 3-digit CVC**

### Testing Steps:
1. Visit https://payvat.ie
2. Sign up/login as a test user  
3. Create a VAT return
4. Go to payment page
5. Use test card `4242 4242 4242 4242`
6. Complete payment
7. Check admin dashboard to verify payment appears

## Step 6: Admin Access

Your team can access:
- **Admin Dashboard**: https://payvat.ie/admin  
- **Payment Monitoring**: https://payvat.ie/admin/payments
- **Live Chat Management**: https://payvat.ie/admin/chat

## Security Notes for Beta Testing

✅ **Safe for beta testing**:
- Test mode = no real money
- All test data clearly marked
- Secure environment variables
- Full audit logging

⚠️ **When ready for live payments**:
- Switch to Live mode keys in Stripe
- Update environment variables
- Test thoroughly before announcement

## Support

If you encounter issues:
1. Check Stripe Dashboard → Events for webhook delivery
2. Check Vercel logs for errors
3. Test with different test cards
4. Verify environment variables are set correctly

---
*Ready for beta testing once environment variables are configured!*