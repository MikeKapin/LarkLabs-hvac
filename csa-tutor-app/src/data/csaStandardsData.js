/**
 * CSA B149.1-25 and B149.2 Standards Data for TSSA G2/G3 Certification
 * Comprehensive mapping of Canadian Gas Code sections and requirements
 */

export const csaB1491Standards = {
  // Section 1: Scope and Definitions
  "1.1": {
    sectionNumber: "1.1",
    title: "Scope",
    description: "Application and limitations of the installation code",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Code jurisdiction and authority",
      "Installation types covered",
      "Exclusions and limitations",
      "Relationship to other codes"
    ],
    examWeight: {
      G2: 0.02,
      G3: 0.03
    }
  },
  "1.2": {
    sectionNumber: "1.2", 
    title: "Definitions",
    description: "Technical definitions and terminology",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Gas appliance definitions",
      "Piping system terminology", 
      "Pressure classifications",
      "Installation terminology"
    ],
    examWeight: {
      G2: 0.03,
      G3: 0.04
    }
  },

  // Section 2: General Requirements
  "2.1": {
    sectionNumber: "2.1",
    title: "General Installation Requirements", 
    description: "Basic requirements for all gas installations",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Installation permits and approvals",
      "Qualified person requirements", 
      "Installation standards",
      "Testing and inspection"
    ],
    examWeight: {
      G2: 0.04,
      G3: 0.05
    }
  },
  "2.2": {
    sectionNumber: "2.2",
    title: "Materials and Equipment",
    description: "Approved materials and equipment standards",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Approved materials list",
      "Equipment certification requirements",
      "Material standards and specifications",
      "Installation component requirements"
    ],
    examWeight: {
      G2: 0.03,
      G3: 0.03
    }
  },

  // Section 3: Gas Piping Systems
  "3.1": {
    sectionNumber: "3.1",
    title: "Piping Materials",
    description: "Materials approved for gas piping systems",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Steel pipe specifications",
      "Copper tubing requirements",
      "Flexible connectors",
      "Plastic pipe applications"
    ],
    examWeight: {
      G2: 0.05,
      G3: 0.04
    }
  },
  "3.2": {
    sectionNumber: "3.2", 
    title: "Pipe Sizing",
    description: "Methods for sizing gas piping systems",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Sizing calculation methods",
      "Pressure drop calculations", 
      "Diversity factors",
      "Longest length method"
    ],
    examWeight: {
      G2: 0.06,
      G3: 0.05
    }
  },
  "3.3": {
    sectionNumber: "3.3",
    title: "Installation Requirements",
    description: "Proper installation practices for piping",
    appliesTo: ["G2", "G3"], 
    keyTopics: [
      "Support and anchoring",
      "Protection from damage",
      "Accessibility requirements",
      "Clearance requirements"
    ],
    examWeight: {
      G2: 0.05,
      G3: 0.04
    }
  },
  "3.4": {
    sectionNumber: "3.4",
    title: "Joints and Connections", 
    description: "Acceptable joining methods and fittings",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Threaded connections",
      "Welded joints",
      "Mechanical joints",
      "Flexible connections"
    ],
    examWeight: {
      G2: 0.04,
      G3: 0.03
    }
  },
  "3.5": {
    sectionNumber: "3.5",
    title: "Testing",
    description: "Pressure testing requirements for piping",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Test pressure requirements",
      "Test procedures",
      "Leak detection methods",
      "Documentation requirements"
    ],
    examWeight: {
      G2: 0.05,
      G3: 0.04
    }
  },

  // Section 4: Gas Appliances
  "4.1": {
    sectionNumber: "4.1",
    title: "General Appliance Requirements",
    description: "General requirements for all gas appliances",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Appliance certification",
      "Installation clearances",
      "Access requirements", 
      "Safety requirements"
    ],
    examWeight: {
      G2: 0.04,
      G3: 0.04
    }
  },
  "4.2": {
    sectionNumber: "4.2",
    title: "Appliance Connections",
    description: "Methods for connecting appliances to gas supply",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Rigid connections",
      "Flexible connectors",
      "Appliance shut-off valves",
      "Connection accessibility"
    ],
    examWeight: {
      G2: 0.04,
      G3: 0.03
    }
  },

  // Section 5: Venting Systems  
  "5.1": {
    sectionNumber: "5.1",
    title: "General Venting Requirements",
    description: "Basic requirements for venting gas appliances",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Venting principles",
      "Draft requirements",
      "Combustion air", 
      "Vent termination"
    ],
    examWeight: {
      G2: 0.06,
      G3: 0.05
    }
  },
  "5.2": {
    sectionNumber: "5.2",
    title: "Vent Materials and Installation",
    description: "Materials and installation practices for vents",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Vent materials",
      "Vent sizing methods",
      "Installation requirements",
      "Support and clearances"
    ],
    examWeight: {
      G2: 0.05,
      G3: 0.04
    }
  },
  "5.3": {
    sectionNumber: "5.3", 
    title: "Special Venting Systems",
    description: "Direct vent and power venting systems",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Direct vent systems",
      "Power venting",
      "Induced draft systems",
      "Special installation requirements"
    ],
    examWeight: {
      G2: 0.04,
      G3: 0.03
    }
  },

  // Section 6: Control Systems
  "6.1": {
    sectionNumber: "6.1",
    title: "Gas Controls and Safety Devices",
    description: "Required controls and safety systems",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Manual shut-off valves",
      "Automatic safety shut-offs",
      "Pressure regulators",
      "Safety control systems"
    ],
    examWeight: {
      G2: 0.04,
      G3: 0.04
    }
  },

  // Section 7: Installation Practices
  "7.1": {
    sectionNumber: "7.1",
    title: "Installation Procedures",
    description: "Proper installation procedures and practices",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Pre-installation requirements",
      "Installation sequence",
      "Commissioning procedures",
      "Final inspection requirements"
    ],
    examWeight: {
      G2: 0.05,
      G3: 0.04
    }
  },

  // Section 8: Maintenance and Service
  "8.1": {
    sectionNumber: "8.1", 
    title: "Maintenance Requirements",
    description: "Ongoing maintenance and service requirements",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Routine maintenance schedules",
      "Safety inspections", 
      "Service documentation",
      "Troubleshooting procedures"
    ],
    examWeight: {
      G2: 0.04,
      G3: 0.03
    }
  }
};

