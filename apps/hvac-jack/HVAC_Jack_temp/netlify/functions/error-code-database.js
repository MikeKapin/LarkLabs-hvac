// netlify/functions/error-code-database.js
// Comprehensive HVAC error code database with diagnostic procedures

class ErrorCodeDatabase {
    constructor() {
        this.errorCodes = this.initializeErrorCodeDatabase();
        this.diagnosticFlows = this.initializeDiagnosticFlows();
    }

    /**
     * Get error codes for specific brand/model
     */
    getErrorCodes(brand, model, equipmentType) {
        const brandKey = brand?.toLowerCase();
        const typeKey = equipmentType?.toLowerCase();
        
        // Try brand-specific codes first
        if (this.errorCodes[brandKey]) {
            return this.errorCodes[brandKey];
        }
        
        // Fall back to generic codes by equipment type
        if (this.errorCodes.generic[typeKey]) {
            return this.errorCodes.generic[typeKey];
        }
        
        // Return generic HVAC codes
        return this.errorCodes.generic.hvac;
    }

    /**
     * Get diagnostic flow for specific error
     */
    getDiagnosticFlow(errorCode, brand, equipmentType) {
        const flow = this.diagnosticFlows[errorCode] || this.diagnosticFlows.generic;
        return {
            ...flow,
            customized: true,
            brand: brand,
            equipmentType: equipmentType
        };
    }

    /**
     * Search error codes by symptoms
     */
    searchBySymptoms(symptoms) {
        const results = [];
        const searchTerms = symptoms.toLowerCase().split(' ');
        
        Object.values(this.errorCodes).forEach(brandCodes => {
            if (Array.isArray(brandCodes)) {
                brandCodes.forEach(code => {
                    const matchScore = this.calculateSymptomMatch(code, searchTerms);
                    if (matchScore > 0.3) {
                        results.push({ ...code, matchScore });
                    }
                });
            } else if (typeof brandCodes === 'object') {
                Object.values(brandCodes).forEach(typeCodes => {
                    if (Array.isArray(typeCodes)) {
                        typeCodes.forEach(code => {
                            const matchScore = this.calculateSymptomMatch(code, searchTerms);
                            if (matchScore > 0.3) {
                                results.push({ ...code, matchScore });
                            }
                        });
                    }
                });
            }
        });
        
        return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
    }

    calculateSymptomMatch(code, searchTerms) {
        const description = `${code.description} ${code.symptoms || ''} ${code.causes || ''}`.toLowerCase();
        let matches = 0;
        
        searchTerms.forEach(term => {
            if (description.includes(term)) matches++;
        });
        
        return matches / searchTerms.length;
    }

