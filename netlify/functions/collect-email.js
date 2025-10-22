// netlify/functions/collect-email.js
// Centralized email collection endpoint with persistent storage

// Initialize shared storage for email collection
global.emailStore = global.emailStore || {
  subscribers: [],
  lastUpdated: new Date().toISOString()
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // POST: Add new email subscriber
  if (event.httpMethod === 'POST') {
    try {
      const { email, source, name, metadata } = JSON.parse(event.body);

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Invalid email address'
          })
        };
      }

      // Check if email already exists
      const existingIndex = global.emailStore.subscribers.findIndex(
        sub => sub.email.toLowerCase() === email.toLowerCase()
      );

      const timestamp = new Date().toISOString();
      const subscriberData = {
        email: email.toLowerCase(),
        source: source || 'unknown',
        name: name || null,
        subscribedAt: timestamp,
        ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown',
        userAgent: event.headers['user-agent'] || 'unknown',
        metadata: metadata || {},
        active: true
      };

      if (existingIndex !== -1) {
        // Update existing subscriber
        global.emailStore.subscribers[existingIndex] = {
          ...global.emailStore.subscribers[existingIndex],
          ...subscriberData,
          resubscribedAt: timestamp,
          resubscribeCount: (global.emailStore.subscribers[existingIndex].resubscribeCount || 0) + 1
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Email updated successfully',
            alreadySubscribed: true
          })
        };
      } else {
        // Add new subscriber
        global.emailStore.subscribers.push(subscriberData);
        global.emailStore.lastUpdated = timestamp;

        console.log(`📧 New subscriber: ${email} from ${source}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Successfully subscribed!',
            totalSubscribers: global.emailStore.subscribers.length
          })
        };
      }
    } catch (error) {
      console.error('Email collection error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to process subscription'
        })
      };
    }
  }

  // GET: Retrieve all subscribers (requires authentication in dashboard)
  if (event.httpMethod === 'GET') {
    const queryParams = event.queryStringParameters || {};
    const authCode = queryParams.auth;

    // Simple authentication check
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

    // Return subscriber data with statistics
    const activeSubscribers = global.emailStore.subscribers.filter(sub => sub.active);
    const sources = {};

    activeSubscribers.forEach(sub => {
      sources[sub.source] = (sources[sub.source] || 0) + 1;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        totalSubscribers: activeSubscribers.length,
        totalAllTime: global.emailStore.subscribers.length,
        subscribers: activeSubscribers,
        sources: sources,
        lastUpdated: global.emailStore.lastUpdated,
        dataNote: 'Using in-memory storage. Data persists during function warm state.'
      })
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
