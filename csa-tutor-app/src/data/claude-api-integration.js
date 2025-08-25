/**
 * Claude API Integration for G3 AI Tutor
 * Replace the simulated responses in the HTML file with this actual API integration
 */

// Claude API Configuration
const CLAUDE_API_CONFIG = {
    apiKey: 'YOUR_CLAUDE_API_KEY_HERE', // Replace with your actual API key
    model: 'claude-3-sonnet-20240229', // or 'claude-3-haiku-20240307' for faster responses
    maxTokens: 2000,
    apiUrl: 'https://api.anthropic.com/v1/messages'
};

// Enhanced system prompt specifically designed for G3 tutoring
const G3_SYSTEM_PROMPT = `You are an expert HVAC tutor for TSSA G3 certification, specializing in CSA Gas Technician Modules 1–9. When a user asks a question, search the provided dataset for relevant information, then respond as a supportive tutor:

**Your Teaching Style:**
- Explain answers in plain English, using practical scenarios, analogies, and step-by-step reasoning
- Avoid jargon unless you explain it clearly
- Always assume the user is a beginner unless told otherwise
- Be encouraging and supportive - learning HVAC can be challenging

**Response Structure:**
1. Start with a clear, direct answer
2. Provide step-by-step explanations when needed
3. Use real-world analogies (like comparing gas pressure to water pressure)
4. Include safety reminders for safety-related topics
5. End with a follow-up question to encourage continued learning

**Safety First Approach:**
- Always emphasize safety in gas-related topics
- Remind users about proper PPE and procedures
- Never suggest shortcuts that could compromise safety
- Highlight code compliance requirements

**Module Coverage (1-9):**
- Module 1: Safety procedures, PPE, hazard identification, emergency response
- Module 2: Tools, fasteners, testing equipment, calibration procedures
- Module 3: Gas properties, BTU values, specific gravity, combustion principles
- Module 4: CSA B149.1/B149.2 codes, regulations, compliance
- Module 5: Basic electricity, Ohm's law, circuits, electrical safety
- Module 6: Technical drawings, manuals, specifications, symbols
- Module 7: Customer service, communication, professionalism
- Module 8: Piping systems, materials, sizing calculations, installation
- Module 9: Gas appliances, burners, controls, venting, operation

**Example Interactions:**
User: "What does a gas regulator do?"
You: "A gas regulator controls the pressure of gas entering an appliance, making sure it's safe and steady—like a faucet for gas. Too much pressure can be dangerous, so the regulator keeps things balanced. For example, if the gas pressure is too high, it could damage the appliance or cause unsafe burning. What type of regulator are you working with?"

**Important Notes:**
- If the answer isn't in the provided module data, say so clearly
- If the question is unclear, ask for clarification
- Use practical examples from real HVAC work
- Reference specific module numbers when relevant

If you don't know something, reply: "That topic isn't covered in the current modules. Please ask about another topic from Modules 1–9."`;

/**
 * Main function to get AI response from Claude API
 * @param {string} userMessage - The user's question
 * @param {string|null} selectedModule - Selected module ID (1-9) or null for all modules
 * @param {Object} moduleContext - Module data context
 * @returns {Promise<string>} - AI response
 */
async function getClaudeResponse(userMessage, selectedModule = null, moduleContext = {}) {
    try {
        // Build context information
        let contextPrompt = '';
        if (selectedModule && moduleContext[selectedModule]) {
            const module = moduleContext[selectedModule];
            contextPrompt = `**Current Module Context:** ${module.title}\n**Description:** ${module.description}\n**Key Topics:** ${module.keywords.join(', ')}\n\n`;
        }

        // Construct the full prompt
        const fullPrompt = `${contextPrompt}**User Question:** ${userMessage}\n\nPlease provide a helpful, educational response as a G3 HVAC tutor.`;

        // API request payload
        const requestPayload = {
            model: CLAUDE_API_CONFIG.model,
            max_tokens: CLAUDE_API_CONFIG.maxTokens,
            temperature: 0.7,
            system: G3_SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: fullPrompt
                }
            ]
        };

        // Make API request
        const response = await fetch(CLAUDE_API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_CONFIG.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Extract the AI response
        if (data.content && data.content[0] && data.content[0].text) {
            return data.content[0].text;
        } else {
            throw new Error('Unexpected API response format');
        }

    } catch (error) {
        console.error('Claude API Error:', error);
        
        // Fallback to enhanced pattern matching if API fails
        return getFallbackResponse(userMessage, selectedModule);
    }
}

