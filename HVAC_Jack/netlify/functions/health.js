// netlify/functions/health.js
// Enhanced health check endpoint with shared storage monitoring and photo analysis support

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
    claudeConfigured: !!(process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY),
    service: 'HVAC Jack API',
    version: '1.3.0',
    features: {
      contentFiltering: true,
      usageTracking: true,
      rateLimiting: true,
      sharedStorage: true,
      realTimeStats: true,
      photoAnalysis: !!(process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY), // NEW: Photo analysis capability
      ratingPlateRecognition: !!(process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY) // NEW: Rating plate analysis
    },
    limits: {
      maxMessageLength: 1000,
      messagesPerMinute: 20,
      maxTokens: 1000,
      maxStoredEvents: 1000,
      maxStoredMessages: 500,
      maxBlockedContent: 100,
      maxPhotoSize: '10MB', // NEW: Photo size limit
      photoAnalysisTimeout: '60s' // NEW: Photo analysis timeout
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
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      // Quick test of Claude API availability (optional - can be slow)
      // Uncomment for full health check:
      /*
      const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
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
      healthData.photoAnalysisStatus = 'available'; // NEW: Photo analysis status
    } catch (error) {
      healthData.claudeApiStatus = 'unavailable';
      healthData.photoAnalysisStatus = 'unavailable'; // NEW
      healthData.claudeApiError = error.message;
    }
  } else {
    healthData.claudeApiStatus = 'not_configured';
    healthData.photoAnalysisStatus = 'not_configured'; // NEW
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

  // NEW: Photo analysis capabilities
  healthData.photoCapabilities = {
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: '10MB',
    analysisFeatures: [
      'OCR text extraction',
      'Equipment identification', 
      'Model/serial number parsing',
      'Warranty calculation',
      'Capacitor specifications',
      'Technical specifications'
    ],
    avgAnalysisTime: '15-30 seconds'
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
    dailyStats: new Map(),
    photoAnalyses: [] // NEW: Track photo analysis requests
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
  const recentPhotoAnalyses = (store.photoAnalyses || []).filter(p => p.timestamp >= last24Hours).length; // NEW
  
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
    totalPhotoAnalyses: (store.photoAnalyses || []).length, // NEW
    dailyStatsCount: store.dailyStats.size,
    recentActivity: {
      last24Hours: {
        events: recentEvents,
        messages: recentMessages,
        blockedContent: recentBlocked,
        photoAnalyses: recentPhotoAnalyses // NEW
      }
    },
    memoryFootprint: {
      sessions: store.sessions.size,
      messagesArray: store.messages.length,
      blockedArray: store.blockedContent.length,
      eventsArray: store.events.length,
      photoAnalysesArray: (store.photoAnalyses || []).length, // NEW
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
      photoAnalyses: stats.totalPhotoAnalyses, // NEW
      activeSessions: stats.activeSessions,
      recent24h: stats.recentActivity.last24Hours
    });
  } catch (error) {
    console.warn('Could not get storage stats:', error.message);
  }
}
