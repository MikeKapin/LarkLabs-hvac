// netlify/functions/equipment-database.js  
// Comprehensive HVAC equipment database with specifications, manuals, and diagnostic data

class ComprehensiveEquipmentDatabase {
    constructor() {
        this.manufacturers = this.initializeManufacturerDatabase();
        this.specifications = this.initializeSpecificationDatabase();
        this.manuals = this.initializeManualDatabase();
        this.warranties = this.initializeWarrantyDatabase();
    }

    /**
     * Comprehensive equipment lookup
     */
    async comprehensiveLookup(brand, model, serial = null) {
        const result = {
            success: false,
            equipment: null,
            specifications: null,
            manuals: [],
            warranty: null,
            errorCodes: [],
            diagnosticData: null,
            safetyBulletins: [],
            confidence: 0
        };

        try {
            // 1. Equipment identification
            const equipmentMatch = this.findEquipmentMatch(brand, model);
            if (equipmentMatch) {
                result.equipment = equipmentMatch;
                result.confidence += 40;
                result.success = true;
            }

            // 2. Detailed specifications
            const specs = this.getDetailedSpecifications(brand, model, equipmentMatch?.type);
            if (specs) {
                result.specifications = specs;
                result.confidence += 20;
            }

            // 3. Manual retrieval
            const manuals = await this.getOfficialManuals(brand, model, equipmentMatch?.type);
            result.manuals = manuals;
            if (manuals.length > 0) result.confidence += 15;

            // 4. Warranty calculation
            const warranty = this.calculateWarrantyStatus(brand, model, serial, equipmentMatch);
            if (warranty) {
                result.warranty = warranty;
                result.confidence += 10;
            }

            // 5. Error codes and diagnostics
            const { ErrorCodeDatabase } = require('./error-code-database');
            const errorDB = new ErrorCodeDatabase();
            result.errorCodes = errorDB.getErrorCodes(brand, model, equipmentMatch?.type);
            if (result.errorCodes.length > 0) result.confidence += 10;

            // 6. Safety bulletins
            result.safetyBulletins = await this.getSafetyBulletins(brand, model, equipmentMatch?.type);
            if (result.safetyBulletins.length > 0) result.confidence += 5;

            return result;

        } catch (error) {
            console.error('Comprehensive lookup error:', error);
            return { ...result, error: error.message };
        }
    }

    /**
     * Find equipment match in database
     */
    findEquipmentMatch(brand, model) {
        const brandKey = brand?.toLowerCase();
        const brandData = this.manufacturers[brandKey];
        
        if (!brandData) return null;

        // Search through all equipment types
        for (const [type, models] of Object.entries(brandData)) {
            for (const equipment of models) {
                // Exact model match
                if (equipment.model === model) {
                    return {
                        ...equipment,
                        type: type,
                        matchType: 'exact',
                        confidence: 100
                    };
                }
                
                // Series match (first 3-4 characters)
                const modelPrefix = model?.substring(0, Math.min(4, model.length));
                if (equipment.modelSeries?.includes(modelPrefix)) {
                    return {
                        ...equipment,
                        type: type,
                        matchType: 'series',
                        confidence: 85
                    };
                }
            }
        }

        return null;
    }

    /**
     * Get detailed technical specifications
     */
    getDetailedSpecifications(brand, model, equipmentType) {
        const specKey = `${brand?.toLowerCase()}_${model}`;
        const spec = this.specifications[specKey];
        
        if (spec) return spec;

        // Return generic specs for equipment type
        return this.getGenericSpecifications(equipmentType);
    }

