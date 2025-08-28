// services/equipmentDataMapper.js
// Equipment Data Mapper for HVAC Jack 4.0 Maintenance Forms
// Maps photo analysis results to maintenance form fields

class EquipmentDataMapper {
    constructor() {
        this.defaultTargetValues = {
            gasNatural: {
                o2Target: 8.5,
                coTarget: 100,
                gasPressure: 3.5,
                draftPressure: -0.03
            },
            gasLP: {
                o2Target: 9.0,
                coTarget: 100,
                gasPressure: 11.0,
                draftPressure: -0.03
            }
        };
        
        this.equipmentTypes = {
            FURNACE: 'Gas Furnace',
            BOILER: 'Gas Boiler',
            WATER_HEATER: 'Gas Water Heater',
            UNIT_HEATER: 'Gas Unit Heater',
            ROOFTOP_UNIT: 'Gas Rooftop Unit'
        };
    }

    /**
     * Maps photo analysis data to maintenance form fields
     * @param {Object} photoAnalysisData - Raw photo analysis from Claude Vision
     * @returns {Object} Mapped equipment data for form population
     */
    mapPhotoDataToForm(photoAnalysisData) {
        if (!photoAnalysisData) {
            return this.getEmptyFormData();
        }

        try {
            // Extract structured data from photo analysis
            const extractedData = this.extractStructuredData(photoAnalysisData);
            
            // Determine equipment type
            const equipmentType = this.determineEquipmentType(extractedData);
            
            // Get target values based on gas type and equipment
            const targetValues = this.getTargetValues(extractedData.gasType, equipmentType);
            
            return {
                // Basic Equipment Info
                manufacturer: extractedData.manufacturer || '',
                model: extractedData.modelNumber || '',
                serial: extractedData.serialNumber || '',
                installDate: extractedData.installDate || '',
                equipmentType: equipmentType,
                
                // Capacity and Ratings
                inputBTU: extractedData.inputBTU || '',
                outputBTU: extractedData.outputBTU || '',
                afueRating: extractedData.afue || extractedData.efficiency || '',
                gasType: extractedData.gasType || 'Natural Gas',
                
                // Electrical Specifications
                electricalReq: this.formatElectricalRequirements(extractedData),
                volts: extractedData.voltage || '',
                amps: extractedData.amperage || '',
                phases: extractedData.phases || '1',
                
                // Target Values (Auto-set based on equipment type)
                o2Target: targetValues.o2Target,
                coTarget: targetValues.coTarget,
                gasPressureTarget: targetValues.gasPressure,
                draftPressureTarget: targetValues.draftPressure,
                
                // Temperature Rise (Calculated from equipment specs)
                temperatureRiseTarget: this.calculateTemperatureRise(extractedData),
                
                // Additional Data
                location: '',
                technician: '',
                customerName: '',
                serviceDate: new Date().toISOString().split('T')[0],
                
                // Confidence Score
                dataConfidence: this.calculateDataConfidence(extractedData),
                
                // Raw Data for Reference
                rawPhotoAnalysis: photoAnalysisData
            };
        } catch (error) {
            console.error('Error mapping photo data:', error);
            return this.getEmptyFormData();
        }
    }

