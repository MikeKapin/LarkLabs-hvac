/**
 * TSSA Question Bank Manager
 * Comprehensive management system for G2 and G3 certification questions
 * Using actual extracted content from existing simulators
 */

import g3Questions from './g3_questions_extracted.json';
import g2Questions from './g2_questions_extracted.json';

/**
 * CSA Module Structure and Topic Mapping
 * G3 (Level 1) - Foundation Level: 9 Units
 * G2 (Level 2) - Advanced Level: 15 Additional Units (Units 10-24)
 */
export const CSA_MODULES = {
  G3: {
    name: "Gas Technician 3 (Foundation Level)",
    description: "Entry-level certification covering fundamental gas safety, codes, and installation principles",
    totalUnits: 9,
    modules: {
      "Unit_1": {
        id: "CSA_Unit_1",
        name: "Safety",
        description: "Personal Protective Equipment, Hazard Identification, Safety Protocols",
        topics: [
          "Personal Protective Equipment (PPE)",
          "Hazard identification and assessment",
          "Safety procedures and protocols", 
          "Emergency response procedures",
          "Workplace health and safety",
          "WHMIS and hazardous materials"
        ],
        examWeight: 0.25 // 25% of G3 exam
      },
      "Unit_2": {
        id: "CSA_Unit_2", 
        name: "Fasteners, Tools and Test Equipment",
        description: "Tools, Fasteners, Testing Equipment and Procedures",
        topics: [
          "Hand tools and power tools",
          "Fasteners and hardware",
          "Test equipment and instruments",
          "Measurement and testing procedures",
          "Tool safety and maintenance",
          "Equipment calibration"
        ],
        examWeight: 0.08
      },
      "Unit_3": {
        id: "CSA_Unit_3",
        name: "Properties and Safe Handling of Fuel Gases",
        description: "Gas Properties, Characteristics, and Safe Handling Procedures",
        topics: [
          "Natural gas properties and characteristics",
          "Propane properties and characteristics", 
          "Gas detection and measurement",
          "Safe handling procedures",
          "Storage and transportation",
          "Gas calculations and conversions"
        ],
        examWeight: 0.15
      },
      "Unit_4": {
        id: "CSA_Unit_4",
        name: "Gas Industry Codes, Acts and Regulations", 
        description: "CSA B149 Codes, TSSA Regulations, Legal Framework",
        topics: [
          "CSA B149.1 Natural Gas Installation Code",
          "CSA B149.2 Propane Storage and Handling Code",
          "TSSA regulations and requirements",
          "Legal framework and compliance",
          "Code interpretation and application",
          "Inspection and approval processes"
        ],
        examWeight: 0.20
      },
      "Unit_4a": {
        id: "CSA_Unit_4a",
        name: "Laws Governing the Gas Industry",
        description: "Legal Requirements, Authorities, and Compliance",
        topics: [
          "Technical Standards and Safety Act",
          "Authority having jurisdiction",
          "Legal obligations and responsibilities",
          "Penalties and enforcement",
          "Appeals and hearings",
          "Due diligence requirements"
        ],
        examWeight: 0.08
      },
      "Unit_5": {
        id: "CSA_Unit_5",
        name: "Basic Electricity",
        description: "Electrical Fundamentals for Gas Appliances",
        topics: [
          "Basic electrical theory and principles",
          "Ohm's law and electrical calculations",
          "Electrical components and circuits",
          "Electrical safety procedures",
          "Testing electrical systems",
          "Control circuits and wiring"
        ],
        examWeight: 0.07
      },
      "Unit_6": {
        id: "CSA_Unit_6", 
        name: "Technical Drawings, Manuals and Graphs",
        description: "Reading Technical Documentation and Drawings",
        topics: [
          "Technical drawing interpretation",
          "Symbols and conventions",
          "Manufacturer specifications",
          "Installation manuals",
          "Performance curves and graphs",
          "Documentation requirements"
        ],
        examWeight: 0.05
      },
      "Unit_7": {
        id: "CSA_Unit_7",
        name: "Customer Relations", 
        description: "Professional Communication and Customer Service",
        topics: [
          "Professional communication skills",
          "Customer service principles",
          "Conflict resolution",
          "Documentation and reporting",
          "Professional ethics",
          "Public relations"
        ],
        examWeight: 0.04
      },
      "Unit_8": {
        id: "CSA_Unit_8",
        name: "Introduction to Piping and Tubing Systems",
        description: "Basic Piping Materials, Installation, and Testing",
        topics: [
          "Piping materials and specifications",
          "Basic installation techniques",
          "Pipe sizing fundamentals",
          "Testing procedures",
          "Support and protection",
          "Basic connections and fittings"
        ],
        examWeight: 0.04
      },
      "Unit_9": {
        id: "CSA_Unit_9",
        name: "Introduction to Gas Appliances",
        description: "Basic Appliance Types, Operation, and Safety",
        topics: [
          "Appliance types and classifications",
          "Basic operation principles",
          "Safety devices and controls",
          "Installation requirements",
          "Basic troubleshooting",
          "Maintenance procedures"
        ],
        examWeight: 0.04
      }
    }
  },
  G2: {
    name: "Gas Technician 2 (Advanced Level)", 
    description: "Advanced certification for hands-on installation, service, and troubleshooting",
    totalUnits: 15,
    prerequisite: "G3 Certification Required",
    modules: {
      "Unit_10": {
        id: "CSA_Unit_10",
        name: "Advanced Piping Systems",
        description: "Complex Piping Design, Installation, and Testing",
        topics: [
          "Advanced pipe sizing calculations",
          "Complex piping configurations",
          "High-pressure systems",
          "Welding and joining techniques",
          "Advanced testing procedures",
          "System commissioning"
        ],
        examWeight: 0.12
      },
      "Unit_11": {
        id: "CSA_Unit_11", 
        name: "Pressure Regulators",
        description: "Regulator Types, Installation, and Service",
        topics: [
          "Regulator types and applications",
          "Installation requirements",
          "Adjustment and calibration", 
          "Troubleshooting and repair",
          "Safety devices and relief systems",
          "Regulator testing procedures"
        ],
        examWeight: 0.08
      },
      "Unit_12": {
        id: "CSA_Unit_12",
        name: "Basic Electricity for Gas Fired Appliances", 
        description: "Advanced Electrical Systems in Gas Appliances",
        topics: [
          "Control circuit design",
          "Advanced electrical troubleshooting",
          "Motor controls and starters",
          "Electronic ignition systems",
          "Flame sensing and safety circuits",
          "Electrical code compliance"
        ],
        examWeight: 0.10
      },
      "Unit_13": {
        id: "CSA_Unit_13",
        name: "Controls",
        description: "Gas Appliance Controls and Safety Systems",
        topics: [
          "Gas valves and controls",
          "Safety shut-off devices",
          "Flame supervision systems",
          "Pressure switches and sensors",
          "Control system troubleshooting",
          "Electronic controls and diagnostics"
        ],
        examWeight: 0.12
      },
      "Unit_14": {
        id: "CSA_Unit_14", 
        name: "The Building as a System",
        description: "Building Science and System Interactions",
        topics: [
          "Building envelope and air leakage",
          "Ventilation and air quality",
          "Combustion air requirements",
          "Building pressurization",
          "Energy efficiency considerations",
          "System interactions and effects"
        ],
        examWeight: 0.08
      },
      "Unit_15": {
        id: "CSA_Unit_15",
        name: "Domestic Appliances",
        description: "Residential Gas Appliances Installation and Service", 
        topics: [
          "Range and cooktop installation",
          "Dryer installation and venting",
          "Fireplace and log set installation",
          "Barbecue and outdoor appliances",
          "Appliance conversions",
          "Service and troubleshooting"
        ],
        examWeight: 0.10
      },
      "Unit_16": {
        id: "CSA_Unit_16",
        name: "Gas Fired Refrigerators",
        description: "Gas Refrigeration Systems and Service",
        topics: [
          "Absorption refrigeration principles",
          "Installation requirements",
          "Ventilation and clearances",
          "Troubleshooting and service",
          "Safety considerations",
          "Performance testing"
        ],
        examWeight: 0.03
      },
      "Unit_17": {
        id: "CSA_Unit_17",
        name: "Conversion Burners",
        description: "Oil to Gas Conversions and Burner Systems",
        topics: [
          "Conversion burner types",
          "Installation procedures", 
          "Combustion testing and adjustment",
          "Safety device installation",
          "Code compliance requirements",
          "Performance evaluation"
        ],
        examWeight: 0.04
      },
      "Unit_18": {
        id: "CSA_Unit_18",
        name: "Water Heaters and Combination Systems",
        description: "Water Heating Systems Installation and Service",
        topics: [
          "Water heater types and sizing",
          "Installation requirements",
          "Venting systems",
          "Combination heating systems",
          "Service and troubleshooting",
          "Energy efficiency considerations"
        ],
        examWeight: 0.08
      },
      "Unit_19": {
        id: "CSA_Unit_19",
        name: "Forced Warm Air Appliances",
        description: "Furnace Installation, Service, and Troubleshooting",
        topics: [
          "Furnace types and classifications",
          "Installation requirements",
          "Duct system design",
          "Control system operation",
          "Troubleshooting procedures",
          "Efficiency testing and adjustment"
        ],
        examWeight: 0.12
      },
      "Unit_20": {
        id: "CSA_Unit_20", 
        name: "Hydronic Heating Systems",
        description: "Boiler and Hydronic System Installation and Service",
        topics: [
          "Boiler types and applications",
          "Hydronic system design",
          "Installation procedures",
          "Control systems",
          "System commissioning",
          "Troubleshooting and service"
        ],
        examWeight: 0.08
      },
      "Unit_21": {
        id: "CSA_Unit_21",
        name: "Space Heaters and Fireplaces",
        description: "Direct Heating Appliances Installation and Service", 
        topics: [
          "Space heater types and applications",
          "Fireplace installation",
          "Clearance requirements",
          "Venting systems",
          "Safety considerations",
          "Service procedures"
        ],
        examWeight: 0.06
      },
      "Unit_22": {
        id: "CSA_Unit_22",
        name: "Venting Systems",
        description: "Advanced Venting Design and Installation",
        topics: [
          "Venting system design principles",
          "Vent sizing calculations", 
          "Special venting systems",
          "Installation techniques",
          "Testing and commissioning",
          "Troubleshooting vent problems"
        ],
        examWeight: 0.10
      },
      "Unit_23": {
        id: "CSA_Unit_23", 
        name: "Forced Air Add-Ons",
        description: "Add-on Equipment and Accessories",
        topics: [
          "Humidification systems",
          "Air cleaning equipment",
          "Heat recovery systems",
          "Zone control systems",
          "Installation procedures",
          "System integration"
        ],
        examWeight: 0.04
      },
      "Unit_24": {
        id: "CSA_Unit_24",
        name: "Air Handling",
        description: "Air Movement and Distribution Systems",
        topics: [
          "Fan and blower systems",
          "Duct design and installation",
          "Air flow measurement",
          "System balancing",
          "Ventilation requirements",
          "Indoor air quality"
        ],
        examWeight: 0.05
      }
    }
  }
};

