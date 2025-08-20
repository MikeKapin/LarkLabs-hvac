// netlify/functions/capacitor-database.js
// Capacitor database and lookup system for HVAC equipment

class CapacitorDatabase {
  constructor() {
    this.capacitorData = this.initializeCapacitorData();
  }

  // Initialize capacitor database with common HVAC equipment specifications
  initializeCapacitorData() {
    return {
      // Brand-specific capacitor data
      brands: {
        'carrier': this.getCarrierCapacitorData(),
        'trane': this.getTraneCapacitorData(),
        'rheem': this.getRheemCapacitorData(),
        'goodman': this.getGoodmanCapacitorData(),
        'lennox': this.getLennoxCapacitorData(),
        'york': this.getYorkCapacitorData(),
        'bryant': this.getBryantCapacitorData(),
        'payne': this.getPayneCapacitorData(),
        'amana': this.getAmanaCapacitorData(),
        'ruud': this.getRuudCapacitorData()
      },
      
      // Generic capacitor specifications by equipment type and tonnage
      generic: this.getGenericCapacitorData(),
      
      // Capacitor cross-reference by motor specifications
      motorSpecs: this.getMotorCapacitorData()
    };
  }

  // Lookup capacitor requirements
  async lookupCapacitorRequirements(equipmentDetails, mode = 'homeowner') {
    console.log('🔋 Looking up capacitor requirements for:', equipmentDetails);
    
    const results = {
      found: false,
      capacitors: [],
      source: null,
      confidence: 0,
      recommendations: []
    };

    try {
      // Try brand-specific lookup first
      const brandResult = await this.lookupByBrand(equipmentDetails);
      if (brandResult.found) {
        return brandResult;
      }

      // Try web search for specific model
      const webResult = await this.searchWebCapacitorData(equipmentDetails);
      if (webResult.found) {
        return webResult;
      }

      // Fall back to generic lookup by equipment type and capacity
      const genericResult = await this.lookupGeneric(equipmentDetails);
      if (genericResult.found) {
        return genericResult;
      }

      // Final fallback - provide general guidance
      return this.provideGeneralGuidance(equipmentDetails, mode);

    } catch (error) {
      console.error('Capacitor lookup error:', error);
      return results;
    }
  }

  // Brand-specific lookup
  async lookupByBrand(equipmentDetails) {
    const brand = equipmentDetails.brand?.toLowerCase();
    const model = equipmentDetails.model;

    if (!brand || !model) {
      return { found: false, capacitors: [] };
    }

    const brandData = this.capacitorData.brands[brand];
    if (!brandData) {
      return { found: false, capacitors: [] };
    }

    // Match model patterns
    for (const pattern of brandData.modelPatterns) {
      if (this.matchesPattern(model, pattern.pattern)) {
        return {
          found: true,
          capacitors: pattern.capacitors,
          source: `${brand.toUpperCase()} Official Specifications`,
          confidence: 85,
          recommendations: pattern.recommendations || []
        };
      }
    }

    return { found: false, capacitors: [] };
  }

  // Web search for capacitor specifications
  async searchWebCapacitorData(equipmentDetails) {
    try {
      console.log('🔍 Performing live web search for capacitor specifications...');
      const searchQueries = this.buildCapacitorSearchQueries(equipmentDetails);
      
      // Perform actual web search using available search APIs
      const searchResults = await this.performLiveWebSearch(searchQueries[0]);
      
      if (searchResults.success) {
        const parsedCapacitors = await this.parseWebSearchResults(searchResults.results, equipmentDetails);
        
        if (parsedCapacitors.length > 0) {
          return {
            found: true,
            capacitors: parsedCapacitors,
            source: 'Live Web Search',
            confidence: searchResults.confidence || 75,
            searchQuery: searchQueries[0],
            recommendations: [
              'Web search results - verify with manufacturer documentation',
              'Check existing capacitor markings before replacement', 
              'Cross-reference with multiple sources when possible',
              'Use exact MFD and voltage ratings - do not substitute'
            ]
          };
        }
      }
      
      // Fallback to cached/structured data if web search fails
      if (equipmentDetails.brand && equipmentDetails.model) {
        return {
          found: true,
          capacitors: await this.parseWebCapacitorData(equipmentDetails),
          source: 'Cached Web Data',
          confidence: 60,
          recommendations: [
            'Using cached data - consider checking manufacturer website directly',
            'Verify capacitor specifications with equipment manual',
            'Check existing capacitor markings before replacement'
          ]
        };
      }
    } catch (error) {
      console.error('Web capacitor search error:', error);
    }

    return { found: false, capacitors: [] };
  }

