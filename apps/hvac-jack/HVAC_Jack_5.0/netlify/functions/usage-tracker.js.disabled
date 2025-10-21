// netlify/functions/usage-tracker.js
// HVAC Jack 4.0 - Usage Tracking & Quota Management

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action, userId, usageType } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'check':
        return await checkUsage(userId, headers);

      case 'increment':
        return await incrementUsage(userId, usageType, headers);

      case 'reset':
        return await resetMonthlyUsage(userId, headers);

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }

  } catch (error) {
    console.error('Usage tracker error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Check current usage and limits
async function checkUsage(userId, headers) {
  try {
    // Get user's subscription and usage
    const { data: user, error } = await supabase
      .from('users')
      .select('*, usage(*)')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const usage = user.usage[0] || {
      textQueries: 0,
      photoAnalysis: 0,
      explainerQueries: 0
    };

    // Determine if first month
    const createdDate = new Date(user.created_at);
    const now = new Date();
    const daysSinceCreation = (now - createdDate) / (1000 * 60 * 60 * 24);
    const isFirstMonth = daysSinceCreation <= 31;

    // Get tier limits
    const tier = getTierConfig(user.subscription_tier || 'FREE');

    // Calculate photo limit based on first month
    let photoLimit = tier.limits.photoAnalysis;
    if (tier.id === 'free' && typeof photoLimit === 'object') {
      photoLimit = isFirstMonth ? photoLimit.firstMonth : photoLimit.recurring;
    }

    // Calculate remaining quota
    const remaining = {
      textQueries: Math.max(0, tier.limits.textQueries - usage.textQueries),
      photoAnalysis: Math.max(0, photoLimit - usage.photoAnalysis),
      explainerQueries: Math.max(0, tier.limits.explainerQueries - usage.explainerQueries)
    };

    // Calculate days until reset
    const lastReset = new Date(usage.period_start || user.created_at);
    const nextReset = new Date(lastReset);
    nextReset.setMonth(nextReset.getMonth() + 1);
    const daysUntilReset = Math.ceil((nextReset - now) / (1000 * 60 * 60 * 24));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        usage: {
          textQueries: usage.textQueries,
          photoAnalysis: usage.photoAnalysis,
          explainerQueries: usage.explainerQueries
        },
        limits: {
          textQueries: tier.limits.textQueries,
          photoAnalysis: photoLimit,
          explainerQueries: tier.limits.explainerQueries
        },
        remaining,
        tier: tier.name,
        isFirstMonth,
        daysUntilReset,
        canQuery: remaining.textQueries > 0,
        canPhotoAnalysis: remaining.photoAnalysis > 0
      })
    };

  } catch (error) {
    console.error('Check usage error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to check usage' })
    };
  }
}

// Increment usage counter
async function incrementUsage(userId, usageType, headers) {
  try {
    // First check if user has quota available
    const checkResult = await checkUsage(userId, headers);
    const checkData = JSON.parse(checkResult.body);

    if (!checkData.success) {
      return checkResult;
    }

    // Check if limit exceeded
    const canProceed = usageType === 'photo'
      ? checkData.canPhotoAnalysis
      : checkData.canQuery;

    if (!canProceed) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Usage limit exceeded',
          limitExceeded: true,
          usageType,
          remaining: checkData.remaining,
          daysUntilReset: checkData.daysUntilReset,
          upgradeUrl: '/pricing'
        })
      };
    }

    // Increment the appropriate counter
    const field = usageType === 'photo' ? 'photoAnalysis' : 'textQueries';

    const { data, error } = await supabase
      .from('usage')
      .update({
        [field]: checkData.usage[field] + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    // Get updated usage
    return await checkUsage(userId, headers);

  } catch (error) {
    console.error('Increment usage error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to increment usage' })
    };
  }
}

// Reset monthly usage (called by cron job)
async function resetMonthlyUsage(userId, headers) {
  try {
    const { data, error } = await supabase
      .from('usage')
      .update({
        textQueries: 0,
        photoAnalysis: 0,
        explainerQueries: 0,
        period_start: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Usage reset successfully',
        nextReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    };

  } catch (error) {
    console.error('Reset usage error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to reset usage' })
    };
  }
}

// Get tier configuration
function getTierConfig(tierName) {
  const tiers = {
    FREE: {
      id: 'free',
      name: 'Free',
      limits: {
        textQueries: 10,
        photoAnalysis: { firstMonth: 5, recurring: 3 },
        explainerQueries: 10
      }
    },
    PRO: {
      id: 'pro',
      name: 'Pro',
      limits: {
        textQueries: 100,
        photoAnalysis: 20,
        explainerQueries: 100
      }
    },
    PREMIUM: {
      id: 'premium',
      name: 'Premium',
      limits: {
        textQueries: 250,
        photoAnalysis: 60,
        explainerQueries: 250
      }
    },
    BUSINESS: {
      id: 'business',
      name: 'Business',
      limits: {
        textQueries: 1000,
        photoAnalysis: 250,
        explainerQueries: 1000
      }
    }
  };

  return tiers[tierName.toUpperCase()] || tiers.FREE;
}
