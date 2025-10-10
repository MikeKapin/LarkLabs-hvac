// HVAC Jack 4.0 - Subscription Tier Configuration
// Updated: January 20, 2025

export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null, // No Stripe price needed for free tier
    limits: {
      textQueries: 10,
      photoAnalysis: {
        firstMonth: 5,
        recurring: 3
      },
      explainerQueries: 10 // Counted as text queries
    },
    features: [
      '10 text queries per month',
      '5 photo analyses first month',
      '3 photo analyses per month after',
      'Basic HVAC troubleshooting',
      'Equipment identification',
      'Community support'
    ],
    restrictions: [
      'No priority support',
      'Standard response times',
      'Basic features only'
    ]
  },

  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    priceId: 'price_hvacjack_pro_999', // Replace with actual Stripe Price ID
    stripeProductId: 'prod_hvacjack_pro',
    stripeCheckoutUrl: 'https://buy.stripe.com/3cI8wQfxX0Ne8qGgsM7ok06',
    limits: {
      textQueries: 100,
      photoAnalysis: 20,
      explainerQueries: 100 // Counted as text queries
    },
    features: [
      '100 text queries per month',
      '20 photo analyses per month',
      'Advanced diagnostics',
      'Detailed equipment analysis',
      'Email support',
      'Code reference integration',
      'Conversation history',
      'Export troubleshooting reports'
    ],
    badge: 'MOST POPULAR',
    recommended: true
  },

  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    priceId: 'price_hvacjack_premium_1999', // Replace with actual Stripe Price ID
    stripeProductId: 'prod_hvacjack_premium',
    stripeCheckoutUrl: 'https://buy.stripe.com/fZubJ24Tj0Ne36m4K47ok07',
    limits: {
      textQueries: 250,
      photoAnalysis: 60,
      explainerQueries: 250 // Counted as text queries
    },
    features: [
      '250 text queries per month',
      '60 photo analyses per month',
      'Priority support',
      'Advanced explainer mode',
      'Unlimited conversation history',
      'PDF report generation',
      'Equipment database access',
      'Refrigerant calculator',
      'Early access to new features'
    ],
    badge: 'BEST VALUE'
  },

  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 49.99,
    priceId: 'price_hvacjack_business_4999', // Replace with actual Stripe Price ID
    stripeProductId: 'prod_hvacjack_business',
    limits: {
      textQueries: 1000, // 200 per user average
      photoAnalysis: 250, // 50 per user average
      explainerQueries: 1000, // Counted as text queries
      maxUsers: 5,
      sharedPool: true // All 5 users share the same quota pool
    },
    features: [
      'Up to 5 user accounts',
      '1,000 text queries per month (shared)',
      '250 photo analyses per month (shared)',
      'Priority support',
      'Dedicated account manager',
      'Team collaboration tools',
      'Advanced reporting & analytics',
      'Custom branding options',
      'Bulk export capabilities',
      'API access (coming soon)',
      'Training & onboarding session'
    ],
    badge: 'FOR TEAMS',
    isTeamPlan: true,
    recommended: false
  }
};

// Helper function to get tier by ID
export function getTier(tierId) {
  return SUBSCRIPTION_TIERS[tierId.toUpperCase()];
}

// Helper function to check if user has exceeded limits
export function hasExceededLimit(tier, usage, type) {
  const tierConfig = getTier(tier);
  if (!tierConfig) return true;

  switch (type) {
    case 'textQuery':
      return usage.textQueries >= tierConfig.limits.textQueries;

    case 'photoAnalysis':
      const photoLimit = usage.isFirstMonth
        ? (tierConfig.limits.photoAnalysis.firstMonth || tierConfig.limits.photoAnalysis)
        : (tierConfig.limits.photoAnalysis.recurring || tierConfig.limits.photoAnalysis);
      return usage.photoAnalysis >= photoLimit;

    case 'explainer':
      return usage.explainerQueries >= tierConfig.limits.explainerQueries;

    default:
      return true;
  }
}

// Helper function to get remaining quota
export function getRemainingQuota(tier, usage) {
  const tierConfig = getTier(tier);
  if (!tierConfig) {
    return {
      textQueries: 0,
      photoAnalysis: 0,
      explainerQueries: 0
    };
  }

  const photoLimit = usage.isFirstMonth
    ? (tierConfig.limits.photoAnalysis.firstMonth || tierConfig.limits.photoAnalysis)
    : (tierConfig.limits.photoAnalysis.recurring || tierConfig.limits.photoAnalysis);

  return {
    textQueries: Math.max(0, tierConfig.limits.textQueries - usage.textQueries),
    photoAnalysis: Math.max(0, photoLimit - usage.photoAnalysis),
    explainerQueries: Math.max(0, tierConfig.limits.explainerQueries - usage.explainerQueries),
    photoLimit: photoLimit
  };
}

// Helper to calculate days until reset
export function getDaysUntilReset(subscriptionStartDate) {
  const now = new Date();
  const start = new Date(subscriptionStartDate);

  // Calculate next billing date (same day next month)
  const nextBilling = new Date(start);
  nextBilling.setMonth(now.getMonth() + 1);

  // Calculate days remaining
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.ceil((nextBilling - now) / msPerDay);

  return Math.max(0, daysRemaining);
}

// Helper to determine if it's the user's first month
export function isFirstMonth(userCreatedDate) {
  const now = new Date();
  const created = new Date(userCreatedDate);

  // Calculate days since account creation
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceCreation = (now - created) / msPerDay;

  // First month = within 31 days of account creation
  return daysSinceCreation <= 31;
}

// Export default configuration
export default SUBSCRIPTION_TIERS;
