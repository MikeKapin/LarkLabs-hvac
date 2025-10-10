# HVAC Jack 4.0 - Cost Analysis & Pricing Strategy
**Date:** January 20, 2025
**Current Status:** Beta (100 users)
**Model:** Claude Sonnet 4.5 (claude-sonnet-4-20250514)

---

## 📊 API Cost Structure

### Claude API Pricing (as of Jan 2025)
**Claude Sonnet 4.5 Pricing:**
- **Input tokens:** $3.00 per million tokens
- **Output tokens:** $15.00 per million tokens

---

## 💰 Per-Request Cost Breakdown

### 1. **Text Chat Query (No Photo)**
**Function:** `chat.js`
- **Model:** claude-sonnet-4-20250514
- **Max tokens:** 2,000 output tokens

**Typical Token Usage:**
- System prompt: ~200-400 tokens (input)
- User message: ~50-200 tokens (input)
- Response: ~500-2,000 tokens (output)

**Cost Calculation:**
```
Input cost:  400 tokens × $3.00/1M = $0.0012
Output cost: 1,500 tokens × $15.00/1M = $0.0225
────────────────────────────────────────────
TOTAL PER CHAT: ~$0.024 (2.4 cents)
```

**Range:**
- **Minimum** (short query): $0.015
- **Average**: $0.024
- **Maximum** (complex query): $0.035

---

### 2. **Photo Analysis**
**Function:** `photo-analyzer.js`
- **Model:** claude-sonnet-4-20250514
- **Max tokens:** 3,000 output tokens
- **Includes:** Vision API (image analysis)

**Typical Token Usage:**
- System prompt: ~300-500 tokens (input)
- Image: ~1,500-2,500 tokens (vision input) *
- User query: ~50-100 tokens (input)
- Response: ~1,000-3,000 tokens (output)

**Cost Calculation:**
```
Input cost:  2,500 tokens × $3.00/1M = $0.0075
Output cost: 2,000 tokens × $15.00/1M = $0.0300
────────────────────────────────────────────
TOTAL PER PHOTO: ~$0.038 (3.8 cents)
```

**Range:**
- **Minimum** (simple photo): $0.025
- **Average**: $0.038
- **Maximum** (detailed photo): $0.055

**Note:** *Images are processed as tokens based on resolution. Standard photos = ~1,500-2,500 tokens.

---

### 3. **Explainer Mode (Comprehensive)**
**Function:** `chat.js` with explainer mode activated
- **Model:** claude-sonnet-4-20250514
- **Max tokens:** 2,000 output tokens
- **Includes:** Enhanced system prompt

**Typical Token Usage:**
- Enhanced system prompt: ~500-700 tokens (input)
- User question: ~50-200 tokens (input)
- Equipment context: ~100-300 tokens (input)
- Detailed response: ~1,500-2,000 tokens (output)

**Cost Calculation:**
```
Input cost:  1,000 tokens × $3.00/1M = $0.0030
Output cost: 1,800 tokens × $15.00/1M = $0.0270
────────────────────────────────────────────
TOTAL PER EXPLAINER: ~$0.030 (3.0 cents)
```

**Range:**
- **Minimum**: $0.020
- **Average**: $0.030
- **Maximum**: $0.045

---

## 📈 Usage Scenarios & Monthly Costs

### Scenario 1: **Light User**
- 20 text queries/month
- 5 photo analyses/month
- 5 explainer queries/month

**Monthly Cost:**
```
Text:      20 × $0.024 = $0.48
Photos:     5 × $0.038 = $0.19
Explainer:  5 × $0.030 = $0.15
───────────────────────────────
TOTAL: $0.82/month
```

---

### Scenario 2: **Average User**
- 50 text queries/month
- 15 photo analyses/month
- 10 explainer queries/month

**Monthly Cost:**
```
Text:      50 × $0.024 = $1.20
Photos:    15 × $0.038 = $0.57
Explainer: 10 × $0.030 = $0.30
───────────────────────────────
TOTAL: $2.07/month
```

---

### Scenario 3: **Heavy User** (Professional Technician)
- 150 text queries/month
- 40 photo analyses/month
- 30 explainer queries/month

**Monthly Cost:**
```
Text:      150 × $0.024 = $3.60
Photos:     40 × $0.038 = $1.52
Explainer:  30 × $0.030 = $0.90
───────────────────────────────
TOTAL: $6.02/month
```

---

### Scenario 4: **Power User** (Daily Heavy Use)
- 300 text queries/month
- 80 photo analyses/month
- 50 explainer queries/month

