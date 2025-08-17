// netlify/functions/website-assistant.js
// LARK Labs Website AI Assistant

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { message, conversationHistory } = JSON.parse(event.body);

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Message is required' })
        };
      }

      const systemPrompt = `You are the LARK Labs Website Assistant, helping visitors navigate and understand our HVAC training and tools platform. You're knowledgeable about Canadian gas technician certification, HVAC tools, and our specific offerings.

ABOUT LARK LABS:
- Free HVAC tools and calculators for Canadian technicians
- TSSA G2 & G3 exam preparation resources
- CSA B149.1 study guides and code search tools
- Professional training modules and certification prep
- Founded by experienced HVAC educator (20+ years field, 10+ years teaching)

KEY TOOLS & SERVICES:
1. Code Compass - CSA B149.1 search tool
2. HVAC Pro Tools - comprehensive calculator app
3. TSSA G2 Practice Exam (Premium - $79.99)
4. TSSA G3 Practice Exam (Free)
5. A2L Refrigerant Training
6. HVAC Jack AI (Beta - advanced troubleshooting)
7. Various HVAC calculators (heat load, P-T charts, duct sizing, etc.)

RESPONSE STYLE:
- Friendly, professional, and helpful
- Use 🔧 emojis sparingly for visual appeal
- Provide specific guidance and recommendations
- Always emphasize safety for gas work
- Direct users to appropriate tools/sections
- Keep responses concise but informative

NAVIGATION HELP:
- Tools section: Professional calculators and apps
- Training section: Certification prep and courses
- Downloads section: Offline resources and apps
- Resources section: Code search and reference materials
- About section: Founder info and company mission

Always prioritize user safety and direct them to appropriate professional help when needed.`;

      const claudeMessages = buildMessages(message, conversationHistory);
      const response = await callClaude(systemPrompt, claudeMessages, process.env.CLAUDE_API_KEY);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: response,
          timestamp: new Date().toISOString()
        })
      };

    } catch (error) {
      console.error('Website assistant error:', error);
      
      const fallbackResponse = generateWebsiteFallback(JSON.parse(event.body || '{}').message || '');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: fallbackResponse,
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

function buildMessages(currentMessage, conversationHistory) {
  const messages = [];

  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-8);
    
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
      max_tokens: 800,
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

function generateWebsiteFallback(message) {
  const input = message.toLowerCase();
  
  if (input.includes('tool') || input.includes('calculator')) {
    return `🔧 **HVAC Tools Available:**

• **Code Compass** - Search CSA B149.1 codes
• **HVAC Pro Tools** - Complete calculator suite
• **Heat Load Calculator** - Canadian climate data
• **P-T Charts** - All refrigerants including A2L
• **Duct Sizing** - Professional calculations

Visit our **Tools** section to access all calculators!`;
  }
  
  if (input.includes('exam') || input.includes('test') || input.includes('g2') || input.includes('g3')) {
    return `📚 **Certification Training:**

• **TSSA G3 Practice Exam** - Completely FREE
• **TSSA G2 Practice Exam** - Premium ($79.99)
• **CSA Chapter Reviews** - All units covered
• **A2L Training Module** - Free certification

Check our **Training** section for exam prep resources!`;
  }
  
  if (input.includes('free') || input.includes('download')) {
    return `📱 **Free Downloads:**

• **HVAC Pro Tools App** - Complete toolkit
• **G3 Study Materials** - All units free
• **A2L Calculator Tools** - Professional grade
• **CSA Reference Guides** - Quick access

Visit **Downloads** section for offline resources!`;
  }

  return `👋 **Welcome to LARK Labs!**

I'm here to help you find the right HVAC tools and training resources.

🔧 **Popular sections:**
• **Tools** - Professional calculators
• **Training** - G2/G3 exam prep  
• **Downloads** - Free offline resources
• **Resources** - Code search & references

What can I help you find today?`;
}