    /**
     * Initialize comprehensive error code database
     */
    initializeErrorCodeDatabase() {
        return {
            // Carrier/Bryant error codes
            carrier: [
                {
                    code: "31", category: "Pressure Switch", severity: "high",
                    description: "Pressure switch stuck closed",
                    symptoms: "No ignition, blower runs but no heat",
                    causes: ["Stuck pressure switch", "Blocked inducer", "Control board failure"],
                    diagnosticSteps: ["Check pressure switch operation", "Inspect inducer motor", "Test control board"],
                    safetyNotes: "Turn off gas supply before testing pressure switch"
                },
                {
                    code: "33", category: "Pressure Switch", severity: "high", 
                    description: "Pressure switch stuck open",
                    symptoms: "No ignition, inducer won't start",
                    causes: ["Failed pressure switch", "Blocked venting", "Inducer motor failure"],
                    diagnosticSteps: ["Test pressure switch continuity", "Check vent system", "Test inducer motor"],
                    safetyNotes: "Verify proper venting before operation"
                },
                {
                    code: "41", category: "Flame Sensor", severity: "medium",
                    description: "Flame sense error",
                    symptoms: "Ignites then shuts down after few seconds",
                    causes: ["Dirty flame sensor", "Poor flame sensor ground", "Weak gas pressure"],
                    diagnosticSteps: ["Clean flame sensor", "Check electrical connections", "Test gas pressure"],
                    safetyNotes: "Always test for gas leaks after service"
                },
                {
                    code: "42", category: "Flame Sensor", severity: "medium",
                    description: "Flame detected when no call for heat", 
                    symptoms: "False flame detection, unit locks out",
                    causes: ["Dirty burner", "Cracked heat exchanger", "Control board issue"],
                    diagnosticSteps: ["Inspect heat exchanger", "Clean burner assembly", "Test control board"],
                    safetyNotes: "DANGER: Cracked heat exchanger poses CO risk"
                }
            ],

            // Trane error codes  
            trane: [
                {
                    code: "79", category: "High Pressure", severity: "high",
                    description: "High pressure lockout",
                    symptoms: "Unit shuts down, high head pressure",
                    causes: ["Dirty condenser", "Overcharge", "Bad TXV", "Blocked airflow"],
                    diagnosticSteps: ["Check condenser coil", "Verify refrigerant charge", "Test airflow"],
                    safetyNotes: "Allow system to equalize before service"
                },
                {
                    code: "81", category: "Low Pressure", severity: "medium",
                    description: "Low pressure lockout", 
                    symptoms: "Poor cooling, frequent cycling",
                    causes: ["Low refrigerant", "TXV failure", "Dirty evaporator"],
                    diagnosticSteps: ["Check for leaks", "Test TXV operation", "Clean evaporator"],
                    safetyNotes: "Verify proper evacuation before recharging"
                }
            ],

            // Lennox error codes
            lennox: [
                {
                    code: "E223", category: "Communication", severity: "medium",
                    description: "Communication error between thermostat and unit",
                    symptoms: "Thermostat shows error, no response from unit", 
                    causes: ["Wiring issue", "Thermostat failure", "Control board failure"],
                    diagnosticSteps: ["Check thermostat wiring", "Test communication voltage", "Replace components as needed"],
                    safetyNotes: "Verify 24V control voltage before testing"
                }
            ],

            // Generic codes by equipment type
            generic: {
                furnace: [
                    {
                        code: "IGNITION", category: "Ignition", severity: "high",
                        description: "Ignition failure",
                        symptoms: "No heat, no flame, pilot won't light",
                        causes: ["Failed ignitor", "Gas valve issue", "Control board failure"],
                        diagnosticSteps: ["Test ignitor continuity", "Check gas pressure", "Inspect control board"],
                        safetyNotes: "Always test for gas leaks"
                    },
                    {
                        code: "LIMIT", category: "Safety", severity: "high", 
                        description: "High limit switch tripped",
                        symptoms: "Unit shuts down during heating cycle",
                        causes: ["Blocked airflow", "Dirty filter", "Bad blower motor"],
                        diagnosticSteps: ["Check air filter", "Test blower operation", "Inspect ductwork"],
                        safetyNotes: "Do not bypass safety switches"
                    }
                ],
                
                generator: [
                    {
                        code: "1501", category: "Overcrank", severity: "high",
                        description: "Overcrank condition detected",
                        symptoms: "Generator won't start, cranks but no ignition",
                        causes: ["No fuel", "Clogged fuel filter", "Ignition system failure"],
                        diagnosticSteps: ["Check fuel level", "Replace fuel filter", "Test ignition system"],
                        safetyNotes: "Ensure proper ventilation before troubleshooting"
                    },
                    {
                        code: "1300", category: "RPM", severity: "medium",
                        description: "RPM out of range",
                        symptoms: "Engine runs but irregular speed",
                        causes: ["Governor adjustment", "Fuel delivery issue", "Load problem"],
                        diagnosticSteps: ["Adjust governor", "Check fuel pressure", "Verify electrical load"],
                        safetyNotes: "Never adjust governor while engine is running"
                    }
                ],

                waterheater: [
                    {
                        code: "PILOT", category: "Ignition", severity: "high",
                        description: "Pilot light failure",
                        symptoms: "No hot water, pilot won't stay lit",
                        causes: ["Bad thermocouple", "Dirty pilot orifice", "Gas valve failure"],
                        diagnosticSteps: ["Test thermocouple", "Clean pilot assembly", "Check gas valve"],
                        safetyNotes: "Follow proper lighting procedures"
                    }
                ],

                hvac: [
                    {
                        code: "GENERIC", category: "System", severity: "medium",
                        description: "General system fault",
                        symptoms: "Unit not operating properly",
                        causes: ["Multiple possible causes"],
                        diagnosticSteps: ["Systematic troubleshooting required"],
                        safetyNotes: "Follow all safety procedures"
                    }
                ]
            }
        };
    }