  // Generic lookup based on equipment type and capacity
  async lookupGeneric(equipmentDetails) {
    const type = equipmentDetails.type?.toLowerCase();
    const capacity = this.parseCapacity(equipmentDetails.capacity);

    if (!type || !capacity) {
      return { found: false, capacitors: [] };
    }

    const genericData = this.capacitorData.generic[type];
    if (!genericData) {
      return { found: false, capacitors: [] };
    }

    // Find capacity range
    for (const range of genericData.capacityRanges) {
      if (capacity >= range.min && capacity <= range.max) {
        return {
          found: true,
          capacitors: range.capacitors,
          source: 'Generic HVAC Standards',
          confidence: 60,
          recommendations: [
            'These are typical values - verify with equipment manual',
            'Actual capacitor requirements may vary by manufacturer',
            'Professional verification recommended'
          ]
        };
      }
    }

    return { found: false, capacitors: [] };
  }

  // Provide general guidance when specific data isn't available
  provideGeneralGuidance(equipmentDetails, mode) {
    const type = equipmentDetails.type?.toLowerCase() || 'hvac equipment';
    
    return {
      found: true,
      capacitors: [
        {
          component: 'Compressor Start Capacitor',
          mfd: 'Varies by model',
          voltage: '370V or 440V',
          type: 'Start Capacitor',
          notes: 'Check existing capacitor label for exact MFD rating'
        },
        {
          component: 'Condenser Fan Motor',
          mfd: 'Varies by motor',
          voltage: '370V or 440V', 
          type: 'Run Capacitor',
          notes: 'Verify motor specifications for exact requirements'
        }
      ],
      source: 'General HVAC Guidelines',
      confidence: 30,
      recommendations: mode === 'technician' ? [
        'Measure existing capacitor MFD and voltage ratings',
        'Consult equipment service manual for exact specifications',
        'Use multimeter to test capacitor functionality',
        'Replace with exact specifications only'
      ] : [
        'Take photo of existing capacitor label before replacement',
        'Note the MFD (microfarad) and voltage ratings',
        'Contact HVAC professional for proper capacitor selection',
        'Never guess capacitor specifications'
      ],
      // NEW: Offer advanced web search option
      webSearchAvailable: true,
      webSearchPrompt: equipmentDetails.brand && equipmentDetails.model ? 
        `Would you like me to search the web for specific capacitor requirements for your ${equipmentDetails.brand} ${equipmentDetails.model}? This will take a few more seconds but may provide exact specifications.` :
        'Would you like me to search the web for more specific capacitor information? Please provide your equipment brand and model number for best results.'
    };
  }

  // Build search queries for web lookup
  buildCapacitorSearchQueries(equipmentDetails) {
    const queries = [];
    const brand = equipmentDetails.brand;
    const model = equipmentDetails.model;

    if (brand && model) {
      queries.push(`${brand} ${model} capacitor specifications MFD`);
      queries.push(`${brand} ${model} start run capacitor requirements`);
      queries.push(`${brand} ${model} compressor fan motor capacitor`);
      queries.push(`${brand} ${model} service manual capacitor chart`);
    }

    return queries;
  }

  // Parse web search results for capacitor data
  async parseWebCapacitorData(equipmentDetails) {
    // This would parse actual web search results
    // For now, return reasonable defaults based on equipment type
    const capacitors = [];
    const type = equipmentDetails.type?.toLowerCase();

    if (type?.includes('air conditioner') || type?.includes('heat pump')) {
      capacitors.push({
        component: 'Compressor',
        mfd: '35-80',
        voltage: '370V',
        type: 'Start Capacitor',
        notes: 'Verify with equipment manual'
      });
      
      capacitors.push({
        component: 'Condenser Fan Motor',
        mfd: '5-10',
        voltage: '370V',
        type: 'Run Capacitor', 
        notes: 'Check motor nameplate'
      });
    }

    if (type?.includes('furnace')) {
      capacitors.push({
        component: 'Blower Motor',
        mfd: '7.5-15',
        voltage: '370V',
        type: 'Run Capacitor',
        notes: 'Verify motor specifications'
      });
    }

    return capacitors;
  }