/**
 * Enhanced fallback response system when API is unavailable
 * @param {string} message - User's message
 * @param {string|null} moduleId - Selected module
 * @returns {string} - Fallback response
 */
function getFallbackResponse(message, moduleId = null) {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced pattern matching with more detailed responses
    const responses = {
        'ppe|personal protective|safety equipment': `**Personal Protective Equipment (PPE) for Gas Technicians:**

**Essential PPE Requirements:**
• **Safety glasses** - Protect against debris and chemical splashes
• **Appropriate footwear** - Steel-toed boots with slip-resistant soles
• **Cut-resistant gloves** - When handling sharp materials or pipes
• **Calibrated gas detector** - Essential for leak detection and confined spaces
• **High-visibility clothing** - When working in traffic areas or outdoor locations

**Think of PPE like your safety toolkit** - each piece protects you from specific hazards. Just like a carpenter wouldn't use a hammer without safety glasses, a gas technician shouldn't work without proper gas detection equipment.

**Module 1 Safety Reminder:** Always inspect your PPE before each shift. A damaged gas detector could fail to warn you of dangerous gas concentrations.

**Practical Example:** When entering a basement to service a furnace, you'd need your gas detector (to check for leaks), safety glasses (for overhead pipes), and appropriate footwear (for wet concrete floors).

What specific PPE situation are you dealing with on your job site?`,

        'leak test|leak detection|soap test': `**Gas Leak Testing - Complete Procedure:**

**Step-by-Step Process:**
1. **Preparation Phase:**
   - Shut off gas supply and allow pressure to drop
   - Connect your calibrated test gauge
   - Ensure adequate ventilation in work area

2. **Testing Methods:**
   - **Soap Solution Test:** Apply approved leak detection solution to all joints, fittings, and connections. Gas leaks will create persistent bubbles - like blowing soap bubbles, but the gas pushes through creating the bubbles.
   - **Electronic Detection:** Use calibrated electronic leak detector for precise measurements and hard-to-reach areas
   - **Pressure Test:** Pressurize system to 1.5x working pressure and monitor for 10-15 minutes minimum

3. **Safety Requirements:**
   - **NEVER use open flame** for leak detection
   - Always have proper ventilation
   - Use only calibrated, approved equipment
   - Document all test results

**Real-World Analogy:** Testing for gas leaks is like checking a bicycle tire for punctures - you can submerge it in water to see bubbles, but with gas systems, we use special soap solutions instead of water for safety.

**Module 2 Tool Reminder:** Electronic detectors need regular calibration - check your equipment's certification dates.

Which testing method would you like me to explain in more detail?`,

        'pressure.*calculation|pipe sizing|flow rate': `**Gas Pressure Calculations Made Simple:**

**Key Concepts to Master:**
• **Working Pressure:** Normal operating pressure (typically 7" w.c. for natural gas, 11" w.c. for propane)
• **Test Pressure:** Higher pressure for leak testing (usually 1.5x working pressure)
• **Pressure Drop:** Loss of pressure through piping due to friction and fittings

**Essential Formula:**
**Pressure Drop = (Q² × L × F) / (D⁵)**
Where: Q = flow rate, L = length, F = friction factor, D = pipe diameter

**Practical Application:**
1. **Calculate Flow Rate:** BTU Input ÷ Heating Value
   - Example: 100,000 BTU furnace ÷ 1,000 BTU/ft³ = 100 ft³/hr
2. **Size Pipe:** Use tables to ensure adequate diameter for calculated flow
3. **Check Pressure Drop:** Verify system maintains required pressure

**Water Analogy:** Think of gas flow like water through a garden hose - the longer and narrower the hose, the less pressure you get at the end. Same principle applies to gas piping.

**Module 3 Reference:** Natural gas ~1,000 BTU/ft³, Propane ~2,500 BTU/ft³

**Safety Note:** Always ensure adequate pressure reaches appliances for proper combustion and safe operation.

Would you like me to walk through a specific sizing calculation?`,

        'regulator|pressure control': `**Gas Pressure Regulators - Your Pressure Control System:**

**What Regulators Do:**
A gas regulator is like a **smart faucet for gas** - it automatically controls and reduces incoming gas pressure to the safe, steady pressure your appliances need.

**How They Work:**
1. **High pressure gas** enters from supply line
2. **Spring and diaphragm system** senses downstream pressure
3. **Valve mechanism** opens or closes to maintain set pressure
4. **Consistent output** regardless of supply pressure variations

**Types You'll Encounter:**
• **Service Regulators** - At the gas meter (high to medium pressure)
• **Appliance Regulators** - At individual appliances (medium to low pressure)  
• **Line Regulators** - For gas distribution systems

**Real-World Example:** Like your home's water pressure regulator - city water might be 80 PSI, but your fixtures need 40 PSI. The regulator automatically maintains that lower pressure.

**Module 8 Connection:** Proper regulator sizing is critical for piping system design and appliance operation.

**Safety Critical:** Never attempt to adjust regulators without proper gauges, procedures, and training. Incorrect adjustment can create dangerous over-pressure conditions.

**Troubleshooting Tip:** If an appliance isn't getting enough gas, check the regulator operation before assuming pipe sizing issues.

What type of regulator situation are you working with?`,

        'ignition.*sequence|furnace.*start': `**Gas Furnace Ignition Sequence - Safety First Process:**

**The Complete 7-Step Safety Sequence:**

1. **Thermostat Call for Heat** 
   - Like turning the key in your car - everything starts here

2. **System Safety Verification**
   - All safety switches checked (door switches, pressure switches, etc.)
   - Think of it as your car's computer checking everything before starting

3. **Inducer/Draft Fan Operation**
   - Clears combustion chamber of any residual gases
   - Like opening windows before lighting a fireplace

4. **Igniter Warm-Up Period**
   - Hot surface igniter heats to ~1800°F (or pilot lights)
   - Usually 15-45 seconds depending on system

5. **Gas Valve Energizes**
   - Main gas valve opens, allowing gas flow to burners
   - Timing is critical - igniter must be hot enough

6. **Flame Establishment**
   - Gas ignites immediately upon contact with hot igniter
   - Flame should be blue and stable

7. **Flame Proving/Sensing**
   - Flame sensor (or thermocouple) confirms safe flame
   - System continues normal operation

**Safety Shutdowns:** If ANY step fails, the system immediately shuts down and locks out. This prevents dangerous gas accumulation.

**Module 9 Safety Note:** Never bypass safety controls - they prevent carbon monoxide production and gas accumulation.

**Common Issues:** Dirty flame sensors, weak igniter, gas pressure problems, or blocked venting.

Which part of the ignition process is giving you trouble?`,

        'venting|vent.*system|chimney': `**Gas Appliance Venting Systems:**

**Venting Categories (Critical for Installation):**

**Category I (Natural Draft):**
- 80% efficiency appliances
- Use Type B vent or masonry chimney
- Requires proper draft and chimney height
- Like a campfire - hot gases naturally rise

**Category II:**
- Rarely used in residential applications

**Category III (Fan-Assisted):**
- 80-90% efficiency with exhaust fan
- Can overcome venting resistance
- Uses Type B vent or approved materials

**Category IV (Condensing):**
- 90%+ efficiency appliances  
- Uses PVC, CPVC, or polypropylene
- Requires condensate drainage
- Cooler exhaust gases

**Installation Requirements:**
• **Slope:** 1/4" per foot toward appliance (condensing)
• **Clearances:** 1" from combustibles (single wall)
• **Termination:** Follow manufacturer's clearance requirements
• **Joints:** Properly sealed and supported

**Real-World Analogy:** Think of venting like your home's plumbing - everything needs proper slope, support, and connections to work safely.

**Module 9 Safety:** Improper venting can cause backdrafting, carbon monoxide production, or appliance failure.

What specific venting challenge are you facing?`,

        'carbon monoxide|co.*safety|co.*detection': `**Carbon Monoxide Safety - Life-Critical Information:**

**Danger Levels (Parts Per Million):**
• **0-9 PPM:** Normal background levels
• **10-24 PPM:** Acceptable in occupied spaces  
• **25-35 PPM:** Action level - investigate source immediately
• **36+ PPM:** Dangerous - immediate evacuation required
• **400+ PPM:** Immediately life-threatening

**Common CO Sources in Gas Work:**
• Cracked heat exchangers in furnaces
• Blocked or damaged chimneys/vents
• Backdrafting appliances due to inadequate combustion air
• Improperly adjusted burners (yellow flames)
• Corroded or disconnected venting systems

**Detection Methods:**
1. **Professional CO Analyzers:** Required for accurate field testing
2. **Residential CO Detectors:** Early warning for occupants (not for diagnosis)

**Testing Procedure:**
- Test in flue pipe near appliance during operation
- Check ambient air levels in occupied spaces
- Test with all appliances operating under load
- Document all readings with calibrated equipment

**Emergency Response:**
1. **Evacuate immediately** if high levels detected
2. **Shut off gas supply** to affected appliances  
3. **Provide ventilation** to affected areas
4. **Do not re-enter** until CO levels are safe
5. **Identify and correct source** before restart

**Prevention (Module 1 Safety):**
- Regular maintenance and inspection
- Adequate combustion air supply
- Proper venting system maintenance
- Professional installation and service

**Remember:** CO is colorless, odorless, and can kill. When in doubt, evacuate and call professionals.

What CO situation are you dealing with?`
    };

    // Find matching response
    for (const [pattern, response] of Object.entries(responses)) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(lowerMessage)) {
            return response;
        }
    }

    // Default response with module context
    const moduleContext = moduleId ? `\n\n**Current Module:** Module ${moduleId}` : '';
    
    return `I understand you're asking about "${message}".${moduleContext}

**I can help you with these G3 certification topics:**

**Safety & Procedures (Module 1):**
• PPE requirements and safety protocols
• Hazard identification and emergency procedures
• Gas safety fundamentals

**Tools & Equipment (Module 2):**
• Testing equipment selection and calibration
• Tool safety and maintenance procedures
• Measurement and testing techniques

**Technical Knowledge (Modules 3-6):**
• Gas properties and combustion principles
• Pressure calculations and pipe sizing
• Code requirements (CSA B149.1/B149.2)
• Electrical basics for gas appliances

**Practical Skills (Modules 7-9):**
• Customer relations and professionalism
• Piping system design and installation
• Gas appliance operation and troubleshooting

**To get a better answer, try asking:**
- "How do I..." (for step-by-step procedures)
- "What is..." (for definitions and explanations)
- "Why does..." (for understanding principles)
- "When should I..." (for decision-making guidance)

What specific aspect would you like me to explain?`;
}

