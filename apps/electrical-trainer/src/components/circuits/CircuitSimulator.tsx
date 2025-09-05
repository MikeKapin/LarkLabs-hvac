import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CircuitDiagram, ComponentSpec, CircuitNode, MultimeterMode, ProbePosition } from '../../types';
import { CircuitSimulationEngine } from '../../engines';
import { ProbeController } from '../multimeter/ProbeController';

interface CircuitSimulatorProps {
  circuit: CircuitDiagram;
  onMeasurement: (result: any) => void;
  probePositions: { red: string; black: string };
  multimeterMode: MultimeterMode;
  onProbePositionChange?: (probes: { red: string; black: string }) => void;
  isEnabled?: boolean;
  className?: string;
}

export const CircuitSimulator: React.FC<CircuitSimulatorProps> = ({
  circuit,
  onMeasurement,
  probePositions,
  multimeterMode,
  onProbePositionChange,
  isEnabled = true,
  className = ''
}) => {
  const [simulationEngine] = useState(() => new CircuitSimulationEngine(circuit));
  const [simulationState, setSimulationState] = useState(simulationEngine.getSimulationState());
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showComponentInfo, setShowComponentInfo] = useState(false);
  const [probes, setProbes] = useState<{ red: ProbePosition; black: ProbePosition }>({
    red: { x: 100, y: 200, connectedTo: '', isConnected: false },
    black: { x: 150, y: 200, connectedTo: '', isConnected: false }
  });

  // Handle probe position updates
  const handleProbePositionUpdate = useCallback((
    probe: 'red' | 'black',
    position: ProbePosition
  ) => {
    const newProbes = { ...probes, [probe]: position };
    setProbes(newProbes);
    
    if (onProbePositionChange) {
      onProbePositionChange({
        red: newProbes.red.connectedTo || '',
        black: newProbes.black.connectedTo || ''
      });
    }
  }, [probes, onProbePositionChange]);

  // Update simulation when probe positions or mode changes
  useEffect(() => {
    const probeConnections = {
      red: probes.red.connectedTo || '',
      black: probes.black.connectedTo || ''
    };
    
    console.log('Probe positions:', probeConnections);
    console.log('Multimeter mode:', multimeterMode);
    
    if (probeConnections.red && probeConnections.black) {
      console.log('Attempting measurement...');
      const measurement = simulationEngine.simulateMultimeterMeasurement(
        probeConnections,
        multimeterMode
      );
      console.log('Measurement result:', measurement);
      onMeasurement(measurement);
    } else {
      console.log('Missing probe connections:', probeConnections);
    }
  }, [probes, multimeterMode, simulationEngine, onMeasurement]);

  // Get component visual properties
  const getComponentStyle = useCallback((component: ComponentSpec): React.CSSProperties => {
    const isSelected = selectedComponent === component.id;
    const isDefective = component.isDefective;
    
    return {
      position: 'absolute',
      left: component.position.x,
      top: component.position.y,
      transform: `translate(-50%, -50%) rotate(${component.rotation}deg)`,
      cursor: isEnabled ? 'pointer' : 'default',
      filter: isDefective ? 'hue-rotate(0deg) saturate(0.5) brightness(0.8)' : 'none',
      zIndex: isSelected ? 10 : 1,
      transition: 'all 0.2s ease'
    };
  }, [selectedComponent, isEnabled]);

  // Get component visual representation
  const renderComponent = useCallback((component: ComponentSpec) => {
    const commonProps = {
      className: `component component-${component.type.toLowerCase()} ${
        selectedComponent === component.id ? 'selected' : ''
      } ${component.isDefective ? 'defective' : ''}`,
      onClick: () => isEnabled && setSelectedComponent(component.id),
      onMouseEnter: () => isEnabled && setShowComponentInfo(true),
      onMouseLeave: () => setShowComponentInfo(false)
    };

    switch (component.type) {
      case 'RESISTOR':
        return (
          <div
            key={component.id}
            style={getComponentStyle(component)}
            {...commonProps}
          >
            <svg width="60" height="24" viewBox="0 0 60 24">
              <rect
                x="2" y="8" width="56" height="8"
                fill={component.isDefective ? "#8B5CF6" : "#D97706"}
                stroke="#92400E"
                strokeWidth="2"
                rx="2"
              />
              <line x1="0" y1="12" x2="8" y2="12" stroke="#374151" strokeWidth="2" />
              <line x1="52" y1="12" x2="60" y2="12" stroke="#374151" strokeWidth="2" />
              
              {/* Color bands for resistance value */}
              {renderResistorColorBands(component.value)}
              
              <text x="30" y="22" textAnchor="middle" fontSize="8" fill="#374151">
                {formatComponentValue(component.value, component.unit)}
              </text>
            </svg>
          </div>
        );

      case 'VOLTAGE_SOURCE':
        return (
          <div
            key={component.id}
            style={getComponentStyle(component)}
            {...commonProps}
          >
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle
                cx="24" cy="24" r="20"
                fill="#FEF3C7"
                stroke="#D97706"
                strokeWidth="3"
              />
              <text x="24" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400E">
                +
              </text>
              <text x="24" y="32" textAnchor="middle" fontSize="8" fill="#92400E">
                {component.value}V
              </text>
              
              {/* Terminal connections */}
              <circle cx="8" cy="24" r="3" fill="#EF4444" />
              <circle cx="40" cy="24" r="3" fill="#1F2937" />
            </svg>
          </div>
        );

      case 'LED':
        return (
          <div
            key={component.id}
            style={getComponentStyle(component)}
            {...commonProps}
          >
            <svg width="40" height="32" viewBox="0 0 40 32">
              <polygon
                points="12,8 28,16 12,24"
                fill={simulationState.isRunning ? "#EF4444" : "#FCA5A5"}
                stroke="#DC2626"
                strokeWidth="2"
              />
              <line x1="28" y1="8" x2="28" y2="24" stroke="#DC2626" strokeWidth="2" />
              <line x1="0" y1="16" x2="12" y2="16" stroke="#374151" strokeWidth="2" />
              <line x1="28" y1="16" x2="40" y2="16" stroke="#374151" strokeWidth="2" />
              
              {/* Light rays when active */}
              {simulationState.isRunning && (
                <>
                  <line x1="30" y1="10" x2="38" y2="2" stroke="#FEF08A" strokeWidth="1" opacity="0.8" />
                  <line x1="32" y1="8" x2="40" y2="0" stroke="#FEF08A" strokeWidth="1" opacity="0.8" />
                </>
              )}
              
              <text x="20" y="30" textAnchor="middle" fontSize="7" fill="#DC2626">
                LED
              </text>
            </svg>
          </div>
        );

      case 'SWITCH':
        const isClosed = component.value === 1;
        return (
          <div
            key={component.id}
            style={getComponentStyle(component)}
            {...commonProps}
          >
            <svg width="50" height="24" viewBox="0 0 50 24">
              <line x1="0" y1="12" x2="15" y2="12" stroke="#374151" strokeWidth="3" />
              <line x1="35" y1="12" x2="50" y2="12" stroke="#374151" strokeWidth="3" />
              <circle cx="15" cy="12" r="3" fill="#6B7280" />
              <circle cx="35" cy="12" r="3" fill="#6B7280" />
              
              <line 
                x1="15" y1="12" 
                x2={isClosed ? "35" : "30"} 
                y2={isClosed ? "12" : "8"}
                stroke="#374151" 
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              <text x="25" y="22" textAnchor="middle" fontSize="8" fill="#374151">
                {isClosed ? "CLOSED" : "OPEN"}
              </text>
            </svg>
          </div>
        );

      case 'FUSE':
        return (
          <div
            key={component.id}
            style={getComponentStyle(component)}
            {...commonProps}
          >
            <svg width="50" height="20" viewBox="0 0 50 20">
              <rect
                x="10" y="6" width="30" height="8"
                fill={component.isDefective ? "#EF4444" : "#E5E7EB"}
                stroke="#6B7280"
                strokeWidth="2"
                rx="4"
              />
              <line x1="0" y1="10" x2="10" y2="10" stroke="#374151" strokeWidth="2" />
              <line x1="40" y1="10" x2="50" y2="10" stroke="#374151" strokeWidth="2" />
              
              <text x="25" y="18" textAnchor="middle" fontSize="7" fill="#374151">
                {component.value}A
              </text>
            </svg>
          </div>
        );

      default:
        return (
          <div
            key={component.id}
            style={getComponentStyle(component)}
            {...commonProps}
          >
            <div className="w-12 h-8 bg-gray-300 border-2 border-gray-400 rounded flex items-center justify-center text-xs">
              {component.type}
            </div>
          </div>
        );
    }
  }, [selectedComponent, isEnabled, simulationState, getComponentStyle]);

  // Render circuit nodes (test points)
  const renderNode = useCallback((node: CircuitNode) => {
    const isProbeConnected = probePositions.red === node.id || probePositions.black === node.id;
    const probeColor = probePositions.red === node.id ? 'red' : 'black';
    
    if (!node.testPoints) return null;

    return (
      <div
        key={node.id}
        className={`circuit-node absolute w-4 h-4 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
          isProbeConnected 
            ? `bg-${probeColor}-500 border-${probeColor}-700 ring-4 ring-${probeColor}-200 scale-125` 
            : 'bg-yellow-400 border-yellow-600 hover:scale-110'
        }`}
        style={{
          left: node.position.x,
          top: node.position.y,
          zIndex: 20
        }}
        title={`Test Point: ${node.id}`}
      >
        {/* Node label */}
        <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold ${
          isProbeConnected ? `text-${probeColor}-600` : 'text-yellow-700'
        } whitespace-nowrap`}>
          {node.id.replace('node_', '')}
        </div>
      </div>
    );
  }, [probePositions]);

  // Render connecting wires
  const renderWires = useMemo(() => {
    return circuit.connections.map((connection) => {
      const fromNode = circuit.nodes.find(n => n.id === connection.from);
      const toNode = circuit.nodes.find(n => n.id === connection.to);
      
      if (!fromNode || !toNode) return null;

      const isDefective = connection.isDefective;
      
      return (
        <svg
          key={connection.id}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%', zIndex: 0 }}
        >
          <line
            x1={fromNode.position.x}
            y1={fromNode.position.y}
            x2={toNode.position.x}
            y2={toNode.position.y}
            stroke={isDefective ? '#EF4444' : (connection.color || '#374151')}
            strokeWidth={isDefective ? "4" : "3"}
            strokeDasharray={isDefective ? "8,4" : "none"}
            opacity={isDefective ? 0.7 : 1}
          />
          
          {/* Wire break indicator */}
          {isDefective && (
            <circle
              cx={(fromNode.position.x + toNode.position.x) / 2}
              cy={(fromNode.position.y + toNode.position.y) / 2}
              r="8"
              fill="#FEE2E2"
              stroke="#EF4444"
              strokeWidth="2"
            />
          )}
        </svg>
      );
    });
  }, [circuit]);

  // Get test points for probe controller
  const testPoints = useMemo(() => {
    return circuit.nodes
      .filter(node => node.testPoints)
      .map(node => ({
        id: node.id,
        x: node.position.x,
        y: node.position.y,
        label: node.id.replace('node_', '').replace('_', ' ')
      }));
  }, [circuit]);

  return (
    <div className={`circuit-simulator relative ${className}`}>
      {/* Circuit Board Background */}
      <div className="circuit-board bg-green-100 border-4 border-green-200 rounded-lg min-h-[400px] relative overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#10B981" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Render wires first (behind components) */}
        {renderWires}

        {/* Render components */}
        {circuit.components.map(component => renderComponent(component))}

        {/* Render nodes (test points) */}
        {circuit.nodes.map(node => renderNode(node))}

        {/* Render Multimeter Probes */}
        <ProbeController
          probeType="red"
          position={probes.red}
          onPositionChange={(position) => handleProbePositionUpdate('red', position)}
          isEnabled={isEnabled}
          testPoints={testPoints}
          className="absolute inset-0"
        />
        
        <ProbeController
          probeType="black"
          position={probes.black}
          onPositionChange={(position) => handleProbePositionUpdate('black', position)}
          isEnabled={isEnabled}
          testPoints={testPoints}
          className="absolute inset-0"
        />

        {/* Circuit Title */}
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">{circuit.name}</h3>
          <p className="text-xs text-gray-600">{circuit.category.replace('_', ' ')}</p>
        </div>

        {/* Simulation Controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => {
              if (simulationState.isRunning) {
                simulationEngine.stopSimulation();
              } else {
                simulationEngine.startSimulation();
              }
              setSimulationState(simulationEngine.getSimulationState());
            }}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              simulationState.isRunning
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {simulationState.isRunning ? 'Stop' : 'Start'} Simulation
          </button>
        </div>
      </div>

      {/* Component Information Panel */}
      {selectedComponent && (
        <div className="component-info mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          {renderComponentInfo(circuit.components.find(c => c.id === selectedComponent))}
        </div>
      )}

      {/* Circuit Information */}
      <div className="circuit-info mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expected Measurements */}
        <div className="expected-measurements bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Expected Measurements</h4>
          <div className="space-y-2">
            {circuit.expectedMeasurements.map((measurement, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium text-blue-800">{measurement.testPoint}</div>
                <div className="text-blue-600">
                  {measurement.measurementType}: {measurement.expectedValue} {measurement.unit}
                  {measurement.tolerance && ` ±${measurement.tolerance}`}
                </div>
                {measurement.notes && (
                  <div className="text-blue-500 text-xs italic">{measurement.notes}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Notes */}
        <div className="safety-notes bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Safety Notes</h4>
          <ul className="space-y-1">
            {circuit.safetyNotes.map((note, index) => (
              <li key={index} className="text-sm text-yellow-800">
                • {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Helper functions

function renderResistorColorBands(value: number) {
  // Simplified color band rendering for resistance values
  // This would be more complex in a full implementation
  const colors = ['#8B4513', '#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#800080', '#808080', '#FFFFFF'];
  
  return (
    <>
      <rect x="12" y="8" width="3" height="8" fill={colors[0]} />
      <rect x="18" y="8" width="3" height="8" fill={colors[1]} />
      <rect x="24" y="8" width="3" height="8" fill={colors[2]} />
    </>
  );
}

function formatComponentValue(value: number, unit: string): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M${unit}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k${unit}`;
  } else {
    return `${value}${unit}`;
  }
}

function renderComponentInfo(component?: ComponentSpec) {
  if (!component) return null;

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">
        {component.type.replace('_', ' ')} - {component.id}
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Value:</span>
          <span className="ml-2 text-gray-900">{component.value} {component.unit}</span>
        </div>
        {component.tolerance && (
          <div>
            <span className="font-medium text-gray-700">Tolerance:</span>
            <span className="ml-2 text-gray-900">±{component.tolerance}%</span>
          </div>
        )}
        {component.powerRating && (
          <div>
            <span className="font-medium text-gray-700">Power Rating:</span>
            <span className="ml-2 text-gray-900">{component.powerRating}W</span>
          </div>
        )}
        {component.isDefective && (
          <div className="col-span-2">
            <span className="font-medium text-red-700">Status:</span>
            <span className="ml-2 text-red-600">
              Defective ({component.defectType})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}