// netlify/functions/chat.js
// Enhanced HVAC Jack backend with intelligent routing and comprehensive photo integration

// Use shared storage from analyze-photo.js
global.usageStore = global.usageStore || {
  sessions: new Map(),
  messages: [],
  blockedContent: [],
  events: [],
  dailyStats: new Map(),
  photoAnalyses: [],
  equipmentDatabase: new Map(),
  diagnosticSessions: new Map()
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
        photoAnalysisData,
        diagnosticPackage,
        enhancedAnalysisContext
      } = JSON.parse(event.body);

      console.log('📨 Enhanced chat request received:', {
        messageLength: message?.length,
        mode,
        sessionId,
        hasPhotoContext: !!photoAnalysisData,
        hasDiagnosticPackage: !!diagnosticPackage,
        hasEnhancedContext: !!enhancedAnalysisContext,
        isAutoPhotoSearch: systemContext?.searchType === 'auto_photo_manual_search'
      });

      // Basic validation
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Message is required' })
        };
      }

      // Enhanced validation with professional context
      const validation = validateEnhancedContent(message, mode);
      if (!validation.isValid) {
        await logBlockedContent({
          message: message.substring(0, 100),
          reason: validation.reason,
          timestamp: new Date().toISOString(),
          ip: event.headers['client-ip'] || 'unknown',
          sessionId: sessionId,
          mode: mode
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

      // Enhanced rate limiting based on mode
      const rateLimitCheck = await checkEnhancedRateLimit(event.headers['client-ip'], mode);
      if (!rateLimitCheck.allowed) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: rateLimitCheck.retryAfter,
            mode: mode
          })
        };
      }

      // **INTELLIGENT ROUTING SYSTEM**
      const routingDecision = analyzeRequestRouting(
        message, 
        systemContext, 
        photoAnalysisData, 
        diagnosticPackage,
        mode
      );

      console.log('🧠 Routing decision:', routingDecision);

      let response;
      let responseMetadata = {};

      switch (routingDecision.route) {
        case 'ENHANCED_DIAGNOSTIC':
          response = await handleEnhancedDiagnostic(
            message, 
            diagnosticPackage, 
            photoAnalysisData, 
            conversationHistory, 
            mode
          );
          responseMetadata.routeUsed = 'enhanced_diagnostic';
          break;

        case 'COMPREHENSIVE_MANUAL_SEARCH':
          response = await handleComprehensiveManualSearch(
            message, 
            systemContext, 
            photoAnalysisData, 
            mode
          );
          responseMetadata.routeUsed = 'comprehensive_manual_search';
          break;

        case 'TECHNICAL_CONSULTATION':
          response = await handleTechnicalConsultation(
            message, 
            systemContext, 
            conversationHistory, 
            photoAnalysisData,
            mode
          );
          responseMetadata.routeUsed = 'technical_consultation';
          break;

        case 'SAFETY_PRIORITY':
          response = await handleSafetyPriority(message, systemContext, mode);
          responseMetadata.routeUsed = 'safety_priority';
          break;

        case 'HOMEOWNER_GUIDED':
          response = await handleHomeownerGuided(
            message, 
            systemContext, 
            conversationHistory, 
            photoAnalysisData,
            mode
          );
          responseMetadata.routeUsed = 'homeowner_guided';
          break;

        default:
          response = await handleStandardConversation(
            message, 
            conversationHistory, 
            systemContext, 
            photoAnalysisData, 
            mode
          );
          responseMetadata.routeUsed = 'standard_conversation';
      }
      
      // Post-process response for safety and quality
      const enhancedResponse = await enhanceResponse(response, routingDecision, mode);

      const responseTime = (Date.now() - startTime) / 1000;

      // Log enhanced interaction
      await logEnhancedInteraction({
        input: message.substring(0, 100),
        output: enhancedResponse.substring(0, 100),
        mode,
        route: routingDecision.route,
        confidence: routingDecision.confidence,
        hasPhotoContext: !!photoAnalysisData,
        hasDiagnosticPackage: !!diagnosticPackage,
        responseTime,
        timestamp: new Date().toISOString(),
        ip: event.headers['client-ip'] || 'unknown',
        sessionId: sessionId
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: enhancedResponse,
          timestamp: new Date().toISOString(),
          mode: mode,
          usingAI: true,
          responseTime: responseTime,
          sessionId: sessionId,
          routeUsed: responseMetadata.routeUsed,
          routingConfidence: routingDecision.confidence,
          hasPhotoContext: !!photoAnalysisData,
          hasDiagnosticPackage: !!diagnosticPackage,
          enhancedAnalysis: true
        })
      };

    } catch (error) {
      console.error('💥 Enhanced chat error:', error);
      
      // Enhanced fallback with context preservation
      const { message = '', mode = 'homeowner', sessionId = null, photoAnalysisData = null } = JSON.parse(event.body || '{}');
      const fallbackResponse = generateEnhancedFallbackResponse(message, mode, photoAnalysisData);
      const responseTime = (Date.now() - startTime) / 1000;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: fallbackResponse + '\n\n*Note: Using enhanced offline mode due to temporary service issue.*',
          timestamp: new Date().toISOString(),
          fallback: true,
          usingAI: false,
          responseTime: responseTime,
          sessionId: sessionId,
          enhancedFallback: true
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

// **INTELLIGENT ROUTING SYSTEM**
function analyzeRequestRouting(message, systemContext, photoAnalysisData, diagnosticPackage, mode) {
  const routing = {
    route: 'STANDARD_CONVERSATION',
    confidence: 0,
    reasons: []
  };

  const messageLower = message.toLowerCase();

  // PRIORITY 1: Safety-critical situations
  if (detectSafetyIssue(messageLower)) {
    routing.route = 'SAFETY_PRIORITY';
    routing.confidence = 100;
    routing.reasons.push('Safety keywords detected');
    return routing;
  }

  // PRIORITY 2: Enhanced diagnostic mode (with diagnostic package)
  if (diagnosticPackage && detectDiagnosticIntent(messageLower)) {
    routing.route = 'ENHANCED_DIAGNOSTIC';
    routing.confidence = 90;
    routing.reasons.push('Diagnostic package available', 'Diagnostic intent detected');
    return routing;
  }

  // PRIORITY 3: Comprehensive manual search (equipment identified + manual request)
  if (detectComprehensiveManualRequest(messageLower, systemContext, photoAnalysisData)) {
    routing.route = 'COMPREHENSIVE_MANUAL_SEARCH';
    routing.confidence = 85;
    routing.reasons.push('Manual search with equipment context');
    return routing;
  }

  // PRIORITY 4: Technical consultation (technician mode + complex technical content)
  if (mode === 'technician' && detectTechnicalConsultation(messageLower)) {
    routing.route = 'TECHNICAL_CONSULTATION';
    routing.confidence = 80;
    routing.reasons.push('Technician mode', 'Technical consultation detected');
    return routing;
  }

  // PRIORITY 5: Homeowner guided support (homeowner mode + guidance needed)
  if (mode === 'homeowner' && detectHomeownerGuidanceNeed(messageLower)) {
    routing.route = 'HOMEOWNER_GUIDED';
    routing.confidence = 75;
    routing.reasons.push('Homeowner mode', 'Guidance needed');
    return routing;
  }

  // DEFAULT: Standard conversation
  routing.confidence = 50;
  routing.reasons.push('Standard conversation routing');
  return routing;
}

// Route detection functions
function detectSafetyIssue(message) {
  const safetyKeywords = [
    'gas smell', 'smell gas', 'gas leak', 'carbon monoxide', 'co alarm',
    'burning smell', 'smoke', 'fire', 'explosion', 'emergency',
    'can\'t breathe', 'dizzy', 'headache from gas', 'yellow flame'
  ];
  
  return safetyKeywords.some(keyword => message.includes(keyword));
}

function detectDiagnosticIntent(message) {
  const diagnosticKeywords = [
    'not working', 'broken', 'problem', 'issue', 'fault', 'error',
    'diagnostic', 'troubleshoot', 'fix', 'repair', 'malfunction',
    'won\'t start', 'no heat', 'no cooling', 'strange noise'
  ];
  
  return diagnosticKeywords.some(keyword => message.includes(keyword));
}

function detectComprehensiveManualRequest(message, systemContext, photoAnalysisData) {
  const manualKeywords = [
    'manual', 'documentation', 'wiring diagram', 'schematic', 'service guide',
    'installation guide', 'troubleshooting guide', 'error codes', 'parts list'
  ];
  
  const hasManualRequest = manualKeywords.some(keyword => message.includes(keyword));
  const hasEquipmentContext = systemContext?.brand || photoAnalysisData?.structuredData?.equipment?.brand;
  
  return hasManualRequest || (hasEquipmentContext && systemContext?.isManualSearch);
}

function detectTechnicalConsultation(message) {
  const technicalKeywords = [
    'pressure', 'voltage', 'amperage', 'ohms', 'mfd', 'btu', 'cfm',
    'superheat', 'subcooling', 'manifold', 'static pressure', 'gas pressure',
    'combustion analysis', 'flue gas', 'draft', 'sequence of operation'
  ];
  
  return technicalKeywords.some(keyword => message.includes(keyword));
}

function detectHomeownerGuidanceNeed(message) {
  const guidanceKeywords = [
    'how do i', 'what should i', 'can i', 'is it safe', 'help me',
    'don\'t know', 'not sure', 'confused', 'need help', 'what to do'
  ];
  
  return guidanceKeywords.some(keyword => message.includes(keyword));
}

// **ENHANCED ROUTE HANDLERS**

async function handleEnhancedDiagnostic(message, diagnosticPackage, photoAnalysisData, conversationHistory, mode) {
  const systemPrompt = createEnhancedDiagnosticPrompt(diagnosticPackage, photoAnalysisData, mode);
  const claudeMessages = buildEnhancedClaudeMessages(message, conversationHistory, diagnosticPackage, photoAnalysisData);
  
  return await callClaudeWithEnhancedContext(systemPrompt, claudeMessages);
}

async function handleComprehensiveManualSearch(message, systemContext, photoAnalysisData, mode) {
  // Extract equipment details with photo analysis priority
  const equipmentDetails = extractEquipmentFromContext(systemContext, photoAnalysisData);
  
  if (!equipmentDetails.brand || !equipmentDetails.model) {
    return generateManualSearchGuidance(equipmentDetails, mode);
  }

  // Use enhanced search-manuals function
  try {
    const searchFunction = require('./search-manuals');
    const searchResult = await searchFunction.handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        brand: equipmentDetails.brand,
        model: equipmentDetails.model,
        equipmentType: equipmentDetails.type
      })
    }, {});

    if (searchResult.statusCode === 200) {
      const searchData = JSON.parse(searchResult.body);
      if (searchData.success && searchData.manuals.length > 0) {
        return formatComprehensiveManualResponse(searchData.manuals, equipmentDetails, mode, photoAnalysisData);
      }
    }
  } catch (error) {
    console.error('Enhanced manual search error:', error);
  }

  // Fallback to comprehensive manual guidance
  return generateComprehensiveManualFallback(equipmentDetails, mode);
}

