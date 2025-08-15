// netlify/functions/search-manuals.js
// Dedicated manual search function with real web search

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { brand, model, equipmentType } = JSON.parse(event.body);
      
      console.log('Manual search request:', { brand, model, equipmentType });

      // Perform real manual search
      const manuals = await searchForActualManuals(brand, model, equipmentType);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          manuals,
          brand,
          model,
          equipmentType,
          searchPerformed: true,
          timestamp: new Date().toISOString()
        })
      };

    } catch (error) {
      console.error('Manual search error:', error);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: error.message,
          fallback: true
        })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

// Real manual search implementation
async function searchForActualManuals(brand, model, equipmentType) {
  if (!process.env.SERPAPI_KEY) {
    throw new Error('SERPAPI_KEY not configured');
  }

  const manuals = [];
  
  // Search for different types of manuals
  const searchQueries = [
    `${brand} ${model} service manual filetype:pdf`,
    `${brand} ${model} installation manual filetype:pdf`,
    `${brand} ${model} user manual filetype:pdf`,
    `${brand} ${model} parts manual filetype:pdf`,
    `${brand} ${model} troubleshooting guide filetype:pdf`,
    `site:${getBrandDomain(brand)} ${model} manual`,
    `"${brand}" "${model}" manual download`,
    `${brand} ${model} documentation pdf`
  ];

  // Perform searches
  for (const query of searchQueries) {
    try {
      const results = await performSerpAPISearch(query);
      const manualResults = filterForManuals(results, brand, model);
      manuals.push(...manualResults);
      
      // Rate limiting - don't overwhelm the API
      await delay(500);
      
    } catch (error) {
      console.error(`Search failed for query: ${query}`, error);
    }
  }

  // Remove duplicates and rank by relevance
  const uniqueManuals = removeDuplicateManuals(manuals);
  const rankedManuals = rankManualsByRelevance(uniqueManuals, brand, model);
  
  return rankedManuals.slice(0, 10); // Return top 10 results
}

// SerpAPI search implementation
async function performSerpAPISearch(query) {
  const apiKey = process.env.SERPAPI_KEY;
  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&num=10&gl=us&hl=en`;
  
  console.log('Performing SerpAPI search:', query);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.status}`);
  }
  
  const data = await response.json();
  
  return data.organic_results || [];
}

// Filter search results for actual manuals
function filterForManuals(results, brand, model) {
  return results
    .filter(result => {
      const url = result.link.toLowerCase();
      const title = result.title.toLowerCase();
      const snippet = (result.snippet || '').toLowerCase();
      
      // Must contain brand and model
      const hasBrand = title.includes(brand.toLowerCase()) || snippet.includes(brand.toLowerCase());
      const hasModel = title.includes(model.toLowerCase()) || snippet.includes(model.toLowerCase());
      
      if (!hasBrand || !hasModel) return false;
      
      // Look for manual indicators
      const manualKeywords = [
        'manual', 'guide', 'instruction', 'documentation', 'service',
        'installation', 'operation', 'maintenance', 'repair', 'parts',
        'troubleshooting', 'user guide', 'owner manual'
      ];
      
      const hasManualKeyword = manualKeywords.some(keyword => 
        title.includes(keyword) || snippet.includes(keyword)
      );
      
      // Prefer PDFs and official sources
      const isPDF = url.includes('.pdf') || title.includes('pdf');
      const isOfficialSite = isOfficialManufacturerSite(url, brand);
      const isManualSite = isKnownManualSite(url);
      
      return hasManualKeyword && (isPDF || isOfficialSite || isManualSite);
    })
    .map(result => ({
      title: result.title,
      url: result.link,
      description: result.snippet || '',
      isPDF: result.link.toLowerCase().includes('.pdf'),
      isOfficial: isOfficialManufacturerSite(result.link, brand),
      type: determineManualType(result.title, result.snippet),
      relevanceScore: calculateRelevanceScore(result, brand, model)
    }));
}

