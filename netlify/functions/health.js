// netlify/functions/health.js
// Health check endpoint for HVAC Jack

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Health check endpoint
  if (event.httpMethod === 'GET') {
    try {
      // Check if Claude API key is configured
      const claudeConfigured = !!process.env.CLAUDE_API_KEY;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          claudeConfigured: claudeConfigured,
          timestamp: new Date().toISOString(),
          service: 'HVAC Jack Backend',
          version: '1.0.0'
        })
      };

    } catch (error) {
      console.error('Health check error:', error);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          status: 'error',
          claudeConfigured: false,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      };
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not found' })
  };
};
