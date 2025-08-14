// netlify/functions/health.js
// Enhanced health check endpoint with shared storage monitoring

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Log health check request
  logHealthCheck({
    timestamp: new Date().toISOString(),
    ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown',
    userAgent: event.headers['user-agent']
  });

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    claudeConfigured: !!process.env.CLAUDE_API_KEY,
    service: 'HVAC Jack API',
    version: '1.2.0',
    features: {
      contentFiltering: true,
      usageTracking: true,
      rateLimiting: true,
      sharedStorage: true,
      realTimeStats: true
    },
    limits: {
      maxMessageLength: 1000,
      messagesPerMinute: 20,
      maxTokens: 1000,
      maxStoredEvents: 1000,
      maxStoredMessages: 500,
      maxBlockedContent: 100
    }
  };

  // Check shared storage status
  try {
    const storageStats = getStorageStats();
    healthData.storage = {
      status: 'operational',
      ...storageStats
    };
  } catch (error) {
    healthData.storage = {
      status: 'error',
      error: error.message
    };
  }

  // Additional health checks
  if (process.env.CLAUDE_API_KEY) {
    try {
      // Quick test of Claude API availability (optional - can be slow)
      // Uncomment for full health check:
      /*
      const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
      });

      healthData.claudeApiStatus = testResponse.ok ? 'available' : 'error';
      */
      
      // For faster health checks, just verify the key exists
      healthData.claudeApiStatus = 'configured';
    } catch (error) {
      healthData.claudeApiStatus = 'unavailable';
      healthData.claudeApiError = error.message;
    }
  } else {
    healthData.claudeApiStatus = 'not_configured';
  }

  // Memory usage info
  const memoryUsage = process.memoryUsage();
  healthData.memory = {
    used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
    total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
    rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB'
  };

  // Environment info
  healthData.environment = {
    nodeVersion: process.version,
    platform: process.platform,
    uptime: Math.round(process.uptime()) + ' seconds'
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(healthData, null, 2)
  };
};

function getStorageStats() {
  // Initialize storage if it doesn't exist
  global.usageStore = global.usageStore || {
    sessions: new Map(),
    messages: [],
    blockedContent: [],
    events: [],
    dailyStats: new Map()
  };

  const store = global.usageStore;
  
  // Calculate some basic statistics
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  
  // Count recent activity
  const recentEvents = store.events.filter(e => e.timestamp >= last24Hours).length;
  const recentMessages = store.messages.filter(m => m.timestamp >= last24Hours).length;
  const recentBlocked = store.blockedContent.filter(b => b.timestamp >= last24Hours).length;
  
  // Active sessions (sessions with activity in last hour)
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  let activeSessions = 0;
  for (const session of store.sessions.values()) {
    if ((session.endTime || session.startTime) >= lastHour) {
      activeSessions++;
    }
  }

  return {
    totalSessions: store.sessions.size,
    activeSessions: activeSessions,
    totalMessages: store.messages.length,
    totalBlockedContent: store.blockedContent.length,
    totalEvents: store.events.length,
    dailyStatsCount: store.dailyStats.size,
    recentActivity: {
      last24Hours: {
        events: recentEvents,
        messages: recentMessages,
        blockedContent: recentBlocked
      }
    },
    memoryFootprint: {
      sessions: store.sessions.size,
      messagesArray: store.messages.length,
      blockedArray: store.blockedContent.length,
      eventsArray: store.events.length,
      dailyStatsMap: store.dailyStats.size
    }
  };
}

function logHealthCheck(data) {
  console.log('🏥 Health Check:', {
    timestamp: data.timestamp,
    ip: data.ip,
    userAgent: data.userAgent?.substring(0, 50) + '...'
  });
  
  // Also log storage stats periodically
  try {
    const stats = getStorageStats();
    console.log('📊 Storage Stats:', {
      sessions: stats.totalSessions,
      messages: stats.totalMessages,
      events: stats.totalEvents,
      activeSessions: stats.activeSessions,
      recent24h: stats.recentActivity.last24Hours
    });
  } catch (error) {
    console.warn('Could not get storage stats:', error.message);
  }
}
