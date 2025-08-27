// netlify/functions/photo-analyzer-v5.js  
// HVAC Jack 5.0 - Enhanced Photo Analysis Bridge to Python FastAPI Backend

const axios = require('axios');

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
    const { imageData, query = '', analysisType = 'rating_plate' } = JSON.parse(event.body || '{}');

    if (!imageData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image data is required' })
      };
    }

    console.log('📷 HVAC Jack 5.0 photo analysis started - Type:', analysisType);

    // Try Python backend first for enhanced analysis
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    try {
      // Convert base64 image data to FormData for Python backend
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Create FormData equivalent for multipart upload
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', buffer, {
        filename: 'rating_plate.jpg',
        contentType: 'image/jpeg'
      });

      console.log('🐍 Calling Python backend for enhanced photo analysis...');
      console.log('Backend URL:', pythonBackendUrl);
      
      const response = await axios.post(
        `${pythonBackendUrl}/api/v1/analyze-rating-plate`,
        formData,
        {
          timeout: 90000, // 90 second timeout to handle Render cold starts
          headers: {
            ...formData.getHeaders()
          }
        }
      );

      console.log('✅ Python backend responded with status:', response.status);
      const pythonAnalysis = response.data;
      console.log('📊 Python analysis data keys:', Object.keys(pythonAnalysis));

      // Use raw GPT-4o analysis directly - NO FILTERING
      const enhancedAnalysis = pythonAnalysis.raw_analysis || pythonAnalysis;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          analysis: enhancedAnalysis,
          success: true,
          timestamp: new Date().toISOString(),
          version: '5.0',
          analysisType: 'enhanced_python_backend',
          structuredData: pythonAnalysis,
          confidence: calculateConfidenceScore(pythonAnalysis)
        })
      };

    } catch (pythonError) {
      console.error('🔄 Python backend failed:', pythonError.message);
      console.error('Python backend URL:', pythonBackendUrl);
      console.error('Error status:', pythonError.response?.status);
      console.error('Error data:', pythonError.response?.data);
      
      console.log('Attempting Claude fallback...');
      
      // Fallback to basic Claude Vision analysis
      const fallbackAnalysis = await analyzeWithClaudeFallback(imageData, query);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          analysis: fallbackAnalysis,
          success: true,
          timestamp: new Date().toISOString(),
          version: '5.0-fallback',
          analysisType: 'claude_vision_fallback',
          fallback: true,
          fallbackReason: 'python_backend_unavailable'
        })
      };
    }

  } catch (error) {
    console.error('📷 HVAC Jack 5.0 photo analysis error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Photo analysis failed',
        success: false,
        message: 'Unable to analyze the image at this time. Please try again or ensure the image is clear and well-lit.'
      })
    };
  }
};

