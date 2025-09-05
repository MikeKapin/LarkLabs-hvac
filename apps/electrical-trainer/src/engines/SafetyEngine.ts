import { SafetyProtocol, MultimeterMode, CircuitDiagram } from '@/types';

export interface SafetyCheck {
  id: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL' | 'FATAL';
  message: string;
  recommendation: string;
  nfpaReference?: string;
  consequences?: string[];
}

export class SafetyEngine {
  private static readonly VOLTAGE_THRESHOLDS = {
    LOW: 50,      // Below 50V considered low voltage
    MEDIUM: 120,  // 50-120V medium voltage
    HIGH: 240,    // 120-240V high voltage  
    VERY_HIGH: 600 // Above 600V very high voltage
  };

  private static readonly CURRENT_THRESHOLDS = {
    SAFE: 0.001,      // 1mA - barely perceptible
    SHOCK: 0.005,     // 5mA - painful shock
    DANGEROUS: 0.010, // 10mA - muscular control lost
    LETHAL: 0.050     // 50mA+ - potentially lethal
  };

  /**
   * Perform comprehensive safety assessment
   */
  static performSafetyAssessment(
    circuit: CircuitDiagram,
    multimeterMode: MultimeterMode,
    probePositions: { red: string; black: string },
    nodeVoltages: Map<string, number>
  ): SafetyCheck[] {
    const checks: SafetyCheck[] = [];

    // Check electrical hazards
    checks.push(...this.checkElectricalHazards(nodeVoltages, probePositions));
    
    // Check measurement safety
    checks.push(...this.checkMeasurementSafety(multimeterMode, nodeVoltages, probePositions));
    
    // Check circuit-specific hazards
    checks.push(...this.checkCircuitHazards(circuit));
    
    // Check NFPA 70E compliance
    checks.push(...this.checkNFPA70ECompliance(circuit, nodeVoltages));

    return checks.sort((a, b) => this.getSeverityLevel(b.level) - this.getSeverityLevel(a.level));
  }

  /**
   * Get required Personal Protective Equipment (PPE)
   */
  static getRequiredPPE(
    maxVoltage: number,
    availableFaultCurrent?: number
  ): { category: number; equipment: string[]; arcRating?: string } {
    if (maxVoltage < this.VOLTAGE_THRESHOLDS.LOW) {
      return {
        category: 0,
        equipment: ['Safety glasses', 'Insulated tools']
      };
    } else if (maxVoltage < this.VOLTAGE_THRESHOLDS.HIGH) {
      return {
        category: 1,
        equipment: [
          'Arc-rated shirt and pants or coveralls',
          'Arc-rated face shield or flash suit hood',
          'Hard hat',
          'Safety glasses',
          'Hearing protection',
          'Insulated gloves',
          'Insulated tools'
        ],
        arcRating: '4 cal/cm²'
      };
    } else if (maxVoltage < this.VOLTAGE_THRESHOLDS.VERY_HIGH) {
      return {
        category: 2,
        equipment: [
          'Arc-rated shirt and pants or coveralls',
          'Arc-rated flash suit jacket and pants',
          'Arc-rated face shield and flash suit hood',
          'Hard hat',
          'Safety glasses',
          'Hearing protection',
          'Insulated gloves',
          'Insulated tools'
        ],
        arcRating: '8 cal/cm²'
      };
    } else {
      return {
        category: 3,
        equipment: [
          'Arc-rated flash suit',
          'Arc-rated flash suit hood',
          'Hard hat',
          'Safety glasses',
          'Hearing protection',
          'Insulated gloves rated for voltage',
          'Insulated tools'
        ],
        arcRating: '25 cal/cm²'
      };
    }
  }

