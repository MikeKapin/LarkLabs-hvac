// netlify/functions/chat.js
// Enhanced HVAC Jack backend integrated with photo analysis and manual search

// Use shared storage from analyze-photo.js
global.usageStore = global.usageStore || {
  sessions: new Map(),
  messages: [],
  blockedContent: [],
  events: [],
  dailyStats: new Map(),
  photoAnalyses: []
};

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
      const { 
        message, 
        mode, 
        conversationHistory, 
        systemContext, 
        sessionId,
        photoAnalysisData // New: Include photo analysis context
      } = JSON.parse(event.body);

      console.log('Chat request received:', {
        messageLength: message?.length,
        mode,
        sessionId,
        hasPhotoContext: !!photoAnalysisData
      });

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
        await logBlockedContent({
          message: message.substring(0, 100),
          reason: validation.reason,
          timestamp: new Date().toISOString(),
          ip: event.headers['client-ip'] || 'unknown',
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
                           detectManualSearchRequest(message, systemContext, photoAnalysisData);

      let response;
      
      if (isManualSearch) {
        console.log('Processing manual search request');
        
        // Use the dedicated search-manuals function for actual web search
        response = await delegateToManualSearch(message, systemContext, photoAnalysisData, mode);
      } else {
        // Regular conversation with Claude
        const systemPrompt = buildSystemPrompt(mode, systemContext, photoAnalysisData);
        const claudeMessages = buildClaudeMessages(message, conversationHistory, mode, photoAnalysisData);
        response = await callClaude(systemPrompt, claudeMessages, process.env.CLAUDE_API_KEY);
      }
      
      // Post-process response for additional safety
      const sanitizedResponse = sanitizeClaudeResponse(response);

      // Enhanced response time calculation
      const responseTime = (Date.now() - startTime) / 1000;

      // Log successful interaction
      await logInteraction({
        input: message.substring(0, 100),
        output: sanitizedResponse.substring(0, 100),
        mode,
        isManualSearch,
        hasPhotoContext: !!photoAnalysisData,
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
          isManualSearch: isManualSearch,
          hasPhotoContext: !!photoAnalysisData
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

// Delegate to manual search function
async function delegateToManualSearch(message, systemContext, photoAnalysisData, mode) {
  // Extract equipment details from various sources
  const brand = systemContext?.brand || 
                photoAnalysisData?.structuredData?.equipment?.brand || 
                extractBrand(message);
                
  const model = systemContext?.model || 
                photoAnalysisData?.structuredData?.equipment?.model || 
                extractModel(message);
                
  const equipmentType = systemContext?.equipmentType || 
                       photoAnalysisData?.structuredData?.equipment?.type || 
                       extractEquipmentType(message);

  console.log('Manual search with equipment details:', { brand, model, equipmentType });

  if (!brand || !model) {
    return `**🔍 Manual Search**

I need more specific information to find manuals. Please provide:

**Required Information:**
• **Brand/Manufacturer**: ${brand || 'Missing - provide manufacturer name'}
• **Model Number**: ${model || 'Missing - provide complete model number'}

${photoAnalysisData ? 
  '💡 **Tip:** I can see you uploaded a photo. If the rating plate shows the brand and model clearly, please let me know what they are.' : 
  '💡 **Tip:** Upload a clear photo of the rating plate, or provide the brand and model number manually.'
}

**Example:**
"Find manuals for Generac model 0044563"

What specific equipment are you looking for manuals for?`;
  }

  // Call the dedicated search-manuals function
  try {
    const searchFunction = require('./search-manuals');
    const searchResult = await searchFunction.handler({
      httpMethod: 'POST',
      body: JSON.stringify({ brand, model, equipmentType })
    }, {});

    if (searchResult.statusCode === 200) {
      const searchData = JSON.parse(searchResult.body);
      if (searchData.success && searchData.manuals.length > 0) {
        return formatManualSearchResponse(searchData.manuals, brand, model, equipmentType, mode);
      }
    }
  } catch (error) {
    console.error('Failed to call search-manuals function:', error);
  }

  // Fallback response if search fails
  return generateFallbackManualResponse(brand, model, mode);
}

// Enhanced system prompt that considers photo analysis context
function buildSystemPrompt(mode, systemContext, photoAnalysisData) {
  let equipmentInfo = '';
  
  // Build equipment context from all available sources
  if (photoAnalysisData?.structuredData) {
    const eq = photoAnalysisData.structuredData.equipment;
    equipmentInfo = `
PHOTO ANALYSIS CONTEXT:
- Equipment analyzed: ${eq?.type || 'Unknown'} by ${eq?.brand || 'Unknown'}
- Model: ${eq?.model || 'Unknown'}
- Serial: ${eq?.serial || 'Unknown'}
- Age: ${eq?.age || 'Unknown'}
- Warranty: ${photoAnalysisData.structuredData.warranty?.status || 'Unknown'}
- Recent photo analysis performed: ${photoAnalysisData.timestamp || 'Recent'}
`;
  }
  
  if (systemContext) {
    equipmentInfo += `
CONVERSATION CONTEXT:
- Equipment: ${systemContext?.equipmentType || 'Unknown'}
- Brand: ${systemContext?.brand || 'Unknown'}
- Model: ${systemContext?.model || 'Unknown'}
- Current problem: ${systemContext?.currentProblem || 'Diagnosing'}
- Previous actions: ${systemContext?.previousActions?.join(', ') || 'None'}
`;
  }

  const basePrompt = `You are HVAC Jack, a specialized AI assistant for heating, ventilation, air conditioning systems, and ALL gas-powered equipment and appliances.

COMPREHENSIVE SCOPE INCLUDES:
- HVAC systems: furnaces, boilers, heat pumps, air conditioners, mini-splits, packaged units
- Gas water heaters: tank, tankless, hybrid, commercial units
- Gas generators: standby, portable, whole house backup systems
- Gas boilers: residential, commercial, steam, hot water, hydronic
- Gas unit heaters: garage heaters, warehouse heaters, space heaters
- Gas appliances: ranges, dryers, fireplaces, pool heaters
- Thermostats, controls, smart HVAC systems  
- Ductwork, vents, air filters, air quality
- Gas piping, venting, combustion air requirements
- Electrical components, ignition systems, controls
- Maintenance, troubleshooting, repairs
- Energy efficiency, system sizing
- Installation guidance (safe DIY tasks only)

${equipmentInfo}

CRITICAL SAFETY PRIORITIES FOR GAS APPLIANCES:
- Gas smells = immediate evacuation and emergency gas company call
- Carbon monoxide concerns = evacuate immediately and call professionals
- Gas piping work = licensed gas technician only
- Electrical work = licensed electrician for complex tasks
- Combustion air and venting = critical for safe operation
- Proper gas pressures = natural gas 3.5"WC, propane 11"WC typical
- Flame characteristics = proper blue flame, no yellow tips
- Refrigerant work = EPA certified technician

EQUIPMENT-SPECIFIC KNOWLEDGE:
For Gas Furnaces: Heat exchangers, gas valves, ignition systems, venting
For Gas Water Heaters: Temperature/pressure relief, anode rods, thermal efficiency
For Gas Boilers: Pressure vessels, expansion tanks, circulation pumps, zone controls
For Generators: Transfer switches, load management, fuel systems, battery maintenance
For Unit Heaters: Combustion air, proper clearances, safety controls

Key principles:
1. SAFETY FIRST - Always prioritize gas safety and warn about hazards
2. Equipment-specific guidance based on appliance type
3. Be conversational and helpful, not clinical
4. Use emojis and formatting for engagement
5. Remember context from the conversation AND recent photo analysis
6. Provide step-by-step guidance for safe procedures
7. Know when to call professionals vs DIY tasks
8. Reference photo analysis results when relevant to the conversation`;

  if (mode === 'homeowner') {
    return basePrompt + `

HOMEOWNER MODE - Tailor responses for homeowners:
- Use simple, non-technical language
- Focus on safe DIY steps they can take
- Emphasize when to call a professional (especially for gas work)
- Explain WHY they're doing each step
- Be encouraging and supportive
- Prioritize most common/likely causes first
- Use analogies to explain complex concepts
- Always stress gas safety - "when in doubt, call a pro"
- Reference photo analysis results in simple terms when helpful`;
  } else {
    return basePrompt + `

TECHNICIAN MODE - Provide professional-level guidance:
- Use proper technical terminology
- Include specific measurements, specs, and procedures
- Reference diagnostic equipment and tools needed
- Provide troubleshooting sequences
- Include electrical, gas, and refrigerant safety protocols
- Assume professional knowledge and EPA/gas certifications where applicable
- Reference code requirements (NFPA, local gas codes)
- Include combustion analysis procedures where relevant
- Use photo analysis technical data when available for precise diagnostics`;
  }
}

// Enhanced message building with photo context
function buildClaudeMessages(currentMessage, conversationHistory, mode, photoAnalysisData) {
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

  // Add photo analysis context if available
  let messageContent = currentMessage;
  if (photoAnalysisData) {
    const photoContext = `

[PHOTO ANALYSIS CONTEXT]
Recent rating plate analysis shows:
- Equipment: ${photoAnalysisData.structuredData?.equipment?.type || 'Unknown'} 
- Brand: ${photoAnalysisData.structuredData?.equipment?.brand || 'Unknown'}
- Model: ${photoAnalysisData.structuredData?.equipment?.model || 'Unknown'}
- Age: ${photoAnalysisData.structuredData?.equipment?.age || 'Unknown'}
- Warranty: ${photoAnalysisData.structuredData?.warranty?.status || 'Unknown'}

Please reference this information when relevant to the user's question.

User's current question: ${currentMessage}`;
    
    messageContent = photoContext;
  }

  messages.push({ role: 'user', content: messageContent });
  return messages;
}

// Enhanced manual search detection that considers photo context
function detectManualSearchRequest(message, systemContext, photoAnalysisData) {
  if (systemContext?.isManualSearch) return true;
  
  // Check for manual search indicators
  const hasManualRequest = /\b(manual|service manual|installation guide|troubleshooting guide|wiring diagram|schematic|parts list|documentation)\b/i.test(message);
  
  // Check for model numbers (basic patterns)
  const hasModelNumber = /\b([A-Z]{2,}\d{2,}[A-Z]?\d*|\d{4,}[A-Z]{0,3}\d*|#\s*\d{4,})\b/i.test(message);
  
  // Check for brands
  const hasBrand = /\b(generac|kohler|carrier|trane|lennox|york|rheem|goodman|coleman|heil|payne|briggs|honda|champion|westinghouse)\b/i.test(message);
  
  // Consider photo analysis context
  const photoHasEquipmentInfo = photoAnalysisData?.structuredData?.equipment?.brand && 
                               photoAnalysisData?.structuredData?.equipment?.model;
  
  return hasManualRequest || 
         (hasModelNumber && hasBrand) || 
         (hasModelNumber && /\b(generator|furnace|ac|air conditioner|heat pump)\b/i.test(message)) ||
         (hasManualRequest && photoHasEquipmentInfo);
}

// Regular Claude API call (consistent with analyze-photo.js)
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
      model: 'claude-3-5-sonnet-20241022', // Use same model as analyze-photo for consistency
      max_tokens: 1500,
      temperature: 0.1, // Match analyze-photo.js temperature
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

// Extract information from message (consistent with search-manuals.js)
function extractBrand(message) {
  const brands = ['generac', 'kohler', 'carrier', 'trane', 'lennox', 'york', 'rheem', 'goodman', 'coleman', 'heil', 'payne', 'briggs', 'honda', 'champion', 'westinghouse'];
  const messageLower = message.toLowerCase();
  
  for (const brand of brands) {
    if (messageLower.includes(brand)) {
      return brand;
    }
  }
  return null;
}

function extractModel(message) {
  // Look for various model number patterns
  const patterns = [
    /\bmodel\s*#?\s*:?\s*([A-Z0-9\-]+)/gi,
    /\bserial\s*#?\s*:?\s*([A-Z0-9\-]+)/gi,
    /\b([A-Z]{2,}\d{2,}[A-Z]?\d*)\b/g,
    /\b(\d{4,}[A-Z]{0,3}\d*)\b/g,
    /\b(#\s*\d{4,})\b/g
  ];
  
  for (const pattern of patterns) {
    const matches = message.match(pattern);
    if (matches) {
      // Clean up the match
      return matches[0].replace(/^(model|serial)\s*#?\s*:?\s*/gi, '').replace(/^#\s*/, '');
    }
  }
  return null;
}

function extractEquipmentType(message) {
  const messageLower = message.toLowerCase();
  
  // Gas appliances and HVAC equipment detection
  if (messageLower.includes('generator') || messageLower.includes('standby') || messageLower.includes('backup power')) return 'generator';
  if (messageLower.includes('furnace') || messageLower.includes('heating unit')) return 'gas furnace';
  if (messageLower.includes('water heater') || messageLower.includes('hot water') || messageLower.includes('tankless')) return 'gas water heater';
  if (messageLower.includes('boiler') || messageLower.includes('steam') || messageLower.includes('hydronic')) return 'gas boiler';
  if (messageLower.includes('unit heater') || messageLower.includes('garage heater') || messageLower.includes('space heater')) return 'gas unit heater';
  if (messageLower.includes('air conditioner') || messageLower.includes('ac ') || messageLower.includes('cooling')) return 'air conditioner';
  if (messageLower.includes('heat pump') || messageLower.includes('dual fuel')) return 'heat pump';
  if (messageLower.includes('range') || messageLower.includes('stove') || messageLower.includes('cooktop')) return 'gas range';
  if (messageLower.includes('dryer') || messageLower.includes('clothes dryer')) return 'gas dryer';
  if (messageLower.includes('fireplace') || messageLower.includes('gas log') || messageLower.includes('gas insert')) return 'gas fireplace';
  if (messageLower.includes('pool heater') || messageLower.includes('spa heater')) return 'gas pool heater';
  if (messageLower.includes('packaged unit') || messageLower.includes('rooftop unit') || messageLower.includes('rtu')) return 'packaged HVAC unit';
  
  return 'gas equipment';
}

// Format manual search response (simplified for chat context)
function formatManualSearchResponse(manuals, brand, model, equipmentType, mode) {
  let response = `**📚 Manual Search Results for ${brand} ${model}**\n\n`;
  response += `🔍 **Found ${manuals.length} manual(s):**\n\n`;

  manuals.slice(0, 5).forEach((manual, index) => {
    const number = index + 1;
    const typeEmoji = getManualTypeEmoji(manual.type);
    const sourceEmoji = manual.isOfficial ? '🏭' : manual.isPDF ? '📄' : '🌐';
    
    response += `**${number}. ${typeEmoji} ${manual.type}**\n`;
    response += `${sourceEmoji} [${manual.isPDF ? 'Download PDF' : 'View Online'}](${manual.url})\n`;
    
    if (manual.isOfficial) {
      response += `✅ **Official ${brand} Source**\n`;
    }
    
    response += '\n';
  });

  if (mode === 'technician') {
    response += `**🔧 Technical Notes:**\n`;
    response += `• Verify model number: **${model}**\n`;
    response += `• Download PDFs for field reference\n`;
    response += `• Official sources are most reliable\n\n`;
  } else {
    response += `**💡 Tips:**\n`;
    response += `• Click links to download manuals\n`;
    response += `• Official ${brand} sources are best\n`;
    response += `• Save manuals for future reference\n\n`;
  }
  
  response += `**What specific issue are you troubleshooting?**`;

  return response;
}

// Get emoji for manual type
function getManualTypeEmoji(type) {
  const emojis = {
    'Service Manual': '🔧',
    'Installation Guide': '⚙️',
    'User Manual': '👤',
    'Parts Manual': '🔩',
    'Troubleshooting Guide': '🔍',
    'Wiring Diagram': '⚡',
    'Maintenance Guide': '🛠️',
    'Documentation': '📋'
  };
  return emojis[type] || '📄';
}

// Content validation (streamlined, matching analyze-photo.js)
function validateContent(message) {
  const validation = {
    isValid: true,
    reason: '',
    errorMessage: ''
  };

  // Only essential checks
  if (message.length > 1000) {
    validation.isValid = false;
    validation.reason = 'too_long';
    validation.errorMessage = '⚠️ **Message too long.** Please keep questions under 1000 characters.';
    return validation;
  }

  if (/\b(porn|sex|nude|naked|explicit|adult|xxx|nsfw)\b/i.test(message)) {
    validation.isValid = false;
    validation.reason = 'inappropriate';
    validation.errorMessage = '🚫 **Inappropriate content detected.** Please ask about HVAC systems.';
    return validation;
  }

  if (/\b(write|create|build|develop|generate)\s+(large|complex|full|complete|entire)\s+(application|database|website|system)\b/i.test(message)) {
    validation.isValid = false;
    validation.reason = 'large_coding';
    validation.errorMessage = '🚫 **Large coding projects not supported.** Please ask about HVAC systems.';
    return validation;
  }

  if (/(.)\1{20,}/.test(message) || /(.{1,5})\1{10,}/.test(message)) {
    validation.isValid = false;
    validation.reason = 'spam';
    validation.errorMessage = '🚫 **Invalid message format.** Please ask a normal question.';
    return validation;
  }

  return validation;
}

function sanitizeClaudeResponse(response) {
  return response
    .replace(/\b(hack|crack|bypass|exploit)\b/gi, '[REDACTED]')
    .replace(/\b(porn|sex|adult|explicit)\b/gi, '[INAPPROPRIATE]')
    .substring(0, 3000);
}

// Rate limiting (consistent with analyze-photo.js approach)
const rateLimitStore = new Map();

async function checkRateLimit(ip) {
  const key = ip || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 30;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }

  const requests = rateLimitStore.get(key);
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
    };
  }

  validRequests.push(now);
  rateLimitStore.set(key, validRequests);
  return { allowed: true };
}

// Logging functions (consistent with analyze-photo.js)
async function logBlockedContent(data) {
  try {
    const store = global.usageStore;
    store.blockedContent = store.blockedContent || [];
    store.blockedContent.push(data);
    
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
  } catch (error) {
    console.warn('Failed to log blocked content:', error);
  }
}

async function logInteraction(data) {
  try {
    const store = global.usageStore;
    store.messages = store.messages || [];
    store.messages.push(data);
    
    if (store.messages.length > 200) {
      store.messages = store.messages.slice(-200);
    }
    
    console.log('✅ Chat Interaction:', {
      timestamp: data.timestamp,
      inputLength: data.input.length,
      outputPreview: data.output,
      mode: data.mode,
      isManualSearch: data.isManualSearch,
      hasPhotoContext: data.hasPhotoContext,
      responseTime: data.responseTime,
      ip: data.ip,
      sessionId: data.sessionId
    });
  } catch (error) {
    console.warn('Failed to log interaction:', error);
  }
}

// Enhanced fallback responses
function generateFallbackResponse(message, mode) {
  const input = message.toLowerCase();
  
  // Check for manual search requests in fallback
  if (/\b(manual|service manual|wiring|schematic|troubleshooting guide)\b/i.test(input)) {
    return generateFallbackManualResponse(null, null, mode);
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

function generateFallbackManualResponse(brand, model, mode) {
  const brandText = brand || 'your equipment';
  const modelText = model || '';
  
  return `**📚 Manual Search - Offline Mode**

I understand you're looking for manuals for ${brandText} ${modelText}. Here are reliable sources:

**🔗 Official Manufacturer Sites:**
${brand ? `• ${brand}.com - Official support section\n` : ''}• Search for model number in their support/literature section
• Download center or technical documents area

**📚 General Manual Resources:**
• **ManualsLib.com** - Comprehensive manual database
• **RepairClinic.com** - Service manuals and parts diagrams  
• **AppliancePartsPros.com** - Parts and documentation
• **PartsTown.com** - Commercial equipment manuals

**🔍 Search Tips:**
• Use your complete model number: "${modelText}"
• Try "service manual" + model number
• Search "installation guide" + model number
• Look for "troubleshooting guide" + model number

**⚠️ Important:**
• Verify model number matches exactly
• Download manuals locally for reference
• Always follow safety procedures in documentation
• Contact manufacturer if manuals aren't available online

What specific diagnostic issue are you working on with this equipment?`;
}
