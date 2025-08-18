// netlify/functions/get-usage-stats.js
// Simple test function to verify deployment

exports.handler = async (event, context) => {
  console.log('✅ Function called successfully!');

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Simple test response
  const testData = {
    status: 'working',
    timestamp: new Date().toISOString(),
    message: 'Function is deployed and working!',
    summary: {
      totalSessions: 42,
      totalMessages: 156,
      averageSessionDuration: 12.5,
      homeownerModePercentage: 75,
      technicianModePercentage: 25,
      blockedMessages: 3,
      successRate: 98.5
    },
    dailyUsage: [
      { date: '2025-01-07', sessions: 5, messages: 23, blockedMessages: 0 },
      { date: '2025-01-08', sessions: 8, messages: 34, blockedMessages: 1 },
      { date: '2025-01-09', sessions: 6, messages: 28, blockedMessages: 0 },
      { date: '2025-01-10', sessions: 7, messages: 31, blockedMessages: 1 },
      { date: '2025-01-11', sessions: 9, messages: 40, blockedMessages: 1 },
      { date: '2025-01-12', sessions: 4, messages: 18, blockedMessages: 0 },
      { date: '2025-01-13', sessions: 3, messages: 12, blockedMessages: 0 }
    ],
    problemTypes: {
      'no_heat': 35,
      'no_cooling': 40,
      'thermostat_issues': 15,
      'maintenance': 10
    },
    modeUsage: {
      homeowner: 75,
      technician: 25
    },
    recentSessions: [
      {
        sessionId: 'sess_test_1',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        duration: 900000,
        messageCount: 5,
        mode: 'homeowner',
        problemType: 'no_heat',
        resolved: true
      },
      {
        sessionId: 'sess_test_2',
        startTime: new Date(Date.now() - 7200000).toISOString(),
        duration: 1200000,
        messageCount: 8,
        mode: 'technician',
        problemType: 'no_cooling',
        resolved: true
      }
    ],
    blockedContent: [
      {
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        reason: 'off_topic',
        messagePreview: 'Can you help me with cooking?',
        ip: '192.168.1.100',
        sessionId: 'sess_blocked_1'
      }
    ],
    performance: {
      averageResponseTime: 2.1,
      uptime: 99.5,
      errorRate: 1.5
    },
    realData: false,
    testMode: true,
    lastUpdated: new Date().toISOString()
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(testData)
  };
};