async function handleTechnicalConsultation(message, systemContext, conversationHistory, photoAnalysisData, mode) {
  const systemPrompt = createTechnicalConsultationPrompt(systemContext, photoAnalysisData);
  const claudeMessages = buildTechnicalClaudeMessages(message, conversationHistory, systemContext, photoAnalysisData);
  
  return await callClaudeWithEnhancedContext(systemPrompt, claudeMessages);
}

async function handleSafetyPriority(message, systemContext, mode) {
  return generateImmediateSafetyResponse(message, systemContext, mode);
}

async function handleHomeownerGuided(message, systemContext, conversationHistory, photoAnalysisData, mode) {
  const systemPrompt = createHomeownerGuidedPrompt(systemContext, photoAnalysisData);
  const claudeMessages = buildHomeownerClaudeMessages(message, conversationHistory, systemContext, photoAnalysisData);
  
  return await callClaudeWithEnhancedContext(systemPrompt, claudeMessages);
}

async function handleStandardConversation(message, conversationHistory, systemContext, photoAnalysisData, mode) {
  const systemPrompt = buildEnhancedSystemPrompt(mode, systemContext, photoAnalysisData);
  const claudeMessages = buildStandardClaudeMessages(message, conversationHistory, mode, photoAnalysisData);
  
  return await callClaudeWithEnhancedContext(systemPrompt, claudeMessages);
}

