// TSSA G3 CSA Module Data Index - Exports all module data (Modules 1-9)
export { module1SafetyData } from './module1-safety.js';
export { module2ToolsData } from './module2-tools.js';
export { module3GasPropertiesData } from './module3-gas-properties.js';
export { module4CodesData } from './module4-codes.js';
export { module5ElectricityData } from './module5-electricity.js';
export { module6TechnicalDrawingsData } from './module6-technical-drawings.js';
export { module7CustomerRelationsData } from './module7-customer-relations.js';
export { module8PipingSystemsData } from './module8-piping-systems.js';
export { module9GasAppliancesData } from './module9-gas-appliances.js';

// Combined module data for easy access
export const allModulesData = {
  1: () => import('./module1-safety.js').then(m => m.module1SafetyData),
  2: () => import('./module2-tools.js').then(m => m.module2ToolsData),
  3: () => import('./module3-gas-properties.js').then(m => m.module3GasPropertiesData),
  4: () => import('./module4-codes.js').then(m => m.module4CodesData),
  5: () => import('./module5-electricity.js').then(m => m.module5ElectricityData),
  6: () => import('./module6-technical-drawings.js').then(m => m.module6TechnicalDrawingsData),
  7: () => import('./module7-customer-relations.js').then(m => m.module7CustomerRelationsData),
  8: () => import('./module8-piping-systems.js').then(m => m.module8PipingSystemsData),
  9: () => import('./module9-gas-appliances.js').then(m => m.module9GasAppliancesData)
};

// Module mapping for the TSSA G3 app
export const moduleInfo = [
  { id: 1, title: "Safety", description: "Fundamental safety principles and procedures" },
  { id: 2, title: "Fasteners, Tools and Test Equipment", description: "Essential tools and testing equipment" },
  { id: 3, title: "Properties and Safe Handling of Fuel Gases", description: "Gas properties and handling procedures" },
  { id: 4, title: "Gas Industry Codes, Acts and Regulations", description: "Regulatory requirements and compliance" },
  { id: 5, title: "Basic Electricity", description: "Electrical principles for gas technicians" },
  { id: 6, title: "Technical Drawings, Manuals and Graphs", description: "Reading and interpreting technical documentation" },
  { id: 7, title: "Customer Relations", description: "Professional customer relations and communication" },
  { id: 8, title: "Introduction to Piping and Tubing Systems", description: "Gas piping and tubing fundamentals" },
  { id: 9, title: "Introduction to Gas Appliances", description: "Gas appliance operation and basics" }
];

// Search function across all modules
export const searchAllModules = async (query) => {
  const results = [];
  const searchTerm = query.toLowerCase();
  
  for (const moduleId of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    try {
      const moduleData = await allModulesData[moduleId]();
      
      // Search in module title and description
      if (moduleData.title.toLowerCase().includes(searchTerm) || 
          moduleData.description.toLowerCase().includes(searchTerm)) {
        results.push({
          moduleId: moduleData.moduleId,
          title: moduleData.title,
          description: moduleData.description,
          matchType: 'module'
        });
      }
      
      // Search in keywords
      if (moduleData.keywords && moduleData.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchTerm))) {
        results.push({
          moduleId: moduleData.moduleId,
          title: moduleData.title,
          description: moduleData.description,
          matchType: 'keyword'
        });
      }
      
      // Search in common questions
      if (moduleData.commonQuestions) {
        moduleData.commonQuestions.forEach((qa, index) => {
          if (qa.question.toLowerCase().includes(searchTerm) || 
              qa.answer.toLowerCase().includes(searchTerm)) {
            results.push({
              moduleId: moduleData.moduleId,
              title: moduleData.title,
              questionIndex: index,
              question: qa.question,
              matchType: 'qa'
            });
          }
        });
      }
    } catch (error) {
      console.error(`Error loading module ${moduleId}:`, error);
    }
  }
  
  return results;
};

