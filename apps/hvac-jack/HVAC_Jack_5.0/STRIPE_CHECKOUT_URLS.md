# HVAC Jack 5.0 - Stripe Checkout URLs

## ✅ Live Stripe Payment Links

### Pro Tier - $9.99/month
```
https://buy.stripe.com/3cI8wQfxX0Ne8qGgsM7ok06
```

**Features:**
- 100 text queries per month
- 20 photo analyses per month
- Advanced diagnostics
- Email support
- Code reference integration
- Conversation history

---

### Premium Tier - $19.99/month
```
https://buy.stripe.com/fZubJ24Tj0Ne36m4K47ok07
```

**Features:**
- 250 text queries per month
- 60 photo analyses per month
- Priority support
- Advanced explainer mode
- PDF reports
- Equipment database access
- Early feature access

---

### Business Tier - $49.99/month
```
Contact: support@larklabs.org
```

**Features:**
- Up to 5 user accounts
- 1,000 text queries (shared)
- 250 photo analyses (shared)
- Dedicated account manager
- Team collaboration tools
- Custom branding

---

## 🔗 Usage in Code

These URLs are now integrated into:

1. **`config/subscriptionTiers.js`**
   ```javascript
   PRO: {
     stripeCheckoutUrl: 'https://buy.stripe.com/3cI8wQfxX0Ne8qGgsM7ok06'
   }
   ```

2. **`pricing.html`**
   - Clicking "Upgrade to Pro" or "Upgrade to Premium" redirects directly to Stripe
   - No backend authentication required for initial signup
   - Simplified checkout flow

---

## 📝 Testing

To test the payment flow:

1. Click "Upgrade to Pro" on pricing page
2. You'll be redirected to Stripe Checkout
3. Use test card: `4242 4242 4242 4242`
4. Complete the checkout
5. Stripe will handle the subscription creation

---

## 🔧 Webhook Configuration

Make sure your Stripe webhook is configured to send events to:
```
https://your-site.netlify.app/.netlify/functions/stripe-checkout
```

**Required Events:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## 📊 Tracking Subscriptions

After a successful purchase, Stripe will:
1. Create a customer record
2. Create a subscription
3. Send webhook to your backend
4. Your backend updates Supabase users table
5. User gets access to Pro/Premium features

---

**Last Updated:** January 20, 2025
**Status:** ✅ URLs Active and Integrated