/**
 * Load module data for context (replace with your actual module loading)
 * @returns {Object} Module data structure
 */
function loadModuleData() {
    return {
        1: {
            title: "Safety",
            keywords: ["safety", "ppe", "hazards", "emergency", "procedures", "lockout", "tagout"],
            description: "Fundamental safety principles and procedures for gas technicians"
        },
        2: {
            title: "Fasteners, Tools and Test Equipment",
            keywords: ["tools", "fasteners", "test equipment", "measurements", "calibration", "maintenance"],
            description: "Essential tools, fasteners, and testing equipment for gas work"
        },
        3: {
            title: "Properties and Safe Handling of Fuel Gases",
            keywords: ["natural gas", "propane", "BTU", "specific gravity", "combustion", "heating value"],
            description: "Understanding fuel gas properties and safe handling procedures"
        },
        4: {
            title: "Gas Industry Codes, Acts and Regulations",
            keywords: ["CSA B149.1", "CSA B149.2", "codes", "regulations", "standards", "compliance", "TSSA"],
            description: "Gas industry codes, acts, and regulatory requirements"
        },
        5: {
            title: "Basic Electricity",
            keywords: ["voltage", "current", "ohms law", "circuits", "electrical safety", "multimeter"],
            description: "Basic electrical principles for gas appliance technicians"
        },
        6: {
            title: "Technical Drawings, Manuals and Graphs",
            keywords: ["technical drawings", "specifications", "manuals", "schematics", "blueprints", "symbols"],
            description: "Reading and interpreting technical documentation and drawings"
        },
        7: {
            title: "Customer Relations",
            keywords: ["customer service", "communication", "professionalism", "ethics", "conflict resolution"],
            description: "Professional customer relations and communication skills"
        },
        8: {
            title: "Introduction to Piping and Tubing Systems",
            keywords: ["piping", "tubing", "pipe sizing", "materials", "installation", "joints", "fittings"],
            description: "Fundamentals of gas piping and tubing systems"
        },
        9: {
            title: "Introduction to Gas Appliances",
            keywords: ["appliances", "burners", "controls", "venting", "operation", "installation"],
            description: "Overview of gas appliances and their operation"
        }
    };
}

// Export functions for use in HTML file
window.getClaudeResponse = getClaudeResponse;
window.loadModuleData = loadModuleData;

/**
 * Usage Instructions:
 * 
 * 1. Replace 'YOUR_CLAUDE_API_KEY_HERE' with your actual Claude API key
 * 2. Include this script in your HTML file after the main script
 * 3. Replace the simulateClaudeResponse function call with:
 *    return await getClaudeResponse(userMessage, selectedModule, moduleData);
 * 
 * 4. For enhanced functionality, load your actual module data files and pass them as context
 */