/**
 * Question Classification and Topic Mapping
 * Maps extracted questions to CSA modules and topics
 */
export class QuestionBankManager {
  constructor() {
    this.g3Questions = g3Questions.questions || [];
    this.g2Questions = g2Questions.questions || [];
    this.questionTopicMap = this.initializeTopicMapping();
  }

  /**
   * Initialize topic mapping based on question analysis
   */
  initializeTopicMapping() {
    return {
      G3: this.analyzeG3QuestionTopics(),
      G2: this.analyzeG2QuestionTopics()
    };
  }

  /**
   * Analyze G3 questions and map to topics
   */
  analyzeG3QuestionTopics() {
    const topicMapping = {};
    
    // Safety-related questions (estimated questions 1-80)
    const safetyKeywords = [
      'safety', 'hazard', 'PPE', 'protective equipment', 'WHMIS', 'toxic', 
      'dangerous', 'emergency', 'first aid', 'accident', 'injury', 'risk',
      'carbon monoxide', 'ventilation', 'confined space', 'respiratory'
    ];

    // Tools and equipment questions (estimated questions 81-110) 
    const toolsKeywords = [
      'tool', 'equipment', 'instrument', 'gauge', 'meter', 'testing',
      'measurement', 'calibration', 'manometer', 'combustible gas indicator'
    ];

    // Gas properties questions (estimated questions 111-160)
    const gasPropertiesKeywords = [
      'propane', 'natural gas', 'specific gravity', 'BTU', 'heating value',
      'density', 'pressure', 'temperature', 'vapor', 'liquid', 'gas properties'
    ];

    // Codes and regulations (estimated questions 161-220)
    const codesKeywords = [
      'CSA', 'B149', 'code', 'regulation', 'TSSA', 'authority', 'jurisdiction',
      'act', 'law', 'requirement', 'compliance', 'inspection', 'approval'
    ];

    // Electricity questions (estimated questions 221-240)
    const electricityKeywords = [
      'electrical', 'voltage', 'current', 'resistance', 'ohm', 'circuit',
      'wire', 'control', 'switch', 'relay', 'motor', 'ignition'
    ];

    // Technical drawings (estimated questions 241-255)
    const drawingsKeywords = [
      'drawing', 'diagram', 'symbol', 'specification', 'manual', 'blueprint',
      'schematic', 'plan', 'documentation'
    ];

    // Customer relations (estimated questions 256-265)
    const customerKeywords = [
      'customer', 'communication', 'service', 'professional', 'ethics',
      'complaint', 'relationship', 'documentation'
    ];

    // Piping questions (estimated questions 266-285)
    const pipingKeywords = [
      'pipe', 'piping', 'tubing', 'fitting', 'joint', 'connection',
      'installation', 'support', 'protection', 'sizing'
    ];

    // Appliances questions (estimated questions 286-313)
    const applianceKeywords = [
      'appliance', 'furnace', 'water heater', 'range', 'oven', 'dryer',
      'fireplace', 'boiler', 'burner', 'operation', 'maintenance'
    ];

    // Map questions to modules
    this.g3Questions.forEach((q, index) => {
      const questionText = q.question.toLowerCase();
      const questionId = q.id;
      
      let assignedModule = 'Unit_1'; // Default to safety
      
      if (this.containsKeywords(questionText, safetyKeywords)) {
        assignedModule = 'Unit_1';
      } else if (this.containsKeywords(questionText, toolsKeywords)) {
        assignedModule = 'Unit_2';
      } else if (this.containsKeywords(questionText, gasPropertiesKeywords)) {
        assignedModule = 'Unit_3';
      } else if (this.containsKeywords(questionText, codesKeywords)) {
        assignedModule = questionText.includes('law') || questionText.includes('act') ? 'Unit_4a' : 'Unit_4';
      } else if (this.containsKeywords(questionText, electricityKeywords)) {
        assignedModule = 'Unit_5';
      } else if (this.containsKeywords(questionText, drawingsKeywords)) {
        assignedModule = 'Unit_6';
      } else if (this.containsKeywords(questionText, customerKeywords)) {
        assignedModule = 'Unit_7';
      } else if (this.containsKeywords(questionText, pipingKeywords)) {
        assignedModule = 'Unit_8';
      } else if (this.containsKeywords(questionText, applianceKeywords)) {
        assignedModule = 'Unit_9';
      }

      if (!topicMapping[assignedModule]) {
        topicMapping[assignedModule] = [];
      }
      topicMapping[assignedModule].push({
        questionId: questionId,
        question: q.question,
        difficulty: this.estimateQuestionDifficulty(q),
        topics: this.extractQuestionTopics(q)
      });
    });

    return topicMapping;
  }

