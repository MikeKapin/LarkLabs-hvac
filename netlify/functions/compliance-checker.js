// netlify/functions/compliance-checker.js
// CSA B149.1 and HVAC installation compliance checker using photo analysis

class InstallationComplianceChecker {
    constructor() {
        this.codeDatabase = this.initializeCodeDatabase();
        this.complianceRules = this.initializeComplianceRules();
        this.safetyChecklist = this.initializeSafetyChecklist();
    }

    /**
     * Analyze installation photos for code compliance
     */
    async checkInstallationCompliance(photos, equipmentData, installationType = 'residential') {
        console.log('🏗️ Starting installation compliance check...');
        
        try {
            const analysis = {
                overallCompliance: 'unknown',
                codeViolations: [],
                safetyIssues: [],
                recommendations: [],
                clearanceChecks: {},
                ventingAnalysis: {},
                electricalCompliance: {},
                gasComplianceChecks: {},
                confidence: 0
            };

            // Analyze each photo for compliance issues
            const photoAnalyses = await this.analyzePhotosForCompliance(photos, equipmentData);
            
            // Check specific compliance areas
            analysis.clearanceChecks = await this.checkClearances(photoAnalyses, equipmentData);
            analysis.ventingAnalysis = await this.checkVenting(photoAnalyses, equipmentData);
            analysis.electricalCompliance = await this.checkElectricalCompliance(photoAnalyses, equipmentData);
            analysis.gasComplianceChecks = await this.checkGasCompliance(photoAnalyses, equipmentData);
            
            // Compile violations and issues
            analysis.codeViolations = this.compileCodeViolations(analysis);
            analysis.safetyIssues = this.compileSafetyIssues(analysis);
            
            // Generate recommendations
            analysis.recommendations = await this.generateComplianceRecommendations(analysis, installationType);
            
            // Determine overall compliance
            analysis.overallCompliance = this.determineOverallCompliance(analysis);
            analysis.confidence = this.calculateComplianceConfidence(analysis, photoAnalyses);

            console.log(`✅ Compliance check complete. Status: ${analysis.overallCompliance}`);
            
            return {
                success: true,
                analysis: analysis,
                photoCount: photos.length,
                equipmentType: equipmentData.type,
                installationType: installationType,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Compliance check error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analyze photos for compliance using Claude Vision
     */
    async analyzePhotosForCompliance(photos, equipmentData) {
        const analyses = [];
        const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
        const fetch = (await import('node-fetch')).default;

        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            console.log(`🔍 Analyzing photo ${i + 1} for compliance...`);

            try {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: "claude-3-5-sonnet-20241022",
                        max_tokens: 1500,
                        temperature: 0.05,
                        system: this.createComplianceAnalysisPrompt(equipmentData),
                        messages: [{
                            role: "user",
                            content: [{
                                type: "text",
                                text: "Analyze this HVAC installation photo for CSA B149.1 code compliance. Check clearances, venting, electrical connections, and safety requirements."
                            }, {
                                type: "image",
                                source: {
                                    type: "base64",
                                    media_type: "image/jpeg",
                                    data: photo.imageData
                                }
                            }]
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`Compliance analysis failed: ${response.status}`);
                }

                const data = await response.json();
                analyses.push({
                    photoIndex: i,
                    analysis: data.content[0].text,
                    extractedData: this.extractComplianceData(data.content[0].text)
                });

            } catch (error) {
                console.warn(`⚠️ Failed to analyze photo ${i + 1} for compliance:`, error);
                analyses.push({
                    photoIndex: i,
                    error: error.message
                });
            }
        }

        return analyses;
    }

    createComplianceAnalysisPrompt(equipmentData) {
        return `You are a certified HVAC inspector analyzing installation compliance with CSA B149.1 (Canadian gas code) and applicable electrical codes.

EQUIPMENT TYPE: ${equipmentData.type || 'Unknown'}
FUEL TYPE: ${equipmentData.gasInput ? 'Gas appliance' : 'Electric'}

CRITICAL INSPECTION AREAS:

**CLEARANCES (CSA B149.1 Section 7):**
- Minimum clearances to combustibles
- Clearances for service access
- Clearances from property lines
- Outdoor unit clearances

**VENTING SYSTEM (CSA B149.1 Section 8):**
- Proper vent materials and sizing
- Vent termination location and clearances
- Condensate drainage (condensing units)
- Air intake requirements

**GAS PIPING (CSA B149.1 Section 6):**
- Proper pipe materials and sizing
- Support and protection requirements
- Shut-off valve location and accessibility
- Gas leak testing evidence

**ELECTRICAL (CSA C22.1):**
- Proper disconnect location
- Conduit and wiring methods
- Grounding and bonding
- Circuit protection sizing

**SAFETY REQUIREMENTS:**
- CO detector placement
- Proper equipment labeling
- Emergency shutoff accessibility
- Manufacturer installation requirements

ANALYZE THIS PHOTO and identify:
1. Any code violations or non-compliance issues
2. Safety concerns requiring immediate attention
3. Clearance measurements (estimate if visible)
4. Proper installation practices observed
5. Areas requiring professional verification

Format your response with clear sections for violations, compliance items, and recommendations.`;
    }

    extractComplianceData(analysisText) {
        const data = {
            violations: [],
            compliance: [],
            clearances: {},
            venting: {},
            electrical: {},
            gas: {},
            safety: {}
        };

        // Extract violations
        const violationMatches = analysisText.matchAll(/(?:violation|non-compliant|incorrect|improper)[:\s]*([^\n\r]+)/gi);
        for (const match of violationMatches) {
            data.violations.push(match[1].trim());
        }

        // Extract compliance items
        const complianceMatches = analysisText.matchAll(/(?:compliant|correct|proper|meets)[:\s]*([^\n\r]+)/gi);
        for (const match of complianceMatches) {
            data.compliance.push(match[1].trim());
        }

        // Extract clearance measurements
        const clearanceMatches = analysisText.matchAll(/(\d+)\s*(?:inch|in|foot|ft|mm|cm)\s*(?:clearance|from|to)/gi);
        for (const match of clearanceMatches) {
            data.clearances[`measurement_${Object.keys(data.clearances).length + 1}`] = `${match[1]}${match[2]}`;
        }

        return data;
    }

    /**
     * Check clearance requirements
     */
    async checkClearances(photoAnalyses, equipmentData) {
        const clearanceCheck = {
            status: 'unknown',
            requiredClearances: this.getRequiredClearances(equipmentData),
            observedClearances: {},
            violations: [],
            compliant: []
        };

        // Extract clearance observations from photo analyses
        photoAnalyses.forEach(analysis => {
            if (analysis.extractedData?.clearances) {
                Object.assign(clearanceCheck.observedClearances, analysis.extractedData.clearances);
            }
        });

        // Compare observed vs required
        this.compareClearances(clearanceCheck);

        return clearanceCheck;
    }

    getRequiredClearances(equipmentData) {
        const type = equipmentData.type?.toLowerCase();
        
        const clearanceRequirements = {
            'gas_furnace': {
                front: '24 inches (service access)',
                sides: '6 inches minimum',
                top: '12 inches minimum',
                combustibles: '6 inches from sides, 1 inch from top'
            },
            'generator': {
                sides: '18 inches minimum',
                front: '36 inches (service access)',
                top: '36 inches minimum',
                exhaust: '5 feet from windows/doors'
            },
            'water_heater': {
                front: '24 inches (service access)',
                sides: '6 inches minimum',
                top: '18 inches minimum',
                flue: '6 inches from combustibles'
            }
        };

        return clearanceRequirements[type] || clearanceRequirements.gas_furnace;
    }

    compareClearances(clearanceCheck) {
        // Compare observed vs required clearances
        Object.entries(clearanceCheck.requiredClearances).forEach(([location, requirement]) => {
            const observed = clearanceCheck.observedClearances[location];
            
            if (observed) {
                const requiredValue = this.parseDistance(requirement);
                const observedValue = this.parseDistance(observed);
                
                if (observedValue < requiredValue) {
                    clearanceCheck.violations.push({
                        location: location,
                        required: requirement,
                        observed: observed,
                        severity: 'code_violation'
                    });
                } else {
                    clearanceCheck.compliant.push({
                        location: location,
                        status: 'compliant'
                    });
                }
            }
        });

        clearanceCheck.status = clearanceCheck.violations.length > 0 ? 'violations_found' : 'compliant';
    }

    parseDistance(distanceString) {
        const match = distanceString.match(/(\d+)\s*(?:inch|in|foot|ft)/i);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            return unit.startsWith('f') ? value * 12 : value; // Convert to inches
        }
        return 0;
    }

    /**
     * Check venting system compliance
     */
    async checkVenting(photoAnalyses, equipmentData) {
        const ventingCheck = {
            status: 'unknown',
            requirements: this.getVentingRequirements(equipmentData),
            observations: [],
            violations: [],
            compliant: []
        };

        // Extract venting observations
        photoAnalyses.forEach(analysis => {
            if (analysis.extractedData?.venting) {
                ventingCheck.observations.push(...Object.values(analysis.extractedData.venting));
            }
        });

        // Check against requirements
        this.checkVentingCompliance(ventingCheck, equipmentData);

        return ventingCheck;
    }

    getVentingRequirements(equipmentData) {
        const type = equipmentData.type?.toLowerCase();
        
        const requirements = {
            'gas_furnace': [
                'Vent must terminate above roof line',
                'Minimum 3 feet from forced air intakes',
                'Proper vent materials (Type B or approved)',
                'Condensate drainage for condensing units'
            ],
            'generator': [
                'Exhaust must terminate outdoors',
                'Minimum 5 feet from windows/doors/intakes',
                'Proper exhaust pipe materials',
                'Rain cap required on exhaust termination'
            ],
            'water_heater': [
                'Vent must slope upward to chimney',
                'Single-wall connector maximum 6 feet',
                'Proper vent connector materials',
                'Draft hood properly connected'
            ]
        };

        return requirements[type] || requirements.gas_furnace;
    }

    checkVentingCompliance(ventingCheck, equipmentData) {
        // Simplified compliance checking based on observations
        ventingCheck.requirements.forEach(requirement => {
            const hasEvidence = ventingCheck.observations.some(obs => 
                obs.toLowerCase().includes(requirement.toLowerCase().split(' ')[0])
            );
            
            if (hasEvidence) {
                ventingCheck.compliant.push(requirement);
            } else {
                ventingCheck.violations.push({
                    requirement: requirement,
                    severity: 'review_required',
                    note: 'Could not verify from photos - inspection recommended'
                });
            }
        });

        ventingCheck.status = ventingCheck.violations.length > 0 ? 'review_required' : 'appears_compliant';
    }

    /**
     * Check electrical compliance
     */
    async checkElectricalCompliance(photoAnalyses, equipmentData) {
        const electricalCheck = {
            status: 'unknown',
            requirements: this.getElectricalRequirements(equipmentData),
            violations: [],
            compliant: [],
            observations: []
        };

        // Extract electrical observations
        photoAnalyses.forEach(analysis => {
            if (analysis.extractedData?.electrical) {
                electricalCheck.observations.push(analysis.extractedData.electrical);
            }
        });

        return electricalCheck;
    }

    getElectricalRequirements(equipmentData) {
        return [
            'Dedicated circuit with proper amperage',
            'Disconnect within sight of equipment',
            'Proper conductor sizing for load',
            'Equipment grounding and bonding',
            'GFCI protection where required'
        ];
    }

    /**
     * Check gas system compliance  
     */
    async checkGasCompliance(photoAnalyses, equipmentData) {
        const gasCheck = {
            status: 'unknown',
            requirements: this.getGasRequirements(equipmentData),
            violations: [],
            compliant: [],
            observations: []
        };

        if (!equipmentData.gasInput) {
            gasCheck.status = 'not_applicable';
            return gasCheck;
        }

        // Extract gas system observations
        photoAnalyses.forEach(analysis => {
            if (analysis.extractedData?.gas) {
                gasCheck.observations.push(analysis.extractedData.gas);
            }
        });

        return gasCheck;
    }

    getGasRequirements(equipmentData) {
        return [
            'Approved gas piping materials',
            'Proper pipe sizing for input rating',
            'Manual shutoff valve within 6 feet',
            'Drip leg at equipment connection',
            'Gas leak testing completed',
            'Proper support and protection'
        ];
    }

    /**
     * Compile all code violations
     */
    compileCodeViolations(analysis) {
        const violations = [];

        // Clearance violations
        if (analysis.clearanceChecks.violations) {
            violations.push(...analysis.clearanceChecks.violations.map(v => ({
                ...v,
                code: 'CSA B149.1 Section 7',
                category: 'clearances'
            })));
        }

        // Venting violations
        if (analysis.ventingAnalysis.violations) {
            violations.push(...analysis.ventingAnalysis.violations.map(v => ({
                ...v,
                code: 'CSA B149.1 Section 8',
                category: 'venting'
            })));
        }

        // Electrical violations
        if (analysis.electricalCompliance.violations) {
            violations.push(...analysis.electricalCompliance.violations.map(v => ({
                ...v,
                code: 'CSA C22.1',
                category: 'electrical'
            })));
        }

        // Gas violations
        if (analysis.gasComplianceChecks.violations) {
            violations.push(...analysis.gasComplianceChecks.violations.map(v => ({
                ...v,
                code: 'CSA B149.1 Section 6',
                category: 'gas_piping'
            })));
        }

        return violations;
    }

    /**
     * Compile safety issues
     */
    compileSafetyIssues(analysis) {
        const issues = [];

        // Critical safety issues
        analysis.codeViolations.forEach(violation => {
            if (violation.severity === 'critical' || violation.severity === 'code_violation') {
                issues.push({
                    type: 'code_violation',
                    description: violation.requirement || violation.note,
                    severity: 'high',
                    action: 'Immediate correction required',
                    code: violation.code
                });
            }
        });

        // Add specific safety checks
        if (analysis.ventingAnalysis.violations?.some(v => v.requirement.includes('termination'))) {
            issues.push({
                type: 'venting_safety',
                description: 'Vent termination may not meet safety requirements',
                severity: 'high',
                action: 'Professional venting inspection required'
            });
        }

        return issues;
    }

    /**
     * Generate compliance recommendations
     */
    async generateComplianceRecommendations(analysis, installationType) {
        const recommendations = [];

        // Critical violations - immediate action
        const criticalViolations = analysis.codeViolations.filter(v => v.severity === 'critical');
        if (criticalViolations.length > 0) {
            recommendations.push({
                priority: 'critical',
                category: 'safety',
                message: `${criticalViolations.length} critical code violations detected`,
                action: 'Stop operation immediately - professional correction required',
                timeframe: 'Immediate',
                cost: 'Varies by violation'
            });
        }

        // Code violations requiring correction
        const codeViolations = analysis.codeViolations.filter(v => v.severity === 'code_violation');
        if (codeViolations.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'compliance',
                message: `${codeViolations.length} code violations require correction`,
                action: 'Schedule corrections before next inspection',
                timeframe: 'Within 30 days',
                cost: '$200-2000 depending on violations'
            });
        }