  /**
   * Validate lockout/tagout procedures
   */
  static validateLockoutTagout(circuit: CircuitDiagram): SafetyCheck[] {
    const checks: SafetyCheck[] = [];
    
    const hasEnergySource = circuit.components.some(c => 
      c.type === 'VOLTAGE_SOURCE' && c.value > this.VOLTAGE_THRESHOLDS.LOW
    );

    if (hasEnergySource) {
      checks.push({
        id: 'LOTO_REQUIRED',
        level: 'WARNING',
        message: 'Lockout/Tagout required for this voltage level',
        recommendation: 'Implement proper LOTO procedures before working on energized equipment',
        nfpaReference: 'NFPA 70E 120.2',
        consequences: [
          'Electrical shock',
          'Arc flash burns',
          'Equipment damage',
          'Regulatory violations'
        ]
      });
    }

    return checks;
  }

  /**
   * Calculate arc flash incident energy
   */
  static calculateArcFlashEnergy(
    voltage: number,
    current: number,
    workingDistance: number = 18, // inches
    arcTime: number = 0.2 // seconds
  ): { energy: number; category: number; boundaryDistance: number } {
    // Simplified Lee equation for arc flash calculation
    // Actual calculations would be more complex and include more factors
    
    const logCurrent = Math.log10(current);
    const logTime = Math.log10(arcTime);
    const logDistance = Math.log10(workingDistance);
    
    // Simplified calculation - real implementation would use IEEE 1584 guide
    const energy = Math.pow(10, 
      1.081 + 0.0011 * voltage + 0.0001 * current - 0.4919 * logCurrent + 
      0.3966 * logTime + 2.1119 * logDistance
    );

    let category = 0;
    if (energy >= 1.2) category = 1;
    if (energy >= 4) category = 2;
    if (energy >= 8) category = 3;
    if (energy >= 25) category = 4;

    const boundaryDistance = workingDistance * Math.pow((energy / 1.2), 0.5);

    return { energy, category, boundaryDistance };
  }

  /**
   * Generate safety training recommendations
   */
  static generateTrainingRecommendations(
    userViolations: string[],
    skillLevel: string
  ): { topic: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; resources: string[] }[] {
    const recommendations = [];

    if (userViolations.includes('HIGH_VOLTAGE_EXPOSURE')) {
      recommendations.push({
        topic: 'High Voltage Safety',
        priority: 'HIGH' as const,
        resources: [
          'NFPA 70E: Standard for Electrical Safety in the Workplace',
          'IEEE 1584: Guide for Performing Arc Flash Hazard Calculations',
          'OSHA 1910.331-335: Electrical Safety Standards'
        ]
      });
    }

    if (userViolations.includes('IMPROPER_PPE')) {
      recommendations.push({
        topic: 'Personal Protective Equipment',
        priority: 'HIGH' as const,
        resources: [
          'ASTM F1506: Standard Performance Specification for Flame Resistant Textiles',
          'ASTM F2178: Standard Test Method for Arc Rating of Face Protective Products',
          'PPE Selection and Use Guidelines'
        ]
      });
    }

    return recommendations;
  }

  // Private helper methods

  private static checkElectricalHazards(
    nodeVoltages: Map<string, number>,
    probePositions: { red: string; black: string }
  ): SafetyCheck[] {
    const checks: SafetyCheck[] = [];
    
    const redVoltage = Math.abs(nodeVoltages.get(probePositions.red) || 0);
    const blackVoltage = Math.abs(nodeVoltages.get(probePositions.black) || 0);
    const maxVoltage = Math.max(redVoltage, blackVoltage);
    const voltageDifference = Math.abs(redVoltage - blackVoltage);

    if (maxVoltage > this.VOLTAGE_THRESHOLDS.VERY_HIGH) {
      checks.push({
        id: 'VERY_HIGH_VOLTAGE',
        level: 'FATAL',
        message: `Extremely high voltage detected: ${maxVoltage.toFixed(1)}V`,
        recommendation: 'STOP! Use qualified personnel only. Full arc flash PPE required.',
        nfpaReference: 'NFPA 70E 130.3',
        consequences: ['Death', 'Severe burns', 'Arc flash explosion']
      });
    } else if (maxVoltage > this.VOLTAGE_THRESHOLDS.HIGH) {
      checks.push({
        id: 'HIGH_VOLTAGE',
        level: 'CRITICAL',
        message: `High voltage detected: ${maxVoltage.toFixed(1)}V`,
        recommendation: 'Use appropriate PPE. Consider voltage-rated gloves and face shield.',
        nfpaReference: 'NFPA 70E 130.7(C)(9)'
      });
    } else if (maxVoltage > this.VOLTAGE_THRESHOLDS.MEDIUM) {
      checks.push({
        id: 'MEDIUM_VOLTAGE',
        level: 'WARNING',
        message: `Line voltage detected: ${maxVoltage.toFixed(1)}V`,
        recommendation: 'Exercise caution. Ensure proper probe insulation and hand placement.',
        nfpaReference: 'NFPA 70E 130.7(C)(10)'
      });
    }

    return checks;
  }