    getGenericSpecifications(equipmentType) {
        const genericSpecs = {
            'gas_furnace': {
                fuelType: 'Natural Gas / LP',
                efficiency: '80-96% AFUE',
                electrical: '115V/1Ph or 115/230V/1Ph',
                venting: 'Category I or Condensing',
                serviceLife: '15-20 years',
                maintenanceInterval: 'Annual'
            },
            'air_conditioner': {
                refrigerant: 'R-410A or R-32',
                efficiency: '13-20+ SEER',
                electrical: '230V/1Ph or 460V/3Ph',
                serviceLife: '12-15 years',
                maintenanceInterval: 'Bi-annual'
            },
            'generator': {
                fuelType: 'Natural Gas / LP / Diesel',
                electrical: '120/240V Single Phase',
                engineType: 'Air-cooled / Liquid-cooled',
                serviceLife: '10-30 years',
                maintenanceInterval: 'Weekly/Monthly testing required'
            }
        };

        return genericSpecs[equipmentType?.toLowerCase()] || null;
    }

    /**
     * Get official manufacturer manuals
     */
    async getOfficialManuals(brand, model, equipmentType) {
        const manualKey = `${brand?.toLowerCase()}_${model}`;
        const brandManuals = this.manuals[brand?.toLowerCase()] || {};
        
        // Check for specific model manuals
        if (brandManuals[model]) {
            return brandManuals[model];
        }

        // Generate likely manual URLs
        return this.generateManualURLs(brand, model, equipmentType);
    }

    generateManualURLs(brand, model, equipmentType) {
        const baseURLs = {
            'carrier': 'https://www.carrier.com/residential/en/us/products/',
            'trane': 'https://www.trane.com/content/dam/Trane/residential/',
            'lennox': 'https://www.lennox.com/products/',
            'york': 'https://www.york.com/residential-equipment/',
            'rheem': 'https://www.rheem.com/products/',
            'goodman': 'https://www.goodmanmfg.com/products/',
            'generac': 'https://www.generac.com/service-support/product-support-lookup/',
            'kohler': 'https://kohlerpower.com/residential/generators/'
        };

        const baseURL = baseURLs[brand?.toLowerCase()];
        if (!baseURL) return [];

        return [
            {
                title: `${brand} ${model} Installation Manual`,
                type: 'Installation Guide',
                url: `${baseURL}${model?.toLowerCase()}/`,
                description: 'Official installation and operation manual'
            },
            {
                title: `${brand} ${model} Service Manual`,
                type: 'Service Documentation', 
                url: `${baseURL}service/${model?.toLowerCase()}/`,
                description: 'Technical service and troubleshooting guide'
            }
        ];
    }

    /**
     * Calculate warranty status
     */
    calculateWarrantyStatus(brand, model, serial, equipmentData) {
        try {
            // Extract manufacturing year from serial number or equipment data
            const mfgYear = this.extractManufacturingYear(serial, brand, model);
            if (!mfgYear) return null;

            const warrantyPeriod = this.warranties[brand?.toLowerCase()] || this.warranties.default;
            const currentYear = new Date().getFullYear();
            const age = currentYear - mfgYear;
            
            let status = 'expired';
            let yearsRemaining = 0;
            
            if (age < warrantyPeriod.parts) {
                status = 'active';
                yearsRemaining = warrantyPeriod.parts - age;
            } else if (age < warrantyPeriod.parts + 1) {
                status = 'expiring';
                yearsRemaining = 0.5;
            }

            return {
                status: status,
                yearsRemaining: yearsRemaining,
                manufactureYear: mfgYear,
                age: age,
                coverage: {
                    parts: age < warrantyPeriod.parts,
                    labor: age < warrantyPeriod.labor,
                    heatExchanger: age < warrantyPeriod.heatExchanger
                },
                registrationURL: this.getWarrantyRegistrationURL(brand)
            };

        } catch (error) {
            console.warn('Warranty calculation error:', error);
            return null;
        }
    }