    /**
     * Initialize diagnostic flow procedures
     */
    initializeDiagnosticFlows() {
        return {
            "31": {
                title: "Pressure Switch Stuck Closed Diagnostic",
                steps: [
                    { step: 1, action: "Turn off power and gas", safety: true },
                    { step: 2, action: "Remove pressure switch hoses", tool: "screwdriver" },
                    { step: 3, action: "Test switch continuity with multimeter", tool: "multimeter" },
                    { step: 4, action: "Check for blockages in hoses", visual: true },
                    { step: 5, action: "Test inducer motor operation", tool: "multimeter" },
                    { step: 6, action: "Replace faulty components", repair: true }
                ],
                estimatedTime: "30-45 minutes",
                requiredTools: ["Multimeter", "Screwdriver set", "Manometer"],
                safetyPrecautions: ["Gas shutoff", "Electrical lockout", "Proper ventilation"]
            },

            "IGNITION": {
                title: "Furnace Ignition Failure Diagnostic",
                steps: [
                    { step: 1, action: "Verify thermostat call for heat", tool: "multimeter" },
                    { step: 2, action: "Check 24V control voltage", tool: "multimeter", safety: true },
                    { step: 3, action: "Test gas pressure at manifold", tool: "manometer" },
                    { step: 4, action: "Inspect ignitor for cracks/damage", visual: true },
                    { step: 5, action: "Test ignitor resistance", tool: "multimeter" },
                    { step: 6, action: "Check gas valve operation", tool: "multimeter" }
                ],
                estimatedTime: "45-60 minutes",
                requiredTools: ["Multimeter", "Manometer", "Gas leak detector"],
                safetyPrecautions: ["Gas leak test", "Proper ventilation", "CO detection"]
            },

            generic: {
                title: "General HVAC Diagnostic Procedure",
                steps: [
                    { step: 1, action: "Visual inspection of equipment", visual: true },
                    { step: 2, action: "Check electrical connections", tool: "multimeter", safety: true },
                    { step: 3, action: "Test system operation", operational: true },
                    { step: 4, action: "Document findings", documentation: true }
                ],
                estimatedTime: "30 minutes",
                requiredTools: ["Basic hand tools", "Multimeter"],
                safetyPrecautions: ["Follow manufacturer guidelines"]
            }
        };
    }

    /**
     * Get recommended parts for error code
     */
    getRecommendedParts(errorCode, brand, model) {
        const partsDatabase = {
            "31": [
                { part: "Pressure Switch", partNumber: `${brand}-PS-${model}`, cost: "$45-85", priority: "high" },
                { part: "Pressure Switch Hose", partNumber: `${brand}-PSH-${model}`, cost: "$15-25", priority: "medium" }
            ],
            "41": [
                { part: "Flame Sensor", partNumber: `${brand}-FS-${model}`, cost: "$25-45", priority: "high" },
                { part: "Flame Sensor Rod", partNumber: `${brand}-FSR-${model}`, cost: "$20-35", priority: "medium" }
            ],
            "IGNITION": [
                { part: "Hot Surface Ignitor", partNumber: `${brand}-HSI-${model}`, cost: "$45-85", priority: "high" },
                { part: "Gas Valve", partNumber: `${brand}-GV-${model}`, cost: "$125-250", priority: "medium" }
            ]
        };

        return partsDatabase[errorCode] || [];
    }

    /**
     * Get safety procedures for error code
     */
    getSafetyProcedures(errorCode, equipmentType) {
        const safetyDatabase = {
            "31": [
                "Turn off gas supply at meter",
                "Lock out electrical power", 
                "Test for gas leaks before restoring service",
                "Verify proper venting operation"
            ],
            "41": [
                "Turn off gas supply",
                "Allow system to cool completely",
                "Test for proper combustion after service",
                "Check CO levels in flue gases"
            ],
            "IGNITION": [
                "Gas leak test mandatory",
                "Proper ignition sequence verification",
                "CO testing required after service",
                "Document all safety checks"
            ]
        };

        return safetyDatabase[errorCode] || safetyDatabase.generic || [
            "Follow manufacturer safety procedures",
            "Use proper lockout/tagout",
            "Test all safety devices after service"
        ];
    }
}

/**
 * Equipment Database for instant lookups
 */
class EquipmentDatabase {
    constructor() {
        this.equipmentData = this.initializeEquipmentDatabase();
    }

    /**
     * Lookup equipment by brand and model
     */
    lookup(brand, model) {
        const brandKey = brand?.toLowerCase();
        const brandData = this.equipmentData[brandKey];
        
        if (!brandData) {
            return this.createGenericEntry(brand, model);
        }

        // Find exact model match or closest match
        const modelMatch = this.findModelMatch(brandData, model);
        if (modelMatch) {
            return {
                ...modelMatch,
                matched: true,
                confidence: modelMatch.exactMatch ? 100 : 85
            };
        }

        return this.createGenericEntry(brand, model);
    }

    findModelMatch(brandData, model) {
        // Try exact match first
        for (const entry of brandData) {
            if (entry.model === model) {
                return { ...entry, exactMatch: true };
            }
        }

        // Try partial match (model series)
        const modelPrefix = model?.substring(0, 3);
        for (const entry of brandData) {
            if (entry.model?.startsWith(modelPrefix)) {
                return { ...entry, exactMatch: false };
            }
        }

        return null;
    }

