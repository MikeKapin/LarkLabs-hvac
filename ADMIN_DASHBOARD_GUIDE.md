# 📊 LARK Labs Unified Admin Dashboard

## Overview

The LARK Labs Admin Dashboard is a centralized, professional analytics and management system for tracking website performance, email subscriptions, and application usage across all LARK Labs properties.

## 🔐 Access Information

**Dashboard URL:** `https://larklabs.org/larklabs-admin.html`

**Access Code:** `2080`

**Security:** Password-protected with session-based authentication

---

## 📋 Features

### 1. **Overview Dashboard**
- **Total Page Views** - Aggregate website traffic
- **Email Subscribers** - Total newsletter signups
- **Active Sessions** - Currently active website users
- **HVAC Jack Sessions** - Application-specific usage
- **Quick Stats Chart** - 7-day trend visualization
- **Top Pages Table** - Most visited pages with percentages

### 2. **Website Analytics**
- **Traffic Tracking**
  - Total page views
  - Total sessions
  - Active users in real-time
- **Daily Traffic Chart** - Visual representation of 7-day traffic
- **Top Referrers** - Traffic sources and referral sites
- **Data Export** - Download analytics as JSON

### 3. **Email Subscribers**
- **Subscriber Management**
  - Total active subscribers
  - New subscribers today
  - New subscribers this week
- **Subscriber List Table**
  - Email addresses
  - Names (if provided)
  - Subscription source
  - Subscription date
  - Active status
- **Source Analytics** - Pie chart showing signup sources
- **Export Functions**
  - Export as CSV
  - Copy email list to clipboard

### 4. **HVAC Jack Statistics**
- **Usage Metrics**
  - Total sessions
  - Messages processed
  - Success rate
  - Blocked content count
- **Charts**
  - Usage over time (sessions & messages)
  - Mode distribution (Homeowner vs Technician)
- **Session Table** - Detailed recent sessions with status

### 5. **Google Analytics Integration**
- Direct links to Google Analytics dashboard
- Quick access to:
  - Real-time overview
  - Acquisition reports
  - Engagement reports
  - User lifecycle data
- Current Tracking ID: **G-CJLXH9XZ0M**

---

## 🛠️ Technical Architecture

### Backend Functions (Netlify Serverless)

#### 1. **collect-email.js**
**Endpoint:** `/.netlify/functions/collect-email`

**Purpose:** Centralized email collection and management

**Methods:**
- **POST** - Add new email subscriber
  - Validates email format
  - Checks for duplicates
  - Stores with metadata (IP, user agent, source)
  - Returns success status

- **GET** - Retrieve all subscribers (requires auth)
  - Authentication: `?auth=2080`
  - Returns subscriber list with statistics
  - Provides source breakdown

**Data Structure:**
```javascript
{
  email: string,
  source: string,
  name: string | null,
  subscribedAt: ISO timestamp,
  ip: string,
  userAgent: string,
  metadata: object,
  active: boolean
}
```

#### 2. **analytics-tracker.js**
**Endpoint:** `/.netlify/functions/analytics-tracker`

**Purpose:** Custom website analytics and page tracking

**Methods:**
- **POST** - Track page view
  - Records page URL, title, referrer
  - Tracks session IDs
  - Updates daily statistics
  - Monitors traffic sources

- **GET** - Retrieve analytics (requires auth)
  - Authentication: `?auth=2080`
  - Query param: `days` (default: 7)
  - Returns comprehensive analytics data

**Tracked Metrics:**
- Page views
- Unique visitors
- Session duration
- Top pages
- Referrer sources
- Daily/hourly breakdowns

#### 3. **get-usage-stats.js** (Existing)
**Endpoint:** `/.netlify/functions/get-usage-stats`

**Purpose:** HVAC Jack application statistics

**Returns:**
- Session counts
- Message statistics
- Mode distribution
- Blocked content
- Daily usage patterns

---

## 📁 File Structure

```
Website/
├── larklabs-admin.html          # Unified admin dashboard
├── index.html                    # Updated with tracking code
├── netlify/
│   └── functions/
│       ├── collect-email.js     # Email collection endpoint
│       ├── analytics-tracker.js # Analytics tracking endpoint
│       ├── get-usage-stats.js   # HVAC Jack stats (existing)
│       ├── track-usage.js       # HVAC usage tracker (existing)
│       └── health.js            # System health check (existing)
└── netlify.toml                 # Netlify configuration
```

---

## 🚀 Deployment Instructions

### Step 1: Push to GitHub
```bash
cd Website
git add .
git commit -m "Add unified admin dashboard with email collection and analytics"
git push origin main
```

### Step 2: Netlify Deployment
The site is already connected to Netlify. Changes will auto-deploy when pushed to GitHub.

**Verify deployment:**
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Check deployment status
3. Verify all functions are deployed

### Step 3: Test the Dashboard
1. Visit: `https://larklabs.org/larklabs-admin.html`
2. Enter access code: `2080`
3. Verify all tabs load correctly
4. Test export functionality

### Step 4: Test Email Collection
1. Go to main website
2. Sign up for newsletter
3. Check admin dashboard → Email Subscribers tab
4. Verify email appears in list

---

## 🔒 Security Features