  /**
   * Analyze G2 questions and map to advanced topics
   */
  analyzeG2QuestionTopics() {
    const topicMapping = {};
    
    // Advanced piping (questions 1-25)
    const advancedPipingKeywords = [
      'pipe sizing', 'pressure drop', 'welding', 'high pressure', 'complex',
      'advanced piping', 'system design', 'commissioning'
    ];

    // Regulators (questions 26-35)
    const regulatorKeywords = [
      'regulator', 'pressure regulation', 'relief valve', 'safety device',
      'pressure control', 'gas valve'
    ];

    // Advanced electricity (questions 36-50)
    const advancedElectricalKeywords = [
      'control circuit', 'motor', 'starter', 'electronic ignition',
      'flame sensing', 'electrical troubleshooting'
    ];

    // Controls (questions 51-65)
    const controlsKeywords = [
      'gas valve', 'control system', 'safety shutoff', 'flame supervision',
      'pressure switch', 'sensor', 'diagnostic'
    ];

    // Building systems (questions 66-75)
    const buildingKeywords = [
      'building envelope', 'air leakage', 'ventilation', 'combustion air',
      'pressurization', 'energy efficiency'
    ];

    // Water heaters and appliances (questions 76-117)
    const applianceKeywords = [
      'water heater', 'furnace', 'boiler', 'range', 'dryer', 'fireplace',
      'appliance installation', 'service', 'troubleshooting', 'venting'
    ];

    // Map G2 questions to modules
    this.g2Questions.forEach((q, index) => {
      const questionText = q.question.toLowerCase();
      const questionId = q.id;
      
      let assignedModule = 'Unit_15'; // Default to domestic appliances
      
      if (this.containsKeywords(questionText, advancedPipingKeywords) || index < 25) {
        assignedModule = 'Unit_10';
      } else if (this.containsKeywords(questionText, regulatorKeywords) || (index >= 25 && index < 35)) {
        assignedModule = 'Unit_11';
      } else if (this.containsKeywords(questionText, advancedElectricalKeywords) || (index >= 35 && index < 50)) {
        assignedModule = 'Unit_12';
      } else if (this.containsKeywords(questionText, controlsKeywords) || (index >= 50 && index < 65)) {
        assignedModule = 'Unit_13';
      } else if (this.containsKeywords(questionText, buildingKeywords) || (index >= 65 && index < 75)) {
        assignedModule = 'Unit_14';
      } else if (questionText.includes('water heater') || questionText.includes('boiler')) {
        assignedModule = questionText.includes('hydronic') ? 'Unit_20' : 'Unit_18';
      } else if (questionText.includes('furnace') || questionText.includes('forced air')) {
        assignedModule = 'Unit_19';
      } else if (questionText.includes('fireplace') || questionText.includes('space heater')) {
        assignedModule = 'Unit_21';
      } else if (questionText.includes('vent') || questionText.includes('chimney')) {
        assignedModule = 'Unit_22';
      } else if (questionText.includes('refrigerator')) {
        assignedModule = 'Unit_16';
      } else if (questionText.includes('conversion') || questionText.includes('burner')) {
        assignedModule = 'Unit_17';
      } else if (questionText.includes('air handling') || questionText.includes('duct')) {
        assignedModule = 'Unit_24';
      } else if (questionText.includes('add-on') || questionText.includes('accessory')) {
        assignedModule = 'Unit_23';
      }

      if (!topicMapping[assignedModule]) {
        topicMapping[assignedModule] = [];
      }
      topicMapping[assignedModule].push({
        questionId: questionId,
        question: q.question,
        difficulty: this.estimateQuestionDifficulty(q),
        topics: this.extractQuestionTopics(q)
      });
    });

    return topicMapping;
  }

