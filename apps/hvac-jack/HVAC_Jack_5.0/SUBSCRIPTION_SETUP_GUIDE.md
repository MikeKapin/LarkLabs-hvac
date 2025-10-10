# HVAC Jack 5.0 - Subscription System Setup Guide
**Date:** January 20, 2025

---

## 🎯 Overview

HVAC Jack 5.0 introduces a complete subscription management system with:
- ✅ 4 pricing tiers (Free, Pro, Premium, Business)
- ✅ Usage tracking and quota enforcement
- ✅ Stripe payment integration
- ✅ Real-time usage display UI
- ✅ Automated monthly resets

---

## 📋 Prerequisites

Before deploying, you need:

1. **Stripe Account** (https://stripe.com)
2. **Supabase Project** (https://supabase.com)
3. **Netlify Account** (hosting)
4. **Environment Variables** configured

---

## 🔧 Step 1: Stripe Setup

### 1.1 Create Stripe Products & Prices

Log into Stripe Dashboard → Products → Create Product

**Product 1: HVAC Jack Pro**
```
Name: HVAC Jack Pro
Description: 100 text queries + 20 photo analyses per month
Price: $9.99/month (recurring)
```
→ Copy the Price ID (e.g., `price_1234567890abcdef`)

**Product 2: HVAC Jack Premium**
```
Name: HVAC Jack Premium
Description: 250 text queries + 60 photo analyses per month
Price: $19.99/month (recurring)
```
→ Copy the Price ID

**Product 3: HVAC Jack Business**
```
Name: HVAC Jack Business
Description: Team plan for up to 5 users (shared quota pool)
Price: $49.99/month (recurring)
```
→ Copy the Price ID

### 1.2 Update subscriptionTiers.js

Open `config/subscriptionTiers.js` and update the `priceId` fields:

```javascript
PRO: {
  priceId: 'price_YOUR_PRO_PRICE_ID',  // Replace with actual
  // ...
},
PREMIUM: {
  priceId: 'price_YOUR_PREMIUM_PRICE_ID',  // Replace with actual
  // ...
},
BUSINESS: {
  priceId: 'price_YOUR_BUSINESS_PRICE_ID',  // Replace with actual
  // ...
}
```

### 1.3 Set Up Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-site.netlify.app/.netlify/functions/stripe-checkout`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook Signing Secret** (e.g., `whsec_...`)

---

## 🗄️ Step 2: Supabase Database Setup

### 2.1 Create Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_tier TEXT DEFAULT 'FREE',
  subscription_status TEXT DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
```

### 2.2 Create Usage Table

```sql
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  "textQueries" INTEGER DEFAULT 0,
  "photoAnalysis" INTEGER DEFAULT 0,
  "explainerQueries" INTEGER DEFAULT 0,
  period_start TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_usage_user_id ON usage(user_id);

-- Ensure one usage record per user
CREATE UNIQUE INDEX idx_usage_user_unique ON usage(user_id);
```

### 2.3 Get Supabase Credentials

1. Go to your Supabase project
2. Settings → API
3. Copy:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **Service Role Key** (secret - full access)

---

## 🌐 Step 3: Netlify Environment Variables

Go to Netlify → Site Settings → Environment Variables

Add the following:

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...

# Stripe
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_... (your Pro price ID)
STRIPE_PRICE_PREMIUM=price_... (your Premium price ID)
STRIPE_PRICE_BUSINESS=price_... (your Business price ID)

# Site URL
URL=https://your-site.netlify.app
```

---

## 📦 Step 4: Install Dependencies

Add to your `package.json`:

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.29.0",
    "@supabase/supabase-js": "^2.39.0",
    "stripe": "^14.10.0"
  }
}
```

Run:
```bash
npm install
```

---

## 🚀 Step 5: Deploy to Netlify

### 5.1 Update index.html

Add usage display container and include the component:

```html
<!-- Add this in your main layout -->
<div id="usage-display"></div>

<!-- Include usage display component -->
<link rel="stylesheet" href="/components/UsageDisplay.css">
<script type="module" src="/components/UsageDisplay.js"></script>
<script>
  // Initialize usage display when user is logged in
  document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      await usageDisplay.init('usage-display');
    }
  });
</script>
```

### 5.2 Integrate with Chat Function

Update `netlify/functions/chat.js` to check quota before processing:

```javascript
// Add at the beginning of exports.handler
const userId = event.headers['x-user-id']; // Or however you identify users

// Check quota before processing
const checkResponse = await fetch(`${process.env.URL}/.netlify/functions/usage-tracker`, {
  method: 'POST',
  body: JSON.stringify({
    action: 'check',
    userId: userId
  })
});

const quotaData = await checkResponse.json();
if (!quotaData.canQuery) {
  return {
    statusCode: 429,
    body: JSON.stringify({
      error: 'Usage limit exceeded',
      message: 'Upgrade your plan to continue',
      upgradeUrl: '/pricing.html'
    })
  };
}

