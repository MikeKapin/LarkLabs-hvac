// Enhanced A2L Refrigerant Tools - Professional Grade
// CSA B52 compliance, advanced safety calculations, and professional features

class A2LComplianceEngine {
    constructor() {
        this.savedCalculations = this.loadSavedCalculations();
        this.currentCalculation = null;
        this.setupA2LDatabase();
    }

    // Load saved calculations from localStorage
    loadSavedCalculations() {
        try {
            return JSON.parse(localStorage.getItem('a2lCalculations') || '[]');
        } catch (e) {
            return [];
        }
    }

    // Enhanced A2L refrigerant database with CSA B52 compliance data
    setupA2LDatabase() {
        this.a2lDatabase = {
            'R-32': {
                name: 'R-32 (HFC-32)',
                type: 'HFC',
                safety: 'A2L',
                gwp: 675,
                odp: 0,
                molecular: 52.02,
                density: 2.07, // lb/ft³ liquid
                lfl: 307000, // ppm (30.7% by volume)
                burningVelocity: 6.7, // cm/s
                criticalTemp: 78.11, // °C
                csaB52: {
                    chargeLimit: {
                        residential: 2.0, // kg for room <20m²
                        commercial: 13.0, // kg general limit
                        industrial: 50.0 // kg with safety systems
                    },
                    detectionRequired: true,
                    detectionThreshold: 15000, // ppm (50% LFL)
                    ventilationRequired: true,
                    mechanicalVentilation: false, // natural acceptable
                    equipmentStandards: ['CSA C22.2 No. 117', 'UL 60335-2-40'],
                    installerCertification: 'A2L refrigerant handling certification required'
                },
                applications: ['Residential AC', 'Heat Pumps', 'VRF Systems'],
                prohibitedSpaces: ['Bedrooms', 'Living areas without detection'],
                pressureData: this.generatePressureData(-51.7, 78.11, 'R32')
            },

            'R-454B': {
                name: 'R-454B (HFO-1234yf/HFC-32)',
                type: 'HFO Blend',
                safety: 'A2L',
                gwp: 466,
                odp: 0,
                molecular: 72.3,
                density: 1.89,
                lfl: 340000, // ppm
                burningVelocity: 1.5, // cm/s
                criticalTemp: 77.26,
                csaB52: {
                    chargeLimit: {
                        residential: 3.0, // kg (higher than R-32)
                        commercial: 20.0,
                        industrial: 75.0
                    },
                    detectionRequired: true,
                    detectionThreshold: 17000, // ppm
                    ventilationRequired: true,
                    mechanicalVentilation: false,
                    equipmentStandards: ['CSA C22.2 No. 117', 'UL 60335-2-40'],
                    installerCertification: 'A2L refrigerant handling certification required'
                },
                applications: ['R-410A Retrofit', 'New Residential Systems', 'Commercial AC'],
                prohibitedSpaces: ['Institutional kitchens', 'Mechanical rooms without ventilation'],
                pressureData: this.generatePressureData(-46.1, 77.26, 'R454B')
            },

            'R-454C': {
                name: 'R-454C (HFO-1234yf/HFO-1234ze/HFC-32)',
                type: 'HFO Blend',
                safety: 'A2L',
                gwp: 148,
                odp: 0,
                molecular: 70.1,
                density: 1.76,
                lfl: 380000, // ppm
                burningVelocity: 1.2, // cm/s
                criticalTemp: 75.8,
                csaB52: {
                    chargeLimit: {
                        residential: 4.0, // kg (highest for A2L)
                        commercial: 25.0,
                        industrial: 100.0
                    },
                    detectionRequired: true,
                    detectionThreshold: 19000, // ppm
                    ventilationRequired: true,
                    mechanicalVentilation: false,
                    equipmentStandards: ['CSA C22.2 No. 117', 'UL 60335-2-40'],
                    installerCertification: 'A2L refrigerant handling certification required'
                },
                applications: ['Ultra-Low GWP Systems', 'Commercial Refrigeration', 'Chillers'],
                prohibitedSpaces: ['Underground parking', 'Confined spaces'],
                pressureData: this.generatePressureData(-45.2, 75.8, 'R454C')
            },

            'R-32/R-1234yf': {
                name: 'R-468A (R-32/R-1234yf)',
                type: 'HFO Blend',
                safety: 'A2L',
                gwp: 229,
                odp: 0,
                molecular: 61.8,
                density: 1.82,
                lfl: 360000, // ppm
                burningVelocity: 2.1, // cm/s
                criticalTemp: 76.5,
                csaB52: {
                    chargeLimit: {
                        residential: 3.5,
                        commercial: 22.0,
                        industrial: 85.0
                    },
                    detectionRequired: true,
                    detectionThreshold: 18000, // ppm
                    ventilationRequired: true,
                    mechanicalVentilation: false,
                    equipmentStandards: ['CSA C22.2 No. 117', 'UL 60335-2-40'],
                    installerCertification: 'A2L refrigerant handling certification required'
                },
                applications: ['Next-Gen Residential', 'Light Commercial'],
                prohibitedSpaces: ['Basements without ventilation', 'Tight spaces'],
                pressureData: this.generatePressureData(-47.3, 76.5, 'R468A')
            }
        };
    }

    // CSA B52 Compliance Assessment
    assessCSACompliance(inputs) {
        const {
            refrigerant, chargeAmount, roomVolume, roomArea, occupancy,
            ventilationType, detectionSystem, installerCert, equipmentType
        } = inputs;

        const refData = this.a2lDatabase[refrigerant];
        if (!refData) return { compliant: false, errors: ['Unknown refrigerant'] };

        const compliance = {
            compliant: true,
            errors: [],
            warnings: [],
            requirements: [],
            safetyMeasures: []
        };

        // Charge limit assessment
        const chargeKg = chargeAmount * 0.453592;
        const occupancyType = occupancy === 'residential' ? 'residential' : 
                             occupancy === 'commercial' ? 'commercial' : 'industrial';
        
        const maxCharge = refData.csaB52.chargeLimit[occupancyType];
        
        if (chargeKg > maxCharge) {
            compliance.compliant = false;
            compliance.errors.push(`Charge ${chargeKg.toFixed(1)}kg exceeds ${occupancyType} limit of ${maxCharge}kg`);
        } else if (chargeKg > maxCharge * 0.8) {
            compliance.warnings.push(`Charge approaching ${occupancyType} limit - consider safety enhancements`);
        }

        // Room density calculation
        const roomVolumeM3 = roomVolume * 0.0283168;
        const chargeDensity = chargeKg / roomVolumeM3;
        const lflDensity = this.calculateLFLDensity(refrigerant);
        
        if (chargeDensity > lflDensity * 0.25) {
            compliance.compliant = false;
            compliance.errors.push(`Charge density ${chargeDensity.toFixed(3)}kg/m³ exceeds 25% of LFL`);
        }

        // Detection system requirements
        if (chargeKg > 1.8 && !detectionSystem) {
            compliance.compliant = false;
            compliance.errors.push('Leak detection system required for charges >1.8kg');
        }

        // Ventilation requirements
        if (!ventilationType || ventilationType === 'none') {
            compliance.compliant = false;
            compliance.errors.push('Ventilation system required for A2L refrigerants');
        }

        // Installer certification
        if (!installerCert) {
            compliance.warnings.push('A2L certified installer strongly recommended');
        }

        // Generate requirements based on assessment
        this.generateComplianceRequirements(compliance, refData, chargeKg, occupancyType);

        return compliance;
    }