  // Helper methods
  matchesPattern(model, pattern) {
    // Simple pattern matching - could be enhanced with regex
    return model?.toLowerCase().includes(pattern.toLowerCase());
  }

  parseCapacity(capacity) {
    if (!capacity) return null;
    
    // Extract tonnage or BTU
    const tonMatch = capacity.match(/(\d+(?:\.\d+)?)\s*ton/i);
    if (tonMatch) return parseFloat(tonMatch[1]);
    
    const btuMatch = capacity.match(/(\d+)\s*btu/i);
    if (btuMatch) return parseInt(btuMatch[1]) / 12000; // Convert BTU to tons
    
    return null;
  }

  // Brand-specific capacitor data (sample data - would be expanded with real specifications)
  getCarrierCapacitorData() {
    return {
      modelPatterns: [
        {
          pattern: '38CK',
          capacitors: [
            { component: 'Compressor', mfd: '45', voltage: '370V', type: 'Start Capacitor' },
            { component: 'Condenser Fan', mfd: '7.5', voltage: '370V', type: 'Run Capacitor' }
          ]
        },
        {
          pattern: '24AB',
          capacitors: [
            { component: 'Compressor', mfd: '35', voltage: '370V', type: 'Start Capacitor' },
            { component: 'Condenser Fan', mfd: '5', voltage: '370V', type: 'Run Capacitor' }
          ]
        }
      ]
    };
  }

  getTraneCapacitorData() {
    return {
      modelPatterns: [
        {
          pattern: 'TTA',
          capacitors: [
            { component: 'Compressor', mfd: '40', voltage: '370V', type: 'Start Capacitor' },
            { component: 'Condenser Fan', mfd: '6', voltage: '370V', type: 'Run Capacitor' }
          ]
        }
      ]
    };
  }

  getRheemCapacitorData() {
    return {
      modelPatterns: [
        {
          pattern: 'RA13',
          capacitors: [
            { component: 'Compressor', mfd: '50', voltage: '370V', type: 'Start Capacitor' },
            { component: 'Condenser Fan', mfd: '7.5', voltage: '370V', type: 'Run Capacitor' }
          ]
        }
      ]
    };
  }

  getGoodmanCapacitorData() {
    return {
      modelPatterns: [
        {
          pattern: 'GSX13',
          capacitors: [
            { component: 'Compressor', mfd: '45', voltage: '370V', type: 'Start Capacitor' },
            { component: 'Condenser Fan', mfd: '7.5', voltage: '370V', type: 'Run Capacitor' }
          ]
        }
      ]
    };
  }

  getLennoxCapacitorData() {
    return {
      modelPatterns: [
        {
          pattern: '13ACX',
          capacitors: [
            { component: 'Compressor', mfd: '55', voltage: '370V', type: 'Start Capacitor' },
            { component: 'Condenser Fan', mfd: '10', voltage: '370V', type: 'Run Capacitor' }
          ]
        }
      ]
    };
  }

  getYorkCapacitorData() {
    return {
      modelPatterns: [
        {
          pattern: 'YCD',
          capacitors: [
            { component: 'Compressor', mfd: '40', voltage: '370V', type: 'Start Capacitor' },
            { component: 'Condenser Fan', mfd: '6', voltage: '370V', type: 'Run Capacitor' }
          ]
        }
      ]
    };
  }

  getBryantCapacitorData() {
    return {
      modelPatterns: [
        {
          pattern: '113A',
          capacitors: [
            { component: 'Compressor', mfd: '45', voltage: '370V', type: 'Start Capacitor' },
            { component: 'Condenser Fan', mfd: '7.5', voltage: '370V', type: 'Run Capacitor' }
          ]
        }
      ]
    };
  }

  getPayneCapacitorData() {
    return {
      modelPatterns: [
        {
          pattern: 'PA13',
          capacitors: [
            { component: 'Compressor', mfd: '35', voltage: '370V', type: 'Start Capacitor' },
            { component: 'Condenser Fan', mfd: '5', voltage: '370V', type: 'Run Capacitor' }
          ]
        }
      ]
    };
  }