function formatEnhancedPhotoAnalysis(pythonData, originalQuery) {
  // If we have raw_analysis from GPT-4o, use it directly (like 4.0 does)
  if (pythonData.raw_analysis) {
    let analysis = `# 📷 HVAC Jack 5.0 Enhanced Photo Analysis (GPT-4o Vision)\n\n`;
    
    if (originalQuery) {
      analysis += `**Analysis Request:** ${originalQuery}\n\n`;
    }
    
    analysis += pythonData.raw_analysis;
    return analysis;
  }
  
  // Fallback to structured format if no raw analysis
  let analysis = `# 📷 HVAC Jack 5.0 Enhanced Photo Analysis\n\n`;
  
  if (originalQuery) {
    analysis += `**Analysis Request:** ${originalQuery}\n\n`;
  }

  // Equipment Identification
  analysis += `## 🔍 Equipment Identification\n`;
  if (pythonData.manufacturer) {
    analysis += `**Manufacturer:** ${pythonData.manufacturer}\n`;
  }
  if (pythonData.model_number) {
    analysis += `**Model Number:** ${pythonData.model_number}\n`;
  }
  if (pythonData.serial_number) {
    analysis += `**Serial Number:** ${pythonData.serial_number}\n`;
  }
  if (pythonData.year_manufactured) {
    analysis += `**Year Manufactured:** ${pythonData.year_manufactured}\n`;
  }
  analysis += `\n`;

  // Technical Specifications
  analysis += `## ⚙️ Technical Specifications\n`;
  if (pythonData.capacity_btuh) {
    analysis += `**Capacity:** ${pythonData.capacity_btuh.toLocaleString()} BTU/h\n`;
  }
  if (pythonData.refrigerant_type) {
    analysis += `**Refrigerant Type:** ${pythonData.refrigerant_type}\n`;
  }
  
  if (pythonData.electrical_specs) {
    analysis += `**Electrical Specifications:**\n`;
    Object.entries(pythonData.electrical_specs).forEach(([key, value]) => {
      analysis += `  • ${key}: ${value}\n`;
    });
  }
  
  if (pythonData.gas_specs) {
    analysis += `**Gas Specifications:**\n`;
    Object.entries(pythonData.gas_specs).forEach(([key, value]) => {
      analysis += `  • ${key}: ${value}\n`;
    });
  }
  analysis += `\n`;

  // Professional Insights
  analysis += `## 💡 Professional Insights\n`;
  
  if (pythonData.year_manufactured) {
    const age = new Date().getFullYear() - pythonData.year_manufactured;
    analysis += `**Equipment Age:** Approximately ${age} years old\n`;
    
    if (age > 15) {
      analysis += `⚠️ **Age Alert:** This equipment is over 15 years old and may be approaching end-of-life.\n`;
    } else if (age > 10) {
      analysis += `📋 **Maintenance Note:** This equipment is in its mature operational phase - regular maintenance critical.\n`;
    }
  }
  
  if (pythonData.refrigerant_type) {
    if (pythonData.refrigerant_type.toLowerCase().includes('r-22')) {
      analysis += `🚨 **R-22 Alert:** This system uses R-22 refrigerant, which is no longer produced. Plan for replacement.\n`;
    } else if (pythonData.refrigerant_type.toLowerCase().includes('r-410a')) {
      analysis += `✅ **Refrigerant Note:** Uses R-410A - currently available but being phased out by 2025.\n`;
    }
  }
  
  analysis += `\n## 🔧 Maintenance Recommendations\n`;
  analysis += `Based on the equipment identified:\n`;
  analysis += `• Verify all specifications match your current system requirements\n`;
  analysis += `• Check warranty status if equipment is less than 10 years old\n`;
  analysis += `• Schedule preventive maintenance according to manufacturer guidelines\n`;
  
  if (pythonData.model_number) {
    analysis += `• Look up technical service bulletins for model ${pythonData.model_number}\n`;
  }
  
  analysis += `\n---\n*HVAC Jack 5.0 Enhanced Analysis - Professional-grade equipment identification*`;
  
  return analysis;
}

function calculateConfidenceScore(data) {
  let score = 0;
  const weights = {
    model_number: 25,
    serial_number: 20,
    manufacturer: 20,
    capacity_btuh: 15,
    refrigerant_type: 10,
    electrical_specs: 5,
    year_manufactured: 5
  };
  
  Object.entries(weights).forEach(([field, weight]) => {
    if (data[field] && data[field] !== 'Unknown' && data[field] !== null) {
      score += weight;
    }
  });
  
  return Math.min(score, 100); // Cap at 100%
}

async function analyzeWithClaudeFallback(imageData, query) {
  // Fallback to Claude Vision API when Python backend is unavailable
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('Neither Python backend nor Claude API is available');
  }

  const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

  const prompt = `HVAC Jack 5.0 Fallback Photo Analysis

Analyze this HVAC equipment photo and provide professional technical analysis:

**Analysis Request:** ${query || 'Identify and analyze the HVAC equipment shown'}

**Provide detailed analysis including:**

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

## 📋 PROFESSIONAL RECOMMENDATIONS
- Immediate actions needed
- Maintenance recommendations
- Safety concerns to address
- Further inspection points

Be specific and reference exact observations from the photo. Include professional-level technical details.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.3,
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
    return data.content[0]?.text || 'Unable to analyze photo with fallback method';

  } catch (error) {
    console.error('Claude fallback analysis error:', error);
    return `# 📷 HVAC Jack 5.0 Photo Analysis (Limited)

Unfortunately, both the enhanced Python backend and fallback analysis systems are currently unavailable.

## Basic Assessment
- **Image Received:** Successfully processed image data
- **Analysis Status:** Limited due to system unavailability
- **Recommended Action:** Please try again in a few minutes

## Alternative Options
1. Try uploading the image again in a few minutes
2. Ensure the image is clear and well-lit
3. Focus on the rating plate or equipment label
4. Contact a local HVAC professional for immediate assistance

---
*HVAC Jack 5.0 - Systems will be restored shortly*`;
  }
}