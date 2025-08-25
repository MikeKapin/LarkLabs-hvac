/**
 * Module Data Integration for G3 AI Tutor
 * Integrates with the existing module data files in the data folder
 */

// Import all module data
import { 
    module1SafetyData,
    module2ToolsData, 
    module3GasPropertiesData,
    module4CodesData,
    module5ElectricityData,
    module6TechnicalDrawingsData,
    module7CustomerRelationsData,
    module8PipingSystemsData,
    module9GasAppliancesData,
    allModulesData,
    searchAllModules,
    getAIResponse as getEnhancedAIResponse
} from './index.js';

import { moduleMapping, knowledgeBase, getKnowledgeByKeywords } from './moduleData.js';

/**
 * Enhanced AI Response System that uses actual module data
 * @param {string} userMessage - User's question
 * @param {string|null} selectedModule - Selected module ID
 * @returns {Promise<string>} - AI response with actual module data
 */
export async function getIntegratedAIResponse(userMessage, selectedModule = null) {
    try {
        // 1. First check the knowledge base for quick answers
        const knowledgeMatch = getKnowledgeByKeywords(userMessage);
        if (knowledgeMatch) {
            return formatKnowledgeBaseResponse(knowledgeMatch);
        }

        // 2. Use the enhanced AI response system from index.js
        const aiResponse = await getEnhancedAIResponse(userMessage, selectedModule);
        if (aiResponse && aiResponse.response) {
            return aiResponse.response;
        }

        // 3. Search across all modules if no specific module selected
        if (!selectedModule) {
            const searchResults = await searchAllModules(userMessage);
            if (searchResults.length > 0) {
                return formatSearchResults(userMessage, searchResults);
            }
        }

        // 4. Module-specific search if module selected
        if (selectedModule) {
            const moduleSpecificResponse = await getModuleSpecificResponse(userMessage, selectedModule);
            if (moduleSpecificResponse) {
                return moduleSpecificResponse;
            }
        }

        // 5. Fallback to general guidance
        return getGeneralGuidanceResponse(userMessage, selectedModule);

    } catch (error) {
        console.error('Error getting integrated AI response:', error);
        return getFallbackResponse(userMessage, selectedModule);
    }
}

/**
 * Format knowledge base response
 * @param {Object} knowledgeMatch - Matched knowledge base entry
 * @returns {string} - Formatted response
 */
function formatKnowledgeBaseResponse(knowledgeMatch) {
    return `**${knowledgeMatch.topic.charAt(0).toUpperCase() + knowledgeMatch.topic.slice(1).replace(/[_-]/g, ' ')}**

${knowledgeMatch.content}

💡 **This is a key topic for G3 certification!** Understanding these concepts thoroughly will help you in both the exam and real-world applications.

Is there a specific aspect of this topic you'd like me to explain further?`;
}

/**
 * Format search results across modules
 * @param {string} query - User's query
 * @param {Array} results - Search results
 * @returns {string} - Formatted response
 */
function formatSearchResults(query, results) {
    if (results.length === 1) {
        const result = results[0];
        return `**Found in Module ${result.moduleId}: ${result.title}**

${result.description}

${result.question ? `**Relevant Q&A:**\n**Q:** ${result.question}\n**A:** Click on Module ${result.moduleId} above to see the complete answer.` : ''}

💡 **Tip:** Select Module ${result.moduleId} from the sidebar for detailed information about "${query}".`;
    }

    const moduleGroups = {};
    results.forEach(result => {
        if (!moduleGroups[result.moduleId]) {
            moduleGroups[result.moduleId] = {
                title: result.title,
                description: result.description,
                matches: []
            };
        }
        if (result.question) {
            moduleGroups[result.moduleId].matches.push(result.question);
        }
    });

    let response = `**Found "${query}" in ${Object.keys(moduleGroups).length} modules:**\n\n`;
    
    Object.entries(moduleGroups).forEach(([moduleId, data]) => {
        response += `📚 **Module ${moduleId}: ${data.title}**\n`;
        response += `   ${data.description}\n`;
        if (data.matches.length > 0) {
            response += `   📝 Related topics: ${data.matches.slice(0, 2).join(', ')}${data.matches.length > 2 ? '...' : ''}\n`;
        }
        response += '\n';
    });

    response += `💡 **Next Step:** Select one of these modules from the sidebar for detailed explanations!`;
    return response;
}

/**
 * Get module-specific response
 * @param {string} message - User message
 * @param {string} moduleId - Module ID
 * @returns {Promise<string|null>} - Module-specific response or null
 */
