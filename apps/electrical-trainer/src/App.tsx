import React, { useState, useCallback } from 'react';
import { CircuitDiagram, MultimeterReading, MultimeterMode } from './types';
import { VirtualMultimeter } from './components/multimeter';
import { CircuitLibrary, CircuitSimulator } from './components/circuits';

const App: React.FC = () => {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitDiagram | null>(null);
  const [probePositions, setProbePositions] = useState<{ red: string; black: string }>({
    red: '',
    black: ''
  });
  const [multimeterMode, setMultimeterMode] = useState<MultimeterMode>('DC_VOLTAGE');
  const [currentMeasurement, setCurrentMeasurement] = useState<MultimeterReading>({
    value: 0,
    unit: 'V',
    isValid: false,
    isOverload: false,
    displayValue: '----'
  });
  const [safetyWarnings, setSafetyWarnings] = useState<string[]>([]);

  const handleCircuitSelect = useCallback((circuit: CircuitDiagram) => {
    setSelectedCircuit(circuit);
    setProbePositions({ red: '', black: '' });
    setSafetyWarnings([]);
  }, []);

  const handleMeasurement = useCallback((reading: MultimeterReading) => {
    setCurrentMeasurement(reading);
  }, []);

  const handleSimulationResult = useCallback((result: any) => {
    // Handle both old complex measurement format and new simplified format
    if (result.reading) {
      // Old format from simulation engine
      setCurrentMeasurement(result.reading);
    } else if (result.value !== undefined) {
      // New simplified format from direct calculation
      setCurrentMeasurement({
        value: result.value,
        unit: result.unit,
        isValid: result.isValid,
        isOverload: false,
        displayValue: result.displayValue
      });
    }
    
    if (result.safetyChecks) {
      setSafetyWarnings(result.safetyChecks.map((check: any) => check.message));
    }
  }, []);

  const handleProbePositionChange = useCallback((positions: { red: string; black: string }) => {
    setProbePositions(positions);
  }, []);

  const handleSafetyViolation = useCallback((violation: string) => {
    setSafetyWarnings(prev => [...prev.filter(w => w !== violation), violation]);
  }, []);

  const handleModeChange = useCallback((mode: MultimeterMode) => {
    setMultimeterMode(mode);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/lark-labs-logo.png" 
                alt="LARK Labs" 
                className="h-10 w-auto"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                }}
              />
              <span 
                className="text-xl font-bold text-blue-600 hidden"
                style={{ display: 'none' }}
              >
                LARK Labs
              </span>
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-gray-900">
                  Electrical Diagnosis Trainer
                </h1>
                <p className="text-sm text-gray-600">
                  Professional Virtual Training Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="hidden md:inline">Free Tier - </span>
                <span className="font-medium text-green-600">5 Circuits Available</span>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedCircuit ? (
          /* Circuit Library View */
          <CircuitLibrary
            onCircuitSelect={handleCircuitSelect}
            selectedCircuit=""
          />
        ) : (
          /* Training Interface */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Circuit Simulation - Takes up 2 columns on xl screens */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Circuit Workspace
                  </h2>
                  <button
                    onClick={() => setSelectedCircuit(null)}
                    className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    ← Back to Library
                  </button>
                </div>
                
                <CircuitSimulator
                  circuit={selectedCircuit}
                  onMeasurement={handleSimulationResult}
                  probePositions={probePositions}
                  multimeterMode={multimeterMode}
                  onProbePositionChange={handleProbePositionChange}
                  className="mb-6"
                />
              </div>
            </div>

            {/* Virtual Multimeter - 1 column */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Virtual Multimeter
                </h2>
                
                <VirtualMultimeter
                  onMeasurement={handleMeasurement}
                  onProbePositionChange={handleProbePositionChange}
                  onSafetyViolation={handleSafetyViolation}
                  onModeChange={handleModeChange}
                  currentMeasurement={currentMeasurement}
                  testPoints={selectedCircuit ? selectedCircuit.nodes
                    .filter(node => node.testPoints)
                    .map(node => ({
                      id: node.id,
                      x: node.position.x,
                      y: node.position.y,
                      label: node.id.replace('node_', '').replace('_', ' ')
                    })) : []}
                />
              </div>

              {/* Safety Warnings Panel */}
              {safetyWarnings.length > 0 && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <span className="text-red-600 text-xl mr-2">⚠️</span>
                    <h3 className="text-lg font-semibold text-red-900">
                      Safety Warnings
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {safetyWarnings.map((warning, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Current Measurement Display */}
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Current Reading
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-green-600 mb-1">
                    {currentMeasurement.displayValue}
                  </div>
                  <div className="text-sm text-gray-600">
                    Mode: {multimeterMode.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Probes: {probePositions.red || 'None'} → {probePositions.black || 'None'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">LARK Labs</h4>
              <p className="text-gray-300 text-sm">
                Professional electrical training solutions for technicians, students, and educators.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Virtual Multimeter Training</li>
                <li>Interactive Circuit Simulations</li>
                <li>Safety Protocol Education</li>
                <li>Certification Preparation</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Documentation</li>
                <li>Community Forum</li>
                <li>Technical Support</li>
                <li>Feature Requests</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2025 LARK Labs. All rights reserved. Built for electrical education excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;