  /**
   * Check if question text contains specific keywords
   */
  containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * Estimate question difficulty based on content analysis
   */
  estimateQuestionDifficulty(question) {
    const questionText = question.question.toLowerCase();
    const options = question.options;
    
    let difficulty = 2; // Default medium difficulty
    
    // Factors that increase difficulty
    if (questionText.includes('calculate') || questionText.includes('determine')) {
      difficulty += 1;
    }
    if (questionText.includes('maximum') || questionText.includes('minimum')) {
      difficulty += 0.5;
    }
    if (questionText.includes('code') || questionText.includes('regulation')) {
      difficulty += 0.5;
    }
    if (options.length > 4) {
      difficulty += 0.5;
    }
    if (questionText.length > 200) {
      difficulty += 0.5;
    }
    
    // Factors that decrease difficulty
    if (questionText.includes('what is') || questionText.includes('which')) {
      difficulty -= 0.5;
    }
    if (options.some(opt => opt.toLowerCase().includes('all of the above'))) {
      difficulty -= 0.5;
    }
    
    return Math.max(1, Math.min(5, Math.round(difficulty)));
  }

  /**
   * Extract specific topics from question content
   */
  extractQuestionTopics(question) {
    const topics = [];
    const questionText = question.question.toLowerCase();
    
    // Common topic extraction
    const topicPatterns = {
      'safety': ['safety', 'hazard', 'danger', 'risk', 'protective', 'emergency'],
      'pressure': ['pressure', 'psi', 'kpa', 'gauge', 'manometer'],
      'temperature': ['temperature', 'degrees', 'heat', 'thermal'],
      'electrical': ['electrical', 'voltage', 'current', 'ohm', 'circuit'],
      'piping': ['pipe', 'tubing', 'fitting', 'connection', 'joint'],
      'appliances': ['appliance', 'furnace', 'heater', 'range', 'boiler'],
      'codes': ['code', 'regulation', 'CSA', 'B149', 'TSSA'],
      'gas_properties': ['propane', 'natural gas', 'specific gravity', 'BTU'],
      'venting': ['vent', 'chimney', 'flue', 'combustion air'],
      'testing': ['test', 'testing', 'measurement', 'calibration', 'inspection']
    };
    
    Object.entries(topicPatterns).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => questionText.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics.length > 0 ? topics : ['general'];
  }

