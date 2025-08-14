// netlify/functions/health.js
// Enhanced health check endpoint with usage logging

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
    version: '1.1.0',
    features: {
      contentFiltering: true,
      usageTracking: true,
      rateLimiting: true
    },
    limits: {
      maxMessageLength: 1000,
      messagesPerMinute: 20,
      maxTokens: 1000
    }
  };

  // Additional health checks
  if (process.env.CLAUDE_API_KEY) {
    try {
      // Quick test of Claude API availability (optional)
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
    } catch (error) {
      healthData.claudeApiStatus = 'unavailable';
      healthData.claudeApiError = error.message;
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(healthData)
  };
};

function logHealthCheck(data) {
  console.log('🏥 Health Check:', {
    timestamp: data.timestamp,
    ip: data.ip,
    userAgent: data.userAgent?.substring(0, 50) + '...'
  });
}
