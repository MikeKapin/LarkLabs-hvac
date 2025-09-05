import React, { useState, useEffect, useCallback } from 'react';
import { MultimeterState, MultimeterMode, MeasurementRange, MultimeterReading } from '../../types';
import { DisplayController } from './DisplayController';
import { ProbeController } from './ProbeController';

interface VirtualMultimeterProps {
  onMeasurement: (reading: MultimeterReading) => void;
  onProbePositionChange: (probes: { red: string; black: string }) => void;
  onSafetyViolation: (violation: string) => void;
  onModeChange?: (mode: MultimeterMode) => void;
  testPoints?: Array<{ id: string; x: number; y: number; label: string }>;
  currentMeasurement?: MultimeterReading;
  isEnabled?: boolean;
  className?: string;
}

export const VirtualMultimeter: React.FC<VirtualMultimeterProps> = ({
  onMeasurement,
  onProbePositionChange,
  onSafetyViolation,
  onModeChange,
  testPoints = [],
  currentMeasurement,
  isEnabled = true,
  className = ''
}) => {
  const [multimeterState, setMultimeterState] = useState<MultimeterState>({
    mode: 'DC_VOLTAGE',
    range: 'AUTO',
    autoRange: true,
    display: {
      value: 0,
      unit: 'V',
      isValid: false,
      isOverload: false,
      displayValue: 'NO PROBES CONNECTED'
    },
    probes: {
      red: { x: 0, y: 0, connectedTo: '', isConnected: false },
      black: { x: 0, y: 0, connectedTo: '', isConnected: false }
    },
    isOn: true,
    batteryLevel: 85,
    safetyWarnings: []
  });

  // Handle mode selection
  const handleModeChange = useCallback((newMode: MultimeterMode) => {
    if (!isEnabled) return;
    
    setMultimeterState(prev => ({
      ...prev,
      mode: newMode,
      display: {
        ...prev.display,
        unit: getModeUnit(newMode),
        isValid: false
      },
      safetyWarnings: getSafetyWarningsForMode(newMode)
    }));
    
    // Notify parent component of mode change
    if (onModeChange) {
      onModeChange(newMode);
    }
  }, [isEnabled, onModeChange]);

  // Handle range selection
  const handleRangeChange = useCallback((newRange: MeasurementRange) => {
    if (!isEnabled) return;
    
    setMultimeterState(prev => ({
      ...prev,
      range: newRange,
      autoRange: newRange === 'AUTO'
    }));
  }, [isEnabled]);

  // Handle power button
  const handlePowerToggle = useCallback(() => {
    if (!isEnabled) return;
    
    setMultimeterState(prev => ({
      ...prev,
      isOn: !prev.isOn,
      display: !prev.isOn ? prev.display : {
        value: 0,
        unit: getModeUnit(prev.mode),
        isValid: false,
        isOverload: false,
        displayValue: '----'
      }
    }));
  }, [isEnabled]);

  // Handle probe position updates
  const handleProbePositionUpdate = useCallback((
    probe: 'red' | 'black',
    position: { x: number; y: number; connectedTo?: string; isConnected: boolean }
  ) => {
    setMultimeterState(prev => {
      const newState = {
        ...prev,
        probes: {
          ...prev.probes,
          [probe]: position
        }
      };

      // Notify parent component of probe position changes
      onProbePositionChange({
        red: newState.probes.red.connectedTo || '',
        black: newState.probes.black.connectedTo || ''
      });

      return newState;
    });
  }, [onProbePositionChange]);

  // REMOVED: Update display when measurement changes
  // This was causing infinite loops - measurements now come from CircuitSimulator only
  // useEffect(() => {
  //   if (multimeterState.display.isValid) {
  //     onMeasurement(multimeterState.display);
  //   }
  // }, [multimeterState.display, onMeasurement]);

  // Check for safety violations
  useEffect(() => {
    multimeterState.safetyWarnings.forEach(warning => {
      onSafetyViolation(warning);
    });
  }, [multimeterState.safetyWarnings, onSafetyViolation]);

  // Update display when measurement comes from parent component
  useEffect(() => {
    console.log('VirtualMultimeter received currentMeasurement:', JSON.stringify(currentMeasurement));
    console.log('Multimeter isOn:', multimeterState.isOn);
    
    if (currentMeasurement) {
      console.log('Updating multimeter display with:', JSON.stringify(currentMeasurement));
      setMultimeterState(prev => ({
        ...prev,
        display: {
          ...currentMeasurement,
          isValid: currentMeasurement.isValid
        },
        isOn: true // Force the multimeter to stay on when receiving measurements
      }));
    }
  }, [currentMeasurement]);

  return (
    <div className={`virtual-multimeter ${className}`}>
      {/* Multimeter Body */}
      <div className="multimeter-body bg-yellow-400 rounded-lg shadow-2xl p-6 max-w-md mx-auto border-4 border-gray-800">
        {/* Brand and Model */}
        <div className="text-center mb-4">
          <h3 className="text-black font-bold text-lg">LARK Labs</h3>
          <p className="text-black text-sm">Professional DMM-3000</p>
        </div>

        {/* Display */}
        <DisplayController
          display={multimeterState.display}
          isOn={multimeterState.isOn}
          batteryLevel={multimeterState.batteryLevel}
          mode={multimeterState.mode}
          range={multimeterState.range}
        />

        {/* Mode Selector */}
        <div className="mode-selector mt-6">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {MULTIMETER_MODES.map((mode) => (
              <button
                key={mode.value}
                className={`mode-button p-2 rounded text-xs font-semibold transition-all ${
                  multimeterState.mode === mode.value
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                } ${!isEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => handleModeChange(mode.value)}
                disabled={!isEnabled}
                title={mode.description}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Range Selector */}
        <div className="range-selector mb-4">
          <label className="block text-black text-sm font-semibold mb-2">Range:</label>
          <select
            value={multimeterState.range}
            onChange={(e) => handleRangeChange(e.target.value as MeasurementRange)}
            disabled={!isEnabled || multimeterState.autoRange}
            className="w-full p-2 rounded bg-white border-2 border-gray-300 text-black disabled:bg-gray-100"
          >
            <option value="AUTO">AUTO</option>
            <option value="200m">200m</option>
            <option value="2">2</option>
            <option value="20">20</option>
            <option value="200">200</option>
            <option value="1000">1000</option>
          </select>
        </div>

        {/* Control Buttons */}
        <div className="control-buttons flex justify-between mb-4">
          <button
            onClick={handlePowerToggle}
            className={`power-button px-4 py-2 rounded-full font-bold text-white transition-all ${
              multimeterState.isOn 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            } ${!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isEnabled}
          >
            {multimeterState.isOn ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={() => {
              // Hold button functionality for display hold
              console.log('Hold button pressed');
            }}
            className="hold-button px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!isEnabled || !multimeterState.isOn}
          >
            HOLD
          </button>
        </div>

        {/* Safety Indicators */}
        {multimeterState.safetyWarnings.length > 0 && (
          <div className="safety-warnings bg-red-100 border-l-4 border-red-500 p-3 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-600 text-lg">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-semibold">Safety Warning</p>
                <ul className="text-xs text-red-600 mt-1">
                  {multimeterState.safetyWarnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Probe Connections */}
        <div className="probe-connections mt-4">
          <div className="flex justify-between items-center">
            <div className="probe-jack red">
              <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-black relative">
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">
                  V Ω
                </span>
              </div>
            </div>
            
            <div className="probe-jack black">
              <div className="w-6 h-6 bg-black rounded-full border-2 border-gray-600 relative">
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">
                  COM
                </span>
              </div>
            </div>
            
            <div className="probe-jack current">
              <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-black relative">
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">
                  10A
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note: Probe Controllers are now rendered in CircuitSimulator */}
    </div>
  );
};

// Helper functions and constants

const MULTIMETER_MODES: Array<{
  value: MultimeterMode;
  label: string;
  description: string;
}> = [
  { value: 'DC_VOLTAGE', label: 'V⎓', description: 'DC Voltage' },
  { value: 'AC_VOLTAGE', label: 'V~', description: 'AC Voltage' },
  { value: 'CURRENT', label: 'A', description: 'Current' },
  { value: 'RESISTANCE', label: 'Ω', description: 'Resistance' },
  { value: 'CONTINUITY', label: '🔊', description: 'Continuity' },
  { value: 'FREQUENCY', label: 'Hz', description: 'Frequency' },
  { value: 'CAPACITANCE', label: '⫸', description: 'Capacitance' },
  { value: 'DIODE_TEST', label: '⏵|', description: 'Diode Test' }
];

function getModeUnit(mode: MultimeterMode): string {
  switch (mode) {
    case 'DC_VOLTAGE':
    case 'AC_VOLTAGE':
      return 'V';
    case 'CURRENT':
      return 'A';
    case 'RESISTANCE':
      return 'Ω';
    case 'FREQUENCY':
      return 'Hz';
    case 'CAPACITANCE':
      return 'F';
    case 'CONTINUITY':
      return 'Ω';
    case 'DIODE_TEST':
      return 'V';
    default:
      return '';
  }
}

function getSafetyWarningsForMode(mode: MultimeterMode): string[] {
  const warnings: string[] = [];
  
  if (mode === 'CURRENT') {
    warnings.push('Current measurement requires series connection - ensure circuit is de-energized before connecting');
  }
  
  if (mode === 'RESISTANCE' || mode === 'CONTINUITY') {
    warnings.push('Resistance/continuity measurements require de-energized circuit');
  }
  
  return warnings;
}