import React from 'react';
import { CircuitDiagram as CircuitDiagramType, ComponentSpec, CircuitNode } from '../../types';

interface CircuitDiagramProps {
  circuit: CircuitDiagramType;
  scale?: number;
  showLabels?: boolean;
  interactive?: boolean;
  className?: string;
}

export const CircuitDiagram: React.FC<CircuitDiagramProps> = ({
  circuit,
  scale = 1,
  showLabels = true,
  interactive = false,
  className = ''
}) => {
  // Calculate diagram bounds
  const getBounds = () => {
    const positions = [
      ...circuit.components.map(c => c.position),
      ...circuit.nodes.map(n => n.position)
    ];
    
    const minX = Math.min(...positions.map(p => p.x)) - 50;
    const maxX = Math.max(...positions.map(p => p.x)) + 50;
    const minY = Math.min(...positions.map(p => p.y)) - 50;
    const maxY = Math.max(...positions.map(p => p.y)) + 50;
    
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  };

  const bounds = getBounds();

  // Render schematic symbol for each component type
  const renderSchematicSymbol = (component: ComponentSpec) => {
    const { x, y } = component.position;
    const rotation = component.rotation || 0;
    
    const symbolProps = {
      transform: `translate(${x}, ${y}) rotate(${rotation})`
    };

    switch (component.type) {
      case 'RESISTOR':
        return (
          <g key={component.id} {...symbolProps}>
            {/* Resistor zigzag pattern */}
            <path
              d="M-20,0 L-15,0 L-12,-8 L-8,8 L-4,-8 L0,8 L4,-8 L8,8 L12,-8 L15,0 L20,0"
              fill="none"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {showLabels && (
              <text x="0" y="20" textAnchor="middle" fontSize="10" fill="#000">
                R{component.id.split('_')[1] || ''}
              </text>
            )}
            {showLabels && (
              <text x="0" y="32" textAnchor="middle" fontSize="8" fill="#666">
                {formatValue(component.value, component.unit)}
              </text>
            )}
          </g>
        );

      case 'VOLTAGE_SOURCE':
        return (
          <g key={component.id} {...symbolProps}>
            {/* Battery symbol */}
            <circle cx="0" cy="0" r="18" fill="none" stroke="#000" strokeWidth="2" />
            {/* Positive terminal */}
            <line x1="-6" y1="-6" x2="6" y2="-6" stroke="#000" strokeWidth="3" />
            <line x1="0" y1="-10" x2="0" y2="-2" stroke="#000" strokeWidth="3" />
            {/* Negative terminal */}
            <line x1="-6" y1="6" x2="6" y2="6" stroke="#000" strokeWidth="3" />
            {showLabels && (
              <text x="0" y="35" textAnchor="middle" fontSize="10" fill="#000">
                V{component.id.split('_')[1] || ''}
              </text>
            )}
            {showLabels && (
              <text x="0" y="47" textAnchor="middle" fontSize="8" fill="#666">
                {component.value}V
              </text>
            )}
          </g>
        );

      case 'LED':
        return (
          <g key={component.id} {...symbolProps}>
            {/* LED diode symbol */}
            <polygon
              points="-8,8 8,0 -8,-8"
              fill="none"
              stroke="#000"
              strokeWidth="2"
            />
            <line x1="8" y1="-8" x2="8" y2="8" stroke="#000" strokeWidth="2" />
            {/* Light arrows */}
            <path d="M12,-6 L18,-12 M15,-9 L18,-12 L15,-15" fill="none" stroke="#000" strokeWidth="1" />
            <path d="M12,-2 L18,-8 M15,-5 L18,-8 L15,-11" fill="none" stroke="#000" strokeWidth="1" />
            {showLabels && (
              <text x="0" y="25" textAnchor="middle" fontSize="8" fill="#000">
                LED{component.id.split('_')[1] || ''}
              </text>
            )}
          </g>
        );

      case 'SWITCH':
        const isClosed = component.value === 1;
        return (
          <g key={component.id} {...symbolProps}>
            {/* Switch terminals */}
            <circle cx="-15" cy="0" r="2" fill="#000" />
            <circle cx="15" cy="0" r="2" fill="#000" />
            {/* Switch blade */}
            <line 
              x1="-15" y1="0" 
              x2={isClosed ? "15" : "10"} 
              y2={isClosed ? "0" : "-8"}
              stroke="#000" 
              strokeWidth="2"
              strokeLinecap="round"
            />
            {showLabels && (
              <text x="0" y="20" textAnchor="middle" fontSize="8" fill="#000">
                SW{component.id.split('_')[1] || ''}
              </text>
            )}
            {showLabels && (
              <text x="0" y="30" textAnchor="middle" fontSize="7" fill="#666">
                {isClosed ? "CLOSED" : "OPEN"}
              </text>
            )}
          </g>
        );

      case 'FUSE':
        return (
          <g key={component.id} {...symbolProps}>
            {/* Fuse symbol */}
            <rect x="-12" y="-4" width="24" height="8" fill="none" stroke="#000" strokeWidth="2" rx="4" />
            <line x1="-8" y1="0" x2="8" y2="0" stroke="#000" strokeWidth="1" />
            {showLabels && (
              <text x="0" y="20" textAnchor="middle" fontSize="8" fill="#000">
                F{component.id.split('_')[1] || ''}
              </text>
            )}
            {showLabels && (
              <text x="0" y="30" textAnchor="middle" fontSize="7" fill="#666">
                {component.value}A
              </text>
            )}
          </g>
        );

      case 'CAPACITOR':
        return (
          <g key={component.id} {...symbolProps}>
            {/* Capacitor symbol */}
            <line x1="-8" y1="-12" x2="-8" y2="12" stroke="#000" strokeWidth="3" />
            <line x1="8" y1="-12" x2="8" y2="12" stroke="#000" strokeWidth="3" />
            {showLabels && (
              <text x="0" y="25" textAnchor="middle" fontSize="8" fill="#000">
                C{component.id.split('_')[1] || ''}
              </text>
            )}
            {showLabels && (
              <text x="0" y="35" textAnchor="middle" fontSize="7" fill="#666">
                {formatValue(component.value, component.unit)}
              </text>
            )}
          </g>
        );

      case 'INDUCTOR':
        return (
          <g key={component.id} {...symbolProps}>
            {/* Inductor coil symbol */}
            <path
              d="M-15,0 Q-12,-8 -8,0 Q-4,-8 0,0 Q4,-8 8,0 Q12,-8 15,0"
              fill="none"
              stroke="#000"
              strokeWidth="2"
            />
            {showLabels && (
              <text x="0" y="20" textAnchor="middle" fontSize="8" fill="#000">
                L{component.id.split('_')[1] || ''}
              </text>
            )}
            {showLabels && (
              <text x="0" y="30" textAnchor="middle" fontSize="7" fill="#666">
                {formatValue(component.value, component.unit)}
              </text>
            )}
          </g>
        );

      default:
        return (
          <g key={component.id} {...symbolProps}>
            {/* Generic component box */}
            <rect x="-15" y="-8" width="30" height="16" fill="none" stroke="#000" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fontSize="8" fill="#000">
              {component.type}
            </text>
          </g>
        );
    }
  };

  // Render connection nodes
  const renderNode = (node: CircuitNode) => {
    const { x, y } = node.position;
    
    return (
      <g key={node.id}>
        <circle
          cx={x}
          cy={y}
          r="3"
          fill={node.testPoints ? "#FFD700" : "#000"}
          stroke="#000"
          strokeWidth="1"
        />
        {showLabels && node.testPoints && (
          <text x={x} y={y + 20} textAnchor="middle" fontSize="7" fill="#666">
            {node.id.replace('node_', '')}
          </text>
        )}
      </g>
    );
  };

  // Render connection wires
  const renderConnections = () => {
    return circuit.connections.map(connection => {
      const fromNode = circuit.nodes.find(n => n.id === connection.from);
      const toNode = circuit.nodes.find(n => n.id === connection.to);
      
      if (!fromNode || !toNode) return null;

      return (
        <line
          key={connection.id}
          x1={fromNode.position.x}
          y1={fromNode.position.y}
          x2={toNode.position.x}
          y2={toNode.position.y}
          stroke={connection.isDefective ? "#FF0000" : "#000"}
          strokeWidth="2"
          strokeDasharray={connection.isDefective ? "5,5" : "none"}
        />
      );
    });
  };

  return (
    <div className={`circuit-diagram ${className}`}>
      <svg
        width={bounds.width * scale}
        height={bounds.height * scale}
        viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
        className="border border-gray-300 bg-white"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Grid background */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            opacity="0.1"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#000"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Render connections first (behind components) */}
        {renderConnections()}

        {/* Render nodes */}
        {circuit.nodes.map(node => renderNode(node))}

        {/* Render components */}
        {circuit.components.map(component => renderSchematicSymbol(component))}

        {/* Circuit title */}
        {showLabels && (
          <text 
            x={bounds.minX + 20} 
            y={bounds.minY + 20} 
            fontSize="14" 
            fontWeight="bold" 
            fill="#000"
          >
            {circuit.name}
          </text>
        )}
      </svg>

      {/* Circuit information panel */}
      {interactive && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Circuit Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Components:</h4>
              <ul className="space-y-1">
                {circuit.components.map(component => (
                  <li key={component.id} className="text-gray-600">
                    • {component.type.replace('_', ' ')}: {formatValue(component.value, component.unit)}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Supply:</h4>
              <p className="text-gray-600">{circuit.supplyVoltage}V DC</p>
              
              <h4 className="font-medium text-gray-700 mb-1 mt-3">Test Points:</h4>
              <p className="text-gray-600">
                {circuit.nodes.filter(n => n.testPoints).length} available
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format component values
function formatValue(value: number, unit: string): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M${unit}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k${unit}`;
  } else if (value < 1 && value > 0) {
    if (value >= 0.001) {
      return `${(value * 1000).toFixed(1)}m${unit}`;
    } else if (value >= 0.000001) {
      return `${(value * 1000000).toFixed(1)}µ${unit}`;
    } else {
      return `${value.toExponential(2)}${unit}`;
    }
  } else {
    return `${value}${unit}`;
  }
}