// Enhanced Refrigerant Database for HVAC Pro Tools
// Comprehensive data including A2L refrigerants and enhanced properties

const enhancedRefrigerantData = {
    // Traditional Refrigerants
    'R-22': {
        name: 'R-22 (HCFC-22)',
        type: 'HCFC',
        safety: 'A1',
        status: 'Phased Out',
        ozone: 0.055,
        gwp: 1810,
        criticalTemp: 96.15,
        criticalPressure: 4990,
        boilingPoint: -40.8,
        molecular: 86.47,
        pressureData: generatePressureData(-40.8, 96.15, 'R22'),
        applications: ['Residential AC', 'Commercial Refrigeration'],
        notes: 'Phased out in Canada. Service only.'
    },
    
    'R-410A': {
        name: 'R-410A (HFC Blend)',
        type: 'HFC',
        safety: 'A1',
        status: 'Current',
        ozone: 0,
        gwp: 2088,
        criticalTemp: 71.34,
        criticalPressure: 4901,
        boilingPoint: -51.4,
        molecular: 72.58,
        pressureData: generatePressureData(-51.4, 71.34, 'R410A'),
        applications: ['Residential AC', 'Heat Pumps', 'Commercial AC'],
        notes: 'Common residential and light commercial refrigerant.'
    },

    'R-134a': {
        name: 'R-134a (HFC-134a)',
        type: 'HFC',
        safety: 'A1',
        status: 'Current',
        ozone: 0,
        gwp: 1430,
        criticalTemp: 101.06,
        criticalPressure: 4059,
        boilingPoint: -26.3,
        molecular: 102.03,
        pressureData: generatePressureData(-26.3, 101.06, 'R134a'),
        applications: ['Automotive AC', 'Commercial Refrigeration', 'Chillers'],
        notes: 'Widely used in automotive and commercial applications.'
    },

    // A2L Refrigerants (Next Generation)
    'R-32': {
        name: 'R-32 (HFC-32)',
        type: 'HFC',
        safety: 'A2L',
        status: 'Current',
        ozone: 0,
        gwp: 675,
        criticalTemp: 78.11,
        criticalPressure: 5782,
        boilingPoint: -51.7,
        molecular: 52.02,
        pressureData: generatePressureData(-51.7, 78.11, 'R32'),
        applications: ['Residential AC', 'Heat Pumps', 'VRF Systems'],
        notes: 'Lower GWP alternative. Mildly flammable - requires special handling.',
        a2lRequirements: {
            leakDetection: 'Required for systems >1.8kg',
            ventilation: 'Enhanced ventilation required',
            installerCert: 'A2L certification required',
            equipmentStandards: 'UL 60335-2-40 compliant equipment'
        }
    },

    'R-454B': {
        name: 'R-454B (HFO Blend)',
        type: 'HFO',
        safety: 'A2L',
        status: 'Current',
        ozone: 0,
        gwp: 466,
        criticalTemp: 77.26,
        criticalPressure: 4760,
        boilingPoint: -46.1,
        molecular: 72.3,
        pressureData: generatePressureData(-46.1, 77.26, 'R454B'),
        applications: ['Residential AC', 'Heat Pumps', 'Commercial AC'],
        notes: 'R-410A replacement. Lower GWP with similar performance.',
        a2lRequirements: {
            leakDetection: 'Required for systems >3.0kg',
            ventilation: 'Natural or mechanical ventilation',
            installerCert: 'A2L training certificate required',
            equipmentStandards: 'Enhanced safety features required'
        }
    },

    'R-32/R-125': {
        name: 'R-454C (HFO Blend)',
        type: 'HFO',
        safety: 'A2L',
        status: 'Emerging',
        ozone: 0,
        gwp: 148,
        criticalTemp: 75.8,
        criticalPressure: 4720,
        boilingPoint: -45.2,
        molecular: 70.1,
        pressureData: generatePressureData(-45.2, 75.8, 'R454C'),
        applications: ['Commercial Refrigeration', 'Chillers'],
        notes: 'Ultra-low GWP for commercial applications.',
        a2lRequirements: {
            leakDetection: 'Required for all systems',
            ventilation: 'Mechanical ventilation preferred',
            installerCert: 'Advanced A2L certification',
            equipmentStandards: 'Latest safety standards required'
        }
    },

    // Natural Refrigerants
    'R-290': {
        name: 'R-290 (Propane)',
        type: 'Natural',
        safety: 'A3',
        status: 'Limited',
        ozone: 0,
        gwp: 3,
        criticalTemp: 96.74,
        criticalPressure: 4251,
        boilingPoint: -42.1,
        molecular: 44.1,
        pressureData: generatePressureData(-42.1, 96.74, 'R290'),
        applications: ['Small Refrigeration', 'Heat Pumps <150g'],
        notes: 'Highly flammable. Charge limits apply. Excellent efficiency.',
        a3Requirements: {
            chargeLimit: '150g maximum for most applications',
            leakDetection: 'Gas detection systems required',
            ventilation: 'Explosion-proof equipment required',
            installerCert: 'Specialized training and certification required'
        }
    },

    'R-717': {
        name: 'R-717 (Ammonia)',
        type: 'Natural',
        safety: 'B2L',
        status: 'Industrial',
        ozone: 0,
        gwp: 0,
        criticalTemp: 132.25,
        criticalPressure: 11333,
        boilingPoint: -33.3,
        molecular: 17.03,
        pressureData: generatePressureData(-33.3, 132.25, 'R717'),
        applications: ['Industrial Refrigeration', 'Large Cold Storage'],
        notes: 'Toxic. Industrial use only. Requires specialized training.',
        industrialRequirements: {
            training: 'IIAR certification required',
            safety: 'Emergency response procedures mandatory',
            detection: 'Continuous monitoring required',
            equipment: 'Industrial-grade components only'
        }
    },

    'R-744': {
        name: 'R-744 (CO₂)',
        type: 'Natural',
        safety: 'A1',
        status: 'Emerging',
        ozone: 0,
        gwp: 1,
        criticalTemp: 31.0,
        criticalPressure: 7377,
        boilingPoint: -78.5,
        molecular: 44.01,
        pressureData: generatePressureData(-78.5, 31.0, 'R744'),
        applications: ['Commercial Refrigeration', 'Heat Pumps', 'Transcritical Systems'],
        notes: 'High pressure system. Transcritical operation common.',
        co2Requirements: {
            pressure: 'High pressure components required (>1000 psi)',
            safety: 'Pressure relief systems critical',
            training: 'CO₂ system training required',
            efficiency: 'Heat recovery opportunities available'
        }
    }
};

