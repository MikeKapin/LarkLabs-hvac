// CSA Unit 6 - Technical Drawings, Manuals and Graphs Module Data
export const module6TechnicalDrawingsData = {
  moduleId: 6,
  title: "Technical Drawings, Manuals and Graphs",
  description: "Reading and interpreting technical documentation and drawings",
  folderPath: "Module 6 Technical Drawings  Manuals and Graphs",
  
  chapters: {
    1: {
      id: 1,
      title: "Blueprint Reading and Symbols - Chapter 1",
      pdfFile: "CSA Unit 6 Chapter 1.pdf",
      content: {
        overview: "Understanding technical drawings and blueprint symbols",
        drawingTypes: [
          "Schematic diagrams - show system operation",
          "Piping and instrumentation diagrams (P&IDs)",
          "Isometric drawings - 3D representation",
          "Orthographic projections - multiple views",
          "Detail drawings - specific components"
        ],
        commonSymbols: [
          "Gas piping and fittings symbols",
          "Valve symbols (gate, globe, ball, check)",
          "Appliance symbols and representations",
          "Electrical symbols in gas systems",
          "Safety device symbols"
        ],
        drawingComponents: [
          "Title blocks and revision information",
          "Scale and dimensioning",
          "Notes and specifications",
          "Material lists and legends",
          "Reference grids and coordinates"
        ],
        interpretationSkills: [
          "Reading dimension chains",
          "Understanding tolerances",
          "Identifying materials and specifications",
          "Cross-referencing multiple drawings",
          "Recognizing standard conventions"
        ]
      }
    },
    2: {
      id: 2,
      title: "Technical Manuals and Documentation - Chapter 2",
      pdfFile: "CSA Unit 6 Chapter 2.pdf",
      content: {
        overview: "Using technical manuals and documentation effectively",
        manualTypes: [
          "Installation manuals - step-by-step procedures",
          "Operation manuals - normal operation guidance",
          "Maintenance manuals - service procedures",
          "Parts catalogs - component identification",
          "Troubleshooting guides - diagnostic procedures"
        ],
        documentStructure: [
          "Table of contents and indexing",
          "Safety warnings and cautions",
          "Specification tables",
          "Wiring and piping diagrams",
          "Appendices and reference materials"
        ],
        informationExtraction: [
          "Finding specific procedures quickly",
          "Understanding technical specifications",
          "Interpreting performance data",
          "Following step-by-step instructions",
          "Cross-referencing related information"
        ],
        documentMaintenance: [
          "Keeping manuals current and updated",
          "Organizing documentation systems",
          "Digital vs. paper documentation",
          "Backup and retrieval systems",
          "Compliance record keeping"
        ]
      }
    },
    3: {
      id: 3,
      title: "Graphs and Charts - Chapter 3",
      pdfFile: "CSA Unit 6 Chapter 3.pdf",
      content: {
        overview: "Reading and interpreting technical graphs and charts",
        graphTypes: [
          "Performance curves - efficiency vs. load",
          "Pressure-temperature relationships",
          "Flow rate vs. pressure drop charts",
          "Combustion air requirement graphs",
          "Sizing charts for components"
        ],
        chartInterpretation: [
          "X and Y axis identification",
          "Scale reading and interpolation",
          "Understanding curve relationships",
          "Finding intersection points",
          "Extrapolation techniques"
        ],
        practicalApplications: [
          "Pipe sizing using flow charts",
          "Appliance selection from performance curves",
          "Venting system sizing calculations",
          "Pressure regulator selection",
          "Combustion air calculations"
        ],
        dataAnalysis: [
          "Trend identification in data",
          "Comparing multiple data sets",
          "Understanding measurement uncertainty",
          "Quality control charting",
          "Performance monitoring"
        ]
      }
    },
    4: {
      id: 4,
      title: "Specifications and Standards - Chapter 4",
      pdfFile: "CSA Unit 6 Chapter 4.pdf",
      content: {
        overview: "Understanding technical specifications and industry standards",
        specificationTypes: [
          "Material specifications - grades and properties",
          "Performance specifications - operational requirements",
          "Dimensional specifications - size and tolerance",
          "Installation specifications - procedures and methods",
          "Testing specifications - acceptance criteria"
        ],
        standardsOrganizations: [
          "CSA (Canadian Standards Association)",
          "ANSI (American National Standards Institute)",
          "ASME (American Society of Mechanical Engineers)",
          "NFPA (National Fire Protection Association)",
          "UL (Underwriters Laboratories)"
        ],
        specificationReading: [
          "Understanding specification formats",
          "Identifying mandatory vs. recommended",
          "Finding applicable revisions",
          "Cross-referencing related standards",
          "Understanding compliance requirements"
        ],
        practicalApplication: [
          "Material selection from specifications",
          "Verifying compliance with standards",
          "Documentation for inspections",
          "Quality assurance procedures",
          "Change order management"
        ]
      }
    },
    5: {
      id: 5,
      title: "Digital Documentation and CAD - Chapter 5",
      pdfFile: "CSA Unit 6 Chapter 5.pdf",
      content: {
        overview: "Working with digital documentation and CAD systems",
        digitalSystems: [
          "Computer-Aided Design (CAD) basics",
          "Digital document management",
          "Electronic drawing distribution",
          "Version control systems",
          "Mobile documentation access"
        ],
        cadFundamentals: [
          "Understanding CAD file formats",
          "Layer management and organization",
          "Measurement tools in CAD",
          "Printing and plotting from CAD",
          "Markup and revision tracking"
        ],
        mobileTools: [
          "Tablet and smartphone documentation",
          "Field markup capabilities",
          "Photo integration with drawings",
          "GPS location referencing",
          "Real-time collaboration tools"
        ],
        bestPractices: [
          "File organization and naming",
          "Backup and recovery procedures",
          "Security and access control",
          "Training and skill development",
          "Technology adoption strategies"
        ]
      }
    }
  },
  
  commonQuestions: [
    {
      question: "How do I read a piping isometric drawing?",
      answer: "Isometric drawings show piping in 3D using a 30-60-90 degree projection. Follow the pipe runs from point to point, noting elevations, directions, and fittings. Dimensions are typically given as coordinates (North, East, Elevation) or as run lengths between fittings."
    },
    {
      question: "What's the difference between a schematic and a P&ID?",
      answer: "A schematic shows the functional operation and flow of a system, while a P&ID (Piping & Instrumentation Diagram) shows the actual physical piping, equipment, and instrumentation with proper symbols and identification numbers for construction and operation."
    },
    {
      question: "How do I find the right information in a technical manual quickly?",
      answer: "Use the table of contents for general topics, the index for specific items, and look for troubleshooting flowcharts or quick reference sections. Many manuals have separate sections for installation, operation, and maintenance - go directly to the relevant section."
    },
    {
      question: "How do I read a pipe sizing chart?",
      answer: "Find your flow rate (typically in ft³/hr or BTU/hr) on one axis and your pipe length or pressure drop allowance on the other. The intersection will show the minimum pipe size needed. Always account for fittings and follow code requirements."
    },
    {
      question: "What should I do when drawings don't match field conditions?",
      answer: "Document the discrepancy with photos and measurements, check for drawing revisions or change orders, consult with the engineer or designer, and never assume - always clarify before proceeding with installation."
    }
  ],
  
  practicalExercises: [
    {
      title: "Reading Appliance Installation Drawing",
      scenario: "Interpreting clearance requirements from manufacturer's installation drawing",
      steps: [
        "Identify the scale and units used",
        "Locate clearance dimensions to combustibles",
        "Find venting connection requirements",
        "Note electrical connection specifications",
        "Check for special installation notes"
      ],
      keyLearning: "Always verify current drawing revision and cross-reference with local codes"
    },
    {
      title: "Using Pipe Sizing Charts",
      scenario: "Sizing gas piping for multiple appliances",
      steps: [
        "Calculate total BTU load for all appliances",
        "Measure equivalent pipe length including fittings",
        "Select appropriate chart for gas type",
        "Find intersection of load and length",
        "Verify code compliance for selected size"
      ],
      keyLearning: "Always use equivalent length, not just physical pipe length"
    }
  ],
  
  symbolLibrary: [
    {
      category: "Piping Components",
      symbols: [
        "Straight pipe runs",
        "Elbows (90°, 45°, reducing)",
        "Tees and crosses",
        "Reducers and increasers",
        "Flanged connections"
      ]
    },
    {
      category: "Valves",
      symbols: [
        "Gate valve",
        "Globe valve", 
        "Ball valve",
        "Check valve",
        "Relief valve"
      ]
    },
    {
      category: "Gas Equipment",
      symbols: [
        "Gas meter",
        "Pressure regulator",
        "Gas appliances",
        "Shut-off valves",
        "Test connections"
      ]
    }
  ],
  
  documentationTools: [
    {
      tool: "Scale Ruler",
      use: "Measuring distances on scaled drawings",
      note: "Verify drawing scale before measuring"
    },
    {
      tool: "Proportional Dividers",
      use: "Scaling measurements up or down",
      note: "Useful for converting between different scales"
    },
    {
      tool: "Digital Calipers",
      use: "Precise measurements on drawings",
      note: "Can measure in multiple units"
    }
  ],
  
  keywords: [
    "technical drawings", "blueprints", "schematics", "P&ID", "isometric",
    "symbols", "specifications", "manuals", "graphs", "charts", "CAD",
    "documentation", "standards", "scale", "dimensions", "tolerances",
    "pipe sizing", "performance curves", "installation drawings"
  ]
};