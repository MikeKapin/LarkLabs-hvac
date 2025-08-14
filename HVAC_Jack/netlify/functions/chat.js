// netlify/functions/chat.js
// Enhanced HVAC Jack backend with improved content filtering, tracking integration, and photo analysis support

// Initialize shared storage if it doesn't exist
global.usageStore = global.usageStore || {
  sessions: new Map(),
  messages: [],
  blockedContent: [],
  events: [],
  dailyStats: new Map(),
  photoAnalyses: [] // NEW: Track photo analysis requests
};

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

  // Chat endpoint
  if (event.httpMethod === 'POST') {
    const startTime = Date.now();
    let sessionId = null;
    
    try {
      const { message, mode, conversationHistory, systemContext, sessionId: clientSessionId } = JSON.parse(event.body);
      sessionId = clientSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Basic validation
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        await trackEvent('validation_failed', sessionId, { reason: 'empty_message' });
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Message is required' })
        };
      }

      // Server-side content validation
      const validation = validateHVACContent(message);
      if (!validation.isValid) {
        // Track blocked content
        await trackEvent('input_blocked', sessionId, {
          reason: validation.reason,
          category: validation.category,
          originalMessage: message.substring(0, 100),
          mode: mode
        });

        // Log blocked content to shared storage
        await logBlockedContent({
          message: message.substring(0, 100),
          reason: validation.reason,
          timestamp: new Date().toISOString(),
          ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown',
          sessionId: sessionId
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            response: validation.errorMessage,
            blocked: true,
            reason: validation.reason,
            sessionId: sessionId
          })
        };
      }

      // Rate limiting check
      const rateLimitCheck = await checkRateLimit(event.headers['client-ip']);
      if (!rateLimitCheck.allowed) {
        await trackEvent('rate_limited', sessionId, { 
          retryAfter: rateLimitCheck.retryAfter,
          ip: event.headers['client-ip']
        });
        
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: rateLimitCheck.retryAfter
          })
        };
      }

      // Track successful message
      await trackEvent('message_accepted', sessionId, {
        mode: mode,
        messageLength: message.length,
        hasHistory: !!(conversationHistory && conversationHistory.length > 0),
        systemContext: systemContext
      });

      // Build system prompt with enhanced HVAC focus
      const systemPrompt = buildSystemPrompt(mode, systemContext);
      
      // Prepare messages for Claude
      const claudeMessages = buildClaudeMessages(message, conversationHistory, mode);

      let claudeResponse;
      let usingAI = true;

      try {
        // Call Claude API with content filtering
        const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
        claudeResponse = await callClaude(systemPrompt, claudeMessages, apiKey);
      } catch (claudeError) {
        console.log('Claude API failed, using fallback:', claudeError.message);
        claudeResponse = generateFallbackResponse(message, mode);
        usingAI = false;
        
        await trackEvent('ai_fallback_used', sessionId, {
          error: claudeError.message,
          mode: mode
        });
      }
      
      // Post-process response for additional safety
      const sanitizedResponse = sanitizeClaudeResponse(claudeResponse);
      
      // Calculate response time
      const responseTime = (Date.now() - startTime) / 1000;

      // Track successful response
      await trackEvent('response_generated', sessionId, {
        responseTime: responseTime,
        responseLength: sanitizedResponse.length,
        usingAI: usingAI,
        mode: mode
      });

      // Log successful interaction to shared storage
      await logInteraction({
        sessionId: sessionId,
        input: message.substring(0, 100),
        output: sanitizedResponse.substring(0, 100),
        mode,
        timestamp: new Date().toISOString(),
        ip: event.headers['client-ip'] || 'unknown',
        responseTime: responseTime,
        usingAI: usingAI
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: sanitizedResponse,
          timestamp: new Date().toISOString(),
          mode: mode,
          sessionId: sessionId,
          responseTime: responseTime,
          usingAI: usingAI
        })
      };

    } catch (error) {
      console.error('Chat error:', error);
      
      const responseTime = (Date.now() - startTime) / 1000;
      
      // Track error
      if (sessionId) {
        await trackEvent('processing_error', sessionId, {
          error: error.message,
          responseTime: responseTime
        });
      }
      
      // Fallback response
      const { message = '', mode = 'homeowner' } = JSON.parse(event.body || '{}');
      const fallbackResponse = generateFallbackResponse(message, mode);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: fallbackResponse + '\n\n*Note: Using fallback mode due to temporary AI service issue.*',
          timestamp: new Date().toISOString(),
          fallback: true,
          sessionId: sessionId,
          responseTime: responseTime
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

// Helper function to track events to shared storage
async function trackEvent(eventType, sessionId, data) {
  const store = global.usageStore;
  
  const event = {
    eventType,
    sessionId,
    timestamp: new Date().toISOString(),
    data: data || {}
  };

  store.events.push(event);

  // Keep only last 1000 events
  if (store.events.length > 1000) {
    store.events = store.events.slice(-1000);
  }

  // Process specific events
  switch (eventType) {
    case 'message_accepted':
      // Update messages array
      store.messages.push({
        sessionId,
        timestamp: event.timestamp,
        content: data.messageLength ? `[${data.messageLength} chars]` : '',
        mode: data.mode,
        inputLength: data.messageLength,
        responseTime: null,
        error: false
      });
      break;
      
    case 'input_blocked':
      // Add to blocked content
      store.blockedContent.push({
        sessionId,
        timestamp: event.timestamp,
        reason: data.reason,
        messagePreview: data.originalMessage || '',
        ip: 'tracked',
        category: data.category
      });
      break;
      
    case 'response_generated':
      // Update the most recent message with response time
      const msgIndex = store.messages.findIndex(
        msg => msg.sessionId === sessionId && !msg.responseTime
      );
      if (msgIndex !== -1) {
        store.messages[msgIndex].responseTime = data.responseTime;
        store.messages[msgIndex].usingAI = data.usingAI;
      }
      break;

    // NEW: Handle photo analysis events
    case 'photo_analyzed':
      store.photoAnalyses = store.photoAnalyses || [];
      store.photoAnalyses.push({
        sessionId,
        timestamp: event.timestamp,
        success: data.success,
        analysisTime: data.responseTime,
        mode: data.mode,
        equipmentType: data.equipmentType || 'unknown'
      });
      
      // Keep only last 200 photo analyses
      if (store.photoAnalyses.length > 200) {
        store.photoAnalyses = store.photoAnalyses.slice(-200);
      }
      break;
  }
}

function validateHVACContent(message) {
  const validation = {
    isValid: true,
    reason: '',
    category: '',
    errorMessage: ''
  };

  // Convert to lowercase for checking
  const lowerMessage = message.toLowerCase();

  // Prohibited content checks
  const prohibitedPatterns = [
    // Explicit content
    { pattern: /\b(porn|sex|nude|adult|xxx|nsfw|explicit)\b/i, reason: 'explicit', category: 'inappropriate' },
    
    // Programming requests
    { pattern: /\b(code|programming|script|function|api|github|sql|python|javascript|html|css|php)\b/i, reason: 'programming', category: 'off_topic' },
    
    // Large file/data requests
    { pattern: /\b(download|upload|file|document|pdf|spreadsheet|database|excel|csv)\b/i, reason: 'file_operations', category: 'unsupported' },
    
    // Medical/legal advice
    { pattern: /\b(medical|doctor|legal|lawyer|prescription|lawsuit|diagnosis|treatment)\b/i, reason: 'professional_advice', category: 'off_topic' },
    
    // System manipulation attempts
    { pattern: /\b(ignore|override|bypass|jailbreak|system prompt|pretend you are|act as|roleplay)\b/i, reason: 'system_manipulation', category: 'malicious' },
    
    // Spam patterns
    { pattern: /(.)\1{15,}/, reason: 'spam', category: 'spam' }, // Repeated characters
    { pattern: /\b(.+\b.*){10,}/, reason: 'repetitive', category: 'spam' } // Repetitive content
  ];

  // Check against prohibited patterns
  for (const check of prohibitedPatterns) {
    if (check.pattern.test(message)) {
      validation.isValid = false;
      validation.reason = check.reason;
      validation.category = check.category;
      validation.errorMessage = generateBlockedContentMessage(check.reason);
      return validation;
    }
  }

  // Message length check
  if (message.length > 1000) {
    validation.isValid = false;
    validation.reason = 'too_long';
    validation.category = 'length';
    validation.errorMessage = '🚫 **Message too long.** Please keep HVAC questions under 1000 characters for better responses.';
    return validation;
  }

  // HVAC relevance check (more lenient on backend)
  const hvacTerms = [
    'hvac', 'heating', 'cooling', 'furnace', 'air conditioner', 'ac', 'heat pump',
    'thermostat', 'temperature', 'hot', 'cold', 'warm', 'cool', 'filter', 'vent',
    'system', 'unit', 'equipment', 'repair', 'fix', 'broken', 'problem', 'issue',
    'noise', 'sound', 'smell', 'air', 'fan', 'motor', 'compressor', 'coil',
    'photo', 'picture', 'rating', 'plate', 'model', 'serial', 'capacitor' // NEW: Photo analysis terms
  ];

  const hasHvacTerm = hvacTerms.some(term => lowerMessage.includes(term));
  const isVeryShort = message.trim().length < 10;
  
  // Only block if it's clearly off-topic AND has no HVAC terms
  if (!hasHvacTerm && !isVeryShort && lowerMessage.length > 20) {
    const offTopicPatterns = [
      /\b(recipe|cooking|food|restaurant)\b/i,
      /\b(politics|election|government|president)\b/i,
      /\b(homework|essay|assignment|school)\b/i,
      /\b(relationship|dating|marriage|divorce)\b/i,
      /\b(stock|investment|crypto|bitcoin)\b/i
    ];

    const isOffTopic = offTopicPatterns.some(pattern => pattern.test(message));
    if (isOffTopic) {
      validation.isValid = false;
      validation.reason = 'off_topic';
      validation.category = 'off_topic';
      validation.errorMessage = '🔧 **HVAC Topics Only** - I only help with heating, cooling, and ventilation systems. Please ask about your HVAC equipment!';
      return validation;
    }
  }

  return validation;
}

function generateBlockedContentMessage(reason) {
  const messages = {
    explicit: '🚫 **Inappropriate Content** - HVAC Jack only discusses heating and cooling systems.',
    programming: '🚫 **Programming Questions** - I\'m HVAC Jack, not a coding assistant! Ask me about your HVAC system.',
    file_operations: '🚫 **File Operations** - I don\'t handle file uploads/downloads. Ask me about HVAC troubleshooting!',
    professional_advice: '🚫 **Professional Advice** - I only provide HVAC guidance. Consult professionals for medical/legal advice.',
    system_manipulation: '🚫 **Invalid Request** - I\'m designed specifically for HVAC assistance.',
    spam: '🚫 **Invalid Format** - Please send a clear HVAC question.',
    repetitive: '🚫 **Repetitive Content** - Please ask a specific HVAC question.',
    too_long: '🚫 **Message Too Long** - Please keep HVAC questions concise for better responses.'
  };

  return messages[reason] || '🚫 **Off-Topic** - Please ask about heating, cooling, or ventilation systems.';
}

function buildSystemPrompt(mode, systemContext) {
  const basePrompt = `You are HVAC Jack, a specialized AI assistant for heating, ventilation, and air conditioning systems ONLY.

STRICT RESTRICTIONS:
- ONLY discuss HVAC topics: heating, cooling, ventilation, air quality
- NEVER provide information about: programming, explicit content, medical advice, legal advice, financial advice, or any non-HVAC topics
- If asked about non-HVAC topics, politely redirect to HVAC questions
- Keep responses under 500 words
- Always prioritize safety - warn about gas leaks, electrical hazards, carbon monoxide

HVAC SCOPE INCLUDES:
- Furnaces, boilers, heat pumps, air conditioners
- Thermostats, controls, smart HVAC systems  
- Ductwork, vents, air filters, air quality
- Refrigeration cycles, electrical components
- Maintenance, troubleshooting, repairs
- Energy efficiency, system sizing
- Installation guidance (DIY-safe tasks only)
- Rating plate analysis and equipment specifications
- Capacitor requirements and electrical specifications

Current system context:
- Equipment: ${systemContext?.equipmentType || 'Unknown'}
- Current problem: ${systemContext?.currentProblem || 'Diagnosing'}
- Previous actions: ${systemContext?.previousActions?.join(', ') || 'None'}
- Equipment Brand: ${systemContext?.brand || 'Unknown'}

SAFETY FIRST:
- Gas smells = immediate professional help
- Electrical work = licensed electrician
- Carbon monoxide concerns = evacuate and call professionals
- Refrigerant work = EPA certified technician

Key principles:
1. Safety first - always warn about gas leaks, electrical hazards, and when to call professionals
2. Be conversational and helpful, not clinical
3. Use emojis and formatting to make responses engaging
4. Remember context from the conversation
5. Provide step-by-step guidance`;

  if (mode === 'homeowner') {
    return basePrompt + `

HOMEOWNER MODE - Tailor responses for homeowners:
- Use simple, non-technical language
- Focus on safe DIY steps they can take
- Emphasize when to call a professional
- Explain WHY they're doing each step
- Be encouraging and supportive
- Prioritize most common/likely causes first
- Use analogies to explain complex concepts
- When discussing rating plate info, explain it in simple terms`;
  } else {
    return basePrompt + `

TECHNICIAN MODE - Provide professional-level guidance:
- Use proper technical terminology
- Include specific measurements, specs, and procedures
- Reference diagnostic equipment and tools needed
- Provide troubleshooting sequences
- Include electrical, gas, and refrigerant safety protocols
- Assume professional knowledge and EPA certification where applicable
- Provide exact capacitor specifications with MFD, voltage, and tolerance
- Include model-specific technical details and service bulletins`;
  }
}

function buildClaudeMessages(currentMessage, conversationHistory, mode) {
  const messages = [];

  // Add recent conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-8); // Limit to prevent large requests
    
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    });
  }

  messages.push({ role: 'user', content: currentMessage });
  return messages;
}