// Enhanced pressure-temperature calculation function
function generatePressureData(boilingPoint, criticalTemp, refrigerant) {
    const data = [];
    const tempRange = criticalTemp - boilingPoint;
    const steps = 50;
    
    for (let i = 0; i <= steps; i++) {
        const temp = boilingPoint + (tempRange * i / steps);
        const pressure = calculateSaturationPressure(temp, boilingPoint, criticalTemp, refrigerant);
        
        data.push({
            temperature: Math.round(temp * 10) / 10,
            pressure: Math.round(pressure * 10) / 10,
            temperatureF: Math.round((temp * 9/5 + 32) * 10) / 10,
            pressurePSI: Math.round(pressure * 14.504 * 10) / 10
        });
    }
    
    return data;
}

// Enhanced saturation pressure calculation using Antoine equation
function calculateSaturationPressure(temp, boilingPoint, criticalTemp, refrigerant) {
    // Simplified Antoine equation coefficients for common refrigerants
    const antoineCoeffs = {
        'R22': { A: 8.4082, B: 1479.1, C: 237.87 },
        'R410A': { A: 8.3026, B: 1349.6, C: 224.32 },
        'R134a': { A: 8.0808, B: 1333.3, C: 248.14 },
        'R32': { A: 8.0065, B: 1291.6, C: 232.86 },
        'R454B': { A: 8.2156, B: 1356.2, C: 228.45 },
        'R454C': { A: 8.1892, B: 1342.8, C: 226.12 },
        'R290': { A: 8.0756, B: 1334.2, C: 247.04 },
        'R717': { A: 8.9071, B: 1426.4, C: 239.65 },
        'R744': { A: 9.8106, B: 1347.8, C: 273.0 }
    };
    
    const coeffs = antoineCoeffs[refrigerant] || antoineCoeffs['R410A'];
    
    // Convert temperature to Kelvin for calculation
    const tempK = temp + 273.15;
    
    // Antoine equation: log₁₀(P) = A - B/(C + T)
    const logP = coeffs.A - coeffs.B / (coeffs.C + temp);
    const pressureKPa = Math.pow(10, logP);
    
    return pressureKPa;
}