    extractManufacturingYear(serial, brand, model) {
        if (!serial) return null;

        // Brand-specific serial number decoding
        const decoders = {
            'carrier': (s) => {
                // Carrier: First digit is decade, second is year
                if (s.length >= 2) {
                    const decade = parseInt(s[0]) * 10;
                    const year = parseInt(s[1]);
                    return 1980 + decade + year; // Assumes 1980s+
                }
                return null;
            },
            'trane': (s) => {
                // Trane: Similar to Carrier
                if (s.length >= 2) {
                    const decade = parseInt(s[0]) * 10; 
                    const year = parseInt(s[1]);
                    return 1980 + decade + year;
                }
                return null;
            },
            'generac': (s) => {
                // Generac: Year encoded in positions 3-4
                if (s.length >= 4) {
                    const yearCode = s.substring(2, 4);
                    const year = parseInt(yearCode);
                    return year > 80 ? 1900 + year : 2000 + year;
                }
                return null;
            }
        };

        const decoder = decoders[brand?.toLowerCase()];
        if (decoder) {
            return decoder(serial);
        }

        // Generic: Look for 4-digit year in serial
        const yearMatch = serial.match(/\b(19|20)\d{2}\b/);
        return yearMatch ? parseInt(yearMatch[0]) : null;
    }

    getWarrantyRegistrationURL(brand) {
        const urls = {
            'carrier': 'https://www.carrier.com/residential/en/us/service-support/warranty/',
            'trane': 'https://www.trane.com/residential/en/us/service-support/warranty/',
            'generac': 'https://www.generac.com/service-support/warranty/',
            'rheem': 'https://www.rheem.com/service-support/warranty/'
        };
        return urls[brand?.toLowerCase()] || `https://www.${brand?.toLowerCase()}.com/warranty/`;
    }

    /**
     * Get safety bulletins for equipment
     */
    async getSafetyBulletins(brand, model, equipmentType) {
        // This would integrate with manufacturer safety bulletin APIs
        // For now, return structured placeholders based on common issues
        
        const bulletins = [];
        
        if (equipmentType?.includes('gas') || equipmentType?.includes('furnace')) {
            bulletins.push({
                id: 'GAS001',
                title: 'Carbon Monoxide Safety',
                severity: 'Critical',
                date: '2024-01-15',
                description: 'Proper combustion air and venting requirements',
                affectedModels: 'All gas equipment',
                action: 'Annual CO testing required'
            });
        }

        if (equipmentType?.includes('generator')) {
            bulletins.push({
                id: 'GEN001', 
                title: 'Generator Installation Clearances',
                severity: 'Important',
                date: '2024-02-01',
                description: 'Minimum clearance requirements for safe operation',
                affectedModels: 'All standby generators',
                action: 'Verify 18" minimum clearances'
            });
        }

        return bulletins;
    }

