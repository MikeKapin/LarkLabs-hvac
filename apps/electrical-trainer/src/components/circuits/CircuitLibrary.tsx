import React from 'react';
import { CircuitDiagram } from '@/types';

// Define the 5 fundamental circuit scenarios for the free tier
export const FREE_TIER_CIRCUITS: CircuitDiagram[] = [
  {
    id: 'basic_dc_voltage',
    name: 'Basic DC Voltage Measurement',
    description: 'Learn to measure DC voltage across a battery using a multimeter. This fundamental skill is essential for all electrical work.',
    difficulty: 'BEGINNER',
    category: 'DC_BASICS',
    components: [
      {
        id: 'battery_1',
        type: 'VOLTAGE_SOURCE',
        value: 9,
        unit: 'V',
        position: { x: 100, y: 150 },
        rotation: 0,
        connections: ['node_positive', 'node_negative']
      },
      {
        id: 'resistor_1',
        type: 'RESISTOR',
        value: 1000,
        unit: 'Ω',
        tolerance: 5,
        powerRating: 0.25,
        position: { x: 250, y: 100 },
        rotation: 0,
        connections: ['node_positive', 'node_load']
      }
    ],
    nodes: [
      {
        id: 'node_positive',
        position: { x: 150, y: 100 },
        testPoints: true,
        connectedComponents: ['battery_1', 'resistor_1']
      },
      {
        id: 'node_negative',
        position: { x: 150, y: 200 },
        testPoints: true,
        connectedComponents: ['battery_1']
      },
      {
        id: 'node_load',
        position: { x: 300, y: 100 },
        testPoints: true,
        connectedComponents: ['resistor_1']
      }
    ],
    connections: [
      {
        id: 'wire_1',
        from: 'node_positive',
        to: 'resistor_1',
        color: 'red'
      },
      {
        id: 'wire_2',
        from: 'node_negative',
        to: 'battery_1',
        color: 'black'
      }
    ],
    supplyVoltage: 9,
    expectedMeasurements: [
      {
        testPoint: 'node_positive',
        measurementType: 'DC_VOLTAGE',
        expectedValue: 9,
        tolerance: 0.1,
        unit: 'V',
        notes: 'Measure voltage from positive terminal to negative terminal'
      },
      {
        testPoint: 'node_load',
        measurementType: 'DC_VOLTAGE',
        expectedValue: 9,
        tolerance: 0.1,
        unit: 'V',
        notes: 'Voltage should be same as battery voltage (no load current)'
      }
    ],
    safetyNotes: [
      'Always check multimeter settings before connecting probes',
      'Connect black probe to common/negative terminal first',
      'Low voltage circuit - safe for beginners'
    ],
    learningObjectives: [
      'Understand how to set multimeter to DC voltage mode',
      'Learn proper probe placement for voltage measurement',
      'Recognize voltage measurement readings on multimeter display'
    ],
    estimatedTime: 15
  },

  {
    id: 'series_resistance',
    name: 'Series Resistance Circuit',
    description: 'Measure individual resistor values and total circuit resistance in a series configuration.',
    difficulty: 'BEGINNER',
    category: 'DC_BASICS',
    components: [
      {
        id: 'resistor_1',
        type: 'RESISTOR',
        value: 470,
        unit: 'Ω',
        tolerance: 5,
        powerRating: 0.25,
        position: { x: 150, y: 100 },
        rotation: 0,
        connections: ['node_1', 'node_2']
      },
      {
        id: 'resistor_2',
        type: 'RESISTOR',
        value: 1000,
        unit: 'Ω',
        tolerance: 5,
        powerRating: 0.25,
        position: { x: 250, y: 100 },
        rotation: 0,
        connections: ['node_2', 'node_3']
      },
      {
        id: 'resistor_3',
        type: 'RESISTOR',
        value: 2200,
        unit: 'Ω',
        tolerance: 5,
        powerRating: 0.25,
        position: { x: 350, y: 100 },
        rotation: 0,
        connections: ['node_3', 'node_4']
      }
    ],
    nodes: [
      {
        id: 'node_1',
        position: { x: 100, y: 100 },
        testPoints: true,
        connectedComponents: ['resistor_1']
      },
      {
        id: 'node_2',
        position: { x: 200, y: 100 },
        testPoints: true,
        connectedComponents: ['resistor_1', 'resistor_2']
      },
      {
        id: 'node_3',
        position: { x: 300, y: 100 },
        testPoints: true,
        connectedComponents: ['resistor_2', 'resistor_3']
      },
      {
        id: 'node_4',
        position: { x: 400, y: 100 },
        testPoints: true,
        connectedComponents: ['resistor_3']
      }
    ],
    connections: [
      {
        id: 'wire_1',
        from: 'node_1',
        to: 'node_2',
        color: 'red'
      },
      {
        id: 'wire_2',
        from: 'node_2',
        to: 'node_3',
        color: 'red'
      },
      {
        id: 'wire_3',
        from: 'node_3',
        to: 'node_4',
        color: 'red'
      }
    ],
    supplyVoltage: 0,
    expectedMeasurements: [
      {
        testPoint: 'resistor_1',
        measurementType: 'RESISTANCE',
        expectedValue: 470,
        tolerance: 25,
        unit: 'Ω',
        notes: 'Individual resistor measurement - circuit must be de-energized'
      },
      {
        testPoint: 'resistor_2',
        measurementType: 'RESISTANCE',
        expectedValue: 1000,
        tolerance: 50,
        unit: 'Ω'
      },
      {
        testPoint: 'resistor_3',
        measurementType: 'RESISTANCE',
        expectedValue: 2200,
        tolerance: 110,
        unit: 'Ω'
      }
    ],
    safetyNotes: [
      'Circuit must be completely de-energized for resistance measurements',
      'Remove or disconnect power source before testing',
      'Check for stored energy in capacitors if present'
    ],
    learningObjectives: [
      'Understand series resistance calculation (R_total = R1 + R2 + R3)',
      'Practice resistance measurement technique',
      'Learn importance of de-energizing circuits for resistance testing'
    ],
    estimatedTime: 20
  },

  {
    id: 'parallel_resistance',
    name: 'Parallel Resistance Circuit',
    description: 'Explore parallel resistance relationships and measure equivalent resistance values.',
    difficulty: 'INTERMEDIATE',
    category: 'DC_BASICS',
    components: [
      {
        id: 'resistor_1',
        type: 'RESISTOR',
        value: 1000,
        unit: 'Ω',
        tolerance: 5,
        powerRating: 0.25,
        position: { x: 200, y: 80 },
        rotation: 0,
        connections: ['node_left', 'node_right']
      },
      {
        id: 'resistor_2',
        type: 'RESISTOR',
        value: 1000,
        unit: 'Ω',
        tolerance: 5,
        powerRating: 0.25,
        position: { x: 200, y: 120 },
        rotation: 0,
        connections: ['node_left', 'node_right']
      },
      {
        id: 'resistor_3',
        type: 'RESISTOR',
        value: 2000,
        unit: 'Ω',
        tolerance: 5,
        powerRating: 0.25,
        position: { x: 200, y: 160 },
        rotation: 0,
        connections: ['node_left', 'node_right']
      }
    ],
    nodes: [
      {
        id: 'node_left',
        position: { x: 150, y: 120 },
        testPoints: true,
        connectedComponents: ['resistor_1', 'resistor_2', 'resistor_3']
      },
      {
        id: 'node_right',
        position: { x: 250, y: 120 },
        testPoints: true,
        connectedComponents: ['resistor_1', 'resistor_2', 'resistor_3']
      }
    ],
    connections: [
      {
        id: 'wire_1',
        from: 'node_left',
        to: 'resistor_1',
        color: 'red'
      },
      {
        id: 'wire_2',
        from: 'node_left',
        to: 'resistor_2',
        color: 'red'
      },
      {
        id: 'wire_3',
        from: 'node_left',
        to: 'resistor_3',
        color: 'red'
      }
    ],
    supplyVoltage: 0,
    expectedMeasurements: [
      {
        testPoint: 'node_left to node_right',
        measurementType: 'RESISTANCE',
        expectedValue: 400,
        tolerance: 20,
        unit: 'Ω',
        notes: 'Equivalent parallel resistance: 1/((1/1000) + (1/1000) + (1/2000)) = 400Ω'
      }
    ],
    safetyNotes: [
      'Ensure circuit is completely de-energized',
      'Parallel circuits have multiple current paths',
      'Total resistance is always less than smallest individual resistance'
    ],
    learningObjectives: [
      'Understand parallel resistance calculation',
      'Learn that parallel resistance is less than individual resistances',
      'Practice measuring equivalent resistance across parallel branches'
    ],
    estimatedTime: 25
  },

  {
    id: 'simple_led_circuit',
    name: 'Simple LED Circuit',
    description: 'Measure voltage and current in a basic LED circuit with current limiting resistor.',
    difficulty: 'INTERMEDIATE',
    category: 'DC_BASICS',
    components: [
      {
        id: 'battery_1',
        type: 'VOLTAGE_SOURCE',
        value: 5,
        unit: 'V',
        position: { x: 100, y: 150 },
        rotation: 0,
        connections: ['node_positive', 'node_negative']
      },
      {
        id: 'resistor_1',
        type: 'RESISTOR',
        value: 330,
        unit: 'Ω',
        tolerance: 5,
        powerRating: 0.25,
        position: { x: 200, y: 100 },
        rotation: 0,
        connections: ['node_positive', 'node_led_anode']
      },
      {
        id: 'led_1',
        type: 'LED',
        value: 2.2,
        unit: 'V',
        position: { x: 300, y: 125 },
        rotation: 0,
        connections: ['node_led_anode', 'node_negative']
      }
    ],
    nodes: [
      {
        id: 'node_positive',
        position: { x: 150, y: 100 },
        testPoints: true,
        connectedComponents: ['battery_1', 'resistor_1']
      },
      {
        id: 'node_negative',
        position: { x: 150, y: 200 },
        testPoints: true,
        connectedComponents: ['battery_1', 'led_1']
      },
      {
        id: 'node_led_anode',
        position: { x: 250, y: 100 },
        testPoints: true,
        connectedComponents: ['resistor_1', 'led_1']
      }
    ],
    connections: [
      {
        id: 'wire_1',
        from: 'node_positive',
        to: 'node_led_anode',
        color: 'red'
      },
      {
        id: 'wire_2',
        from: 'node_led_anode',
        to: 'node_negative',
        color: 'red'
      }
    ],
    supplyVoltage: 5,
    expectedMeasurements: [
      {
        testPoint: 'node_positive',
        measurementType: 'DC_VOLTAGE',
        expectedValue: 5,
        tolerance: 0.1,
        unit: 'V',
        notes: 'Supply voltage measurement'
      },
      {
        testPoint: 'node_led_anode',
        measurementType: 'DC_VOLTAGE',
        expectedValue: 2.2,
        tolerance: 0.2,
        unit: 'V',
        notes: 'LED forward voltage drop'
      },
      {
        testPoint: 'resistor_1',
        measurementType: 'DC_VOLTAGE',
        expectedValue: 2.8,
        tolerance: 0.2,
        unit: 'V',
        notes: 'Voltage drop across current limiting resistor'
      }
    ],
    safetyNotes: [
      'LED is polarity sensitive - connect correctly',
      'Current limiting resistor prevents LED damage',
      'Low voltage circuit - safe for hands-on practice'
    ],
    learningObjectives: [
      'Understand voltage division in series circuit',
      'Learn about LED forward voltage characteristics',
      'Practice voltage measurements across different components'
    ],
    estimatedTime: 30
  },

  {
    id: 'continuity_testing',
    name: 'Continuity Testing Basics',
    description: 'Learn to use continuity function to test switches, fuses, and wire connections.',
    difficulty: 'BEGINNER',
    category: 'DC_BASICS',
    components: [
      {
        id: 'switch_1',
        type: 'SWITCH',
        value: 1,
        unit: '',
        position: { x: 150, y: 100 },
        rotation: 0,
        connections: ['node_1', 'node_2']
      },
      {
        id: 'fuse_1',
        type: 'FUSE',
        value: 5,
        unit: 'A',
        position: { x: 250, y: 100 },
        rotation: 0,
        connections: ['node_2', 'node_3']
      },
      {
        id: 'wire_break',
        type: 'RESISTOR',
        value: 0,
        unit: 'Ω',
        position: { x: 350, y: 100 },
        rotation: 0,
        connections: ['node_3', 'node_4'],
        isDefective: true,
        defectType: 'OPEN'
      }
    ],
    nodes: [
      {
        id: 'node_1',
        position: { x: 100, y: 100 },
        testPoints: true,
        connectedComponents: ['switch_1']
      },
      {
        id: 'node_2',
        position: { x: 200, y: 100 },
        testPoints: true,
        connectedComponents: ['switch_1', 'fuse_1']
      },
      {
        id: 'node_3',
        position: { x: 300, y: 100 },
        testPoints: true,
        connectedComponents: ['fuse_1', 'wire_break']
      },
      {
        id: 'node_4',
        position: { x: 400, y: 100 },
        testPoints: true,
        connectedComponents: ['wire_break']
      }
    ],
    connections: [
      {
        id: 'wire_1',
        from: 'node_1',
        to: 'node_2',
        color: 'black'
      },
      {
        id: 'wire_2',
        from: 'node_2',
        to: 'node_3',
        color: 'black'
      },
      {
        id: 'wire_3',
        from: 'node_3',
        to: 'node_4',
        color: 'black',
        isDefective: true
      }
    ],
    supplyVoltage: 0,
    expectedMeasurements: [
      {
        testPoint: 'switch_1',
        measurementType: 'CONTINUITY',
        expectedValue: 0,
        tolerance: 1,
        unit: 'Ω',
        notes: 'Switch closed - should show continuity'
      },
      {
        testPoint: 'fuse_1',
        measurementType: 'CONTINUITY',
        expectedValue: 0,
        tolerance: 1,
        unit: 'Ω',
        notes: 'Good fuse - should show continuity'
      },
      {
        testPoint: 'wire_break',
        measurementType: 'CONTINUITY',
        expectedValue: Infinity,
        tolerance: 0,
        unit: 'Ω',
        notes: 'Open circuit - no continuity (defective component)'
      }
    ],
    safetyNotes: [
      'Always de-energize circuit before continuity testing',
      'Continuity test uses low voltage from multimeter',
      'Audible beep indicates good continuity (low resistance)'
    ],
    learningObjectives: [
      'Understand continuity testing concept',
      'Learn to identify open circuits and good connections',
      'Practice using audible continuity function'
    ],
    estimatedTime: 20
  }
];

