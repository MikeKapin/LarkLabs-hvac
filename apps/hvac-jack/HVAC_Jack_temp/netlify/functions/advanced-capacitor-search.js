// netlify/functions/advanced-capacitor-search.js
// Advanced web search endpoint for capacitor specifications

const { CapacitorDatabase } = require('./capacitor-database');

exports.handler = async (event, context) => {
  console.log('🔍 Advanced Capacitor Search Request');
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const startTime = Date.now();

  try {
    const requestData = JSON.parse(event.body);
    const { 
      equipmentDetails, 
      sessionId, 
      userQuery,
      mode = 'homeowner'
    } = requestData;

    console.log('🔍 Advanced search request:', {
      brand: equipmentDetails?.brand,
      model: equipmentDetails?.model,
      type: equipmentDetails?.type,
      customQuery: !!userQuery,
      sessionId
    });

    // Validate required data
    if (!equipmentDetails || (!equipmentDetails.brand && !equipmentDetails.model && !userQuery)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Equipment details or custom search query required',
          message: 'Please provide equipment brand/model or specify what to search for'
        })
      };
    }

    // Rate limiting for web searches (more restrictive)
    const rateLimitCheck = await checkWebSearchRateLimit(event.headers['client-ip'] || event.headers['x-forwarded-for']);
    if (!rateLimitCheck.allowed) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Web search rate limit exceeded',
          retryAfter: rateLimitCheck.retryAfter,
          message: 'Advanced searches are limited to prevent abuse. Please try again later.'
        })
      };
    }

    // Perform advanced capacitor search
    const capacitorDB = new CapacitorDatabase();
    const searchResult = await capacitorDB.performAdvancedCapacitorSearch(equipmentDetails, userQuery);

    const responseTime = (Date.now() - startTime) / 1000;
    console.log(`🔍 Advanced search completed in ${responseTime}s`);

    // Log the search
    await logAdvancedSearch({
      sessionId,
      timestamp: new Date().toISOString(),
      success: searchResult.success,
      mode: mode,
      responseTime,
      equipmentBrand: equipmentDetails?.brand,
      equipmentModel: equipmentDetails?.model,
      searchQuery: searchResult.searchQuery,
      resultsFound: searchResult.resultsFound || 0,
      capacitorsFound: searchResult.capacitors?.length || 0,
      ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown'
    });

    if (searchResult.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          capacitors: searchResult.capacitors,
          source: searchResult.source,
          confidence: searchResult.confidence,
          searchQuery: searchResult.searchQuery,
          resultsFound: searchResult.resultsFound,
          recommendations: searchResult.recommendations,
          responseTime,
          sessionId,
          timestamp: new Date().toISOString(),
          webSearchPerformed: true
        })
      };
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: searchResult.error,
          fallbackRecommendation: searchResult.fallbackRecommendation,
          responseTime,
          sessionId,
          timestamp: new Date().toISOString(),
          webSearchPerformed: true
        })
      };
    }

  } catch (error) {
    const responseTime = (Date.now() - startTime) / 1000;
    console.error('❌ Advanced search error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Advanced search failed',
        message: error.message,
        responseTime,
        webSearchPerformed: false
      })
    };
  }
};

// Rate limiting for web searches (more restrictive than regular photo analysis)
async function checkWebSearchRateLimit(ip) {
  const key = ip || 'unknown';
  const now = Date.now();
  const windowMs = 600000; // 10 minutes
  const maxRequests = 5; // Only 5 web searches per 10 minutes

  if (!global.webSearchRateLimitStore) {
    global.webSearchRateLimitStore = new Map();
  }

  if (!global.webSearchRateLimitStore.has(key)) {
    global.webSearchRateLimitStore.set(key, []);
  }

  const requests = global.webSearchRateLimitStore.get(key);
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
    };
  }

  validRequests.push(now);
  global.webSearchRateLimitStore.set(key, validRequests);
  return { allowed: true };
}

// Log advanced search usage
async function logAdvancedSearch(data) {
  try {
    const store = global.usageStore || {};
    
    store.advancedSearches = store.advancedSearches || [];
    store.advancedSearches.push({
      ...data,
      searchType: 'capacitor_advanced'
    });

    if (store.advancedSearches.length > 100) {
      store.advancedSearches = store.advancedSearches.slice(-100);
    }

    console.log('🔍 Advanced Search Logged:', {
      sessionId: data.sessionId,
      success: data.success,
      mode: data.mode,
      responseTime: data.responseTime,
      capacitorsFound: data.capacitorsFound
    });
  } catch (error) {
    console.warn('Failed to log advanced search:', error);
  }
}