// Check if URL is from official manufacturer
function isOfficialManufacturerSite(url, brand) {
  const officialDomains = {
    'generac': ['generac.com', 'generacpower.com'],
    'kohler': ['kohler.com', 'kohlerpower.com', 'kohlerengines.com'],
    'carrier': ['carrier.com', 'carrier.ca'],
    'trane': ['trane.com', 'tranetechnologies.com'],
    'lennox': ['lennox.com', 'lennoxinternational.com'],
    'york': ['york.com', 'johnsoncontrols.com'],
    'rheem': ['rheem.com', 'rheemproducts.com'],
    'goodman': ['goodman-mfg.com', 'goodmanmfg.com'],
    'coleman': ['colemanac.com', 'coleman-hvac.com'],
    'heil': ['heil-hvac.com'],
    'payne': ['payne.com'],
    'briggs': ['briggsandstratton.com'],
    'honda': ['honda.com', 'hondaengines.com'],
    'champion': ['championpowerequipment.com'],
    'westinghouse': ['westinghouseoutdoorpower.com']
  };
  
  const domains = officialDomains[brand.toLowerCase()] || [];
  return domains.some(domain => url.includes(domain));
}

// Check if URL is from known manual repository
function isKnownManualSite(url) {
  const manualSites = [
    'manualslib.com',
    'repairclinic.com',
    'appliancepartspros.com',
    'partstown.com',
    'searspartsdirect.com',
    'manualzilla.com',
    'manualscat.com',
    'manualsplace.com'
  ];
  
  return manualSites.some(site => url.includes(site));
}

// Determine what type of manual this is
function determineManualType(title, snippet) {
  const text = (title + ' ' + snippet).toLowerCase();
  
  if (text.includes('service') || text.includes('repair')) return 'Service Manual';
  if (text.includes('installation') || text.includes('install')) return 'Installation Guide';
  if (text.includes('user') || text.includes('owner') || text.includes('operation')) return 'User Manual';
  if (text.includes('parts') || text.includes('component')) return 'Parts Manual';
  if (text.includes('troubleshoot') || text.includes('diagnostic')) return 'Troubleshooting Guide';
  if (text.includes('wiring') || text.includes('electrical')) return 'Wiring Diagram';
  if (text.includes('maintenance')) return 'Maintenance Guide';
  
  return 'Manual';
}

// Calculate relevance score
function calculateRelevanceScore(result, brand, model) {
  let score = 0;
  const text = (result.title + ' ' + result.snippet).toLowerCase();
  
  // Brand and model mentions
  if (text.includes(brand.toLowerCase())) score += 20;
  if (text.includes(model.toLowerCase())) score += 30;
  
  // File type bonus
  if (result.link.includes('.pdf')) score += 15;
  
  // Official site bonus
  if (isOfficialManufacturerSite(result.link, brand)) score += 25;
  
  // Manual keywords
  const manualKeywords = ['service manual', 'installation guide', 'user manual', 'parts manual'];
  manualKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 10;
  });
  
  // Known manual sites
  if (isKnownManualSite(result.link)) score += 5;
  
  return score;
}

// Remove duplicate manuals based on URL similarity
function removeDuplicateManuals(manuals) {
  const seen = new Set();
  return manuals.filter(manual => {
    const key = manual.url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Rank manuals by relevance score
function rankManualsByRelevance(manuals, brand, model) {
  return manuals.sort((a, b) => {
    // Official sites first
    if (a.isOfficial && !b.isOfficial) return -1;
    if (!a.isOfficial && b.isOfficial) return 1;
    
    // PDFs next
    if (a.isPDF && !b.isPDF) return -1;
    if (!a.isPDF && b.isPDF) return 1;
    
    // Then by relevance score
    return b.relevanceScore - a.relevanceScore;
  });
}

// Get brand domain for site-specific searches
function getBrandDomain(brand) {
  const domains = {
    'generac': 'generac.com',
    'kohler': 'kohlerpower.com',
    'carrier': 'carrier.com',
    'trane': 'trane.com',
    'lennox': 'lennox.com',
    'york': 'york.com',
    'rheem': 'rheem.com',
    'goodman': 'goodman-mfg.com',
    'coleman': 'colemanac.com',
    'heil': 'heil-hvac.com',
    'payne': 'payne.com',
    'briggs': 'briggsandstratton.com',
    'honda': 'honda.com',
    'champion': 'championpowerequipment.com',
    'westinghouse': 'westinghouseoutdoorpower.com'
  };
  
  return domains[brand.toLowerCase()] || '';
}

// Utility delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
