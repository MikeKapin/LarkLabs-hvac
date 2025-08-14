// netlify/functions/track-usage.js
// Usage tracking endpoint for HVAC Jack

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
    const { eventType, data, sessionId, timestamp } = JSON.parse(event.body);
    
    // Create usage log entry
    const usageLog = {
      eventType,
      sessionId,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: event.headers['user-agent'],
      ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown',
      data
    };

    // Store usage data
    await storeUsageData(usageLog);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Usage tracking error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function storeUsageData(logEntry) {
  // Console logging for development - replace with database in production
  console.log('📊 Usage Event:', {
    event: logEntry.eventType,
    session: logEntry.sessionId,
    timestamp: logEntry.timestamp,
    data: logEntry.data,
    userAgent: logEntry.userAgent?.substring(0, 50) + '...',
    ip: logEntry.ip
  });

  // In production, you could store in:
  // - MongoDB: await storeInMongoDB(logEntry);
  // - Airtable: await storeInAirtable(logEntry);
  // - PostgreSQL: await storeInPostgreSQL(logEntry);
  // - Google Sheets: await storeInGoogleSheets(logEntry);
  
  return true;
}

// Example database storage functions (commented out for now):

/*
// MongoDB storage
async function storeInMongoDB(logEntry) {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('hvac_jack');
    const collection = db.collection('usage_logs');
    await collection.insertOne(logEntry);
  } finally {
    await client.close();
  }
}

// Airtable storage
async function storeInAirtable(logEntry) {
  const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Usage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        'Event Type': logEntry.eventType,
        'Session ID': logEntry.sessionId,
        'Timestamp': logEntry.timestamp,
        'Data': JSON.stringify(logEntry.data),
        'User Agent': logEntry.userAgent,
        'IP': logEntry.ip
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Airtable error: ${response.statusText}`);
  }
}
*/
