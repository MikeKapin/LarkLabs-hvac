// netlify/functions/health.js
// Health check endpoint for HVAC Jack

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      claudeConfigured: !!process.env.CLAUDE_API_KEY,
      service: 'HVAC Jack API',
      version: '1.0.0'
    })
  };
};
