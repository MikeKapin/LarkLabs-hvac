import { ComponentSpec, CircuitNode, CircuitDiagram, MultimeterMode } from '../types';

export class ElectricalCalculations {
  private static readonly MIN_RESISTANCE = 1e-6; // Minimum resistance to prevent division by zero
  private static readonly MAX_ITERATIONS = 1000; // Maximum iterations for convergence
  private static readonly CONVERGENCE_TOLERANCE = 1e-9;

  /**
   * Calculate voltage using Ohm's Law: V = I * R
   */
  static calculateVoltage(current: number, resistance: number): number {
    return current * resistance;
  }

  /**
   * Calculate current using Ohm's Law: I = V / R
   */
  static calculateCurrent(voltage: number, resistance: number): number {
    if (resistance < this.MIN_RESISTANCE) {
      return Infinity; // Short circuit condition
    }
    return voltage / resistance;
  }

  /**
   * Calculate resistance using Ohm's Law: R = V / I
   */
  static calculateResistance(voltage: number, current: number): number {
    if (Math.abs(current) < 1e-12) {
      return Infinity; // Open circuit condition
    }
    return voltage / current;
  }

  /**
   * Calculate power: P = V * I = V² / R = I² * R
   */
  static calculatePower(voltage?: number, current?: number, resistance?: number): number {
    if (voltage !== undefined && current !== undefined) {
      return voltage * current;
    }
    if (voltage !== undefined && resistance !== undefined) {
      if (resistance < this.MIN_RESISTANCE) return Infinity;
      return (voltage * voltage) / resistance;
    }
    if (current !== undefined && resistance !== undefined) {
      return current * current * resistance;
    }
    throw new Error('Insufficient parameters for power calculation');
  }

  /**
   * Calculate equivalent resistance for series combination
   */
  static calculateSeriesResistance(resistances: number[]): number {
    return resistances.reduce((total, r) => total + r, 0);
  }

  /**
   * Calculate equivalent resistance for parallel combination
   */
  static calculateParallelResistance(resistances: number[]): number {
    const reciprocalSum = resistances.reduce((sum, r) => {
      if (r < this.MIN_RESISTANCE) return Infinity;
      return sum + (1 / r);
    }, 0);
    
    if (reciprocalSum === 0) return Infinity;
    return 1 / reciprocalSum;
  }

  /**
   * Solve circuit using nodal analysis
   */
  static solveCircuitNodeVoltages(circuit: CircuitDiagram): Map<string, number> {
    const nodeVoltages = new Map<string, number>();
    const nodes = circuit.nodes.filter(node => node.id !== 'ground');
    
    // Initialize all node voltages to 0 except voltage sources
    nodes.forEach(node => {
      nodeVoltages.set(node.id, 0);
    });

    // Set ground reference
    nodeVoltages.set('ground', 0);

    // Find voltage sources and set their voltages
    circuit.components.forEach(component => {
      if (component.type === 'VOLTAGE_SOURCE') {
        const connectedNodes = component.connections;
        if (connectedNodes.length >= 2) {
          nodeVoltages.set(connectedNodes[0], component.value);
          nodeVoltages.set(connectedNodes[1], 0); // Assume negative terminal is ground
        }
      }
    });

    // Iterative solution using Gauss-Seidel method
    for (let iteration = 0; iteration < this.MAX_ITERATIONS; iteration++) {
      let maxChange = 0;

      nodes.forEach(node => {
        if (this.isVoltageSource(node, circuit)) return; // Skip voltage source nodes

        const oldVoltage = nodeVoltages.get(node.id) || 0;
        const newVoltage = this.calculateNodeVoltage(node, circuit, nodeVoltages);
        
        nodeVoltages.set(node.id, newVoltage);
        maxChange = Math.max(maxChange, Math.abs(newVoltage - oldVoltage));
      });

      if (maxChange < this.CONVERGENCE_TOLERANCE) break;
    }

    return nodeVoltages;
  }

  /**
   * Calculate branch currents using node voltages
   */
  static calculateBranchCurrents(
    circuit: CircuitDiagram,
    nodeVoltages: Map<string, number>
  ): Map<string, number> {
    const branchCurrents = new Map<string, number>();

    circuit.components.forEach(component => {
      if (component.connections.length >= 2) {
        const voltage1 = nodeVoltages.get(component.connections[0]) || 0;
        const voltage2 = nodeVoltages.get(component.connections[1]) || 0;
        const voltageDiff = voltage1 - voltage2;

        let current = 0;
        
        switch (component.type) {
          case 'RESISTOR':
            current = this.calculateCurrent(voltageDiff, component.value);
            break;
          case 'VOLTAGE_SOURCE':
            current = this.calculateVoltageSourceCurrent(component, circuit, nodeVoltages);
            break;
          case 'CURRENT_SOURCE':
            current = component.value;
            break;
          default:
            // Handle other component types as needed
            current = 0;
        }

        branchCurrents.set(component.id, current);
      }
    });

    return branchCurrents;
  }