// Enhanced refrigerant selection interface
class RefrigerantSelector {
    static createSelector(containerId, onChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = `
            <div style="margin-bottom: 20px;">
                <label class="input-label">Refrigerant Type</label>
                <select id="refrigerant-select" class="input-field" onchange="${onChange}">
                    <optgroup label="Current Refrigerants">
                        <option value="R-410A" selected>R-410A (Standard Residential)</option>
                        <option value="R-134a">R-134a (Commercial/Automotive)</option>
                        <option value="R-22">R-22 (Legacy - Service Only)</option>
                    </optgroup>
                    <optgroup label="A2L Refrigerants (Next-Gen)">
                        <option value="R-32">R-32 (Lower GWP)</option>
                        <option value="R-454B">R-454B (R-410A Replacement)</option>
                        <option value="R-32/R-125">R-454C (Ultra-Low GWP)</option>
                    </optgroup>
                    <optgroup label="Natural Refrigerants">
                        <option value="R-290">R-290 (Propane)</option>
                        <option value="R-717">R-717 (Ammonia - Industrial)</option>
                        <option value="R-744">R-744 (CO₂)</option>
                    </optgroup>
                </select>
            </div>
            
            <div id="refrigerant-info" class="results-container" style="display: none;">
                <h4 style="color: #4ecdc4; margin-bottom: 15px;">Refrigerant Information</h4>
                <div id="refrigerant-details"></div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    static updateRefrigerantInfo(refrigerantCode) {
        const info = enhancedRefrigerantData[refrigerantCode];
        const container = document.getElementById('refrigerant-details');
        const infoContainer = document.getElementById('refrigerant-info');
        
        if (!info || !container) return;

        let html = `
            <div class="result-item">
                <span class="result-label">Safety Classification:</span>
                <span class="result-value" style="color: ${info.safety.includes('A2L') ? '#ff6b6b' : info.safety.includes('A3') ? '#e74c3c' : '#4ecdc4'}">
                    ${info.safety}
                </span>
            </div>
            <div class="result-item">
                <span class="result-label">Global Warming Potential:</span>
                <span class="result-value">${info.gwp}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Boiling Point:</span>
                <span class="result-value">${info.boilingPoint}°C (${Math.round(info.boilingPoint * 9/5 + 32)}°F)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Critical Temperature:</span>
                <span class="result-value">${info.criticalTemp}°C (${Math.round(info.criticalTemp * 9/5 + 32)}°F)</span>
            </div>
        `;

        // Add A2L specific requirements
        if (info.safety === 'A2L' && info.a2lRequirements) {
            html += `
                <div style="margin-top: 20px; padding: 15px; background: rgba(255, 107, 107, 0.1); border-radius: 8px; border: 1px solid rgba(255, 107, 107, 0.3);">
                    <h5 style="color: #ff6b6b; margin-bottom: 10px;">⚠️ A2L Safety Requirements</h5>
                    <ul style="list-style: none; padding: 0; font-size: 0.9em;">
                        <li style="margin: 5px 0;">🔍 <strong>Leak Detection:</strong> ${info.a2lRequirements.leakDetection}</li>
                        <li style="margin: 5px 0;">💨 <strong>Ventilation:</strong> ${info.a2lRequirements.ventilation}</li>
                        <li style="margin: 5px 0;">🎓 <strong>Certification:</strong> ${info.a2lRequirements.installerCert}</li>
                        <li style="margin: 5px 0;">⚙️ <strong>Equipment:</strong> ${info.a2lRequirements.equipmentStandards}</li>
                    </ul>
                </div>
            `;
        }

        // Add applications and notes
        html += `
            <div style="margin-top: 15px;">
                <h5 style="color: #4ecdc4; margin-bottom: 8px;">Applications:</h5>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${info.applications.map(app => `
                        <span style="background: rgba(78, 205, 196, 0.2); padding: 4px 8px; border-radius: 12px; font-size: 0.8em;">
                            ${app}
                        </span>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-top: 15px; padding: 10px; background: rgba(116, 185, 255, 0.1); border-radius: 5px;">
                <strong style="color: #74b9ff;">Note:</strong> ${info.notes}
            </div>
        `;

        container.innerHTML = html;
        infoContainer.style.display = 'block';
    }
}

// Enhanced psychrometric calculations
class EnhancedPsychrometrics {
    static calculateAllProperties(dryBulb, wetBulb, elevation = 0, units = 'metric') {
        // Convert to Celsius for calculations if needed
        const dbC = units === 'imperial' ? (dryBulb - 32) * 5/9 : dryBulb;
        const wbC = units === 'imperial' ? (wetBulb - 32) * 5/9 : wetBulb;
        
        const barometricPressure = 101.325 * Math.pow((1 - 0.0065 * elevation / 288.15), 5.257);
        
        const results = {
            dryBulb: units === 'imperial' ? dryBulb : dbC,
            wetBulb: units === 'imperial' ? wetBulb : wbC,
            barometricPressure: barometricPressure,
            elevation: elevation
        };

        // Calculate psychrometric properties
        const satPressureDB = this.getSaturationVaporPressure(dbC);
        const satPressureWB = this.getSaturationVaporPressure(wbC);
        
        results.humidityRatio = this.calculateHumidityRatio(wbC, dbC, barometricPressure);
        results.relativeHumidity = this.calculateRelativeHumidity(results.humidityRatio, satPressureDB, barometricPressure);
        results.dewPoint = this.calculateDewPoint(results.humidityRatio, barometricPressure);
        results.enthalpy = this.calculateEnthalpy(dbC, results.humidityRatio);
        results.specificVolume = this.calculateSpecificVolume(dbC, results.humidityRatio, barometricPressure);
        results.density = 1 / results.specificVolume;
        results.vaporPressure = (results.humidityRatio * barometricPressure) / (0.622 + results.humidityRatio);

        // Convert back to imperial if needed
        if (units === 'imperial') {
            results.dewPoint = results.dewPoint * 9/5 + 32;
            results.enthalpy = results.enthalpy * 0.4299; // Convert to BTU/lb
            results.specificVolume = results.specificVolume * 16.018; // Convert to ft³/lb
            results.density = results.density * 0.062428; // Convert to lb/ft³
        }

        // Round results for display
        Object.keys(results).forEach(key => {
            if (typeof results[key] === 'number') {
                results[key] = Math.round(results[key] * 1000) / 1000;
            }
        });

        return results;
    }

    static getSaturationVaporPressure(tempC) {
        // Enhanced Antoine equation for water vapor
        if (tempC >= 0) {
            return Math.exp(23.1964 - 3816.44 / (tempC + 227.02)) / 1000;
        } else {
            // Ice saturation pressure for below freezing
            return Math.exp(23.33086 - 6111.72784 / (tempC + 273.15)) / 1000;
        }
    }

    static calculateHumidityRatio(wetBulb, dryBulb, pressure) {
        const pws = this.getSaturationVaporPressure(wetBulb);
        const pw = pws - (pressure * (dryBulb - wetBulb) * 0.000662);
        return Math.max(0, 0.622 * pw / (pressure - pw));
    }

    static calculateRelativeHumidity(humidityRatio, satPressure, baroP) {
        const vaporPressure = (humidityRatio * baroP) / (0.622 + humidityRatio);
        return Math.min(100, Math.max(0, (vaporPressure / satPressure) * 100));
    }

    static calculateDewPoint(humidityRatio, pressure) {
        const vaporPressure = (humidityRatio * pressure) / (0.622 + humidityRatio);
        if (vaporPressure <= 0) return -50; // Minimum dew point
        return 3816.44 / (23.1964 - Math.log(vaporPressure * 1000)) - 227.02;
    }

    static calculateEnthalpy(dryBulb, humidityRatio) {
        return 1.006 * dryBulb + humidityRatio * (2501 + 1.86 * dryBulb);
    }

    static calculateSpecificVolume(dryBulb, humidityRatio, pressure) {
        return 0.287 * (dryBulb + 273.15) * (1 + 1.608 * humidityRatio) / (pressure * 1000);
    }

    // Comfort analysis
    static analyzeComfort(dryBulb, relativeHumidity, units = 'metric') {
        const tempC = units === 'imperial' ? (dryBulb - 32) * 5/9 : dryBulb;
        
        let comfort = 'Unknown';
        let recommendations = [];

        // ASHRAE comfort zone analysis
        if (tempC >= 20 && tempC <= 26 && relativeHumidity >= 30 && relativeHumidity <= 60) {
            comfort = 'Optimal';
            recommendations.push('✅ Within ASHRAE comfort zone');
        } else {
            comfort = 'Suboptimal';
            
            if (tempC < 20) {
                recommendations.push('🔥 Increase heating - temperature too low');
            } else if (tempC > 26) {
                recommendations.push('❄️ Increase cooling - temperature too high');
            }
            
            if (relativeHumidity < 30) {
                recommendations.push('💧 Add humidification - air too dry');
            } else if (relativeHumidity > 60) {
                recommendations.push('🌬️ Add dehumidification - air too humid');
            }
        }

        return { comfort, recommendations };
    }
}

// Enhanced equipment database
const enhancedEquipmentData = {
    furnaces: {
        residential: {
            sizes: [40, 60, 80, 100, 120, 140, 160],
            efficiencies: ['80% AFUE', '90% AFUE', '95% AFUE', '96%+ AFUE'],
            types: ['Single Stage', 'Two Stage', 'Modulating'],
            notes: 'Size based on heat loss calculation with 15% maximum oversizing'
        },
        commercial: {
            sizes: [200, 300, 400, 500, 750, 1000, 1500, 2000],
            efficiencies: ['80% AFUE', '85% AFUE', '90%+ AFUE'],
            types: ['Standard', 'Condensing', 'High Efficiency'],
            notes: 'Commercial units require detailed load analysis'
        }
    },
    airConditioners: {
        residential: {
            sizes: [1.5, 2, 2.5, 3, 3.5, 4, 5],
            efficiencies: ['14 SEER', '16 SEER', '18 SEER', '20+ SEER'],
            types: ['Single Stage', 'Two Stage', 'Variable Speed'],
            notes: 'Higher SEER ratings required in some provinces'
        },
        commercial: {
            sizes: [5, 7.5, 10, 15, 20, 25, 30, 40],
            efficiencies: ['10 EER', '11 EER', '12+ EER'],
            types: ['Package Unit', 'Split System', 'VRF'],
            notes: 'EER ratings for commercial applications'
        }
    }
};

// Export enhanced features for use in main application
window.enhancedRefrigerantData = enhancedRefrigerantData;
window.RefrigerantSelector = RefrigerantSelector;
window.EnhancedPsychrometrics = EnhancedPsychrometrics;
window.enhancedEquipmentData = enhancedEquipmentData;