export const csaB1492Standards = {
  // Propane Storage and Handling Code sections
  "1.1": {
    sectionNumber: "1.1",
    title: "Scope - Propane Storage", 
    description: "Application of propane storage and handling requirements",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Propane system coverage",
      "Storage facility requirements",
      "Transportation regulations",
      "Handling procedures"
    ],
    examWeight: {
      G2: 0.02,
      G3: 0.03
    }
  },
  "2.1": {
    sectionNumber: "2.1",
    title: "Container Requirements",
    description: "Propane container specifications and requirements",
    appliesTo: ["G2", "G3"], 
    keyTopics: [
      "Container certification",
      "Capacity limitations",
      "Construction standards", 
      "Marking requirements"
    ],
    examWeight: {
      G2: 0.03,
      G3: 0.04
    }
  },
  "2.2": {
    sectionNumber: "2.2",
    title: "Container Installation",
    description: "Installation requirements for propane containers",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Location requirements",
      "Clearance distances", 
      "Foundation requirements",
      "Accessibility standards"
    ],
    examWeight: {
      G2: 0.04,
      G3: 0.03
    }
  },
  "3.1": {
    sectionNumber: "3.1",
    title: "Safety Equipment",
    description: "Required safety equipment for propane systems",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Emergency shut-offs",
      "Safety relief devices",
      "Leak detection equipment",
      "Fire suppression systems"
    ],
    examWeight: {
      G2: 0.03,
      G3: 0.04
    }
  },
  "4.1": {
    sectionNumber: "4.1", 
    title: "Handling Procedures",
    description: "Safe handling and transportation of propane",
    appliesTo: ["G2", "G3"],
    keyTopics: [
      "Container handling procedures",
      "Transportation requirements", 
      "Storage procedures",
      "Emergency procedures"
    ],
    examWeight: {
      G2: 0.03,
      G3: 0.04
    }
  }
};

