// netlify/functions/troubleshooting-wizard.js
// Intelligent HVAC troubleshooting wizard with step-by-step diagnostic flowcharts

class TroubleshootingWizard {
    constructor() {
        this.diagnosticFlows = this.initializeDiagnosticFlows();
        this.symptomDatabase = this.initializeSymptomDatabase();
        this.safetyChecks = this.initializeSafetyChecks();
        this.testProcedures = this.initializeTestProcedures();
    }

    /**
     * Start troubleshooting session with symptom analysis
     */
    async startTroubleshooting(symptoms, equipmentData, userLevel = 'homeowner') {
        console.log('🔧 Starting HVAC troubleshooting wizard...');
        
        try {
            const session = {
                sessionId: `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                equipment: equipmentData,
                userLevel: userLevel,
                symptoms: symptoms,
                currentStep: null,
                stepHistory: [],
                diagnosticPath: [],
                recommendations: [],
                safetyWarnings: [],
                confidence: 0
            };

            // Analyze symptoms and determine starting point
            const symptomAnalysis = await this.analyzeSymptoms(symptoms, equipmentData);
            session.diagnosticPath = symptomAnalysis.suggestedPath;
            session.safetyWarnings = symptomAnalysis.safetyWarnings;

            // Start first diagnostic step
            session.currentStep = await this.getNextStep(session);

            console.log(`✅ Troubleshooting session started: ${session.sessionId}`);
            return {
                success: true,
                session: session,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Troubleshooting wizard error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process user response and continue to next step
     */
    async continueSession(sessionId, response, observations = null) {
        try {
            // Load session (in production, this would come from database)
            const session = this.getSession(sessionId);
            if (!session) throw new Error('Session not found');

            // Record current step result
            session.stepHistory.push({
                step: session.currentStep,
                response: response,
                observations: observations,
                timestamp: new Date().toISOString()
            });

            // Determine next step based on response
            const nextStep = await this.determineNextStep(session, response);
            
            if (nextStep.type === 'conclusion') {
                // Troubleshooting complete
                session.currentStep = null;
                session.recommendations = nextStep.recommendations;
                session.confidence = this.calculateDiagnosticConfidence(session);
                
                return {
                    success: true,
                    completed: true,
                    session: session,
                    finalDiagnosis: nextStep
                };
            } else {
                // Continue with next step
                session.currentStep = nextStep;
                
                return {
                    success: true,
                    completed: false,
                    session: session
                };
            }

        } catch (error) {
            console.error('❌ Session continuation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analyze symptoms to determine diagnostic path
     */
    async analyzeSymptoms(symptoms, equipmentData) {
        const analysis = {
            primarySymptom: null,
            suggestedPath: [],
            safetyWarnings: [],
            urgency: 'normal',
            estimatedCauses: []
        };

        // Categorize symptoms
        const categorizedSymptoms = this.categorizeSymptoms(symptoms);
        analysis.primarySymptom = categorizedSymptoms.primary;

        // Check for safety-critical symptoms
        const safetyConcerns = this.checkSafetyCriticalSymptoms(symptoms);
        if (safetyConcerns.length > 0) {
            analysis.safetyWarnings = safetyConcerns;
            analysis.urgency = 'critical';
        }

        // Select appropriate diagnostic flow
        const flowKey = this.selectDiagnosticFlow(categorizedSymptoms, equipmentData);
        analysis.suggestedPath = this.diagnosticFlows[flowKey];

        return analysis;
    }

    categorizeSymptoms(symptoms) {
        const categories = {
            no_heat: ['no heat', 'cold', 'not heating', 'furnace not working'],
            no_cooling: ['no cooling', 'hot', 'ac not working', 'not cooling'],
            strange_noises: ['noise', 'loud', 'grinding', 'squealing', 'banging'],
            electrical: ['no power', 'tripping breaker', 'sparks', 'burning smell'],
            gas_issues: ['gas smell', 'pilot light', 'no ignition', 'yellow flame'],
            airflow: ['weak airflow', 'no air', 'poor circulation'],
            cycling: ['short cycling', 'frequent on/off', 'won\'t stay on']
        };

        let primary = 'general';
        let matches = 0;

        Object.entries(categories).forEach(([category, keywords]) => {
            const categoryMatches = keywords.filter(keyword => 
                symptoms.toLowerCase().includes(keyword)
            ).length;
            
            if (categoryMatches > matches) {
                matches = categoryMatches;
                primary = category;
            }
        });

        return { primary, matches };
    }

    checkSafetyCriticalSymptoms(symptoms) {
        const criticalSymptoms = [
            { keyword: 'gas smell', warning: 'GAS LEAK EMERGENCY - Evacuate immediately and call gas company' },
            { keyword: 'carbon monoxide', warning: 'CO POISONING RISK - Evacuate and ventilate immediately' },
            { keyword: 'sparks', warning: 'ELECTRICAL HAZARD - Turn off power at breaker immediately' },
            { keyword: 'burning smell', warning: 'FIRE RISK - Turn off equipment and investigate immediately' },
            { keyword: 'smoke', warning: 'FIRE HAZARD - Turn off equipment and call fire department if needed' }
        ];

        const warnings = [];
        criticalSymptoms.forEach(item => {
            if (symptoms.toLowerCase().includes(item.keyword)) {
                warnings.push({
                    severity: 'critical',
                    message: item.warning,
                    action: 'STOP TROUBLESHOOTING - Professional help required'
                });
            }
        });

        return warnings;
    }

    selectDiagnosticFlow(categorizedSymptoms, equipmentData) {
        const equipmentType = equipmentData.type?.toLowerCase() || 'furnace';
        const symptom = categorizedSymptoms.primary;
        
        return `${equipmentType}_${symptom}`;
    }

    /**
     * Get next diagnostic step
     */
    async getNextStep(session) {
        const flowKey = `${session.equipment.type}_${session.symptoms}`.toLowerCase();
        const flow = this.diagnosticFlows[flowKey] || this.diagnosticFlows.general_troubleshooting;
        
        if (session.stepHistory.length === 0) {
            return flow.steps[0];
        }

        // Logic to determine next step based on previous responses
        const lastResponse = session.stepHistory[session.stepHistory.length - 1].response;
        const currentStepId = session.currentStep.id;
        
        return this.findNextStep(flow, currentStepId, lastResponse);
    }

    async determineNextStep(session, response) {
        const currentStep = session.currentStep;
        
        // Find next step based on response
        if (currentStep.options) {
            const selectedOption = currentStep.options.find(opt => opt.value === response);
            if (selectedOption && selectedOption.nextStep) {
                return this.getStepById(selectedOption.nextStep, session);
            }
        }

        // If no specific next step, follow default flow
        const flow = this.getCurrentFlow(session);
        return this.getDefaultNextStep(flow, currentStep, response, session);
    }

    getStepById(stepId, session) {
        const flow = this.getCurrentFlow(session);
        return flow.steps.find(step => step.id === stepId) || this.createConclusionStep(session);
    }

    getCurrentFlow(session) {
        const flowKey = `${session.equipment.type}_${session.symptoms}`.toLowerCase();
        return this.diagnosticFlows[flowKey] || this.diagnosticFlows.general_troubleshooting;
    }

    createConclusionStep(session) {
        return {
            type: 'conclusion',
            recommendations: this.generateFinalRecommendations(session)
        };
    }

    generateFinalRecommendations(session) {
        const recommendations = [];
        
        // Analyze troubleshooting path to generate recommendations
        const stepHistory = session.stepHistory;
        const lastResponses = stepHistory.slice(-3);

        // Generate recommendations based on responses
        if (lastResponses.some(h => h.response === 'no' && h.step.category === 'electrical')) {
            recommendations.push({
                type: 'electrical_service',
                priority: 'high',
                message: 'Electrical issue detected - professional electrician recommended',
                action: 'Contact licensed electrician',
                cost: '$150-400'
            });
        }

        if (lastResponses.some(h => h.response === 'yes' && h.step.category === 'gas')) {
            recommendations.push({
                type: 'gas_service',
                priority: 'high',
                message: 'Gas system issue detected - certified gas technician required',
                action: 'Contact certified gas technician',
                cost: '$200-500'
            });
        }

        return recommendations;
    }

    calculateDiagnosticConfidence(session) {
        const stepCount = session.stepHistory.length;
        const completedChecks = session.stepHistory.filter(h => h.response !== 'unknown').length;
        
        return Math.min(95, (completedChecks / stepCount) * 100);
    }

    /**
     * Initialize diagnostic flowcharts for different equipment/symptom combinations
     */
    initializeDiagnosticFlows() {
        return {
            furnace_no_heat: {
                name: 'Gas Furnace - No Heat',
                steps: [
                    {
                        id: 'safety_check',
                        title: 'Initial Safety Check',
                        instruction: 'Before starting, ensure the area is safe',
                        category: 'safety',
                        type: 'checklist',
                        items: [
                            'No gas odor present',
                            'No unusual sounds or sparks', 
                            'Electrical panel main breaker is ON',
                            'Furnace area is clear of obstructions'
                        ],
                        options: [
                            { text: 'All safety checks passed', value: 'safe', nextStep: 'thermostat_check' },
                            { text: 'Safety concern detected', value: 'unsafe', nextStep: 'emergency_stop' }
                        ]
                    },
                    {
                        id: 'thermostat_check',
                        title: 'Thermostat Verification',
                        instruction: 'Check thermostat settings and operation',
                        category: 'basic',
                        type: 'guided_test',
                        steps: [
                            '1. Set thermostat to HEAT mode',
                            '2. Set temperature 5°F above current room temperature',
                            '3. Wait 5 minutes and listen for furnace startup'
                        ],
                        options: [
                            { text: 'Furnace started', value: 'started', nextStep: 'airflow_check' },
                            { text: 'No response from furnace', value: 'no_response', nextStep: 'power_check' }
                        ]
                    },
                    {
                        id: 'power_check',
                        title: 'Electrical Power Check',
                        instruction: 'Verify electrical power to furnace',
                        category: 'electrical',
                        type: 'guided_test',
                        steps: [
                            '1. Check furnace switch (should be ON)',
                            '2. Check circuit breaker at electrical panel',
                            '3. Look for any tripped breakers or blown fuses'
                        ],
                        options: [
                            { text: 'Power issues found and corrected', value: 'power_fixed', nextStep: 'thermostat_check' },
                            { text: 'Power appears normal', value: 'power_ok', nextStep: 'filter_check' },
                            { text: 'Electrical problems persist', value: 'electrical_issue', nextStep: 'electrical_conclusion' }
                        ]
                    },
                    {
                        id: 'filter_check',
                        title: 'Air Filter Inspection',
                        instruction: 'Check and replace air filter if needed',
                        category: 'maintenance',
                        type: 'visual_inspection',
                        guidance: 'A dirty filter can cause safety switches to shut down the furnace',
                        steps: [
                            '1. Locate air filter (usually in return air duct)',
                            '2. Remove filter and hold up to light',
                            '3. If you cannot see light through filter, it needs replacement'
                        ],
                        options: [
                            { text: 'Filter was dirty - replaced', value: 'filter_replaced', nextStep: 'test_operation' },
                            { text: 'Filter appears clean', value: 'filter_ok', nextStep: 'gas_valve_check' }
                        ]
                    },
                    {
                        id: 'gas_valve_check',
                        title: 'Gas Supply Verification',
                        instruction: 'Check gas supply to furnace',
                        category: 'gas',
                        type: 'guided_test',
                        safety_warning: 'If you smell gas at any point, STOP and call gas company immediately',
                        steps: [
                            '1. Locate gas shutoff valve near furnace',
                            '2. Verify valve handle is parallel to pipe (ON position)',
                            '3. Check other gas appliances (water heater, stove) for operation'
                        ],
                        options: [
                            { text: 'Gas supply confirmed', value: 'gas_ok', nextStep: 'ignition_sequence' },
                            { text: 'No gas to other appliances', value: 'no_gas', nextStep: 'gas_service_conclusion' },
                            { text: 'Gas smell detected', value: 'gas_leak', nextStep: 'emergency_gas' }
                        ]
                    },
                    {
                        id: 'ignition_sequence',
                        title: 'Ignition System Test',
                        instruction: 'Observe furnace ignition sequence',
                        category: 'advanced',
                        type: 'observation',
                        userLevel: 'technician',
                        guidance: 'This test requires observing internal components - technician level only',
                        steps: [
                            '1. Set thermostat to call for heat',
                            '2. Observe ignition sequence through inspection window',
                            '3. Look for: Draft inducer → Ignitor glow → Gas valve opening → Ignition'
                        ],
                        options: [
                            { text: 'Normal ignition sequence', value: 'ignition_ok', nextStep: 'flame_sensor_check' },
                            { text: 'Ignitor glows but no gas ignition', value: 'no_ignition', nextStep: 'gas_valve_conclusion' },
                            { text: 'No ignitor glow', value: 'no_ignitor', nextStep: 'ignitor_conclusion' },
                            { text: 'Cannot safely observe', value: 'cannot_observe', nextStep: 'professional_needed' }
                        ]
                    }
                ]
            },

            generator_no_start: {
                name: 'Generator - Will Not Start',
                steps: [
                    {
                        id: 'battery_check',
                        title: 'Battery and Connections Check',
                        instruction: 'Verify battery condition and connections',
                        category: 'electrical',
                        type: 'guided_test',
                        steps: [
                            '1. Check battery terminals for corrosion or looseness',
                            '2. Test battery voltage with multimeter (should be 12.6V+)',
                            '3. Check battery charger operation (LED indicator)'
                        ],
                        options: [
                            { text: 'Battery and connections OK', value: 'battery_ok', nextStep: 'fuel_check' },
                            { text: 'Battery issues found', value: 'battery_problem', nextStep: 'battery_service' },
                            { text: 'Cannot test battery safely', value: 'cannot_test', nextStep: 'professional_needed' }
                        ]
                    },
                    {
                        id: 'fuel_check',
                        title: 'Fuel Supply Verification',
                        instruction: 'Check fuel level and supply',
                        category: 'fuel',
                        type: 'visual_inspection',
                        steps: [
                            '1. Check fuel gauge or sight glass',
                            '2. Verify fuel shutoff valve is open',
                            '3. Look for any fuel leaks or damage to fuel lines'
                        ],
                        options: [
                            { text: 'Adequate fuel supply', value: 'fuel_ok', nextStep: 'control_panel_check' },
                            { text: 'Low fuel or supply issues', value: 'fuel_problem', nextStep: 'fuel_service' },
                            { text: 'Fuel leak detected', value: 'fuel_leak', nextStep: 'emergency_fuel' }
                        ]
                    }
                ]
            },

            water_heater_no_hot_water: {
                name: 'Water Heater - No Hot Water',
                steps: [
                    {
                        id: 'pilot_light_check',
                        title: 'Pilot Light Inspection',
                        instruction: 'Check pilot light status',
                        category: 'gas',
                        type: 'visual_inspection',
                        steps: [
                            '1. Remove access panel at bottom of water heater',
                            '2. Look through sight window for blue pilot flame',
                            '3. Check pilot light instruction label on tank'
                        ],
                        options: [
                            { text: 'Pilot light is burning (blue flame)', value: 'pilot_on', nextStep: 'thermostat_check' },
                            { text: 'No pilot light', value: 'pilot_out', nextStep: 'pilot_relight' },
                            { text: 'Yellow or weak pilot flame', value: 'pilot_weak', nextStep: 'thermocouple_check' }
                        ]
                    }
                ]
            },

            general_troubleshooting: {
                name: 'General HVAC Troubleshooting',
                steps: [
                    {
                        id: 'basic_checks',
                        title: 'Basic System Checks',
                        instruction: 'Perform fundamental system verification',
                        category: 'basic',
                        type: 'checklist',
                        items: [
                            'Thermostat set correctly and has power',
                            'Circuit breakers are not tripped',
                            'Equipment switches are in ON position',
                            'Air filter is not severely blocked'
                        ],
                        options: [
                            { text: 'All basic checks passed', value: 'basics_ok', nextStep: 'symptom_specific' },
                            { text: 'Issues found and corrected', value: 'basics_fixed', nextStep: 'test_operation' },
                            { text: 'Problems persist', value: 'basics_failed', nextStep: 'professional_needed' }
                        ]
                    }
                ]
            }
        };
    }

    /**
     * Initialize symptom database with common issues
     */
    initializeSymptomDatabase() {
        return {
            no_heat: {
                common_causes: [
                    'Thermostat settings incorrect',
                    'Tripped circuit breaker',
                    'Dirty air filter',
                    'Pilot light out (older units)',
                    'Ignitor failure',
                    'Gas valve malfunction',
                    'Flame sensor dirty'
                ],
                initial_checks: ['thermostat', 'power', 'filter', 'gas_supply'],
                safety_concerns: ['gas_leak', 'electrical_hazard']
            },
            
            strange_noises: {
                noise_types: {
                    'grinding': { likely_cause: 'Blower motor bearings', urgency: 'high' },
                    'squealing': { likely_cause: 'Belt or motor', urgency: 'medium' },
                    'banging': { likely_cause: 'Ductwork expansion', urgency: 'low' },
                    'clicking': { likely_cause: 'Electrical components', urgency: 'medium' }
                }
            },

            electrical_issues: {
                symptoms: ['tripping_breaker', 'no_power', 'sparks', 'burning_smell'],
                safety_level: 'critical',
                professional_required: true
            }
        };
    }

    /**
     * Initialize safety check procedures
     */
    initializeSafetyChecks() {
        return {
            gas_safety: [
                'Check for gas odor before starting any work',
                'Ensure proper ventilation in work area',
                'Have gas shutoff valve location identified',
                'Know emergency contact numbers'
            ],
            electrical_safety: [
                'Turn off power at breaker before electrical work',
                'Use proper PPE (safety glasses, insulated tools)',
                'Test circuits with meter before touching',
                'Never work on live electrical components'
            ],
            general_safety: [
                'Use proper ladder safety when accessing equipment',
                'Wear appropriate protective equipment',
                'Have fire extinguisher nearby',
                'Work with adequate lighting'
            ]
        };
    }

    /**
     * Initialize test procedures database
     */
    initializeTestProcedures() {
        return {
            voltage_test: {
                equipment: 'Digital multimeter',
                steps: [
                    'Set meter to AC voltage (VAC)',
                    'Test at electrical disconnect',
                    'Verify voltage matches equipment nameplate',
                    'Record readings for analysis'
                ],
                safety: 'Use proper PPE and test procedures'
            },
            
            gas_pressure_test: {
                equipment: 'Manometer and pressure gauge',
                steps: [
                    'Connect manometer to test port',
                    'Turn on appliance and measure inlet pressure',
                    'Compare to manufacturer specifications',
                    'Check manifold pressure during operation'
                ],
                safety: 'Qualified technician only - gas system testing'
            },

            airflow_test: {
                equipment: 'Anemometer or magnahelic gauge',
                steps: [
                    'Measure static pressure at furnace',
                    'Test airflow at supply registers',
                    'Check return air flow',
                    'Calculate total system airflow'
                ],
                notes: 'Proper airflow is critical for efficient operation'
            }
        };
    }

    /**
     * Get session data (in production, this would be database lookup)
     */
    getSession(sessionId) {
        // Placeholder - in production, retrieve from database
        return {
            sessionId: sessionId,
            equipment: { type: 'furnace' },
            symptoms: 'no_heat',
            userLevel: 'homeowner',
            stepHistory: [],
            currentStep: null
        };
    }

    findNextStep(flow, currentStepId, response) {
        // Find next step in flow based on current step and response
        const currentStepIndex = flow.steps.findIndex(step => step.id === currentStepId);
        
        if (currentStepIndex < flow.steps.length - 1) {
            return flow.steps[currentStepIndex + 1];
        }
        
        return this.createConclusionStep({ stepHistory: [] });
    }

    getDefaultNextStep(flow, currentStep, response, session) {
        // Default next step logic
        if (response === 'problem_solved') {
            return {
                type: 'conclusion',
                recommendations: [{
                    type: 'success',
                    message: 'Problem resolved through troubleshooting',
                    action: 'Continue normal operation'
                }]
            };
        }

        // Continue to next step in flow
        return this.findNextStep(flow, currentStep.id, response);
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
            const { action, ...params } = JSON.parse(event.body);
            
            const wizard = new TroubleshootingWizard();
            let result = {};
            
            switch (action) {
                case 'start':
                    result = await wizard.startTroubleshooting(
                        params.symptoms, 
                        params.equipmentData, 
                        params.userLevel
                    );
                    break;
                case 'continue':
                    result = await wizard.continueSession(
                        params.sessionId, 
                        params.response, 
                        params.observations
                    );
                    break;
                default:
                    throw new Error('Invalid action');
            }
            
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

module.exports = { TroubleshootingWizard };