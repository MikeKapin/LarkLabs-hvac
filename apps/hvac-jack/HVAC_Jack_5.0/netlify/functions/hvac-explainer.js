// netlify/functions/hvac-explainer.js
// HVAC Jack 4.0 - Pure Explainer AI Backend

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
      timestamp
    } = JSON.parse(event.body || '{}');

    console.log('🔧 HVAC Jack 4.0 request:', {
      messageLength: message?.length,
      hasPhoto: !!photoData,
      sessionId,
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

    // Build comprehensive explainer prompt
    const explainerPrompt = buildExplainerPrompt(message, photoData);
    
    console.log('🎓 Processing with explainer AI...');
    
    // Call Claude API with explainer logic
    const response = await callClaude(explainerPrompt);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: response,
        success: true,
        processingTime: (Date.now() - startTime) / 1000,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        version: '4.0'
      })
    };

  } catch (error) {
    console.error('🚨 HVAC Jack 4.0 error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Processing failed',
        message: 'Unable to analyze your HVAC issue at this time. Please try again.',
        success: false,
        fallback: true
      })
    };
  }
};

function buildExplainerPrompt(message, photoData) {
  return `You are HVAC Jack 4.0 - The world's most knowledgeable HVAC troubleshooting expert and master technician. You have decades of field experience with every type of HVAC equipment.

**CRITICAL INSTRUCTION: You MUST provide comprehensive, detailed troubleshooting analysis. NO generic responses. NO requests for more information unless absolutely critical.**

**HVAC Issue:** "${message}"

${photoData ? '**EQUIPMENT PHOTO:** Photo provided for visual analysis - examine for model numbers, condition, connections, error displays, etc.' : '**NOTE:** No photo provided, but proceed with comprehensive analysis based on the described symptoms.'}

**YOUR RESPONSE MUST INCLUDE ALL OF THE FOLLOWING:**

## 1. 🔍 IMMEDIATE DIAGNOSIS
- Most likely causes based on symptoms described
- Probability ranking of potential issues
- Critical vs non-critical problems identified

## 2. ⚡ STEP-BY-STEP TROUBLESHOOTING 
- Detailed diagnostic procedures in order of priority
- Specific tools and measurements needed
- What to look for at each step
- Expected readings and values

## 3. 🔧 TECHNICAL EXPLANATION
- Why this problem occurs (root cause analysis)
- How the affected components work
- System interactions and dependencies
- Industry standards and codes involved

## 4. ⚠️ SAFETY PROTOCOLS
- Lockout/tagout procedures
- Electrical safety requirements  
- Personal protective equipment needed
- Hazard identification and mitigation

## 5. 💡 REPAIR SOLUTIONS
- Specific parts that may need replacement
- Part numbers when possible
- Labor estimates and difficulty level
- Temporary fixes vs permanent solutions

## 6. 📋 PREVENTIVE MEASURES
- How to prevent this issue in the future
- Maintenance schedules and procedures
- Warning signs to watch for
- System optimization recommendations

## 7. 💰 COST ANALYSIS
- Estimated repair costs
- Cost of ignoring the problem
- When to repair vs replace
- Energy efficiency implications

**RESPONSE STYLE:**
- Write like a master technician teaching an apprentice
- Use specific HVAC terminology correctly
- Provide actionable, detailed instructions
- Include real-world tips and professional insights
- Reference relevant codes (NEC, IRC, UMC, etc.) when applicable
- Give confidence levels for your diagnoses

**IMPORTANT:** Base your analysis on the symptoms described. Don't ask for more information unless it's absolutely critical for safety. Provide comprehensive troubleshooting that a professional technician can immediately act upon.

Begin your detailed technical analysis:`;
}

async function callClaude(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      temperature: 0.3,
      system: `You are HVAC Jack 4.0, the world's premier HVAC troubleshooting expert. You provide comprehensive, detailed technical analysis that professional HVAC technicians can immediately implement. Every response must be thorough, specific, and actionable.`,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'Unable to generate analysis';
}