    /**
     * Initialize manufacturer database
     */
    initializeManufacturerDatabase() {
        return {
            carrier: {
                gas_furnaces: [
                    { model: '58STA', modelSeries: ['58S'], capacity: '40-120 MBH', efficiency: '80% AFUE' },
                    { model: '59SC2', modelSeries: ['59S'], capacity: '40-120 MBH', efficiency: '90% AFUE' },
                    { model: '59MN7', modelSeries: ['59M'], capacity: '40-140 MBH', efficiency: '96% AFUE' }
                ],
                air_conditioners: [
                    { model: '25HCB', modelSeries: ['25H'], capacity: '1.5-5 Tons', efficiency: '13-16 SEER' },
                    { model: '25VNA', modelSeries: ['25V'], capacity: '2-5 Tons', efficiency: '16-20 SEER' }
                ]
            },
            
            trane: {
                gas_furnaces: [
                    { model: 'XR80', modelSeries: ['XR8'], capacity: '40-120 MBH', efficiency: '80% AFUE' },
                    { model: 'XV95', modelSeries: ['XV9'], capacity: '40-140 MBH', efficiency: '95% AFUE' }
                ],
                air_conditioners: [
                    { model: 'XR13', modelSeries: ['XR1'], capacity: '1.5-5 Tons', efficiency: '13-14.5 SEER' },
                    { model: 'XV20i', modelSeries: ['XV2'], capacity: '2-5 Tons', efficiency: '20+ SEER' }
                ]
            },

            generac: {
                generators: [
                    { model: '7043', modelSeries: ['704'], fuelType: 'NG/LP', capacity: '22kW', type: 'Standby' },
                    { model: '7042', modelSeries: ['704'], fuelType: 'NG/LP', capacity: '20kW', type: 'Standby' },
                    { model: '7039', modelSeries: ['703'], fuelType: 'NG/LP', capacity: '16kW', type: 'Standby' }
                ]
            },

            rheem: {
                water_heaters: [
                    { model: 'A95V', modelSeries: ['A95'], fuelType: 'NG/LP', capacity: '40-75 Gal', efficiency: '95% TE' },
                    { model: 'G100', modelSeries: ['G10'], fuelType: 'NG/LP', capacity: '40-75 Gal', efficiency: '80% TE' }
                ],
                furnaces: [
                    { model: 'R95V', modelSeries: ['R95'], capacity: '45-125 MBH', efficiency: '95% AFUE' }
                ]
            },

            lennox: {
                gas_furnaces: [
                    { model: 'SLO185V', modelSeries: ['SLO'], capacity: '45-125 MBH', efficiency: '80% AFUE' },
                    { model: 'EL296V', modelSeries: ['EL2'], capacity: '40-140 MBH', efficiency: '96% AFUE' }
                ]
            },

            york: {
                gas_furnaces: [
                    { model: 'TG9S', modelSeries: ['TG9'], capacity: '40-120 MBH', efficiency: '80% AFUE' },
                    { model: 'TM9E', modelSeries: ['TM9'], capacity: '40-140 MBH', efficiency: '95% AFUE' }
                ]
            },

            goodman: {
                gas_furnaces: [
                    { model: 'GM9S', modelSeries: ['GM9'], capacity: '40-120 MBH', efficiency: '80% AFUE' },
                    { model: 'GMS8', modelSeries: ['GMS'], capacity: '40-100 MBH', efficiency: '80% AFUE' }
                ]
            }
        };
    }

    /**
     * Initialize detailed specification database
     */
    initializeSpecificationDatabase() {
        return {
            // Carrier 58STA Series
            'carrier_58sta': {
                electrical: {
                    voltage: '115V/1Ph/60Hz',
                    fla: '11.0A',
                    mca: '12.0A', 
                    mocp: '15A',
                    controlVoltage: '24VAC'
                },
                gas: {
                    inputRange: '40,000-120,000 BTU/h',
                    gasType: 'NG/LP Convertible',
                    gasConnection: '1/2" NPT',
                    manifoldPressure: '3.5" WC (NG), 10.0" WC (LP)'
                },
                physical: {
                    width: '17.5"',
                    depth: '28.5"', 
                    height: '33"-44"',
                    weight: '95-130 lbs'
                },
                performance: {
                    efficiency: '80% AFUE',
                    airflow: '800-1600 CFM',
                    temperatureRise: '30-70°F'
                },
                certifications: ['UL Listed', 'CSA Certified', 'AHRI Rated'],
                serviceAccess: {
                    filterLocation: 'Return air side',
                    drainLocation: 'Left side',
                    gasValveAccess: 'Front panel removal required'
                }
            },

            // Generac 7043 (22kW Generator)
            'generac_7043': {
                electrical: {
                    output: '22kW (18kW LP)',
                    voltage: '120/240V Single Phase',
                    frequency: '60Hz',
                    amperage: '91.7A @ 240V'
                },
                engine: {
                    type: 'G-Force OHV Engine',
                    displacement: '999cc',
                    fuelType: 'NG/LP',
                    fuelConsumption: '204 cu ft/hr (NG), 3.45 gal/hr (LP)'
                },
                physical: {
                    dimensions: '48" L x 25" W x 29" H',
                    weight: '395 lbs',
                    enclosure: 'All-weather aluminum'
                },
                certifications: ['UL Listed', 'CSA Certified', 'EPA Compliant'],
                serviceAccess: {
                    oilFilter: 'Right side access',
                    sparkPlugs: 'Top access',
                    airFilter: 'Side panel removal'
                }
            }
        };
    }

