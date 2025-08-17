// HVAC Jack Backend Server
// This server securely handles Claude AI API calls

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: '*', // Allow all origins for development (including file:// protocol)
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public')); // Serve static files

// Claude AI Configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

if (!CLAUDE_API_KEY) {
    console.error('⚠️  CLAUDE_API_KEY environment variable is required!');
    console.log('Please check your .env file contains:');
    console.log('CLAUDE_API_KEY=sk-ant-api03-...');
    process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        claudeConfigured: !!CLAUDE_API_KEY 
    });
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, mode, conversationHistory, systemContext } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Build system prompt based on mode and context
        const systemPrompt = buildSystemPrompt(mode, systemContext);
        
        // Prepare conversation history for Claude
        const claudeMessages = buildClaudeMessages(message, conversationHistory, mode);

        // Call Claude API
        const claudeResponse = await callClaude(systemPrompt, claudeMessages);

        // Log for debugging (remove in production)
        console.log(`[${new Date().toISOString()}] ${mode} mode: "${message.substring(0, 50)}..."`);

        res.json({ 
            response: claudeResponse,
            timestamp: new Date().toISOString(),
            mode: mode
        });

    } catch (error) {
        console.error('Chat endpoint error:', error);
        
        // Return fallback response on error
        const fallbackResponse = generateFallbackResponse(req.body.message, req.body.mode);
        
        res.status(200).json({ 
            response: fallbackResponse + '\n\n*Note: Using fallback mode due to temporary AI service issue.*',
            timestamp: new Date().toISOString(),
            mode: req.body.mode,
            fallback: true
        });
    }
});

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

    // Add recent conversation history for context (last 10 messages)
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

    // Add current message
    messages.push({ role: 'user', content: currentMessage });

    return messages;
}

async function callClaude(systemPrompt, messages) {
    const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
            'x-api-key': CLAUDE_API_KEY,
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
        const errorBody = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

function generateFallbackResponse(message, mode) {
    const input = message.toLowerCase();
    
    // Simple pattern matching for fallback responses
    if (input.includes('no heat') || input.includes('not heating')) {
        return mode === 'homeowner' 
            ? `**No heat issue!**\n\n🔍 **Quick checks:**\n• Check thermostat is set to HEAT\n• Replace thermostat batteries\n• Check circuit breaker\n• Replace air filter\n• Listen for system startup sounds\n\n⚠️ **If you smell gas - leave immediately and call gas company!**\n\nTry these steps and let me know what happens!`
            : `**No heat diagnostic sequence:**\n\n⚡ **Electrical checks:**\n• 24VAC at R-W terminals\n• Thermostat battery/wiring\n• Circuit breaker continuity\n\n🔥 **Gas heating:**\n• HSI resistance (11-200Ω)\n• Gas valve operation\n• Flame sensor current (2-5μA)\n\nWhat are your current readings?`;
    }
    
    if (input.includes('no cool') || input.includes('not cool') || input.includes('ac')) {
        return mode === 'homeowner'
            ? `**AC not cooling!**\n\n❄️ **Start here:**\n• Set thermostat to COOL, 5°F lower\n• Replace dirty air filter\n• Check circuit breakers (indoor & outdoor)\n• Clean outdoor unit\n• Ensure all vents are open\n\n🚨 **If you see ice anywhere - turn system OFF immediately!**\n\nWhat did you find?`
            : `**No cooling diagnostic:**\n\n⚡ **Power verification:**\n• 240VAC at outdoor disconnect\n• Compressor/fan motor amps\n• Capacitor values\n• Contactor operation\n\n❄️ **Refrigerant analysis:**\n• Suction/discharge pressures\n• Superheat/subcooling calculations\n\nCurrent system readings?`;
    }

    // Generic response
    return mode === 'homeowner'
        ? `**I'm here to help with your HVAC issue!**\n\n🔧 **Tell me more:**\n• What type of system? (furnace, AC, heat pump)\n• What's it doing (or not doing)?\n• Any unusual sounds or smells?\n• When did this start?\n\n⚠️ **Safety first:** If you smell gas, see sparks, or notice water leaking - turn off the system and call a professional!\n\nWhat's going on?`
        : `**HVAC diagnostic mode**\n\n📋 **Need more details:**\n• Equipment type and model numbers\n• Specific symptoms and measurements\n• Test equipment available\n• Current diagnostic status\n\nProvide system details and current readings for targeted troubleshooting.`;
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: 'Something went wrong. Please try again.',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not found',
        message: 'The requested endpoint does not exist.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🔧 HVAC Jack Backend Server running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`🔐 Claude API: ${CLAUDE_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
    
    if (!CLAUDE_API_KEY) {
        console.log('\n⚠️  Add your Claude API key to .env file to enable AI features!');
    }
});

module.exports = app;