// netlify/functions/track-usage.js
// Enhanced usage tracking with shared in-memory storage

// Initialize shared storage if it doesn't exist
global.usageStore = global.usageStore || {
  sessions: new Map(),
  messages: [],
  blockedContent: [],
  events: [],
  dailyStats: new Map()
};

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
      data: data || {}
    };

    // Store in shared memory and process the event
    await storeAndProcessUsageData(usageLog);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        stored: true,
        eventType: eventType,
        sessionId: sessionId
      })
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

async function storeAndProcessUsageData(logEntry) {
  const store = global.usageStore;
  const { eventType, sessionId, data, timestamp } = logEntry;

  // Add to events log
  store.events.push(logEntry);

  // Keep only last 1000 events to prevent memory issues
  if (store.events.length > 1000) {
    store.events = store.events.slice(-1000);
  }

  // Process different event types
  switch (eventType) {
    case 'session_start':
      handleSessionStart(store, sessionId, data, timestamp);
      break;
      
    case 'message_sent':
      handleMessageSent(store, sessionId, data, timestamp);
      break;
      
    case 'response_generated':
      handleResponseGenerated(store, sessionId, data, timestamp);
      break;
      
    case 'input_rejected':
    case 'input_blocked':
      handleInputBlocked(store, sessionId, data, timestamp, logEntry.ip);
      break;
      
    case 'connection_success':
    case 'connection_failed':
      handleConnectionEvent(store, eventType, data, timestamp);
      break;
      
    case 'mode_switched':
      handleModeSwitch(store, sessionId, data, timestamp);
      break;
      
    case 'conversation_cleared':
      handleConversationCleared(store, sessionId, data, timestamp);
      break;
      
    default:
      // Generic event logging
      console.log(`📊 Generic Event: ${eventType}`, data);
  }

  // Update daily stats
  updateDailyStats(store, timestamp, eventType);

  // Console logging for development
  console.log('📊 Usage Event Processed:', {
    event: eventType,
    session: sessionId,
    timestamp: timestamp,
    dataKeys: Object.keys(data || {}),
    totalSessions: store.sessions.size,
    totalMessages: store.messages.length,
    totalEvents: store.events.length
  });

  return true;
}

function handleSessionStart(store, sessionId, data, timestamp) {
  if (!store.sessions.has(sessionId)) {
    store.sessions.set(sessionId, {
      sessionId,
      startTime: timestamp,
      endTime: null,
      messageCount: 0,
      mode: data.mode || 'homeowner',
      problemType: null,
      resolved: false,
      duration: null
    });
    console.log(`🆕 New Session: ${sessionId} (${data.mode || 'homeowner'} mode)`);
  }
}

function handleMessageSent(store, sessionId, data, timestamp) {
  // Update session message count
  if (store.sessions.has(sessionId)) {
    const session = store.sessions.get(sessionId);
    session.messageCount++;
    session.endTime = timestamp; // Update last activity
    store.sessions.set(sessionId, session);
  }

  // Store message data
  const messageRecord = {
    sessionId,
    timestamp,
    content: data.message || '',
    mode: data.mode || 'homeowner',
    inputLength: data.inputLength || 0,
    responseTime: null,
    error: false
  };

  store.messages.push(messageRecord);

  // Keep only last 500 messages
  if (store.messages.length > 500) {
    store.messages = store.messages.slice(-500);
  }

  console.log(`💬 Message Sent: Session ${sessionId}, Mode: ${data.mode}`);
}

function handleResponseGenerated(store, sessionId, data, timestamp) {
  // Find the most recent message for this session and update it
  const messageIndex = store.messages.findIndex(
    msg => msg.sessionId === sessionId && !msg.responseTime
  );

  if (messageIndex !== -1) {
    store.messages[messageIndex].responseTime = data.responseTime || 2.0;
    store.messages[messageIndex].usingAI = data.usingAI || false;
  }

  console.log(`🤖 Response Generated: Session ${sessionId}, Time: ${data.responseTime}s`);
}

function handleInputBlocked(store, sessionId, data, timestamp, ip) {
  const blockedRecord = {
    sessionId,
    timestamp,
    reason: data.reason || data.category || 'unknown',
    messagePreview: (data.originalMessage || '').substring(0, 100),
    ip: ip,
    category: data.category || 'content_filter'
  };

  store.blockedContent.push(blockedRecord);

  // Keep only last 100 blocked messages
  if (store.blockedContent.length > 100) {
    store.blockedContent = store.blockedContent.slice(-100);
  }

  console.log(`🚫 Content Blocked: ${data.reason || data.category}, Session: ${sessionId}`);
}

function handleConnectionEvent(store, eventType, data, timestamp) {
  console.log(`🔌 Connection Event: ${eventType}`, {
    attempts: data.attempts,
    error: data.error
  });
}

function handleModeSwitch(store, sessionId, data, timestamp) {
  // Update session mode if session exists
  if (store.sessions.has(sessionId)) {
    const session = store.sessions.get(sessionId);
    session.mode = data.to_mode || data.mode || session.mode;
    store.sessions.set(sessionId, session);
  }

  console.log(`🔄 Mode Switch: ${data.from_mode} → ${data.to_mode}, Session: ${sessionId}`);
}

function handleConversationCleared(store, sessionId, data, timestamp) {
  // Mark session as ended
  if (store.sessions.has(sessionId)) {
    const session = store.sessions.get(sessionId);
    session.endTime = timestamp;
    session.resolved = true; // Assume cleared = resolved
    
    // Calculate duration if we have start time
    if (session.startTime) {
      const start = new Date(session.startTime);
      const end = new Date(timestamp);
      session.duration = end - start; // Duration in milliseconds
    }
    
    store.sessions.set(sessionId, session);
  }

  console.log(`🧹 Conversation Cleared: Session ${sessionId}, Message Count: ${data.messageCount}`);
}

function updateDailyStats(store, timestamp, eventType) {
  const date = new Date(timestamp).toISOString().split('T')[0];
  
  if (!store.dailyStats.has(date)) {
    store.dailyStats.set(date, {
      date,
      sessions: 0,
      messages: 0,
      blockedMessages: 0,
      errors: 0
    });
  }

  const dayStats = store.dailyStats.get(date);

  switch (eventType) {
    case 'session_start':
      dayStats.sessions++;
      break;
    case 'message_sent':
      dayStats.messages++;
      break;
    case 'input_rejected':
    case 'input_blocked':
      dayStats.blockedMessages++;
      break;
    case 'processing_error':
    case 'connection_failed':
      dayStats.errors++;
      break;
  }

  store.dailyStats.set(date, dayStats);

  // Keep only last 30 days of daily stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

  for (const [date, stats] of store.dailyStats.entries()) {
    if (date < cutoffDate) {
      store.dailyStats.delete(date);
    }
  }
}

// Function to get current storage stats (for debugging)
function getStorageStats() {
  const store = global.usageStore;
  return {
    sessions: store.sessions.size,
    messages: store.messages.length,
    blockedContent: store.blockedContent.length,
    events: store.events.length,
    dailyStats: store.dailyStats.size,
    memoryUsage: process.memoryUsage()
  };
}

// Export storage stats function for potential use by health endpoint
global.getUsageStorageStats = getStorageStats;
