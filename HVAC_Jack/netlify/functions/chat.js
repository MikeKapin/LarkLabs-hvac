// netlify/functions/chat.js
// Enhanced HVAC Jack backend with web search capabilities and manual search support

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Chat endpoint
  if (event.httpMethod === 'POST') {
    const startTime = Date.now();
    
    try {
      const { message, mode, conversationHistory, systemContext, sessionId } = JSON.parse(event.body);

      // Basic validation
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Message is required' })
        };
      }

      // Enhanced validation with streamlined checks
      const validation = validateContent(message);
      if (!validation.isValid) {
        // Log blocked content
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
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: rateLimitCheck.retryAfter
          })
        };
      }

      // Check if this is a manual search request
      const isManualSearch = systemContext?.isManualSearch || 
                           detectManualSearchRequest(message, systemContext);

      let claudeResponse;
      
      if (isManualSearch) {
        // Enhanced system prompt for web search
        const searchSystemPrompt = buildWebSearchSystemPrompt(mode, systemContext);
        const claudeMessages = buildClaudeMessages(message, [], mode); // Fresh context for search
        
        console.log('Processing manual search request for:', {
          brand: systemContext?.brand,
          model: systemContext?.model,
          equipmentType: systemContext?.equipmentType
        });
        
        claudeResponse = await callClaudeWithWebSearch(searchSystemPrompt, claudeMessages, process.env.CLAUDE_API_KEY);
      } else {
        // Regular conversation
        const systemPrompt = buildSystemPrompt(mode, systemContext);
        const claudeMessages = buildClaudeMessages(message, conversationHistory, mode);
        claudeResponse = await callClaude(systemPrompt, claudeMessages, process.env.CLAUDE_API_KEY);
      }
      
      // Post-process response for additional safety
      const sanitizedResponse = sanitizeClaudeResponse(claudeResponse);

      // Enhanced response time calculation
      const responseTime = (Date.now() - startTime) / 1000;

      // Log successful interaction
      await logInteraction({
        input: message.substring(0, 100),
        output: sanitizedResponse.substring(0, 100),
        mode,
        isManualSearch,
        responseTime,
        timestamp: new Date().toISOString(),
        ip: event.headers['client-ip'] || 'unknown',
        sessionId: sessionId
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: sanitizedResponse,
          timestamp: new Date().toISOString(),
          mode: mode,
          usingAI: true,
          responseTime: responseTime,
          sessionId: sessionId,
          isManualSearch: isManualSearch
        })
      };

    } catch (error) {
      console.error('Chat error:', error);
      
      // Enhanced fallback response
      const { message = '', mode = 'homeowner', sessionId = null } = JSON.parse(event.body || '{}');
      const fallbackResponse = generateFallbackResponse(message, mode);
      const responseTime = (Date.now() - startTime) / 1000;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: fallbackResponse + '\n\n*Note: Using fallback mode due to temporary AI service issue.*',
          timestamp: new Date().toISOString(),
          fallback: true,
          usingAI: false,
          responseTime: responseTime,
          sessionId: sessionId
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

// Streamlined content validation (matching frontend changes)
function validateContent(message) {
  const validation = {
    isValid: true,
    reason: '',
    errorMessage: ''
  };

  // Only essential checks - matching the frontend approach
  
  // 1. Length check
  if (message.length > 1000) {
    validation.isValid = false;
    validation.reason = 'too_long';
    validation.errorMessage = '⚠️ **Message too long.** Please keep questions under 1000 characters.';
    return validation;
  }

  // 2. Only block obvious inappropriate content
  if (/\b(porn|sex|nude|naked|explicit|adult|xxx|nsfw)\b/i.test(message)) {
    validation.isValid = false;
    validation.reason = 'inappropriate';
    validation.errorMessage = '🚫 **Inappropriate content detected.** Please ask about HVAC systems.';
    return validation;
  }

  // 3. Only block very large coding requests
  if (/\b(write|create|build|develop|generate)\s+(large|complex|full|complete|entire)\s+(application|database|website|system)\b/i.test(message)) {
    validation.isValid = false;
    validation.reason = 'large_coding';
    validation.errorMessage = '🚫 **Large coding projects not supported.** Please ask about HVAC systems.';
    return validation;
  }

  // 4. Only block obvious spam (very repetitive patterns)
  if (/(.)\1{20,}/.test(message) || /(.{1,5})\1{10,}/.test(message)) {
    validation.isValid = false;
    validation.reason = 'spam';
    validation.errorMessage = '🚫 **Invalid message format.** Please ask a normal question.';
    return validation;
  }

  return validation;
}

// Detect manual search requests
function detectManualSearchRequest(message, systemContext) {
  if (systemContext?.isManualSearch) return true;
  
  // Check for manual search indicators
  const hasManualRequest = /\b(manual|service manual|installation guide|troubleshooting guide|wiring diagram|schematic|parts list)\b/i.test(message);
  
  // Check for model numbers (basic patterns)
  const hasModelNumber = /\b([A-Z]{2,}\d{2,}[A-Z]?\d*|\d{4,}[A-Z]{0,3}\d*|#\s*\d{4,})\b/i.test(message);
  
  // Check for brands
  const hasBrand = /\b(generac|kohler|carrier|trane|lennox|york|rheem|goodman|coleman|heil|payne|briggs|honda|champion|westinghouse)\b/i.test(message);
  
  return hasManualRequest || (hasModelNumber && hasBrand) || (hasModelNumber && /\b(generator|furnace|ac|air conditioner|heat pump)\b/i.test(message));
}

// Enhanced system prompt for web search capabilities
function buildWebSearchSystemPrompt(mode, systemContext) {
  const basePrompt = `You are HVAC Jack with web search capabilities. The user is requesting manuals, documentation, or technical resources for HVAC equipment or generators.

IMPORTANT: You have access to web search. Use it to find official service manuals, installation guides, wiring diagrams, and technical documentation.

Equipment Details:
- Brand: ${systemContext?.brand || 'Unknown'}
- Model: ${systemContext?.model || 'Unknown'}  
- Type: ${systemContext?.equipmentType || 'Unknown'}

SEARCH STRATEGY:
1. Search for official manufacturer documentation
2. Look for service manuals, installation guides, wiring diagrams
3. Find parts lists and troubleshooting guides
4. Provide direct links to official resources
5. Include authoritative technical websites

PREFERRED SOURCES:
- Official manufacturer websites
- Authorized dealer portals
- Technical documentation sites
- Parts supplier websites with manuals
- Professional HVAC resource sites

FORMAT YOUR RESPONSE:
1. Brief acknowledgment of the search request
2. List of found resources with direct links
3. Brief description of each resource
4. Additional helpful context about the equipment

Always prioritize official manufacturer documentation and provide working links when available.`;

  return basePrompt;
}

function buildSystemPrompt(mode, systemContext) {
  const basePrompt = `You are HVAC Jack, a specialized AI assistant for heating, ventilation, air conditioning systems, and gas-powered equipment including generators.

SCOPE INCLUDES:
- HVAC systems: furnaces, boilers, heat pumps, air conditioners, mini-splits
- Gas appliances: generators, water heaters, ranges, fireplaces, dryers
- Thermostats, controls, smart HVAC systems  
- Ductwork, vents, air filters, air quality
- Refrigeration cycles, electrical components
- Maintenance, troubleshooting, repairs
- Energy efficiency, system sizing
- Installation guidance (safe DIY tasks only)

Current system context:
- Equipment: ${systemContext?.equipmentType || 'Unknown'}
- Brand: ${systemContext?.brand || 'Unknown'}
- Model: ${systemContext?.model || 'Unknown'}
- Current problem: ${systemContext?.currentProblem || 'Diagnosing'}
- Previous actions: ${systemContext?.previousActions?.join(', ') || 'None'}

SAFETY PRIORITIES:
- Gas smells = immediate evacuation and professional help
- Electrical work = licensed electrician for complex tasks
- Carbon monoxide concerns = evacuate and call professionals
- Refrigerant work = EPA certified technician

Key principles:
1. Safety first - always warn about hazards and when to call professionals
2. Be conversational and helpful, not clinical
3. Use emojis and formatting for engagement
4. Remember context from the conversation
5. Provide step-by-step guidance
6. Support both HVAC and generator/gas appliance questions`;

  if (mode === 'homeowner') {
    return basePrompt + `

HOMEOWNER MODE - Tailor responses for homeowners:
- Use simple, non-technical language
- Focus on safe DIY steps they can take
- Emphasize when to call a professional
- Explain WHY they're doing each step
- Be encouraging and supportive
- Prioritize most common/likely causes first
- Use analogies to explain complex concepts`;
  } else {
    return basePrompt + `

TECHNICIAN MODE - Provide professional-level guidance:
- Use proper technical terminology
- Include specific measurements, specs, and procedures
- Reference diagnostic equipment and tools needed
- Provide troubleshooting sequences
- Include electrical, gas, and refrigerant safety protocols
- Assume professional knowledge and EPA certification where applicable`;
  }
}

function buildClaudeMessages(currentMessage, conversationHistory, mode) {
  const messages = [];

  // Add recent conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-8);
    
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

// Enhanced Claude API call with web search support
async function callClaudeWithWebSearch(systemPrompt, messages, apiKey) {
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
      model: 'claude-3-5-sonnet-20241022', // Use more capable model for web search
      max_tokens: 2000, // Allow longer responses for search results
      system: systemPrompt,
      messages: messages,
      tools: [
        {
          name: "web_search",
          description: "Search the web for information",
          input_schema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query"
              }
            },
            required: ["query"]
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Handle tool use responses
  if (data.content && data.content.some(block => block.type === 'tool_use')) {
    // For tool use responses, extract the text content
    const textBlocks = data.content.filter(block => block.type === 'text');
    return textBlocks.map(block => block.text).join('\n');
  }
  
  return data.content[0].text;
}

// Regular Claude API call
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
      max_tokens: 1500,
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
  // Basic sanitization while preserving manual links and formatting
  return response
    .replace(/\b(hack|crack|bypass|exploit)\b/gi, '[REDACTED]')
    .replace(/\b(porn|sex|adult|explicit)\b/gi, '[INAPPROPRIATE]')
    .substring(0, 3000); // Allow longer responses for manual search results
}

// Rate limiting implementation
const rateLimitStore = new Map();

async function checkRateLimit(ip) {
  const key = ip || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 30; // Increased for manual search usage

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
  console.log('🚫 Blocked Content:', {
    timestamp: data.timestamp,
    reason: data.reason,
    messagePreview: data.message,
    ip: data.ip,
    sessionId: data.sessionId
  });
}

async function logInteraction(data) {
  console.log('✅ HVAC Interaction:', {
    timestamp: data.timestamp,
    inputLength: data.input.length,
    outputPreview: data.output,
    mode: data.mode,
    isManualSearch: data.isManualSearch,
    responseTime: data.responseTime,
    ip: data.ip,
    sessionId: data.sessionId
  });
}

// Enhanced fallback responses
function generateFallbackResponse(message, mode) {
  const input = message.toLowerCase();
  
  // Check for manual search requests in fallback
  if (/\b(manual|service manual|wiring|schematic|troubleshooting guide)\b/i.test(input)) {
    const brandMatch = input.match(/\b(generac|kohler|carrier|trane|lennox|york|rheem|goodman)\b/i);
    const brand = brandMatch ? brandMatch[0] : '';
    
    return `**Manual Search Request Detected**

I understand you're looking for manuals${brand ? ` for ${brand}` : ''}. While I'm currently in offline mode, here are reliable sources:

**Official Manufacturer Sites:**
${brand ? `• ${brand}.com - Official support section` : '• Visit the manufacturer\'s official website'}
• Search for model number in their support/literature section

**General Resources:**
• ManualsLib.com - Comprehensive manual database
• RepairClinic.com - Service manuals and parts diagrams
• ManualzForFree.com - Free technical documentation

**Search Tips:**
• Use your complete model number
• Try "service manual" + model number
• Look for "installation guide" + model number

What specific equipment model are you working on?`;
  }
  
  if (input.includes('no heat')) {
    return mode === 'homeowner' 
      ? `**No heat issue!**

🔥 **Quick checks:**
• Check thermostat is set to HEAT
• Replace thermostat batteries
• Check circuit breaker
• Replace air filter

⚠️ **If you smell gas - leave immediately and call gas company!**`
      : `**No heat diagnostic:**

⚡ **Check:**
• 24VAC at R-W terminals
• HSI resistance (11-200Ω)
• Gas valve operation
• Flame sensor current

What are current readings?`;
  }
  
  if (input.includes('no cool') || input.includes('ac')) {
    return mode === 'homeowner'
      ? `**AC not cooling!**

❄️ **Try:**
• Set thermostat 5°F lower
• Replace air filter
• Check breakers
• Clean outdoor unit

🚨 **Ice anywhere? Turn OFF immediately!**`
      : `**No cooling diagnostic:**

⚡ **Verify:**
• 240VAC at disconnect
• Compressor amps
• Refrigerant pressures
• Superheat/subcooling

Current readings?`;
  }

  if (input.includes('generator')) {
    return mode === 'homeowner'
      ? `**Generator issue!**

🔋 **Basic checks:**
• Battery connections tight?
• Fuel level adequate?
• Oil level check
• Air filter clean?
• Transfer switch position

⚠️ **Gas smell = evacuate and call professionals!**`
      : `**Generator diagnostic:**

⚡ **Check:**
• Battery voltage (12.6V+ no load)
• Control panel error codes
• Fuel pressure
• Engine oil pressure switch
• Transfer switch signals

Current symptoms and readings?`;
  }

  return mode === 'homeowner'
    ? `**I'm here to help!**

🔧 **Tell me:**
• What type of system? (furnace, AC, generator, etc.)
• What's wrong?
• When did it start?

⚠️ **Safety:** Gas smell = evacuate and call gas company immediately!`
    : `**Technical diagnostic mode**

📋 **Need:**
• Equipment details (make/model)
• Symptoms and measurements
• Test equipment available

Provide system specifics for targeted troubleshooting.`;
}
