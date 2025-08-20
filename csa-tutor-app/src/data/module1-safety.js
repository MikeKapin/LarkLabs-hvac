// CSA Unit 1 - Safety Module Data
export const module1SafetyData = {
  moduleId: 1,
  title: "Safety",
  description: "Fundamental safety principles and procedures for gas technicians",
  folderPath: "Module 1 Safety",
  
  chapters: {
    1: {
      id: 1,
      title: "Safety Fundamentals - Chapter 1",
      pdfFile: "CSA Unit 1 Chapter 1.pdf",
      content: {
        overview: "Introduction to gas safety principles and hazard recognition",
        keyTopics: [
          "Personal Protective Equipment (PPE)",
          "Hazard identification and assessment",
          "Emergency procedures and protocols",
          "Safety regulations and standards",
          "Workplace safety culture and responsibility"
        ],
        learningObjectives: [
          "Identify potential hazards in gas work environments",
          "Select and use appropriate PPE for different tasks",
          "Implement emergency response procedures",
          "Apply safety regulations and best practices"
        ],
        safetyPrinciples: [
          "Always assume gas is present until proven otherwise",
          "Use proper gas detection equipment",
          "Maintain situational awareness at all times",
          "Follow lock-out/tag-out procedures",
          "Communicate hazards to team members"
        ]
      }
    },
    2: {
      id: 2,
      title: "Gas Safety Hazards - Chapter 2",
      pdfFile: "CSA Unit 1 Chapter 2.pdf",
      content: {
        overview: "Understanding specific hazards associated with gas work",
        primaryHazards: [
          "Combustible gas accumulation",
          "Asphyxiation from oxygen displacement",
          "Fire and explosion risks",
          "Toxic gas exposure",
          "Electrical hazards in gas environments"
        ],
        riskAssessment: [
          "Environmental hazard evaluation",
          "Equipment condition assessment",
          "Weather and atmospheric conditions",
          "Site-specific risk factors",
          "Personal health and fitness considerations"
        ],
        preventiveMeasures: [
          "Continuous gas monitoring",
          "Proper ventilation systems",
          "Ignition source elimination",
          "Safe work procedures",
          "Emergency equipment availability"
        ]
      }
    },
    3: {
      id: 3,
      title: "Personal Protective Equipment - Chapter 3",
      pdfFile: "CSA Unit 1 Chapter 3.pdf",
      content: {
        overview: "Selection, use, and maintenance of PPE for gas technicians",
        basicPPE: [
          "ANSI-approved safety glasses or goggles",
          "CSA-approved safety footwear",
          "Cut-resistant work gloves",
          "High-visibility clothing when required",
          "Hard hats in construction environments"
        ],
        specializedEquipment: [
          "Combustible gas detectors (LEL meters)",
          "Oxygen deficiency monitors",
          "Personal gas monitors",
          "Emergency escape respirators",
          "Fall protection equipment"
        ],
        maintenanceRequirements: [
          "Daily visual inspections",
          "Calibration schedules for gas detectors",
          "Proper cleaning and storage",
          "Replacement criteria",
          "Documentation requirements"
        ]
      }
    },
    4: {
      id: 4,
      title: "Emergency Procedures - Chapter 4",
      pdfFile: "CSA Unit 1 Chapter 4.pdf",
      content: {
        overview: "Emergency response procedures for gas-related incidents",
        emergencyTypes: [
          "Major gas leaks and releases",
          "Fire involving gas systems",
          "Explosion incidents",
          "Personal injury from gas exposure",
          "Equipment failure emergencies"
        ],
        immediateActions: [
          "Ensure personal safety first",
          "Evacuate immediate area",
          "Eliminate all ignition sources",
          "Stop gas flow if safely possible",
          "Call emergency services (911)"
        ],
        responseProtocols: [
          "Establish exclusion zone",
          "Account for all personnel",
          "Coordinate with emergency responders",
          "Provide technical information to authorities",
          "Document incident details"
        ],
        postIncidentProcedures: [
          "Incident investigation",
          "Root cause analysis",
          "Corrective action implementation",
          "Lessons learned documentation",
          "Training updates based on findings"
        ]
      }
    }
  },
  
  commonQuestions: [
    {
      question: "What is the minimum PPE required for gas technician work?",
      answer: "Basic minimum PPE includes ANSI-approved safety glasses, CSA-approved safety footwear, appropriate work gloves, and a calibrated combustible gas detector. Additional PPE may be required based on specific job hazards and site conditions."
    },
    {
      question: "What should I do if my gas detector alarms?",
      answer: "Immediately stop work, move to fresh air, eliminate ignition sources, and evacuate the area. Do not silence the alarm until the source is identified and controlled. Follow your company's emergency procedures and notify supervision."
    },
    {
      question: "When is respiratory protection required in gas work?",
      answer: "Respiratory protection is required in confined spaces, areas with potential oxygen deficiency (below 19.5%), when toxic gases may be present, or when atmospheric conditions cannot be verified as safe through proper testing."
    },
    {
      question: "What are the signs of gas exposure or asphyxiation?",
      answer: "Early signs include headache, dizziness, fatigue, and nausea. Severe exposure can cause confusion, loss of consciousness, and potentially death. If anyone shows these symptoms, immediately move them to fresh air and seek medical attention."
    },
    {
      question: "How often should gas detection equipment be calibrated?",
      answer: "Gas detection equipment should be calibrated according to manufacturer specifications, typically daily before use with bump testing, and full calibration monthly or as specified by company procedures and regulatory requirements."
    }
  ],
  
  practicalScenarios: [
    {
      title: "Residential Service Call - Suspected Gas Leak",
      scenario: "Customer reports smell of gas near outdoor meter",
      safetySteps: [
        "Approach from upwind direction",
        "Use calibrated gas detector before entering property",
        "Eliminate all potential ignition sources",
        "Assess wind direction and ventilation",
        "Locate and isolate gas source if safe to do so",
        "Evacuate area if gas levels exceed 10% LEL",
        "Contact gas utility and emergency services if required"
      ],
      keyLearning: "Never compromise personal safety for expedited service"
    },
    {
      title: "Indoor Appliance Installation",
      scenario: "Installing new gas range in residential kitchen",
      safetySteps: [
        "Test atmosphere before beginning work",
        "Ensure adequate ventilation",
        "Have fire extinguisher readily available",
        "Use appropriate tools to prevent sparks",
        "Perform leak test on all connections",
        "Test operation before leaving site"
      ],
      keyLearning: "Proper preparation prevents incidents"
    }
  ],
  
  regulations: [
    {
      standard: "CSA B149.1",
      section: "Safety Requirements",
      requirement: "All gas work must be performed by qualified technicians using proper safety procedures and equipment"
    },
    {
      standard: "Provincial Regulations",
      section: "Gas Safety",
      requirement: "Mandatory use of calibrated gas detection equipment during all gas system work"
    }
  ],
  
  keywords: [
    "safety", "PPE", "gas leak", "emergency procedures", "hazard identification",
    "personal protective equipment", "ventilation", "ignition sources", "evacuation",
    "gas detection", "confined space", "respiratory protection", "LEL", "oxygen deficiency",
    "calibration", "incident response", "risk assessment"
  ]
};