        // Review required items
        const reviewItems = analysis.codeViolations.filter(v => v.severity === 'review_required');
        if (reviewItems.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'verification',
                message: `${reviewItems.length} items require professional verification`,
                action: 'Schedule inspection with certified technician',
                timeframe: 'Next service visit',
                cost: '$150-300 inspection fee'
            });
        }

        // Preventive recommendations
        if (analysis.overallCompliance === 'compliant') {
            recommendations.push({
                priority: 'low',
                category: 'maintenance',
                message: 'Installation appears compliant - maintain current standards',
                action: 'Continue regular maintenance schedule',
                timeframe: 'Ongoing',
                cost: 'Normal maintenance costs'
            });
        }

        return recommendations;
    }

    /**
     * Determine overall compliance status
     */
    determineOverallCompliance(analysis) {
        const criticalViolations = analysis.codeViolations.filter(v => v.severity === 'critical').length;
        const codeViolations = analysis.codeViolations.filter(v => v.severity === 'code_violation').length;
        const safetyIssues = analysis.safetyIssues.filter(i => i.severity === 'high').length;

        if (criticalViolations > 0 || safetyIssues > 0) {
            return 'non_compliant';
        }
        
        if (codeViolations > 0) {
            return 'violations_found';
        }

        const reviewItems = analysis.codeViolations.filter(v => v.severity === 'review_required').length;
        if (reviewItems > 2) {
            return 'review_required';
        }

        return 'appears_compliant';
    }

    calculateComplianceConfidence(analysis, photoAnalyses) {
        let confidence = 0;
        let factors = 0;

        // Photo quality factor
        const successfulAnalyses = photoAnalyses.filter(a => !a.error).length;
        confidence += (successfulAnalyses / photoAnalyses.length) * 40;
        factors++;

        // Data completeness factor
        const dataCompleteness = this.assessDataCompleteness(analysis);
        confidence += dataCompleteness * 30;
        factors++;

        // Equipment identification factor
        if (analysis.clearanceChecks.requiredClearances) {
            confidence += 20;
            factors++;
        }

        // Specific findings factor
        const totalFindings = analysis.codeViolations.length + 
                             analysis.safetyIssues.length + 
                             (analysis.clearanceChecks.compliant?.length || 0);
        if (totalFindings > 3) {
            confidence += 10;
            factors++;
        }

        return factors > 0 ? confidence / factors : 50;
    }

    assessDataCompleteness(analysis) {
        let completeness = 0;
        const areas = ['clearanceChecks', 'ventingAnalysis', 'electricalCompliance', 'gasComplianceChecks'];
        
        areas.forEach(area => {
            if (analysis[area] && Object.keys(analysis[area]).length > 2) {
                completeness += 0.25;
            }
        });

        return completeness;
    }

    /**
     * Initialize code database
     */
    initializeCodeDatabase() {
        return {
            'CSA_B149_1': {
                section_6: {
                    title: 'Gas Piping Systems',
                    requirements: [
                        'Approved materials only',
                        'Proper sizing calculations',
                        'Support every 6 feet horizontal',
                        'Manual shutoff within 6 feet of appliance'
                    ]
                },
                section_7: {
                    title: 'Installation of Appliances',
                    requirements: [
                        'Clearances to combustible materials',
                        'Service access clearances',
                        'Outdoor clearances from property lines',
                        'Manufacturer clearance requirements'
                    ]
                },
                section_8: {
                    title: 'Venting Systems',
                    requirements: [
                        'Proper vent materials',
                        'Correct sizing and slope',
                        'Termination location requirements',
                        'Condensate drainage provisions'
                    ]
                }
            },
            'CSA_C22_1': {
                section_26: {
                    title: 'Installation of Equipment',
                    requirements: [
                        'Dedicated circuits for major appliances',
                        'Disconnect within sight',
                        'Proper conductor sizing',
                        'Equipment grounding'
                    ]
                }
            }
        };
    }

    initializeComplianceRules() {
        return {
            clearances: {
                gas_furnace: { front: 24, sides: 6, top: 12 },
                generator: { front: 36, sides: 18, top: 36 },
                water_heater: { front: 24, sides: 6, top: 18 }
            },
            venting: {
                termination_height: 12, // inches above roof
                clearance_from_openings: 36, // inches
                vent_connector_length: 72 // inches maximum
            },
            electrical: {
                disconnect_distance: 120, // inches maximum
                minimum_wire_size: 14, // AWG
                gfci_required: ['outdoor', 'basement', 'garage']
            }
        };
    }

    initializeSafetyChecklist() {
        return {
            gas_equipment: [
                'Gas leak test completed',
                'Proper combustion air supply',
                'CO detector installed and functional',
                'Manual shutoff accessible',
                'Vent system integrity verified'
            ],
            electrical: [
                'GFCI protection where required',
                'Proper equipment grounding',
                'Conductor sizing adequate',
                'Disconnect properly labeled'
            ],
            general: [
                'Installation per manufacturer instructions',
                'Local permits obtained',
                'Final inspection completed',
                'Equipment properly labeled'
            ]
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
            const { photos, equipmentData, installationType = 'residential' } = JSON.parse(event.body);
            
            const checker = new InstallationComplianceChecker();
            const result = await checker.checkInstallationCompliance(photos, equipmentData, installationType);
            
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

module.exports = { InstallationComplianceChecker };