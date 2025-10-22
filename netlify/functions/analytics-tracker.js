// netlify/functions/analytics-tracker.js
// Custom analytics tracking for page visits and user engagement

// Initialize shared storage for analytics
global.analyticsStore = global.analyticsStore || {
  pageViews: [],
  sessions: new Map(),
  dailyStats: new Map(),
  topPages: new Map(),
  referrers: new Map(),
  lastUpdated: new Date().toISOString()
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // POST: Track page view
  if (event.httpMethod === 'POST') {
    try {
      const {
        page,
        pageTitle,
        referrer,
        sessionId,
        eventType,
        metadata
      } = JSON.parse(event.body);

      const timestamp = new Date().toISOString();
      const pageViewData = {
        page: page || 'unknown',
        pageTitle: pageTitle || 'Untitled',
        referrer: referrer || 'direct',
        sessionId: sessionId || generateSessionId(),
        timestamp: timestamp,
        ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown',
        userAgent: event.headers['user-agent'] || 'unknown',
        eventType: eventType || 'page_view',
        metadata: metadata || {}
      };

      // Store page view
      global.analyticsStore.pageViews.push(pageViewData);

      // Keep only last 5000 page views
      if (global.analyticsStore.pageViews.length > 5000) {
        global.analyticsStore.pageViews = global.analyticsStore.pageViews.slice(-5000);
      }

      // Update top pages counter
      const pageKey = pageViewData.page;
      global.analyticsStore.topPages.set(
        pageKey,
        (global.analyticsStore.topPages.get(pageKey) || 0) + 1
      );

      // Update referrer stats
      if (referrer && referrer !== 'direct') {
        global.analyticsStore.referrers.set(
          referrer,
          (global.analyticsStore.referrers.get(referrer) || 0) + 1
        );
      }

      // Update daily stats
      updateDailyAnalytics(timestamp, pageViewData);

      // Update session tracking
      if (sessionId) {
        updateSessionTracking(sessionId, pageViewData);
      }

      global.analyticsStore.lastUpdated = timestamp;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          tracked: true
        })
      };
    } catch (error) {
      console.error('Analytics tracking error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to track analytics'
        })
      };
    }
  }

  // GET: Retrieve analytics data (requires authentication)
  if (event.httpMethod === 'GET') {
    const queryParams = event.queryStringParameters || {};
    const authCode = queryParams.auth;

    if (authCode !== '2080') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized'
        })
      };
    }

    const days = parseInt(queryParams.days) || 7;

    // Calculate statistics
    const stats = calculateAnalyticsStats(days);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        ...stats,
        lastUpdated: global.analyticsStore.lastUpdated
      })
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function updateDailyAnalytics(timestamp, pageViewData) {
  const date = new Date(timestamp).toISOString().split('T')[0];

  if (!global.analyticsStore.dailyStats.has(date)) {
    global.analyticsStore.dailyStats.set(date, {
      date: date,
      pageViews: 0,
      uniqueVisitors: new Set(),
      topPages: {},
      events: []
    });
  }

  const dayStats = global.analyticsStore.dailyStats.get(date);
  dayStats.pageViews++;
  dayStats.uniqueVisitors.add(pageViewData.ip);

  const pageKey = pageViewData.page;
  dayStats.topPages[pageKey] = (dayStats.topPages[pageKey] || 0) + 1;

  dayStats.events.push({
    type: pageViewData.eventType,
    page: pageViewData.page,
    timestamp: timestamp
  });

  global.analyticsStore.dailyStats.set(date, dayStats);

  // Keep only last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0];

  for (const [date] of global.analyticsStore.dailyStats.entries()) {
    if (date < cutoffDate) {
      global.analyticsStore.dailyStats.delete(date);
    }
  }
}

function updateSessionTracking(sessionId, pageViewData) {
  if (!global.analyticsStore.sessions.has(sessionId)) {
    global.analyticsStore.sessions.set(sessionId, {
      sessionId: sessionId,
      startTime: pageViewData.timestamp,
      lastActivity: pageViewData.timestamp,
      pageViews: [],
      ip: pageViewData.ip
    });
  }

  const session = global.analyticsStore.sessions.get(sessionId);
  session.lastActivity = pageViewData.timestamp;
  session.pageViews.push({
    page: pageViewData.page,
    timestamp: pageViewData.timestamp
  });

  global.analyticsStore.sessions.set(sessionId, session);
}

function calculateAnalyticsStats(days) {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get top pages
  const topPagesArray = Array.from(global.analyticsStore.topPages.entries())
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Get top referrers
  const topReferrersArray = Array.from(global.analyticsStore.referrers.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Get daily stats for the period
  const dailyStatsArray = [];
  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    const dayData = global.analyticsStore.dailyStats.get(dateStr);
    if (dayData) {
      dailyStatsArray.push({
        date: dateStr,
        pageViews: dayData.pageViews,
        uniqueVisitors: dayData.uniqueVisitors.size,
        topPages: dayData.topPages
      });
    } else {
      dailyStatsArray.push({
        date: dateStr,
        pageViews: 0,
        uniqueVisitors: 0,
        topPages: {}
      });
    }
  }

  // Calculate totals
  const totalPageViews = global.analyticsStore.pageViews.length;
  const activeSessions = Array.from(global.analyticsStore.sessions.values())
    .filter(session => {
      const lastActivity = new Date(session.lastActivity);
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      return lastActivity > thirtyMinutesAgo;
    }).length;

  // Calculate app-specific stats
  const appStats = {
    'hvac-jack': { pageViews: 0, launches: 0 },
    'gas-tech-tutor': { pageViews: 0, launches: 0 },
    'code-compass': { pageViews: 0, launches: 0 }
  };

  global.analyticsStore.pageViews.forEach(view => {
    const appType = view.metadata?.appType;
    if (appType && appStats[appType]) {
      if (view.eventType === 'page_view') {
        appStats[appType].pageViews++;
      } else if (view.eventType === 'app_launch') {
        appStats[appType].launches++;
      }
    }
  });

  return {
    totalPageViews: totalPageViews,
    activeSessions: activeSessions,
    totalSessions: global.analyticsStore.sessions.size,
    topPages: topPagesArray,
    topReferrers: topReferrersArray,
    dailyStats: dailyStatsArray,
    appStats: appStats,
    period: {
      days: days,
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    }
  };
}