  /**
   * Get questions by certification level
   */
  getQuestionsByLevel(level) {
    return level === 'G2' ? this.g2Questions : this.g3Questions;
  }

  /**
   * Get questions by CSA module
   */
  getQuestionsByModule(level, moduleId) {
    const topicMap = this.questionTopicMap[level];
    return topicMap[moduleId] || [];
  }

  /**
   * Get questions by difficulty range
   */
  getQuestionsByDifficulty(level, minDifficulty, maxDifficulty) {
    const questions = this.getQuestionsByLevel(level);
    return questions.filter(q => {
      const difficulty = this.estimateQuestionDifficulty(q);
      return difficulty >= minDifficulty && difficulty <= maxDifficulty;
    });
  }

  /**
   * Get adaptive question selection for exam
   */
  getAdaptiveQuestionSelection(level, examConfig, userProgress = null) {
    const allQuestions = this.getQuestionsByLevel(level);
    const modules = CSA_MODULES[level].modules;
    const selectedQuestions = [];
    
    // Calculate questions per module based on exam weights
    Object.entries(modules).forEach(([moduleId, moduleInfo]) => {
      const questionsForModule = Math.round(examConfig.totalQuestions * moduleInfo.examWeight);
      const moduleQuestions = this.getQuestionsByModule(level, moduleId);
      
      if (moduleQuestions.length > 0) {
        // Shuffle and select questions
        const shuffled = this.shuffleArray([...moduleQuestions]);
        const selected = shuffled.slice(0, Math.min(questionsForModule, moduleQuestions.length));
        selectedQuestions.push(...selected);
      }
    });
    
    // Fill remaining slots if needed
    const remaining = examConfig.totalQuestions - selectedQuestions.length;
    if (remaining > 0) {
      const usedIds = new Set(selectedQuestions.map(q => q.questionId));
      const unusedQuestions = allQuestions.filter(q => !usedIds.has(q.id));
      const additionalQuestions = this.shuffleArray(unusedQuestions).slice(0, remaining);
      selectedQuestions.push(...additionalQuestions.map(q => ({
        questionId: q.id,
        question: q.question,
        difficulty: this.estimateQuestionDifficulty(q),
        topics: this.extractQuestionTopics(q)
      })));
    }
    
    return this.shuffleArray(selectedQuestions);
  }