**Monthly Cost:**
```
Text:      300 × $0.024 = $7.20
Photos:     80 × $0.038 = $3.04
Explainer:  50 × $0.030 = $1.50
───────────────────────────────
TOTAL: $11.74/month
```

---

## 💵 Recommended Pricing Tiers

### Option A: **Freemium Model**

**Free Tier:**
- 10 queries/month
- 2 photo analyses/month
- **Your Cost:** ~$0.32/user/month
- **Purpose:** User acquisition, trial experience

**Pro Tier - $9.99/month:**
- 100 queries/month
- 25 photo analyses/month
- **Your Cost:** ~$2.50/user/month
- **Profit Margin:** $7.49/user (75%)

**Premium Tier - $19.99/month:**
- Unlimited queries
- Unlimited photo analyses
- Priority support
- **Expected Cost:** ~$6-12/user/month (heavy users)
- **Profit Margin:** $8-14/user (40-70%)

---

### Option B: **Pay-As-You-Go Credits**

**Credit Pricing:**
- **1 Text Query** = 1 credit ($0.10)
- **1 Photo Analysis** = 2 credits ($0.20)
- **1 Explainer Query** = 1 credit ($0.10)

**Credit Packages:**
- **Starter Pack:** 20 credits for $1.99 (saves $0.01)
- **Value Pack:** 100 credits for $7.99 (saves $2.01 - 20% discount)
- **Pro Pack:** 300 credits for $19.99 (saves $10.01 - 33% discount)
- **Unlimited Pack:** 1000 credits for $49.99 (saves $50.01 - 50% discount)

**Your Cost vs Revenue:**
```
Value Pack Example (100 credits):
- Revenue: $7.99
- Cost (if all text): 100 × $0.024 = $2.40
- Profit: $5.59 (70% margin)

Pro Pack Example (300 credits):
- Revenue: $19.99
- Cost (mixed usage): ~$6-8
- Profit: $12-14 (60-70% margin)
```

---

### Option C: **Subscription Tiers** (Recommended)

**Apprentice - $4.99/month:**
- 30 queries/month
- 5 photo analyses/month
- **Your Cost:** ~$0.91/month
- **Profit:** $4.08 (82% margin)
- **Target:** Students, DIYers

**Journeyman - $9.99/month:**
- 100 queries/month
- 20 photo analyses/month
- **Your Cost:** ~$3.16/month
- **Profit:** $6.83 (68% margin)
- **Target:** Apprentice technicians, small contractors

**Master Tech - $19.99/month:**
- 300 queries/month
- 60 photo analyses/month
- Priority support
- **Your Cost:** ~$9.48/month
- **Profit:** $10.51 (53% margin)
- **Target:** Professional technicians

**Shop License - $49.99/month:**
- Unlimited queries
- Unlimited photo analyses
- Multi-user access (5 users)
- Priority support
- White-label option
- **Expected Cost:** $15-30/month
- **Profit:** $20-35 (40-70% margin)
- **Target:** HVAC companies, training programs

---

## 📊 Break-Even Analysis

### Current Beta Program (100 users)
Assuming average usage (Scenario 2):
```
100 users × $2.07/month = $207/month in API costs
```

**Required Revenue to Break Even:** $207/month

**With $9.99/month subscription:**
- Need only **21 paying subscribers** to break even
- At 50% conversion: Need 42 users = $419 revenue - $207 cost = **$212 profit**
- At 25% conversion: Need 25 users = $250 revenue - $207 cost = **$43 profit**

---

## 🎯 Recommended Launch Strategy

### Phase 1: Beta Exit (Current → Month 1)
**Free Access for Beta Testers:**
- Keep current 100 beta users on free plan for 3 months
- Grandfathered rate: $4.99/month (50% off) when trial ends
- **Cost:** $207/month (acceptable loss for transition)

### Phase 2: Soft Launch (Month 2-3)
**Launch with 3 Tiers:**
1. **Free Trial:** 14 days, 20 queries + 5 photos
2. **Pro - $9.99/month:** 100 queries + 20 photos
3. **Premium - $19.99/month:** Unlimited

**Expected Revenue (Conservative):**
- 50 beta users convert to Pro: $499.50
- 20 beta users convert to Premium: $399.80
- 30 new Pro users: $299.70
- 10 new Premium users: $199.90
- **Total:** $1,399/month
- **Costs:** ~$400/month
- **Profit:** ~$999/month