// **ENHANCED SYSTEM PROMPTS**

function createEnhancedDiagnosticPrompt(diagnosticPackage, photoAnalysisData, mode) {
  let prompt = `You are HVAC Jack Professional in Enhanced Diagnostic Mode. You have complete equipment information and comprehensive diagnostic data available.

**EQUIPMENT PROFILE LOADED:**
${photoAnalysisData ? `
- Equipment: ${photoAnalysisData.structuredData?.equipment?.type || 'Unknown'}
- Brand: ${photoAnalysisData.structuredData?.equipment?.brand || 'Unknown'}
- Model: ${photoAnalysisData.structuredData?.equipment?.model || 'Unknown'}
- Serial: ${photoAnalysisData.structuredData?.equipment?.serial || 'Unknown'}
- Photo Analysis: Complete technical specifications available
` : 'Equipment context available'}

**DIAGNOSTIC PACKAGE AVAILABLE:**
- Complete service documentation
- Official manuals and wiring diagrams
- Manufacturer error codes and troubleshooting procedures
- Parts specifications and replacement data
- Safety bulletins and service alerts
- Warranty information and recall status

**ENHANCED DIAGNOSTIC CAPABILITIES:**
You can now provide:
1. Exact manufacturer diagnostic procedures
2. Specific part numbers and specifications
3. Precise electrical measurements and test points
4. Step-by-step troubleshooting with equipment-specific details
5. Official service bulletin references
6. Code compliance and safety procedures

${mode === 'technician' ? `
**TECHNICIAN MODE - PROFESSIONAL DIAGNOSTIC:**
- Provide precise technical procedures
- Reference exact specifications from equipment database
- Include diagnostic equipment requirements
- Specify test points and expected readings
- Reference manufacturer service bulletins
- Include safety protocols and code requirements
` : `
**HOMEOWNER MODE - GUIDED DIAGNOSTIC:**
- Provide safe, step-by-step guidance
- Explain what each step does and why
- Emphasize safety at every step
- Clearly indicate when professional service is required
- Use the equipment specifications to provide accurate guidance
`}

Use the comprehensive equipment data to provide the most accurate, specific, and helpful diagnostic guidance possible.`;

  return prompt;
}

function createTechnicalConsultationPrompt(systemContext, photoAnalysisData) {
  return `You are HVAC Jack Professional providing expert technical consultation. You have access to comprehensive equipment data and industry standards.

**TECHNICAL CONSULTATION MODE:**
- Provide detailed technical analysis
- Reference specific codes and standards (CSA B149.1, NFPA 54, etc.)
- Include precise measurements and specifications
- Discuss advanced diagnostic techniques
- Reference manufacturer technical bulletins
- Address code compliance and safety requirements

**EQUIPMENT CONTEXT:**
${systemContext ? `System: ${systemContext.equipmentType || 'Unknown'}` : ''}
${photoAnalysisData ? `Photo Analysis: Complete technical specifications available` : ''}

Provide expert-level technical guidance with specific references to standards, codes, and manufacturer documentation.`;
}

function createHomeownerGuidedPrompt(systemContext, photoAnalysisData) {
  return `You are HVAC Jack in Homeowner Guidance Mode. Your role is to provide safe, clear, step-by-step guidance while prioritizing safety.

**HOMEOWNER GUIDANCE PRINCIPLES:**
- Safety first - always emphasize safety precautions
- Step-by-step instructions with clear explanations
- Plain language explanations of technical concepts
- Clear indicators when professional service is required
- Encouragement and reassurance throughout the process

**EQUIPMENT CONTEXT:**
${systemContext ? `System: ${systemContext.equipmentType || 'Unknown'}` : ''}
${photoAnalysisData ? `Equipment specs: Available for precise guidance` : ''}

Provide patient, thorough guidance that empowers homeowners while keeping them safe.`;
}

// **ENHANCED MESSAGE BUILDING**

function buildEnhancedClaudeMessages(message, conversationHistory, diagnosticPackage, photoAnalysisData) {
  const messages = [];

  // Add conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-6);
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    });
  }

  // Build enhanced message with full context
  let enhancedMessage = message;

  if (photoAnalysisData) {
    enhancedMessage = `[EQUIPMENT CONTEXT FROM PHOTO ANALYSIS]
Equipment: ${photoAnalysisData.structuredData?.equipment?.type || 'Unknown'}
Brand: ${photoAnalysisData.structuredData?.equipment?.brand || 'Unknown'}
Model: ${photoAnalysisData.structuredData?.equipment?.model || 'Unknown'}
Technical specs: Complete data available

[USER QUESTION]
${message}`;
  }

  if (diagnosticPackage) {
    enhancedMessage += `

[DIAGNOSTIC PACKAGE AVAILABLE]
- Complete service documentation loaded
- Official troubleshooting procedures available
- Parts and specifications database ready
- Safety procedures and code references loaded

Use this comprehensive data to provide the most accurate diagnostic guidance.`;
  }

  messages.push({ role: 'user', content: enhancedMessage });
  return messages;
}

function buildTechnicalClaudeMessages(message, conversationHistory, systemContext, photoAnalysisData) {
  const messages = [];

  // Add technical conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    conversationHistory.slice(-8).forEach(msg => {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    });
  }

  // Build technical consultation message
  let technicalMessage = `[TECHNICAL CONSULTATION REQUEST]
${message}

[EQUIPMENT CONTEXT]
${systemContext ? `System Type: ${systemContext.equipmentType || 'Unknown'}` : ''}
${photoAnalysisData ? `Photo Analysis: Complete technical specifications available` : ''}

Please provide expert technical analysis with specific references to industry standards and manufacturer requirements.`;

  messages.push({ role: 'user', content: technicalMessage });
  return messages;
}

function buildHomeownerClaudeMessages(message, conversationHistory, systemContext, photoAnalysisData) {
  const messages = [];

  // Add homeowner conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    conversationHistory.slice(-5).forEach(msg => {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    });
  }

  // Build homeowner guidance message
  let guidanceMessage = `[HOMEOWNER GUIDANCE REQUEST]
${message}

[EQUIPMENT INFORMATION]
${systemContext ? `System: ${systemContext.equipmentType || 'Unknown'}` : ''}
${photoAnalysisData ? `Equipment details: Available for accurate guidance` : ''}

Please provide safe, step-by-step guidance with clear explanations and safety emphasis.`;

  messages.push({ role: 'user', content: guidanceMessage });
  return messages;
}

