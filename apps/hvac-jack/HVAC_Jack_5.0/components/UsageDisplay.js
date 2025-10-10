// components/UsageDisplay.js
// HVAC Jack 4.0 - Usage Display Component

export class UsageDisplay {
  constructor() {
    this.usageData = null;
    this.container = null;
  }

  // Initialize and render usage display
  async init(containerId = 'usage-display') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('Usage display container not found');
      return;
    }

    await this.fetchUsage();
    this.render();

    // Update every 30 seconds
    setInterval(() => this.fetchUsage(), 30000);
  }

  // Fetch current usage from API
  async fetchUsage() {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch('/.netlify/functions/usage-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check',
          userId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.usageData = data;
        this.render();
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  }

  // Render usage display
  render() {
    if (!this.container || !this.usageData) return;

    const { usage, limits, remaining, tier, daysUntilReset, isFirstMonth } = this.usageData;

    this.container.innerHTML = `
      <div class="usage-panel">
        <div class="usage-header">
          <h3>
            <span class="tier-badge tier-${tier.toLowerCase()}">${tier}</span>
            Plan
          </h3>
          ${tier !== 'Free' ? '<button class="manage-btn" onclick="usageDisplay.manageSubscription()">Manage</button>' : ''}
        </div>

        <div class="usage-stats">
          <!-- Text Queries -->
          <div class="usage-item">
            <div class="usage-label">
              <span>💬 Text Queries</span>
              <span class="usage-numbers">${usage.textQueries} / ${limits.textQueries}</span>
            </div>
            <div class="usage-bar">
              <div class="usage-fill" style="width: ${this.getPercentage(usage.textQueries, limits.textQueries)}%"></div>
            </div>
            <div class="usage-remaining">${remaining.textQueries} remaining</div>
          </div>

          <!-- Photo Analysis -->
          <div class="usage-item">
            <div class="usage-label">
              <span>📷 Photo Analysis</span>
              <span class="usage-numbers">${usage.photoAnalysis} / ${limits.photoAnalysis}</span>
            </div>
            <div class="usage-bar">
              <div class="usage-fill" style="width: ${this.getPercentage(usage.photoAnalysis, limits.photoAnalysis)}%"></div>
            </div>
            <div class="usage-remaining">
              ${remaining.photoAnalysis} remaining
              ${tier === 'Free' && isFirstMonth ? ' <span class="first-month-badge">First Month</span>' : ''}
            </div>
          </div>
        </div>

        <div class="usage-footer">
          <div class="reset-info">
            📅 Resets in ${daysUntilReset} day${daysUntilReset !== 1 ? 's' : ''}
          </div>
          ${tier === 'Free' ? this.renderUpgradePrompt(remaining) : ''}
        </div>
      </div>
    `;
  }

  // Calculate percentage for progress bar
  getPercentage(used, limit) {
    if (limit === 0) return 0;
    return Math.min(100, (used / limit) * 100);
  }

  // Render upgrade prompt for free users
  renderUpgradePrompt(remaining) {
    const isLow = remaining.textQueries <= 2 || remaining.photoAnalysis <= 1;

    if (!isLow) return '';

    return `
      <div class="upgrade-prompt">
        <p>⚠️ Running low on queries!</p>
        <button class="upgrade-btn" onclick="usageDisplay.showPricing()">
          Upgrade Now
        </button>
      </div>
    `;
  }

  // Show pricing modal
  showPricing() {
    window.location.href = '/pricing.html';
  }

  // Open Stripe Customer Portal
  async manageSubscription() {
    try {
      const userId = localStorage.getItem('userId');

      const response = await fetch('/.netlify/functions/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-portal',
          userId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      alert('Unable to open subscription management. Please try again.');
    }
  }

  // Check if user can perform action
  canPerformAction(type) {
    if (!this.usageData) return false;

    const { remaining } = this.usageData;

    switch (type) {
      case 'text':
        return remaining.textQueries > 0;
      case 'photo':
        return remaining.photoAnalysis > 0;
      default:
        return false;
    }
  }

  // Show quota exceeded modal
  showQuotaExceeded(type) {
    const modal = document.createElement('div');
    modal.className = 'quota-modal';
    modal.innerHTML = `
      <div class="quota-modal-content">
        <div class="quota-icon">⚠️</div>
        <h2>Quota Exceeded</h2>
        <p>You've reached your monthly limit for ${type === 'photo' ? 'photo analyses' : 'text queries'}.</p>
        <p>Upgrade your plan to continue using HVAC Jack.</p>
        <div class="quota-actions">
          <button class="btn-primary" onclick="usageDisplay.showPricing()">View Plans</button>
          <button class="btn-secondary" onclick="this.closest('.quota-modal').remove()">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Pre-check before making API call
  async preCheckQuota(type) {
    await this.fetchUsage();

    if (!this.canPerformAction(type)) {
      this.showQuotaExceeded(type);
      return false;
    }

    return true;
  }

  // Increment usage after successful API call
  async incrementUsage(type) {
    try {
      const userId = localStorage.getItem('userId');

      const response = await fetch('/.netlify/functions/usage-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'increment',
          userId: userId,
          usageType: type
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.usageData = data;
        this.render();
        return true;
      } else if (response.status === 429) {
        const data = await response.json();
        this.showQuotaExceeded(type);
        return false;
      }
    } catch (error) {
      console.error('Failed to increment usage:', error);
    }

    return false;
  }
}

// Global instance
window.usageDisplay = new UsageDisplay();