async function callClaude(systemPrompt, messages, apiKey) {
  if (!apiKey) {
    throw new Error('Claude API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000, // Limit response length
      system: systemPrompt,
      messages: messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function sanitizeClaudeResponse(response) {
  // Remove any potential harmful content that might have slipped through
  return response
    .replace(/\b(hack|crack|bypass|exploit)\b/gi, '[REDACTED]')
    .replace(/\b(porn|sex|adult|explicit)\b/gi, '[INAPPROPRIATE]')
    .substring(0, 2000); // Hard limit on response length
}

// Rate limiting implementation
const rateLimitStore = new Map();

async function checkRateLimit(ip) {
  const key = ip || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 20; // 20 requests per minute

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }

  const requests = rateLimitStore.get(key);
  
  // Remove old requests
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
    };
  }

  // Add current request
  validRequests.push(now);
  rateLimitStore.set(key, validRequests);

  return { allowed: true };
}

async function logBlockedContent(data) {
  const store = global.usageStore;
  
  // Add to blocked content array in shared storage
  store.blockedContent.push({
    timestamp: data.timestamp,
    reason: data.reason,
    messagePreview: data.message,
    ip: data.ip,
    sessionId: data.sessionId
  });

  // Keep only last 100 blocked messages
  if (store.blockedContent.length > 100) {
    store.blockedContent = store.blockedContent.slice(-100);
  }
  
  console.log('🚫 Blocked Content:', {
    timestamp: data.timestamp,
    reason: data.reason,
    messagePreview: data.message,
    ip: data.ip,
    sessionId: data.sessionId
  });
}