interface CircuitLibraryProps {
  onCircuitSelect: (circuit: CircuitDiagram) => void;
  selectedCircuit?: string;
  className?: string;
}

export const CircuitLibrary: React.FC<CircuitLibraryProps> = ({
  onCircuitSelect,
  selectedCircuit,
  className = ''
}) => {
  const getDifficultyColor = (difficulty: CircuitDiagram['difficulty']) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADVANCED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EXPERT':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: CircuitDiagram['category']) => {
    switch (category) {
      case 'DC_BASICS':
        return '⚡';
      case 'AC_CIRCUITS':
        return '〰️';
      case 'MOTOR_CONTROL':
        return '⚙️';
      case 'LIGHTING':
        return '💡';
      case 'POWER_DISTRIBUTION':
        return '🔌';
      default:
        return '📋';
    }
  };

  return (
    <div className={`circuit-library ${className}`}>
      <div className="library-header mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Circuit Training Library
        </h2>
        <p className="text-gray-600">
          Select a circuit to begin your electrical training. Free tier includes {FREE_TIER_CIRCUITS.length} fundamental scenarios.
        </p>
      </div>

      <div className="circuits-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FREE_TIER_CIRCUITS.map((circuit) => (
          <div
            key={circuit.id}
            className={`circuit-card bg-white rounded-lg shadow-md border-2 transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-blue-300 ${
              selectedCircuit === circuit.id 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200'
            }`}
            onClick={() => onCircuitSelect(circuit)}
          >
            {/* Circuit Header */}
            <div className="card-header p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="category-icon text-2xl">
                  {getCategoryIcon(circuit.category)}
                </span>
                <span className={`difficulty-badge px-2 py-1 text-xs font-semibold rounded-full border ${getDifficultyColor(circuit.difficulty)}`}>
                  {circuit.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {circuit.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {circuit.description}
              </p>
            </div>

            {/* Circuit Details */}
            <div className="card-body p-4">
              <div className="circuit-stats grid grid-cols-2 gap-4 mb-4">
                <div className="stat">
                  <div className="stat-label text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Components
                  </div>
                  <div className="stat-value text-lg font-semibold text-gray-900">
                    {circuit.components.length}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-label text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Est. Time
                  </div>
                  <div className="stat-value text-lg font-semibold text-gray-900">
                    {circuit.estimatedTime}m
                  </div>
                </div>
              </div>

              {/* Learning Objectives Preview */}
              <div className="learning-objectives">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  You'll Learn:
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {circuit.learningObjectives.slice(0, 2).map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="line-clamp-1">{objective}</span>
                    </li>
                  ))}
                  {circuit.learningObjectives.length > 2 && (
                    <li className="text-xs text-gray-500 ml-4">
                      +{circuit.learningObjectives.length - 2} more...
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Circuit Footer */}
            <div className="card-footer p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="measurements-count text-xs text-gray-500">
                  {circuit.expectedMeasurements.length} measurement{circuit.expectedMeasurements.length !== 1 ? 's' : ''}
                </div>
                <button className="start-button px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
                  Start Training
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Free Tier Notice */}
      <div className="free-tier-notice mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-blue-600 text-xl">ℹ️</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">
              Free Tier Training
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              You're currently using the free tier with {FREE_TIER_CIRCUITS.length} fundamental circuits. 
              Upgrade to Premium for access to 50+ advanced scenarios, 3D virtual panels, and certification prep.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};