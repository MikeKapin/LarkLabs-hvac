/**
 * Sample Question Bank for TSSA G2/G3 Certification
 * Comprehensive questions aligned with CSA B149.1-25 and B149.2 standards
 */

export const sampleQuestions = {
  safety: [
    {
      id: "safety_001",
      question_type: "multiple_choice",
      question_text: "What is the maximum allowable concentration of carbon monoxide in ambient air for continuous exposure in a workplace?",
      question_data: {
        options: [
          "25 ppm over 8 hours",
          "35 ppm over 8 hours", 
          "50 ppm over 8 hours",
          "100 ppm over 8 hours"
        ]
      },
      correct_answer: 0,
      explanation: "According to CSA standards and TSSA guidelines, the maximum allowable concentration of carbon monoxide for continuous exposure in a workplace is 25 ppm averaged over an 8-hour period. This limit protects workers from the harmful effects of CO exposure while performing gas technician duties.",
      difficulty_level: 2,
      estimated_time_minutes: 2,
      certification_level: "BOTH",
      competency: "safety",
      csa_standard: "B149.1",
      csa_section: "1.2",
      tags: ["carbon_monoxide", "safety_limits", "workplace_safety"]
    },
    {
      id: "safety_002", 
      question_type: "scenario_based",
      question_text: "A technician discovers a strong gas odor near an outdoor propane tank. What should be the FIRST action taken?",
      question_data: {
        scenario: "During a routine service call at a residential property, you approach an outdoor 100 lb propane tank and detect a strong odor of gas. The homeowner mentions they've noticed the smell for several days but thought it would go away on its own.",
        options: [
          "Immediately use a soap solution to locate the leak",
          "Turn off the gas supply at the tank valve",
          "Light a match to test for gas concentration",
          "Call the fire department and evacuate the area"
        ]
      },
      correct_answer: 3,
      explanation: "When encountering a strong gas odor, especially from a propane tank, the first priority is safety. The technician should call emergency services and evacuate the area immediately. Never attempt to locate leaks with open flames, and avoid actions that might create sparks. The gas supply should only be shut off if it can be done safely without risk of ignition.",
      difficulty_level: 3,
      estimated_time_minutes: 3,
      certification_level: "BOTH", 
      competency: "safety",
      csa_standard: "B149.2",
      csa_section: "4.1",
      tags: ["gas_leak", "emergency_procedures", "propane_safety"]
    },
    {
      id: "safety_003",
      question_type: "multiple_choice", 
      question_text: "Which of the following PPE items is most critical when working in a confined space with potential gas hazards?",
      question_data: {
        options: [
          "Safety glasses and hard hat",
          "Gas monitor and communication device", 
          "Steel-toed boots and gloves",
          "High-visibility vest and ear protection"
        ]
      },
      correct_answer: 1,
      explanation: "When working in confined spaces with potential gas hazards, a gas monitor is essential to detect dangerous concentrations of combustible gases, oxygen deficiency, or toxic gases like carbon monoxide. A communication device ensures contact with personnel outside the confined space for emergency situations.",
      difficulty_level: 2,
      estimated_time_minutes: 2,
      certification_level: "BOTH",
      competency: "safety", 
      csa_standard: "B149.1",
      csa_section: "2.1",
      tags: ["confined_space", "PPE", "gas_detection"]
    }
  ],

  installation: [
    {
      id: "install_001",
      question_type: "multiple_choice",
      question_text: "What is the minimum clearance required between a gas meter and an electrical panel in a residential installation?",
      question_data: {
        options: [
          "300 mm (12 inches)",
          "600 mm (24 inches)", 
          "900 mm (36 inches)",
          "1200 mm (48 inches)"
        ]
      },
      correct_answer: 2,
      explanation: "According to CSA B149.1, a minimum clearance of 900 mm (36 inches) is required between a gas meter and an electrical panel to prevent potential ignition sources from affecting the gas system and to provide adequate working space for both utilities.",
      difficulty_level: 2,
      estimated_time_minutes: 2,
      certification_level: "BOTH",
      competency: "installation",
      csa_standard: "B149.1",
      csa_section: "3.3", 
      tags: ["clearances", "gas_meter", "electrical_separation"]
    },
    {
      id: "install_002",
      question_type: "scenario_based",
      question_text: "What is the correct procedure for making the final connection to a gas appliance?",
      question_data: {
        scenario: "You are installing a new gas range in a residential kitchen. The gas line has been run to the appliance location, pressure tested, and approved. You are now ready to make the final connection from the appliance shut-off valve to the range.",
        options: [
          "Connect directly with rigid pipe and test immediately",
          "Use a flexible connector, test for leaks, then check operation",
          "Connect with approved flexible connector, purge air, test for leaks, then check operation", 
          "Use temporary connection, test operation, then make permanent connection"
        ]
      },
      correct_answer: 2,
      explanation: "The correct procedure includes: 1) Use an approved flexible connector suitable for the gas type and pressure, 2) Purge air from the line before lighting pilot lights or burners, 3) Test all connections for leaks using appropriate methods, and 4) Check appliance operation to ensure proper function. This sequence ensures safety and proper operation.",
      difficulty_level: 3,
      estimated_time_minutes: 3,
      certification_level: "G2",
      competency: "installation",
      csa_standard: "B149.1",
      csa_section: "4.2",
      tags: ["appliance_connection", "flexible_connector", "testing"]
    }
  ],

  calculations: [
    {
      id: "calc_001",
      question_type: "calculation",
      question_text: "Calculate the required pipe size for a 30 m run of steel pipe supplying 150 MJ/h to residential appliances, with an inlet pressure of 1.75 kPa and maximum allowable pressure drop of 0.5 kPa.",
      question_data: {
        given_values: {
          length: "30 m",
          gas_load: "150 MJ/h", 
          inlet_pressure: "1.75 kPa",
          pressure_drop: "0.5 kPa",
          pipe_material: "steel"
        },
        formula_reference: "Use longest length method and CSA sizing tables",
        units: "DN (nominal diameter)"
      },
      correct_answer: "DN20 (3/4 inch)",
      explanation: "Using the longest length method: 1) Total equivalent length = 30m + fittings allowance (~5m) = 35m equivalent length. 2) From CSA B149.1 sizing tables for steel pipe with 150 MJ/h load and 35m equivalent length, DN20 (3/4 inch) pipe provides adequate capacity while maintaining pressure drop within 0.5 kPa limit. DN15 would create excessive pressure drop.",
      difficulty_level: 4,
      estimated_time_minutes: 5,
      certification_level: "BOTH",
      competency: "calculations", 
      csa_standard: "B149.1",
      csa_section: "3.2",
      tags: ["pipe_sizing", "pressure_drop", "longest_length_method"]
    },
    {
      id: "calc_002",
      question_type: "calculation", 
      question_text: "Convert 2.5 inches of water column to kilopascals (kPa).",
      question_data: {
        given_values: {
          pressure: "2.5 inches water column"
        },
        formula_reference: "1 inch H2O = 0.2491 kPa",
        units: "kPa"
      },
      correct_answer: "0.62 kPa",
      explanation: "To convert inches of water column to kPa: 2.5 inches H2O × 0.2491 kPa/inch H2O = 0.6228 kPa, which rounds to 0.62 kPa. This conversion is essential for gas technicians working with different pressure measurement systems.",
      difficulty_level: 2,
      estimated_time_minutes: 2,
      certification_level: "BOTH", 
      competency: "calculations",
      csa_standard: "B149.1",
      csa_section: "1.2",
      tags: ["pressure_conversion", "units", "water_column"]
    }
  ],

  codes: [
    {
      id: "codes_001",
      question_type: "code_interpretation",
      question_text: "According to CSA B149.1, what is the maximum operating pressure for low-pressure gas systems in residential applications?",
      question_data: {
        code_section: "CSA B149.1, Section 1.2 - Definitions",
        situation: "Determining pressure classification for a residential gas system design",
        options: [
          "1.75 kPa (7 inches water column)",
          "2.5 kPa (10 inches water column)", 
          "3.5 kPa (14 inches water column)",
          "5.0 kPa (20 inches water column)"
        ]
      },
      correct_answer: 0,
      explanation: "CSA B149.1 defines low-pressure systems as operating at pressures not exceeding 1.75 kPa (7 inches water column). This pressure classification determines the materials, installation methods, and safety requirements that apply to the gas system. Systems operating above this pressure require different design considerations and materials.",
      difficulty_level: 2,
      estimated_time_minutes: 2,
      certification_level: "BOTH",
      competency: "codes",
      csa_standard: "B149.1", 
      csa_section: "1.2",
      tags: ["pressure_classification", "low_pressure", "definitions"]
    },
    {
      id: "codes_002",
      question_type: "multiple_choice",
      question_text: "Which document must be referenced when installing propane storage containers over 45 kg capacity?",
      question_data: {
        options: [
          "CSA B149.1 - Natural Gas Installation Code only", 
          "CSA B149.2 - Propane Storage and Handling Code",
          "Provincial building code only",
          "Manufacturer's instructions only"
        ]
      },
      correct_answer: 1,
      explanation: "CSA B149.2 - Propane Storage and Handling Code must be referenced for propane containers over 45 kg capacity. This code specifies requirements for container installation, location, clearances, safety equipment, and handling procedures. While manufacturer's instructions are also important, CSA B149.2 provides the regulatory framework.",
      difficulty_level: 2,
      estimated_time_minutes: 2,
      certification_level: "BOTH",
      competency: "codes",
      csa_standard: "B149.2", 
      csa_section: "1.1",
      tags: ["propane_storage", "code_selection", "large_containers"]
    }
  ],

  troubleshooting: [
    {
      id: "trouble_001",
      question_type: "scenario_based",
      question_text: "What is the most likely cause of this problem?",
      question_data: {
        scenario: "A customer complains that their gas water heater pilot light keeps going out. You observe that the pilot flame is yellow and unstable, and there's a slight odor of gas near the appliance. The vent appears properly connected and the combustion air openings are clear.",
        options: [
          "Defective thermocouple",
          "Insufficient combustion air",
          "Clogged pilot orifice or improper gas-air mixture", 
          "Blocked vent system"
        ]
      },
      correct_answer: 2,
      explanation: "A yellow, unstable pilot flame with gas odor indicates improper combustion, typically caused by a clogged pilot orifice or incorrect gas-air mixture. A properly burning pilot should be blue and stable. While a defective thermocouple could cause outages, it wouldn't cause the flame color and odor symptoms described.",
      difficulty_level: 3,
      estimated_time_minutes: 4,
      certification_level: "G2",
      competency: "troubleshooting",
      csa_standard: "B149.1",
      csa_section: "8.1",
      tags: ["pilot_light", "combustion", "flame_analysis"]
    }
  ],

  appliances: [
    {
      id: "appliance_001",
      question_type: "multiple_choice",
      question_text: "What is the minimum clearance required between a gas-fired water heater and combustible materials on the sides and back?", 
      question_data: {
        options: [
          "25 mm (1 inch)",
          "50 mm (2 inches)",
          "150 mm (6 inches)",
          "300 mm (12 inches)"
        ]
      },
      correct_answer: 2,
      explanation: "According to CSA B149.1, the minimum clearance between a gas-fired water heater and combustible materials on sides and back is 150 mm (6 inches). This clearance prevents overheating of combustible materials and allows for proper air circulation around the appliance.",
      difficulty_level: 2,
      estimated_time_minutes: 2,
      certification_level: "BOTH",
      competency: "appliances",
      csa_standard: "B149.1",
      csa_section: "4.1",
      tags: ["water_heater", "clearances", "combustible_materials"]
    }
  ],

  venting: [
    {
      id: "vent_001", 
      question_type: "calculation",
      question_text: "Calculate the minimum vent size required for a 150 MJ/h water heater with a 6-meter vertical vent run and two 90-degree elbows.",
      question_data: {
        given_values: {
          appliance_input: "150 MJ/h",
          vertical_height: "6 meters", 
          elbows: "2 × 90 degrees",
          appliance_type: "water heater"
        },
        formula_reference: "Use CSA B149.1 venting tables and equivalent length calculations",
        units: "mm diameter"
      },
      correct_answer: "100 mm (4 inch)",
      explanation: "Using CSA B149.1 venting tables: 1) Calculate equivalent length: 6m vertical + (2 × 1.5m for 90° elbows) = 9m equivalent length. 2) For 150 MJ/h appliance with 9m equivalent length, venting tables specify minimum 100 mm (4 inch) diameter vent. This ensures adequate draft and proper venting of combustion products.",
      difficulty_level: 4,
      estimated_time_minutes: 4,
      certification_level: "BOTH",
      competency: "venting",
      csa_standard: "B149.1", 
      csa_section: "5.2",
      tags: ["vent_sizing", "equivalent_length", "venting_tables"]
    }
  ],

  electricity: [
    {
      id: "electric_001",
      question_type: "calculation",
      question_text: "A gas valve coil operates at 24V AC and draws 0.5 amperes. Calculate the resistance of the coil using Ohm's Law.",
      question_data: {
        given_values: {
          voltage: "24V AC",
          current: "0.5 A"
        },
        formula_reference: "Ohm's Law: R = V / I", 
        units: "ohms (Ω)"
      },
      correct_answer: "48 Ω",
      explanation: "Using Ohm's Law: R = V / I = 24V / 0.5A = 48 ohms. This calculation helps technicians understand the electrical characteristics of gas valve coils and diagnose electrical problems in gas appliance control circuits.",
      difficulty_level: 2,
      estimated_time_minutes: 2,
      certification_level: "BOTH",
      competency: "electricity",
      csa_standard: "B149.1",
      csa_section: "6.1", 
      tags: ["ohms_law", "gas_valve", "electrical_calculations"]
    }
  ],

  piping: [
    {
      id: "piping_001",
      question_type: "multiple_choice",
      question_text: "What is the maximum allowable pressure for testing steel gas piping systems according to CSA B149.1?",
      question_data: {
        options: [
          "Equal to working pressure",
          "1.5 times working pressure", 
          "10 kPa or 1.5 times working pressure, whichever is greater",
          "20 kPa regardless of working pressure"
        ]
      },
      correct_answer: 2,
      explanation: "CSA B149.1 requires that steel gas piping systems be tested at 10 kPa or 1.5 times the working pressure, whichever is greater. This ensures the integrity of the piping system under conditions exceeding normal operating pressures while maintaining safety margins.",
      difficulty_level: 3,
      estimated_time_minutes: 2,
      certification_level: "BOTH", 
      competency: "piping",
      csa_standard: "B149.1",
      csa_section: "3.5",
      tags: ["pressure_testing", "steel_pipe", "test_procedures"]
    }
  ]
};

