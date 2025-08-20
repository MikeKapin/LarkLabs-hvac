// CSA Unit 5 - Basic Electricity Module Data
export const module5ElectricityData = {
  moduleId: 5,
  title: "Basic Electricity",
  description: "Basic electrical principles for gas appliance technicians",
  folderPath: "Module 5  Basic Electricity",
  
  chapters: {
    1: {
      id: 1,
      title: "Electrical Fundamentals - Chapter 1",
      pdfFile: "Unit 5 Chapter 1.pdf",
      content: {
        overview: "Basic electrical theory and principles",
        basicConcepts: [
          "Atomic structure and electron flow",
          "Electrical current (amperage)",
          "Voltage (electrical pressure)",
          "Resistance (opposition to current flow)",
          "Power (watts) and energy consumption"
        ],
        unitsOfMeasurement: [
          "Voltage (V) - measured in volts",
          "Current (I) - measured in amperes (amps)",
          "Resistance (R) - measured in ohms (Ω)",
          "Power (P) - measured in watts (W)",
          "Energy - measured in kilowatt-hours (kWh)"
        ],
        ohmsLaw: [
          "V = I × R (Voltage = Current × Resistance)",
          "I = V ÷ R (Current = Voltage ÷ Resistance)",
          "R = V ÷ I (Resistance = Voltage ÷ Current)",
          "P = V × I (Power = Voltage × Current)",
          "P = I² × R (Power = Current² × Resistance)"
        ],
        electricalSafety: [
          "Understanding electrical shock hazards",
          "Lockout/tagout procedures",
          "Proper use of electrical meters",
          "Personal protective equipment",
          "Arc flash and blast hazards"
        ]
      }
    },
    2: {
      id: 2,
      title: "DC Circuits and Components - Chapter 2",
      pdfFile: "Unit 5 Chapter 2.pdf",
      content: {
        overview: "Direct current circuits and basic electrical components",
        dcCircuitTypes: [
          "Series circuits - single path for current",
          "Parallel circuits - multiple paths for current",
          "Series-parallel combinations",
          "Circuit analysis techniques",
          "Voltage and current distribution"
        ],
        basicComponents: [
          "Resistors - limit current flow",
          "Capacitors - store electrical energy",
          "Inductors - oppose changes in current",
          "Diodes - allow current in one direction",
          "Switches - control circuit continuity"
        ],
        circuitAnalysis: [
          "Kirchhoff's voltage law (KVL)",
          "Kirchhoff's current law (KCL)",
          "Series circuit calculations",
          "Parallel circuit calculations",
          "Equivalent resistance calculations"
        ],
        practicalApplications: [
          "Battery circuits in gas appliances",
          "Control circuit analysis",
          "Troubleshooting DC circuits",
          "Component testing procedures",
          "Circuit protection devices"
        ]
      }
    },
    3: {
      id: 3,
      title: "AC Circuits and Power - Chapter 3",
      pdfFile: "Unit 5 Chapter 3.pdf",
      content: {
        overview: "Alternating current principles and power calculations",
        acFundamentals: [
          "Sine wave characteristics",
          "Frequency (60 Hz in North America)",
          "Peak, RMS, and average values",
          "Phase relationships",
          "AC vs DC characteristics"
        ],
        acPowerConcepts: [
          "Real power (watts) - actual power consumed",
          "Reactive power (VARs) - power stored/returned",
          "Apparent power (VA) - total power",
          "Power factor - efficiency measure",
          "Three-phase power systems"
        ],
        acCircuitComponents: [
          "Resistive loads (heating elements)",
          "Inductive loads (motors, transformers)",
          "Capacitive loads (power factor correction)",
          "Impedance in AC circuits",
          "Resonance phenomena"
        ],
        powerCalculations: [
          "Single-phase power: P = V × I × cos θ",
          "Three-phase power: P = √3 × V × I × cos θ",
          "Power factor calculations",
          "Energy consumption calculations",
          "Motor power requirements"
        ]
      }
    },
    4: {
      id: 4,
      title: "Electrical Measuring Instruments - Chapter 4",
      pdfFile: "Unit 5 Chapter 4.pdf",
      content: {
        overview: "Electrical measuring instruments and testing procedures",
        meterTypes: [
          "Digital multimeters (DMM)",
          "Analog meters (moving coil)",
          "Clamp-on ammeters",
          "Oscilloscopes for waveform analysis",
          "Specialized gas appliance meters"
        ],
        measurementTechniques: [
          "Voltage measurements (parallel connection)",
          "Current measurements (series connection)",
          "Resistance measurements (power off)",
          "Continuity testing procedures",
          "Insulation resistance testing"
        ],
        safetyProcedures: [
          "Proper meter setup and range selection",
          "Lockout/tagout before testing",
          "Personal protective equipment use",
          "Live circuit testing precautions",
          "Meter maintenance and calibration"
        ],
        troubleshootingTechniques: [
          "Systematic approach to electrical problems",
          "Voltage drop testing",
          "Load testing procedures",
          "Component isolation techniques",
          "Documentation of test results"
        ]
      }
    },
    5: {
      id: 5,
      title: "Motors and Motor Controls - Chapter 5",
      pdfFile: "Unit 5 Chapter 5.pdf",
      content: {
        overview: "Electric motors and control systems in gas appliances",
        motorTypes: [
          "Single-phase induction motors",
          "Three-phase induction motors",
          "Shaded pole motors (small fans)",
          "Permanent split capacitor (PSC) motors",
          "Variable speed ECM motors"
        ],
        motorComponents: [
          "Stator windings and magnetic field",
          "Rotor construction and operation",
          "Starting capacitors and circuits",
          "Centrifugal switches",
          "Thermal protection devices"
        ],
        motorControls: [
          "Manual motor starters",
          "Magnetic motor starters",
          "Overload protection devices",
          "Variable frequency drives (VFDs)",
          "Soft start controllers"
        ],
        troubleshooting: [
          "Motor performance testing",
          "Winding resistance measurements",
          "Capacitor testing procedures",
          "Starting circuit diagnosis",
          "Bearing and mechanical issues"
        ]
      }
    },
    6: {
      id: 6,
      title: "Control Systems and Components - Chapter 6",
      pdfFile: "Unit 5 Chapter 6.pdf",
      content: {
        overview: "Electrical control systems for gas appliances",
        controlComponents: [
          "Relays and contactors",
          "Timers and time delay relays",
          "Thermostats and temperature sensors",
          "Pressure switches",
          "Flow switches and sensors"
        ],
        controlCircuits: [
          "Two-wire control circuits",
          "Three-wire control circuits",
          "Interlocking circuits",
          "Sequencing circuits",
          "Safety shutdown circuits"
        ],
        logicSystems: [
          "Basic logic functions (AND, OR, NOT)",
          "Ladder logic diagrams",
          "Programmable logic controllers (PLCs)",
          "Input/output (I/O) systems",
          "HMI (Human Machine Interface) systems"
        ],
        safetyControls: [
          "Flame detection systems",
          "Pressure proving switches",
          "Temperature limit controls",
          "Emergency shutdown systems",
          "Interlocking safety circuits"
        ]
      }
    },
    7: {
      id: 7,
      title: "Electrical Safety and Codes - Chapter 7",
      pdfFile: "Unit 5 Chapter 7.pdf",
      content: {
        overview: "Electrical safety practices and code requirements",
        electricalHazards: [
          "Shock hazards and physiological effects",
          "Arc flash and blast hazards",
          "Fire hazards from electrical faults",
          "Explosion hazards in gas environments",
          "Equipment damage from electrical faults"
        ],
        safetyProcedures: [
          "Lockout/tagout procedures",
          "Personal protective equipment selection",
          "Safe work practices",
          "Electrical permit requirements",
          "Qualified person requirements"
        ],
        electricalCodes: [
          "Canadian Electrical Code (CEC)",
          "National Electrical Code (NEC) - US",
          "Local electrical bylaws",
          "Gas appliance electrical requirements",
          "Grounding and bonding requirements"
        ],
        installationRequirements: [
          "Electrical disconnects for gas appliances",
          "Grounding electrode systems",
          "GFCI protection requirements",
          "Conductor sizing and protection",
          "Panel and circuit identification"
        ]
      }
    }
  },
  
  commonQuestions: [
    {
      question: "What is Ohm's Law and how is it used in gas appliance work?",
      answer: "Ohm's Law states V = I × R (Voltage = Current × Resistance). It's used to calculate unknown electrical values when troubleshooting gas appliance electrical systems, sizing conductors, and understanding circuit behavior."
    },
    {
      question: "What's the difference between AC and DC electricity?",
      answer: "DC (Direct Current) flows in one direction constantly, like from batteries. AC (Alternating Current) reverses direction 60 times per second (60 Hz) and is used in household electricity. Most gas appliances use AC power with some DC control circuits."
    },
    {
      question: "How do I safely measure voltage in a gas appliance?",
      answer: "Use a properly rated digital multimeter, ensure proper PPE, verify the meter is working on a known source, connect meter leads properly (parallel for voltage), and follow lockout/tagout procedures when possible."
    },
    {
      question: "What is power factor and why does it matter?",
      answer: "Power factor is the ratio of real power to apparent power, indicating electrical efficiency. Poor power factor (below 0.85) can increase utility costs and indicates issues with inductive loads like motors in gas appliances."
    },
    {
      question: "When do I need an electrical disconnect for gas appliances?",
      answer: "Electrical disconnects are required for gas appliances with electrical connections per electrical codes. The disconnect must be within sight of the appliance and readily accessible for service and emergency shutdown."
    }
  ],
  
  practicalCalculations: [
    {
      title: "Motor Current Calculation",
      problem: "Calculate current draw for a 1/4 HP motor at 120V, 85% efficiency",
      solution: "746W/HP × 0.25 HP ÷ 0.85 efficiency ÷ 120V = 1.83 amps",
      note: "Add safety factor for wire sizing and overcurrent protection"
    },
    {
      title: "Voltage Drop Calculation",
      problem: "Calculate voltage drop in 100 feet of #12 wire carrying 15 amps",
      solution: "VD = 2 × K × I × L ÷ CM = 2 × 12.9 × 15 × 100 ÷ 20,380 = 1.9 volts",
      note: "Voltage drop should not exceed 3% for branch circuits"
    }
  ],
  
  troubleshootingGuide: [
    {
      problem: "Motor won't start",
      possibleCauses: [
        "No power to motor",
        "Blown fuses or tripped breaker",
        "Faulty starting capacitor",
        "Open motor windings",
        "Mechanical binding"
      ],
      testingSteps: [
        "Check voltage at motor terminals",
        "Test starting capacitor",
        "Measure winding resistance",
        "Check for mechanical issues"
      ]
    },
    {
      problem: "Control circuit not functioning",
      possibleCauses: [
        "Blown control fuse",
        "Faulty control transformer",
        "Open control wiring",
        "Faulty control components",
        "Poor connections"
      ],
      testingSteps: [
        "Check control voltage",
        "Test transformer output",
        "Check continuity of control circuits",
        "Test individual components"
      ]
    }
  ],
  
  safetyReminders: [
    "Always assume circuits are live until verified dead",
    "Use appropriate PPE for electrical work",
    "Follow lockout/tagout procedures",
    "Never work alone on electrical systems",
    "Keep electrical tools properly maintained and calibrated"
  ],
  
  keywords: [
    "electricity", "voltage", "current", "resistance", "ohms law", "AC", "DC",
    "power", "motors", "controls", "multimeter", "troubleshooting", "electrical safety",
    "circuits", "capacitor", "transformer", "relay", "power factor", "grounding"
  ]
};