    /**
     * Initialize manual database
     */
    initializeManualDatabase() {
        return {
            carrier: {
                '58STA': [
                    {
                        title: 'Carrier 58STA Installation Instructions',
                        type: 'Installation Manual',
                        url: 'https://www.carrier.com/content/dam/carrier/residential/products/gas-furnaces/58sta-installation.pdf',
                        pages: 24,
                        language: 'English'
                    },
                    {
                        title: 'Carrier 58STA Service Manual',
                        type: 'Service Guide',
                        url: 'https://www.carrier.com/content/dam/carrier/residential/products/gas-furnaces/58sta-service.pdf', 
                        pages: 36,
                        language: 'English'
                    }
                ]
            },
            
            generac: {
                '7043': [
                    {
                        title: 'Generac 7043 Owner Manual',
                        type: 'Owner Guide',
                        url: 'https://www.generac.com/content/dam/generac/manuals/0J9378A.pdf',
                        pages: 48,
                        language: 'English/French'
                    },
                    {
                        title: 'Generac 7043 Installation Manual', 
                        type: 'Installation Guide',
                        url: 'https://www.generac.com/content/dam/generac/manuals/0J9379A.pdf',
                        pages: 32,
                        language: 'English/French'
                    }
                ]
            }
        };
    }

    /**
     * Initialize warranty database
     */
    initializeWarrantyDatabase() {
        return {
            carrier: { parts: 10, labor: 1, heatExchanger: 20 },
            trane: { parts: 10, labor: 1, heatExchanger: 20 },
            lennox: { parts: 10, labor: 1, heatExchanger: 20 },
            york: { parts: 10, labor: 1, heatExchanger: 20 },
            rheem: { parts: 6, labor: 1, heatExchanger: 10 },
            goodman: { parts: 10, labor: 1, heatExchanger: 20 },
            generac: { parts: 5, labor: 2, engine: 5 },
            kohler: { parts: 5, labor: 2, engine: 5 },
            default: { parts: 5, labor: 1, major: 10 }
        };
    }

    /**
     * Cross-reference with AHRI database
     */
    async crossReferenceAHRI(brand, model, equipmentType) {
        // This would integrate with AHRI's actual API
        // For now, return structured placeholder data
        
        if (equipmentType?.includes('air_conditioner') || equipmentType?.includes('heat_pump')) {
            return {
                ahriNumber: `AHRI-${brand}-${model}`.replace(/\s/g, ''),
                certified: true,
                seerRating: 'Certified Rating Available',
                capacity: 'AHRI Certified Capacity',
                soundRating: 'dB(A) Rating Available',
                notes: 'AHRI certification verifies manufacturer claims'
            };
        }

        return null;
    }

    /**
     * Get equipment-specific diagnostic procedures
     */
    getEquipmentDiagnostics(brand, model, equipmentType) {
        const diagnostics = {
            startup: this.getStartupProcedure(equipmentType),
            troubleshooting: this.getTroubleshootingTree(equipmentType),
            maintenance: this.getMaintenanceProcedures(equipmentType),
            safety: this.getSafetyProcedures(equipmentType)
        };

        return diagnostics;
    }

    getStartupProcedure(equipmentType) {
        const procedures = {
            'gas_furnace': [
                'Verify gas supply and pressure',
                'Check electrical connections',
                'Test thermostat operation',
                'Verify proper venting',
                'Test safety devices',
                'Monitor initial startup sequence'
            ],
            'generator': [
                'Check fuel supply',
                'Verify battery voltage',
                'Test control panel operation',
                'Check oil level and quality',
                'Test automatic transfer switch',
                'Monitor startup sequence'
            ]
        };

        return procedures[equipmentType] || procedures.generic || [
            'Follow manufacturer startup procedures',
            'Verify all safety systems',
            'Test normal operation'
        ];
    }

