// netlify/functions/photo-analyzer.js  
// HVAC Jack 4.0 - Photo Analysis with Explainer Integration

const fetch = require('node-fetch');

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

    console.log('📷 HVAC Jack 4.0 photo analysis started');

    // Analyze photo with Claude Vision
    const photoAnalysis = await analyzePhotoWithClaude(imageData, query);

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
    console.error('Photo analysis error:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Photo analysis failed',
        success: false,
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

async function analyzePhotoWithClaude(imageData, query) {
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY or ANTHROPIC_API_KEY not configured');
  }

  // Remove data URL prefix if present
  const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

  const prompt = `You are HVAC Jack 4.0 analyzing this HVAC equipment photo. Provide detailed technical analysis:

**Photo Analysis Request:** ${query || 'Identify and analyze the HVAC equipment shown'}

**Analyze and provide:**

## 🔍 EQUIPMENT IDENTIFICATION
- Equipment type and category
- Brand and model number (if visible)  
- Age estimation based on design/style
- System size and capacity indicators

## ⚙️ TECHNICAL SPECIFICATIONS
- Visible model/serial numbers
- Electrical specifications (voltage, amperage)
- Refrigerant type indicators
- Efficiency ratings (SEER, AFUE, etc.)

## 🔧 CONDITION ASSESSMENT
- Overall physical condition
- Signs of wear, damage, or corrosion
- Connection and wiring condition
- Cleanliness and maintenance level

## ⚠️ POTENTIAL ISSUES
- Visible problems or concerns
- Safety hazards identified
- Code violations or improper installations
- Maintenance needs

## 📋 RECOMMENDATIONS
- Immediate actions needed
- Maintenance recommendations
- Safety concerns to address
- Further inspection points

Be specific and detailed. Reference exact observations from the photo.`;

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
    throw new Error(`Claude Vision API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'Unable to analyze photo';
}