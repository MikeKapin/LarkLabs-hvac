// netlify/functions/predictive-maintenance.js
// AI-powered predictive maintenance system for HVAC equipment

class PredictiveMaintenanceAI {
    constructor() {
        this.failureDatabase = this.initializeFailureDatabase();
        this.maintenancePatterns = this.initializeMaintenancePatterns();
        this.riskFactors = this.initializeRiskFactors();
    }

    /**
     * Analyze equipment for predictive maintenance recommendations
     */
    async analyzePredictiveMaintenance(equipmentData, usagePatterns = null, environmentData = null) {
        console.log('🔮 Starting predictive maintenance analysis...');
        
        try {
            const analysis = {
                equipment: equipmentData,
                currentAge: this.calculateEquipmentAge(equipmentData),
                riskAssessment: await this.performRiskAssessment(equipmentData, environmentData),
                failurePredictions: await this.predictFailures(equipmentData, usagePatterns),
                maintenanceSchedule: await this.optimizeMaintenanceSchedule(equipmentData, usagePatterns),
                componentLifespan: await this.assessComponentLifespan(equipmentData),
                costAnalysis: await this.analyzeCostBenefits(equipmentData),
                recommendations: [],
                confidence: 0
            };

            // Generate AI-powered recommendations
            analysis.recommendations = await this.generateAIRecommendations(analysis);
            analysis.confidence = this.calculatePredictionConfidence(analysis);

            console.log(`✅ Predictive analysis complete. Confidence: ${analysis.confidence}%`);
            return {
                success: true,
                analysis: analysis,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Predictive maintenance analysis error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Calculate equipment age from manufacturing data
     */
    calculateEquipmentAge(equipmentData) {
        const currentYear = new Date().getFullYear();
        let mfgYear = null;

        // Try to extract manufacturing year from various sources
        if (equipmentData.manufacturing) {
            const yearMatch = equipmentData.manufacturing.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) mfgYear = parseInt(yearMatch[0]);
        }

        if (equipmentData.serial && !mfgYear) {
            mfgYear = this.decodeSerialYear(equipmentData.serial, equipmentData.brand);
        }

        if (!mfgYear) {
            return { age: null, estimated: true, confidence: 0 };
        }

        const age = currentYear - mfgYear;
        return {
            age: age,
            manufacturingYear: mfgYear,
            estimated: false,
            confidence: 85
        };
    }

    decodeSerialYear(serial, brand) {
        // Brand-specific serial number decoding
        const decoders = {
            'carrier': (s) => {
                if (s.length >= 2) {
                    const decade = parseInt(s[0]) * 10;
                    const year = parseInt(s[1]);
                    return decade < 40 ? 2000 + decade + year : 1980 + decade + year;
                }
                return null;
            },
            'trane': (s) => {
                if (s.length >= 2) {
                    const decade = parseInt(s[0]) * 10;
                    const year = parseInt(s[1]);
                    return decade < 40 ? 2000 + decade + year : 1980 + decade + year;
                }
                return null;
            },
            'generac': (s) => {
                if (s.length >= 4) {
                    const yearCode = s.substring(2, 4);
                    const year = parseInt(yearCode);
                    return year > 80 ? 1900 + year : 2000 + year;
                }
                return null;
            }
        };

        const decoder = decoders[brand?.toLowerCase()];
        return decoder ? decoder(serial) : null;
    }

    /**
     * Perform comprehensive risk assessment
     */
    async performRiskAssessment(equipmentData, environmentData) {
        const risks = {
            ageRisk: this.assessAgeRisk(equipmentData),
            environmentalRisk: this.assessEnvironmentalRisk(environmentData),
            usageRisk: this.assessUsageRisk(equipmentData),
            maintenanceRisk: this.assessMaintenanceRisk(equipmentData),
            overallRisk: 'low'
        };

        // Calculate overall risk
        const riskScores = [
            risks.ageRisk.score,
            risks.environmentalRisk.score,
            risks.usageRisk.score,
            risks.maintenanceRisk.score
        ];

        const avgRisk = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;
        
        if (avgRisk > 0.7) risks.overallRisk = 'high';
        else if (avgRisk > 0.4) risks.overallRisk = 'medium';
        else risks.overallRisk = 'low';

        return risks;
    }

    assessAgeRisk(equipmentData) {
        const age = this.calculateEquipmentAge(equipmentData).age;
        if (!age) return { score: 0.3, reason: 'Unknown age', confidence: 'low' };

        const expectedLife = this.getExpectedLifespan(equipmentData.type);
        const lifeRatio = age / expectedLife;

        if (lifeRatio > 0.9) return { score: 0.9, reason: 'Near end of life', confidence: 'high' };
        if (lifeRatio > 0.75) return { score: 0.7, reason: 'Aging equipment', confidence: 'high' };
        if (lifeRatio > 0.5) return { score: 0.4, reason: 'Mid-life equipment', confidence: 'medium' };
        
        return { score: 0.2, reason: 'Relatively new equipment', confidence: 'high' };
    }

    assessEnvironmentalRisk(environmentData) {
        if (!environmentData) {
            return { score: 0.3, reason: 'Unknown environment', confidence: 'low' };
        }

        let riskScore = 0;
        const factors = [];

        // Climate factors
        if (environmentData.extremeTemperatures) {
            riskScore += 0.2;
            factors.push('extreme temperatures');
        }
        
        if (environmentData.highHumidity) {
            riskScore += 0.15;
            factors.push('high humidity');
        }
        
        if (environmentData.saltAir) {
            riskScore += 0.25;
            factors.push('corrosive environment');
        }

        if (environmentData.dusty) {
            riskScore += 0.1;
            factors.push('dusty conditions');
        }

        return {
            score: Math.min(0.9, riskScore),
            reason: factors.length > 0 ? `Environmental factors: ${factors.join(', ')}` : 'Standard environment',
            confidence: 'medium'
        };
    }

    assessUsageRisk(equipmentData) {
        // Assess based on equipment type and typical usage patterns
        const usageProfiles = {
            'furnace': { heavy: 0.6, moderate: 0.3, light: 0.1 },
            'generator': { heavy: 0.8, moderate: 0.4, light: 0.2 },
            'water_heater': { heavy: 0.5, moderate: 0.3, light: 0.1 }
        };

        const profile = usageProfiles[equipmentData.type?.toLowerCase()] || { moderate: 0.3 };
        
        return {
            score: profile.moderate, // Default to moderate usage
            reason: 'Typical usage pattern assumed',
            confidence: 'low'
        };
    }

    assessMaintenanceRisk(equipmentData) {
        // Assess maintenance history (would integrate with service records)
        return {
            score: 0.4, // Default moderate risk
            reason: 'Maintenance history unknown',
            confidence: 'low'
        };
    }

    /**
     * Predict potential failures using AI analysis
     */
    async predictFailures(equipmentData, usagePatterns) {
        const predictions = [];
        const age = this.calculateEquipmentAge(equipmentData).age;
        
        if (!age) {
            return [{
                component: 'Overall system',
                prediction: 'Insufficient data for accurate prediction',
                timeframe: 'unknown',
                confidence: 0.1
            }];
        }

        // Get failure patterns for equipment type
        const failurePatterns = this.failureDatabase[equipmentData.type?.toLowerCase()] || 
                               this.failureDatabase.generic;

        failurePatterns.forEach(pattern => {
            const remainingLife = pattern.averageLifespan - age;
            const failureProbability = this.calculateFailureProbability(age, pattern, usagePatterns);

            if (failureProbability > 0.3) {
                predictions.push({
                    component: pattern.component,
                    prediction: pattern.failureMode,
                    timeframe: this.predictTimeframe(remainingLife, failureProbability),
                    probability: failureProbability,
                    cost: pattern.replacementCost,
                    impact: pattern.systemImpact,
                    confidence: failureProbability * 0.8
                });
            }
        });

        return predictions.sort((a, b) => b.probability - a.probability);
    }

    calculateFailureProbability(age, pattern, usagePatterns) {
        let baseProbability = Math.min(0.9, age / pattern.averageLifespan);
        
        // Adjust for usage patterns
        if (usagePatterns?.heavy) baseProbability *= 1.3;
        if (usagePatterns?.light) baseProbability *= 0.7;
        
        // Add random variation for realistic modeling
        const variation = (Math.random() - 0.5) * 0.2;
        
        return Math.max(0, Math.min(0.95, baseProbability + variation));
    }

    predictTimeframe(remainingLife, probability) {
        if (probability > 0.8) return 'Within 1 year';
        if (probability > 0.6) return '1-2 years';
        if (probability > 0.4) return '2-3 years';
        return '3+ years';
    }

    /**
     * Optimize maintenance schedule based on equipment and predictions
     */
    async optimizeMaintenanceSchedule(equipmentData, usagePatterns) {
        const baseSchedule = this.getBaseMaintenanceSchedule(equipmentData.type);
        const optimizedSchedule = { ...baseSchedule };

        // Adjust based on age
        const age = this.calculateEquipmentAge(equipmentData).age;
        if (age > 10) {
            // Increase frequency for older equipment
            optimizedSchedule.annual = [...optimizedSchedule.annual, 'Detailed component inspection'];
            optimizedSchedule.biannual = optimizedSchedule.biannual || [];
            optimizedSchedule.biannual.push('Performance efficiency test');
        }

        // Adjust based on usage
        if (usagePatterns?.heavy) {
            optimizedSchedule.quarterly = [...(optimizedSchedule.quarterly || []), 'Extra performance check'];
        }

        return {
            schedule: optimizedSchedule,
            reasoning: this.generateScheduleReasoning(equipmentData, age, usagePatterns),
            costSavings: this.estimateMaintenanceSavings(equipmentData, optimizedSchedule)
        };
    }

    getBaseMaintenanceSchedule(equipmentType) {
        const schedules = {
            'furnace': {
                monthly: ['Replace air filter', 'Visual inspection'],
                quarterly: ['Check venting system', 'Inspect electrical connections'],
                annual: ['Professional tune-up', 'Heat exchanger inspection', 'Gas leak test']
            },
            'generator': {
                weekly: ['Exercise run (automatic)', 'Visual inspection'],
                monthly: ['Check oil level', 'Battery test', 'Transfer switch test'],
                quarterly: ['Change oil/filter', 'Air filter replacement'],
                annual: ['Spark plug replacement', 'Complete system inspection']
            },
            'water_heater': {
                monthly: ['Temperature/pressure relief valve test'],
                quarterly: ['Anode rod inspection'],
                annual: ['Tank flush', 'Venting inspection', 'Gas control service']
            }
        };

        return schedules[equipmentType?.toLowerCase()] || schedules.furnace;
    }

    /**
     * Assess component lifespan and replacement timing
     */
    async assessComponentLifespan(equipmentData) {
        const components = this.getEquipmentComponents(equipmentData.type);
        const age = this.calculateEquipmentAge(equipmentData).age;
        
        const lifespanAnalysis = components.map(component => {
            const remainingLife = Math.max(0, component.expectedLife - age);
            const replacementUrgency = this.calculateReplacementUrgency(age, component);
            
            return {
                name: component.name,
                currentAge: age,
                expectedLife: component.expectedLife,
                remainingLife: remainingLife,
                replacementUrgency: replacementUrgency,
                estimatedCost: component.replacementCost,
                impact: component.systemImpact,
                nextAction: this.getNextAction(replacementUrgency, remainingLife)
            };
        });

        return lifespanAnalysis.sort((a, b) => b.replacementUrgency - a.replacementUrgency);
    }

    getEquipmentComponents(equipmentType) {
        const componentLibrary = {
            'furnace': [
                { name: 'Heat Exchanger', expectedLife: 15, replacementCost: '$800-1500', systemImpact: 'critical' },
                { name: 'Ignitor', expectedLife: 4, replacementCost: '$45-85', systemImpact: 'high' },
                { name: 'Gas Valve', expectedLife: 12, replacementCost: '$150-300', systemImpact: 'critical' },
                { name: 'Blower Motor', expectedLife: 10, replacementCost: '$200-400', systemImpact: 'high' },
                { name: 'Control Board', expectedLife: 8, replacementCost: '$250-500', systemImpact: 'critical' },
                { name: 'Pressure Switch', expectedLife: 6, replacementCost: '$50-100', systemImpact: 'high' }
            ],
            'generator': [
                { name: 'Engine', expectedLife: 20, replacementCost: '$2000-4000', systemImpact: 'critical' },
                { name: 'Alternator', expectedLife: 15, replacementCost: '$800-1500', systemImpact: 'critical' },
                { name: 'Control Panel', expectedLife: 10, replacementCost: '$300-600', systemImpact: 'high' },
                { name: 'Battery', expectedLife: 3, replacementCost: '$100-200', systemImpact: 'high' },
                { name: 'Transfer Switch', expectedLife: 12, replacementCost: '$500-1200', systemImpact: 'critical' }
            ],
            'water_heater': [
                { name: 'Gas Control Valve', expectedLife: 8, replacementCost: '$150-300', systemImpact: 'critical' },
                { name: 'Thermocouple', expectedLife: 5, replacementCost: '$25-50', systemImpact: 'high' },
                { name: 'Anode Rod', expectedLife: 3, replacementCost: '$50-100', systemImpact: 'medium' },
                { name: 'Venting System', expectedLife: 15, replacementCost: '$200-500', systemImpact: 'critical' }
            ]
        };

        return componentLibrary[equipmentType?.toLowerCase()] || componentLibrary.furnace;
    }

    calculateReplacementUrgency(currentAge, component) {
        const lifeRatio = currentAge / component.expectedLife;
        
        if (lifeRatio > 1.1) return 0.95; // Overdue
        if (lifeRatio > 0.9) return 0.8;  // Critical
        if (lifeRatio > 0.75) return 0.6; // High
        if (lifeRatio > 0.5) return 0.3;  // Medium
        return 0.1; // Low
    }

    getNextAction(urgency, remainingLife) {
        if (urgency > 0.8) return 'Schedule immediate replacement';
        if (urgency > 0.6) return 'Plan replacement within 6 months';
        if (urgency > 0.3) return 'Monitor closely, plan for replacement';
        return 'Continue normal maintenance';
    }

    /**
     * Analyze cost benefits of proactive maintenance
     */
    async analyzeCostBenefits(equipmentData) {
        const age = this.calculateEquipmentAge(equipmentData).age;
        const equipmentValue = this.estimateEquipmentValue(equipmentData);
        
        const analysis = {
            currentValue: equipmentValue,
            replacementCost: this.estimateReplacementCost(equipmentData),
            maintenanceCost: this.estimateAnnualMaintenance(equipmentData),
            energySavings: this.estimateEnergySavings(equipmentData, age),
            breakdownRisk: this.calculateBreakdownCost(equipmentData),
            recommendation: null
        };

        // Calculate ROI of maintenance vs replacement
        const maintenanceROI = (analysis.energySavings + analysis.breakdownRisk) / analysis.maintenanceCost;
        const replacementROI = analysis.energySavings / (analysis.replacementCost - analysis.currentValue);

        if (maintenanceROI > replacementROI && age < 15) {
            analysis.recommendation = 'maintain';
        } else if (age > 20 || maintenanceROI < 1) {
            analysis.recommendation = 'replace';
        } else {
            analysis.recommendation = 'monitor';
        }

        return analysis;
    }

    /**
     * Generate AI-powered maintenance recommendations
     */
    async generateAIRecommendations(analysis) {
        const recommendations = [];

        // Age-based recommendations
        if (analysis.currentAge.age > 15) {
            recommendations.push({
                type: 'age_concern',
                priority: 'high',
                message: 'Equipment approaching end of typical lifespan - consider replacement planning',
                action: 'Evaluate replacement options and budget planning',
                timeframe: 'Within 1-2 years'
            });
        }

        // Risk-based recommendations
        if (analysis.riskAssessment.overallRisk === 'high') {
            recommendations.push({
                type: 'high_risk',
                priority: 'critical',
                message: 'High failure risk detected - immediate attention required',
                action: 'Schedule professional inspection within 30 days',
                timeframe: 'Immediate'
            });
        }

        // Failure prediction recommendations
        analysis.failurePredictions.forEach(prediction => {
            if (prediction.probability > 0.6) {
                recommendations.push({
                    type: 'failure_prediction',
                    priority: prediction.probability > 0.8 ? 'critical' : 'high',
                    message: `${prediction.component} failure predicted: ${prediction.prediction}`,
                    action: `Prepare for ${prediction.component.toLowerCase()} replacement`,
                    timeframe: prediction.timeframe,
                    cost: prediction.cost
                });
            }
        });

        // Maintenance optimization recommendations
        if (analysis.maintenanceSchedule.reasoning.includes('increase frequency')) {
            recommendations.push({
                type: 'maintenance_optimization',
                priority: 'medium',
                message: 'Maintenance frequency should be increased based on equipment age/usage',
                action: 'Implement enhanced maintenance schedule',
                timeframe: 'Next service cycle'
            });
        }

        // Cost-benefit recommendations
        if (analysis.costAnalysis.recommendation === 'replace') {
            recommendations.push({
                type: 'replacement_advisory',
                priority: 'medium',
                message: 'Cost analysis suggests replacement may be more economical than continued maintenance',
                action: 'Get quotes for new equipment installation',
                timeframe: 'Next 6-12 months'
            });
        }

        return recommendations.sort((a, b) => {
            const priority = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            return priority[b.priority] - priority[a.priority];
        });
    }

    calculatePredictionConfidence(analysis) {
        let confidence = 0;
        let factors = 0;

        // Age data confidence
        if (analysis.currentAge.confidence > 0.7) {
            confidence += 30;
            factors++;
        }

        // Risk assessment confidence
        const avgRiskConfidence = Object.values(analysis.riskAssessment)
            .filter(r => r.confidence)
            .reduce((sum, r) => {
                const confMap = { 'high': 0.9, 'medium': 0.6, 'low': 0.3 };
                return sum + (confMap[r.confidence] || 0.3);
            }, 0) / 4;
        
        confidence += avgRiskConfidence * 40;
        factors++;

        // Failure prediction confidence
        if (analysis.failurePredictions.length > 0) {
            const avgPredictionConf = analysis.failurePredictions
                .reduce((sum, p) => sum + p.confidence, 0) / analysis.failurePredictions.length;
            confidence += avgPredictionConf * 30;
            factors++;
        }

        return factors > 0 ? confidence / factors : 30;
    }

    // Helper methods for cost calculations
    estimateEquipmentValue(equipmentData) {
        const age = this.calculateEquipmentAge(equipmentData).age || 5;
        const originalCost = this.getOriginalCost(equipmentData.type);
        const depreciationRate = 0.08; // 8% per year
        
        return Math.max(originalCost * 0.1, originalCost * Math.pow(1 - depreciationRate, age));
    }

    getOriginalCost(equipmentType) {
        const costs = {
            'furnace': 3500,
            'generator': 5000,
            'water_heater': 1200,
            'air_conditioner': 4000
        };
        return costs[equipmentType?.toLowerCase()] || 3000;
    }

    estimateReplacementCost(equipmentData) {
        return this.getOriginalCost(equipmentData.type) * 1.2; // 20% inflation
    }

    estimateAnnualMaintenance(equipmentData) {
        const costs = {
            'furnace': 200,
            'generator': 400,
            'water_heater': 150,
            'air_conditioner': 250
        };
        return costs[equipmentData.type?.toLowerCase()] || 200;
    }

    estimateEnergySavings(equipmentData, age) {
        if (!age) return 0;
        
        // Older equipment loses efficiency
        const efficiencyLoss = Math.min(0.3, age * 0.02); // 2% per year, max 30%
        const avgEnergyCost = 1500; // Annual energy cost
        
        return avgEnergyCost * efficiencyLoss;
    }

    calculateBreakdownCost(equipmentData) {
        // Average cost of emergency breakdown
        const costs = {
            'furnace': 800,
            'generator': 1200,
            'water_heater': 600,
            'air_conditioner': 900
        };
        return costs[equipmentData.type?.toLowerCase()] || 700;
    }

    getExpectedLifespan(equipmentType) {
        const lifespans = {
            'furnace': 18,
            'generator': 25,
            'water_heater': 10,
            'air_conditioner': 15,
            'boiler': 20
        };
        return lifespans[equipmentType?.toLowerCase()] || 15;
    }

    generateScheduleReasoning(equipmentData, age, usagePatterns) {
        let reasoning = `Based on equipment age (${age || 'unknown'} years)`;
        
        if (age > 10) reasoning += ' and advanced age';
        if (usagePatterns?.heavy) reasoning += ' and heavy usage patterns';
        
        reasoning += ', maintenance frequency has been optimized to prevent failures and maximize efficiency.';
        
        return reasoning;
    }

    estimateMaintenanceSavings(equipmentData, schedule) {
        // Estimate cost savings from optimized maintenance
        const baseMaintenanceCost = this.estimateAnnualMaintenance(equipmentData);
        const breakdownPrevention = this.calculateBreakdownCost(equipmentData) * 0.7; // 70% prevention rate
        
        return breakdownPrevention - baseMaintenanceCost * 0.2; // 20% increase in maintenance cost
    }

    /**
     * Initialize failure pattern database
     */
    initializeFailureDatabase() {
        return {
            furnace: [
                { component: 'Heat Exchanger', averageLifespan: 15, failureMode: 'Cracking/corrosion', replacementCost: '$1200', systemImpact: 'total' },
                { component: 'Ignitor', averageLifespan: 4, failureMode: 'Element burnout', replacementCost: '$65', systemImpact: 'no_heat' },
                { component: 'Gas Valve', averageLifespan: 12, failureMode: 'Actuator failure', replacementCost: '$225', systemImpact: 'no_heat' },
                { component: 'Blower Motor', averageLifespan: 10, failureMode: 'Bearing wear', replacementCost: '$300', systemImpact: 'no_air' },
                { component: 'Control Board', averageLifespan: 8, failureMode: 'Electronic failure', replacementCost: '$375', systemImpact: 'total' }
            ],
            generator: [
                { component: 'Engine', averageLifespan: 20, failureMode: 'Mechanical wear', replacementCost: '$3000', systemImpact: 'total' },
                { component: 'Alternator', averageLifespan: 15, failureMode: 'Winding failure', replacementCost: '$1200', systemImpact: 'no_power' },
                { component: 'Control Panel', averageLifespan: 10, failureMode: 'Electronic failure', replacementCost: '$450', systemImpact: 'no_auto' },
                { component: 'Battery', averageLifespan: 3, failureMode: 'Capacity loss', replacementCost: '$150', systemImpact: 'no_start' }
            ],
            water_heater: [
                { component: 'Gas Control', averageLifespan: 8, failureMode: 'Thermostat failure', replacementCost: '$225', systemImpact: 'no_heat' },
                { component: 'Thermocouple', averageLifespan: 5, failureMode: 'Corrosion/wear', replacementCost: '$40', systemImpact: 'no_heat' },
                { component: 'Anode Rod', averageLifespan: 3, failureMode: 'Consumption', replacementCost: '$75', systemImpact: 'tank_corrosion' }
            ],
            generic: [
                { component: 'Overall System', averageLifespan: 15, failureMode: 'General wear', replacementCost: '$2000', systemImpact: 'varies' }
            ]
        };
    }

    initializeMaintenancePatterns() {
        // Statistical maintenance patterns from industry data
        return {
            optimal: { frequency: 1.0, cost: 1.0, reliability: 0.95 },
            deferred: { frequency: 0.7, cost: 0.8, reliability: 0.75 },
            reactive: { frequency: 0.3, cost: 1.5, reliability: 0.60 }
        };
    }

    initializeRiskFactors() {
        return {
            environmental: {
                coastal: 0.25,      // Salt air corrosion
                industrial: 0.2,    // Pollution/chemicals  
                extreme_cold: 0.15, // Frequent freeze/thaw
                extreme_heat: 0.15, // High temperature stress
                high_humidity: 0.1  // Moisture issues
            },
            usage: {
                continuous: 0.3,    // 24/7 operation
                heavy_seasonal: 0.2, // Heavy winter/summer use
                moderate: 0.1,      // Normal usage
                light: 0.05         // Minimal usage
            },
            maintenance: {
                never: 0.4,         // No maintenance history
                irregular: 0.25,    // Sporadic maintenance
                regular: 0.1,       // Annual maintenance
                optimal: 0.05       // Bi-annual maintenance
            }
        };
    }
}

// Export handler
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod === 'POST') {
        try {
            const { equipmentData, usagePatterns, environmentData, mode = 'technician' } = JSON.parse(event.body);
            
            const analyzer = new PredictiveMaintenanceAI();
            const result = await analyzer.analyzePredictiveMaintenance(
                equipmentData, 
                usagePatterns, 
                environmentData
            );
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result)
            };
            
        } catch (error) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: error.message
                })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};

module.exports = { PredictiveMaintenanceAI };