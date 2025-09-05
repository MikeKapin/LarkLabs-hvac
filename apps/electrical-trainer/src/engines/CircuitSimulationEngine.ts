import { CircuitDiagram, CircuitSimulationState, FaultCondition, MultimeterMode } from '@/types';
import { ElectricalCalculations } from './ElectricalCalculations';
import { SafetyEngine } from './SafetyEngine';

export class CircuitSimulationEngine {
  private circuit: CircuitDiagram;
  private state: CircuitSimulationState;
  private nodeVoltages: Map<string, number> = new Map();
  private branchCurrents: Map<string, number> = new Map();

  constructor(circuit: CircuitDiagram) {
    this.circuit = circuit;
    this.state = {
      currentValues: new Map(),
      voltageValues: new Map(),
      powerValues: new Map(),
      simulationTime: 0,
      isRunning: false,
      faultConditions: []
    };
    this.initializeSimulation();
  }

  /**
   * Initialize the circuit simulation
   */
  private initializeSimulation(): void {
    // Apply any existing fault conditions
    this.applyFaultConditions();
    
    // Solve the circuit
    this.solveCircuit();
    
    // Update simulation state
    this.updateSimulationState();
  }

  /**
   * Solve the circuit using electrical calculations
   */
  private solveCircuit(): void {
    try {
      this.nodeVoltages = ElectricalCalculations.solveCircuitNodeVoltages(this.circuit);
      this.branchCurrents = ElectricalCalculations.calculateBranchCurrents(
        this.circuit,
        this.nodeVoltages
      );
    } catch (error) {
      console.error('Circuit solution failed:', error);
      this.resetToSafeState();
    }
  }

  /**
   * Update the internal simulation state
   */
  private updateSimulationState(): void {
    // Update voltage values
    this.nodeVoltages.forEach((voltage, nodeId) => {
      this.state.voltageValues.set(nodeId, voltage);
    });

    // Update current values
    this.branchCurrents.forEach((current, componentId) => {
      this.state.currentValues.set(componentId, current);
    });

    // Calculate and update power values
    this.circuit.components.forEach(component => {
      const current = this.branchCurrents.get(component.id) || 0;
      const voltage1 = this.nodeVoltages.get(component.connections[0]) || 0;
      const voltage2 = this.nodeVoltages.get(component.connections[1]) || 0;
      const voltageDiff = Math.abs(voltage1 - voltage2);
      
      const power = ElectricalCalculations.calculatePower(voltageDiff, Math.abs(current));
      this.state.powerValues.set(component.id, power);
    });
  }

  /**
   * Apply fault conditions to circuit components
   */
  private applyFaultConditions(): void {
    this.state.faultConditions.forEach(fault => {
      const component = this.circuit.components.find(c => c.id === fault.componentId);
      if (!component) return;

      switch (fault.type) {
        case 'OPEN_CIRCUIT':
          component.isDefective = true;
          component.defectType = 'OPEN';
          // Simulate by setting very high resistance
          if (component.type === 'RESISTOR') {
            component.value = 1e12;
          }
          break;

        case 'SHORT_CIRCUIT':
          component.isDefective = true;
          component.defectType = 'SHORT';
          // Simulate by setting very low resistance
          if (component.type === 'RESISTOR') {
            component.value = 1e-6;
          }
          break;

        case 'GROUND_FAULT':
          // Add connection to ground
          component.connections.push('ground');
          break;

        case 'OVERVOLTAGE':
        case 'OVERCURRENT':
          // These would be handled by protective devices
          break;
      }
    });
  }

  /**
   * Simulate multimeter measurement
   */
  simulateMultimeterMeasurement(
    probePositions: { red: string; black: string },
    mode: MultimeterMode
  ): {
    reading: { value: number; unit: string; isValid: boolean; displayValue: string };
    safetyChecks: any[];
  } {
    // Perform safety assessment
    const safetyChecks = SafetyEngine.performSafetyAssessment(
      this.circuit,
      mode,
      probePositions,
      this.nodeVoltages
    );

    // Simulate the measurement
    const reading = ElectricalCalculations.simulateMultimeterReading(
      this.circuit,
      probePositions,
      mode,
      this.nodeVoltages,
      this.branchCurrents
    );

    // Add measurement noise for realism
    if (reading.isValid && isFinite(reading.value)) {
      const noise = this.addMeasurementNoise(reading.value, mode);
      reading.value = noise;
      reading.displayValue = this.formatForDisplay(noise, reading.unit);
    }

    return { reading, safetyChecks };
  }

  /**
   * Inject a fault into the circuit
   */
  injectFault(componentId: string, faultType: FaultCondition['type']): void {
    // Remove any existing faults on this component
    this.state.faultConditions = this.state.faultConditions.filter(
      f => f.componentId !== componentId
    );

    // Add the new fault
    const fault: FaultCondition = {
      id: `fault_${componentId}_${Date.now()}`,
      componentId,
      type: faultType,
      severity: this.determineFaultSeverity(faultType),
      description: this.getFaultDescription(faultType),
      safetyImplications: this.getFaultSafetyImplications(faultType)
    };

    this.state.faultConditions.push(fault);

    // Re-solve the circuit with the new fault
    this.initializeSimulation();
  }

  /**
   * Clear all faults and restore circuit to original state
   */
  clearAllFaults(): void {
    this.state.faultConditions = [];
    
    // Restore original component values
    this.circuit.components.forEach(component => {
      component.isDefective = false;
      delete component.defectType;
      // Reset to original values - in practice, you'd store originals
    });

    this.initializeSimulation();
  }

