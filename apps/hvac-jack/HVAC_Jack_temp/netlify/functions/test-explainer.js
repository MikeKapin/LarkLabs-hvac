// netlify/functions/test-explainer.js
// Test endpoint to verify explainer system deployment

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'success',
      message: '🎓 Explainer system is deployed and working!',
      timestamp: new Date().toISOString(),
      version: '1.0-clean',
      deployment: 'active'
    })
  };
};