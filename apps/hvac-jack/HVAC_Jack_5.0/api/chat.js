// api/chat.js
// HVAC Jack 5.0 - Vercel Chat Function

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

  const startTime = Date.now();

  try {
    const {
      message,
      mode = 'technician',
      conversationHistory = [],
      systemContext = {},
      sessionId,
      photoAnalysisData,
      explainerMode,
      requestExplanation
    } = req.body;

    console.log('📨 PRODUCTION v3.0 - Chat request received:', {
      messageLength: message?.length,
      mode,
      sessionId,
      explainerMode,
      requestExplanation: !!requestExplanation
    });

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messageLower = message.toLowerCase();

    // EXPLAINER MODE DETECTION AND ACTIVATION
    const isExplainerRequest = requestExplanation || 
                               explainerMode || 
                               messageLower.includes('explain') ||
                               messageLower.includes('what is') ||
                               messageLower.includes('how does') ||
                               messageLower.includes('why does') ||
                               (messageLower.includes('contactor') && messageLower.includes('not closing')) ||
                               (messageLower.includes('have power') && messageLower.includes('but'));

    if (isExplainerRequest) {
      console.log('🎓 EXPLAINER MODE ACTIVATED');
      
      const explainerPrompt = `You are HVAC Jack Professional - a master HVAC technician and educator specializing in comprehensive technical explanations.

**COMPREHENSIVE EXPLANATION MODE**

User Question: "${message}"

${photoAnalysisData?.structuredData ? `
**Equipment Context:**
- Type: ${photoAnalysisData.structuredData.equipment?.type || 'Unknown'}
- Brand: ${photoAnalysisData.structuredData.equipment?.brand || 'Unknown'}  
- Model: ${photoAnalysisData.structuredData.equipment?.model || 'Unknown'}
` : ''}

**Your Response Must Include:**

1. **Technical Explanation** - Explain exactly what's happening and why
2. **Component Operation** - How the relevant components work and interact
3. **Diagnostic Steps** - Professional troubleshooting procedures
4. **Common Causes** - What typically causes this issue and why
5. **Safety Considerations** - Important safety protocols and warnings
6. **Professional Insights** - Real-world tips and best practices
7. **Code References** - Industry standards and compliance requirements

**Format as a comprehensive technical explanation that educates while providing diagnostic guidance.**

Provide detailed, professional-level explanations appropriate for HVAC technicians.`;

      const explainerResponse = await callClaude(explainerPrompt, message);

      return res.status(200).json({
        response: `🎓 **COMPREHENSIVE TECHNICAL EXPLANATION**\n\n${explainerResponse}\n\n---\n📋 *HVAC Jack Professional - Advanced AI Explainer System*`,
        success: true,
        routeUsed: 'ai_explainer_comprehensive',
        usingAI: true,
        responseTime: (Date.now() - startTime) / 1000,
        sessionId: sessionId,
        metadata: { explainerMode: explainerMode || 'comprehensive' }
      });
    }

    // STANDARD DIAGNOSTIC MODE
    const diagnosticPrompt = `You are HVAC Jack Professional - Expert HVAC diagnostic technician.

User Message: "${message}"
Mode: ${mode}
Equipment Context: ${systemContext.equipmentType || 'Unknown'}

Provide professional diagnostic guidance with:
- Technical assessment
- Required measurements  
- Diagnostic procedures
- Professional recommendations

Keep responses concise but thorough.`;

    const response = await callClaude(diagnosticPrompt, message);

    return res.status(200).json({
      response,
      success: true,
      routeUsed: 'standard_diagnostic',
      usingAI: true,
      responseTime: (Date.now() - startTime) / 1000,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Chat error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process request',
      success: false,
      fallback: true
    });
  }
}

// Simple Claude API call
async function callClaude(systemPrompt, userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  console.log('🔑 Chat API Key check:', {
    exists: !!apiKey,
    length: apiKey?.length || 0,
    prefix: apiKey?.substring(0, 7) || 'none'
  });

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured in environment variables');
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
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'No response generated';
}