// Process chat request...
// After successful response, increment usage
await fetch(`${process.env.URL}/.netlify/functions/usage-tracker`, {
  method: 'POST',
  body: JSON.stringify({
    action: 'increment',
    userId: userId,
    usageType: 'text'
  })
});
```

### 5.3 Integrate with Photo Analyzer

Update `netlify/functions/photo-analyzer.js` similarly:

```javascript
// Check quota
const checkResponse = await fetch(`${process.env.URL}/.netlify/functions/usage-tracker`, {
  method: 'POST',
  body: JSON.stringify({
    action: 'check',
    userId: userId
  })
});

const quotaData = await checkResponse.json();
if (!quotaData.canPhotoAnalysis) {
  return {
    statusCode: 429,
    body: JSON.stringify({
      error: 'Photo analysis limit exceeded',
      upgradeUrl: '/pricing.html'
    })
  };
}

// Process photo analysis...
// After success, increment
await fetch(`${process.env.URL}/.netlify/functions/usage-tracker`, {
  method: 'POST',
  body: JSON.stringify({
    action: 'increment',
    userId: userId,
    usageType: 'photo'
  })
});
```

---

## 🧪 Step 6: Testing

### Test Mode Setup

1. Use Stripe test mode keys (`sk_test_...`)
2. Test cards: https://stripe.com/docs/testing
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

### Test Flow

1. **Free User:**
   - Create account
   - Make 10 text queries
   - 11th should be blocked with upgrade prompt

2. **Pro Upgrade:**
   - Click "Upgrade to Pro"
   - Use test card `4242 4242 4242 4242`
   - Complete checkout
   - Verify subscription in Stripe Dashboard
   - Verify user record updated in Supabase

3. **Usage Tracking:**
   - Make queries and verify counter updates
   - Check usage display shows correct numbers

4. **Webhook Testing:**
   - Use Stripe CLI: `stripe listen --forward-to localhost:8888/.netlify/functions/stripe-checkout`
   - Trigger test events

---

## 📊 Step 7: Monitoring & Maintenance

### Monthly Usage Reset

Set up a scheduled function (Netlify Scheduled Functions):

```javascript
// netlify/functions/scheduled-reset.js
exports.handler = async (event, context) => {
  // Get all users whose billing period has ended
  const { data: users } = await supabase
    .from('users')
    .select('id, current_period_end')
    .lte('current_period_end', new Date().toISOString());

  // Reset usage for each user
  for (const user of users) {
    await fetch(`${process.env.URL}/.netlify/functions/usage-tracker`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'reset',
        userId: user.id
      })
    });
  }

  return { statusCode: 200, body: 'Usage reset completed' };
};
```

Configure in `netlify.toml`:
```toml
[[scheduled_functions]]
  path = "/scheduled-reset"
  schedule = "0 0 * * *"  # Daily at midnight
```

### Cost Monitoring

Set up alerts in Anthropic Console:
- Alert when daily costs exceed $50
- Weekly cost reports

Track in Supabase:
```sql
-- Query to see highest users
SELECT u.email, u.subscription_tier,
       usage."textQueries", usage."photoAnalysis"
FROM users u
JOIN usage ON u.id = usage.user_id
ORDER BY (usage."textQueries" + usage."photoAnalysis") DESC
LIMIT 20;
```

---

## 🔒 Security Checklist

- [ ] Never expose `SUPABASE_SERVICE_KEY` in client-side code
- [ ] Validate webhook signatures from Stripe
- [ ] Use Row Level Security (RLS) in Supabase
- [ ] Rate limit API endpoints
- [ ] Log all subscription changes
- [ ] Implement CSRF protection
- [ ] Use HTTPS only (Netlify handles this)

---

## 🐛 Troubleshooting

### Issue: Webhook not working

**Solution:**
- Check webhook endpoint URL is correct
- Verify webhook secret in environment variables
- Check Netlify function logs for errors
- Test with Stripe CLI

### Issue: Usage not updating

**Solution:**
- Check Supabase connection
- Verify user_id is being passed correctly
- Check browser console for errors
- Verify usage table has records

### Issue: Payment succeeds but user not upgraded

**Solution:**
- Check webhook is configured correctly
- Verify `checkout.session.completed` event is sent
- Check Supabase users table for updates
- Review Netlify function logs

---

## 📞 Next Steps

1. Complete Stripe product setup
2. Create Supabase tables
3. Add environment variables to Netlify
4. Deploy and test in test mode
5. Switch to live mode when ready
6. Monitor costs and usage patterns
7. Gather user feedback
8. Iterate on pricing if needed

---

## 📈 Success Metrics to Track

- Conversion rate (free → paid)
- Average revenue per user (ARPU)
- Monthly recurring revenue (MRR)
- Churn rate
- Average queries per user
- Customer acquisition cost (CAC)
- Lifetime value (LTV)

---

**Document Version:** 1.0
**Last Updated:** January 20, 2025
**Next Review:** February 20, 2025