  private static checkMeasurementSafety(
    mode: MultimeterMode,
    nodeVoltages: Map<string, number>,
    probePositions: { red: string; black: string }
  ): SafetyCheck[] {
    const checks: SafetyCheck[] = [];
    
    const maxVoltage = Math.max(
      Math.abs(nodeVoltages.get(probePositions.red) || 0),
      Math.abs(nodeVoltages.get(probePositions.black) || 0)
    );

    if (mode === 'RESISTANCE' || mode === 'CONTINUITY') {
      if (maxVoltage > 5) {
        checks.push({
          id: 'ENERGIZED_RESISTANCE',
          level: 'CRITICAL',
          message: 'Attempting resistance measurement on energized circuit',
          recommendation: 'De-energize circuit before resistance measurements',
          consequences: ['Multimeter damage', 'Electrical shock', 'Inaccurate readings']
        });
      }
    }

    if (mode === 'CURRENT' && maxVoltage > this.VOLTAGE_THRESHOLDS.MEDIUM) {
      checks.push({
        id: 'HIGH_VOLTAGE_CURRENT',
        level: 'CRITICAL',
        message: 'High voltage current measurement requires special precautions',
        recommendation: 'Use current clamp or qualified personnel only',
        nfpaReference: 'NFPA 70E 130.7(C)(8)'
      });
    }

    return checks;
  }

  private static checkCircuitHazards(circuit: CircuitDiagram): SafetyCheck[] {
    const checks: SafetyCheck[] = [];

    // Check for motor circuits
    const hasMotor = circuit.components.some(c => c.type === 'MOTOR');
    if (hasMotor) {
      checks.push({
        id: 'MOTOR_CIRCUIT',
        level: 'WARNING',
        message: 'Motor circuit detected',
        recommendation: 'Be aware of starting currents and back EMF',
        consequences: ['High inrush current', 'Mechanical hazards']
      });
    }

    // Check for capacitors
    const hasCapacitor = circuit.components.some(c => c.type === 'CAPACITOR');
    if (hasCapacitor) {
      checks.push({
        id: 'CAPACITOR_CIRCUIT',
        level: 'WARNING',
        message: 'Capacitive circuit detected',
        recommendation: 'Capacitors may retain charge after power removal',
        consequences: ['Stored energy discharge', 'Component damage']
      });
    }

    return checks;
  }

  private static checkNFPA70ECompliance(
    circuit: CircuitDiagram,
    nodeVoltages: Map<string, number>
  ): SafetyCheck[] {
    const checks: SafetyCheck[] = [];
    
    const maxVoltage = Math.max(...Array.from(nodeVoltages.values()).map(Math.abs));
    
    if (maxVoltage >= 50) {
      checks.push({
        id: 'NFPA70E_BOUNDARY',
        level: 'INFO',
        message: 'Work falls under NFPA 70E requirements',
        recommendation: 'Establish approach boundaries and use appropriate PPE',
        nfpaReference: 'NFPA 70E Table 130.4(C)(a)'
      });
    }

    return checks;
  }

  private static getSeverityLevel(level: string): number {
    switch (level) {
      case 'FATAL': return 4;
      case 'CRITICAL': return 3;
      case 'WARNING': return 2;
      case 'INFO': return 1;
      default: return 0;
    }
  }
}