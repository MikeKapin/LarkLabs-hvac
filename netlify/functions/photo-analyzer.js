// netlify/functions/photo-analyzer.js  
// HVAC Jack 4.0 - Photo Analysis with Rating Plate Data Extraction

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
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
    const { imageData, query = '' } = JSON.parse(event.body || '{}');

    if (!imageData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image data is required' })
      };
    }

    console.log('📷 HVAC Jack 4.0 rating plate analysis started');

    // Analyze photo with Claude Vision for rating plate data
    const photoAnalysis = await analyzeRatingPlateWithClaude(imageData, query);
    
    // Extract equipment details for capacitor lookup
    const equipmentDetails = await extractEquipmentDetails(imageData);
    
    // Perform capacitor database lookup if needed
    const capacitorInfo = await performCapacitorLookup(equipmentDetails);
    
    // Combine analysis with capacitor database results
    const enhancedAnalysis = await enhanceWithCapacitorData(photoAnalysis, capacitorInfo);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis: enhancedAnalysis,
        success: true,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Rating plate analysis error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Rating plate analysis failed',
        success: false
      })
    };
  }
};

async function analyzeRatingPlateWithClaude(imageData, query) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Remove data URL prefix if present
  const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

  const prompt = `You are HVAC Jack 4.0's Rating Plate Data Extraction Expert. Extract ALL visible technical data from this HVAC equipment photo.

**CRITICAL INSTRUCTION:** Read every visible number, letter, and specification on the rating plate(s). Provide complete technical documentation.

**IMPORTANT:** Always start with the primary equipment identification section showing Make, Model, and Serial Number prominently at the top.

## 📋 RATING PLATE DATA EXTRACTION

### 🏷️ EQUIPMENT IDENTIFICATION (PRIMARY)
**Make:** [Extract exact brand/manufacturer name]
**Model:** [Extract complete model number]  
**Serial Number:** [Extract full serial number if visible]
**Equipment Type:** [Specify: Air Conditioner, Heat Pump, Furnace, etc.]

### 🏭 DETAILED MANUFACTURER INFORMATION
- Complete brand/manufacturer name
- Full model number with all characters/digits
- Complete serial number
- Part number(s) and sub-model designations
- Date of manufacture/manufacture date code
- Country of origin
- Manufacturing facility code (if visible)

### ⚡ ELECTRICAL SPECIFICATIONS
- Voltage requirements (120V, 240V, etc.)
- Current draw (amperage)
- Frequency (Hz)
- Phase (1-phase, 3-phase)
- Minimum circuit ampacity (MCA)
- Maximum overcurrent protection (MOP/MOCP)
- Locked rotor amperage (LRA)
- Full load amperage (FLA)

### ❄️ REFRIGERATION DATA (Air Conditioners/Heat Pumps)
- Refrigerant type (R-410A, R-22, etc.)
- Refrigerant charge amount (lbs/oz)
- System pressures (high/low side)
- Cooling capacity (BTU/hr, tons)
- Heating capacity (if applicable)

### 🔥 FURNACE DATA (If Furnace Equipment)
- Input BTU/hr rating
- Output BTU/hr rating  
- Temperature rise range (°F)
- Maximum temperature rise
- Minimum temperature rise
- Recommended temperature rise
- Gas input rating (if gas furnace)
- Manifold pressure specifications
- Orifice size specifications

### 📊 EFFICIENCY RATINGS
- SEER rating
- EER rating  
- HSPF rating (heat pumps)
- AFUE rating (furnaces)
- Energy Star certification
- AHRI certification number

### 🔧 PHYSICAL SPECIFICATIONS
- Unit dimensions (if listed)
- Weight specifications
- Airflow ratings (CFM)
- External static pressure ratings
- Sound level ratings (dB)

### 🛡️ SAFETY & COMPLIANCE
- UL listing numbers
- CSA certifications
- EPA compliance stamps
- DOE compliance information
- Any warning labels or cautions

### 💡 COMPONENT SPECIFICATIONS
- Compressor specifications
- Fan motor specifications
- Heat exchanger details
- Filter specifications
- Control system information

### 🔌 CAPACITOR REQUIREMENTS
Based on the equipment specifications visible:
- Fan motor capacitor size (μF and voltage rating)
- Compressor start capacitor requirements
- Run capacitor specifications
- Dual capacitor ratings if applicable
- Hard start kit requirements (if needed)

### 🛡️ WARRANTY INFORMATION
Based on manufacturer and model data:
- Standard warranty period for this equipment type
- Parts warranty coverage
- Labor warranty (if applicable) 
- Extended warranty options typically available
- Warranty registration requirements
- Age-based warranty status (if manufacture date visible)

### 📅 EQUIPMENT AGE & STATUS
- Manufacture date analysis
- Estimated equipment age
- Expected service life remaining
- Maintenance schedule recommendations
- Common issues for this age/model

**FORMAT:** Present data in clear, organized sections. If any specification is partially visible or unclear, note this. Include EXACT text/numbers as they appear on the rating plate.

**CAPACITOR DATABASE LOOKUP:** If specific capacitor information isn't clearly visible on the rating plate, reference the built-in capacitor database for this brand/model combination.

**IMPORTANT:** This is for professional technician reference - include every visible technical detail no matter how small.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude Vision API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'Unable to analyze rating plate';
}

// Extract basic equipment details for capacitor lookup
async function extractEquipmentDetails(imageData) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ONLY the brand, model number, and equipment type from this HVAC equipment photo. Format as JSON: {"brand": "...", "model": "...", "type": "..."}'
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    console.log('Equipment extraction failed, using defaults');
    return { brand: 'Unknown', model: 'Unknown', type: 'Air Conditioner' };
  }

  try {
    const data = await response.json();
    const text = data.content[0]?.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.log('JSON parse error, using defaults:', error);
    return { brand: 'Unknown', model: 'Unknown', type: 'Air Conditioner' };
  }
}

// Capacitor database lookup
async function performCapacitorLookup(equipmentDetails) {
  // Built-in capacitor database
  const capacitorDatabase = {
    'Trane': {
      'XR13': { fanMotor: '5μF 370V', compressor: '30/5μF 440V', type: 'dual' },
      'XR16': { fanMotor: '7.5μF 370V', compressor: '35/5μF 440V', type: 'dual' },
      'XL16i': { fanMotor: '10μF 370V', compressor: '40/5μF 440V', type: 'dual' }
    },
    'Carrier': {
      '24ACC6': { fanMotor: '5μF 370V', compressor: '30/5μF 440V', type: 'dual' },
      '24ABB3': { fanMotor: '7.5μF 370V', compressor: '35/5μF 440V', type: 'dual' },
      '25HCB6': { fanMotor: '10μF 370V', compressor: '45/5μF 440V', type: 'dual' }
    },
    'Lennox': {
      '13ACX': { fanMotor: '5μF 370V', compressor: '30/5μF 440V', type: 'dual' },
      '14ACX': { fanMotor: '7.5μF 370V', compressor: '35/5μF 440V', type: 'dual' },
      'XC16': { fanMotor: '10μF 370V', compressor: '40/5μF 440V', type: 'dual' }
    },
    'Rheem': {
      'RA13': { fanMotor: '5μF 370V', compressor: '30/5μF 440V', type: 'dual' },
      'RA16': { fanMotor: '7.5μF 370V', compressor: '35/5μF 440V', type: 'dual' },
      'RP16': { fanMotor: '10μF 370V', compressor: '40/5μF 440V', type: 'dual' }
    },
    'Goodman': {
      'GSX13': { fanMotor: '5μF 370V', compressor: '25/5μF 440V', type: 'dual' },
      'GSX16': { fanMotor: '7.5μF 370V', compressor: '30/5μF 440V', type: 'dual' },
      'GSXC16': { fanMotor: '10μF 370V', compressor: '35/5μF 440V', type: 'dual' }
    }
  };

  const brand = equipmentDetails.brand;
  const model = equipmentDetails.model;
  
  // Try exact brand match
  if (capacitorDatabase[brand]) {
    // Try exact model match
    if (capacitorDatabase[brand][model]) {
      return {
        found: true,
        source: 'exact_match',
        data: capacitorDatabase[brand][model]
      };
    }
    
    // Try partial model match
    for (const dbModel in capacitorDatabase[brand]) {
      if (model.includes(dbModel) || dbModel.includes(model.substring(0, 6))) {
        return {
          found: true,
          source: 'partial_match',
          data: capacitorDatabase[brand][dbModel]
        };
      }
    }
  }

  // Return generic defaults based on equipment type
  const type = equipmentDetails.type?.toLowerCase();
  if (type?.includes('heat pump')) {
    return {
      found: false,
      source: 'generic_heat_pump',
      data: { fanMotor: '7.5μF 370V', compressor: '35/5μF 440V', type: 'dual' }
    };
  } else {
    return {
      found: false,
      source: 'generic_ac',
      data: { fanMotor: '5μF 370V', compressor: '30/5μF 440V', type: 'dual' }
    };
  }
}

// Calculate warranty information
function calculateWarranty(brand, manufactureDateString, equipmentType) {
  const warrantyPeriods = {
    'Trane': { parts: 10, compressor: 10, labor: 1 },
    'Carrier': { parts: 10, compressor: 10, labor: 1 },
    'Lennox': { parts: 10, compressor: 10, labor: 1 },
    'Rheem': { parts: 10, compressor: 10, labor: 1 },
    'Goodman': { parts: 10, compressor: 10, labor: 1 },
    'York': { parts: 10, compressor: 10, labor: 1 },
    'American Standard': { parts: 10, compressor: 10, labor: 1 }
  };

  const defaultWarranty = { parts: 5, compressor: 5, labor: 1 };
  const warranty = warrantyPeriods[brand] || defaultWarranty;

  let manufactureDate = null;
  let age = 'Unknown';
  let status = 'Contact manufacturer for warranty verification';

  // Try to parse manufacture date
  if (manufactureDateString) {
    const datePatterns = [
      /(\d{4})/,  // 4-digit year
      /(\d{2})(\d{2})/,  // MMYY or YYMM
      /(\d{1,2})\/(\d{4})/,  // MM/YYYY
    ];

    for (const pattern of datePatterns) {
      const match = manufactureDateString.match(pattern);
      if (match) {
        let year = parseInt(match[1]);
        if (year < 100) year += 2000;  // Convert 2-digit to 4-digit year
        if (year > 1990 && year <= new Date().getFullYear()) {
          manufactureDate = new Date(year, 0, 1);
          break;
        }
      }
    }
  }

  if (manufactureDate) {
    const currentDate = new Date();
    const ageYears = Math.floor((currentDate - manufactureDate) / (365.25 * 24 * 60 * 60 * 1000));
    age = `${ageYears} years`;

    if (ageYears <= warranty.parts) {
      status = `✅ Likely under parts warranty (${warranty.parts} years)`;
    } else {
      status = `❌ Likely out of parts warranty (${warranty.parts} years expired)`;
    }
  }

  return {
    partsWarranty: `${warranty.parts} years`,
    compressorWarranty: `${warranty.compressor} years`,
    laborWarranty: `${warranty.labor} year`,
    equipmentAge: age,
    warrantyStatus: status,
    registrationRequired: 'Yes - register within 90 days for full coverage'
  };
}

// Enhance analysis with capacitor data
async function enhanceWithCapacitorData(originalAnalysis, capacitorInfo) {
  const enhancementPrompt = `Enhance the following HVAC rating plate analysis with specific capacitor and warranty information:

ORIGINAL ANALYSIS:
${originalAnalysis}

CAPACITOR DATABASE RESULT:
Source: ${capacitorInfo.source}
Found: ${capacitorInfo.found}
Fan Motor Capacitor: ${capacitorInfo.data.fanMotor}
Compressor Capacitor: ${capacitorInfo.data.compressor}
Type: ${capacitorInfo.data.type}

INSTRUCTIONS:
1. Add a comprehensive "🔌 CAPACITOR REQUIREMENTS" section with the specific capacitor data
2. If source is "exact_match" or "partial_match", note high confidence
3. If source is "generic", note that this is estimated based on equipment type
4. Add installation notes and safety warnings
5. Include part ordering information

Format the enhanced analysis maintaining all original information while adding the capacitor details seamlessly.`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.2,
      messages: [
        { role: 'user', content: enhancementPrompt }
      ]
    })
  });

  if (!response.ok) {
    console.log('Enhancement failed, returning original analysis');
    return originalAnalysis;
  }

  const data = await response.json();
  return data.content[0]?.text || originalAnalysis;
}