export const competencyMappings = {
  safety: {
    name: "Safety Procedures and PPE",
    description: "Personal protective equipment, hazard identification, and safety protocols",
    certification: "BOTH",
    csaSections: ["1.1", "1.2", "2.1", "8.1"],
    weight: {
      G2: 0.20,
      G3: 0.25
    },
    keyLearningObjectives: [
      "Identify gas system hazards and risks",
      "Select appropriate PPE for gas work",
      "Follow emergency procedures",
      "Implement lockout/tagout procedures",
      "Recognize carbon monoxide dangers",
      "Apply confined space safety protocols"
    ]
  },
  installation: {
    name: "Installation Procedures",
    description: "Proper installation techniques for gas systems and appliances", 
    certification: "BOTH",
    csaSections: ["3.1", "3.2", "3.3", "4.1", "4.2", "7.1"],
    weight: {
      G2: 0.18,
      G3: 0.08
    },
    keyLearningObjectives: [
      "Install gas piping systems correctly",
      "Connect appliances safely",
      "Apply proper clearance requirements", 
      "Follow installation sequences",
      "Implement testing procedures",
      "Document installation work"
    ]
  },
  troubleshooting: {
    name: "Troubleshooting and Diagnostics",
    description: "Systematic approach to diagnosing and resolving gas system issues",
    certification: "BOTH", 
    csaSections: ["8.1", "6.1"],
    weight: {
      G2: 0.15,
      G3: 0.05
    },
    keyLearningObjectives: [
      "Diagnose system malfunctions",
      "Test system components",
      "Identify performance issues",
      "Apply systematic troubleshooting",
      "Use diagnostic equipment",
      "Implement corrective actions"
    ]
  },
  codes: {
    name: "Codes, Standards and Regulations", 
    description: "Understanding and application of CSA codes and TSSA regulations",
    certification: "BOTH",
    csaSections: ["1.1", "1.2", "2.1", "2.2"],
    weight: {
      G2: 0.12,
      G3: 0.20  
    },
    keyLearningObjectives: [
      "Navigate CSA B149.1 and B149.2",
      "Understand TSSA requirements", 
      "Apply code requirements to installations",
      "Identify code violations",
      "Reference appropriate standards",
      "Understand legal obligations"
    ]
  },
  calculations: {
    name: "Technical Calculations",
    description: "Mathematical calculations for gas systems design and analysis",
    certification: "BOTH",
    csaSections: ["3.2", "5.2"],
    weight: {
      G2: 0.10,
      G3: 0.15
    },
    keyLearningObjectives: [
      "Calculate pipe sizing requirements",
      "Determine pressure drops",
      "Size venting systems",
      "Calculate gas loads",
      "Apply diversity factors",
      "Convert between pressure units"
    ]
  },
  appliances: {
    name: "Gas Appliances and Equipment",
    description: "Understanding of gas appliances, controls, and equipment",
    certification: "BOTH", 
    csaSections: ["4.1", "4.2", "6.1"],
    weight: {
      G2: 0.12,
      G3: 0.10
    },
    keyLearningObjectives: [
      "Identify appliance types and ratings",
      "Understand appliance controls",
      "Apply clearance requirements",
      "Connect appliances properly",
      "Test appliance operation",
      "Service appliance components"
    ]
  },
  venting: {
    name: "Venting Systems",
    description: "Design and installation of venting and combustion air systems",
    certification: "BOTH",
    csaSections: ["5.1", "5.2", "5.3"],
    weight: {
      G2: 0.08,
      G3: 0.08
    },
    keyLearningObjectives: [
      "Size venting systems",
      "Install vent materials",
      "Understand draft principles", 
      "Design combustion air systems",
      "Install direct vent systems",
      "Troubleshoot venting problems"
    ]
  },
  electricity: {
    name: "Basic Electrical Systems",
    description: "Electrical principles for gas appliances and controls",
    certification: "BOTH",
    csaSections: ["6.1"],
    weight: {
      G2: 0.03,
      G3: 0.07
    },
    keyLearningObjectives: [
      "Understand basic electrical circuits",
      "Apply Ohm's law",
      "Test electrical components",
      "Wire control circuits",
      "Use electrical meters",
      "Follow electrical safety procedures"
    ]
  },
  piping: {
    name: "Piping Systems",
    description: "Gas piping materials, installation, and testing procedures", 
    certification: "BOTH",
    csaSections: ["3.1", "3.3", "3.4", "3.5"],
    weight: {
      G2: 0.02,
      G3: 0.02
    },
    keyLearningObjectives: [
      "Select appropriate piping materials",
      "Install piping systems",
      "Make proper joints and connections", 
      "Test piping systems",
      "Support piping properly",
      "Protect piping from damage"
    ]
  }
};