    generateComplianceRequirements(compliance, refData, chargeKg, occupancyType) {
        compliance.requirements = [
            `Leak detection: ${chargeKg > 1.8 ? 'Required' : 'Recommended'} (threshold: ${refData.csaB52.detectionThreshold} ppm)`,
            `Ventilation: ${refData.csaB52.ventilationRequired ? 'Required' : 'Not required'}`,
            `Equipment standards: ${refData.csaB52.equipmentStandards.join(', ')}`,
            `Installer certification: ${refData.csaB52.installerCertification}`
        ];

        compliance.safetyMeasures = [
            'Install refrigerant leak detector with audible/visual alarm',
            'Ensure adequate room ventilation (natural or mechanical)',
            'Label system with A2L refrigerant warnings',
            'Provide installation documentation to building owner',
            'Conduct commissioning leak test',
            'Train facility personnel on A2L safety procedures'
        ];

        if (chargeKg > 10) {
            compliance.safetyMeasures.push('Install emergency ventilation system');
            compliance.safetyMeasures.push('Implement refrigerant monitoring system');
        }
    }

    // Calculate LFL density in kg/m³
    calculateLFLDensity(refrigerant) {
        const refData = this.a2lDatabase[refrigerant];
        const lflPPM = refData.lfl;
        const molecularWeight = refData.molecular;
        
        // Convert ppm to kg/m³ at standard conditions
        const lflDensity = (lflPPM / 1000000) * (molecularWeight / 22.4) * (273.15 / 293.15);
        return lflDensity;
    }

    // Enhanced ventilation calculator
    calculateVentilationRequirements(inputs) {
        const { refrigerant, chargeAmount, roomVolume, roomHeight, occupants, equipmentType } = inputs;
        
        const refData = this.a2lDatabase[refrigerant];
        const chargeKg = chargeAmount * 0.453592;
        const roomVolumeM3 = roomVolume * 0.0283168;
        const roomAreaM2 = roomVolumeM3 / (roomHeight * 0.3048);

        // Base ventilation calculation per CSA B52
        const baseVentilation = Math.max(
            0.35 * roomAreaM2, // 0.35 L/s per m² floor area
            7.5 * occupants,   // 7.5 L/s per occupant
            15                 // Minimum 15 L/s
        );

        // A2L enhancement factor
        const a2lFactor = chargeKg > 5 ? 1.5 : chargeKg > 2 ? 1.25 : 1.0;
        const requiredVentilation = baseVentilation * a2lFactor;

        // Convert to CFM for North American practice
        const ventilationCFM = requiredVentilation * 2.119;

        // Emergency ventilation requirements
        const emergencyVentilation = chargeKg > 10 ? ventilationCFM * 2 : null;

        return {
            base: {
                lps: Math.round(baseVentilation),
                cfm: Math.round(baseVentilation * 2.119)
            },
            required: {
                lps: Math.round(requiredVentilation),
                cfm: Math.round(ventilationCFM)
            },
            emergency: emergencyVentilation ? {
                lps: Math.round(emergencyVentilation / 2.119),
                cfm: Math.round(emergencyVentilation)
            } : null,
            notes: this.getVentilationNotes(chargeKg, equipmentType)
        };
    }

    getVentilationNotes(chargeKg, equipmentType) {
        const notes = [];
        
        if (chargeKg < 2) {
            notes.push('Natural ventilation may be sufficient');
        } else if (chargeKg < 5) {
            notes.push('Mechanical ventilation recommended');
        } else {
            notes.push('Mechanical ventilation required');
        }

        if (equipmentType === 'rooftop') {
            notes.push('Outdoor equipment - minimal ventilation concerns');
        } else if (equipmentType === 'basement') {
            notes.push('Basement installation - enhanced ventilation critical');
        }

        return notes;
    }

    // Enhanced leak rate calculator with time-based analysis
    calculateAdvancedLeakRate(inputs) {
        const { 
            refrigerant, chargeAmount, roomVolume, ventilationRate, 
            leakRate, exposureTime, occupants, temperatureC 
        } = inputs;

        const refData = this.a2lDatabase[refrigerant];
        const chargeKg = chargeAmount * 0.453592;
        const roomVolumeM3 = roomVolume * 0.0283168;
        const ventilationM3h = ventilationRate * 1.699; // CFM to m³/h

        // Calculate refrigerant concentration over time
        const concentrations = [];
        const maxTime = Math.min(exposureTime || 60, 120); // Max 2 hours
        
        for (let t = 0; t <= maxTime; t += 5) {
            const concentration = this.calculateConcentrationAtTime(
                leakRate, roomVolumeM3, ventilationM3h, t
            );
            concentrations.push({
                time: t,
                concentration: concentration,
                percentLFL: (concentration / refData.lfl) * 100
            });
        }

        // Safety assessment
        const maxConcentration = Math.max(...concentrations.map(c => c.concentration));
        const maxPercentLFL = (maxConcentration / refData.lfl) * 100;
        
        const safetyAssessment = this.assessLeakSafety(maxPercentLFL, ventilationM3h > 0);

        return {
            refrigerant: refData.name,
            chargeKg: chargeKg,
            maxConcentration: Math.round(maxConcentration),
            maxPercentLFL: maxPercentLFL.toFixed(2),
            safetyLevel: safetyAssessment.level,
            recommendations: safetyAssessment.recommendations,
            concentrationProfile: concentrations,
            evacuationTime: this.calculateEvacuationTime(maxConcentration, refData.lfl),
            complianceStatus: maxPercentLFL < 25 ? 'Compliant' : 'Non-Compliant'
        };
    }

    calculateConcentrationAtTime(leakRate, roomVolume, ventilationRate, timeMinutes) {
        // Mass balance equation with ventilation
        const timeHours = timeMinutes / 60;
        const decayConstant = ventilationRate / roomVolume; // h⁻¹
        
        if (decayConstant > 0) {
            // With ventilation
            return (leakRate / ventilationRate) * (1 - Math.exp(-decayConstant * timeHours)) * 1000000; // ppm
        } else {
            // No ventilation (worst case)
            return (leakRate * timeHours / roomVolume) * 1000000; // ppm
        }
    }

    assessLeakSafety(percentLFL, hasVentilation) {
        let level, recommendations;
        
        if (percentLFL < 5) {
            level = 'Safe';
            recommendations = ['Continue normal operation', 'Regular leak checks recommended'];
        } else if (percentLFL < 15) {
            level = 'Caution';
            recommendations = [
                'Increase ventilation',
                'Locate and repair leak source',
                'Monitor concentrations'
            ];
        } else if (percentLFL < 25) {
            level = 'Warning';
            recommendations = [
                'Immediate leak repair required',
                'Increase ventilation to maximum',
                'Consider partial evacuation',
                'Continuous monitoring required'
            ];
        } else {
            level = 'Danger';
            recommendations = [
                'IMMEDIATE EVACUATION',
                'Shut down system',
                'Emergency ventilation',
                'Professional leak repair only',
                'Re-test before occupancy'
            ];
        }

        if (!hasVentilation && percentLFL > 5) {
            recommendations.unshift('Install mechanical ventilation immediately');
        }

        return { level, recommendations };
    }