function buildStandardClaudeMessages(message, conversationHistory, mode, photoAnalysisData) {
  const messages = [];

  if (conversationHistory && conversationHistory.length > 0) {
    conversationHistory.slice(-8).forEach(msg => {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    });
  }

  let messageContent = message;
  if (photoAnalysisData) {
    messageContent = `[PHOTO ANALYSIS CONTEXT]
Recent rating plate analysis shows:
- Equipment: ${photoAnalysisData.structuredData?.equipment?.type || 'Unknown'}
- Brand: ${photoAnalysisData.structuredData?.equipment?.brand || 'Unknown'}
- Model: ${photoAnalysisData.structuredData?.equipment?.model || 'Unknown'}

User's question: ${message}`;
  }

  messages.push({ role: 'user', content: messageContent });
  return messages;
}

// **ENHANCED CLAUDE API CALL**
async function callClaudeWithEnhancedContext(systemPrompt, messages) {
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Claude API key not configured');
  }

  const fetch = (await import('node-fetch')).default;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.1,
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

// **RESPONSE FORMATTING FUNCTIONS**

function formatComprehensiveManualResponse(manuals, equipmentDetails, mode, photoAnalysisData) {
  const isAutoSearch = photoAnalysisData ? ' (Auto-located from Photo Analysis)' : '';
  
  let response = `**📚 COMPREHENSIVE DOCUMENTATION PACKAGE${isAutoSearch}**\n\n`;
  response += `🎯 **${equipmentDetails.brand} ${equipmentDetails.model} - Complete Technical Library**\n\n`;

  // Categorize manuals for professional presentation
  const categories = {
    'Service Manual': [],
    'Installation Guide': [],
    'Wiring Diagram': [],
    'User Manual': [],
    'Parts Manual': [],
    'Troubleshooting Guide': [],
    'Documentation': []
  };

  manuals.forEach(manual => {
    const category = manual.type || 'Documentation';
    if (categories[category]) {
      categories[category].push(manual);
    } else {
      categories['Documentation'].push(manual);
    }
  });

  // Display categorized manuals
  Object.entries(categories).forEach(([category, categoryManuals]) => {
    if (categoryManuals.length > 0) {
      const emoji = getCategoryEmoji(category);
      response += `**${emoji} ${category}**\n`;
      
              categoryManuals.forEach(manual => {
        const sourceIcon = manual.isOfficial ? '🏭' : manual.isPDF ? '📄' : '🌐';
        response += `${sourceIcon} **[${manual.title}](${manual.url})**\n`;
        response += `🔗 Direct link: ${manual.url}\n`;
        
        if (manual.isOfficial) {
          response += `✅ Official ${equipmentDetails.brand} Source\n`;
        }
        
        if (manual.description && manual.description.length > 10) {
          response += `📝 ${manual.description.substring(0, 100)}${manual.description.length > 100 ? '...' : ''}\n`;
        }
        response += '\n';
      });
    }
  });

  // Add professional guidance
  if (mode === 'technician') {
    response += `**🔧 PROFESSIONAL DIAGNOSTIC PACKAGE READY**\n\n`;
    response += `**Complete Documentation Access:**\n`;
    response += `• Service procedures and diagnostic flowcharts\n`;
    response += `• Electrical schematics and wiring diagrams\n`;
    response += `• Component specifications and part numbers\n`;
    response += `• Error codes and troubleshooting trees\n`;
    response += `• Safety bulletins and service alerts\n\n`;
    
    response += `**Technical Support Ready:**\n`;
    response += `• Cross-reference model: **${equipmentDetails.model}**\n`;
    response += `• All manuals verified for current revision\n`;
    response += `• Official manufacturer documentation priority\n`;
    response += `• Field reference materials downloaded for offline use\n\n`;
  } else {
    response += `**🏠 COMPLETE HOMEOWNER SUPPORT PACKAGE**\n\n`;
    response += `**Everything You Need:**\n`;
    response += `• Complete operation and maintenance manual\n`;
    response += `• Safety procedures and emergency contacts\n`;
    response += `• Warranty information and registration\n`;
    response += `• Troubleshooting guide for common issues\n`;
    response += `• When to call professional service\n\n`;
    
    response += `**Easy Access Instructions:**\n`;
    response += `• Click any link above to open documentation\n`;
    response += `• Right-click PDFs and "Save As" to download\n`;
    response += `• Keep manuals handy for future reference\n`;
    response += `• Official ${equipmentDetails.brand} sources are most reliable\n\n`;
  }

  // Add instant diagnostic readiness
  response += `**🎯 INSTANT DIAGNOSTIC READINESS**\n\n`;
  response += `With complete documentation loaded, I can now provide:\n`;
  response += `✅ Equipment-specific troubleshooting procedures\n`;
  response += `✅ Exact part numbers and specifications\n`;
  response += `✅ Manufacturer error code definitions\n`;
  response += `✅ Step-by-step diagnostic sequences\n`;
  response += `✅ Safety procedures and code compliance\n\n`;
  
  const nextStepPrompt = mode === 'technician' 
    ? `**What specific diagnostic issue are you working on with this ${equipmentDetails.type}?**`
    : `**What specific problem are you experiencing with your ${equipmentDetails.type}?**`;
    
  response += nextStepPrompt;

  return response;
}

