import React, { useState } from 'react';
import { Search, BookOpen, Loader, AlertTriangle, Lightbulb, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import { moduleInfo, searchAllModules, getAIResponse, allModulesData } from '../data/index.js';

const CSAGasSearchTool = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    setExplanation('');
    setLastSearchQuery(query);
    
    try {
      // Simulate search delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Search across all modules using the real data
      const results = await searchAllModules(query);
      
      // Also search in the comprehensive knowledge base and module data
      const enhancedResults = await getEnhancedSearchResults(query, results);
      
      setSearchResults(enhancedResults);
      setIsSearching(false);
      
      if (enhancedResults.length > 0) {
        generateComprehensiveExplanation(enhancedResults, query);
      }
    } catch (error) {
      console.error('Search error:', error);
      setIsSearching(false);
      setExplanation('Sorry, there was an error searching the course materials. Please try again.');
    }
  };

  const getEnhancedSearchResults = async (searchQuery, basicResults) => {
    const enhancedResults = [...basicResults];
    const lowerQuery = searchQuery.toLowerCase();
    
    // Search through all available modules for more comprehensive results
    for (const moduleId of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      try {
        const moduleLoader = allModulesData[moduleId];
        if (moduleLoader) {
          const moduleData = await moduleLoader();
          
          // Search in chapters and detailed content
          if (moduleData.chapters) {
            Object.values(moduleData.chapters).forEach(chapter => {
              const content = chapter.content;
              
              // Check if query matches chapter content
              if (content && (
                chapter.title.toLowerCase().includes(lowerQuery) ||
                content.overview?.toLowerCase().includes(lowerQuery) ||
                content.keyTopics?.some(topic => topic.toLowerCase().includes(lowerQuery)) ||
                content.learningObjectives?.some(obj => obj.toLowerCase().includes(lowerQuery))
              )) {
                const existingResult = enhancedResults.find(r => r.moduleId === moduleId);
                if (!existingResult) {
                  enhancedResults.push({
                    moduleId: moduleData.moduleId,
                    title: moduleData.title,
                    description: moduleData.description,
                    matchType: 'chapter_content',
                    chapterMatch: {
                      chapterTitle: chapter.title,
                      keyTopics: content.keyTopics || [],
                      overview: content.overview || ''
                    }
                  });
                }
              }
            });
          }

          // Search in practical scenarios
          if (moduleData.practicalScenarios) {
            moduleData.practicalScenarios.forEach(scenario => {
              if (scenario.title.toLowerCase().includes(lowerQuery) ||
                  scenario.scenario.toLowerCase().includes(lowerQuery)) {
                enhancedResults.push({
                  moduleId: moduleData.moduleId,
                  title: moduleData.title,
                  matchType: 'practical_scenario',
                  scenarioMatch: scenario
                });
              }
            });
          }

          // Search in common questions
          if (moduleData.commonQuestions) {
            moduleData.commonQuestions.forEach((qa, index) => {
              if (qa.question.toLowerCase().includes(lowerQuery) ||
                  qa.answer.toLowerCase().includes(lowerQuery)) {
                enhancedResults.push({
                  moduleId: moduleData.moduleId,
                  title: moduleData.title,
                  matchType: 'qa',
                  qaMatch: qa,
                  questionIndex: index
                });
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error searching module ${moduleId}:`, error);
      }
    }
    
    return enhancedResults;
  };

  const generateComprehensiveExplanation = async (results, searchQuery) => {
    setIsExplaining(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      let explanation = `# TSSA G3 Course Analysis: "${searchQuery}"\n\n`;
      
      // Group results by module for better organization
      const moduleGroups = {};
      results.forEach(result => {
        if (!moduleGroups[result.moduleId]) {
          moduleGroups[result.moduleId] = {
            moduleInfo: { id: result.moduleId, title: result.title, description: result.description },
            results: []
          };
        }
        moduleGroups[result.moduleId].results.push(result);
      });

      // Generate comprehensive explanations for each module
      for (const [moduleId, group] of Object.entries(moduleGroups)) {
        explanation += `## 📚 Module ${moduleId}: ${group.moduleInfo.title}\n\n`;
        
        // Add module context
        if (group.moduleInfo.description) {
          explanation += `**Module Overview:** ${group.moduleInfo.description}\n\n`;
        }

        // Process different types of matches
        const qaMatches = group.results.filter(r => r.matchType === 'qa');
        const chapterMatches = group.results.filter(r => r.matchType === 'chapter_content');
        const scenarioMatches = group.results.filter(r => r.matchType === 'practical_scenario');

        // Add Q&A content
        if (qaMatches.length > 0) {
          explanation += `### 💬 Key Questions & Answers:\n\n`;
          qaMatches.forEach(match => {
            explanation += `**Q: ${match.qaMatch.question}**\n`;
            explanation += `${match.qaMatch.answer}\n\n`;
          });
        }

        // Add chapter content
        if (chapterMatches.length > 0) {
          explanation += `### 📖 Chapter Content:\n\n`;
          chapterMatches.forEach(match => {
            if (match.chapterMatch) {
              explanation += `**${match.chapterMatch.chapterTitle}**\n`;
              if (match.chapterMatch.overview) {
                explanation += `${match.chapterMatch.overview}\n\n`;
              }
              if (match.chapterMatch.keyTopics && match.chapterMatch.keyTopics.length > 0) {
                explanation += `**Key Topics:**\n`;
                match.chapterMatch.keyTopics.forEach(topic => {
                  explanation += `• ${topic}\n`;
                });
                explanation += '\n';
              }
            }
          });
        }

        // Add practical scenarios
        if (scenarioMatches.length > 0) {
          explanation += `### 🔧 Practical Applications:\n\n`;
          scenarioMatches.forEach(match => {
            const scenario = match.scenarioMatch;
            explanation += `**Scenario: ${scenario.title}**\n`;
            explanation += `${scenario.scenario}\n\n`;
            if (scenario.safetySteps && scenario.safetySteps.length > 0) {
              explanation += `**Safety Steps:**\n`;
              scenario.safetySteps.forEach(step => {
                explanation += `• ${step}\n`;
              });
              explanation += '\n';
            }
            if (scenario.keyLearning) {
              explanation += `**Key Learning:** ${scenario.keyLearning}\n\n`;
            }
          });
        }
      }

      // Add comprehensive analysis and recommendations
      explanation += await generateAIInsights(searchQuery, results);

      // Add study recommendations
      explanation += generateStudyRecommendations(searchQuery, results);

      setExplanation(explanation);
      setIsExplaining(false);
      
    } catch (error) {
      console.error('Error generating explanation:', error);
      setIsExplaining(false);
      setExplanation('Sorry, there was an error generating the comprehensive explanation. Please try searching again.');
    }
  };

  const generateAIInsights = async (query, results) => {
    const lowerQuery = query.toLowerCase();
    let insights = `## 🧠 AI Analysis & Insights\n\n`;
    
    // Safety-related insights
    if (lowerQuery.includes('safety') || lowerQuery.includes('ppe') || lowerQuery.includes('hazard')) {
      insights += `### 🛡️ Safety Focus:\n`;
      insights += `When working with gas systems, safety is paramount. Based on your query about "${query}", here are critical safety considerations:\n\n`;
      insights += `• **Always use calibrated gas detection equipment** - Never assume gas is absent\n`;
      insights += `• **Eliminate all ignition sources** before beginning work\n`;
      insights += `• **Ensure adequate ventilation** in work areas\n`;
      insights += `• **Follow emergency procedures** if gas is detected\n`;
      insights += `• **Use proper PPE** including safety glasses, appropriate footwear, and protective clothing\n\n`;
    }

    // Code compliance insights
    if (lowerQuery.includes('code') || lowerQuery.includes('regulation') || lowerQuery.includes('standard')) {
      insights += `### 📋 Code Compliance:\n`;
      insights += `Understanding and following CSA B149.1 and related codes is essential:\n\n`;
      insights += `• **Stay current** with the latest edition of codes and standards\n`;
      insights += `• **Check local amendments** - municipalities may have additional requirements\n`;
      insights += `• **Document all work** properly for inspection and compliance\n`;
      insights += `• **Use approved materials** and installation methods only\n\n`;
    }

    // Technical insights based on query content
    if (lowerQuery.includes('pressure') || lowerQuery.includes('sizing') || lowerQuery.includes('calculation')) {
      insights += `### 📐 Technical Calculations:\n`;
      insights += `Proper calculations are crucial for safe gas system design:\n\n`;
      insights += `• **Pipe sizing** affects both safety and system performance\n`;
      insights += `• **Pressure drop calculations** ensure adequate gas supply to all appliances\n`;
      insights += `• **Test pressures** must be sufficient to verify system integrity\n`;
      insights += `• **Flow rates** determine proper equipment sizing\n\n`;
    }

    // Installation insights
    if (lowerQuery.includes('install') || lowerQuery.includes('pipe') || lowerQuery.includes('fitting')) {
      insights += `### 🔧 Installation Best Practices:\n`;
      insights += `Quality installation prevents future problems:\n\n`;
      insights += `• **Follow manufacturer specifications** for all components\n`;
      insights += `• **Use proper joint compounds** and sealing methods\n`;
      insights += `• **Test all connections** before final commissioning\n`;
      insights += `• **Provide proper support** for piping systems\n`;
      insights += `• **Maintain required clearances** for safety and service access\n\n`;
    }

    return insights;
  };

  const generateStudyRecommendations = (query, results) => {
    let recommendations = `## 📚 Study Recommendations\n\n`;
    
    const moduleIds = [...new Set(results.map(r => r.moduleId))];
    
    recommendations += `### 🎯 Focus Areas for "${query}":\n\n`;
    
    moduleIds.forEach(moduleId => {
      const moduleInfo = results.find(r => r.moduleId === moduleId);
      recommendations += `• **Module ${moduleId}: ${moduleInfo?.title}** - Review key concepts and practical applications\n`;
    });

    recommendations += `\n### 💡 Study Tips:\n\n`;
    recommendations += `• **Practice calculations** with real-world scenarios\n`;
    recommendations += `• **Review safety procedures** regularly - they're fundamental to all gas work\n`;
    recommendations += `• **Study code references** - know where to find information quickly\n`;
    recommendations += `• **Apply knowledge practically** - relate concepts to actual installations\n`;
    recommendations += `• **Use multiple learning methods** - read, practice, and discuss concepts\n\n`;

    recommendations += `### 📖 Next Steps:\n\n`;
    recommendations += `1. **Review the modules** identified above in detail\n`;
    recommendations += `2. **Practice with sample questions** and scenarios\n`;
    recommendations += `3. **Study related topics** to build comprehensive understanding\n`;
    recommendations += `4. **Apply safety principles** in all gas work situations\n\n`;

    return recommendations;
  };

  const sampleSearches = [
    'gas pressure testing procedures',
    'PPE requirements for gas work', 
    'natural gas properties and characteristics',
    'CSA B149.1 code requirements',
    'pipe sizing calculations',
    'venting system categories',
    'leak detection methods',
    'appliance installation clearances',
    'electrical safety in gas systems',
    'emergency response procedures',
    'combustible gas meters',
    'customer service best practices'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">TSSA G3 Course Search & Analysis Tool</h1>
          </div>
          <h2 className="text-xl text-gray-600">Comprehensive Search & AI-Powered Explanations</h2>
          <p className="text-gray-500 mt-2">
            Search through all 9 modules with enhanced AI analysis and detailed explanations
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search TSSA G3 course materials... (e.g., 'pressure testing procedures', 'PPE requirements', 'gas properties')"
                className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Results Summary */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-green-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">
                Found {searchResults.length} result(s) for "{lastSearchQuery}"
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...new Set(searchResults.map(r => r.moduleId))].map(moduleId => {
                const moduleResults = searchResults.filter(r => r.moduleId === moduleId);
                const moduleTitle = moduleResults[0]?.title;
                const moduleDesc = moduleResults[0]?.description;
                
                return (
                  <div key={moduleId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                        Module {moduleId}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-800 mb-1">{moduleTitle}</h4>
                    <p className="text-sm text-gray-600 mb-2">{moduleDesc}</p>
                    <div className="text-xs text-gray-500">
                      {moduleResults.length} match(es) found
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Comprehensive Explanation */}
        {(explanation || isExplaining) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Lightbulb className="text-white" size={16} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">AI Comprehensive Analysis</h3>
              {isExplaining && (
                <span className="text-sm text-gray-500 ml-2">(Analyzing content...)</span>
              )}
            </div>
            
            {isExplaining ? (
              <div className="flex items-center gap-3 text-gray-600 py-8">
                <Loader className="animate-spin" size={24} />
                <div>
                  <p className="font-medium">Analyzing course content and generating comprehensive explanation...</p>
                  <p className="text-sm mt-1">This may take a few moments to provide thorough insights.</p>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed space-y-4 markdown-content">
                  {explanation.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={index} className="text-2xl font-bold text-gray-800 mb-4">{line.substring(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">{line.substring(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={index} className="text-lg font-medium text-gray-700 mt-4 mb-2">{line.substring(4)}</h3>;
                    } else if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={index} className="font-semibold text-gray-800">{line.slice(2, -2)}</p>;
                    } else if (line.startsWith('• ')) {
                      return <li key={index} className="ml-4 text-gray-700">{line.substring(2)}</li>;
                    } else if (line.trim()) {
                      return <p key={index} className="text-gray-700 mb-2">{line}</p>;
                    } else {
                      return <br key={index} />;
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sample Searches */}
        {!searchResults.length && !explanation && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="text-gray-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Try searching for:</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sampleSearches.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(sample)}
                  className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 border border-gray-200 hover:border-gray-300 flex items-center justify-between group"
                >
                  <span>"{sample}"</span>
                  <ChevronRight className="text-gray-400 group-hover:text-gray-600" size={16} />
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Enhanced Footer */}
        <footer className="mt-12 bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-gray-800">LARK Labs</span>
            </div>
            <p className="text-gray-600 mb-2">Advanced AI-Powered TSSA G3 Learning Tool</p>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 text-sm">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Search size={16} />
                <span>Comprehensive Search</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Lightbulb size={16} />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <BookOpen size={16} />
                <span>All 9 Modules Covered</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} LARK Labs. All rights reserved. 
              </p>
              <p className="text-xs text-gray-400 mt-2">
                This educational tool provides comprehensive search and AI-powered explanations of TSSA G3 course materials. 
                Always refer to current TSSA regulations and official course materials for certification requirements.
              </p>
              
              {/* Safety Notice */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" size={16} />
                  <div className="text-left">
                    <p className="text-xs font-medium text-yellow-800">Important Safety Reminder</p>
                    <p className="text-xs text-yellow-700">
                      This AI tutor supplements but does not replace official TSSA G3 training, current codes, manufacturer instructions, or professional judgment. 
                      Always prioritize safety and follow established procedures.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CSAGasSearchTool;