import { MultimeterMode } from './Multimeter';

export type ComponentType = 
  | 'RESISTOR' 
  | 'CAPACITOR' 
  | 'INDUCTOR' 
  | 'VOLTAGE_SOURCE' 
  | 'CURRENT_SOURCE'
  | 'SWITCH'
  | 'LED'
  | 'DIODE'
  | 'TRANSISTOR'
  | 'FUSE'
  | 'BREAKER'
  | 'RELAY'
  | 'MOTOR'
  | 'TRANSFORMER';

export interface ComponentSpec {
  id: string;
  type: ComponentType;
  value: number;
  unit: string;
  tolerance?: number;
  powerRating?: number;
  voltageRating?: number;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  connections: string[]; // IDs of connected nodes
  isDefective?: boolean;
  defectType?: 'OPEN' | 'SHORT' | 'HIGH_RESISTANCE' | 'LOW_RESISTANCE';
}

export interface CircuitNode {
  id: string;
  position: {
    x: number;
    y: number;
  };
  voltage?: number;
  connectedComponents: string[];
  testPoints: boolean; // Can probes be connected here
}

export interface CircuitDiagram {
  id: string;
  name: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  category: 'DC_BASICS' | 'AC_CIRCUITS' | 'MOTOR_CONTROL' | 'LIGHTING' | 'POWER_DISTRIBUTION';
  components: ComponentSpec[];
  nodes: CircuitNode[];
  connections: WireConnection[];
  supplyVoltage: number;
  supplyFrequency?: number;
  expectedMeasurements: ExpectedMeasurement[];
  safetyNotes: string[];
  learningObjectives: string[];
  estimatedTime: number; // minutes
}

export interface WireConnection {
  id: string;
  from: string; // node ID
  to: string; // node ID
  color?: string;
  gauge?: number;
  isDefective?: boolean;
}

export interface ExpectedMeasurement {
  testPoint: string;
  measurementType: MultimeterMode;
  expectedValue: number;
  tolerance: number;
  unit: string;
  notes?: string;
}

export interface CircuitSimulationState {
  currentValues: Map<string, number>; // component ID -> current
  voltageValues: Map<string, number>; // node ID -> voltage
  powerValues: Map<string, number>; // component ID -> power
  simulationTime: number;
  isRunning: boolean;
  faultConditions: FaultCondition[];
}

export interface FaultCondition {
  id: string;
  componentId: string;
  type: 'OPEN_CIRCUIT' | 'SHORT_CIRCUIT' | 'GROUND_FAULT' | 'OVERVOLTAGE' | 'OVERCURRENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  safetyImplications: string[];
}