    calculateEvacuationTime(concentration, lfl) {
        // Time to reach 50% LFL (emergency action level)
        const emergencyLevel = lfl * 0.5;
        if (concentration >= emergencyLevel) {
            return 'Immediate evacuation required';
        }
        return null;
    }

    // Installation requirements calculator
    calculateInstallationRequirements(inputs) {
        const {
            refrigerant, chargeAmount, spaceType, roomArea, roomVolume,
            buildingType, equipmentLocation, systemType
        } = inputs;

        const refData = this.a2lDatabase[refrigerant];
        const chargeKg = chargeAmount * 0.453592;
        const roomAreaM2 = roomArea * 0.092903;
        const roomVolumeM3 = roomVolume * 0.0283168;

        const requirements = {
            permits: [],
            inspections: [],
            equipment: [],
            documentation: [],
            training: [],
            safety: [],
            maintenance: []
        };

        // Permit requirements
        if (chargeKg > 2.5) {
            requirements.permits.push('TSSA registration required');
        }
        if (buildingType === 'commercial' || buildingType === 'institutional') {
            requirements.permits.push('Building permit for A2L system installation');
        }

        // Inspection requirements
        requirements.inspections.push('Initial installation inspection');
        requirements.inspections.push('Leak testing at commissioning');
        if (chargeKg > 5) {
            requirements.inspections.push('Annual leak testing required');
        }

        // Equipment requirements
        requirements.equipment.push('A2L compatible leak detector');
        requirements.equipment.push('Pressure relief devices rated for A2L');
        if (chargeKg > 3) {
            requirements.equipment.push('Automatic leak detection system');
            requirements.equipment.push('Emergency ventilation controls');
        }

        // Documentation requirements
        requirements.documentation = [
            'A2L refrigerant safety data sheet',
            'Installation compliance certificate',
            'Leak detection system documentation',
            'Emergency response procedures',
            'Maintenance schedule and records'
        ];

        // Training requirements
        requirements.training = [
            'A2L refrigerant handling certification',
            'Leak detection equipment operation',
            'Emergency response procedures'
        ];

        if (chargeKg > 10) {
            requirements.training.push('Facility staff A2L safety training');
        }

        // Safety systems
        requirements.safety = [
            'Leak detection with alarm system',
            'Adequate room ventilation',
            'A2L warning labels and signage',
            'Emergency contact information posted'
        ];

        // Maintenance requirements
        requirements.maintenance = [
            'Monthly leak detector function test',
            'Annual refrigerant leak inspection',
            'Ventilation system performance verification'
        ];

        if (chargeKg > 5) {
            requirements.maintenance.push('Quarterly comprehensive leak testing');
        }

        return {
            refrigerant: refData.name,
            chargeKg: chargeKg,
            complianceLevel: this.getComplianceLevel(chargeKg, spaceType),
            requirements: requirements,
            estimatedCost: this.estimateComplianceCost(chargeKg, spaceType),
            timeline: this.getInstallationTimeline(chargeKg, systemType)
        };
    }

    getComplianceLevel(chargeKg, spaceType) {
        if (chargeKg < 1.8) return 'Basic';
        if (chargeKg < 5) return 'Standard';
        if (chargeKg < 15) return 'Enhanced';
        return 'Advanced';
    }

    estimateComplianceCost(chargeKg, spaceType) {
        let baseCost = 500; // Base A2L compliance cost
        
        if (chargeKg > 1.8) baseCost += 800; // Leak detection system
        if (chargeKg > 5) baseCost += 1200; // Enhanced ventilation
        if (chargeKg > 10) baseCost += 2000; // Advanced monitoring
        
        if (spaceType === 'commercial') baseCost *= 1.5;
        if (spaceType === 'industrial') baseCost *= 2.0;

        return {
            equipment: Math.round(baseCost * 0.7),
            installation: Math.round(baseCost * 0.2),
            certification: Math.round(baseCost * 0.1),
            total: baseCost
        };
    }

    getInstallationTimeline(chargeKg, systemType) {
        let weeks = 2; // Base timeline
        
        if (chargeKg > 5) weeks += 1; // Enhanced safety systems
        if (chargeKg > 15) weeks += 2; // Advanced monitoring
        if (systemType === 'vrf' || systemType === 'chiller') weeks += 1;

        return {
            planning: '1-2 weeks',
            procurement: `${Math.ceil(weeks * 0.4)}-${Math.ceil(weeks * 0.5)} weeks`,
            installation: `${Math.ceil(weeks * 0.3)}-${Math.ceil(weeks * 0.4)} weeks`,
            commissioning: '1 week',
            total: `${weeks}-${weeks + 1} weeks`
        };
    }

    // Enhanced pressure-temperature calculations
    generatePressureData(boilingPoint, criticalTemp, refrigerant) {
        const data = [];
        const tempRange = criticalTemp - boilingPoint;
        const steps = 60;
        
        for (let i = 0; i <= steps; i++) {
            const tempC = boilingPoint + (tempRange * i / steps);
            const pressure = this.calculateSaturationPressure(tempC, refrigerant);
            
            data.push({
                temperatureC: Math.round(tempC * 10) / 10,
                temperatureF: Math.round((tempC * 9/5 + 32) * 10) / 10,
                pressureKPa: Math.round(pressure * 10) / 10,
                pressurePSIG: Math.round((pressure / 6.895 - 14.7) * 10) / 10
            });
        }
        
        return data;
    }

    calculateSaturationPressure(tempC, refrigerant) {
        // Enhanced Antoine equation with refrigerant-specific coefficients
        const coefficients = {
            'R32': { A: 8.0065, B: 1291.6, C: 232.86 },
            'R454B': { A: 8.2156, B: 1356.2, C: 228.45 },
            'R454C': { A: 8.1892, B: 1342.8, C: 226.12 },
            'R468A': { A: 8.1523, B: 1348.9, C: 227.34 }
        };

        const coeff = coefficients[refrigerant] || coefficients['R32'];
        const logP = coeff.A - coeff.B / (coeff.C + tempC);
        return Math.pow(10, logP); // kPa
    }

    // Professional system diagnostic with A2L considerations
    performA2LSystemDiagnostic(inputs) {
        const {
            refrigerant, outdoorTemp, indoorTemp, suctionPressure, dischargePressure,
            suctionTemp, liquidTemp, systemType, operatingMode
        } = inputs;

        const refData = this.a2lDatabase[refrigerant];
        const diagnostic = {
            refrigerant: refData.name,
            safety: refData.safety,
            systemHealth: 'Unknown',
            issues: [],
            recommendations: [],
            a2lConsiderations: []
        };

        // Calculate expected operating conditions
        const expectedConditions = this.calculateExpectedConditions(
            refrigerant, outdoorTemp, indoorTemp, systemType, operatingMode
        );

        // Pressure analysis
        const pressureAnalysis = this.analyzePressures(
            suctionPressure, dischargePressure, expectedConditions
        );

        // Temperature analysis
        const tempAnalysis = this.analyzeTemperatures(
            suctionTemp, liquidTemp, suctionPressure, dischargePressure, refrigerant
        );

        // Compile diagnostic results
        diagnostic.systemHealth = this.determineSystemHealth(pressureAnalysis, tempAnalysis);
        diagnostic.issues = [...pressureAnalysis.issues, ...tempAnalysis.issues];
        diagnostic.recommendations = [...pressureAnalysis.recommendations, ...tempAnalysis.recommendations];

        // A2L specific considerations
        diagnostic.a2lConsiderations = [
            'Verify leak detection system is operational',
            'Check ventilation system performance',
            'Inspect A2L compatible components',
            'Verify proper labeling and documentation'
        ];

        if (diagnostic.issues.length > 0) {
            diagnostic.a2lConsiderations.push('Address all issues before system operation');
            diagnostic.a2lConsiderations.push('Perform leak test after repairs');
        }

        return diagnostic;
    }