async function getModuleSpecificResponse(message, moduleId) {
    try {
        const moduleLoader = allModulesData[moduleId];
        if (!moduleLoader) return null;

        const moduleData = await moduleLoader();
        const lowerMessage = message.toLowerCase();

        // Search through common questions first
        if (moduleData.commonQuestions) {
            const matchingQA = moduleData.commonQuestions.find(qa => 
                qa.question.toLowerCase().includes(lowerMessage) ||
                qa.answer.toLowerCase().includes(lowerMessage) ||
                lowerMessage.includes(qa.question.toLowerCase().split(' ')[0])
            );

            if (matchingQA) {
                return `**Module ${moduleData.moduleId}: ${moduleData.title}**
**Q:** ${matchingQA.question}

**A:** ${matchingQA.answer}

📚 **Module Context:** This is from ${moduleData.title} which covers ${moduleData.description.toLowerCase()}.

🎯 **Study Tip:** Make sure you understand this concept well - it's fundamental to G3 certification!

What other aspects of ${moduleData.title.toLowerCase()} would you like to explore?`;
            }
        }

        // Search through chapter content
        if (moduleData.chapters) {
            for (const chapter of Object.values(moduleData.chapters)) {
                const content = chapter.content;
                
                // Check for keyword matches in chapter topics
                if (content.keyTopics) {
                    const matchingTopic = content.keyTopics.find(topic =>
                        topic.toLowerCase().includes(lowerMessage) ||
                        lowerMessage.includes(topic.toLowerCase().split(' ')[0])
                    );

                    if (matchingTopic) {
                        let response = `**Module ${moduleData.moduleId}: ${matchingTopic}**\n\n`;
                        
                        response += `📖 **From Chapter:** ${chapter.title}\n\n`;
                        
                        if (content.overview) {
                            response += `**Overview:** ${content.overview}\n\n`;
                        }
                        
                        if (content.learningObjectives) {
                            const relevantObjectives = content.learningObjectives.filter(obj =>
                                obj.toLowerCase().includes(matchingTopic.toLowerCase().split(' ')[0])
                            );
                            if (relevantObjectives.length > 0) {
                                response += `**Learning Objectives:**\n${relevantObjectives.map(obj => `• ${obj}`).join('\n')}\n\n`;
                            }
                        }
                        
                        if (content.safetyPrinciples && matchingTopic.toLowerCase().includes('safety')) {
                            response += `**Safety Principles:**\n${content.safetyPrinciples.map(principle => `• ${principle}`).join('\n')}\n\n`;
                        }
                        
                        response += `💡 **Want to dive deeper?** Ask me about specific procedures, calculations, or requirements related to ${matchingTopic.toLowerCase()}.`;
                        
                        return response;
                    }
                }
            }
        }

        // Return module overview if no specific match found
        return getModuleOverviewResponse(moduleData);

    } catch (error) {
        console.error(`Error getting module ${moduleId} specific response:`, error);
        return null;
    }
}

/**
 * Get module overview response
 * @param {Object} moduleData - Module data object
 * @returns {string} - Module overview response
 */
function getModuleOverviewResponse(moduleData) {
    let response = `**Module ${moduleData.moduleId}: ${moduleData.title}**\n\n`;
    
    if (moduleData.description) {
        response += `${moduleData.description}\n\n`;
    }
    
    if (moduleData.chapters) {
        response += `**Available Chapters:**\n`;
        Object.values(moduleData.chapters).forEach(chapter => {
            response += `📖 ${chapter.title}\n`;
        });
        response += '\n';
    }
    
    if (moduleData.keywords && moduleData.keywords.length > 0) {
        response += `**Key Topics I Can Help With:**\n`;
        moduleData.keywords.slice(0, 8).forEach(keyword => {
            response += `• ${keyword}\n`;
        });
        response += '\n';
    }
    
    if (moduleData.commonQuestions && moduleData.commonQuestions.length > 0) {
        response += `**Popular Questions:**\n`;
        moduleData.commonQuestions.slice(0, 3).forEach(qa => {
            response += `❓ ${qa.question}\n`;
        });
        response += '\n';
    }
    
    response += `💬 **Ask me anything!** I can explain procedures, calculations, safety requirements, or code compliance from this module.`;
    
    return response;
}

/**
 * Get general guidance response
 * @param {string} message - User message
 * @param {string|null} moduleId - Selected module ID
 * @returns {string} - General guidance response
 */
