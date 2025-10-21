# Free Tier Limit Enforcement Implementation Plan

## Overview
Implement one-time usage limits for the free tier with upgrade modal when limits are reached.

## Changes Required

### 1. Add Upgrade Modal HTML (after line 500, before PWA install button)
```html
<!-- Upgrade Modal (Hidden by default) -->
<div class="beta-overlay" id="upgrade-overlay" style="display: none;">
    <div class="beta-container">
        <div class="beta-logo">🚀</div>
        <h1 class="beta-title">Free Limit Reached</h1>
        <p class="beta-subtitle" id="upgrade-message">You've used all your free queries!</p>

        <div class="tier-options">
            <button class="tier-btn tier-pro" id="upgrade-pro-btn">
                <div class="tier-icon">🚀</div>
                <div class="tier-name">Upgrade to Pro</div>
                <div class="tier-limits">250 photos • 250 text queries/month</div>
                <div class="tier-price">$16.99 / month</div>
                <div class="tier-badge">UNLIMITED ACCESS</div>
            </button>

            <button class="tier-btn tier-student" id="upgrade-student-btn">
                <div class="tier-icon">🎓</div>
                <div class="tier-name">Student Access</div>
                <div class="tier-limits">Pro features for 12 months</div>
                <div class="tier-price">Access code required</div>
            </button>
        </div>

        <div class="beta-info">
            Your free tier includes 10 photo analyses and 15 text queries.
            Once used, you'll need to upgrade to continue.
        </div>
    </div>
</div>
```

### 2. Add showUpgradeModal() Method to TierAuth Class (after hideOverlay() method, line ~869)
```javascript
showUpgradeModal(featureType) {
    const remaining = this.getRemainingUsage();
    const modal = document.getElementById('upgrade-overlay');
    const message = document.getElementById('upgrade-message');

    if (featureType === 'photo') {
        message.textContent = `You've used all ${this.getAuthData().limits.photoAnalysis} free photo analyses!`;
    } else if (featureType === 'text') {
        message.textContent = `You've used all ${this.getAuthData().limits.textQueries} free text queries!`;
    }

    modal.style.display = 'flex';
    modal.style.opacity = '1';

    // Setup upgrade button handlers
    document.getElementById('upgrade-pro-btn').onclick = () => {
        this.redirectToStripe();
    };

    document.getElementById('upgrade-student-btn').onclick = () => {
        modal.style.display = 'none';
        this.showStudentCodeEntry();
        this.showOverlay();
    };
}

getAuthData() {
    return JSON.parse(localStorage.getItem(this.storageKey));
}
```

### 3. Add Limit Enforcement in performPhotoAnalysis() (line ~1037)
**BEFORE line 1043 (`if (this.isAnalyzing) return;`)**
```javascript
// Check free tier limits
if (!window.tierAuth.canUseFeature('photo')) {
    window.tierAuth.showUpgradeModal('photo');
    return;
}
```

**AFTER successful analysis (line ~1056, after showStatus)**
```javascript
// Increment usage for free tier
window.tierAuth.incrementUsage('photo');
```

### 4. Add Limit Enforcement in performAnalysis() (line ~1084)
**BEFORE line 1092 (`if (this.isAnalyzing) return;`)**
```javascript
// Check free tier limits
if (!window.tierAuth.canUseFeature('text')) {
    window.tierAuth.showUpgradeModal('text');
    return;
}
```

**AFTER successful analysis (line ~1104, after showStatus)**
```javascript
// Increment usage for free tier
window.tierAuth.incrementUsage('text');
```

## Summary
- **No monthly reset** - Limits are lifetime for free tier
- **Immediate enforcement** - Checks limits BEFORE making API calls
- **Clear upgrade path** - Modal shows Pro and Student options
- **Usage tracking** - Increments counter AFTER successful API response
- **Pro/Student tiers** - Unlimited usage (bypass all checks)