// Question pools organized by difficulty and certification level
export const questionPools = {
  G2: {
    beginner: {
      safety: sampleQuestions.safety.filter(q => q.difficulty_level <= 2),
      installation: sampleQuestions.installation.filter(q => q.difficulty_level <= 2 && (q.certification_level === 'G2' || q.certification_level === 'BOTH')),
      calculations: sampleQuestions.calculations.filter(q => q.difficulty_level <= 2),
      codes: sampleQuestions.codes.filter(q => q.difficulty_level <= 2),
      appliances: sampleQuestions.appliances.filter(q => q.difficulty_level <= 2),
      troubleshooting: sampleQuestions.troubleshooting.filter(q => q.difficulty_level <= 2 && (q.certification_level === 'G2' || q.certification_level === 'BOTH')),
      venting: sampleQuestions.venting.filter(q => q.difficulty_level <= 2),
      electricity: sampleQuestions.electricity.filter(q => q.difficulty_level <= 2),
      piping: sampleQuestions.piping.filter(q => q.difficulty_level <= 2)
    },
    intermediate: {
      safety: sampleQuestions.safety.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      installation: sampleQuestions.installation.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4 && (q.certification_level === 'G2' || q.certification_level === 'BOTH')),
      calculations: sampleQuestions.calculations.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      codes: sampleQuestions.codes.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      appliances: sampleQuestions.appliances.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      troubleshooting: sampleQuestions.troubleshooting.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4 && (q.certification_level === 'G2' || q.certification_level === 'BOTH')),
      venting: sampleQuestions.venting.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      electricity: sampleQuestions.electricity.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      piping: sampleQuestions.piping.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4)
    },
    advanced: {
      safety: sampleQuestions.safety.filter(q => q.difficulty_level >= 5),
      installation: sampleQuestions.installation.filter(q => q.difficulty_level >= 5 && (q.certification_level === 'G2' || q.certification_level === 'BOTH')),
      calculations: sampleQuestions.calculations.filter(q => q.difficulty_level >= 5),
      codes: sampleQuestions.codes.filter(q => q.difficulty_level >= 5),
      appliances: sampleQuestions.appliances.filter(q => q.difficulty_level >= 5), 
      troubleshooting: sampleQuestions.troubleshooting.filter(q => q.difficulty_level >= 5 && (q.certification_level === 'G2' || q.certification_level === 'BOTH')),
      venting: sampleQuestions.venting.filter(q => q.difficulty_level >= 5),
      electricity: sampleQuestions.electricity.filter(q => q.difficulty_level >= 5),
      piping: sampleQuestions.piping.filter(q => q.difficulty_level >= 5)
    }
  },
  G3: {
    beginner: {
      safety: sampleQuestions.safety.filter(q => q.difficulty_level <= 2),
      codes: sampleQuestions.codes.filter(q => q.difficulty_level <= 2),
      calculations: sampleQuestions.calculations.filter(q => q.difficulty_level <= 2),
      appliances: sampleQuestions.appliances.filter(q => q.difficulty_level <= 2),
      installation: sampleQuestions.installation.filter(q => q.difficulty_level <= 2 && (q.certification_level === 'G3' || q.certification_level === 'BOTH')),
      venting: sampleQuestions.venting.filter(q => q.difficulty_level <= 2),
      electricity: sampleQuestions.electricity.filter(q => q.difficulty_level <= 2), 
      troubleshooting: sampleQuestions.troubleshooting.filter(q => q.difficulty_level <= 2 && (q.certification_level === 'G3' || q.certification_level === 'BOTH')),
      piping: sampleQuestions.piping.filter(q => q.difficulty_level <= 2)
    },
    intermediate: {
      safety: sampleQuestions.safety.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      codes: sampleQuestions.codes.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      calculations: sampleQuestions.calculations.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      appliances: sampleQuestions.appliances.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      installation: sampleQuestions.installation.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4 && (q.certification_level === 'G3' || q.certification_level === 'BOTH')),
      venting: sampleQuestions.venting.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      electricity: sampleQuestions.electricity.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4),
      troubleshooting: sampleQuestions.troubleshooting.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4 && (q.certification_level === 'G3' || q.certification_level === 'BOTH')),
      piping: sampleQuestions.piping.filter(q => q.difficulty_level >= 3 && q.difficulty_level <= 4)
    },
    advanced: {
      safety: sampleQuestions.safety.filter(q => q.difficulty_level >= 5),
      codes: sampleQuestions.codes.filter(q => q.difficulty_level >= 5),
      calculations: sampleQuestions.calculations.filter(q => q.difficulty_level >= 5),
      appliances: sampleQuestions.appliances.filter(q => q.difficulty_level >= 5),
      installation: sampleQuestions.installation.filter(q => q.difficulty_level >= 5 && (q.certification_level === 'G3' || q.certification_level === 'BOTH')),
      venting: sampleQuestions.venting.filter(q => q.difficulty_level >= 5),
      electricity: sampleQuestions.electricity.filter(q => q.difficulty_level >= 5),
      troubleshooting: sampleQuestions.troubleshooting.filter(q => q.difficulty_level >= 5 && (q.certification_level === 'G3' || q.certification_level === 'BOTH')),
      piping: sampleQuestions.piping.filter(q => q.difficulty_level >= 5)
    }
  }
};

