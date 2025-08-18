// netlify/functions/clear-data.js
// Function to clear all stored usage data

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

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

  try {
    // Clear all data from global storage
    const beforeCounts = getStorageCounts();
    
    // Reset the global storage
    global.usageStore = {
      sessions: new Map(),
      messages: [],
      blockedContent: [],
      events: [],
      dailyStats: new Map()
    };

    const afterCounts = getStorageCounts();

    console.log('🗑️ Data Cleared:', {
      timestamp: new Date().toISOString(),
      before: beforeCounts,
      after: afterCounts,
      cleared: {
        sessions: beforeCounts.sessions,
        messages: beforeCounts.messages,
        blockedContent: beforeCounts.blockedContent,
        events: beforeCounts.events,
        dailyStats: beforeCounts.dailyStats
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'All usage data cleared successfully',
        cleared: beforeCounts,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Clear data error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to clear data',
        message: error.message 
      })
    };
  }
};

function getStorageCounts() {
  // Initialize storage if it doesn't exist
  if (!global.usageStore) {
    global.usageStore = {
      sessions: new Map(),
      messages: [],
      blockedContent: [],
      events: [],
      dailyStats: new Map()
    };
  }

  const store = global.usageStore;
  
  return {
    sessions: store.sessions.size,
    messages: store.messages.length,
    blockedContent: store.blockedContent.length,
    events: store.events.length,
    dailyStats: store.dailyStats.size
  };
}