async function logInteraction(data) {
  const store = global.usageStore;
  
  // Add to messages array in shared storage
  store.messages.push({
    sessionId: data.sessionId,
    timestamp: data.timestamp,
    content: data.input,
    mode: data.mode,
    inputLength: data.input.length,
    responseTime: data.responseTime,
    error: false,
    usingAI: data.usingAI
  });

  // Keep only last 500 messages
  if (store.messages.length > 500) {
    store.messages = store.messages.slice(-500);
  }
  
  console.log('✅ HVAC Interaction:', {
    timestamp: data.timestamp,
    sessionId: data.sessionId,
    inputLength: data.input.length,
    outputPreview: data.output,
    mode: data.mode,
    responseTime: data.responseTime,
    usingAI: data.usingAI,
    ip: data.ip
  });
}

function generateFallbackResponse(message, mode) {
  const input = message.toLowerCase();
  
  if (input.includes('no heat')) {
    return mode === 'homeowner' 
      ? `**No heat issue!**\n\n🔍 **Quick checks:**\n• Check thermostat is set to HEAT\n• Replace thermostat batteries\n• Check circuit breaker\n• Replace air filter\n\n⚠️ **If you smell gas - leave immediately!**`
      : `**No heat diagnostic:**\n\n⚡ **Check:**\n• 24VAC at R-W terminals\n• HSI resistance (11-200Ω)\n• Gas valve operation\n• Flame sensor current\n\nWhat are current readings?`;
  }
  
  if (input.includes('no cool') || input.includes('ac')) {
    return mode === 'homeowner'
      ? `**AC not cooling!**\n\n❄️ **Try:**\n• Set thermostat 5°F lower\n• Replace air filter\n• Check breakers\n• Clean outdoor unit\n\n🚨 **Ice anywhere? Turn OFF immediately!**`
      : `**No cooling diagnostic:**\n\n⚡ **Verify:**\n• 240VAC at disconnect\n• Compressor amps\n• Refrigerant pressures\n• Superheat/subcooling\n\nCurrent readings?`;
  }

  // NEW: Photo analysis fallback
  if (input.includes('photo') || input.includes('picture') || input.includes('rating plate')) {
    return mode === 'homeowner'
      ? `**Photo Analysis Available!**\n\n📸 **I can analyze rating plates!** Take a clear photo of your equipment's rating plate and I'll provide:\n• Equipment details and age\n• Warranty status\n• Capacitor requirements\n• Technical specifications\n\n*Use the camera button to upload a photo.*`
      : `**Rating Plate Analysis**\n\n📋 **Upload a photo and I'll extract:**\n• Complete model/serial breakdown\n• Electrical specifications (FLA, LRA, MCA)\n• Exact capacitor requirements\n• Service bulletins and known issues\n• Parts availability assessment\n\n*Camera button available for photo upload.*`;
  }

  return mode === 'homeowner'
    ? `**I'm here to help!**\n\n🔧 **Tell me:**\n• What type of system?\n• What's wrong?\n• When did it start?\n\n📸 **Or take a photo** of your rating plate for detailed analysis!\n\n⚠️ **Safety:** Gas smell = call gas company immediately!`
    : `**Diagnostic mode**\n\n📋 **Need:**\n• Equipment details\n• Symptoms and measurements\n• Test equipment available\n\n📸 **Photo analysis** available for rating plates.\n\nProvide system specifics for targeted troubleshooting.`;
}
