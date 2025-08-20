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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis: photoAnalysis,
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

## 📋 RATING PLATE DATA EXTRACTION

### 🏭 MANUFACTURER INFORMATION
- Brand/Manufacturer name
- Model number (complete)
- Serial number (if visible)
- Part number(s)
- Date of manufacture/manufacture date code
- Country of origin

### ⚡ ELECTRICAL SPECIFICATIONS
- Voltage requirements (120V, 240V, etc.)
- Current draw (amperage)
- Frequency (Hz)
- Phase (1-phase, 3-phase)
- Minimum circuit ampacity (MCA)
- Maximum overcurrent protection (MOP/MOCP)
- Locked rotor amperage (LRA)
- Full load amperage (FLA)

### ❄️ REFRIGERATION DATA
- Refrigerant type (R-410A, R-22, etc.)
- Refrigerant charge amount (lbs/oz)
- System pressures (high/low side)
- Cooling capacity (BTU/hr, tons)
- Heating capacity (if applicable)

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

**FORMAT:** Present data in clear, organized sections. If any specification is partially visible or unclear, note this. Include EXACT text/numbers as they appear on the rating plate.

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