// Enhanced AI response system with better extraction
export const getAIResponse = async (query, moduleId = null) => {
  const lowerQuery = query.toLowerCase();
  
  // If a specific module is selected, load that module's data first
  if (moduleId && allModulesData[moduleId]) {
    try {
      const moduleData = await allModulesData[moduleId]();
      
      // 1. Check for exact matches in common questions
      const matchingQA = moduleData.commonQuestions?.find(qa => 
        qa.question.toLowerCase().includes(lowerQuery) ||
        qa.answer.toLowerCase().includes(lowerQuery)
      );
      
      if (matchingQA) {
        return {
          response: `**${moduleData.title} - ${matchingQA.question}**\n\n${matchingQA.answer}\n\n💡 **Want to know more?** Ask me about other ${moduleData.title.toLowerCase()} topics!`,
          moduleContext: moduleData.title,
          responseType: 'exact_match'
        };
      }
      
      // 2. Search through chapter content for relevant information
      if (moduleData.chapters) {
        for (const chapter of Object.values(moduleData.chapters)) {
          const content = chapter.content;
          
          // Match against key topics
          if (content.keyTopics) {
            const matchingTopic = content.keyTopics.find(topic => 
              topic.toLowerCase().includes(lowerQuery) || 
              lowerQuery.includes(topic.toLowerCase().split(' ')[0])
            );
            
            if (matchingTopic) {
              return {
                response: generateDetailedTopicResponse(matchingTopic, content, moduleData.title, chapter.title),
                moduleContext: moduleData.title,
                responseType: 'topic_match'
              };
            }
          }
        }
      }
      
      // 3. Check keywords for module-specific response
      const keywordMatch = moduleData.keywords?.find(keyword => 
        lowerQuery.includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(lowerQuery)
      );
      
      if (keywordMatch) {
        return {
          response: generateModuleSpecificResponse(lowerQuery, moduleData, keywordMatch),
          moduleContext: moduleData.title,
          responseType: 'module_specific'
        };
      }
      
      // 4. Provide general module guidance
      return {
        response: generateModuleOverview(moduleData),
        moduleContext: moduleData.title,
        responseType: 'module_overview'
      };
      
    } catch (error) {
      console.error(`Error loading module ${moduleId}:`, error);
    }
  }
  
  // Search across all modules if no specific module selected
  if (!moduleId) {
    try {
      const searchResults = await searchAllModules(query);
      if (searchResults.length > 0) {
        return generateCrossModuleResponse(query, searchResults);
      }
    } catch (error) {
      console.error('Error searching across modules:', error);
    }
  }
  
  // Fallback to general response
  return generateGeneralResponse(lowerQuery);
};