    createGenericEntry(brand, model) {
        return {
            brand: brand,
            model: model,
            matched: false,
            confidence: 50,
            manualURL: this.getManufacturerURL(brand),
            warrantyYears: this.getGenericWarranty(brand),
            commonIssues: ["Consult manufacturer documentation"],
            diagnosticNotes: "Generic diagnostic procedures apply"
        };
    }

    getManufacturerURL(brand) {
        const urls = {
            'carrier': 'https://www.carrier.com/residential/en/us/products/',
            'trane': 'https://www.trane.com/residential/en/products/',
            'lennox': 'https://www.lennox.com/products/',
            'york': 'https://www.york.com/residential-equipment/',
            'rheem': 'https://www.rheem.com/products/',
            'goodman': 'https://www.goodmanmfg.com/products/',
            'generac': 'https://www.generac.com/all-products/generators/',
            'kohler': 'https://kohlerpower.com/residential/'
        };
        return urls[brand?.toLowerCase()] || `https://www.${brand?.toLowerCase()}.com/`;
    }

    getGenericWarranty(brand) {
        const warranties = {
            'carrier': 10, 'trane': 10, 'lennox': 10, 'york': 10,
            'rheem': 6, 'goodman': 10, 'generac': 5, 'kohler': 5
        };
        return warranties[brand?.toLowerCase()] || 5;
    }

    /**
     * Initialize equipment database with common models
     */
    initializeEquipmentDatabase() {
        return {
            carrier: [
                {
                    model: "58STA", type: "Gas Furnace", efficiency: "80% AFUE",
                    manualURL: "https://www.carrier.com/residential/en/us/products/gas-furnaces/58sta/",
                    commonIssues: ["Pressure switch issues", "Ignitor failure", "Control board problems"],
                    warrantyYears: 10,
                    diagnosticNotes: "Check error codes on display panel"
                },
                {
                    model: "25HCB", type: "Air Conditioner", efficiency: "13-16 SEER",
                    manualURL: "https://www.carrier.com/residential/en/us/products/air-conditioners/25hcb/",
                    commonIssues: ["Low refrigerant", "Dirty coils", "Compressor failure"],
                    warrantyYears: 10,
                    diagnosticNotes: "Monitor suction and head pressures"
                }
            ],
            
            trane: [
                {
                    model: "XR80", type: "Gas Furnace", efficiency: "80% AFUE",
                    manualURL: "https://www.trane.com/residential/en/products/gas-furnaces/",
                    commonIssues: ["Heat exchanger cracks", "Blower motor failure", "Gas valve issues"],
                    warrantyYears: 10,
                    diagnosticNotes: "Check for proper gas pressure and electrical connections"
                }
            ],

            generac: [
                {
                    model: "7043", type: "Standby Generator", fuelType: "Natural Gas",
                    manualURL: "https://www.generac.com/all-products/generators/home-backup-generators/",
                    commonIssues: ["Battery failure", "Control panel faults", "Fuel system problems"],
                    warrantyYears: 5,
                    diagnosticNotes: "Check battery voltage and fuel pressure regularly"
                }
            ],

            rheem: [
                {
                    model: "A95V", type: "Gas Water Heater", efficiency: "95% Thermal Efficiency",
                    manualURL: "https://www.rheem.com/products/water-heating/",
                    commonIssues: ["Thermocouple failure", "Gas valve problems", "Vent blockage"],
                    warrantyYears: 6,
                    diagnosticNotes: "Test thermocouple millivolt output"
                }
            ]
        };
    }
}

// Export database classes
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
            const { action, brand, model, errorCode, symptoms, equipmentType } = JSON.parse(event.body);
            
            const errorDB = new ErrorCodeDatabase();
            const equipDB = new EquipmentDatabase();
            
            let result = {};
            
            switch (action) {
                case 'getErrorCodes':
                    result = {
                        errorCodes: errorDB.getErrorCodes(brand, model, equipmentType),
                        diagnosticFlows: errorCode ? errorDB.getDiagnosticFlow(errorCode, brand, equipmentType) : null
                    };
                    break;
                    
                case 'searchSymptoms':
                    result = {
                        matchingCodes: errorDB.searchBySymptoms(symptoms)
                    };
                    break;
                    
                case 'lookupEquipment':
                    result = {
                        equipmentData: equipDB.lookup(brand, model)
                    };
                    break;
                    
                default:
                    throw new Error('Invalid action');
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    ...result,
                    timestamp: new Date().toISOString()
                })
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

// Export classes for other modules
module.exports = { ErrorCodeDatabase, EquipmentDatabase };