  /**
   * Get current simulation state
   */
  getSimulationState(): CircuitSimulationState {
    return { ...this.state };
  }

  /**
   * Get node voltages
   */
  getNodeVoltages(): Map<string, number> {
    return new Map(this.nodeVoltages);
  }

  /**
   * Get branch currents
   */
  getBranchCurrents(): Map<string, number> {
    return new Map(this.branchCurrents);
  }

  /**
   * Start continuous simulation
   */
  startSimulation(): void {
    this.state.isRunning = true;
    this.simulationLoop();
  }

  /**
   * Stop simulation
   */
  stopSimulation(): void {
    this.state.isRunning = false;
  }

  /**
   * Step simulation forward
   */
  stepSimulation(deltaTime: number = 0.001): void {
    this.state.simulationTime += deltaTime;
    // Update time-dependent components if any
    this.solveCircuit();
    this.updateSimulationState();
  }

  /**
   * Check if measurement is safe to perform
   */
  isSafeMeasurement(
    probePositions: { red: string; black: string },
    mode: MultimeterMode
  ): { isSafe: boolean; warnings: string[] } {
    const safetyChecks = SafetyEngine.performSafetyAssessment(
      this.circuit,
      mode,
      probePositions,
      this.nodeVoltages
    );

    const criticalIssues = safetyChecks.filter(check => 
      check.level === 'CRITICAL' || check.level === 'FATAL'
    );

    return {
      isSafe: criticalIssues.length === 0,
      warnings: safetyChecks.map(check => check.message)
    };
  }

  // Private helper methods

  private simulationLoop(): void {
    if (!this.state.isRunning) return;

    this.stepSimulation();
    
    // Schedule next iteration
    requestAnimationFrame(() => this.simulationLoop());
  }

  private resetToSafeState(): void {
    this.nodeVoltages.clear();
    this.branchCurrents.clear();
    this.state.voltageValues.clear();
    this.state.currentValues.clear();
    this.state.powerValues.clear();
  }

  private addMeasurementNoise(value: number, mode: MultimeterMode): number {
    // Simulate realistic multimeter noise and quantization
    const accuracy = this.getMultimeterAccuracy(mode);
    const noise = value * (Math.random() - 0.5) * accuracy * 0.01;
    
    // Quantize based on display resolution
    const resolution = this.getDisplayResolution(value, mode);
    return Math.round((value + noise) / resolution) * resolution;
  }

  private getMultimeterAccuracy(mode: MultimeterMode): number {
    // Typical accuracy specifications for a quality multimeter
    switch (mode) {
      case 'DC_VOLTAGE': return 0.025; // ±0.025%
      case 'AC_VOLTAGE': return 0.045; // ±0.045%
      case 'CURRENT': return 0.15;    // ±0.15%
      case 'RESISTANCE': return 0.08;  // ±0.08%
      default: return 0.1;             // ±0.1%
    }
  }

  private getDisplayResolution(value: number, mode: MultimeterMode): number {
    const absValue = Math.abs(value);
    
    if (absValue >= 1000) return 1;
    if (absValue >= 100) return 0.1;
    if (absValue >= 10) return 0.01;
    if (absValue >= 1) return 0.001;
    return 0.0001;
  }

  private formatForDisplay(value: number, unit: string): string {
    return ElectricalCalculations.simulateMultimeterReading(
      this.circuit,
      { red: '', black: '' }, // Dummy values for formatting
      'DC_VOLTAGE',
      new Map(),
      new Map()
    ).displayValue;
  }

  private determineFaultSeverity(faultType: FaultCondition['type']): FaultCondition['severity'] {
    switch (faultType) {
      case 'GROUND_FAULT':
      case 'OVERCURRENT':
        return 'CRITICAL';
      case 'OVERVOLTAGE':
        return 'HIGH';
      case 'SHORT_CIRCUIT':
        return 'MEDIUM';
      case 'OPEN_CIRCUIT':
        return 'LOW';
      default:
        return 'MEDIUM';
    }
  }

  private getFaultDescription(faultType: FaultCondition['type']): string {
    switch (faultType) {
      case 'OPEN_CIRCUIT':
        return 'Component has lost continuity - no current flow';
      case 'SHORT_CIRCUIT':
        return 'Component has developed a short circuit - excessive current flow';
      case 'GROUND_FAULT':
        return 'Unintended connection to ground detected';
      case 'OVERVOLTAGE':
        return 'Voltage exceeds component ratings';
      case 'OVERCURRENT':
        return 'Current exceeds safe operating limits';
      default:
        return 'Unknown fault condition';
    }
  }

  private getFaultSafetyImplications(faultType: FaultCondition['type']): string[] {
    switch (faultType) {
      case 'GROUND_FAULT':
        return [
          'Electrical shock hazard',
          'GFCI/RCD protection may trip',
          'Equipment damage risk'
        ];
      case 'SHORT_CIRCUIT':
        return [
          'Fire hazard from overheating',
          'Arc flash potential',
          'Protective device should trip'
        ];
      case 'OVERCURRENT':
        return [
          'Component overheating',
          'Insulation damage',
          'Fire risk'
        ];
      case 'OVERVOLTAGE':
        return [
          'Component failure',
          'Insulation breakdown',
          'Shock hazard'
        ];
      case 'OPEN_CIRCUIT':
        return [
          'Loss of function',
          'May cause other components to overvoltage'
        ];
      default:
        return ['Undefined safety implications'];
    }
  }
}