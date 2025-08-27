// netlify/functions/hvac-jack-v5.js
// HVAC Jack 5.0 - Main AI Assistant Bridge to Python FastAPI Backend

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

  const startTime = Date.now();

  try {
    const { 
      message, 
      sessionId,
      photoData,
      photoAnalysisData,
      conversationHistory = [],
      timestamp,
      systemType,
      issueCategory,
      actionsTaken,
      measurementsTaken,
      systemAge,
      userExperienceLevel = "expert"
    } = JSON.parse(event.body || '{}');

    console.log('🔧 HVAC Jack 5.0 request:', {
      messageLength: message?.length,
      hasPhoto: !!photoData,
      hasPhotoAnalysis: !!photoAnalysisData,
      conversationItems: conversationHistory.length,
      sessionId,
      systemType,
      issueCategory,
      timestamp
    });

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Prepare request for Python FastAPI backend
    const pythonRequest = {
      user_id: event.headers['x-user-id'] || 'anonymous_user',
      session_id: sessionId || 'default_session',
      system_type: systemType,
      rating_plate_data: photoAnalysisData ? parseRatingPlateData(photoAnalysisData) : null,
      system_age: systemAge,
      issue_category: issueCategory,
      symptoms: message,
      when_occurred: timestamp,
      environmental_conditions: null, // Could be extracted from message
      user_experience_level: userExperienceLevel,
      actions_taken: actionsTaken || [],
      measurements_taken: measurementsTaken || {},
      conversation_history: conversationHistory.map(item => ({
        user: item.type === 'user_question' ? item.content : '',
        assistant: item.type === 'ai_response' ? item.content : ''
      }))
    };

    console.log('🐍 Calling HVAC Jack 5.0 Python backend...');
    
    // Call Python FastAPI backend
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    const response = await axios.post(`${pythonBackendUrl}/api/v1/troubleshoot`, pythonRequest, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PYTHON_API_KEY || 'development'}`
      }
    });

    const pythonResponse = response.data;

    // Transform Python response to match frontend expectations
    const transformedResponse = {
      response: formatProfessionalResponse(pythonResponse),
      success: true,
      processingTime: (Date.now() - startTime) / 1000,
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      version: '5.0',
      
      // Enhanced 5.0 features
      structuredData: {
        safetyWarnings: pythonResponse.safety_warnings || [],
        urgencyLevel: pythonResponse.urgency_level || 'routine',
        immediateActions: pythonResponse.immediate_actions || [],
        diagnosticQuestions: pythonResponse.diagnostic_questions || [],
        likelyCauses: pythonResponse.likely_causes || [],
        recommendedTests: pythonResponse.recommended_tests || [],
        partsNeeded: pythonResponse.parts_potentially_needed || [],
        photoRequests: pythonResponse.photo_requests || [],
        estimatedTime: pythonResponse.estimated_time,
        requiresProfessional: pythonResponse.requires_professional || false,
        manufacturerNotes: pythonResponse.manufacturer_notes || []
      },
      
      // Metadata for analytics
      metadata: {
        responseId: pythonResponse.response_id,
        aiModel: 'GPT-4-HVAC-Jack-5.0',
        backendVersion: '5.0.0',
        processingMethod: 'python_fastapi_enhanced'
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(transformedResponse)
    };

  } catch (error) {
    console.error('🚨 HVAC Jack 5.0 error:', error.message);
    
    // Fallback to basic response if Python backend is unavailable
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      console.log('🔄 Python backend unavailable, using fallback...');
      
      const fallbackResponse = await generateFallbackResponse(JSON.parse(event.body || '{}'));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: fallbackResponse,
          success: true,
          processingTime: (Date.now() - startTime) / 1000,
          sessionId: JSON.parse(event.body || '{}').sessionId,
          timestamp: new Date().toISOString(),
          version: '5.0-fallback',
          fallback: true,
          fallbackReason: 'python_backend_unavailable'
        })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Processing failed',
        message: 'HVAC Jack 5.0 is temporarily unavailable. Please try again.',
        success: false,
        fallback: true,
        errorDetails: error.message
      })
    };
  }
};

function parseRatingPlateData(photoAnalysisData) {
  // Parse photo analysis data into structured rating plate format
  try {
    if (typeof photoAnalysisData === 'string') {
      // Extract structured data from text analysis
      return {
        model_number: extractField(photoAnalysisData, 'model'),
        serial_number: extractField(photoAnalysisData, 'serial'),
        manufacturer: extractField(photoAnalysisData, 'manufacturer|brand'),
        capacity_btuh: extractCapacity(photoAnalysisData),
        refrigerant_type: extractField(photoAnalysisData, 'refrigerant'),
        electrical_specs: extractElectricalSpecs(photoAnalysisData),
        year_manufactured: extractYear(photoAnalysisData)
      };
    }
    return null;
  } catch (e) {
    console.error('Error parsing rating plate data:', e);
    return null;
  }
}

function extractField(text, pattern) {
  const regex = new RegExp(`(?:${pattern}).*?:?\\s*([A-Za-z0-9\\-_]+)`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
}

function extractCapacity(text) {
  const match = text.match(/(\d+,?\d*)\s*btu/i);
  return match ? parseInt(match[1].replace(',', '')) : null;
}

function extractElectricalSpecs(text) {
  const specs = {};
  const voltageMatch = text.match(/(\d+)\s*v(?:olt)?/i);
  const ampMatch = text.match(/(\d+\.?\d*)\s*amp/i);
  
  if (voltageMatch) specs.voltage = voltageMatch[1] + 'V';
  if (ampMatch) specs.amperage = ampMatch[1] + 'A';
  
  return Object.keys(specs).length > 0 ? specs : null;
}

function extractYear(text) {
  const match = text.match(/(20\d{2}|19\d{2})/);
  return match ? parseInt(match[1]) : null;
}

function formatProfessionalResponse(pythonResponse) {
  let formatted = `# 🔧 HVAC Jack 5.0 Professional Analysis\n\n`;
  
  // Safety warnings first
  if (pythonResponse.safety_warnings && pythonResponse.safety_warnings.length > 0) {
    formatted += `## ⚠️ CRITICAL SAFETY WARNINGS\n`;
    pythonResponse.safety_warnings.forEach(warning => {
      formatted += `🚨 **${warning}**\n`;
    });
    formatted += `\n`;
  }
  
  // Urgency level
  const urgencyEmoji = {
    emergency: '🚨',
    urgent: '⚡',
    moderate: '⚠️',
    routine: '📋'
  };
  
  formatted += `**Urgency Level:** ${urgencyEmoji[pythonResponse.urgency_level] || '📋'} ${pythonResponse.urgency_level?.toUpperCase() || 'ROUTINE'}\n\n`;
  
  // Main response
  formatted += `## Professional Diagnosis\n${pythonResponse.primary_response}\n\n`;
  
  // Immediate actions
  if (pythonResponse.immediate_actions && pythonResponse.immediate_actions.length > 0) {
    formatted += `## 🔧 Immediate Actions Required\n`;
    pythonResponse.immediate_actions.forEach((action, index) => {
      formatted += `${index + 1}. ${action}\n`;
    });
    formatted += `\n`;
  }
  
  // Diagnostic questions
  if (pythonResponse.diagnostic_questions && pythonResponse.diagnostic_questions.length > 0) {
    formatted += `## 🔍 Diagnostic Questions\n`;
    pythonResponse.diagnostic_questions.forEach(question => {
      formatted += `❓ ${question}\n`;
    });
    formatted += `\n`;
  }
  
  // Likely causes
  if (pythonResponse.likely_causes && pythonResponse.likely_causes.length > 0) {
    formatted += `## 🎯 Most Likely Causes\n`;
    pythonResponse.likely_causes.forEach(cause => {
      const probability = cause.probability || 'medium';
      const probabilityEmoji = { high: '🔴', medium: '🟡', low: '🟢' };
      formatted += `${probabilityEmoji[probability] || '🟡'} **${cause.cause}** (${probability} probability)\n`;
      if (cause.indicators && cause.indicators.length > 0) {
        formatted += `   └ Indicators: ${cause.indicators.join(', ')}\n`;
      }
    });
    formatted += `\n`;
  }
  
  // Parts potentially needed
  if (pythonResponse.parts_potentially_needed && pythonResponse.parts_potentially_needed.length > 0) {
    formatted += `## 🔧 Parts Potentially Needed\n`;
    pythonResponse.parts_potentially_needed.forEach(part => {
      formatted += `• ${part}\n`;
    });
    formatted += `\n`;
  }
  
  // Professional requirements
  if (pythonResponse.requires_professional) {
    formatted += `## 👨‍🔧 Professional Service Required\n`;
    formatted += `This diagnosis requires a licensed HVAC professional to complete safely and in compliance with local codes.\n\n`;
  }
  
  // Estimated time
  if (pythonResponse.estimated_time) {
    formatted += `**Estimated Time:** ${pythonResponse.estimated_time}\n\n`;
  }
  
  formatted += `---\n*HVAC Jack 5.0 - Advanced AI Diagnostic System | LARK Labs Technology*`;
  
  return formatted;
}

async function generateFallbackResponse(requestData) {
  // Simple fallback response when Python backend is unavailable
  const { message } = requestData;
  
  return `# 🔧 HVAC Jack 5.0 (Fallback Mode)

## Professional Assessment

I'm currently operating in fallback mode as the advanced AI backend is temporarily unavailable. Here's a basic assessment based on your symptoms:

**Your Issue:** ${message}

## Immediate Safety Check
⚠️ **Always ensure system safety first:**
- Turn off power to the unit if there are electrical concerns
- Shut off gas supply if gas-related issues are suspected
- Ensure proper ventilation in confined spaces

## Basic Troubleshooting Steps
1. Check thermostat settings and batteries
2. Verify power supply to the unit
3. Inspect air filters for blockages
4. Look for obvious signs of damage or loose connections

## Professional Recommendation
For a comprehensive diagnosis of this issue, please:
- Wait a few minutes and try again (advanced AI will be restored shortly)
- Contact a licensed HVAC professional for immediate assistance
- Document any additional symptoms or measurements

---
*HVAC Jack 5.0 Fallback Mode - Please retry for full AI analysis*`;
}