function getGeneralGuidanceResponse(message, moduleId = null) {
    const moduleContext = moduleId ? `\n\n**Current Module:** Module ${moduleId} - ${moduleMapping[moduleId]?.title || 'Unknown'}` : '';
    
    return `I'd be happy to help you with "${message}"!${moduleContext}

**Here's how I can assist with your G3 certification studies:**

**🛡️ Safety First (Module 1):**
• PPE requirements and safety protocols
• Hazard identification and emergency procedures
• Workplace safety culture

**🔧 Technical Skills (Modules 2-6):**
• Tool selection and testing procedures
• Gas properties and calculations
• Code requirements (CSA B149.1/B149.2)
• Reading technical drawings
• Basic electrical principles

**⚙️ Practical Applications (Modules 7-9):**
• Customer service and professionalism
• Piping system design and installation
• Gas appliance operation and troubleshooting

**💡 Tips for Better Results:**
• Be specific about what you need help with
• Ask about procedures: "How do I test for gas leaks?"
• Request explanations: "Why is proper venting important?"
• Seek clarification: "What's the difference between natural gas and propane?"

${moduleId ? `Since you have Module ${moduleId} selected, I can provide detailed information from that specific module.` : 'Try selecting a specific module from the sidebar for targeted help!'}

What specific topic would you like to explore?`;
}

/**
 * Enhanced fallback response with module integration
 * @param {string} message - User message
 * @param {string|null} moduleId - Selected module
 * @returns {string} - Fallback response
 */
function getFallbackResponse(message, moduleId = null) {
    const moduleInfo = moduleId && moduleMapping[moduleId] ? moduleMapping[moduleId] : null;
    
    let response = `I understand you're asking about "${message}".`;
    
    if (moduleInfo) {
        response += `\n\n**Module ${moduleId} Context:** ${moduleInfo.title}\n${moduleInfo.description}`;
        if (moduleInfo.keywords) {
            response += `\n\n**Module Topics:** ${moduleInfo.keywords.slice(0, 6).join(', ')}`;
        }
    }
    
    response += `\n\n**🎯 G3 Certification Topics I Excel At:**

**Safety & Procedures:**
• Personal protective equipment requirements
• Gas leak detection and testing methods
• Emergency response procedures
• Lockout/tagout procedures

**Technical Knowledge:**
• Gas pressure calculations and pipe sizing
• Combustion principles and gas properties
• CSA code requirements and compliance
• Electrical safety for gas appliances

**Practical Skills:**
• Tool selection and calibration
• Installation procedures and techniques
• Troubleshooting gas appliances
• Customer service best practices

**💬 Try asking:**
• "Explain [specific concept]"
• "How do I [specific procedure]?"
• "What are the requirements for [specific topic]?"
• "Show me a calculation for [specific scenario]"

I'm here to help you succeed in your G3 certification! What would you like to learn about?`;

    return response;
}

/**
 * Quick topic suggestions based on current module
 * @param {string} moduleId - Module ID
 * @returns {Array} - Array of suggested topics
 */
export function getQuickTopicsForModule(moduleId) {
    const topicMap = {
        '1': [
            'PPE requirements for gas work',
            'Hazard identification procedures', 
            'Emergency response protocols',
            'Lockout/tagout procedures'
        ],
        '2': [
            'Gas detector calibration',
            'Pipe threading techniques',
            'Pressure testing equipment',
            'Tool safety requirements'
        ],
        '3': [
            'Natural gas vs propane properties',
            'BTU calculations',
            'Combustion principles',
            'Gas storage safety'
        ],
        '4': [
            'CSA B149.1 key requirements',
            'Installation code compliance',
            'Permit requirements',
            'Inspection procedures'
        ],
        '5': [
            'Ohm\'s law applications',
            'Electrical safety in gas work',
            'Multimeter usage',
            'Circuit troubleshooting'
        ],
        '6': [
            'Reading gas appliance schematics',
            'Technical manual interpretation',
            'Symbol identification',
            'Specification analysis'
        ],
        '7': [
            'Professional communication',
            'Conflict resolution',
            'Customer education',
            'Service documentation'
        ],
        '8': [
            'Pipe sizing calculations',
            'Joint types and applications',
            'Material selection',
            'Installation techniques'
        ],
        '9': [
            'Furnace operation cycles',
            'Burner adjustments',
            'Venting requirements',
            'Safety control systems'
        ]
    };
    
    return topicMap[moduleId] || [
        'Safety procedures',
        'Code requirements',
        'Testing methods',
        'Installation techniques'
    ];
}

// Export for use in HTML
window.getIntegratedAIResponse = getIntegratedAIResponse;
window.getQuickTopicsForModule = getQuickTopicsForModule;