  /**
   * Get question statistics
   */
  getQuestionStatistics(level) {
    const questions = this.getQuestionsByLevel(level);
    const topicMap = this.questionTopicMap[level];
    
    const stats = {
      totalQuestions: questions.length,
      averageDifficulty: 0,
      moduleDistribution: {},
      difficultyDistribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
      topicCoverage: {}
    };
    
    // Calculate module distribution
    Object.entries(topicMap).forEach(([moduleId, moduleQuestions]) => {
      stats.moduleDistribution[moduleId] = moduleQuestions.length;
    });
    
    // Calculate difficulty distribution and average
    let totalDifficulty = 0;
    questions.forEach(q => {
      const difficulty = this.estimateQuestionDifficulty(q);
      stats.difficultyDistribution[difficulty]++;
      totalDifficulty += difficulty;
    });
    stats.averageDifficulty = totalDifficulty / questions.length;
    
    return stats;
  }

  /**
   * Utility function to shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Validate question bank integrity
   */
  validateQuestionBank() {
    const validation = {
      G3: {
        valid: true,
        issues: [],
        questionCount: this.g3Questions.length,
        expectedCount: 313
      },
      G2: {
        valid: true,
        issues: [],
        questionCount: this.g2Questions.length,
        expectedCount: 117
      }
    };
    
    // Validate G3 questions
    if (validation.G3.questionCount !== validation.G3.expectedCount) {
      validation.G3.valid = false;
      validation.G3.issues.push(`Expected ${validation.G3.expectedCount} questions, found ${validation.G3.questionCount}`);
    }
    
    // Validate G2 questions  
    if (validation.G2.questionCount !== validation.G2.expectedCount) {
      validation.G2.valid = false;
      validation.G2.issues.push(`Expected ${validation.G2.expectedCount} questions, found ${validation.G2.questionCount}`);
    }
    
    // Check for duplicate questions
    const g3Questions = new Set();
    const g2Questions = new Set();
    
    this.g3Questions.forEach(q => {
      if (g3Questions.has(q.question)) {
        validation.G3.valid = false;
        validation.G3.issues.push(`Duplicate question found: ${q.question.substring(0, 50)}...`);
      }
      g3Questions.add(q.question);
    });
    
    this.g2Questions.forEach(q => {
      if (g2Questions.has(q.question)) {
        validation.G2.valid = false;
        validation.G2.issues.push(`Duplicate question found: ${q.question.substring(0, 50)}...`);
      }
      g2Questions.add(q.question);
    });
    
    return validation;
  }
}

