export type MultimeterMode = 
  | 'DC_VOLTAGE' 
  | 'AC_VOLTAGE' 
  | 'CURRENT' 
  | 'RESISTANCE' 
  | 'CONTINUITY' 
  | 'FREQUENCY'
  | 'CAPACITANCE'
  | 'DIODE_TEST';

export type MeasurementRange = 
  | 'AUTO'
  | '200m'
  | '2'
  | '20'
  | '200'
  | '1000';

export interface ProbePosition {
  x: number;
  y: number;
  connectedTo?: string;
  isConnected: boolean;
}

export interface MultimeterReading {
  value: number;
  unit: string;
  isValid: boolean;
  isOverload: boolean;
  displayValue: string;
}

export interface MultimeterState {
  mode: MultimeterMode;
  range: MeasurementRange;
  autoRange: boolean;
  display: MultimeterReading;
  probes: {
    red: ProbePosition;
    black: ProbePosition;
  };
  isOn: boolean;
  batteryLevel: number;
  safetyWarnings: string[];
}

export interface SafetyProtocol {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  violationType?: 'WARNING' | 'CRITICAL' | 'FATAL';
}

export interface MultimeterCalibration {
  accuracy: number;
  lastCalibrated: Date;
  certificateNumber?: string;
}

export interface MultimeterConfig {
  model: string;
  maxVoltage: number;
  maxCurrent: number;
  maxResistance: number;
  accuracy: MultimeterCalibration;
  safetyRating: string; // CAT III 600V, etc.
}