// Enhanced module-specific response generator
const generateModuleSpecificResponse = (query, moduleData, keyword) => {
  const moduleName = moduleData.title;
  
  // Try to find specific information in the module data
  if (moduleData.chapters) {
    // Search through chapters for relevant content
    for (const chapter of Object.values(moduleData.chapters)) {
      const content = chapter.content;
      
      // Check safety-related queries
      if (query.includes('safety') || query.includes('ppe')) {
        if (content.safetyPrinciples) {
          return `**${moduleName} - Safety Principles:**\n\n${content.safetyPrinciples.map(principle => `• ${principle}`).join('\n')}\n\n${content.keyTopics ? `**Key Safety Topics:**\n${content.keyTopics.filter(topic => topic.toLowerCase().includes('safety') || topic.toLowerCase().includes('ppe')).map(topic => `• ${topic}`).join('\n')}` : ''}\n\nNeed more specific safety information?`;
        }
      }
      
      // Check for hazard information
      if (query.includes('hazard') || query.includes('risk')) {
        if (content.primaryHazards) {
          return `**${moduleName} - Hazards:**\n\n**Primary Hazards:**\n${content.primaryHazards.map(hazard => `• ${hazard}`).join('\n')}\n\n${content.riskAssessment ? '**Risk Assessment Required:**\nProper risk assessment helps identify and mitigate these hazards.' : ''}\n\nWhat specific hazard would you like me to explain?`;
        }
      }
      
      // Check for tools/equipment queries
      if (query.includes('tool') || query.includes('equipment')) {
        if (content.keyTopics) {
          const toolTopics = content.keyTopics.filter(topic => 
            topic.toLowerCase().includes('tool') || 
            topic.toLowerCase().includes('equipment') ||
            topic.toLowerCase().includes('instrument')
          );
          if (toolTopics.length > 0) {
            return `**${moduleName} - Tools & Equipment:**\n\n${toolTopics.map(topic => `• ${topic}`).join('\n')}\n\n${content.learningObjectives ? `**You should be able to:**\n${content.learningObjectives.filter(obj => obj.toLowerCase().includes('tool') || obj.toLowerCase().includes('equipment')).map(obj => `• ${obj}`).join('\n')}` : ''}\n\nWhich tool or equipment do you need help with?`;
          }
        }
      }
    }
  }
  
  // Fallback to general module information
  if (moduleData.commonQuestions?.length > 0) {
    const relatedQA = moduleData.commonQuestions.find(qa => 
      qa.question.toLowerCase().includes(keyword.toLowerCase()) ||
      qa.answer.toLowerCase().includes(keyword.toLowerCase())
    );
    if (relatedQA) {
      return `**${moduleName} - ${relatedQA.question}**\n\n${relatedQA.answer}\n\nNeed clarification on anything else from this module?`;
    }
  }
  
  return `**${moduleName} Information:**\n\nI have detailed information about this module. Try asking about:\n\n${moduleData.keywords?.slice(0, 6).map(kw => `• ${kw}`).join('\n') || '• Safety procedures\n• Equipment and tools\n• Testing methods\n• Code requirements'}\n\nWhat specific topic interests you?`;
};

// Generate detailed response for specific topics
const generateDetailedTopicResponse = (topic, chapterContent, moduleName, chapterName) => {
  let response = `**${moduleName} - ${topic}**\n\n`;
  
  // Add learning objectives if available
  if (chapterContent.learningObjectives) {
    const relevantObjectives = chapterContent.learningObjectives.filter(obj => 
      obj.toLowerCase().includes(topic.toLowerCase().split(' ')[0])
    );
    if (relevantObjectives.length > 0) {
      response += `**Learning Objectives:**\n${relevantObjectives.map(obj => `• ${obj}`).join('\n')}\n\n`;
    }
  }
  
  // Add safety principles if it's safety-related
  if (topic.toLowerCase().includes('safety') && chapterContent.safetyPrinciples) {
    response += `**Safety Principles:**\n${chapterContent.safetyPrinciples.map(principle => `• ${principle}`).join('\n')}\n\n`;
  }
  
  // Add hazards if topic relates to hazards
  if (topic.toLowerCase().includes('hazard') && chapterContent.primaryHazards) {
    response += `**Primary Hazards:**\n${chapterContent.primaryHazards.map(hazard => `• ${hazard}`).join('\n')}\n\n`;
  }
  
  response += `📚 **Source:** ${chapterName}\n\nWhat else would you like to know about ${topic.toLowerCase()}?`;
  return response;
};

// Generate module overview response
const generateModuleOverview = (moduleData) => {
  let response = `**${moduleData.title} Module Overview**\n\n`;
  
  if (moduleData.description) {
    response += `${moduleData.description}\n\n`;
  }
  
  if (moduleData.chapters) {
    response += `**Module Chapters:**\n`;
    Object.values(moduleData.chapters).forEach(chapter => {
      response += `• ${chapter.title}\n`;
    });
    response += '\n';
  }
  
  if (moduleData.keywords && moduleData.keywords.length > 0) {
    response += `**Key Topics I can help with:**\n${moduleData.keywords.slice(0, 8).map(kw => `• ${kw}`).join('\n')}\n\n`;
  }
  
  response += `💬 **Ask me anything about:** Safety, procedures, equipment, calculations, or specific requirements from this module!`;
  return response;
};