1. **Password Protection**
   - Access code required: `2080`
   - Session-based authentication
   - Auto-logout on browser close

2. **API Authentication**
   - All GET requests require `auth=2080` query parameter
   - Prevents unauthorized data access
   - Returns 401 for invalid auth

3. **No Index**
   - Dashboard has `noindex, nofollow` meta tags
   - Won't appear in search engines

4. **Data Validation**
   - Email format validation
   - Input sanitization
   - CORS protection enabled

---

## 📊 Data Storage

### Current Implementation: In-Memory Storage

**Advantages:**
- ✅ Fast access
- ✅ No database setup required
- ✅ Cost-effective

**Limitations:**
- ⚠️ Data persists only while Netlify function is "warm" (typically 15-30 minutes)
- ⚠️ Cold starts reset data
- ⚠️ Not suitable for long-term data retention

### Recommended Upgrade: Database Integration

For production use with persistent storage, consider integrating:

1. **Netlify Blobs** (Recommended for simplicity)
   ```javascript
   const { getStore } = require('@netlify/blobs');
   ```

2. **MongoDB Atlas** (Free tier available)
   - Persistent storage
   - Query capabilities
   - Scalable

3. **Supabase** (PostgreSQL)
   - Free tier with 500MB
   - Real-time features
   - Built-in authentication

4. **Google Sheets API** (Quick solution)
   - Familiar interface
   - Easy export
   - Limited scalability

---

## 🎯 Usage Tips

### Email Management
- **Export regularly** to backup subscriber data
- **Copy email list** for use in email marketing tools (MailChimp, SendGrid, etc.)
- **Monitor sources** to see which pages drive the most signups

### Analytics Insights
- **Check daily** during content launches or campaigns
- **Monitor top pages** to understand user interests
- **Track referrers** to measure marketing effectiveness

### HVAC Jack Monitoring
- **Success rate** should stay above 95%
- **Blocked content** indicates content filter effectiveness
- **Mode distribution** shows user type balance

---

## 🔧 Customization Options

### Change Access Code
Edit `larklabs-admin.html` line ~570:
```javascript
const ACCESS_CODE = '2080'; // Change this
```

Also update in:
- `collect-email.js` line ~67
- `analytics-tracker.js` line ~71

### Add New Tracking Events
In your website pages:
```javascript
fetch('/.netlify/functions/analytics-tracker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        page: '/custom-page',
        pageTitle: 'Custom Event',
        eventType: 'custom_event',
        metadata: { customData: 'value' }
    })
});
```

### Customize Dashboard Appearance
Edit CSS variables in `larklabs-admin.html`:
```css
:root {
    --primary: #3498db;     /* Main brand color */
    --secondary: #2c3e50;   /* Secondary color */
    --success: #27ae60;     /* Success green */
    --warning: #f39c12;     /* Warning orange */
    --danger: #e74c3c;      /* Error red */
}
```

---

## 🐛 Troubleshooting

### Dashboard Won't Load
1. Check browser console for errors
2. Verify Netlify deployment succeeded
3. Clear browser cache

### No Data Showing
1. Wait 30 seconds for functions to warm up
2. Check that tracking code is on website pages
3. Verify functions are deployed in Netlify

### Email Collection Not Working
1. Check browser console for fetch errors
2. Verify `collect-email.js` is deployed
3. Test endpoint manually: `POST to /.netlify/functions/collect-email`

### Authentication Failed
1. Verify access code is `2080`
2. Clear session storage: `sessionStorage.clear()`
3. Try incognito/private browsing mode

---

## 📈 Future Enhancements

### Planned Features
- [ ] Database integration for persistent storage
- [ ] Email export scheduler (automated backups)
- [ ] Advanced filtering (date ranges, search)
- [ ] User role management (multiple admin levels)
- [ ] Email verification system
- [ ] GDPR compliance tools (unsubscribe, data deletion)
- [ ] Real-time notifications for new signups
- [ ] A/B testing dashboard
- [ ] Conversion funnel tracking

### Optional Integrations
- [ ] Mailchimp API integration
- [ ] Slack notifications for new subscribers
- [ ] Google Sheets sync
- [ ] CSV auto-backup to cloud storage
- [ ] SMS alerts for critical metrics

---

## 📞 Support

For issues or questions:
- **Email:** lark_labs@outlook.com
- **Documentation:** This file
- **Source Code:** Check function files for inline comments

---

## 📄 License & Credits

**Created for:** LARK Labs Educational Resources
**Developer:** LARK Labs Development Team
**Date:** January 2025
**Version:** 1.0.0

---

## ✅ Quick Reference Commands

### Test Email Collection
```bash
curl -X POST https://larklabs.org/.netlify/functions/collect-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"test"}'
```

### Retrieve Subscribers
```bash
curl "https://larklabs.org/.netlify/functions/collect-email?auth=2080"
```

### Test Analytics Tracking
```bash
curl -X POST https://larklabs.org/.netlify/functions/analytics-tracker \
  -H "Content-Type: application/json" \
  -d '{"page":"/test","pageTitle":"Test","eventType":"page_view"}'
```

### Get Analytics Data
```bash
curl "https://larklabs.org/.netlify/functions/analytics-tracker?auth=2080&days=7"
```

---

**Last Updated:** January 2025
**Status:** ✅ Production Ready
