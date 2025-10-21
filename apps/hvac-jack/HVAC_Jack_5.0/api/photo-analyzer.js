// api/photo-analyzer.js
// HVAC Jack 5.0 - Vercel Photo Analysis Function

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, query = '' } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    console.log('📷 HVAC Jack 5.0 photo analysis started (Vercel)');

    // Analyze photo with Claude Vision
    const photoAnalysis = await analyzePhotoWithClaude(imageData, query);

    return res.status(200).json({
      analysis: photoAnalysis,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Photo analysis error:', error);
    console.error('Error stack:', error.stack);

    return res.status(500).json({
      error: 'Photo analysis failed',
      success: false,
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function analyzePhotoWithClaude(imageData, query) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  console.log('🔑 API Key check:', {
    exists: !!apiKey,
    length: apiKey?.length || 0,
    prefix: apiKey?.substring(0, 7) || 'none'
  });

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured in environment variables');
  }

  // Remove data URL prefix if present
  const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

  const prompt = `You are HVAC Jack 5.0 analyzing this HVAC equipment photo. Extract all critical technical data from the rating plate:

**Photo Analysis Request:** ${query || 'Extract all rating plate and technical data'}

**Analyze and provide:**

## 🔍 EQUIPMENT IDENTIFICATION
- Equipment type and category
- Brand and model number (exact as shown)
- Serial number (exact as shown)
- Manufacturing date or code
- Age estimation based on serial number or date code
- Warranty status (calculate remaining warranty if manufacture date is visible)

## ⚙️ TECHNICAL SPECIFICATIONS
- Electrical specifications (voltage, phase, amperage, Hz)
- Refrigerant type and charge amount
- BTU/Tonnage capacity
- Efficiency ratings (SEER, AFUE, EER, etc.)
- Compressor specifications (RLA, LRA, part number if visible)
- Fan motor specifications (HP, RPM, amperage)
- **CAPACITOR REQUIREMENTS:**
  - Compressor capacitor: MFD rating and voltage
  - Fan motor capacitor: MFD rating and voltage
  - Dual or single run capacitor configuration

## 🔧 COMMON REPLACEMENT PARTS
Based on the brand and model identified, provide:
- **Capacitor:** Part number, MFD rating, voltage (for both compressor and fan motor)
- **Contactor Relay:** Part number, amperage rating, coil voltage
- **Time Delay Relay:** Part number (if applicable for this model)
- Other commonly replaced components specific to this model

## 📋 ADDITIONAL TECHNICAL DATA
- Any other rating plate data visible
- Component specifications from labels
- Wiring diagram references if visible

**IMPORTANT:** Focus on extracting exact technical data from the rating plate. Do NOT assess physical condition, cleanliness, or cosmetic wear. Do NOT make maintenance recommendations. Only provide factual data visible on labels and rating plates.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2500,
      temperature: 0.2,
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
    const errorBody = await response.text();
    console.error('❌ Claude API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      body: errorBody
    });
    throw new Error(`Claude Vision API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'Unable to analyze photo';
}