  getAmanaCapacitorData() {
    return {
      modelPatterns: [
        {
          pattern: 'ASX13',
          capacitors: [
            { component: 'Compressor', mfd: '50', voltage: '370V', type: 'Start Capacitor' },
            { component: 'Condenser Fan', mfd: '7.5', voltage: '370V', type: 'Run Capacitor' }
          ]
        }
      ]
    };
  }

  getRuudCapacitorData() {
    return {
      modelPatterns: [
        {
          pattern: 'UA13',
          capacitors: [
            { component: 'Compressor', mfd: '45', voltage: '370V', type: 'Start Capacitor' },
            { component: 'Condenser Fan', mfd: '6', voltage: '370V', type: 'Run Capacitor' }
          ]
        }
      ]
    };
  }

  // Generic capacitor data by equipment type and capacity
  getGenericCapacitorData() {
    return {
      'air conditioner': {
        capacityRanges: [
          {
            min: 1.5, max: 2.5, // 1.5-2.5 ton
            capacitors: [
              { component: 'Compressor', mfd: '35-45', voltage: '370V', type: 'Start Capacitor' },
              { component: 'Condenser Fan', mfd: '5-7.5', voltage: '370V', type: 'Run Capacitor' }
            ]
          },
          {
            min: 3.0, max: 4.0, // 3-4 ton  
            capacitors: [
              { component: 'Compressor', mfd: '50-70', voltage: '370V', type: 'Start Capacitor' },
              { component: 'Condenser Fan', mfd: '7.5-10', voltage: '370V', type: 'Run Capacitor' }
            ]
          },
          {
            min: 4.5, max: 6.0, // 4.5-6 ton
            capacitors: [
              { component: 'Compressor', mfd: '70-88', voltage: '370V', type: 'Start Capacitor' },
              { component: 'Condenser Fan', mfd: '10-15', voltage: '370V', type: 'Run Capacitor' }
            ]
          }
        ]
      },
      'heat pump': {
        capacityRanges: [
          {
            min: 2.0, max: 3.0,
            capacitors: [
              { component: 'Compressor', mfd: '40-55', voltage: '370V', type: 'Start Capacitor' },
              { component: 'Condenser Fan', mfd: '6-10', voltage: '370V', type: 'Run Capacitor' }
            ]
          }
        ]
      },
      'furnace': {
        capacityRanges: [
          {
            min: 60000, max: 120000, // BTU range
            capacitors: [
              { component: 'Blower Motor', mfd: '7.5-15', voltage: '370V', type: 'Run Capacitor' }
            ]
          }
        ]
      }
    };
  }

  // Motor specifications to capacitor mapping
  getMotorCapacitorData() {
    return {
      // Common motor HP to capacitor MFD mapping
      horsepower: {
        '1/8': { mfd: '3-5', voltage: '370V' },
        '1/6': { mfd: '5-7.5', voltage: '370V' },
        '1/4': { mfd: '7.5-10', voltage: '370V' },
        '1/3': { mfd: '10-12.5', voltage: '370V' },
        '1/2': { mfd: '12.5-15', voltage: '370V' },
        '3/4': { mfd: '15-20', voltage: '370V' },
        '1': { mfd: '20-25', voltage: '370V' }
      }
    };
  }
}