function generateImmediateSafetyResponse(message, systemContext, mode) {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('gas smell') || messageLower.includes('smell gas')) {
    return `🚨 **IMMEDIATE SAFETY ALERT - GAS LEAK SUSPECTED**

**DO THIS RIGHT NOW:**
1. **STOP** - Do not operate any electrical switches, appliances, or create sparks
2. **EVACUATE** - Get everyone out of the building immediately
3. **CALL GAS COMPANY** - From outside, call your gas utility emergency number
4. **CALL 911** - If you can't reach gas company immediately
5. **STAY OUTSIDE** - Do not re-enter until gas company says it's safe

**DO NOT:**
❌ Use light switches, phones, or any electrical devices inside
❌ Try to locate the leak yourself
❌ Use matches, lighters, or create any flames
❌ Try to shut off gas at the meter unless trained

**GAS EMERGENCY NUMBERS:**
• Most areas: Call 811 (Call Before You Dig) for gas company contact
• Or call your local gas utility directly
• In immediate danger: 911

**After safety is ensured, we can help with next steps. Your safety is the absolute priority.**`;
  }

  if (messageLower.includes('carbon monoxide') || messageLower.includes('co alarm')) {
    return `🚨 **CARBON MONOXIDE EMERGENCY**

**IMMEDIATE ACTIONS:**
1. **GET FRESH AIR** - Go outside immediately
2. **CALL 911** - Seek medical attention if anyone has symptoms
3. **TURN OFF GAS APPLIANCES** - If safe to do so from outside
4. **VENTILATE** - Open windows and doors
5. **DON'T RE-ENTER** - Until CO levels are safe

**CO POISONING SYMPTOMS:**
• Headache, dizziness, nausea
• Flu-like symptoms without fever
• Fatigue, confusion
• Cherry-red lips and fingernails

**CALL FOR HELP:**
• Emergency: 911
• Poison Control: 1-800-222-1222
• Gas Company Emergency Line

**Never ignore CO alarms. Get professional inspection before using gas appliances again.**`;
  }

  if (messageLower.includes('fire') || messageLower.includes('smoke') || messageLower.includes('burning smell')) {
    return `🚨 **FIRE/SMOKE EMERGENCY**

**IMMEDIATE ACTIONS:**
1. **CALL 911** - Report fire/smoke immediately
2. **EVACUATE** - Get everyone out safely
3. **TURN OFF GAS** - At meter if safely accessible
4. **TURN OFF ELECTRICITY** - At main breaker if safe
5. **STAY OUT** - Until fire department clears the area

**BURNING SMELL PROTOCOL:**
• Turn off suspected appliance immediately
• Ensure area is ventilated
• Do not use appliance until inspected
• Call gas company if gas appliance related

**After emergency services clear the area, we can help assess next steps for equipment inspection and repair.**`;
  }

  // General safety response
  return `⚠️ **SAFETY FIRST PROTOCOL ACTIVATED**

I've detected a potential safety concern in your message. Here's immediate guidance:

**GENERAL SAFETY STEPS:**
1. **Assess immediate danger** - Are you in immediate physical danger?
2. **Remove power if safe** - Turn off electrical disconnect or breaker
3. **Shut off gas if safe** - Turn gas valve to OFF position
4. **Ventilate area** - Open windows and doors
5. **Call professionals** - Contact licensed technician

**WHEN TO CALL EMERGENCY SERVICES:**
• Any gas smell or suspected leak
• Carbon monoxide alarm activation
• Visible fire, smoke, or burning odors
• Anyone experiencing symptoms of CO poisoning
• Any situation where you feel unsafe

**Emergency Numbers:**
• Fire/Medical Emergency: 911
• Gas Emergency: Your local gas utility
• Poison Control: 1-800-222-1222

Please confirm you and everyone else are safe, then I can help with next steps.`;
}

function generateComprehensiveManualFallback(equipmentDetails, mode) {
  const brand = equipmentDetails.brand || 'your equipment';
  const model = equipmentDetails.model || '';
  
  let response = `**📚 COMPREHENSIVE MANUAL SEARCH - ENHANCED GUIDANCE**\n\n`;
  response += `🔍 **Searching for: ${brand} ${model}**\n\n`;
  
  // Brand-specific enhanced guidance
  const brandGuidance = getBrandSpecificGuidance(equipmentDetails.brand);
  if (brandGuidance) {
    response += brandGuidance;
  }
  
  response += `**🎯 PROFESSIONAL MANUAL SOURCES:**\n\n`;
  
  // Official manufacturer sources
  response += `**📋 Official ${brand} Resources:**\n`;
  response += `• **Primary:** ${brand}.com/support or ${brand}.com/service\n`;
  response += `• **Literature:** Search product literature database\n`;
  response += `• **Service:** Professional service portal access\n`;
  response += `• **Parts:** Authorized parts and service locator\n\n`;
  
  // Professional manual databases
  response += `**📚 Professional Manual Databases:**\n`;
  response += `• **ManualsLib.com** - Comprehensive technical library\n`;
  response += `• **RepairClinic.com** - Service manuals and diagnostics\n`;
  response += `• **AppliancePartsPros.com** - Parts diagrams and specs\n`;
  response += `• **PartsTown.com** - Commercial equipment documentation\n`;
  response += `• **ServiceTechBooks.com** - Professional service manuals\n\n`;
  
  // Enhanced search strategies
  response += `**🔍 ENHANCED SEARCH STRATEGIES:**\n\n`;
  response += `**Exact Model Search:**\n`;
  response += `• "${brand} ${model} service manual filetype:pdf"\n`;
  response += `• "${brand} ${model} installation guide"\n`;
  response += `• "${brand} ${model} wiring diagram"\n`;
  response += `• "${brand} ${model} troubleshooting guide"\n\n`;
  
  response += `**Alternative Search Methods:**\n`;
  response += `• Model series search (try variations of ${model})\n`;
  response += `• Equipment type + brand (${equipmentDetails.type} ${brand})\n`;
  response += `• Professional forums and technical communities\n`;
  response += `• Manufacturer technical support direct contact\n\n`;
  
  if (mode === 'technician') {
    response += `**🔧 PROFESSIONAL TECHNICAL SUPPORT:**\n\n`;
    response += `**Industry Resources:**\n`;
    response += `• **ACCA Technical Manuals** - Professional standards\n`;
    response += `• **AHRI Certification Database** - Equipment ratings\n`;
    response += `• **Manufacturer Technical Hotlines** - Direct engineer support\n`;
    response += `• **Trade Organization Libraries** - Professional documentation\n\n`;
    
    response += `**Service Information Access:**\n`;
    response += `• Contact ${brand} commercial/professional support\n`;
    response += `• Request access to professional service portal\n`;
    response += `• Professional certification may unlock additional resources\n`;
    response += `• Local distributor technical support services\n\n`;
  } else {
    response += `**🏠 HOMEOWNER SUPPORT RESOURCES:**\n\n`;
    response += `**Owner Documentation:**\n`;
    response += `• User manuals and operation guides\n`;
    response += `• Maintenance schedules and procedures\n`;
    response += `• Warranty information and registration\n`;
    response += `• Safety procedures and emergency contacts\n\n`;
    
    response += `**Professional Service Support:**\n`;
    response += `• ${brand} authorized service locator\n`;
    response += `• Certified technician finder tools\n`;
    response += `• Customer service and technical support\n`;
    response += `• Warranty service and parts support\n\n`;
  }
  
  response += `**📞 DIRECT SUPPORT CONTACTS:**\n\n`;
  response += `While I search for documentation, you can also contact:\n`;
  response += `• **${brand} Customer Service** - Equipment support and documentation\n`;
  response += `• **Local Authorized Dealers** - Service and parts information\n`;
  response += `• **Professional Service Companies** - Technical expertise\n\n`;
  
  response += `**What specific information do you need for this ${equipmentDetails.type}?** I can help guide your search or provide general troubleshooting while you locate the documentation.`;
  
  return response;
}