// Create singleton instance
export const questionBankManager = new QuestionBankManager();

// Export exam configuration presets
export const EXAM_CONFIGS = {
  G3: {
    QUICK_PRACTICE: {
      name: "Quick Practice",
      totalQuestions: 25,
      timeLimitMinutes: 30,
      passingScore: 70,
      description: "Quick 25-question practice session"
    },
    STANDARD_PRACTICE: {
      name: "Standard Practice", 
      totalQuestions: 50,
      timeLimitMinutes: 60,
      passingScore: 75,
      description: "Standard 50-question practice exam"
    },
    FULL_SIMULATION: {
      name: "Full Mock Exam",
      totalQuestions: 160,
      timeLimitMinutes: 210, // 3.5 hours
      passingScore: 75,
      description: "Complete TSSA G3 exam simulation"
    },
    DIAGNOSTIC: {
      name: "Diagnostic Assessment",
      totalQuestions: 75,
      timeLimitMinutes: 90,
      passingScore: 65,
      description: "Comprehensive diagnostic assessment"
    }
  },
  G2: {
    QUICK_PRACTICE: {
      name: "Quick Practice",
      totalQuestions: 20,
      timeLimitMinutes: 30,
      passingScore: 70,
      description: "Quick 20-question practice session"
    },
    STANDARD_PRACTICE: {
      name: "Standard Practice",
      totalQuestions: 40,
      timeLimitMinutes: 60,
      passingScore: 75,
      description: "Standard 40-question practice exam"
    },
    FULL_SIMULATION: {
      name: "Full Mock Exam", 
      totalQuestions: 117,
      timeLimitMinutes: 180, // 3 hours
      passingScore: 75,
      description: "Complete TSSA G2 exam simulation using all available questions"
    },
    DIAGNOSTIC: {
      name: "Diagnostic Assessment",
      totalQuestions: 60,
      timeLimitMinutes: 75,
      passingScore: 65,
      description: "Comprehensive diagnostic assessment"
    }
  }
};

export default QuestionBankManager;