### Phase 3: Scale (Month 4-6)
**Add Business Tier:**
- **Shop License - $49.99/month** (5 users)
- Target HVAC companies and training programs
- Expected: 10 shop licenses = $499.90/month additional revenue

**Projected Month 6:**
- 150 Pro users: $1,498.50
- 50 Premium users: $999.50
- 10 Shop licenses: $499.90
- **Total Revenue:** $2,997.90/month
- **Estimated Costs:** ~$800/month
- **Profit:** ~$2,197/month (~73% margin)

---

## 🔒 Risk Mitigation Strategies

### 1. **Usage Caps**
Implement soft caps to prevent abuse:
- Free tier: Hard limit at 10 queries + 2 photos
- Pro tier: Soft cap at 100 queries (overage at $0.15/query)
- Premium: Soft cap at 500 queries/month (review heavy users)

### 2. **Rate Limiting**
- Max 10 queries per hour per user
- Max 5 photo analyses per hour per user
- Prevents bot abuse and runaway costs

### 3. **Cost Monitoring**
- Alert if any user exceeds $20/month in API costs
- Auto-review accounts with unusual patterns
- Dashboard to track per-user API costs

### 4. **Caching Strategy**
- Cache common queries (FAQ responses)
- Reduce duplicate photo analyses
- **Potential Savings:** 10-20% of API costs

---

## 💡 Additional Revenue Opportunities

### 1. **API Access**
- Offer API access to HVAC software companies
- $99-299/month per integration
- Markup Claude costs by 3-5x

### 2. **White Label**
- Sell to HVAC schools/training programs
- $199-499/month per institution
- Unlimited student access

### 3. **Enterprise Contracts**
- Custom pricing for large HVAC companies
- Volume discounts with minimum guarantees
- $999-2,999/month (50-200 technicians)

---

## 📈 Projected Annual Revenue (Conservative)

**Year 1 Projections:**
```
Q1: 100 users (beta exit) = $1,000/month avg
Q2: 200 users (soft launch) = $3,000/month avg
Q3: 350 users (growth) = $5,500/month avg
Q4: 500 users (scale) = $8,000/month avg

Annual Revenue: ~$52,800
Annual API Costs: ~$14,400
Annual Profit: ~$38,400 (73% margin)
```

**Year 2 Projections:**
```
1,000 users avg = $12,000/month
+ 5 enterprise contracts = $7,500/month
+ 10 white label = $2,500/month

Annual Revenue: ~$264,000
Annual API Costs: ~$48,000
Annual Profit: ~$216,000 (82% margin)
```

---

## 🎯 Final Recommendations

### **Recommended Pricing (Launch):**

1. **Free Trial:** 14 days
   - 20 text queries
   - 5 photo analyses
   - Full feature access

2. **Pro - $9.99/month** (Primary target)
   - 100 queries/month
   - 20 photo analyses/month
   - Email support
   - **Best for:** Individual technicians

3. **Premium - $19.99/month**
   - 300 queries/month
   - 60 photo analyses/month
   - Priority support
   - **Best for:** Busy technicians

4. **Shop - $49.99/month**
   - Unlimited queries
   - Unlimited photos
   - 5 user seats
   - Priority support
   - **Best for:** Small HVAC companies

### **Beta User Transition:**
- 3 months free Pro access (thank you gift)
- Then 50% lifetime discount: $4.99/month
- Keeps beta testers engaged and provides testimonials

### **Key Metrics to Track:**
- Average queries per user per month
- Average photos per user per month
- Conversion rate (free trial → paid)
- Churn rate
- Cost per user per month
- Lifetime value (LTV) per user

---

## 📞 Next Steps

1. **Immediate:**
   - [ ] Set up Stripe payment processing
   - [ ] Implement usage tracking/metering
   - [ ] Add subscription management UI
   - [ ] Set up cost monitoring dashboard

2. **Within 1 Week:**
   - [ ] Announce beta exit plan to users
   - [ ] Create pricing page
   - [ ] Set up free trial flow
   - [ ] Implement rate limiting

3. **Within 1 Month:**
   - [ ] Launch public access with 3 tiers
   - [ ] Set up automated billing
   - [ ] Create onboarding flow for new users
   - [ ] Implement usage analytics

4. **Ongoing:**
   - Monitor costs daily
   - Review pricing quarterly
   - Gather user feedback on value
   - Optimize prompts to reduce token usage

---

**Document Version:** 1.0
**Last Updated:** January 20, 2025
**Next Review:** February 20, 2025