    getTroubleshootingTree(equipmentType) {
        return {
            equipmentType: equipmentType,
            rootCauses: this.getCommonRootCauses(equipmentType),
            diagnosticSteps: this.getDiagnosticSteps(equipmentType)
        };
    }

    getCommonRootCauses(equipmentType) {
        const causes = {
            'gas_furnace': [
                'Ignition system failure',
                'Gas supply issues',
                'Electrical problems',
                'Airflow restrictions',
                'Control system faults'
            ],
            'generator': [
                'Fuel system problems',
                'Battery/charging issues', 
                'Control panel faults',
                'Engine mechanical issues',
                'Transfer switch problems'
            ]
        };

        return causes[equipmentType] || ['Consult service manual'];
    }

    getDiagnosticSteps(equipmentType) {
        const steps = {
            'gas_furnace': [
                'Check thermostat call for heat',
                'Verify 24V control voltage',
                'Test gas pressure at manifold',
                'Inspect ignition system',
                'Check safety switches',
                'Monitor operational sequence'
            ],
            'generator': [
                'Check battery voltage (12.5V+)',
                'Verify fuel supply pressure',
                'Test control panel display',
                'Check engine oil level/quality',
                'Test automatic transfer switch',
                'Monitor startup sequence'
            ]
        };

        return steps[equipmentType] || ['Follow manufacturer procedures'];
    }

    getMaintenanceProcedures(equipmentType) {
        const maintenance = {
            'gas_furnace': {
                monthly: ['Check/replace air filter'],
                seasonal: ['Test thermostat', 'Visual inspection'],
                annual: ['Complete professional service', 'Heat exchanger inspection', 'Gas leak test']
            },
            'generator': {
                weekly: ['Test run (exercise cycle)'],
                monthly: ['Check oil level', 'Visual inspection'],
                annual: ['Change oil/filter', 'Replace spark plugs', 'Test transfer switch']
            }
        };

        return maintenance[equipmentType] || {
            asNeeded: ['Follow manufacturer recommendations']
        };
    }

    getSafetyProcedures(equipmentType) {
        const safety = {
            'gas_furnace': [
                'Turn off gas supply before service',
                'Test for gas leaks after service', 
                'Verify proper combustion air',
                'Test CO levels in flue gases',
                'Check venting system integrity'
            ],
            'generator': [
                'Never operate in enclosed spaces',
                'Maintain proper clearances',
                'Test CO detectors regularly',
                'Keep fuel connections tight',
                'Follow electrical safety procedures'
            ]
        };

        return safety[equipmentType] || [
            'Follow all manufacturer safety procedures',
            'Use proper lockout/tagout',
            'Test safety devices after service'
        ];
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
            const { action, brand, model, serial, equipmentType } = JSON.parse(event.body);
            
            const database = new ComprehensiveEquipmentDatabase();
            let result = {};
            
            switch (action) {
                case 'comprehensiveLookup':
                    result = await database.comprehensiveLookup(brand, model, serial);
                    break;
                    
                case 'getSpecifications':
                    result = {
                        specifications: database.getDetailedSpecifications(brand, model, equipmentType)
                    };
                    break;
                    
                case 'getManuals':
                    result = {
                        manuals: await database.getOfficialManuals(brand, model, equipmentType)
                    };
                    break;
                    
                case 'getWarranty':
                    result = {
                        warranty: database.calculateWarrantyStatus(brand, model, serial, null)
                    };
                    break;
                    
                case 'getDiagnostics':
                    result = {
                        diagnostics: database.getEquipmentDiagnostics(brand, model, equipmentType)
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

module.exports = { ComprehensiveEquipmentDatabase };