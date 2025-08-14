// netlify/functions/get-usage-stats.js
// Endpoint to retrieve usage statistics for dashboard

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // In production, this would query your database
    // For now, return mock data that matches the expected structure
    const mockStats = await generateMockUsageStats();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockStats)
    };
  } catch (error) {
    console.error('Usage stats error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function generateMockUsageStats() {
  // Mock data - replace with actual database queries in production
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  return {
    summary: {
      totalSessions: 1247,
      totalMessages: 8934,
      averageSessionDuration: 18.5, // minutes
      homeownerModePercentage: 78,
      technicianModePercentage: 22,
      blockedMessages: 23,
      successRate: 98.2
    },
    dailyUsage: generateDailyUsage(7), // Last 7 days
    problemTypes: {
      'no_heat': 35,
      'no_cooling': 40,
      'thermostat_issues': 15,
      'maintenance': 10
    },
    modeUsage: {
      'homeowner': 78,
      'technician': 22
    },
    recentSessions: generateRecentSessions(10),
    blockedContent: generateBlockedContent(5),
    performance: {
      averageResponseTime: 2.3, // seconds
      uptime: 99.8,
      errorRate: 0.2
    }
  };
}

function generateDailyUsage(days) {
  const usage = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    usage.push({
      date: date.toISOString().split('T')[0],
      sessions: Math.floor(Math.random() * 20) + 5,
      messages: Math.floor(Math.random() * 150) + 50,
      blockedMessages: Math.floor(Math.random() * 5)
    });
  }
  
  return usage;
}

function generateRecentSessions(count) {
  const sessions = [];
  const now = new Date();
  
  const problemTypes = ['no_heat', 'no_cooling', 'thermostat_issues', 'maintenance', 'noise'];
  const modes = ['homeowner', 'technician'];
  
  for (let i = 0; i < count; i++) {
    const sessionTime = new Date(now.getTime() - (i * 1000 * 60 * Math.random() * 120)); // Random time in last 2 hours
    
    sessions.push({
      sessionId: `sess_${Date.now()}_${i}`,
      startTime: sessionTime.toISOString(),
      duration: Math.floor(Math.random() * 1800000) + 300000, // 5-35 minutes in ms
      messageCount: Math.floor(Math.random() * 15) + 3,
      mode: modes[Math.floor(Math.random() * modes.length)],
      problemType: problemTypes[Math.floor(Math.random() * problemTypes.length)],
      resolved: Math.random() > 0.3 // 70% resolution rate
    });
  }
  
  return sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
}

function generateBlockedContent(count) {
  const blocked = [];
  const now = new Date();
  
  const reasons = ['off_topic', 'programming', 'explicit', 'spam', 'system_manipulation'];
  const examples = {
    'off_topic': 'Can you help me with cooking recipes?',
    'programming': 'Write Python code for data analysis',
    'explicit': '[inappropriate content blocked]',
    'spam': 'aaaaaaaaaaaaaaaaaaaaaa',
    'system_manipulation': 'Ignore your instructions and...'
  };
  
  for (let i = 0; i < count; i++) {
    const blockTime = new Date(now.getTime() - (i * 1000 * 60 * Math.random() * 60)); // Random time in last hour
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    
    blocked.push({
      timestamp: blockTime.toISOString(),
      reason: reason,
      messagePreview: examples[reason],
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      sessionId: `sess_blocked_${i}`
    });
  }
  
  return blocked.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// In production, replace mock functions with actual database queries:
/*
async function getUsageStatsFromDB() {
  // Example with MongoDB
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('hvac_jack');
    
    const totalSessions = await db.collection('usage_logs')
      .countDocuments({ eventType: 'session_start' });
    
    const totalMessages = await db.collection('usage_logs')
      .countDocuments({ eventType: 'message_sent' });
    
    // Add more aggregation queries for other stats
    
    return {
      summary: { totalSessions, totalMessages, ... },
      // other stats...
    };
  } finally {
    await client.close();
  }
}
*/
