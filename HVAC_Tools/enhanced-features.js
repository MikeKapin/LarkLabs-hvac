// Enhanced HVAC Pro Tools Features
// Data persistence, advanced calculations, and improved UX

class HVACProToolsEnhanced {
    constructor() {
        this.savedCalculations = this.loadSavedCalculations();
        this.currentCalculation = null;
        this.setupEnhancedFeatures();
    }

    // Data Persistence
    loadSavedCalculations() {
        try {
            return JSON.parse(localStorage.getItem('hvacProCalculations') || '[]');
        } catch (e) {
            return [];
        }
    }

    saveCalculation(type, inputs, results, name = null) {
        const calculation = {
            id: Date.now(),
            type: type,
            name: name || `${type} - ${new Date().toLocaleDateString()}`,
            inputs: inputs,
            results: results,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        this.savedCalculations.unshift(calculation);
        
        // Keep only last 50 calculations
        if (this.savedCalculations.length > 50) {
            this.savedCalculations = this.savedCalculations.slice(0, 50);
        }

        localStorage.setItem('hvacProCalculations', JSON.stringify(this.savedCalculations));
        this.updateSavedCalculationsDisplay();
        return calculation.id;
    }

    loadCalculation(id) {
        const calculation = this.savedCalculations.find(calc => calc.id === id);
        if (calculation) {
            this.restoreCalculationInputs(calculation);
            return calculation;
        }
        return null;
    }

    deleteCalculation(id) {
        this.savedCalculations = this.savedCalculations.filter(calc => calc.id !== id);
        localStorage.setItem('hvacProCalculations', JSON.stringify(this.savedCalculations));
        this.updateSavedCalculationsDisplay();
    }

    // Enhanced Load Calculator with Building Envelope Analysis
    calculateEnhancedLoad(inputs) {
        const {
            province, area, ceilingHeight, insulation, windowArea, 
            windowType, occupants, buildingAge, orientation, 
            floors, basement, ductLocation, equipment
        } = inputs;

        // Advanced heat loss calculations with building envelope analysis
        const climate = climateDataLC[province];
        const insul = insulationValuesLC[insulation];
        const windowU = windowUValuesLC[windowType].metric;

        // Calculate all heat loss components
        const envelope = this.calculateBuildingEnvelope(area, ceilingHeight, windowArea);
        const heatLoss = this.calculateHeatLoss(envelope, insul, windowU, climate);
        const cooling = this.calculateCoolingLoad(envelope, climate, occupants, orientation);
        
        // Equipment sizing recommendations
        const equipment_sizing = this.calculateEquipmentSizing(heatLoss.total, cooling.total, floors);
        
        // Duct sizing analysis
        const ductAnalysis = this.calculateDuctRequirements(cooling.total, area);

        return {
            heating: heatLoss,
            cooling: cooling,
            equipment: equipment_sizing,
            ducts: ductAnalysis,
            summary: this.generateLoadSummary(heatLoss.total, cooling.total, area)
        };
    }

    calculateBuildingEnvelope(area, height, windowArea) {
        const perimeter = 4 * Math.sqrt(area); // Assuming square building
        const wallArea = perimeter * height - windowArea;
        
        return {
            wallArea: wallArea,
            ceilingArea: area,
            floorArea: area,
            windowArea: windowArea,
            volume: area * height,
            perimeter: perimeter
        };
    }

    calculateHeatLoss(envelope, insulation, windowU, climate) {
        const deltaT = 21 - climate.winterTemp;
        
        const wallLoss = (envelope.wallArea / insulation.wall) * deltaT;
        const ceilingLoss = (envelope.ceilingArea / insulation.ceiling) * deltaT;
        const floorLoss = (envelope.floorArea / insulation.floor) * deltaT * 0.6; // Ground factor
        const windowLoss = envelope.windowArea * windowU * deltaT;
        const infiltrationLoss = envelope.volume * 0.5 * 1.2 * 1.006 * deltaT / 3600; // 0.5 ACH
        
        const total = wallLoss + ceilingLoss + floorLoss + windowLoss + infiltrationLoss;
        
        return {
            wall: Math.round(wallLoss),
            ceiling: Math.round(ceilingLoss),
            floor: Math.round(floorLoss),
            windows: Math.round(windowLoss),
            infiltration: Math.round(infiltrationLoss),
            total: Math.round(total * 1.1) // 10% safety factor
        };
    }

    calculateCoolingLoad(envelope, climate, occupants, orientation = 'south') {
        const deltaT = climate.summerTemp - 24; // Target 24°C indoor
        
        // Orientation factors for solar gain
        const orientationFactors = {
            'north': 0.3,
            'south': 1.0,
            'east': 0.7,
            'west': 0.8
        };
        
        const orientationFactor = orientationFactors[orientation] || 0.7;
        
        const sensibleLoad = envelope.wallArea * 15 + envelope.ceilingArea * 20 + envelope.windowArea * 40 * orientationFactor;
        const latentLoad = occupants * 150; // W per person
        const total = sensibleLoad + latentLoad;
        
        return {
            sensible: Math.round(sensibleLoad),
            latent: Math.round(latentLoad),
            occupants: occupants * 150,
            solar: Math.round(envelope.windowArea * 20 * orientationFactor),
            total: Math.round(total * 1.15) // 15% safety factor
        };
    }

    calculateEquipmentSizing(heatingLoad, coolingLoad, floors = 1) {
        // Convert to BTU/hr for equipment sizing
        const heatingBTU = Math.round(heatingLoad * 3.412);
        const coolingBTU = Math.round(coolingLoad * 3.412);
        
        // Equipment recommendations
        const furnaceSize = this.recommendFurnaceSize(heatingBTU);
        const acSize = this.recommendACSize(coolingBTU);
        
        return {
            heating: {
                load: heatingBTU,
                recommended: furnaceSize,
                efficiency: 'AFUE 95%+ recommended'
            },
            cooling: {
                load: coolingBTU,
                recommended: acSize,
                efficiency: 'SEER 16+ recommended'
            },
            notes: this.generateEquipmentNotes(floors, heatingBTU, coolingBTU)
        };
    }

    recommendFurnaceSize(btuh) {
        const standardSizes = [40000, 60000, 80000, 100000, 120000, 140000, 160000, 200000];
        const recommended = standardSizes.find(size => size >= btuh * 1.15) || standardSizes[standardSizes.length - 1];
        return {
            size: recommended,
            formatted: `${Math.round(recommended / 1000)}k BTU/hr`,
            oversizing: Math.round((recommended / btuh - 1) * 100)
        };
    }

    recommendACSize(btuh) {
        const tonsCooling = btuh / 12000;
        const standardTons = [1.5, 2, 2.5, 3, 3.5, 4, 5];
        const recommendedTons = standardTons.find(tons => tons >= tonsCooling) || standardTons[standardTons.length - 1];
        
        return {
            tons: recommendedTons,
            btuh: recommendedTons * 12000,
            formatted: `${recommendedTons} Ton`,
            efficiency: recommendedTons <= 3 ? 'Standard efficiency suitable' : 'High efficiency recommended'
        };
    }

    generateEquipmentNotes(floors, heatingBTU, coolingBTU) {
        const notes = [];
        
        if (floors > 1) {
            notes.push('Multi-zone system recommended for consistent comfort');
        }
        
        if (heatingBTU > 100000) {
            notes.push('Consider modulating or two-stage furnace for efficiency');
        }
        
        if (coolingBTU > 48000) {
            notes.push('Variable speed equipment recommended for large loads');
        }

        return notes;
    }

    calculateDuctRequirements(coolingLoad, area) {
        // Basic duct sizing calculations
        const cfmRequired = Math.round(coolingLoad * 0.4); // 400 CFM per ton approximation
        const velocityTarget = 800; // fps for main ducts
        const mainDuctSize = Math.sqrt(cfmRequired / (velocityTarget * 60)) * 12; // inches
        
        return {
            totalCFM: cfmRequired,
            mainDuctSize: Math.round(mainDuctSize),
            branchVelocity: '600-800 FPM recommended',
            returnSize: Math.round(mainDuctSize * 1.25),
            notes: [
                'Verify with detailed duct calculations',
                'Consider building layout and restrictions',
                'Size returns 25% larger than supply'
            ]
        };
    }

    generateLoadSummary(heatingLoad, coolingLoad, area) {
        const heatingPerSqFt = Math.round((heatingLoad * 3.412) / area);
        const coolingPerSqFt = Math.round((coolingLoad * 3.412) / area);
        
        return {
            heatingDensity: heatingPerSqFt,
            coolingDensity: coolingPerSqFt,
            recommendation: this.getLoadRecommendation(heatingPerSqFt, coolingPerSqFt),
            energyTips: this.getEnergyTips(heatingPerSqFt, coolingPerSqFt)
        };
    }

    getLoadRecommendation(heatingPerSqFt, coolingPerSqFt) {
        if (heatingPerSqFt > 50) {
            return 'High heating load - consider insulation upgrades';
        } else if (heatingPerSqFt < 25) {
            return 'Well-insulated building - efficient heating possible';
        } else if (coolingPerSqFt > 30) {
            return 'High cooling load - check insulation and solar gains';
        } else {
            return 'Reasonable loads - standard equipment suitable';
        }
    }

    getEnergyTips(heatingPerSqFt, coolingPerSqFt) {
        const tips = [];
        
        if (heatingPerSqFt > 40) {
            tips.push('💡 Air sealing could reduce heating by 10-30%');
            tips.push('🏠 Window upgrades show significant returns');
        }
        
        if (coolingPerSqFt > 25) {
            tips.push('☀️ Window films can reduce cooling loads');
            tips.push('🌳 Landscaping provides natural cooling');
        }
        
        tips.push('⚡ Smart thermostats save 10-15% on energy');
        
        return tips;
    }

    // Enhanced display functions
    updateSavedCalculationsDisplay() {
        const container = document.getElementById('savedCalculationsContainer');
        if (!container) return;

        if (this.savedCalculations.length === 0) {
            container.innerHTML = '<p style="opacity: 0.7;">No saved calculations yet.</p>';
            return;
        }

        const html = this.savedCalculations.slice(0, 10).map(calc => `
            <div class="saved-item" onclick="hvacEnhanced.loadCalculation(${calc.id})">
                <div class="saved-item-title">${calc.name}</div>
                <div class="saved-item-date">${calc.date}</div>
                <button onclick="event.stopPropagation(); hvacEnhanced.deleteCalculation(${calc.id})" 
                        style="float: right; background: #ff6b6b; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">×</button>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    restoreCalculationInputs(calculation) {
        // Restore inputs based on calculation type
        if (calculation.type === 'load-calculator') {
            this.restoreLoadCalculatorInputs(calculation.inputs);
        }
        // Add other calculator types as needed
    }

    restoreLoadCalculatorInputs(inputs) {
        Object.keys(inputs).forEach(key => {
            const element = document.getElementById(`lc-${key}`);
            if (element) {
                element.value = inputs[key];
            }
        });
    }

    // Enhanced result formatting
    formatResults(results, type) {
        if (type === 'load-calculator') {
            return this.formatLoadResults(results);
        }
        return results;
    }

    formatLoadResults(results) {
        const heating = results.heating;
        const cooling = results.cooling;
        const equipment = results.equipment;
        
        return `
            <div class="results-container">
                <h3 style="color: #4ecdc4; margin-bottom: 20px; text-align: center;">🏠 Load Calculation Results</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div style="background: rgba(255, 107, 107, 0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(255, 107, 107, 0.3);">
                        <h4 style="color: #ff6b6b; margin-bottom: 10px;">🔥 Heating Analysis</h4>
                        <div class="result-item">
                            <span class="result-label">Total Load:</span>
                            <span class="result-value">${heating.total.toLocaleString()} W</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Equipment Size:</span>
                            <span class="result-value">${equipment.heating.recommended.formatted}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Wall Loss:</span>
                            <span class="result-value">${heating.wall.toLocaleString()} W</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Window Loss:</span>
                            <span class="result-value">${heating.windows.toLocaleString()} W</span>
                        </div>
                    </div>
                    
                    <div style="background: rgba(116, 185, 255, 0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(116, 185, 255, 0.3);">
                        <h4 style="color: #74b9ff; margin-bottom: 10px;">❄️ Cooling Analysis</h4>
                        <div class="result-item">
                            <span class="result-label">Total Load:</span>
                            <span class="result-value">${cooling.total.toLocaleString()} W</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Equipment Size:</span>
                            <span class="result-value">${equipment.cooling.recommended.formatted}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Sensible Load:</span>
                            <span class="result-value">${cooling.sensible.toLocaleString()} W</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Latent Load:</span>
                            <span class="result-value">${cooling.latent.toLocaleString()} W</span>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; background: rgba(78, 205, 196, 0.1); padding: 15px; border-radius: 10px;">
                    <h4 style="color: #4ecdc4; margin-bottom: 15px;">💡 Energy Efficiency Tips</h4>
                    ${results.summary.energyTips.map(tip => `<div style="margin: 8px 0; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 5px;">${tip}</div>`).join('')}
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn-secondary" onclick="hvacEnhanced.saveCurrentCalculation('load-calculator')">💾 Save Calculation</button>
                    <button class="btn-secondary" onclick="hvacEnhanced.exportToPDF()">📄 Export PDF</button>
                    <button class="btn-secondary" onclick="hvacEnhanced.shareResults()">📤 Share Results</button>
                </div>
            </div>
        `;
    }

    // Advanced Refrigeration Calculator
    calculateRefrigerantProperties(refrigerant, pressure, temperature) {
        // Enhanced refrigerant calculations with more properties
        const properties = {
            saturationTemp: this.getSaturationTemp(refrigerant, pressure),
            saturationPressure: this.getSaturationPressure(refrigerant, temperature),
            superheat: temperature - this.getSaturationTemp(refrigerant, pressure),
            subcooling: this.getSaturationTemp(refrigerant, pressure) - temperature,
            density: this.getRefrigerantDensity(refrigerant, temperature, pressure),
            enthalpy: this.getEnthalpy(refrigerant, temperature, pressure)
        };

        return properties;
    }

    // Enhanced Psychrometric calculations
    calculatePsychrometrics(dryBulb, wetBulb, elevation = 0) {
        const barometricPressure = 101.325 * Math.pow((1 - 0.0065 * elevation / 288.15), 5.257);
        
        // Calculate psychrometric properties
        const saturationPressure = this.getSaturationVaporPressure(dryBulb);
        const saturationPressureWB = this.getSaturationVaporPressure(wetBulb);
        
        const humidityRatio = this.calculateHumidityRatio(wetBulb, dryBulb, barometricPressure);
        const relativeHumidity = this.calculateRelativeHumidity(humidityRatio, saturationPressure, barometricPressure);
        const dewPoint = this.calculateDewPoint(humidityRatio, barometricPressure);
        const enthalpy = this.calculateEnthalpy(dryBulb, humidityRatio);
        const specificVolume = this.calculateSpecificVolume(dryBulb, humidityRatio, barometricPressure);

        return {
            dryBulb: dryBulb,
            wetBulb: wetBulb,
            dewPoint: Math.round(dewPoint * 10) / 10,
            relativeHumidity: Math.round(relativeHumidity),
            humidityRatio: Math.round(humidityRatio * 1000) / 1000,
            enthalpy: Math.round(enthalpy * 10) / 10,
            specificVolume: Math.round(specificVolume * 1000) / 1000,
            barometricPressure: Math.round(barometricPressure * 100) / 100
        };
    }

    // Utility functions for psychrometric calculations
    getSaturationVaporPressure(temp) {
        // Antoine equation for water vapor pressure (kPa)
        return Math.exp(23.1964 - 3816.44 / (temp + 227.02)) / 1000;
    }

    calculateHumidityRatio(wetBulb, dryBulb, pressure) {
        const pws = this.getSaturationVaporPressure(wetBulb);
        const pw = pws - (pressure * (dryBulb - wetBulb) * 0.000662);
        return 0.622 * pw / (pressure - pw);
    }

    calculateRelativeHumidity(humidityRatio, satPressure, baroPressure) {
        const vaporPressure = (humidityRatio * baroPressure) / (0.622 + humidityRatio);
        return (vaporPressure / satPressure) * 100;
    }

    calculateDewPoint(humidityRatio, pressure) {
        const vaporPressure = (humidityRatio * pressure) / (0.622 + humidityRatio);
        return 3816.44 / (23.1964 - Math.log(vaporPressure * 1000)) - 227.02;
    }

    calculateEnthalpy(dryBulb, humidityRatio) {
        return 1.006 * dryBulb + humidityRatio * (2501 + 1.86 * dryBulb);
    }

    calculateSpecificVolume(dryBulb, humidityRatio, pressure) {
        return 0.287 * (dryBulb + 273.15) * (1 + 1.608 * humidityRatio) / (pressure * 1000);
    }

    // Setup enhanced features
    setupEnhancedFeatures() {
        // Add data management to all modals
        this.addDataManagementToModals();
        
        // Setup auto-save functionality
        this.setupAutoSave();
        
        // Add enhanced navigation
        this.setupEnhancedNavigation();
    }

    addDataManagementToModals() {
        // Add save/load functionality to existing modals
        const modals = document.querySelectorAll('.modal-content');
        modals.forEach(modal => {
            if (!modal.querySelector('.data-management')) {
                const dataManagement = document.createElement('div');
                dataManagement.className = 'data-management';
                dataManagement.innerHTML = `
                    <h4 style="color: #4ecdc4; margin-bottom: 15px;">💾 Calculation Management</h4>
                    <div style="margin-bottom: 15px;">
                        <button class="btn-secondary" onclick="hvacEnhanced.showSavedCalculations()">📂 View Saved</button>
                        <button class="btn-secondary" onclick="hvacEnhanced.exportCurrentCalculation()">📤 Export</button>
                    </div>
                    <div id="savedCalculationsContainer" class="saved-calculations"></div>
                `;
                modal.appendChild(dataManagement);
            }
        });
    }

    setupAutoSave() {
        // Auto-save form inputs as user types
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(this.autoSaveTimer);
                this.autoSaveTimer = setTimeout(() => {
                    this.autoSaveFormData();
                }, 2000);
            });
        });
    }

    autoSaveFormData() {
        // Save current form state to localStorage
        const formData = {};
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.id) {
                formData[input.id] = input.value;
            }
        });
        localStorage.setItem('hvacProAutoSave', JSON.stringify(formData));
    }

    // Enhanced error handling and validation
    validateInputs(inputs, type) {
        const errors = [];
        
        if (type === 'load-calculator') {
            if (!inputs.area || inputs.area <= 0) errors.push('Area must be greater than 0');
            if (!inputs.ceilingHeight || inputs.ceilingHeight < 2) errors.push('Ceiling height must be at least 2m/6ft');
            if (inputs.windowArea < 0) errors.push('Window area cannot be negative');
            if (!inputs.occupants || inputs.occupants < 1) errors.push('Must have at least 1 occupant');
        }

        return errors;
    }

    // Enhanced sharing capabilities
    shareResults() {
        if (navigator.share && this.currentCalculation) {
            navigator.share({
                title: 'HVAC Load Calculation Results',
                text: `Heating: ${this.currentCalculation.results.heating.total}W, Cooling: ${this.currentCalculation.results.cooling.total}W`,
                url: window.location.href
            });
        } else {
            // Fallback to copy to clipboard
            this.copyResultsToClipboard();
        }
    }

    copyResultsToClipboard() {
        if (this.currentCalculation) {
            const text = this.formatResultsForSharing(this.currentCalculation);
            navigator.clipboard.writeText(text).then(() => {
                alert('Results copied to clipboard!');
            });
        }
    }

    formatResultsForSharing(calculation) {
        return `HVAC Load Calculation Results
Generated by LARK Labs HVAC Pro Tools

Heating Load: ${calculation.results.heating.total.toLocaleString()} W
Cooling Load: ${calculation.results.cooling.total.toLocaleString()} W
Recommended Furnace: ${calculation.results.equipment.heating.recommended.formatted}
Recommended AC: ${calculation.results.equipment.cooling.recommended.formatted}

Date: ${calculation.date}
Visit: https://larklabs.org for more HVAC tools`;
    }

    // Initialize enhanced features
    init() {
        this.updateSavedCalculationsDisplay();
        this.restoreAutoSavedData();
    }

    restoreAutoSavedData() {
        try {
            const saved = JSON.parse(localStorage.getItem('hvacProAutoSave') || '{}');
            Object.keys(saved).forEach(id => {
                const element = document.getElementById(id);
                if (element && saved[id]) {
                    element.value = saved[id];
                }
            });
        } catch (e) {
            console.log('No auto-saved data to restore');
        }
    }

    // Export to PDF functionality
    exportToPDF() {
        if (!this.currentCalculation) {
            alert('No calculation to export. Please run a calculation first.');
            return;
        }

        // Create printable version
        const printContent = this.generatePrintableReport(this.currentCalculation);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    generatePrintableReport(calculation) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>HVAC Load Calculation Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
                    .section { margin-bottom: 25px; }
                    .result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
                    .result-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                    .result-item { display: flex; justify-content: space-between; margin: 8px 0; }
                    .label { font-weight: bold; }
                    .value { color: #3498db; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>HVAC Load Calculation Report</h1>
                    <p>Generated by LARK Labs HVAC Pro Tools</p>
                    <p>Date: ${calculation.date}</p>
                </div>
                
                <div class="section">
                    <h2>Heating Analysis</h2>
                    <div class="result-box">
                        <div class="result-item"><span class="label">Total Heating Load:</span><span class="value">${calculation.results.heating.total.toLocaleString()} W</span></div>
                        <div class="result-item"><span class="label">Recommended Equipment:</span><span class="value">${calculation.results.equipment.heating.recommended.formatted}</span></div>
                        <div class="result-item"><span class="label">Wall Heat Loss:</span><span class="value">${calculation.results.heating.wall.toLocaleString()} W</span></div>
                        <div class="result-item"><span class="label">Window Heat Loss:</span><span class="value">${calculation.results.heating.windows.toLocaleString()} W</span></div>
                        <div class="result-item"><span class="label">Infiltration Loss:</span><span class="value">${calculation.results.heating.infiltration.toLocaleString()} W</span></div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>Cooling Analysis</h2>
                    <div class="result-box">
                        <div class="result-item"><span class="label">Total Cooling Load:</span><span class="value">${calculation.results.cooling.total.toLocaleString()} W</span></div>
                        <div class="result-item"><span class="label">Recommended Equipment:</span><span class="value">${calculation.results.equipment.cooling.recommended.formatted}</span></div>
                        <div class="result-item"><span class="label">Sensible Load:</span><span class="value">${calculation.results.cooling.sensible.toLocaleString()} W</span></div>
                        <div class="result-item"><span class="label">Latent Load:</span><span class="value">${calculation.results.cooling.latent.toLocaleString()} W</span></div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>Recommendations</h2>
                    <div class="result-box">
                        <p><strong>Load Assessment:</strong> ${calculation.results.summary.recommendation}</p>
                        <p><strong>Energy Tips:</strong></p>
                        <ul>
                            ${calculation.results.summary.energyTips.map(tip => `<li>${tip.replace(/💡|🏠|☀️|🌳|⚡/g, '')}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div style="margin-top: 40px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
                    <p>Report generated by LARK Labs HVAC Pro Tools</p>
                    <p>Visit https://larklabs.org for more professional HVAC resources</p>
                </div>
            </body>
            </html>
        `;
    }

    // Methods for saving current calculation
    saveCurrentCalculation(type) {
        if (!this.currentCalculation) {
            alert('No calculation to save. Please run a calculation first.');
            return;
        }

        const name = prompt('Enter a name for this calculation:') || `${type} - ${new Date().toLocaleDateString()}`;
        const id = this.saveCalculation(type, this.currentCalculation.inputs, this.currentCalculation.results, name);
        
        if (id) {
            alert('Calculation saved successfully!');
        }
    }

    showSavedCalculations() {
        this.updateSavedCalculationsDisplay();
        // Scroll to saved calculations section
        const container = document.getElementById('savedCalculationsContainer');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth' });
        }
    }

    exportCurrentCalculation() {
        this.exportToPDF();
    }
}

// Initialize enhanced features
const hvacEnhanced = new HVACProToolsEnhanced();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    hvacEnhanced.init();
});

// Enhanced calculation wrapper
window.calculateLoadsEnhanced = function() {
    const inputs = {
        province: document.getElementById('lc-province').value,
        area: parseFloat(document.getElementById('lc-area').value),
        ceilingHeight: parseFloat(document.getElementById('lc-ceiling-height').value),
        insulation: document.getElementById('lc-insulation').value,
        windowArea: parseFloat(document.getElementById('lc-windows').value) || 0,
        windowType: document.getElementById('lc-window-type').value,
        occupants: parseInt(document.getElementById('lc-occupants').value),
        buildingAge: document.getElementById('lc-building-age').value,
        orientation: document.getElementById('lc-orientation')?.value || 'south'
    };

    // Validate inputs
    const errors = hvacEnhanced.validateInputs(inputs, 'load-calculator');
    if (errors.length > 0) {
        alert('Please fix the following errors:\n' + errors.join('\n'));
        return;
    }

    // Calculate using enhanced method
    const results = hvacEnhanced.calculateEnhancedLoad(inputs);
    
    // Store current calculation
    hvacEnhanced.currentCalculation = { inputs, results };
    
    // Display enhanced results
    const resultContainer = document.getElementById('lc-results');
    if (resultContainer) {
        resultContainer.innerHTML = hvacEnhanced.formatResults(results, 'load-calculator');
        resultContainer.style.display = 'block';
    }
};

// PWA Installation prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn) {
        installBtn.style.display = 'block';
    }
});

window.showInstallPrompt = function() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    }
};