export const examTopicDistribution = {
  G2: {
    totalQuestions: 160, // For full simulation
    topicBreakdown: {
      safety: 32,           // 20%
      installation: 29,     // 18%
      troubleshooting: 24,  // 15%
      codes: 19,           // 12%
      appliances: 19,      // 12%
      calculations: 16,     // 10%
      venting: 13,         // 8%
      electricity: 5,       // 3%
      piping: 3            // 2%
    }
  },
  G3: {
    totalQuestions: 160,
    topicBreakdown: {
      safety: 40,           // 25% 
      codes: 32,           // 20%
      calculations: 24,     // 15%
      appliances: 16,      // 10%
      installation: 13,     // 8%
      venting: 13,         // 8%
      electricity: 11,      // 7%
      troubleshooting: 8,   // 5%
      piping: 3            // 2%
    }
  }
};

export const difficultyGuidelines = {
  1: {
    level: "Basic Recognition",
    description: "Simple recall of definitions and basic concepts", 
    characteristics: [
      "Direct fact recall",
      "Basic terminology",
      "Simple yes/no questions",
      "Obvious safety violations"
    ]
  },
  2: {
    level: "Comprehension", 
    description: "Understanding of concepts and procedures",
    characteristics: [
      "Explain concepts in own words",
      "Identify appropriate procedures", 
      "Recognize common applications",
      "Basic code requirements"
    ]
  },
  3: {
    level: "Application",
    description: "Apply knowledge to solve routine problems",
    characteristics: [
      "Apply procedures to new situations",
      "Perform basic calculations",
      "Select appropriate materials/methods", 
      "Interpret simple diagrams"
    ]
  },
  4: {
    level: "Analysis",
    description: "Analyze complex situations and relationships",
    characteristics: [
      "Troubleshoot system problems",
      "Analyze multiple variables",
      "Evaluate different approaches",
      "Complex code interpretations"
    ]
  },
  5: {
    level: "Synthesis/Evaluation", 
    description: "Create solutions and make judgments",
    characteristics: [
      "Design complete systems",
      "Evaluate design alternatives",
      "Create troubleshooting strategies",
      "Make complex safety decisions"
    ]
  }
};

// Question templates for different types
export const questionTemplates = {
  multiple_choice: {
    structure: {
      question_text: "string",
      options: ["array", "of", "strings"],
      correct_answer: "index",
      explanation: "string"
    },
    guidelines: "Use 4 options, make distractors plausible"
  },
  scenario_based: {
    structure: {
      scenario: "string", 
      question_text: "string",
      options: ["array", "of", "strings"],
      correct_answer: "index", 
      explanation: "string"
    },
    guidelines: "Include realistic workplace scenarios"
  },
  calculation: {
    structure: {
      problem_statement: "string",
      given_values: "object",
      question_text: "string", 
      formula_reference: "string",
      correct_answer: "number",
      explanation: "string", 
      units: "string"
    },
    guidelines: "Provide all necessary formulas and unit conversions"
  },
  code_interpretation: {
    structure: {
      code_section: "string",
      situation: "string",
      question_text: "string",
      options: ["array", "of", "strings"],
      correct_answer: "index",
      code_reference: "string",
      explanation: "string"
    },
    guidelines: "Reference specific code sections and applications"
  }
};

// Export functions for easy access
export function getCSASection(standardCode, sectionNumber) {
  const standard = standardCode === 'B149.1' ? csaB1491Standards : csaB1492Standards;
  return standard[sectionNumber];
}

export function getCompetencyByName(competencyName) {
  return competencyMappings[competencyName];
}

export function getExamDistribution(certificationLevel) {
  return examTopicDistribution[certificationLevel];
}

export function getDifficultyGuideline(level) {
  return difficultyGuidelines[level];
}