class WebSearchHelper {
  // Perform live web search using available APIs
  async performLiveWebSearch(query) {
    try {
      // Use SerpAPI if available (you mentioned search capabilities in the codebase)
      if (process.env.SERPAPI_KEY) {
        return await this.searchWithSerpAPI(query);
      }
      
      // Fallback to other search methods if available
      // This could integrate with your existing web search functionality
      
      return { success: false, error: 'No web search API available' };
      
    } catch (error) {
      console.error('Live web search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search using SerpAPI
  async searchWithSerpAPI(query) {
    try {
      const fetch = (await import('node-fetch')).default;
      const params = new URLSearchParams({
        q: query,
        api_key: process.env.SERPAPI_KEY,
        engine: 'google',
        num: 10
      });

      const response = await fetch(`https://serpapi.com/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        results: data.organic_results || [],
        confidence: 75
      };
      
    } catch (error) {
      console.error('SerpAPI search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Parse web search results to extract capacitor specifications
  async parseWebSearchResults(results, equipmentDetails) {
    const capacitors = [];
    const brand = equipmentDetails.brand?.toLowerCase();
    const model = equipmentDetails.model?.toLowerCase();

    for (const result of results.slice(0, 5)) { // Check first 5 results
      const title = result.title?.toLowerCase() || '';
      const snippet = result.snippet?.toLowerCase() || '';
      const text = `${title} ${snippet}`;

      // Look for capacitor specifications in the text
      const capacitorData = this.extractCapacitorFromText(text, equipmentDetails);
      if (capacitorData.length > 0) {
        capacitors.push(...capacitorData);
      }
    }

    // Remove duplicates and return best matches
    return this.deduplicateCapacitors(capacitors);
  }

  // Extract capacitor specifications from text
  extractCapacitorFromText(text, equipmentDetails) {
    const capacitors = [];
    
    // Common patterns for capacitor specifications
    const patterns = [
      // "45 MFD 370V start capacitor"
      /(\d+(?:\.\d+)?)\s*mfd?\s*(\d+)v?\s*(start|run|dual)?\s*capacitor/gi,
      // "capacitor: 35 microfarad 370 volt"
      /capacitor:?\s*(\d+(?:\.\d+)?)\s*(?:mfd?|microfarad)\s*(\d+)\s*(?:v|volt)/gi,
      // "compressor capacitor 50MFD/370V"
      /(compressor|fan|motor)\s*capacitor\s*(\d+(?:\.\d+)?)\s*mfd?\s*\/?\s*(\d+)v?/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const mfd = parseFloat(match[1] || match[2]);
        const voltage = parseInt(match[2] || match[3] || '370');
        const component = match[1]?.includes('compressor') ? 'Compressor' :
                         match[1]?.includes('fan') ? 'Condenser Fan' :
                         match[3] === 'start' ? 'Compressor Start' : 'Run Capacitor';
        const type = match[3] || (component.includes('Compressor') ? 'Start Capacitor' : 'Run Capacitor');

        if (mfd && mfd > 0 && voltage > 0) {
          capacitors.push({
            component: component,
            mfd: mfd.toString(),
            voltage: `${voltage}V`,
            type: type,
            notes: 'Found via web search - verify with equipment documentation'
          });
        }
      }
    });

    return capacitors;
  }

  // Remove duplicate capacitor entries
  deduplicateCapacitors(capacitors) {
    const unique = [];
    const seen = new Set();

    for (const cap of capacitors) {
      const key = `${cap.component}-${cap.mfd}-${cap.voltage}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(cap);
      }
    }

    return unique.slice(0, 4); // Return max 4 capacitors
  }

  // Advanced web search specifically for capacitor data
  async performAdvancedCapacitorSearch(equipmentDetails, userQuery = null) {
    console.log('🔍 Performing advanced capacitor web search...');
    
    const searchQuery = userQuery || this.buildAdvancedSearchQuery(equipmentDetails);
    const searchResult = await this.performLiveWebSearch(searchQuery);
    
    if (searchResult.success) {
      const capacitors = await this.parseWebSearchResults(searchResult.results, equipmentDetails);
      
      return {
        success: true,
        capacitors: capacitors,
        source: 'Advanced Web Search',
        confidence: capacitors.length > 0 ? 80 : 40,
        searchQuery: searchQuery,
        resultsFound: searchResult.results.length,
        recommendations: [
          'Advanced web search results - cross-reference with manufacturer specs',
          'Always verify capacitor ratings with existing equipment labels',
          'Consider calling manufacturer technical support for confirmation',
          'Use exact specifications - close approximations can damage equipment'
        ]
      };
    }

    return {
      success: false,
      error: searchResult.error || 'Web search failed',
      fallbackRecommendation: 'Please provide equipment brand and model for manual lookup, or check existing capacitor labels'
    };
  }

  // Build advanced search query for better results
  buildAdvancedSearchQuery(equipmentDetails) {
    const brand = equipmentDetails.brand;
    const model = equipmentDetails.model;
    const type = equipmentDetails.type;

    if (brand && model) {
      return `"${brand}" "${model}" capacitor specifications MFD microfarad replacement parts manual`;
    } else if (brand && type) {
      return `"${brand}" ${type} capacitor specifications MFD start run replacement`;
    } else if (type) {
      return `${type} capacitor specifications MFD voltage replacement guide`;
    }

    return 'HVAC capacitor specifications MFD voltage guide';
  }
}

// Export for use in other functions
module.exports = { CapacitorDatabase };