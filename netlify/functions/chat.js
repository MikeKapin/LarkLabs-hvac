// netlify/functions/chat.js
// HVAC Jack backend as a Netlify Function

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Chat endpoint
  if (event.httpMethod === 'POST') {
    try {
      const { message, mode, conversationHistory, systemContext } = JSON.parse(event.body);

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Message is required' })
        };
      }

      // Build system prompt
      const systemPrompt = buildSystemPrompt(mode, systemContext);
      
      // Prepare messages for Claude
      const claudeMessages = buildClaudeMessages(message, conversationHistory, mode);

      // Call Claude API
      const claudeResponse = await callClaude(systemPrompt, claudeMessages, process.env.CLAUDE_API_KEY);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: claudeResponse,
          timestamp: new Date().toISOString(),
          mode: mode
        })
      };

    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback response
      const { message = '', mode = 'homeowner' } = JSON.parse(event.body || '{}');
      const fallbackResponse = generateFallbackResponse(message, mode);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: fallbackResponse + '\n\n*Note: Using fallback mode due to temporary AI service issue.*',
          timestamp: new Date().toISOString(),
          fallback: true
        })
      };
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not found' })
  };
};

function buildSystemPrompt(mode, systemContext) {
  const basePrompt = `You are HVAC Jack, a highly experienced HVAC technician and helpful AI assistant. You provide practical, safe, and accurate HVAC advice.

Current system context:
- Equipment: ${systemContext?.equipmentType || 'Unknown'}
- Current problem: ${systemContext?.currentProblem || 'Diagnosing'}
- Previous actions: ${systemContext?.previousActions?.join(', ') || 'None'}

Key principles:
1. Safety first - always warn about gas leaks, electrical hazards, and when to call professionals
2. Be conversational and helpful, not clinical
3. Use emojis and formatting to make responses engaging
4. Remember context from the conversation
5. Provide step-by-step guidance`;

  if (mode === 'homeowner') {
    return basePrompt + `

HOMEOWNER MODE - Tailor responses for homeowners:
- Use simple, non-technical language
- Focus on safe DIY steps they can take
- Emphasize when to call a professional
- Explain WHY they're doing each step
- Be encouraging and supportive
- Prioritize most common/likely causes first
- Use analogies to explain complex concepts`;
  } else {
    return basePrompt + `

TECHNICIAN MODE - Provide professional-level guidance:
- Use proper technical terminology
- Include specific measurements, specs, and procedures
- Reference diagnostic equipment and tools needed
- Provide troubleshooting sequences
- Include electrical, gas, and refrigerant safety protocols
- Assume professional knowledge and EPA certification where applicable`;
  }
}

function buildClaudeMessages(currentMessage, conversationHistory, mode) {
  const messages = [];

  // Add recent conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-10);
    
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    });
  }

  messages.push({ role: 'user', content: currentMessage });
  return messages;
}

async function callClaude(systemPrompt, messages, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function generateFallbackResponse(message, mode) {
  const input = message.toLowerCase();
  
  if (input.includes('no heat')) {
    return mode === 'homeowner' 
      ? `**No heat issue!**\n\n🔍 **Quick checks:**\n• Check thermostat is set to HEAT\n• Replace thermostat batteries\n• Check circuit breaker\n• Replace air filter\n\n⚠️ **If you smell gas - leave immediately!**`
      : `**No heat diagnostic:**\n\n⚡ **Check:**\n• 24VAC at R-W terminals\n• HSI resistance (11-200Ω)\n• Gas valve operation\n• Flame sensor current\n\nWhat are current readings?`;
  }
  
  if (input.includes('no cool') || input.includes('ac')) {
    return mode === 'homeowner'
      ? `**AC not cooling!**\n\n❄️ **Try:**\n• Set thermostat 5°F lower\n• Replace air filter\n• Check breakers\n• Clean outdoor unit\n\n🚨 **Ice anywhere? Turn OFF immediately!**`
      : `**No cooling diagnostic:**\n\n⚡ **Verify:**\n• 240VAC at disconnect\n• Compressor amps\n• Refrigerant pressures\n• Superheat/subcooling\n\nCurrent readings?`;
  }

  return mode === 'homeowner'
    ? `**I'm here to help!**\n\n🔧 **Tell me:**\n• What type of system?\n• What's wrong?\n• When did it start?\n\n⚠️ **Safety:** Gas smell = call gas company immediately!`
    : `**Diagnostic mode**\n\n📋 **Need:**\n• Equipment details\n• Symptoms and measurements\n• Test equipment available\n\nProvide system specifics for targeted troubleshooting.`;
}