    calculateExpectedConditions(refrigerant, outdoorTemp, indoorTemp, systemType, mode) {
        // Calculate expected operating pressures based on conditions
        const evapTemp = mode === 'cooling' ? indoorTemp - 35 : indoorTemp - 20;
        const condTemp = mode === 'cooling' ? outdoorTemp + 25 : outdoorTemp + 20;

        return {
            expectedSuctionPressure: this.interpolatePressure(evapTemp, refrigerant),
            expectedDischargePressure: this.interpolatePressure(condTemp, refrigerant),
            evaporatingTemp: evapTemp,
            condensingTemp: condTemp
        };
    }

    analyzePressures(suctionPressure, dischargePressure, expected) {
        const analysis = { issues: [], recommendations: [] };
        
        const suctionVariance = Math.abs(suctionPressure - expected.expectedSuctionPressure) / expected.expectedSuctionPressure;
        const dischargeVariance = Math.abs(dischargePressure - expected.expectedDischargePressure) / expected.expectedDischargePressure;

        if (suctionVariance > 0.15) {
            if (suctionPressure < expected.expectedSuctionPressure) {
                analysis.issues.push('Low suction pressure detected');
                analysis.recommendations.push('Check for undercharge or restriction');
            } else {
                analysis.issues.push('High suction pressure detected');
                analysis.recommendations.push('Check for overcharge or poor heat rejection');
            }
        }

        if (dischargeVariance > 0.15) {
            if (dischargePressure > expected.expectedDischargePressure) {
                analysis.issues.push('High discharge pressure detected');
                analysis.recommendations.push('Clean condenser, check airflow');
            } else {
                analysis.issues.push('Low discharge pressure detected');
                analysis.recommendations.push('Check compressor performance');
            }
        }

        return analysis;
    }

    analyzeTemperatures(suctionTemp, liquidTemp, suctionPressure, dischargePressure, refrigerant) {
        const analysis = { issues: [], recommendations: [] };
        
        if (!suctionTemp || !liquidTemp) return analysis;

        const satTempLow = this.interpolateTemperature(suctionPressure, refrigerant);
        const satTempHigh = this.interpolateTemperature(dischargePressure, refrigerant);
        
        const superheat = suctionTemp - satTempLow;
        const subcooling = satTempHigh - liquidTemp;

        // Superheat analysis
        if (superheat < 5) {
            analysis.issues.push(`Low superheat: ${superheat.toFixed(1)}°F`);
            analysis.recommendations.push('Risk of liquid flooding - check TXV operation');
        } else if (superheat > 25) {
            analysis.issues.push(`High superheat: ${superheat.toFixed(1)}°F`);
            analysis.recommendations.push('Possible undercharge or restriction');
        }

        // Subcooling analysis
        if (subcooling < 5) {
            analysis.issues.push(`Low subcooling: ${subcooling.toFixed(1)}°F`);
            analysis.recommendations.push('Possible undercharge');
        } else if (subcooling > 20) {
            analysis.issues.push(`High subcooling: ${subcooling.toFixed(1)}°F`);
            analysis.recommendations.push('Possible overcharge or condenser issues');
        }

        return analysis;
    }

    determineSystemHealth(pressureAnalysis, tempAnalysis) {
        const totalIssues = pressureAnalysis.issues.length + tempAnalysis.issues.length;
        
        if (totalIssues === 0) return 'Excellent';
        if (totalIssues <= 2) return 'Good';
        if (totalIssues <= 4) return 'Fair';
        return 'Poor';
    }

    // Interpolation functions for pressure/temperature conversion
    interpolatePressure(tempF, refrigerant) {
        const refData = this.a2lDatabase[refrigerant];
        if (!refData || !refData.pressureData) return 0;
        
        const data = refData.pressureData;
        
        for (let i = 0; i < data.length - 1; i++) {
            if (tempF >= data[i].temperatureF && tempF <= data[i + 1].temperatureF) {
                const ratio = (tempF - data[i].temperatureF) / (data[i + 1].temperatureF - data[i].temperatureF);
                return data[i].pressurePSIG + ratio * (data[i + 1].pressurePSIG - data[i].pressurePSIG);
            }
        }
        
        return 0;
    }

    interpolateTemperature(pressurePSIG, refrigerant) {
        const refData = this.a2lDatabase[refrigerant];
        if (!refData || !refData.pressureData) return 0;
        
        const data = refData.pressureData;
        
        for (let i = 0; i < data.length - 1; i++) {
            if (pressurePSIG >= data[i].pressurePSIG && pressurePSIG <= data[i + 1].pressurePSIG) {
                const ratio = (pressurePSIG - data[i].pressurePSIG) / (data[i + 1].pressurePSIG - data[i].pressurePSIG);
                return data[i].temperatureF + ratio * (data[i + 1].temperatureF - data[i].temperatureF);
            }
        }
        
        return 0;
    }