// Generate response from cross-module search results
const generateCrossModuleResponse = (query, searchResults) => {
  if (searchResults.length === 1) {
    const result = searchResults[0];
    return {
      response: `**Found in Module ${result.moduleId}: ${result.title}**\n\n${result.description}\n\n💡 **Suggestion:** Try selecting Module ${result.moduleId} for more detailed information about "${query}".`,
      responseType: 'cross_module_single'
    };
  }
  
  const moduleMatches = [...new Set(searchResults.map(r => r.moduleId))];
  let response = `**Found "${query}" in ${moduleMatches.length} modules:**\n\n`;
  
  moduleMatches.forEach(moduleId => {
    const moduleResults = searchResults.filter(r => r.moduleId === moduleId);
    const moduleTitle = moduleResults[0].title;
    response += `📚 **Module ${moduleId}: ${moduleTitle}**\n`;
    if (moduleResults[0].description) {
      response += `   ${moduleResults[0].description}\n`;
    }
    response += '\n';
  });
  
  response += `💡 **Tip:** Select one of these modules above for detailed information, or ask a more specific question!`;
  
  return {
    response,
    responseType: 'cross_module_multiple'
  };
};

// Generate general response for common queries
const generateGeneralResponse = (query) => {
  if (query.includes('pressure') || query.includes('calculation')) {
    return {
      response: `**Gas Pressure Calculations:**\n\n**Key Concepts:**\n• Working pressure vs. test pressure\n• Pressure drop through piping systems\n• Flow rate calculations\n\n**Basic Formula:** Pressure drop = (Flow rate² × Length × Factor) / (Pipe diameter⁵)\n\n**Practical Application:**\n• Size piping to minimize pressure drop\n• Ensure adequate pressure at appliances\n• Account for fittings and elevation changes\n\nWould you like me to walk through a specific calculation example?`,
      responseType: 'general'
    };
  }
  
  if (query.includes('leak') || query.includes('test')) {
    return {
      response: `**Gas Leak Testing Procedures:**\n\n**Testing Methods:**\n1. **Soap Solution:** Apply to all connections, look for bubbles\n2. **Electronic Detectors:** Use for hard-to-reach areas\n3. **Pressure Testing:** Hold system pressure for specified time\n\n**Safety Requirements:**\n• Never use open flame for leak detection\n• Ensure proper ventilation\n• Use calibrated detection equipment\n• Follow manufacturer procedures\n\nWhat specific aspect of leak testing do you need help with?`,
      responseType: 'general'
    };
  }
  
  if (query.includes('safety') || query.includes('ppe')) {
    return {
      response: `**Gas Technician Safety:**\n\n**Essential PPE:**\n• Safety glasses and appropriate footwear\n• Cut-resistant gloves\n• Calibrated gas detector\n• High-visibility clothing when required\n\n**Key Safety Principles:**\n• Always assume gas is present until proven otherwise\n• Eliminate ignition sources\n• Ensure adequate ventilation\n• Follow emergency procedures\n\nWhat specific safety topic would you like to discuss?`,
      responseType: 'general'
    };
  }
  
  return {
    response: `I'm here to help with your CSA Gas Technician studies! I can explain:\n\n**Available Topics:**\n• Gas safety procedures and PPE requirements\n• Tools, fasteners, and testing equipment\n• Gas properties and combustion principles\n• CSA codes and regulations\n• Basic electrical principles\n\n**How to Get Help:**\n• Ask specific questions about procedures or concepts\n• Request explanations of calculations or formulas\n• Get clarification on safety requirements\n• Understand code requirements\n\nWhat specific topic would you like to explore?`,
    responseType: 'general'
  };
};