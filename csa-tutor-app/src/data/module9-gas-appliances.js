// CSA Unit 9 - Introduction to Gas Appliances Module Data
export const module9GasAppliancesData = {
  moduleId: 9,
  title: "Introduction to Gas Appliances",
  description: "Overview of gas appliances and their operation",
  folderPath: "Module 9 Intro to Gas Appliances",
  
  chapters: {
    1: {
      id: 1,
      title: "Gas Appliance Fundamentals - Chapter 1",
      pdfFile: "Unit 9 Chapter 1.pdf",
      content: {
        overview: "Basic principles of gas appliance operation",
        applianceTypes: [
          "Heating appliances (furnaces, boilers, space heaters)",
          "Water heating equipment (tanks, tankless, indirect)",
          "Cooking appliances (ranges, ovens, cooktops)",
          "Clothes dryers and other utility appliances",
          "Decorative appliances (fireplaces, logs)"
        ],
        operatingPrinciples: [
          "Gas-air mixture and combustion",
          "Heat transfer methods (conduction, convection, radiation)",
          "Thermal efficiency and AFUE ratings",
          "Combustion air requirements",
          "Venting and exhaust principles"
        ],
        applianceClassification: [
          "Input rating (BTU/hr capacity)",
          "Efficiency ratings and standards",
          "Venting categories (I, III, IV)",
          "Installation types (residential, commercial)",
          "Fuel types (natural gas, propane)"
        ],
        safetyFeatures: [
          "Automatic shut-off systems",
          "Flame detection devices",
          "Temperature and pressure controls",
          "Ventilation interlocks",
          "Emergency shutdown mechanisms"
        ]
      }
    },
    2: {
      id: 2,
      title: "Combustion Systems and Burners - Chapter 2",
      pdfFile: "Unit 9 Chapter 2.pdf",
      content: {
        overview: "Gas burner types and combustion system components",
        burnerTypes: [
          "Atmospheric (natural draft) burners",
          "Power (forced draft) burners", 
          "Premix burner systems",
          "Ribbon and inshot burners",
          "Modulating and staged burners"
        ],
        combustionComponents: [
          "Gas valves and pressure regulators",
          "Primary and secondary air controls",
          "Ignition systems (pilot, direct spark, hot surface)",
          "Flame detection and monitoring",
          "Combustion chamber design"
        ],
        airSupply: [
          "Combustion air requirements calculation",
          "Direct and indirect air supply methods",
          "Confined space ventilation requirements",
          "Outdoor air intake systems",
          "Air filtration and quality considerations"
        ],
        combustionQuality: [
          "Complete vs. incomplete combustion indicators",
          "Flame appearance and characteristics",
          "Carbon monoxide formation and prevention",
          "Combustion efficiency optimization",
          "Flue gas analysis and interpretation"
        ]
      }
    },
    3: {
      id: 3,
      title: "Heat Exchangers and Heat Transfer - Chapter 3",
      pdfFile: "Unit 9 Chapter 3.pdf",
      content: {
        overview: "Heat exchanger design and heat transfer principles",
        heatExchangerTypes: [
          "Primary heat exchangers (non-condensing)",
          "Secondary heat exchangers (condensing)",
          "Tube and shell designs",
          "Plate heat exchangers",
          "Coil and serpentine designs"
        ],
        heatTransferMethods: [
          "Conduction through metal surfaces",
          "Convection heat transfer to air/water",
          "Radiation heat transfer",
          "Latent heat recovery (condensing)",
          "Heat transfer efficiency factors"
        ],
        materialConsiderations: [
          "Steel and cast iron heat exchangers",
          "Stainless steel for condensing applications",
          "Aluminum and other specialty materials",
          "Corrosion resistance requirements",
          "Thermal expansion considerations"
        ],
        maintenance: [
          "Heat exchanger inspection methods",
          "Cleaning procedures and frequency",
          "Crack detection and testing",
          "Corrosion monitoring",
          "Replacement criteria and procedures"
        ]
      }
    },
    4: {
      id: 4,
      title: "Controls and Safety Systems - Chapter 4",
      pdfFile: "Unit 9 Chapter 4.pdf",
      content: {
        overview: "Gas appliance control systems and safety devices",
        controlTypes: [
          "Manual controls (pilot lights, manual valves)",
          "Automatic controls (thermostats, aquastats)",
          "Modulating controls (variable output)",
          "Staged controls (multi-step operation)",
          "Smart controls and programmable systems"
        ],
        safetyControls: [
          "Flame detection systems (thermocouples, flame rods)",
          "High temperature limit switches",
          "Pressure switches (air, gas, water)",
          "Flow switches and sensors",
          "Rollout switches and spill detectors"
        ],
        operatingControls: [
          "Gas valve operation and types",
          "Ignition control modules",
          "Fan and pump controls",
          "Transformer and electrical systems",
          "User interface and displays"
        ],
        controlSequence: [
          "Pre-ignition safety checks",
          "Ignition sequence timing",
          "Flame establishment verification",
          "Normal operation monitoring",
          "Shutdown and lockout procedures"
        ]
      }
    },
    5: {
      id: 5,
      title: "Venting Systems for Appliances - Chapter 5",
      pdfFile: "Unit 9 Chapter 5.pdf",
      content: {
        overview: "Appliance venting requirements and systems",
        ventingPrinciples: [
          "Natural draft operation",
          "Induced draft systems",
          "Direct vent applications",
          "Power venting methods",
          "Condensate management"
        ],
        ventingCategories: [
          "Category I: Natural draft, non-condensing",
          "Category III: Forced draft, non-condensing", 
          "Category IV: Condensing appliances",
          "Direct vent: Sealed combustion",
          "Vent-free: Special applications"
        ],
        ventSystemComponents: [
          "Vent connectors and sizing",
          "Chimney and vertical venting",
          "Horizontal venting runs",
          "Termination requirements",
          "Support and clearance requirements"
        ],
        troubleshooting: [
          "Draft problems and solutions",
          "Condensation issues",
          "Blockage and restriction problems",
          "Backdrafting causes and remedies",
          "Vent system testing procedures"
        ]
      }
    },
    6: {
      id: 6,
      title: "Installation Requirements - Chapter 6",
      pdfFile: "Unit 9 Chapter 6.pdf",
      content: {
        overview: "Gas appliance installation standards and procedures",
        installationPlanning: [
          "Location selection and requirements",
          "Clearance measurements and verification",
          "Utility connections planning",
          "Access and service considerations",
          "Code compliance verification"
        ],
        clearanceRequirements: [
          "Clearances to combustible materials",
          "Service and maintenance access",
          "Air supply and ventilation clearances",
          "Appliance-to-appliance spacing",
          "Special clearance reductions"
        ],
        connectionProcedures: [
          "Gas line connection and testing",
          "Electrical connection requirements",
          "Venting system connection",
          "Water and drain connections (as applicable)",
          "Control and safety device wiring"
        ],
        commissioningProcedures: [
          "Initial startup and operation checks",
          "Safety system testing",
          "Performance verification",
          "Customer training and documentation",
          "Final inspection and approval"
        ]
      }
    },
    7: {
      id: 7,
      title: "Basic Troubleshooting - Chapter 7",
      pdfFile: "Unit 9 Chapter 7.pdf",
      content: {
        overview: "Basic gas appliance troubleshooting techniques",
        diagnosticApproach: [
          "Systematic troubleshooting methods",
          "Safety checks before diagnosis",
          "Visual inspection techniques",
          "Performance measurement and testing",
          "Component isolation and testing"
        ],
        commonProblems: [
          "No ignition or flame establishment",
          "Intermittent operation or cycling",
          "Inadequate heat output",
          "Excessive cycling or short cycling",
          "Safety system lockouts"
        ],
        diagnosticTools: [
          "Multimeters for electrical testing",
          "Manometers for pressure measurement",
          "Combustion analyzers",
          "Temperature measurement devices",
          "Gas leak detection equipment"
        ],
        troubleshootingProcedures: [
          "Checking power supply and connections",
          "Testing safety controls and interlocks",
          "Verifying gas supply and pressure",
          "Checking ignition and flame detection",
          "Evaluating heat exchanger and venting"
        ]
      }
    }
  },
  
  commonQuestions: [
    {
      question: "What's the difference between atmospheric and power burners?",
      answer: "Atmospheric burners rely on natural draft and gas pressure to draw combustion air, while power burners use a fan to force air into the combustion chamber. Power burners provide better air-fuel mixing and can operate in tighter spaces."
    },
    {
      question: "How do I determine the correct gas appliance size for a space?",
      answer: "Calculate the heat loss of the space using factors like square footage, insulation, windows, and climate. Then select an appliance with BTU input that matches the calculated heat requirement, typically with 10-20% safety margin."
    },
    {
      question: "What does AFUE rating mean and why is it important?",
      answer: "AFUE (Annual Fuel Utilization Efficiency) measures how much fuel is converted to useful heat. An 80% AFUE means 80% of fuel becomes heat, 20% goes up the chimney. Higher AFUE means lower operating costs and better efficiency."
    },
    {
      question: "Why do some appliances need outdoor combustion air?",
      answer: "Tight homes may not have enough air infiltration for proper combustion. Outdoor air ensures adequate oxygen supply, prevents backdrafting, and maintains proper combustion air-fuel ratios for safe and efficient operation."
    },
    {
      question: "What causes a yellow flame on gas appliances?",
      answer: "Yellow flames indicate incomplete combustion due to insufficient primary air, dirty burners, improper gas pressure, or blocked air inlets. This produces carbon monoxide and reduces efficiency - requires immediate correction."
    }
  ],
  
  applianceComparison: [
    {
      type: "Conventional Furnace (80% AFUE)",
      characteristics: [
        "Natural draft venting (Category I)",
        "Single-stage gas valve",
        "Steel heat exchanger", 
        "Flue temperatures 300-500°F",
        "Lower initial cost"
      ],
      applications: "Standard residential heating, existing chimney systems"
    },
    {
      type: "Condensing Furnace (90%+ AFUE)", 
      characteristics: [
        "Forced/direct venting (Category IV)",
        "Modulating gas valve options",
        "Secondary heat exchanger",
        "Flue temperatures 100-140°F",
        "Condensate drainage required"
      ],
      applications: "High efficiency heating, new construction"
    }
  ],
  
  safetyChecklist: [
    {
      item: "Gas Supply",
      checks: [
        "Proper gas pressure at appliance",
        "No gas leaks at connections",
        "Adequate pipe sizing for load",
        "Proper shutoff valve operation"
      ]
    },
    {
      item: "Combustion Air",
      checks: [
        "Adequate air supply openings",
        "No blockages in air intakes",
        "Proper air intake sizing",
        "Direct outdoor air if required"
      ]
    },
    {
      item: "Venting System",
      checks: [
        "Proper vent sizing and slope",
        "No obstructions or damage",
        "Adequate clearances maintained",
        "Proper termination location"
      ]
    }
  ],
  
  troubleshootingGuide: [
    {
      problem: "Appliance won't ignite",
      possibleCauses: [
        "No gas supply or low pressure",
        "Faulty ignition system",
        "Safety lockout condition",
        "Thermostat/control issues"
      ],
      diagnosticSteps: [
        "Check gas supply and pressure",
        "Verify electrical power",
        "Test ignition components",
        "Check safety controls"
      ]
    },
    {
      problem: "Short cycling operation",
      possibleCauses: [
        "Oversized appliance",
        "Restricted airflow",
        "Faulty limit controls",
        "Heat exchanger problems"
      ],
      diagnosticSteps: [
        "Check air filters and ductwork",
        "Measure temperature rise",
        "Test limit switches",
        "Inspect heat exchanger"
      ]
    }
  ],
  
  maintenanceSchedule: [
    {
      frequency: "Monthly",
      tasks: ["Check air filters", "Verify proper operation", "Look for unusual sounds/smells"]
    },
    {
      frequency: "Annually", 
      tasks: ["Clean burners and heat exchanger", "Test safety controls", "Check venting system", "Calibrate controls"]
    },
    {
      frequency: "As Needed",
      tasks: ["Replace worn components", "Address performance issues", "Update software/controls"]
    }
  ],
  
  keywords: [
    "gas appliances", "burners", "heat exchanger", "combustion", "ignition",
    "controls", "safety systems", "venting", "AFUE", "efficiency", "installation",
    "troubleshooting", "flame detection", "atmospheric burner", "power burner",
    "condensing", "non-condensing", "clearances", "maintenance"
  ]
};