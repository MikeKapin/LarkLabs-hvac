// netlify/functions/analyze-photo.js
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        console.log('Photo analysis request received');
        
        const { imageData, mode, sessionId } = JSON.parse(event.body);
        
        if (!imageData) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Missing image data',
                    success: false 
                })
            };
        }

        // Remove data URL prefix if present
        const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        
        // Create the analysis prompt based on mode
        const systemPrompt = mode === 'technician' ? 
            createTechnicianAnalysisPrompt() : 
            createHomeownerAnalysisPrompt();

        console.log('Sending to Claude API for photo analysis...');
        const startTime = Date.now();

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4000,
            temperature: 0.1,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Please analyze this HVAC equipment rating plate and provide all the information requested in the system prompt."
                        },
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }
            ]
        });

        const responseTime = (Date.now() - startTime) / 1000;
        console.log(`Claude API responded in ${responseTime}s`);

        const analysisResult = response.content[0].text;

        // Try to parse as JSON if it's structured data
        let structuredResult;
        try {
            // Look for JSON blocks in the response
            const jsonMatch = analysisResult.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                structuredResult = JSON.parse(jsonMatch[1]);
            }
        } catch (parseError) {
            console.log('Response is not JSON, treating as text');
        }

        // Log successful analysis
        console.log('Photo analysis completed successfully', {
            sessionId,
            responseTime,
            hasStructuredData: !!structuredResult,
            responseLength: analysisResult.length
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                analysis: analysisResult,
                structuredData: structuredResult,
                responseTime,
                sessionId,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Photo analysis error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Photo analysis failed',
                message: error.message,
                fallback: true
            })
        };
    }
};

function createHomeownerAnalysisPrompt() {
    return `You are HVAC Jack, a friendly and knowledgeable HVAC expert helping homeowners. You've been given a photo of an HVAC equipment rating plate to analyze.

TASK: Analyze the rating plate photo and provide comprehensive information in a helpful, easy-to-understand format for homeowners.

ANALYSIS REQUIREMENTS:
1. **Equipment Identification**
   - Brand and model number
   - Equipment type (furnace, AC, heat pump, etc.)
   - Manufacturing date and age
   - Serial number

2. **Warranty Information**
   - Calculate equipment age from manufacturing date
   - Determine warranty status (active/expired/expiring)
   - Explain what's typically covered
   - Provide warranty recommendations

3. **Capacitor Requirements**
   - List ALL capacitors needed for this equipment
   - Include exact specifications (MFD, voltage, type)
   - Identify which component each capacitor serves
   - Mention capacitor lifespan and replacement indicators

4. **Key Electrical Specs**
   - Voltage requirements
   - Amperage draw
   - Refrigerant type (if applicable)
   - Energy efficiency ratings

5. **Homeowner Tips**
   - Maintenance recommendations
   - Warning signs to watch for
   - When to call a professional
   - Safety considerations

FORMAT YOUR RESPONSE AS:
1. Start with a friendly greeting acknowledging the photo
2. Provide clear, organized information with headers
3. Use simple language and explain technical terms
4. Include practical tips and recommendations
5. End with next steps or questions to ask

If you cannot read certain information clearly, say so and ask for a clearer photo of specific areas.

Be thorough but conversational. Remember, this is for a homeowner who may not be technically expert but wants to understand their equipment.`;
}

function createTechnicianAnalysisPrompt() {
    return `You are HVAC Jack in technician mode, providing detailed technical analysis for HVAC professionals. You've been given a photo of an HVAC equipment rating plate to analyze.

TASK: Perform comprehensive technical analysis of the rating plate with precise specifications and diagnostic information.

TECHNICAL ANALYSIS REQUIREMENTS:
1. **Equipment Specifications**
   - Complete model and serial number breakdown
   - Manufacturing date decoding
   - Equipment series and efficiency ratings
   - Capacity and tonnage specifications

2. **Electrical Specifications**
   - Operating voltage and phase
   - Full load amperage (FLA)
   - Locked rotor amperage (LRA)
   - Minimum circuit ampacity (MCA)
   - Maximum overcurrent protection (MOCP)

3. **Capacitor Specifications (Critical)**
   - Start capacitor: exact MFD, voltage, and application
   - Run capacitor: exact MFD, voltage, and application
   - Component-specific requirements:
     * Compressor start/run capacitors
     * Condenser fan motor capacitor
     * Blower motor capacitor
     * Any auxiliary motor capacitors
   - Dual vs single capacitor configurations
   - Tolerance specifications (+/- %)

4. **Refrigeration Data (if applicable)**
   - Refrigerant type and charge amount
   - Operating pressures
   - Superheat/subcooling specifications
   - Expansion device type

5. **Warranty and Service Information**
   - Manufacturing date interpretation
   - Warranty period by component
   - Service access requirements
   - Parts availability assessment

6. **Diagnostic Considerations**
   - Common failure points for this model
   - Troubleshooting sequence recommendations
   - Test point locations
   - Service bulletins or known issues

FORMAT YOUR RESPONSE AS:
```json
{
  "equipment": {
    "brand": "",
    "model": "",
    "serial": "",
    "type": "",
    "manufacturingDate": "",
    "age": "",
    "capacity": ""
  },
  "electrical": {
    "voltage": "",
    "fla": "",
    "lra": "",
    "mca": "",
    "mocp": ""
  },
  "capacitors": [
    {
      "component": "",
      "mfd": "",
      "voltage": "",
      "type": "",
      "tolerance": ""
    }
  ],
  "warranty": {
    "status": "",
    "remaining": "",
    "coverage": ""
  },
  "technicalNotes": ""
}
```

Then provide detailed technical commentary and diagnostic recommendations.

Be precise with specifications and include all technical details a field technician would need for service, troubleshooting, and parts ordering.`;
}