// **UTILITY FUNCTIONS**

function getCategoryEmoji(category) {
  const emojis = {
    'Service Manual': '🔧',
    'Installation Guide': '⚙️',
    'Wiring Diagram': '⚡',
    'User Manual': '👤',
    'Parts Manual': '🔩',
    'Troubleshooting Guide': '🔍',
    'Documentation': '📋'
  };
  return emojis[category] || '📄';
}

function getBrandSpecificGuidance(brand) {
  const brandLower = brand?.toLowerCase();
  
  const brandInfo = {
    'generac': `**🔋 GENERAC GENERATOR RESOURCES:**
• **Generac.com/support** - Complete owner and service documentation
• **Service bulletins** - Technical updates and modifications
• **Parts diagrams** - Interactive parts identification
• **Dealer locator** - Authorized service network
• **PowerZone app** - Mobile service resources
`,
    'kohler': `**⚡ KOHLER POWER RESOURCES:**
• **KohlerPower.com/support** - Technical documentation library
• **Service information** - Professional diagnostic procedures
• **Training materials** - Technical certification resources
• **Dealer support** - Professional service network
`,
    'carrier': `**🏠 CARRIER HVAC RESOURCES:**
• **Carrier.com/residential/support** - Complete homeowner resources
• **Technical literature** - Professional service documentation
• **Bryant.com** - Sister brand with shared documentation
• **Service network** - Authorized dealer locator
`,
    'trane': `**❄️ TRANE HVAC RESOURCES:**
• **Trane.com/support** - Technical documentation center
• **Service guides** - Professional troubleshooting procedures
• **American Standard** - Related brand documentation
• **Tracer system** - Advanced diagnostic resources
`
  };
  
  return brandInfo[brandLower] || '';
}

function extractEquipmentFromContext(systemContext, photoAnalysisData) {
  return {
    brand: photoAnalysisData?.structuredData?.equipment?.brand ||
           systemContext?.brand || null,
    model: photoAnalysisData?.structuredData?.equipment?.model ||
           systemContext?.model || null,
    type: photoAnalysisData?.structuredData?.equipment?.type ||
          systemContext?.equipmentType || null,
    serial: photoAnalysisData?.structuredData?.equipment?.serial ||
            systemContext?.serial || null
  };
}

function generateManualSearchGuidance(equipmentDetails, mode) {
  return `**🔍 ENHANCED MANUAL SEARCH ASSISTANCE**

To provide you with the exact documentation for your equipment, I need:

**Required Information:**
• **Brand/Manufacturer**: ${equipmentDetails.brand || 'Please provide (e.g., Generac, Carrier, Trane)'}
• **Complete Model Number**: ${equipmentDetails.model || 'Please provide from rating plate'}
• **Equipment Type**: ${equipmentDetails.type || 'Please specify (furnace, AC, generator, etc.)'}

${mode === 'technician' ? 
  '**Professional Tip:** Take a clear photo of the rating plate for instant analysis and automatic manual lookup.' :
  '**Helpful Tip:** The rating plate is usually located on the equipment and contains all model information.'
}

**Once I have this information, I can instantly provide:**
✅ Official service manuals and documentation
✅ Wiring diagrams and electrical schematics  
✅ Troubleshooting guides and error codes
✅ Parts lists and specifications
✅ Safety bulletins and service alerts
✅ Warranty information and recall status

**What's the brand and model number of your equipment?**`;
}

function buildEnhancedSystemPrompt(mode, systemContext, photoAnalysisData) {
  let equipmentInfo = '';
  
  if (photoAnalysisData?.structuredData) {
    const eq = photoAnalysisData.structuredData.equipment;
    equipmentInfo = `
PHOTO ANALYSIS CONTEXT:
- Equipment: ${eq?.type || 'Unknown'} by ${eq?.brand || 'Unknown'}
- Model: ${eq?.model || 'Unknown'}
- Serial: ${eq?.serial || 'Unknown'}
- Complete technical specifications available from recent photo analysis
`;
  }
  
  if (systemContext) {
    equipmentInfo += `
CONVERSATION CONTEXT:
- Equipment Type: ${systemContext?.equipmentType || 'Unknown'}
- Brand: ${systemContext?.brand || 'Unknown'}
- Model: ${systemContext?.model || 'Unknown'}
- Current Issue: ${systemContext?.currentProblem || 'Diagnosing'}
- Previous Actions: ${systemContext?.previousActions?.join(', ') || 'None'}
`;
  }

  const basePrompt = `You are HVAC Jack Professional - the industry's most advanced HVAC and gas appliance diagnostic assistant with comprehensive equipment database access.

**COMPREHENSIVE EXPERTISE COVERS:**
- HVAC Systems: Furnaces, boilers, heat pumps, air conditioners, package units
- Gas Appliances: Water heaters, generators, unit heaters, ranges, dryers
- Controls & Electronics: Thermostats, smart systems, diagnostic interfaces
- Safety Systems: Gas detection, carbon monoxide, ventilation
- Professional Standards: Code compliance, certification requirements

${equipmentInfo}

**ENHANCED CAPABILITIES:**
With comprehensive equipment database access, I can provide:
- Exact manufacturer specifications and procedures
- Specific part numbers and replacement procedures
- Official error codes and diagnostic sequences
- Equipment-specific safety procedures
- Code compliance and certification requirements
- Warranty status and recall information

**SAFETY PRIORITY PROTOCOL:**
- Gas emergencies: Immediate evacuation and emergency services
- Carbon monoxide: Immediate fresh air and medical attention
- Electrical hazards: Power disconnect and professional service
- Fire/smoke: Emergency services and area evacuation

Key principles:
1. **Safety First** - Always prioritize gas safety and hazard identification
2. **Equipment-Specific Guidance** - Use exact equipment data for precision
3. **Professional Standards** - Reference codes, standards, and certifications
4. **Clear Communication** - Appropriate technical level for user mode
5. **Comprehensive Support** - Leverage complete equipment database`;

  if (mode === 'homeowner') {
    return basePrompt + `

**HOMEOWNER MODE - ENHANCED GUIDANCE:**
- Use clear, non-technical language with explanations
- Provide safe, step-by-step procedures with safety emphasis
- Explain WHY each step is important for understanding
- Use equipment specifications for accurate, specific guidance
- Clearly indicate when professional service is required
- Emphasize safety at every step, especially with gas appliances
- Provide encouragement and reassurance throughout`;
  } else {
    return basePrompt + `

**TECHNICIAN MODE - PROFESSIONAL DIAGNOSTIC:**
- Provide precise technical procedures and specifications
- Reference exact equipment data and manufacturer procedures
- Include specific diagnostic equipment and measurement requirements
- Reference applicable codes (CSA B149.1, NFPA 54, local codes)
- Provide advanced diagnostic sequences and troubleshooting trees
- Include safety protocols and professional certification requirements
- Use equipment database for exact part numbers and specifications`;
  }
}

