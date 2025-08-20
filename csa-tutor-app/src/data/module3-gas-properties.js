// CSA Unit 3 - Properties and Safe Handling of Fuel Gases Module Data
export const module3GasPropertiesData = {
  moduleId: 3,
  title: "Properties and Safe Handling of Fuel Gases",
  description: "Understanding fuel gas properties and safe handling procedures",
  folderPath: "Module 3 Properties of Natural Gas",
  
  chapters: {
    1: {
      id: 1,
      title: "Natural Gas Properties - Chapter 1",
      pdfFile: "CSA Unit 3 Chapter 1.pdf",
      content: {
        overview: "Physical and chemical properties of natural gas",
        physicalProperties: [
          "Specific gravity: 0.60 (lighter than air)",
          "Heating value: ~1000 BTU/ft³ (37 MJ/m³)",
          "Ignition temperature: ~1000°F (540°C)",
          "Flammable range: 5-15% by volume in air",
          "Odorless in pure form (mercaptan added for detection)"
        ],
        chemicalComposition: [
          "Methane (CH₄): 85-95% typical",
          "Ethane (C₂H₆): 3-8%",
          "Propane (C₃H₈): 1-3%",
          "Butane (C₄H₁₀): <1%",
          "Nitrogen (N₂): 1-5%",
          "Carbon dioxide (CO₂): <3%"
        ],
        safetyCharacteristics: [
          "Non-toxic but can cause asphyxiation",
          "Rises and disperses in open air",
          "Can accumulate in confined spaces",
          "Requires ignition source to burn",
          "Burns with blue flame when properly mixed with air"
        ],
        qualityStandards: [
          "Pipeline quality specifications",
          "Heating value requirements",
          "Moisture content limits",
          "Sulfur compound restrictions",
          "Solid particle limitations"
        ]
      }
    },
    2: {
      id: 2,
      title: "Propane (LPG) Properties - Chapter 2",
      pdfFile: "CSA Unit 3 Chapter 2.pdf",
      content: {
        overview: "Properties and characteristics of propane and liquefied petroleum gas",
        physicalProperties: [
          "Specific gravity: 1.52 (heavier than air)",
          "Heating value: ~2500 BTU/ft³ (93 MJ/m³)",
          "Boiling point: -44°F (-42°C) at atmospheric pressure",
          "Ignition temperature: ~920°F (493°C)",
          "Flammable range: 2.1-9.5% by volume in air"
        ],
        storageCharacteristics: [
          "Stored as liquid under pressure",
          "Vaporizes when pressure is reduced",
          "Expansion ratio: 1:270 (liquid to gas)",
          "Temperature affects vapor pressure",
          "Requires proper container sizing"
        ],
        safetyConsiderations: [
          "Heavier than air - settles in low areas",
          "Can accumulate in basements and pits",
          "Liquid contact can cause frostbite",
          "Higher pressure storage requirements",
          "Odorized with ethyl mercaptan for detection"
        ],
        applications: [
          "Residential heating and cooking",
          "Industrial processes",
          "Vehicle fuel systems",
          "Recreational vehicle systems",
          "Agricultural applications"
        ]
      }
    },
    3: {
      id: 3,
      title: "Combustion Principles and Gas Utilization - Chapter 3",
      pdfFile: "CSA Unit 3 Chapter 3.pdf",
      content: {
        overview: "Combustion theory and practical gas utilization",
        combustionFundamentals: [
          "Complete vs. incomplete combustion",
          "Primary and secondary air requirements",
          "Theoretical air calculations",
          "Excess air requirements",
          "Combustion efficiency factors"
        ],
        airRequirements: [
          "Natural gas: ~10 ft³ air per ft³ gas (stoichiometric)",
          "Propane: ~24 ft³ air per ft³ gas (stoichiometric)",
          "Primary air: mixed before combustion",
          "Secondary air: supplied around flame",
          "Excess air: ensures complete combustion"
        ],
        combustionProducts: [
          "Complete combustion: CO₂ + H₂O + heat",
          "Incomplete combustion: CO + other products",
          "Factors affecting combustion quality",
          "Flue gas analysis techniques",
          "Emission considerations"
        ],
        burnerTypes: [
          "Atmospheric (natural draft) burners",
          "Power (forced draft) burners",
          "Pre-mix burner designs",
          "Ribbon and sheet metal burners",
          "Specialty burner applications"
        ],
        flameCharacteristics: [
          "Proper flame appearance (blue, stable)",
          "Flame impingement effects",
          "Flame rollout conditions",
          "Yellow tipping causes and solutions",
          "Flame stability factors"
        ]
      }
    }
  },
  
  commonQuestions: [
    {
      question: "What's the difference between natural gas and propane specific gravity?",
      answer: "Natural gas has a specific gravity of 0.60 (lighter than air) so it rises and disperses, while propane has a specific gravity of 1.52 (heavier than air) so it settles in low areas like basements and pits. This affects safety procedures and leak response."
    },
    {
      question: "How much air is needed for complete combustion of natural gas?",
      answer: "Natural gas requires approximately 10 cubic feet of air for every cubic foot of gas for stoichiometric (complete) combustion. In practice, excess air (typically 50-100%) is provided to ensure complete combustion."
    },
    {
      question: "Why does propane have a higher heating value than natural gas?",
      answer: "Propane contains more carbon and hydrogen atoms per molecule than methane (main component of natural gas), resulting in approximately 2.5 times the heating value: ~2500 BTU/ft³ for propane vs ~1000 BTU/ft³ for natural gas."
    },
    {
      question: "What causes a yellow flame on gas burners?",
      answer: "Yellow flames typically indicate incomplete combustion due to insufficient primary air, improper air/gas mixture, burner contamination, or blocked air ports. This can produce carbon monoxide and should be corrected immediately."
    },
    {
      question: "At what concentration does natural gas become dangerous?",
      answer: "Natural gas becomes flammable at 5% concentration in air (Lower Explosive Limit - LEL) and stops burning at 15% (Upper Explosive Limit - UEL). At high concentrations, it can cause asphyxiation by displacing oxygen."
    }
  ],
  
  practicalCalculations: [
    {
      title: "BTU Input Calculation",
      problem: "Calculate gas flow for 80,000 BTU/hr input",
      solution: {
        naturalGas: "80,000 BTU/hr ÷ 1000 BTU/ft³ = 80 ft³/hr",
        propane: "80,000 BTU/hr ÷ 2500 BTU/ft³ = 32 ft³/hr"
      },
      note: "Actual heating values may vary by supplier and should be verified"
    },
    {
      title: "Air Requirements",
      problem: "Calculate theoretical air for 100 ft³/hr natural gas",
      solution: "100 ft³/hr × 10 ft³ air/ft³ gas = 1000 ft³/hr theoretical air",
      practicalNote: "Add 50-100% excess air for actual applications"
    }
  ],
  
  gasComparisons: {
    naturalGas: {
      specificGravity: 0.60,
      heatingValue: "~1000 BTU/ft³",
      ignitionTemp: "~1000°F",
      flammableRange: "5-15%",
      behavior: "Rises and disperses"
    },
    propane: {
      specificGravity: 1.52,
      heatingValue: "~2500 BTU/ft³",
      ignitionTemp: "~920°F",
      flammableRange: "2.1-9.5%",
      behavior: "Settles in low areas"
    }
  },
  
  safetyProcedures: [
    {
      gasType: "Natural Gas",
      leakResponse: [
        "Ventilate area (gas will rise)",
        "Check upper levels and ceiling areas",
        "Eliminate ignition sources",
        "Use gas detector to verify clearance"
      ]
    },
    {
      gasType: "Propane",
      leakResponse: [
        "Ventilate low areas first (gas settles)",
        "Check basements, pits, and confined spaces",
        "Use explosion-proof ventilation equipment",
        "Monitor with gas detector before entry"
      ]
    }
  ],
  
  keywords: [
    "natural gas", "propane", "LPG", "specific gravity", "heating value",
    "combustion", "BTU", "flammable range", "ignition temperature", "air requirements",
    "stoichiometric", "complete combustion", "incomplete combustion", "flame characteristics",
    "burner types", "primary air", "secondary air", "carbon monoxide", "methane"
  ]
};