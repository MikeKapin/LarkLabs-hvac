import React from 'react';
import { MultimeterReading, MultimeterMode, MeasurementRange } from '../../types';

interface DisplayControllerProps {
  display: MultimeterReading;
  isOn: boolean;
  batteryLevel: number;
  mode: MultimeterMode;
  range: MeasurementRange;
  className?: string;
}

export const DisplayController: React.FC<DisplayControllerProps> = ({
  display,
  isOn,
  batteryLevel,
  mode,
  range,
  className = ''
}) => {
  const getDisplayClasses = () => {
    const baseClasses = 'multimeter-display bg-black text-green-400 font-mono text-2xl p-4 rounded border-2 border-gray-600 min-h-[120px] flex flex-col justify-center items-center relative';
    
    if (!isOn) {
      return `${baseClasses} opacity-50`;
    }
    
    if (display.isOverload) {
      return `${baseClasses} text-red-400 animate-pulse`;
    }
    
    return baseClasses;
  };

  const formatDisplayValue = (value: MultimeterReading): string => {
    if (!isOn) return '';
    
    if (display.isOverload || !isFinite(value.value)) {
      return 'OL';
    }
    
    if (!display.isValid) {
      return '----';
    }
    
    return display.displayValue;
  };

  const getModeIndicator = (mode: MultimeterMode): string => {
    switch (mode) {
      case 'DC_VOLTAGE': return 'DC V';
      case 'AC_VOLTAGE': return 'AC V';
      case 'CURRENT': return 'A';
      case 'RESISTANCE': return 'Ω';
      case 'CONTINUITY': return 'CONT';
      case 'FREQUENCY': return 'Hz';
      case 'CAPACITANCE': return 'F';
      case 'DIODE_TEST': return 'DIODE';
      default: return '';
    }
  };

  const getBatteryIcon = (level: number): string => {
    if (level > 75) return '🔋';
    if (level > 50) return '🔋';
    if (level > 25) return '🪫';
    return '🪫';
  };

  const getSignalStrengthIndicator = (): React.ReactNode => {
    if (!isOn || !display.isValid) return null;
    
    // Show signal strength bars based on measurement stability
    const strength = display.isValid ? 4 : 1;
    
    return (
      <div className="signal-bars flex space-x-1 absolute top-2 right-2">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded ${
              bar <= strength ? 'bg-green-400' : 'bg-gray-600'
            }`}
            style={{ height: `${bar * 3 + 6}px` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`display-controller ${className}`}>
      {/* Main Display */}
      <div className={getDisplayClasses()}>
        {/* Status Indicators */}
        <div className="status-indicators absolute top-2 left-2 flex items-center space-x-2">
          {/* Battery Indicator */}
          <div className={`battery-indicator flex items-center space-x-1 ${
            batteryLevel < 25 ? 'text-red-400 animate-pulse' : ''
          }`}>
            <span className="text-xs">{getBatteryIcon(batteryLevel)}</span>
            <span className="text-xs">{batteryLevel}%</span>
          </div>
          
          {/* Auto Range Indicator */}
          {range === 'AUTO' && (
            <span className="text-xs bg-green-400 text-black px-1 rounded">AUTO</span>
          )}
        </div>

        {/* Signal Strength */}
        {getSignalStrengthIndicator()}

        {/* Main Reading */}
        <div className="main-reading text-center">
          <div className="value text-4xl font-bold leading-none">
            {formatDisplayValue(display)}
          </div>
          
          {/* Unit Display */}
          {isOn && display.isValid && (
            <div className="unit text-lg mt-1">
              {display.unit}
            </div>
          )}
        </div>

        {/* Secondary Display Information */}
        <div className="secondary-info absolute bottom-2 left-2 right-2 flex justify-between items-center text-xs">
          {/* Mode Indicator */}
          <div className="mode-indicator">
            <span className="bg-blue-400 text-black px-2 py-1 rounded">
              {getModeIndicator(mode)}
            </span>
          </div>
          
          {/* Range Indicator */}
          {range !== 'AUTO' && (
            <div className="range-indicator">
              <span className="text-yellow-400">
                RANGE: {range}
              </span>
            </div>
          )}
        </div>

        {/* Warning Indicators */}
        {display.isOverload && (
          <div className="overload-warning absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-80 rounded">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-300 animate-pulse">
                OVERLOAD
              </div>
              <div className="text-sm text-red-200">
                Reduce range or check connections
              </div>
            </div>
          </div>
        )}

        {/* Low Battery Warning */}
        {batteryLevel < 15 && (
          <div className="low-battery-warning absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-red-400 text-sm font-bold animate-pulse">
              LOW BATTERY
            </div>
          </div>
        )}
      </div>

      {/* Display Backlight Effect */}
      {isOn && (
        <div className="backlight-effect absolute inset-0 bg-green-400 opacity-5 rounded pointer-events-none" />
      )}

      {/* Function Indicators */}
      <div className="function-indicators mt-2 flex justify-between text-xs">
        <div className="left-functions space-x-2">
          {mode === 'CONTINUITY' && display.isValid && (
            <span className="bg-green-600 text-white px-2 py-1 rounded">
              BEEP
            </span>
          )}
          
          {mode === 'DIODE_TEST' && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded">
              DIODE
            </span>
          )}
        </div>
        
        <div className="right-functions space-x-2">
          {display.isValid && (
            <span className="bg-gray-600 text-white px-2 py-1 rounded">
              STABLE
            </span>
          )}
        </div>
      </div>

      {/* Measurement Accuracy Indicator */}
      {isOn && display.isValid && (
        <div className="accuracy-indicator mt-1 text-center text-xs text-gray-400">
          Accuracy: ±{getAccuracySpecification(mode)}
        </div>
      )}
    </div>
  );
};

// Helper function to get accuracy specifications
function getAccuracySpecification(mode: MultimeterMode): string {
  switch (mode) {
    case 'DC_VOLTAGE':
      return '0.025% + 2 digits';
    case 'AC_VOLTAGE':
      return '0.45% + 3 digits';
    case 'CURRENT':
      return '0.15% + 2 digits';
    case 'RESISTANCE':
      return '0.08% + 2 digits';
    case 'FREQUENCY':
      return '0.01% + 2 digits';
    case 'CAPACITANCE':
      return '1.0% + 3 digits';
    default:
      return '1.0%';
  }
}