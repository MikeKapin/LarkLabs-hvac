// netlify/functions/analyze-photo.js
// Comprehensive HVAC and gas appliance rating plate analysis using Claude Vision API

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
  console.log('📸 Photo analysis function triggered');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const startTime = Date.now();
  let sessionId = null;
  let mode = 'homeowner';

  try {
    console.log('📸 Photo analysis request received');
    console.log('Raw body length:', event.body?.length || 0);
    
    if (!event.body) {
      throw new Error('No request body provided');
    }

    let requestData;
    try {
      requestData = JSON.parse(event.body);
      console.log('Request data keys:', Object.keys(requestData));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { imageData, mode: requestMode, sessionId: clientSessionId } = requestData;
    sessionId = clientSessionId || `photo_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    mode = requestMode || 'homeowner';
    
    console.log('Session ID:', sessionId);
    console.log('Mode:', mode);
    console.log('Image data length:', imageData?.length || 0);

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

    // Validate image data format (base64)
    if (!imageData.match(/^[A-Za-z0-9+/]+=*$/)) {
      await trackPhotoEvent('photo_validation_failed', sessionId, { reason: 'invalid_base64' });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid image format - must be base64 encoded',
          success: false 
        })
      };
    }

    // Track photo analysis start
    await trackPhotoEvent('photo_analysis_started', sessionId, {
      mode: mode,
      imageSize: imageData.length
    });

    // Rate limiting for photo analysis (more restrictive than chat)
    const rateLimitCheck = await checkPhotoRateLimit(event.headers['client-ip'] || event.headers['x-forwarded-for']);
    if (!rateLimitCheck.allowed) {
      await trackPhotoEvent('photo_rate_limited', sessionId, { 
        retryAfter: rateLimitCheck.retryAfter,
        ip: event.headers['client-ip'] || event.headers['x-forwarded-for']
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
    const systemPrompt = createComprehensiveAnalysisPrompt(mode);

    console.log('🔍 Sending photo to Claude API for analysis...');

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Claude API key not configured - check environment variables');
    }

    console.log('API Key configured:', apiKey ? 'Yes' : 'No');
    console.log('API Key prefix:', apiKey ? apiKey.substring(0, 8) + '...' : 'None');

    // Ensure we have node-fetch available
    let fetch;
    try {
      const nodeFetch = await import('node-fetch');
      fetch = nodeFetch.default;
    } catch (importError) {
      console.error('Failed to import node-fetch:', importError);
      // Try using global fetch (Node 18+)
      fetch = global.fetch || require('node-fetch');
    }

    if (!fetch) {
      throw new Error('No fetch implementation available');
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
                text: "Please analyze this HVAC equipment or gas appliance rating plate and provide all the information requested in the system prompt."
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

    console.log('Claude API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error response:', errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseTime = (Date.now() - startTime) / 1000;
    console.log(`✅ Claude API responded in ${responseTime}s`);

    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Invalid response format from Claude API');
    }

    const analysisResult = data.content[0].text;
    console.log('Analysis result length:', analysisResult.length);

    // Extract structured data from the analysis
    const structuredResult = extractStructuredDataFromAnalysis(analysisResult);
    console.log('✅ Structured data extracted successfully');

    // Log successful analysis to shared storage
    await logPhotoAnalysis({
      sessionId,
      timestamp: new Date().toISOString(),
      success: true,
      mode: mode,
      responseTime,
      analysisLength: analysisResult.length,
      hasStructuredData: !!structuredResult,
      ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown',
      equipmentType: structuredResult?.equipment?.type || 'unknown'
    });

    // Track successful analysis
    await trackPhotoEvent('photo_analysis_completed', sessionId, {
      responseTime,
      analysisLength: analysisResult.length,
      hasStructuredData: !!structuredResult,
      equipmentType: structuredResult?.equipment?.type || 'unknown',
      mode: mode
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
        mode: mode
      })
    };

  } catch (error) {
    const responseTime = (Date.now() - startTime) / 1000;
    console.error('❌ Photo analysis error:', error);
    console.error('Error stack:', error.stack);

    // Track failed analysis
    if (sessionId) {
      await trackPhotoEvent('photo_analysis_failed', sessionId, {
        error: error.message,
        responseTime,
        mode: mode
      });

      await logPhotoAnalysis({
        sessionId,
        timestamp: new Date().toISOString(),
        success: false,
        mode: mode,
        responseTime,
        error: error.message,
        ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown'
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
        sessionId,
        debug: {
          hasImageData: !!requestData?.imageData,
          imageDataLength: requestData?.imageData?.length || 0,
          hasApiKey: !!(process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY)
        }
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

// Comprehensive analysis prompt that handles all HVAC and gas appliances
function createComprehensiveAnalysisPrompt(mode) {
  const isHomeowner = mode === 'homeowner';
  
  return `You are HVAC Jack, a comprehensive HVAC and gas appliance expert. You've been given a photo of an equipment rating plate to analyze. This could be ANY type of HVAC equipment or gas appliance.

**EQUIPMENT TYPES TO ANALYZE:**
- HVAC: Furnaces, Air Conditioners, Heat Pumps, Boilers, Package Units, Rooftop Units
- Gas Appliances: Water Heaters (tank, tankless), Generators, Unit Heaters, Pool Heaters
- Other: Gas ranges, dryers, fireplaces, space heaters, commercial units

**COMPREHENSIVE ANALYSIS REQUIREMENTS:**

1. **EQUIPMENT IDENTIFICATION**
   - Equipment type (furnace, AC, heat pump, water heater, generator, etc.)
   - Brand/manufacturer name
   - Complete model number
   - Serial number
   - Manufacturing date/year and age calculation

2. **GAS SPECIFICATIONS** (if gas-fired)
   - Gas type (Natural Gas or Propane/LP)
   - Gas input rate (BTU/h or MBH)
   - Gas pressure requirements (inches WC)
   - Orifice specifications if visible
   - Manifold pressure requirements

3. **ELECTRICAL SPECIFICATIONS**
   - Operating voltage (120V, 240V, 208V, 480V)
   - Phase (single/three-phase)
   - Full Load Amperage (FLA)
   - Locked Rotor Amperage (LRA) if applicable
   - Minimum Circuit Ampacity (MCA)
   - Maximum Overcurrent Protection (MOCP)
   - Control circuit voltage (typically 24VAC)

4. **CAPACITOR REQUIREMENTS** (for motor-driven equipment)
   - Start capacitor specifications (MFD, voltage, tolerance)
   - Run capacitor specifications (MFD, voltage, tolerance)
   - Component assignments:
     * Compressor start/run capacitors
     * Condenser fan motor capacitor
     * Blower/indoor fan motor capacitor
     * Any auxiliary motor capacitors
   - Dual vs single capacitor configurations
   - Physical mounting requirements

5. **PERFORMANCE SPECIFICATIONS**
   - Heating/cooling capacity (BTU/h, tons)
   - Efficiency ratings (SEER, AFUE, Energy Factor, etc.)
   - Temperature rise (furnaces)
   - Recovery rate (water heaters)
   - Maximum operating pressure (boilers)
   - Refrigerant type and charge (HVAC equipment)

6. **WARRANTY INFORMATION**
   - Equipment age calculation
   - Warranty status determination (active/expired/expiring)
   - Component-specific warranty periods
   - Registration requirements
   - Warranty coverage details

7. **SAFETY & CERTIFICATIONS**
   - UL, CSA, or other safety certifications
   - Gas appliance certification numbers
   - EPA compliance (generators)
   - Electrical code compliance

**MODE-SPECIFIC RESPONSE FORMAT:**

${isHomeowner ? `
**HOMEOWNER MODE:**
- Use friendly, conversational language
- Explain technical terms clearly
- Focus on practical maintenance tips
- Emphasize safety considerations
- Provide actionable next steps
- Include cost-saving recommendations
- Warn when professional service is needed
` : `
**TECHNICIAN MODE:**
- Provide precise technical specifications
- Include diagnostic procedures
- Reference service access points
- Detail troubleshooting sequences
- Specify exact part numbers where possible
- Include known service bulletins
- Provide critical measurement points
`}

**STRUCTURED DATA OUTPUT:**
Always end your analysis with this structured format:

EQUIPMENT_TYPE: [specific equipment type]
BRAND: [manufacturer name]
MODEL: [complete model number]
SERIAL: [serial number]
MANUFACTURING_DATE: [date or year]
AGE: [calculated age in years]
GAS_TYPE: [Natural Gas/Propane/N/A]
GAS_INPUT: [BTU input rate or N/A]
ELECTRICAL: [voltage and amperage summary]
EFFICIENCY: [efficiency rating if visible]
WARRANTY_STATUS: [active/expired/expiring with details]
CAPACITORS: [list of capacitor specs if applicable]
REFRIGERANT: [type and charge if applicable]
SAFETY_NOTES: [critical safety considerations]

**CRITICAL REQUIREMENTS:**
- If information is unclear in the photo, explicitly state what needs a clearer image
- Always prioritize safety in recommendations
- Be thorough but appropriate for the selected mode (homeowner vs technician)
- Include specific maintenance recommendations for the equipment type
- Provide realistic warranty assessments based on typical industry standards

Analyze the rating plate image comprehensively and provide all relevant technical and practical information based on the mode selected.`;
}

// Enhanced structured data extraction with comprehensive equipment support
function extractStructuredDataFromAnalysis(analysisText) {
  const structuredData = {
    equipment: {},
    electrical: {},
    gas: {},
    performance: {},
    capacitors: [],
    refrigeration: {},
    safety: {},
    warranty: {},
    technicalNotes: null
  };

  try {
    // Extract basic equipment information
    const equipmentTypeMatch = analysisText.match(/EQUIPMENT_TYPE:\s*([^\n\r]+)/i);
    if (equipmentTypeMatch) structuredData.equipment.type = equipmentTypeMatch[1].trim();

    const brandMatch = analysisText.match(/BRAND:\s*([^\n\r]+)/i);
    if (brandMatch) structuredData.equipment.brand = brandMatch[1].trim();

    const modelMatch = analysisText.match(/MODEL:\s*([^\n\r]+)/i);
    if (modelMatch) structuredData.equipment.model = modelMatch[1].trim();

    const serialMatch = analysisText.match(/SERIAL:\s*([^\n\r]+)/i);
    if (serialMatch) structuredData.equipment.serial = serialMatch[1].trim();

    const mfgDateMatch = analysisText.match(/MANUFACTURING_DATE:\s*([^\n\r]+)/i);
    if (mfgDateMatch) structuredData.equipment.manufacturingDate = mfgDateMatch[1].trim();

    const ageMatch = analysisText.match(/AGE:\s*([^\n\r]+)/i);
    if (ageMatch) structuredData.equipment.age = ageMatch[1].trim();

    // Extract gas specifications
    const gasTypeMatch = analysisText.match(/GAS_TYPE:\s*([^\n\r]+)/i);
    if (gasTypeMatch) {
      const gasType = gasTypeMatch[1].trim();
      if (!gasType.includes('N/A')) {
        structuredData.gas.type = gasType;
      }
    }

    const gasInputMatch = analysisText.match(/GAS_INPUT:\s*([^\n\r]+)/i);
    if (gasInputMatch) {
      const gasInput = gasInputMatch[1].trim();
      if (!gasInput.includes('N/A')) {
        structuredData.gas.input = gasInput;
      }
    }

    // Extract electrical specifications
    const electricalMatch = analysisText.match(/ELECTRICAL:\s*([^\n\r]+)/i);
    if (electricalMatch) {
      const electrical = electricalMatch[1].trim();
      structuredData.electrical.summary = electrical;
      
      // Parse specific electrical values
      const voltageMatch = electrical.match(/(\d+)V/);
      if (voltageMatch) structuredData.electrical.voltage = voltageMatch[1] + 'V';
      
      const ampsMatch = electrical.match(/(\d+\.?\d*)\s*A/);
      if (ampsMatch) structuredData.electrical.fla = ampsMatch[1] + 'A';

      const mcaMatch = electrical.match(/MCA[:\s]*(\d+\.?\d*)/i);
      if (mcaMatch) structuredData.electrical.mca = mcaMatch[1] + 'A';

      const mocpMatch = electrical.match(/MOCP[:\s]*(\d+\.?\d*)/i);
      if (mocpMatch) structuredData.electrical.mocp = mocpMatch[1] + 'A';
    }

    // Extract efficiency rating
    const efficiencyMatch = analysisText.match(/EFFICIENCY:\s*([^\n\r]+)/i);
    if (efficiencyMatch) {
      const efficiency = efficiencyMatch[1].trim();
      if (!efficiency.includes('N/A')) {
        structuredData.performance.efficiency = efficiency;
      }
    }

    // Extract warranty information
    const warrantyMatch = analysisText.match(/WARRANTY_STATUS:\s*([^\n\r]+)/i);
    if (warrantyMatch) {
      const warrantyText = warrantyMatch[1].trim().toLowerCase();
      if (warrantyText.includes('active') || warrantyText.includes('valid')) {
        structuredData.warranty.status = 'active';
      } else if (warrantyText.includes('expired')) {
        structuredData.warranty.status = 'expired';
      } else if (warrantyText.includes('expiring')) {
        structuredData.warranty.status = 'expiring';
      }
      structuredData.warranty.coverage = warrantyMatch[1].trim();
    }

    // Extract capacitor information
    const capacitorMatch = analysisText.match(/CAPACITORS:\s*([^\n\r]+)/i);
    if (capacitorMatch) {
      const capacitorText = capacitorMatch[1].trim();
      if (!capacitorText.includes('N/A') && !capacitorText.includes('None')) {
        // Parse capacitor specifications
        const capacitorSpecs = capacitorText.match(/(\d+\.?\d*)\s*MFD.*?(\d+)V/gi);
        if (capacitorSpecs) {
          structuredData.capacitors = capacitorSpecs.map((spec, index) => {
            const mfdMatch = spec.match(/(\d+\.?\d*)\s*MFD/i);
            const voltageMatch = spec.match(/(\d+)V/i);
            return {
              component: index === 0 ? 'Compressor' : 'Fan Motor',
              mfd: mfdMatch ? mfdMatch[1] : 'Unknown',
              voltage: voltageMatch ? voltageMatch[1] : 'Unknown',
              type: 'Run'
            };
          });
        }
      }
    }

    // Extract refrigerant information
    const refrigerantMatch = analysisText.match(/REFRIGERANT:\s*([^\n\r]+)/i);
    if (refrigerantMatch) {
      const refrigerant = refrigerantMatch[1].trim();
      if (!refrigerant.includes('N/A')) {
        structuredData.refrigeration.type = refrigerant;
      }
    }

    // Extract safety notes
    const safetyMatch = analysisText.match(/SAFETY_NOTES:\s*([^\n\r]+)/i);
    if (safetyMatch) {
      structuredData.safety.notes = safetyMatch[1].trim();
    }

    // Calculate warranty status if not explicitly found but we have manufacturing date
    if (!structuredData.warranty.status && structuredData.equipment.manufacturingDate) {
      const mfgYear = extractYearFromDate(structuredData.equipment.manufacturingDate);
      if (mfgYear) {
        const warrantyInfo = calculateWarrantyStatus(mfgYear, structuredData.equipment.type);
        structuredData.warranty = { ...structuredData.warranty, ...warrantyInfo };
      }
    }

    // Determine equipment category
    structuredData.equipment.category = categorizeEquipment(structuredData.equipment.type);

  } catch (error) {
    console.warn('Error extracting structured data:', error);
  }

  return structuredData;
}

// Helper function to extract year from various date formats
function extractYearFromDate(dateString) {
  const yearMatches = dateString.match(/\b(19|20)\d{2}\b/);
  return yearMatches ? parseInt(yearMatches[0]) : null;
}

// Helper function to calculate warranty status
function calculateWarrantyStatus(mfgYear, equipmentType) {
  const currentYear = new Date().getFullYear();
  const age = currentYear - mfgYear;
  
  // Typical warranty periods by equipment type
  const warrantyPeriods = {
    'generator': 5,
    'furnace': 10,
    'water heater': 6,
    'boiler': 10,
    'heat pump': 10,
    'air conditioner': 10,
    'tankless water heater': 12,
    'unit heater': 5,
    'pool heater': 3
  };
  
  const equipmentKey = equipmentType?.toLowerCase() || '';
  let warrantyPeriod = 5; // default
  
  // Find matching warranty period
  for (const [key, period] of Object.entries(warrantyPeriods)) {
    if (equipmentKey.includes(key)) {
      warrantyPeriod = period;
      break;
    }
  }
  
  if (age < warrantyPeriod) {
    return {
      status: 'active',
      coverage: `Estimated ${warrantyPeriod - age} years remaining`
    };
  } else if (age === warrantyPeriod) {
    return {
      status: 'expiring',
      coverage: 'Warranty expiring this year'
    };
  } else {
    return {
      status: 'expired',
      coverage: `Expired ${age - warrantyPeriod} years ago`
    };
  }
}

// Helper function to determine equipment category
function categorizeEquipment(equipmentType) {
  const type = equipmentType?.toLowerCase() || '';
  
  if (type.includes('furnace')) return 'heating';
  if (type.includes('water heater')) return 'water_heating';
  if (type.includes('boiler')) return 'heating';
  if (type.includes('generator')) return 'power_generation';
  if (type.includes('air conditioner') || type.includes('heat pump')) return 'cooling';
  if (type.includes('unit heater')) return 'space_heating';
  if (type.includes('range') || type.includes('dryer') || type.includes('fireplace')) return 'appliance';
  if (type.includes('pool heater')) return 'pool_equipment';
  
  return 'hvac_general';
}
