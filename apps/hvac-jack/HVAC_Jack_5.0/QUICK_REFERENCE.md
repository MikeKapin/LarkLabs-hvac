# HVAC Jack 5.0 - Quick Reference Card

## 📁 New File Structure

```
HVAC_Jack_5.0/
├── config/
│   └── subscriptionTiers.js          ✅ Tier configs & helpers
├── components/
│   ├── UsageDisplay.js               ✅ Usage counter UI
│   └── UsageDisplay.css              ✅ Gradient styling
├── netlify/functions/
│   ├── usage-tracker.js              ✅ Backend quota API
│   └── stripe-checkout.js            ✅ Payment integration
├── pricing.html                      ✅ Public pricing page
├── COST_ANALYSIS.md                  ✅ Cost breakdown
├── SUBSCRIPTION_SETUP_GUIDE.md       ✅ Deployment guide
├── WHATS_NEW_IN_5.0.md              ✅ Release notes
└── QUICK_REFERENCE.md               ✅ This file
```

---

## 💰 Pricing Tiers

| Tier | Price | Text Queries | Photos | Target |
|------|-------|--------------|--------|--------|
| **Free** | $0 | 10/mo | 5 first, 3 recurring | Trial users |
| **Pro** | $9.99 | 100/mo | 20/mo | Individual techs |
| **Premium** | $19.99 | 250/mo | 60/mo | Busy professionals |
| **Business** | $49.99 | 1000/mo | 250/mo | Teams (5 users) |

---

## 🔧 Required Environment Variables

```bash
# Add to Netlify
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_PRICE_BUSINESS=price_...
URL=https://your-site.netlify.app
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_tier TEXT DEFAULT 'FREE',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Usage Table
```sql
CREATE TABLE usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  "textQueries" INTEGER DEFAULT 0,
  "photoAnalysis" INTEGER DEFAULT 0,
  period_start TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Quick Start

### 1. Stripe Setup (5 min)
1. Create 3 products in Stripe Dashboard
2. Copy Price IDs
3. Update `config/subscriptionTiers.js`
4. Set up webhook → Copy signing secret

### 2. Supabase Setup (3 min)
1. Create `users` table
2. Create `usage` table
3. Copy Project URL & Service Key

### 3. Netlify Deploy (2 min)
1. Add all environment variables
2. Deploy to Netlify
3. Test with Stripe test cards

---

## 🧪 Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0000 0000 9995 | Insufficient funds |

---

## 📊 API Endpoints

### Usage Tracker
```
POST /.netlify/functions/usage-tracker
Body: { action, userId, usageType }
Actions: check, increment, reset
```

### Stripe Checkout
```
POST /.netlify/functions/stripe-checkout
Body: { action, userId, priceId, tierId, email }
Actions: create-checkout, create-portal, webhook
```

---

## 💡 Integration Examples

### Check Quota Before Request
```javascript
const response = await fetch('/.netlify/functions/usage-tracker', {
  method: 'POST',
  body: JSON.stringify({ action: 'check', userId })
});
const { canQuery, canPhotoAnalysis } = await response.json();
```

### Increment After Success
```javascript
await fetch('/.netlify/functions/usage-tracker', {
  method: 'POST',
  body: JSON.stringify({
    action: 'increment',
    userId,
    usageType: 'text' // or 'photo'
  })
});
```

### Redirect to Pricing
```javascript
if (quotaExceeded) {
  window.location.href = '/pricing.html';
}
```

---

## 📈 Key Metrics

### Costs
- Text query: $0.024
- Photo analysis: $0.038
- Average user: $2.07/month

### Break-Even
- 21 Pro subscribers = $207/month (covers 100 free users)

### Profit Margins
- Pro: 68% ($6.83)
- Premium: 53% ($10.51)
- Business: 40-70% ($20-35)

---

## 🎯 Success Checklist

**Pre-Launch:**
- [ ] Stripe products created
- [ ] Supabase tables created
- [ ] Environment variables set
- [ ] Test checkout working
- [ ] Webhook tested
- [ ] Usage display rendering

**Post-Launch:**
- [ ] Monitor conversion rates
- [ ] Track API costs daily
- [ ] Gather user feedback
- [ ] Optimize token usage
- [ ] Set up alerts

---

## 🆘 Common Issues

**Webhook not firing?**
→ Check URL, verify secret, test with Stripe CLI

**Usage not updating?**
→ Check Supabase connection, verify user_id

**Payment succeeds but no upgrade?**
→ Check webhook logs, verify event handling

---

## 📞 Support

- **Setup Guide:** `SUBSCRIPTION_SETUP_GUIDE.md`
- **Cost Details:** `COST_ANALYSIS.md`
- **Release Notes:** `WHATS_NEW_IN_5.0.md`
- **Email:** support@larklabs.org

---

**Version:** 5.0.0
**Updated:** January 20, 2025
**Status:** Ready for deployment 🚀