    // Data persistence
    saveCalculation(type, inputs, results, name = null) {
        const calculation = {
            id: Date.now(),
            type: type,
            name: name || `A2L ${type} - ${new Date().toLocaleDateString()}`,
            inputs: inputs,
            results: results,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        this.savedCalculations.unshift(calculation);
        
        if (this.savedCalculations.length > 30) {
            this.savedCalculations = this.savedCalculations.slice(0, 30);
        }

        localStorage.setItem('a2lCalculations', JSON.stringify(this.savedCalculations));
        return calculation.id;
    }

    // Export capabilities
    exportToPDF(calculation) {
        const printContent = this.generateA2LReport(calculation);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    generateA2LReport(calculation) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>A2L Refrigerant System Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0; }
                    .safety { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin: 15px 0; }
                    .section { margin-bottom: 25px; }
                    .result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
                    .result-box { border: 1px solid #dee2e6; padding: 15px; border-radius: 8px; }
                    .label { font-weight: bold; color: #495057; }
                    .value { color: #667eea; font-weight: bold; }
                    .requirements { background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>A2L Refrigerant System Assessment Report</h1>
                    <p>Generated by LARK Labs A2L Calculator</p>
                    <p>Date: ${calculation.date} | Report ID: ${calculation.id}</p>
                </div>
                
                <div class="safety">
                    <h3>⚠️ A2L Safety Notice</h3>
                    <p>This report is for A2L (mildly flammable) refrigerant systems. All installations must comply with CSA B52, local codes, and manufacturer requirements. Professional installation and certification required.</p>
                </div>
                
                <div class="section">
                    <h2>System Information</h2>
                    <div class="result-box">
                        <div><span class="label">Refrigerant:</span> <span class="value">${calculation.results.refrigerant || 'Not specified'}</span></div>
                        <div><span class="label">Charge Amount:</span> <span class="value">${calculation.inputs.chargeAmount || 'Not specified'} lbs</span></div>
                        <div><span class="label">System Type:</span> <span class="value">${calculation.inputs.systemType || 'Not specified'}</span></div>
                        <div><span class="label">Installation Type:</span> <span class="value">${calculation.inputs.occupancy || 'Not specified'}</span></div>
                    </div>
                </div>
                
                ${calculation.type === 'compliance' ? this.generateComplianceSection(calculation.results) : ''}
                ${calculation.type === 'leak-analysis' ? this.generateLeakAnalysisSection(calculation.results) : ''}
                ${calculation.type === 'diagnostic' ? this.generateDiagnosticSection(calculation.results) : ''}
                
                <div class="requirements">
                    <h3>📋 Professional Recommendations</h3>
                    <ul>
                        <li>Ensure all installation work is performed by A2L certified technicians</li>
                        <li>Complete commissioning checklist including leak testing</li>
                        <li>Provide facility staff with A2L safety training</li>
                        <li>Establish regular maintenance schedule per manufacturer requirements</li>
                        <li>Maintain documentation for regulatory compliance</li>
                    </ul>
                </div>
                
                <div style="margin-top: 40px; text-align: center; border-top: 1px solid #dee2e6; padding-top: 20px;">
                    <p><strong>This report generated by LARK Labs A2L Calculator</strong></p>
                    <p>For training, certification, and additional resources visit: https://larklabs.org</p>
                    <p><em>Report generated: ${new Date().toLocaleString()}</em></p>
                </div>
            </body>
            </html>
        `;
    }

    generateComplianceSection(results) {
        return `
            <div class="section">
                <h2>CSA B52 Compliance Assessment</h2>
                <div class="result-box">
                    <div><span class="label">Compliance Status:</span> 
                         <span class="value" style="color: ${results.complianceStatus === 'Compliant' ? 'green' : 'red'}">
                             ${results.complianceStatus}
                         </span>
                    </div>
                    <div><span class="label">Compliance Level:</span> <span class="value">${results.complianceLevel}</span></div>
                    <div><span class="label">Charge (kg):</span> <span class="value">${results.chargeKg}</span></div>
                </div>
                
                ${results.requirements ? `
                    <div class="requirements">
                        <h4>📋 Installation Requirements</h4>
                        <ul>
                            ${results.requirements.equipment.map(req => `<li>${req}</li>`).join('')}
                            ${results.requirements.safety.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    generateLeakAnalysisSection(results) {
        return `
            <div class="section">
                <h2>Leak Rate Analysis</h2>
                <div class="result-box">
                    <div><span class="label">Max Concentration:</span> <span class="value">${results.maxConcentration} ppm</span></div>
                    <div><span class="label">Percent of LFL:</span> <span class="value">${results.maxPercentLFL}%</span></div>
                    <div><span class="label">Safety Level:</span> 
                         <span class="value" style="color: ${results.safetyLevel === 'Safe' ? 'green' : results.safetyLevel === 'Danger' ? 'red' : 'orange'}">
                             ${results.safetyLevel}
                         </span>
                    </div>
                </div>
                
                <div class="requirements">
                    <h4>🚨 Safety Recommendations</h4>
                    <ul>
                        ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    generateDiagnosticSection(results) {
        return `
            <div class="section">
                <h2>System Diagnostic Results</h2>
                <div class="result-box">
                    <div><span class="label">System Health:</span> 
                         <span class="value" style="color: ${results.systemHealth === 'Excellent' ? 'green' : results.systemHealth === 'Poor' ? 'red' : 'orange'}">
                             ${results.systemHealth}
                         </span>
                    </div>
                    <div><span class="label">Issues Found:</span> <span class="value">${results.issues.length}</span></div>
                </div>
                
                ${results.issues.length > 0 ? `
                    <div class="warning">
                        <h4>⚠️ Issues Identified</h4>
                        <ul>
                            ${results.issues.map(issue => `<li>${issue}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="requirements">
                    <h4>🔧 Recommendations</h4>
                    <ul>
                        ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        ${results.a2lConsiderations.map(cons => `<li>${cons}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
}

// Enhanced User Interface Manager
class A2LUIManager {
    constructor() {
        this.setupEnhancedStyling();
        this.setupMobileOptimizations();
        this.setupDataManagement();
    }

    setupEnhancedStyling() {
        const enhancedStyles = document.createElement('style');
        enhancedStyles.textContent = `
            /* Enhanced A2L Professional Styling */
            .compliance-status {
                padding: 15px;
                border-radius: 10px;
                margin: 15px 0;
                font-weight: bold;
                text-align: center;
            }
            
            .compliance-compliant {
                background: linear-gradient(135deg, #48bb78, #38a169);
                color: white;
            }
            
            .compliance-non-compliant {
                background: linear-gradient(135deg, #e53e3e, #c53030);
                color: white;
            }
            
            .compliance-warning {
                background: linear-gradient(135deg, #ed8936, #dd6b20);
                color: white;
            }
            
            .a2l-requirements {
                background: rgba(102, 126, 234, 0.1);
                border: 1px solid rgba(102, 126, 234, 0.3);
                padding: 20px;
                border-radius: 12px;
                margin: 20px 0;
            }
            
            .requirement-item {
                display: flex;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid rgba(102, 126, 234, 0.1);
            }
            
            .requirement-item:last-child {
                border-bottom: none;
            }
            
            .requirement-icon {
                margin-right: 10px;
                font-size: 1.2em;
            }
            
            .safety-alert {
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                color: white;
                padding: 15px;
                border-radius: 10px;
                margin: 15px 0;
                border-left: 5px solid #e17055;
            }
            
            .enhanced-result-container {
                background: rgba(255, 255, 255, 0.98);
                border-radius: 15px;
                padding: 25px;
                margin: 20px 0;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(102, 126, 234, 0.2);
            }
            
            .result-section {
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .result-section:last-child {
                border-bottom: none;
            }
            
            .result-section h4 {
                color: #667eea;
                margin-bottom: 15px;
                font-size: 1.2em;
            }
            
            .metric-card {
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #dee2e6;
            }
            
            .metric-value {
                font-size: 1.8em;
                font-weight: bold;
                color: #667eea;
                display: block;
            }
            
            .metric-label {
                font-size: 0.9em;
                color: #6c757d;
                margin-top: 5px;
            }
            
            /* Enhanced mobile responsiveness */
            @media (max-width: 768px) {
                .enhanced-result-container {
                    padding: 20px 15px;
                    margin: 15px 0;
                }
                
                .metric-card {
                    padding: 12px;
                }
                
                .metric-value {
                    font-size: 1.5em;
                }
                
                .result-section h4 {
                    font-size: 1.1em;
                }
            }
        `;
        document.head.appendChild(enhancedStyles);
    }

    setupMobileOptimizations() {
        // Enhanced touch targets for mobile
        if (window.innerWidth < 768) {
            const mobileStyles = document.createElement('style');
            mobileStyles.textContent = `
                .nav-btn { min-height: 48px; font-size: 0.9em; }
                .calc-btn { min-height: 50px; font-size: 1.1em; }
                .input-group input, .input-group select { min-height: 48px; font-size: 16px; }
            `;
            document.head.appendChild(mobileStyles);
        }
    }

    setupDataManagement() {
        // Add data management interface to existing calculators
        const calculators = document.querySelectorAll('.calculator');
        calculators.forEach(calc => {
            if (!calc.querySelector('.data-management')) {
                const dataManagement = document.createElement('div');
                dataManagement.className = 'data-management';
                dataManagement.style.cssText = `
                    background: rgba(102, 126, 234, 0.05);
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 20px;
                    text-align: center;
                `;
                
                dataManagement.innerHTML = `
                    <h4 style="color: #667eea; margin-bottom: 10px;">💾 Calculation Management</h4>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="banner-btn primary" onclick="a2lEngine.saveCurrentCalculation()">💾 Save</button>
                        <button class="banner-btn" onclick="a2lEngine.showSavedCalculations()">📂 Saved</button>
                        <button class="banner-btn" onclick="a2lEngine.exportCurrentCalculation()">📄 Export</button>
                    </div>
                `;
                
                calc.appendChild(dataManagement);
            }
        });
    }

    displayEnhancedResults(results, type, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = `<div class="enhanced-result-container">`;

        switch (type) {
            case 'compliance':
                html += this.formatComplianceResults(results);
                break;
            case 'leak-analysis':
                html += this.formatLeakAnalysisResults(results);
                break;
            case 'diagnostic':
                html += this.formatDiagnosticResults(results);
                break;
            case 'installation':
                html += this.formatInstallationResults(results);
                break;
        }

        html += `</div>`;
        container.innerHTML = html;
        container.style.display = 'block';

        // Store current calculation
        a2lEngine.currentCalculation = { type, results, inputs: this.getCurrentInputs(type) };
    }

    formatComplianceResults(results) {
        const statusClass = results.complianceStatus === 'Compliant' ? 'compliance-compliant' : 'compliance-non-compliant';
        
        return `
            <div class="result-section">
                <h4>🛡️ CSA B52 Compliance Assessment</h4>
                <div class="compliance-status ${statusClass}">
                    ${results.complianceStatus} - ${results.complianceLevel} Level
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div class="metric-card">
                        <span class="metric-value">${results.chargeKg}kg</span>
                        <span class="metric-label">Refrigerant Charge</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-value">$${results.estimatedCost?.total || 'TBD'}</span>
                        <span class="metric-label">Est. Compliance Cost</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-value">${results.timeline?.total || 'TBD'}</span>
                        <span class="metric-label">Installation Timeline</span>
                    </div>
                </div>
            </div>
            
            ${results.errors?.length > 0 ? `
                <div class="result-section">
                    <div class="safety-alert">
                        <h4>❌ Compliance Issues</h4>
                        <ul>
                            ${results.errors.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            ` : ''}
            
            <div class="result-section">
                <h4>📋 Required Safety Measures</h4>
                <div class="a2l-requirements">
                    ${results.safetyMeasures?.map(measure => `
                        <div class="requirement-item">
                            <span class="requirement-icon">✓</span>
                            <span>${measure}</span>
                        </div>
                    `).join('') || ''}
                </div>
            </div>
        `;
    }

    formatLeakAnalysisResults(results) {
        const safetyColor = results.safetyLevel === 'Safe' ? 'green' : 
                           results.safetyLevel === 'Danger' ? 'red' : 'orange';

        return `
            <div class="result-section">
                <h4>🔍 A2L Leak Rate Analysis</h4>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div class="metric-card">
                        <span class="metric-value">${results.maxConcentration}</span>
                        <span class="metric-label">Max Concentration (ppm)</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-value" style="color: ${safetyColor}">${results.maxPercentLFL}%</span>
                        <span class="metric-label">Percent of LFL</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-value" style="color: ${safetyColor}">${results.safetyLevel}</span>
                        <span class="metric-label">Safety Level</span>
                    </div>
                </div>
            </div>
            
            <div class="result-section">
                <h4>🚨 Safety Recommendations</h4>
                <div class="a2l-requirements">
                    ${results.recommendations.map(rec => `
                        <div class="requirement-item">
                            <span class="requirement-icon">⚠️</span>
                            <span>${rec}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    formatDiagnosticResults(results) {
        const healthColor = results.systemHealth === 'Excellent' ? 'green' :
                           results.systemHealth === 'Poor' ? 'red' : 'orange';

        return `
            <div class="result-section">
                <h4>🔧 A2L System Diagnostic</h4>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div class="metric-card">
                        <span class="metric-value" style="color: ${healthColor}">${results.systemHealth}</span>
                        <span class="metric-label">System Health</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-value">${results.issues.length}</span>
                        <span class="metric-label">Issues Found</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-value">${results.safety}</span>
                        <span class="metric-label">Safety Classification</span>
                    </div>
                </div>
            </div>
            
            ${results.issues.length > 0 ? `
                <div class="result-section">
                    <h4>🔍 Issues Identified</h4>
                    <div class="a2l-requirements">
                        ${results.issues.map(issue => `
                            <div class="requirement-item">
                                <span class="requirement-icon">❗</span>
                                <span>${issue}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="result-section">
                <h4>🔧 Technical Recommendations</h4>
                <div class="a2l-requirements">
                    ${results.recommendations.map(rec => `
                        <div class="requirement-item">
                            <span class="requirement-icon">🔧</span>
                            <span>${rec}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="result-section">
                <h4>⚠️ A2L Safety Considerations</h4>
                <div class="a2l-requirements">
                    ${results.a2lConsiderations.map(cons => `
                        <div class="requirement-item">
                            <span class="requirement-icon">⚠️</span>
                            <span>${cons}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getCurrentInputs(type) {
        // Collect current form inputs based on calculator type
        const inputs = {};
        const form = document.querySelector('.calculator.active');
        if (form) {
            const inputElements = form.querySelectorAll('input, select');
            inputElements.forEach(input => {
                if (input.id) {
                    inputs[input.id] = input.value;
                }
            });
        }
        return inputs;
    }
}

// Initialize enhanced A2L features
const a2lEngine = new A2LComplianceEngine();
const a2lUI = new A2LUIManager();

// Enhanced calculation functions
window.calculateEnhancedCompliance = function() {
    const inputs = {
        refrigerant: document.getElementById('compliance-refrigerant')?.value || 'R-32',
        chargeAmount: parseFloat(document.getElementById('compliance-charge')?.value || 0),
        roomVolume: parseFloat(document.getElementById('compliance-room-volume')?.value || 0),
        roomArea: parseFloat(document.getElementById('compliance-room-area')?.value || 0),
        occupancy: document.getElementById('compliance-occupancy')?.value || 'residential',
        ventilationType: document.getElementById('compliance-ventilation')?.value || 'natural',
        detectionSystem: document.getElementById('compliance-detection')?.checked || false,
        installerCert: document.getElementById('compliance-installer')?.checked || false,
        equipmentType: document.getElementById('compliance-equipment')?.value || 'split-system',
        spaceType: document.getElementById('compliance-space')?.value || 'mechanical-room'
    };

    // Validate inputs
    if (!inputs.chargeAmount || !inputs.roomVolume) {
        alert('Please enter charge amount and room volume');
        return;
    }

    const results = a2lEngine.assessCSACompliance(inputs);
    const installationReqs = a2lEngine.calculateInstallationRequirements(inputs);
    
    // Combine results
    const combinedResults = { ...results, ...installationReqs };
    
    a2lUI.displayEnhancedResults(combinedResults, 'compliance', 'compliance-result');
};

window.calculateEnhancedLeakAnalysis = function() {
    const inputs = {
        refrigerant: document.getElementById('leak-refrigerant')?.value || 'R-32',
        chargeAmount: parseFloat(document.getElementById('leak-charge-amount')?.value || 0),
        roomVolume: parseFloat(document.getElementById('leak-room-vol')?.value || 0),
        ventilationRate: parseFloat(document.getElementById('leak-vent-rate')?.value || 0),
        leakRate: parseFloat(document.getElementById('leak-rate-input')?.value || 0),
        exposureTime: parseFloat(document.getElementById('leak-exposure-time')?.value || 60),
        occupants: parseInt(document.getElementById('leak-occupants')?.value || 1),
        temperatureC: parseFloat(document.getElementById('leak-temperature')?.value || 20)
    };

    if (!inputs.chargeAmount || !inputs.roomVolume || !inputs.leakRate) {
        alert('Please enter charge amount, room volume, and leak rate');
        return;
    }

    const results = a2lEngine.calculateAdvancedLeakRate(inputs);
    a2lUI.displayEnhancedResults(results, 'leak-analysis', 'leak-analysis-result');
};

window.calculateEnhancedDiagnostic = function() {
    const inputs = {
        refrigerant: document.getElementById('enhanced-diag-refrigerant')?.value || 'R-32',
        outdoorTemp: parseFloat(document.getElementById('enhanced-outdoor-temp')?.value || 0),
        indoorTemp: parseFloat(document.getElementById('enhanced-indoor-temp')?.value || 0),
        suctionPressure: parseFloat(document.getElementById('enhanced-suction-pressure')?.value || 0),
        dischargePressure: parseFloat(document.getElementById('enhanced-discharge-pressure')?.value || 0),
        suctionTemp: parseFloat(document.getElementById('enhanced-suction-temp')?.value || 0),
        liquidTemp: parseFloat(document.getElementById('enhanced-liquid-temp')?.value || 0),
        systemType: document.getElementById('enhanced-system-type')?.value || 'residential',
        operatingMode: document.getElementById('enhanced-operating-mode')?.value || 'cooling'
    };

    if (!inputs.outdoorTemp || !inputs.indoorTemp || !inputs.suctionPressure || !inputs.dischargePressure) {
        alert('Please enter temperature and pressure readings');
        return;
    }

    const results = a2lEngine.performA2LSystemDiagnostic(inputs);
    a2lUI.displayEnhancedResults(results, 'diagnostic', 'enhanced-diagnostic-result');
};

// Data management functions
a2lEngine.saveCurrentCalculation = function() {
    if (!this.currentCalculation) {
        alert('No calculation to save. Please run a calculation first.');
        return;
    }

    const name = prompt('Enter a name for this calculation:') || 
                 `A2L ${this.currentCalculation.type} - ${new Date().toLocaleDateString()}`;
    
    const id = this.saveCalculation(
        this.currentCalculation.type, 
        this.currentCalculation.inputs, 
        this.currentCalculation.results, 
        name
    );
    
    if (id) {
        alert('A2L calculation saved successfully!');
    }
};

a2lEngine.exportCurrentCalculation = function() {
    if (!this.currentCalculation) {
        alert('No calculation to export. Please run a calculation first.');
        return;
    }
    
    this.exportToPDF(this.currentCalculation);
};

a2lEngine.showSavedCalculations = function() {
    // Implementation for showing saved calculations interface
    alert(`You have ${this.savedCalculations.length} saved A2L calculations. Feature will be enhanced in next update.`);
};

// Initialize enhanced features when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('A2L Enhanced Features Initialized');
    
    // Add enhanced calculators to navigation
    setTimeout(() => {
        a2lEngine.addEnhancedCalculators();
    }, 1000);
});

// Add enhanced calculators
a2lEngine.addEnhancedCalculators = function() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !document.getElementById('compliance-btn')) {
        const enhancedButtons = `
            <button id="compliance-btn" class="nav-btn" onclick="showEnhancedCalculator('compliance', this)">CSA B52 Compliance</button>
            <button id="leak-analysis-btn" class="nav-btn" onclick="showEnhancedCalculator('leak-analysis', this)">Advanced Leak Analysis</button>
            <button id="installation-btn" class="nav-btn" onclick="showEnhancedCalculator('installation', this)">Installation Requirements</button>
        `;
        navMenu.insertAdjacentHTML('beforeend', enhancedButtons);
    }
};

// Function to show enhanced calculators
window.showEnhancedCalculator = function(calcType, button) {
    // Hide existing calculators
    document.querySelectorAll('.calculator').forEach(calc => calc.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show enhanced calculator
    let calculatorHTML = '';
    
    switch (calcType) {
        case 'compliance':
            calculatorHTML = a2lEngine.getComplianceCalculatorHTML();
            break;
        case 'leak-analysis':
            calculatorHTML = a2lEngine.getLeakAnalysisCalculatorHTML();
            break;
        case 'installation':
            calculatorHTML = a2lEngine.getInstallationCalculatorHTML();
            break;
    }
    
    // Create or update enhanced calculator container
    let container = document.getElementById(`enhanced-${calcType}`);
    if (!container) {
        container = document.createElement('div');
        container.id = `enhanced-${calcType}`;
        container.className = 'calculator';
        document.querySelector('.container').appendChild(container);
    }
    
    container.innerHTML = calculatorHTML;
    container.classList.add('active');
    button.classList.add('active');
};

// HTML generators for enhanced calculators
a2lEngine.getComplianceCalculatorHTML = function() {
    return `
        <div class="calc-header">
            <h2>🛡️ CSA B52 Compliance Assessment</h2>
            <p>Professional A2L refrigerant system compliance verification</p>
        </div>
        
        <div class="input-group">
            <label>A2L Refrigerant Type:</label>
            <select id="compliance-refrigerant">
                <option value="R-32">R-32 (GWP: 675)</option>
                <option value="R-454B">R-454B (GWP: 466)</option>
                <option value="R-454C">R-454C (GWP: 148)</option>
                <option value="R-32/R-1234yf">R-468A (GWP: 229)</option>
            </select>
        </div>
        
        <div class="input-row">
            <div class="input-group">
                <label>Refrigerant Charge (lbs):</label>
                <input type="number" id="compliance-charge" placeholder="Total charge" step="0.1">
            </div>
            <div class="input-group">
                <label>Room Volume (ft³):</label>
                <input type="number" id="compliance-room-volume" placeholder="Room volume">
            </div>
        </div>
        
        <div class="input-row">
            <div class="input-group">
                <label>Room Area (ft²):</label>
                <input type="number" id="compliance-room-area" placeholder="Floor area">
            </div>
            <div class="input-group">
                <label>Occupancy Type:</label>
                <select id="compliance-occupancy">
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="institutional">Institutional</option>
                    <option value="industrial">Industrial</option>
                </select>
            </div>
        </div>
        
        <div class="input-row">
            <div class="input-group">
                <label>Ventilation Type:</label>
                <select id="compliance-ventilation">
                    <option value="natural">Natural Ventilation</option>
                    <option value="mechanical">Mechanical Ventilation</option>
                    <option value="emergency">Emergency Ventilation</option>
                    <option value="none">No Ventilation</option>
                </select>
            </div>
            <div class="input-group">
                <label>Equipment Type:</label>
                <select id="compliance-equipment">
                    <option value="split-system">Split System</option>
                    <option value="package-unit">Package Unit</option>
                    <option value="vrf">VRF System</option>
                    <option value="chiller">Chiller</option>
                </select>
            </div>
        </div>
        
        <div class="input-row">
            <div class="input-group">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="compliance-detection" style="width: auto;">
                    Leak Detection System Installed
                </label>
            </div>
            <div class="input-group">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="compliance-installer" style="width: auto;">
                    A2L Certified Installer
                </label>
            </div>
        </div>
        
        <div class="input-group">
            <label>Space Classification:</label>
            <select id="compliance-space">
                <option value="mechanical-room">Mechanical Room</option>
                <option value="basement">Basement</option>
                <option value="attic">Attic</option>
                <option value="outdoor">Outdoor</option>
                <option value="occupied-space">Occupied Space</option>
            </select>
        </div>
        
        <button class="calc-btn" onclick="calculateEnhancedCompliance()">🛡️ Assess CSA B52 Compliance</button>
        
        <div id="compliance-result" class="result"></div>
        
        <div class="info-box">
            <strong>CSA B52 Reference:</strong> This calculator follows Canadian Standards Association B52 requirements for A2L refrigerant installations. Always verify with local codes and authorities having jurisdiction.
        </div>
    `;
};

a2lEngine.getLeakAnalysisCalculatorHTML = function() {
    return `
        <div class="calc-header">
            <h2>🔍 Advanced A2L Leak Analysis</h2>
            <p>Time-based leak concentration analysis with safety assessment</p>
        </div>
        
        <div class="input-group">
            <label>A2L Refrigerant:</label>
            <select id="leak-refrigerant">
                <option value="R-32">R-32 (LFL: 30.7%)</option>
                <option value="R-454B">R-454B (LFL: 34.0%)</option>
                <option value="R-454C">R-454C (LFL: 38.0%)</option>
                <option value="R-32/R-1234yf">R-468A (LFL: 36.0%)</option>
            </select>
        </div>
        
        <div class="input-row">
            <div class="input-group">
                <label>System Charge (lbs):</label>
                <input type="number" id="leak-charge-amount" placeholder="Total charge" step="0.1">
            </div>
            <div class="input-group">
                <label>Leak Rate (lbs/h):</label>
                <input type="number" id="leak-rate-input" placeholder="Leak rate" step="0.001">
            </div>
        </div>
        
        <div class="input-row">
            <div class="input-group">
                <label>Room Volume (ft³):</label>
                <input type="number" id="leak-room-vol" placeholder="Enclosed volume">
            </div>
            <div class="input-group">
                <label>Ventilation Rate (CFM):</label>
                <input type="number" id="leak-vent-rate" placeholder="Air changes" value="0">
            </div>
        </div>
        
        <div class="input-row">
            <div class="input-group">
                <label>Exposure Time (minutes):</label>
                <input type="number" id="leak-exposure-time" placeholder="Analysis duration" value="60">
            </div>
            <div class="input-group">
                <label>Number of Occupants:</label>
                <input type="number" id="leak-occupants" placeholder="People present" value="1">
            </div>
        </div>
        
        <div class="input-group">
            <label>Ambient Temperature (°C):</label>
            <input type="number" id="leak-temperature" placeholder="Room temperature" value="20">
        </div>
        
        <button class="calc-btn" onclick="calculateEnhancedLeakAnalysis()">🔍 Analyze Leak Impact</button>
        
        <div id="leak-analysis-result" class="result"></div>
        
        <div class="info-box">
            <strong>Safety Standard:</strong> CSA B52 requires concentrations remain below 25% of Lower Flammability Limit (LFL) in occupied spaces.
        </div>
    `;
};

a2lEngine.getInstallationCalculatorHTML = function() {
    return `
        <div class="calc-header">
            <h2>📋 A2L Installation Requirements</h2>
            <p>Calculate comprehensive installation requirements for A2L systems</p>
        </div>
        
        <div class="input-group">
            <label>A2L Refrigerant:</label>
            <select id="install-refrigerant">
                <option value="R-32">R-32</option>
                <option value="R-454B">R-454B</option>
                <option value="R-454C">R-454C</option>
                <option value="R-32/R-1234yf">R-468A</option>
            </select>
        </div>
        
        <div class="input-row">
            <div class="input-group">
                <label>System Capacity (BTU/h):</label>
                <input type="number" id="install-capacity" placeholder="System capacity">
            </div>
            <div class="input-group">
                <label>Refrigerant Charge (lbs):</label>
                <input type="number" id="install-charge" placeholder="Total charge" step="0.1">
            </div>
        </div>
        
        <div class="input-row">
            <div class="input-group">
                <label>Building Type:</label>
                <select id="install-building-type">
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="institutional">Institutional</option>
                    <option value="industrial">Industrial</option>
                </select>
            </div>
            <div class="input-group">
                <label>Equipment Location:</label>
                <select id="install-location">
                    <option value="outdoor">Outdoor</option>
                    <option value="mechanical-room">Mechanical Room</option>
                    <option value="basement">Basement</option>
                    <option value="attic">Attic</option>
                    <option value="occupied-space">Occupied Space</option>
                </select>
            </div>
        </div>
        
        <div class="input-group">
            <label>System Type:</label>
            <select id="install-system-type">
                <option value="split-system">Split System</option>
                <option value="mini-split">Mini Split</option>
                <option value="package-unit">Package Unit</option>
                <option value="vrf">VRF System</option>
                <option value="chiller">Chiller</option>
                <option value="heat-pump">Heat Pump</option>
            </select>
        </div>
        
        <button class="calc-btn" onclick="calculateInstallationRequirements()">📋 Calculate Requirements</button>
        
        <div id="installation-result" class="result"></div>
        
        <div class="info-box">
            <strong>Professional Note:</strong> All A2L installations require certified technicians and compliance with provincial regulations. Contact local TSSA office for jurisdiction-specific requirements.
        </div>
    `;
};

window.calculateInstallationRequirements = function() {
    const inputs = {
        refrigerant: document.getElementById('install-refrigerant')?.value || 'R-32',
        capacity: parseFloat(document.getElementById('install-capacity')?.value || 0),
        chargeAmount: parseFloat(document.getElementById('install-charge')?.value || 0),
        buildingType: document.getElementById('install-building-type')?.value || 'residential',
        equipmentLocation: document.getElementById('install-location')?.value || 'outdoor',
        systemType: document.getElementById('install-system-type')?.value || 'split-system'
    };

    if (!inputs.capacity || !inputs.chargeAmount) {
        alert('Please enter system capacity and refrigerant charge');
        return;
    }

    const results = a2lEngine.calculateInstallationRequirements(inputs);
    a2lUI.displayEnhancedResults(results, 'installation', 'installation-result');
};