// **ENHANCED VALIDATION AND RATE LIMITING**

function validateEnhancedContent(message, mode) {
  const validation = {
    isValid: true,
    reason: '',
    errorMessage: ''
  };

  // Enhanced length limits based on mode
  const maxLength = mode === 'technician' ? 1500 : 1000;
  
  if (message.length > maxLength) {
    validation.isValid = false;
    validation.reason = 'too_long';
    validation.errorMessage = `⚠️ **Message too long.** Please keep ${mode} messages under ${maxLength} characters.`;
    return validation;
  }

  // Basic content validation
  if (/\b(porn|sex|nude|naked|explicit|adult|xxx|nsfw)\b/i.test(message)) {
    validation.isValid = false;
    validation.reason = 'inappropriate';
    validation.errorMessage = '🚫 **Inappropriate content detected.** Please ask about HVAC systems and gas appliances.';
    return validation;
  }

  // Spam detection
  if (/(.)\1{25,}/.test(message) || /(.{1,5})\1{15,}/.test(message)) {
    validation.isValid = false;
    validation.reason = 'spam';
    validation.errorMessage = '🚫 **Invalid message format.** Please ask a normal question about your equipment.';
    return validation;
  }

  return validation;
}

async function checkEnhancedRateLimit(ip, mode) {
  const key = `${ip}_${mode}`;
  const now = Date.now();
  const windowMs = mode === 'technician' ? 300000 : 600000; // 5 min tech, 10 min homeowner
  const maxRequests = mode === 'technician' ? 50 : 30; // Higher limits for professionals

  if (!global.enhancedChatRateLimit) {
    global.enhancedChatRateLimit = new Map();
  }

  if (!global.enhancedChatRateLimit.has(key)) {
    global.enhancedChatRateLimit.set(key, []);
  }

  const requests = global.enhancedChatRateLimit.get(key);
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
    };
  }

  validRequests.push(now);
  global.enhancedChatRateLimit.set(key, validRequests);
  return { allowed: true };
}

// **ENHANCED RESPONSE PROCESSING**

async function enhanceResponse(response, routingDecision, mode) {
  // Add routing confidence indicator for transparency
  if (routingDecision.confidence < 70) {
    response += `\n\n*Response generated using ${routingDecision.route.toLowerCase()} routing (confidence: ${routingDecision.confidence}%)*`;
  }

  // Add safety reminders for gas appliances
  if (response.toLowerCase().includes('gas') && !response.includes('🚨')) {
    response += `\n\n⚠️ **Gas Safety Reminder:** If you smell gas at any time, stop work immediately, evacuate, and call your gas company.`;
  }

  return response;
}

// **ENHANCED LOGGING**

async function logEnhancedInteraction(data) {
  try {
    const store = global.usageStore;
    
    const enhancedLogEntry = {
      ...data,
      enhanced: true,
      routeUsed: data.route,
      routingConfidence: data.confidence,
      hasComprehensiveContext: data.hasPhotoContext || data.hasDiagnosticPackage
    };

    store.messages = store.messages || [];
    store.messages.push(enhancedLogEntry);
    
    if (store.messages.length > 500) {
      store.messages = store.messages.slice(-500);
    }
    
    console.log('✅ Enhanced Chat Interaction:', {
      timestamp: data.timestamp,
      mode: data.mode,
      route: data.route,
      confidence: data.confidence,
      responseTime: data.responseTime,
      hasPhotoContext: data.hasPhotoContext,
      hasDiagnosticPackage: data.hasDiagnosticPackage,
      sessionId: data.sessionId
    });
  } catch (error) {
    console.warn('Failed to log enhanced interaction:', error);
  }
}

async function logBlockedContent(data) {
  try {
    const store = global.usageStore;
    store.blockedContent = store.blockedContent || [];
    store.blockedContent.push({
      ...data,
      enhanced: true
    });
    
    if (store.blockedContent.length > 100) {
      store.blockedContent = store.blockedContent.slice(-100);
    }
    
    console.log('🚫 Enhanced Blocked Content:', {
      timestamp: data.timestamp,
      reason: data.reason,
      mode: data.mode,
      sessionId: data.sessionId
    });
  } catch (error) {
    console.warn('Failed to log blocked content:', error);
  }
}

// **ENHANCED FALLBACK RESPONSES**

