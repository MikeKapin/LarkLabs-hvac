// netlify/functions/analyze-photo.js
// Photo analysis endpoint using Claude Vision API for HVAC rating plate analysis

// Initialize shared storage for tracking photo analyses
global.usageStore = global.usageStore || {
  sessions: new Map(),
  messages: [],
  blockedContent: [],
  events: [],
  dailyStats: new Map(),
  photoAnalyses: []
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const startTime = Date.now();
  let sessionId = null;

  try {
    console.log('📸 Photo analysis request received');
    
    const { imageData, mode, sessionId: clientSessionId } = JSON.parse(event.body);
    sessionId = clientSessionId || `photo_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!imageData) {
      await trackPhotoEvent('photo_validation_failed', sessionId, { reason: 'missing_image_data' });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing image data',
          success: false 
        })
      };
    }

    // Validate image data format
    if (!imageData.match(/^[A-Za-z0-9+/]+={0,2}$/)) {
      await trackPhotoEvent('photo_validation_failed', sessionId, { reason: 'invalid_base64' });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid image format',
          success: false 
        })
      };
    }

    // Track photo analysis start
    await trackPhotoEvent('photo_analysis_started', sessionId, {
      mode: mode || 'homeowner',
      imageSize: imageData.length
    });

    // Rate limiting for photo analysis (more restrictive than chat)
    const rateLimitCheck = await checkPhotoRateLimit(event.headers['client-ip']);
    if (!rateLimitCheck.allowed) {
      await trackPhotoEvent('photo_rate_limited', sessionId, { 
        retryAfter: rateLimitCheck.retryAfter,
        ip: event.headers['client-ip']
      });
      
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Too many photo analysis requests. Please wait before uploading another photo.',
          retryAfter: rateLimitCheck.retryAfter,
          success: false
        })
      };
    }

    // Create the analysis prompt based on mode
    const systemPrompt = mode === 'technician' ? 
      createTechnicianAnalysisPrompt() : 
      createHomeownerAnalysisPrompt();

    console.log('🔍 Sending photo to Claude API for analysis...');

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
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
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this HVAC equipment rating plate and provide all the information requested in the system prompt."
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageData
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseTime = (Date.now() - startTime) / 1000;
    console.log(`✅ Claude API responded in ${responseTime}s`);

    const analysisResult = data.content[0].text;

    // Try to parse structured data if present
    let structuredResult;
    try {
      const jsonMatch = analysisResult.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        structuredResult = JSON.parse(jsonMatch[1]);
      }
    } catch (parseError) {
      console.log('Response is not JSON, treating as text');
    }

    // Log successful analysis to shared storage
    await logPhotoAnalysis({
      sessionId,
      timestamp: new Date().toISOString(),
      success: true,
      mode: mode || 'homeowner',
      responseTime,
      analysisLength: analysisResult.length,
      hasStructuredData: !!structuredResult,
      ip: event.headers['client-ip'] || 'unknown',
      equipmentType: structuredResult?.equipment?.type || 'unknown'
    });

    // Track successful analysis
    await trackPhotoEvent('photo_analysis_completed', sessionId, {
      responseTime,
      analysisLength: analysisResult.length,
      hasStructuredData: !!structuredResult,
      equipmentType: structuredResult?.equipment?.type || 'unknown',
      mode: mode || 'homeowner'
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        analysis: analysisResult,
        structuredData: structuredResult,
        responseTime,
        sessionId,
        timestamp: new Date().toISOString(),
        mode: mode || 'homeowner'
      })
    };

  } catch (error) {
    const responseTime = (Date.now() - startTime) / 1000;
    console.error('❌ Photo analysis error:', error);

    // Track failed analysis
    if (sessionId) {
      await trackPhotoEvent('photo_analysis_failed', sessionId, {
        error: error.message,
        responseTime,
        mode: mode || 'homeowner'
      });

      await logPhotoAnalysis({
        sessionId,
        timestamp: new Date().toISOString(),
        success: false,
        mode: mode || 'homeowner',
        responseTime,
        error: error.message,
        ip: event.headers['client-ip'] || 'unknown'
      });
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Photo analysis failed',
        message: error.message,
        fallback: true,
        sessionId
      })
    };
  }
};

// Helper function to track photo analysis events
async function trackPhotoEvent(eventType, sessionId, data) {
  try {
    const store = global.usageStore;
    
    const event = {
      eventType,
      sessionId,
      timestamp: new Date().toISOString(),
      data: data || {}
    };

    store.events = store.events || [];
    store.events.push(event);

    // Keep only last 1000 events
    if (store.events.length > 1000) {
      store.events = store.events.slice(-1000);
    }

    console.log(`📊 Photo Event: ${eventType}`, {
      sessionId,
      ...data
    });
  } catch (error) {
    console.warn('Failed to track photo event:', error);
  }
}

// Rate limiting specifically for photo analysis (more restrictive)
const photoRateLimitStore = new Map();

async function checkPhotoRateLimit(ip) {
  try {
    const key = ip || 'unknown';
    const now = Date.now();
    const windowMs = 300000; // 5 minutes
    const maxRequests = 10; // 10 photo analyses per 5 minutes

    if (!photoRateLimitStore.has(key)) {
      photoRateLimitStore.set(key, []);
    }

    const requests = photoRateLimitStore.get(key);
    
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
    photoRateLimitStore.set(key, validRequests);

    return { allowed: true };
  } catch (error) {
    console.warn('Rate limit check failed:', error);
    return { allowed: true }; // Allow on error
  }
}

// Log photo analysis to shared storage
async function logPhotoAnalysis(data) {
  try {
    const store = global.usageStore;
    
    store.photoAnalyses = store.photoAnalyses || [];
    store.photoAnalyses.push({
      sessionId: data.sessionId,
      timestamp: data.timestamp,
      success: data.success,
      mode: data.mode,
      responseTime: data.responseTime,
      error: data.error || null,
      equipmentType: data.equipmentType || 'unknown',
      ip: data.ip,
      analysisLength: data.analysisLength || 0,
      hasStructuredData: data.hasStructuredData || false
    });

    // Keep only last 200 photo analyses
    if (store.photoAnalyses.length > 200) {
      store.photoAnalyses = store.photoAnalyses.slice(-200);
    }

    console.log('📸 Photo Analysis Logged:', {
      sessionId: data.sessionId,
      success: data.success,
      mode: data.mode,
      responseTime: data.responseTime,
      equipmentType: data.equipmentType,
      error: data.error
    });
  } catch (error) {
    console.warn('Failed to log photo analysis:', error);
  }
}

function createHomeownerAnalysisPrompt() {
  return `You are HVAC Jack, a friendly and knowledgeable HVAC expert helping homeowners. You've been given a photo of an HVAC equipment rating plate to analyze.

TASK: Analyze the rating plate photo and provide comprehensive information in a helpful, easy-to-understand format for homeowners.

ANALYSIS REQUIREMENTS:
1. **Equipment Identification**
   - Brand and model number
   - Equipment type (furnace, AC, heat pump, etc.)
   - Manufacturing date and age calculation
   - Serial number

2. **Warranty Information**
   - Calculate equipment age from manufacturing date or serial number
   - Determine warranty status (active/expired/expiring soon)
   - Explain typical warranty coverage
   - Provide warranty recommendations

3. **Capacitor Requirements**
   - List ALL capacitors needed for this specific equipment
   - Include exact specifications (MFD, voltage, round/oval type)
   - Identify which component each capacitor serves (compressor, fan, blower)
   - Mention typical capacitor lifespan and replacement signs

4. **Key Electrical Specs**
   - Voltage requirements
   - Amperage draw
   - Refrigerant type (if applicable)
   - Energy efficiency ratings (SEER, AFUE, etc.)

5. **Homeowner Tips**
   - Maintenance recommendations specific to this equipment
   - Warning signs to watch for
   - When to call a professional vs DIY
   - Safety considerations for this specific unit

RESPONSE FORMAT:
- Start with a friendly greeting acknowledging the photo analysis
- Organize information with clear headers and bullet points
- Use simple language and explain technical terms
- Include practical tips and actionable recommendations
- End with helpful next steps

IMPORTANT NOTES:
- If you cannot read certain information clearly, say so and explain what areas need a clearer photo
- Focus on being helpful and educational for a non-technical audience
- Always prioritize safety in your recommendations
- Be thorough but conversational - this is for a homeowner who wants to understand their equipment

Analyze the rating plate image and provide comprehensive, homeowner-friendly information following the requirements above.`;
}

function createTechnicianAnalysisPrompt() {
  return `You are HVAC Jack in technician mode, providing detailed technical analysis for HVAC professionals. You've been given a photo of an HVAC equipment rating plate to analyze.

TASK: Perform comprehensive technical analysis of the rating plate with precise specifications and diagnostic information for field technicians.

TECHNICAL ANALYSIS REQUIREMENTS:
1. **Equipment Specifications**
   - Complete model and serial number breakdown with meaning
   - Manufacturing date decoding methodology
   - Equipment series, efficiency ratings, and capacity specifications
   - Tonnage, BTU ratings, and performance specifications

2. **Electrical Specifications**
   - Operating voltage and phase requirements
   - Full load amperage (FLA) for all components
   - Locked rotor amperage (LRA) where applicable
   - Minimum circuit ampacity (MCA)
   - Maximum overcurrent protection (MOCP)
   - Control circuit voltage

3. **Capacitor Specifications (CRITICAL)**
   - Start capacitor: exact MFD, voltage, tolerance, and application
   - Run capacitor: exact MFD, voltage, tolerance, and application
   - Component-specific requirements:
     * Compressor start/run capacitors with exact specs
     * Condenser fan motor capacitor specifications
     * Blower motor capacitor (indoor unit)
     * Any auxiliary motor capacitors
   - Dual vs single capacitor configurations
   - Tolerance specifications (+/- percentages)
   - Physical mounting and connection details

4. **Refrigeration Data (if applicable)**
   - Refrigerant type and factory charge amount
   - Design operating pressures (high/low side)
   - Superheat/subcooling target specifications
   - Expansion device type and specifications

5. **Warranty and Service Information**
   - Manufacturing date interpretation methods
   - Warranty period breakdown by component type
   - Service access and connection requirements
   - Parts availability and cross-reference information

6. **Diagnostic and Service Considerations**
   - Common failure points specific to this model
   - Recommended troubleshooting sequence
   - Critical test points and measurement locations
   - Known service bulletins or common issues
   - Replacement part numbers where identifiable

RESPONSE FORMAT:
First provide a structured JSON summary:
\`\`\`json
{
  "equipment": {
    "brand": "",
    "model": "",
    "serial": "",
    "type": "",
    "manufacturingDate": "",
    "age": "",
    "capacity": "",
    "efficiency": ""
  },
  "electrical": {
    "voltage": "",
    "phase": "",
    "fla": "",
    "lra": "",
    "mca": "",
    "mocp": "",
    "controlVoltage": ""
  },
  "capacitors": [
    {
      "component": "",
      "mfd": "",
      "voltage": "",
      "type": "",
      "tolerance": "",
      "mounting": ""
    }
  ],
  "refrigeration": {
    "type": "",
    "charge": "",
    "highSidePressure": "",
    "lowSidePressure": "",
    "superheat": "",
    "subcooling": ""
  },
  "warranty": {
    "status": "",
    "remaining": "",
    "coverage": ""
  }
}
\`\`\`

Then provide detailed technical commentary including:
- Precise diagnostic procedures for this model
- Service access instructions
- Critical measurement points and expected values
- Troubleshooting sequence recommendations
- Safety protocols specific to this equipment
- Parts ordering information

CRITICAL: Be extremely precise with specifications. Field technicians rely on exact values for proper service and parts ordering. Include all technical details a professional would need for diagnosis, service, and parts replacement.

Analyze the rating plate image and provide complete technical specifications and service information.`;
}