// Utility functions for question management
export function getQuestionsByCompetency(competency, certificationLevel = 'BOTH', difficultyRange = [1, 5]) {
  const questions = sampleQuestions[competency] || [];
  return questions.filter(q => 
    (q.certification_level === certificationLevel || q.certification_level === 'BOTH') &&
    q.difficulty_level >= difficultyRange[0] && 
    q.difficulty_level <= difficultyRange[1]
  );
}

export function getQuestionsByDifficulty(difficulty, certificationLevel = 'BOTH') {
  const allQuestions = Object.values(sampleQuestions).flat();
  return allQuestions.filter(q =>
    q.difficulty_level === difficulty && 
    (q.certification_level === certificationLevel || q.certification_level === 'BOTH')
  );
}

export function getQuestionsByCSASection(csaStandard, csaSection, certificationLevel = 'BOTH') {
  const allQuestions = Object.values(sampleQuestions).flat();
  return allQuestions.filter(q =>
    q.csa_standard === csaStandard &&
    q.csa_section === csaSection &&
    (q.certification_level === certificationLevel || q.certification_level === 'BOTH')
  );
}

export function searchQuestionsByTags(tags, certificationLevel = 'BOTH') {
  const allQuestions = Object.values(sampleQuestions).flat();
  return allQuestions.filter(q =>
    tags.some(tag => q.tags.includes(tag)) &&
    (q.certification_level === certificationLevel || q.certification_level === 'BOTH')
  );
}