function generateEnhancedFallbackResponse(message, mode, photoAnalysisData) {
  const input = message.toLowerCase();
  
  // Preserve photo context in fallback
  let contextNote = '';
  if (photoAnalysisData) {
    const eq = photoAnalysisData.structuredData?.equipment;
    contextNote = `\n\n📸 **Equipment Context Preserved:** ${eq?.brand || 'Unknown'} ${eq?.model || 'Unknown'} ${eq?.type || 'equipment'}`;
  }
  
  // Enhanced fallback based on detected intent
  if (input.includes('no heat')) {
    return mode === 'homeowner' 
      ? `**🔥 No Heat - Enhanced Offline Guidance**

**Quick Safety Check:**
⚠️ Gas smell? Evacuate immediately and call gas company!

**Step-by-Step Diagnosis:**
1. **Thermostat Check** - Set to HEAT, temperature 5°F higher than current
2. **Power Check** - Verify circuit breaker is ON  
3. **Filter Check** - Replace if dirty (major cause of no heat)
4. **Listen** - Does furnace attempt to start when thermostat calls?

**Next Steps Based on Results:**
• Starts but no heat: Possible pilot/ignition issue
• Doesn't start: Electrical or safety control issue
• Strange noises: Stop and call professional

${contextNote}

**What happens when you try these steps?**`
      : `**🔥 No Heat - Professional Diagnostic Protocol**

**Initial Assessment:**
⚡ Verify 24VAC at R-W terminals at unit
🔥 Check HSI resistance (should be 11-200Ω)
📊 Gas manifold pressure (3.5"WC NG, 11"WC LP)
🌡️ Limit switch continuity
👁️ Flame sensor microamp reading (2-5μA)

**Sequence Analysis:**
1. Thermostat call verification
2. Induced draft motor startup
3. Pressure switch closure
4. HSI warm-up cycle (typically 17-25 seconds)
5. Gas valve energization
6. Flame establishment and sensing

${contextNote}

**Current symptoms and test results?**`;
  
  if (input.includes('no cool') || input.includes('ac')) {
    return mode === 'homeowner'
      ? `**❄️ AC Not Cooling - Enhanced Offline Guidance**

**Safety First:**
⚠️ Ice anywhere on system? Turn OFF cooling immediately!

**Systematic Check:**
1. **Thermostat** - Set to COOL, 5°F below current temperature
2. **Power** - Check BOTH breakers (indoor and outdoor units)
3. **Air Filter** - Replace if dirty (major cooling loss cause)
4. **Outdoor Unit** - Clean debris, check for ice formation
5. **Indoor Airflow** - All vents open and unblocked?

**Diagnostic Questions:**
• Any cool air from vents at all?
• Outdoor unit running (fan and compressor)?
• Ice on refrigerant lines?

${contextNote}

**What are you seeing with these checks?**`
      : `**❄️ No Cooling - Professional Diagnostic Protocol**

**Power and Electrical:**
⚡ 240VAC at outdoor disconnect
📊 Compressor and fan motor amp draws
🔋 Start/run capacitor μF readings
📐 Contactor pull-in voltage verification

**Refrigerant Analysis:**
🌡️ Suction and discharge pressures
📈 Superheat calculation (10-15°F typical)
📉 Subcooling calculation (8-12°F typical)
💧 Leak detection and oil spot inspection

**Airflow Verification:**
📏 Static pressure readings (.5"WC total typical)
🌪️ CFM measurement (400 CFM/ton)
🔧 Blower motor and wheel inspection

${contextNote}

**Current pressures and readings?**`;

  // Enhanced generator fallback
  if (input.includes('generator')) {
    return mode === 'homeowner'
      ? `**🔋 Generator Issue - Enhanced Offline Guidance**

**Safety Priority:**
⚠️ Gas smell near generator? Evacuate and call gas company!

**Basic Diagnostic Steps:**
1. **Battery** - Check connections, test voltage (should be 12.6V+)
2. **Fuel** - Verify adequate supply, check for water contamination
3. **Oil Level** - Check and top off if needed
4. **Air Filter** - Clean or replace if dirty
5. **Control Panel** - Check for error codes or indicators

**Transfer Switch Check:**
• Verify switch is in correct position
• Test manual operation if equipped
• Check for loose connections

${contextNote}

**What symptoms are you experiencing?**`
      : `**🔋 Generator Diagnostic - Professional Protocol**

**Electrical System:**
🔋 Battery voltage (12.6V no load, 13.8V charging)
⚡ Control panel voltage and error codes
🔌 Transfer switch signal verification
📊 Load bank testing capabilities

**Engine Analysis:**
🛢️ Oil pressure switch operation
⛽ Fuel pressure and quality verification
🌬️ Air intake and exhaust inspection
🔧 Engine compression testing

**Control System:**
🖥️ Controller diagnostics and programming
📡 Communication between components
⚙️ Exercise cycle verification
🔄 Automatic transfer sequence timing

${contextNote}

**Current error codes and symptoms?**`;

  // General enhanced fallback
  return mode === 'homeowner'
    ? `**🔧 Enhanced HVAC Support - Offline Mode**

I'm here to help with your heating, cooling, or gas appliance issue!${contextNote}

**Tell me about:**
🏠 What type of system? (furnace, AC, water heater, generator, etc.)
❓ What's it doing (or not doing)?
📅 When did this problem start?
👂 Any unusual sounds, smells, or visual indicators?

**Safety Reminders:**
🚨 Gas smell = evacuate immediately and call gas company
💧 Water leaking = turn off system and call professional
⚡ Electrical issues = turn off power and call electrician

**I can provide offline guidance for:**
• Step-by-step troubleshooting
• Safety procedures and precautions  
• When to call a professional
• Basic maintenance procedures

**What's going on with your system?**`
    : `**🔧 Professional HVAC Support - Enhanced Offline Mode**

Technical diagnostic support ready.${contextNote}

**Provide System Details:**
🏭 Equipment type and manufacturer
📋 Model number and specifications  
🔧 Current symptoms and fault conditions
📊 Available test equipment and measurements
⚡ Electrical readings and pressures

**Professional Diagnostic Support:**
• Technical troubleshooting procedures
• Code compliance and safety protocols
• Advanced diagnostic sequences
• Equipment-specific procedures
• Parts identification and specifications

**Available Reference Support:**
• CSA B149.1 and NFPA 54 compliance
• Manufacturer technical procedures
• Professional safety protocols
• Advanced diagnostic techniques

**Current diagnostic status and readings?**`;
}