  /**
   * Simulate multimeter measurement at specific test points
   */
  static simulateMultimeterReading(
    circuit: CircuitDiagram,
    probePositions: { red: string; black: string },
    mode: MultimeterMode,
    nodeVoltages: Map<string, number>,
    branchCurrents: Map<string, number>
  ): { value: number; unit: string; isValid: boolean; displayValue: string } {
    const redVoltage = nodeVoltages.get(probePositions.red) || 0;
    const blackVoltage = nodeVoltages.get(probePositions.black) || 0;

    switch (mode) {
      case 'DC_VOLTAGE':
      case 'AC_VOLTAGE':
        const voltage = redVoltage - blackVoltage;
        return {
          value: voltage,
          unit: 'V',
          isValid: true,
          displayValue: this.formatDisplayValue(voltage, 'V')
        };

      case 'CURRENT':
        // For current measurement, multimeter must be in series with the circuit
        const current = this.getCurrentThroughPath(probePositions, branchCurrents);
        return {
          value: current || 0,
          unit: 'A',
          isValid: current !== null,
          displayValue: this.formatDisplayValue(current || 0, 'A')
        };

      case 'RESISTANCE':
        // For resistance, the circuit should be de-energized
        const resistance = this.measureResistanceBetweenNodes(
          probePositions.red,
          probePositions.black,
          circuit
        );
        return {
          value: resistance,
          unit: 'Ω',
          isValid: resistance !== Infinity,
          displayValue: this.formatDisplayValue(resistance, 'Ω')
        };

      case 'CONTINUITY':
        const continuityResistance = this.measureResistanceBetweenNodes(
          probePositions.red,
          probePositions.black,
          circuit
        );
        const isContinuous = continuityResistance < 50; // Typical continuity threshold
        return {
          value: isContinuous ? 0 : Infinity,
          unit: 'Ω',
          isValid: true,
          displayValue: isContinuous ? 'CONT' : 'OL'
        };

      default:
        return {
          value: 0,
          unit: '',
          isValid: false,
          displayValue: 'ERR'
        };
    }
  }

  /**
   * Check for safety violations in probe placement
   */
  static checkSafetyViolations(
    probePositions: { red: string; black: string },
    circuit: CircuitDiagram,
    nodeVoltages: Map<string, number>
  ): string[] {
    const violations: string[] = [];
    
    const redVoltage = Math.abs(nodeVoltages.get(probePositions.red) || 0);
    const blackVoltage = Math.abs(nodeVoltages.get(probePositions.black) || 0);
    const maxVoltage = Math.max(redVoltage, blackVoltage);

    // Check for high voltage warnings
    if (maxVoltage > 50) {
      violations.push('High voltage detected - ensure proper PPE and safety procedures');
    }

    if (maxVoltage > 120) {
      violations.push('DANGER: Line voltage detected - extreme caution required');
    }

    // Check for probe placement on energized circuits during resistance measurement
    const hasVoltageSource = circuit.components.some(c => c.type === 'VOLTAGE_SOURCE' && c.value > 0);
    if (hasVoltageSource && maxVoltage > 5) {
      violations.push('Circuit appears energized - de-energize before resistance measurements');
    }

    return violations;
  }

  // Private helper methods

  private static isVoltageSource(node: CircuitNode, circuit: CircuitDiagram): boolean {
    return circuit.components.some(component => 
      component.type === 'VOLTAGE_SOURCE' && 
      component.connections.includes(node.id)
    );
  }

  private static calculateNodeVoltage(
    node: CircuitNode,
    circuit: CircuitDiagram,
    nodeVoltages: Map<string, number>
  ): number {
    // Simplified nodal analysis - in practice, this would be more complex
    // This is a basic implementation for demonstration
    let sumCurrents = 0;
    let sumConductances = 0;

    // Find all components connected to this node
    const connectedComponents = circuit.components.filter(component =>
      component.connections.includes(node.id)
    );

    connectedComponents.forEach(component => {
      if (component.type === 'RESISTOR') {
        const otherNode = component.connections.find(nodeId => nodeId !== node.id);
        if (otherNode) {
          const otherVoltage = nodeVoltages.get(otherNode) || 0;
          const conductance = 1 / Math.max(component.value, this.MIN_RESISTANCE);
          
          sumCurrents += conductance * otherVoltage;
          sumConductances += conductance;
        }
      }
    });

    return sumConductances > 0 ? sumCurrents / sumConductances : 0;
  }

  private static calculateVoltageSourceCurrent(
    source: ComponentSpec,
    circuit: CircuitDiagram,
    nodeVoltages: Map<string, number>
  ): number {
    // Calculate current through voltage source based on connected circuit
    // This is a simplified implementation
    return 0; // Placeholder - actual implementation would be more complex
  }

  private static getCurrentThroughPath(
    probePositions: { red: string; black: string },
    branchCurrents: Map<string, number>
  ): number | null {
    // In practice, this would determine which branch the probes are measuring
    // For now, return null indicating measurement not possible
    return null;
  }

  private static measureResistanceBetweenNodes(
    node1: string,
    node2: string,
    circuit: CircuitDiagram
  ): number {
    // Simplified resistance measurement between two nodes
    // In practice, this would analyze the circuit path
    return 1000; // Placeholder value
  }

  private static formatDisplayValue(value: number, unit: string): string {
    if (!isFinite(value)) return 'OL'; // Overload
    
    const absValue = Math.abs(value);
    
    if (absValue >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M${unit}`;
    } else if (absValue >= 1e3) {
      return `${(value / 1e3).toFixed(2)}k${unit}`;
    } else if (absValue >= 1) {
      return `${value.toFixed(3)}${unit}`;
    } else if (absValue >= 1e-3) {
      return `${(value * 1e3).toFixed(1)}m${unit}`;
    } else if (absValue >= 1e-6) {
      return `${(value * 1e6).toFixed(1)}µ${unit}`;
    } else {
      return `${value.toExponential(2)}${unit}`;
    }
  }
}