    /**
     * Extracts structured data from Claude's photo analysis response
     * @param {string} analysisText - Raw analysis text from Claude
     * @returns {Object} Structured equipment data
     */
    extractStructuredData(analysisText) {
        const data = {};
        
        // Extract manufacturer (common brands)
        const manufacturerRegex = /(Carrier|Lennox|Trane|Goodman|Rheem|Ruud|American Standard|York|Bryant|Payne|Amana|Heil|Tempstar|Comfortmaker|ICP|Ducane|Nordyne|Maytag|Frigidaire|Gibson|Kelvinator|Westinghouse|Coleman|Miller|Intertherm|Luxaire|Fraser-Johnston|Climatrol|Airease)/i;
        const manufacturerMatch = analysisText.match(manufacturerRegex);
        if (manufacturerMatch) {
            data.manufacturer = manufacturerMatch[1];
        }

        // Extract model number patterns
        const modelPatterns = [
            /model\s*(?:number|#)?\s*:?\s*([A-Z0-9\-]{6,20})/i,
            /model\s*([A-Z0-9\-]{6,20})/i,
            /^([A-Z]{2,4}\d{4,8}[A-Z]?\d*)/m
        ];
        
        for (const pattern of modelPatterns) {
            const match = analysisText.match(pattern);
            if (match) {
                data.modelNumber = match[1];
                break;
            }
        }

        // Extract serial number
        const serialPatterns = [
            /serial\s*(?:number|#)?\s*:?\s*([A-Z0-9]{8,20})/i,
            /s\/n\s*:?\s*([A-Z0-9]{8,20})/i,
            /ser\s*:?\s*([A-Z0-9]{8,20})/i
        ];
        
        for (const pattern of serialPatterns) {
            const match = analysisText.match(pattern);
            if (match) {
                data.serialNumber = match[1];
                break;
            }
        }

        // Extract BTU input
        const btuPatterns = [
            /input\s*:?\s*([\d,]+)\s*btu/i,
            /([\d,]+)\s*btu.*input/i,
            /capacity\s*:?\s*([\d,]+)\s*btu/i
        ];
        
        for (const pattern of btuPatterns) {
            const match = analysisText.match(pattern);
            if (match) {
                data.inputBTU = match[1].replace(/,/g, '');
                break;
            }
        }

        // Extract AFUE rating
        const afueMatch = analysisText.match(/afue\s*:?\s*([\d.]+)%?/i);
        if (afueMatch) {
            data.afue = afueMatch[1];
        }

        // Extract electrical requirements
        const voltageMatch = analysisText.match(/(120|208|240|480)V?/i);
        if (voltageMatch) {
            data.voltage = voltageMatch[1];
        }

        const ampMatch = analysisText.match(/([\d.]+)\s*amp/i);
        if (ampMatch) {
            data.amperage = ampMatch[1];
        }

        // Determine gas type
        if (analysisText.match(/LP|propane|liquid\s*propane/i)) {
            data.gasType = 'LP';
        } else {
            data.gasType = 'Natural Gas';
        }

        // Extract installation date if visible
        const dateMatch = analysisText.match(/(?:install|manuf|mfg).*date\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
        if (dateMatch) {
            data.installDate = dateMatch[1];
        }

        return data;
    }

    /**
     * Determines equipment type from analysis
     * @param {Object} extractedData - Structured equipment data
     * @returns {string} Equipment type
     */
    determineEquipmentType(extractedData) {
        const text = JSON.stringify(extractedData).toLowerCase();
        
        if (text.includes('furnace')) return this.equipmentTypes.FURNACE;
        if (text.includes('boiler')) return this.equipmentTypes.BOILER;
        if (text.includes('water heater')) return this.equipmentTypes.WATER_HEATER;
        if (text.includes('unit heater')) return this.equipmentTypes.UNIT_HEATER;
        if (text.includes('rooftop') || text.includes('rtu')) return this.equipmentTypes.ROOFTOP_UNIT;
        
        // Default to furnace if unknown
        return this.equipmentTypes.FURNACE;
    }

    /**
     * Gets target values based on gas type and equipment type
     * @param {string} gasType - Natural Gas or LP
     * @param {string} equipmentType - Type of equipment
     * @returns {Object} Target measurement values
     */
    getTargetValues(gasType, equipmentType) {
        const baseTargets = gasType === 'LP' ? 
            this.defaultTargetValues.gasLP : 
            this.defaultTargetValues.gasNatural;

        // Adjust targets based on equipment type
        const targets = { ...baseTargets };
        
        if (equipmentType === this.equipmentTypes.BOILER) {
            targets.o2Target += 0.5; // Boilers typically run slightly higher O2
        }
        
        return targets;
    }

    /**
     * Formats electrical requirements string
     * @param {Object} data - Extracted equipment data
     * @returns {string} Formatted electrical requirements
     */
    formatElectricalRequirements(data) {
        const parts = [];
        
        if (data.voltage) parts.push(`${data.voltage}V`);
        if (data.amperage) parts.push(`${data.amperage}A`);
        if (data.phases && data.phases !== '1') parts.push(`${data.phases}Ph`);
        
        return parts.join(', ') || '';
    }

    /**
     * Calculates expected temperature rise based on equipment specs
     * @param {Object} data - Extracted equipment data
     * @returns {string} Temperature rise range
     */
    calculateTemperatureRise(data) {
        if (!data.inputBTU) return '';
        
        const btu = parseInt(data.inputBTU.replace(/,/g, ''));
        
        // Typical temperature rise ranges based on input BTU
        if (btu < 60000) return '35-65°F';
        if (btu < 100000) return '40-70°F';
        if (btu < 150000) return '45-75°F';
        
        return '50-80°F';
    }

    /**
     * Calculates confidence score based on extracted data completeness
     * @param {Object} data - Extracted equipment data
     * @returns {number} Confidence score 0-100
     */
    calculateDataConfidence(data) {
        let score = 0;
        const maxScore = 100;
        
        // Key fields and their weights
        const fieldWeights = {
            manufacturer: 20,
            modelNumber: 25,
            serialNumber: 20,
            inputBTU: 15,
            gasType: 10,
            voltage: 10
        };
        
        for (const [field, weight] of Object.entries(fieldWeights)) {
            if (data[field]) {
                score += weight;
            }
        }
        
        return Math.min(score, maxScore);
    }

    /**
     * Returns empty form data structure
     * @returns {Object} Empty form data with defaults
     */
    getEmptyFormData() {
        return {
            manufacturer: '',
            model: '',
            serial: '',
            installDate: '',
            equipmentType: this.equipmentTypes.FURNACE,
            inputBTU: '',
            outputBTU: '',
            afueRating: '',
            gasType: 'Natural Gas',
            electricalReq: '',
            volts: '',
            amps: '',
            phases: '1',
            o2Target: this.defaultTargetValues.gasNatural.o2Target,
            coTarget: this.defaultTargetValues.gasNatural.coTarget,
            gasPressureTarget: this.defaultTargetValues.gasNatural.gasPressure,
            draftPressureTarget: this.defaultTargetValues.gasNatural.draftPressure,
            temperatureRiseTarget: '',
            location: '',
            technician: '',
            customerName: '',
            serviceDate: new Date().toISOString().split('T')[0],
            dataConfidence: 0,
            rawPhotoAnalysis: null
        };
    }

    /**
     * Validates mapped data and provides warnings for missing critical fields
     * @param {Object} mappedData - Mapped form data
     * @returns {Object} Validation results with warnings
     */
    validateMappedData(mappedData) {
        const warnings = [];
        const criticalFields = ['manufacturer', 'model', 'gasType', 'inputBTU'];
        
        criticalFields.forEach(field => {
            if (!mappedData[field]) {
                warnings.push(`${field} could not be extracted from photo - manual entry required`);
            }
        });
        
        return {
            isValid: warnings.length === 0,
            warnings: warnings,
            confidence: mappedData.dataConfidence || 0
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EquipmentDataMapper;
} else {
    window.EquipmentDataMapper = EquipmentDataMapper;
}