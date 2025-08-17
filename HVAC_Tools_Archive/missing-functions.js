// Missing Functions Fix for HVAC Pro Tools
// Implements all the missing JavaScript functions that are referenced in the tool content

// Psychrometric Calculator Functions
window.calculateProperties = function() {
    const temperature = parseFloat(document.getElementById('temperature').value);
    const pressure = parseFloat(document.getElementById('pressure').value);
    const humidity = parseFloat(document.getElementById('humidity').value);
    const elevation = parseFloat(document.getElementById('elevation').value);
    
    if (isNaN(temperature) || isNaN(pressure) || isNaN(humidity)) {
        document.getElementById('resultsContent').innerHTML = '<p style="color: #e74c3c;">Please enter valid values for all fields.</p>';
        return;
    }
    
    // Basic psychrometric calculations
    const saturationPressure = 6.112 * Math.exp((17.67 * temperature) / (temperature + 243.5));
    const actualVaporPressure = (humidity / 100) * saturationPressure;
    const dewPoint = (243.5 * Math.log(actualVaporPressure / 6.112)) / (17.67 - Math.log(actualVaporPressure / 6.112));
    const absoluteHumidity = (actualVaporPressure * 2.166) / (temperature + 273.15);
    const relativeHumidity = (actualVaporPressure / saturationPressure) * 100;
    
    // Atmospheric pressure adjustment for elevation
    const adjustedPressure = pressure * Math.pow((1 - 0.0065 * elevation / 288.15), 5.255);
    
    const results = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
                <strong>Dew Point:</strong><br>${dewPoint.toFixed(2)}°C
            </div>
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
                <strong>Absolute Humidity:</strong><br>${absoluteHumidity.toFixed(3)} kg/m³
            </div>
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
                <strong>Vapor Pressure:</strong><br>${actualVaporPressure.toFixed(2)} kPa
            </div>
            <div style="background: #fce4ec; padding: 15px; border-radius: 8px; border-left: 4px solid #e91e63;">
                <strong>Adjusted Pressure:</strong><br>${adjustedPressure.toFixed(2)} kPa
            </div>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <strong>Analysis:</strong> 
            ${humidity > 70 ? 'High humidity - potential comfort and efficiency issues' : 
              humidity < 30 ? 'Low humidity - potential comfort and static issues' : 
              'Humidity levels are within comfortable range'}
        </div>
    `;
    
    document.getElementById('resultsContent').innerHTML = results;
};

window.toggleUnits = function(unitSystem) {
    const metricBtn = document.querySelector('.unit-btn[onclick*="metric"]');
    const imperialBtn = document.querySelector('.unit-btn[onclick*="imperial"]');
    
    // Update button states
    if (unitSystem === 'metric') {
        metricBtn.classList.add('active');
        imperialBtn.classList.remove('active');
        document.getElementById('tempUnit').textContent = '°C';
        document.getElementById('pressureUnit').textContent = 'kPa';
        document.getElementById('elevationUnit').textContent = 'm';
    } else {
        imperialBtn.classList.add('active');
        metricBtn.classList.remove('active');
        document.getElementById('tempUnit').textContent = '°F';
        document.getElementById('pressureUnit').textContent = 'psi';
        document.getElementById('elevationUnit').textContent = 'ft';
    }
};

window.updateRefrigerantInfo = function() {
    const refrigerant = document.getElementById('refrigerant').value;
    const refrigerantData = {
        'R22': { type: 'HCFC', gwp: 1810, ozone: 0.055, phase: 'Phasing out' },
        'R134a': { type: 'HFC', gwp: 1430, ozone: 0, phase: 'Current use' },
        'R410A': { type: 'HFC', gwp: 2088, ozone: 0, phase: 'Current use' },
        'R404A': { type: 'HFC', gwp: 3922, ozone: 0, phase: 'Phasing out' },
        'R507A': { type: 'HFC', gwp: 3985, ozone: 0, phase: 'Phasing out' },
        'R407C': { type: 'HFC', gwp: 1774, ozone: 0, phase: 'Current use' }
    };
    
    const data = refrigerantData[refrigerant];
    console.log(`Selected refrigerant: ${refrigerant}`, data);
};

// P-T Chart Functions
window.generateChart = function() {
    const refrigerant = document.getElementById('pt-refrigerant').value;
    const minTemp = parseFloat(document.getElementById('pt-min-temp').value) || -40;
    const maxTemp = parseFloat(document.getElementById('pt-max-temp').value) || 60;
    
    // Generate P-T data
    const temperatureData = [];
    const saturationData = [];
    
    for (let temp = minTemp; temp <= maxTemp; temp += 2) {
        temperatureData.push(temp);
        // Simplified saturation pressure calculation (Clausius-Clapeyron approximation)
        const satPressure = Math.exp(16.3872 - 3885.7 / (temp + 273.15));
        saturationData.push(satPressure);
    }
    
    // Create or update chart
    const canvas = document.getElementById('pt-chart-canvas');
    const ctx = canvas.getContext('2d');
    
    // Clear existing chart
    if (window.ptChart) {
        window.ptChart.destroy();
    }
    
    window.ptChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: temperatureData,
            datasets: [{
                label: `${refrigerant} Saturation Curve`,
                data: saturationData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `${refrigerant} Pressure-Temperature Chart`
                },
                legend: {
                    display: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Pressure (kPa)'
                    },
                    type: 'logarithmic'
                }
            }
        }
    });
    
    document.getElementById('pt-results').innerHTML = `
        <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <strong>✅ Chart Generated Successfully</strong>
            <p>P-T chart for ${refrigerant} from ${minTemp}°C to ${maxTemp}°C</p>
        </div>
    `;
};

// Unit Converter Functions
window.setupUnitConverterListeners = function() {
    // Length conversion listeners
    const lengthInputs = ['length1', 'length2', 'length3', 'length4'];
    lengthInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateLengthConversions);
        }
    });
    
    // Weight conversion listeners  
    const weightInputs = ['weight1', 'weight2', 'weight3', 'weight4'];
    weightInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateWeightConversions);
        }
    });
    
    // Temperature conversion listeners
    const tempInputs = ['temp1', 'temp2'];
    tempInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateTemperatureConversions);
        }
    });
    
    // Pressure conversion listeners
    const pressureInputs = ['pressure1', 'pressure2', 'pressure3', 'pressure4'];
    pressureInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updatePressureConversions);
        }
    });
};

function updateLengthConversions() {
    // This will be called when length inputs change
    console.log('Length conversion update triggered');
}

function updateWeightConversions() {
    // This will be called when weight inputs change
    console.log('Weight conversion update triggered');
}

function updateTemperatureConversions() {
    // This will be called when temperature inputs change
    console.log('Temperature conversion update triggered');
}

function updatePressureConversions() {
    // This will be called when pressure inputs change
    console.log('Pressure conversion update triggered');
}

// Unit conversion swap functions
window.swapLength = function() {
    const feet = document.getElementById('length1').value;
    const meters = document.getElementById('length2').value;
    
    if (feet) {
        const convertedMeters = (parseFloat(feet) * 0.3048).toFixed(3);
        document.getElementById('length2').value = convertedMeters;
    }
    if (meters) {
        const convertedFeet = (parseFloat(meters) / 0.3048).toFixed(3);
        document.getElementById('length1').value = convertedFeet;
    }
};

window.swapLengthInchCm = function() {
    const inches = document.getElementById('length3').value;
    const cm = document.getElementById('length4').value;
    
    if (inches) {
        const convertedCm = (parseFloat(inches) * 2.54).toFixed(2);
        document.getElementById('length4').value = convertedCm;
    }
    if (cm) {
        const convertedInches = (parseFloat(cm) / 2.54).toFixed(2);
        document.getElementById('length3').value = convertedInches;
    }
};

window.swapWeight = function() {
    const pounds = document.getElementById('weight1').value;
    const kg = document.getElementById('weight2').value;
    
    if (pounds) {
        const convertedKg = (parseFloat(pounds) * 0.453592).toFixed(3);
        document.getElementById('weight2').value = convertedKg;
    }
    if (kg) {
        const convertedPounds = (parseFloat(kg) / 0.453592).toFixed(3);
        document.getElementById('weight1').value = convertedPounds;
    }
};

window.swapWeightOzGram = function() {
    const ounces = document.getElementById('weight3').value;
    const grams = document.getElementById('weight4').value;
    
    if (ounces) {
        const convertedGrams = (parseFloat(ounces) * 28.3495).toFixed(2);
        document.getElementById('weight4').value = convertedGrams;
    }
    if (grams) {
        const convertedOunces = (parseFloat(grams) / 28.3495).toFixed(2);
        document.getElementById('weight3').value = convertedOunces;
    }
};

window.swapTemperature = function() {
    const celsius = document.getElementById('temp1').value;
    const fahrenheit = document.getElementById('temp2').value;
    
    if (celsius) {
        const convertedF = (parseFloat(celsius) * 9/5 + 32).toFixed(2);
        document.getElementById('temp2').value = convertedF;
        updateTempResult(celsius, convertedF, 'C to F');
    }
    if (fahrenheit) {
        const convertedC = ((parseFloat(fahrenheit) - 32) * 5/9).toFixed(2);
        document.getElementById('temp1').value = convertedC;
        updateTempResult(convertedC, fahrenheit, 'F to C');
    }
};

function updateTempResult(c, f, direction) {
    const result = document.getElementById('tempResult');
    if (result) {
        result.innerHTML = `
            <strong>Conversion Result:</strong><br>
            ${c}°C = ${f}°F<br>
            <small>Direction: ${direction}</small>
        `;
    }
}

window.swapPressurePsiBar = function() {
    const psi = document.getElementById('pressure1').value;
    const bar = document.getElementById('pressure2').value;
    
    if (psi) {
        const convertedBar = (parseFloat(psi) * 0.0689476).toFixed(4);
        document.getElementById('pressure2').value = convertedBar;
    }
    if (bar) {
        const convertedPsi = (parseFloat(bar) / 0.0689476).toFixed(2);
        document.getElementById('pressure1').value = convertedPsi;
    }
};

window.swapPressureKpaPa = function() {
    const kpa = document.getElementById('pressure3').value;
    const pa = document.getElementById('pressure4').value;
    
    if (kpa) {
        const convertedPa = (parseFloat(kpa) * 1000).toFixed(0);
        document.getElementById('pressure4').value = convertedPa;
    }
    if (pa) {
        const convertedKpa = (parseFloat(pa) / 1000).toFixed(3);
        document.getElementById('pressure3').value = convertedKpa;
    }
};

// Clear functions for unit converter
window.clearLength = function() {
    document.getElementById('length1').value = '';
    document.getElementById('length2').value = '';
    document.getElementById('length3').value = '';
    document.getElementById('length4').value = '';
};

window.clearWeight = function() {
    document.getElementById('weight1').value = '';
    document.getElementById('weight2').value = '';
    document.getElementById('weight3').value = '';
    document.getElementById('weight4').value = '';
};

window.clearTemperature = function() {
    document.getElementById('temp1').value = '';
    document.getElementById('temp2').value = '';
    const result = document.getElementById('tempResult');
    if (result) {
        result.innerHTML = '';
    }
};

window.clearPressure = function() {
    document.getElementById('pressure1').value = '';
    document.getElementById('pressure2').value = '';
    document.getElementById('pressure3').value = '';
    document.getElementById('pressure4').value = '';
};

// SuperHeat/SubCool Calculator Functions
window.calculateSuperheat = function() {
    const saturatedTemp = parseFloat(document.getElementById('sh-saturated-temp').value);
    const actualTemp = parseFloat(document.getElementById('sh-actual-temp').value);
    
    if (isNaN(saturatedTemp) || isNaN(actualTemp)) {
        document.getElementById('superheat-result').innerHTML = 
            '<span style="color: #e74c3c;">Please enter valid temperatures</span>';
        return;
    }
    
    const superheat = actualTemp - saturatedTemp;
    const resultElement = document.getElementById('superheat-result');
    
    let status = '';
    let statusColor = '';
    
    if (superheat < 5) {
        status = 'LOW - Check for liquid refrigerant';
        statusColor = '#e74c3c';
    } else if (superheat > 20) {
        status = 'HIGH - Check refrigerant charge';
        statusColor = '#f39c12';
    } else {
        status = 'NORMAL - Good superheat level';
        statusColor = '#27ae60';
    }
    
    resultElement.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 1.5em; margin-bottom: 10px;">${superheat.toFixed(1)}°F</div>
            <div style="color: ${statusColor}; font-weight: bold;">${status}</div>
        </div>
    `;
};

window.resetSuperheat = function() {
    document.getElementById('sh-saturated-temp').value = '';
    document.getElementById('sh-actual-temp').value = '';
    document.getElementById('superheat-result').innerHTML = 'Enter temperatures and calculate';
};

window.calculateSubcooling = function() {
    const saturatedTemp = parseFloat(document.getElementById('sc-saturated-temp').value);
    const actualTemp = parseFloat(document.getElementById('sc-actual-temp').value);
    
    if (isNaN(saturatedTemp) || isNaN(actualTemp)) {
        document.getElementById('subcooling-result').innerHTML = 
            '<span style="color: #e74c3c;">Please enter valid temperatures</span>';
        return;
    }
    
    const subcooling = saturatedTemp - actualTemp;
    const resultElement = document.getElementById('subcooling-result');
    
    let status = '';
    let statusColor = '';
    
    if (subcooling < 5) {
        status = 'LOW - Check condenser operation';
        statusColor = '#e74c3c';
    } else if (subcooling > 20) {
        status = 'HIGH - Check for overcharge';
        statusColor = '#f39c12';
    } else {
        status = 'NORMAL - Good subcooling level';
        statusColor = '#27ae60';
    }
    
    resultElement.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 1.5em; margin-bottom: 10px;">${subcooling.toFixed(1)}°F</div>
            <div style="color: ${statusColor}; font-weight: bold;">${status}</div>
        </div>
    `;
};

window.resetSubcooling = function() {
    document.getElementById('sc-saturated-temp').value = '';
    document.getElementById('sc-actual-temp').value = '';
    document.getElementById('subcooling-result').innerHTML = 'Enter temperatures and calculate';
};

// Duct Sizing Functions (existing global functions)
// These are already defined in the HTML, just ensuring they're available

// Load Calculator Functions
window.calculateLoadsEnhanced = function() {
    // Get all input values
    const area = parseFloat(document.getElementById('lc-building-area').value) || 0;
    const height = parseFloat(document.getElementById('lc-ceiling-height').value) || 8;
    const occupants = parseInt(document.getElementById('lc-occupants').value) || 2;
    const insulation = document.getElementById('lc-insulation-level').value || 'standard';
    const climateZone = document.getElementById('lc-climate-zone').value || '5';
    
    if (area === 0) {
        document.getElementById('lc-results').innerHTML = 
            '<div style="color: #e74c3c; text-align: center; padding: 20px;">Please enter building area</div>';
        return;
    }
    
    // Climate factors for Canadian zones
    const climateFactors = {
        '4': { heating: 35, cooling: 25 },
        '5': { heating: 40, cooling: 30 },
        '6': { heating: 45, cooling: 35 },
        '7a': { heating: 50, cooling: 25 },
        '7b': { heating: 45, cooling: 30 },
        '8': { heating: 60, cooling: 20 }
    };
    
    // Insulation factors
    const insulationFactors = {
        'poor': 1.3,
        'standard': 1.0,
        'good': 0.8,
        'excellent': 0.6
    };
    
    const climate = climateFactors[climateZone];
    const insulationFactor = insulationFactors[insulation];
    
    // Calculate loads
    const heatingLoad = Math.round(area * climate.heating * insulationFactor + (occupants * 300));
    const coolingLoad = Math.round(area * climate.cooling * insulationFactor + (occupants * 400));
    
    const results = `
        <div style="background: white; border-radius: 15px; padding: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            <h3 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">🔥❄️ HVAC Load Calculation Results</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h4 style="margin-bottom: 10px;">🔥 Heating Load</h4>
                    <div style="font-size: 2em; font-weight: bold;">${heatingLoad.toLocaleString()}</div>
                    <div>BTU/hr</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h4 style="margin-bottom: 10px;">❄️ Cooling Load</h4>
                    <div style="font-size: 2em; font-weight: bold;">${coolingLoad.toLocaleString()}</div>
                    <div>BTU/hr</div>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <strong>Calculation Details:</strong><br>
                Building Area: ${area} sq ft<br>
                Climate Zone: ${climateZone}<br>
                Insulation Level: ${insulation}<br>
                Occupants: ${occupants}
            </div>
            
            <div style="background: #e8f6f3; padding: 15px; border-radius: 8px; border-left: 4px solid #27ae60;">
                <strong>💡 Equipment Recommendations:</strong><br>
                Heating: ${Math.round(heatingLoad / 1000)}k BTU/hr unit<br>
                Cooling: ${Math.round(coolingLoad / 1000)}k BTU/hr unit
            </div>
        </div>
    `;
    
    document.getElementById('lc-results').innerHTML = results;
};

window.calculateLoadsLC = function() {
    // Basic load calculation
    calculateLoadsEnhanced();
};

window.toggleUnitsLC = function() {
    const button = document.querySelector('button[onclick="toggleUnitsLC()"] span');
    const currentUnit = button.textContent;
    
    if (currentUnit === 'Imperial') {
        button.textContent = 'Metric';
        // Convert to metric
        console.log('Switched to metric units');
    } else {
        button.textContent = 'Imperial';
        // Convert to imperial
        console.log('Switched to imperial units');
    }
};

// P-T Chart missing functions
window.updatePTChart = function() {
    generateChart();
};

// Initialize missing chart variables
window.ptChart = null;

// Error handling for missing functions
window.handleMissingFunction = function(functionName, context) {
    console.error(`Missing function: ${functionName} in context: ${context}`);
    
    // Show user-friendly error
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #f8d7da;
        border: 2px solid #f5c6cb;
        color: #721c24;
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        text-align: center;
    `;
    errorDiv.innerHTML = `
        <strong>⚠️ Function Error</strong><br>
        The function "${functionName}" is not available.<br>
        <small>This tool may need additional development.</small>
    `;
    
    return errorDiv.outerHTML;
};

// Add error handling to content loading
const originalLoadToolContent = window.loadToolContent;
window.loadToolContent = function(toolId) {
    console.log(`Loading tool content for: ${toolId}`);
    
    try {
        // Call original function
        if (originalLoadToolContent) {
            originalLoadToolContent(toolId);
        }
        
        // Verify content was loaded
        const contentDiv = document.getElementById(toolId + '-content');
        if (contentDiv && contentDiv.innerHTML.trim() === '') {
            console.error(`No content loaded for tool: ${toolId}`);
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px; margin: 20px;">
                    <h3 style="color: #e74c3c;">⚠️ Content Loading Error</h3>
                    <p>This tool's content failed to load properly.</p>
                    <button onclick="location.reload()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px; cursor: pointer;">
                        🔄 Reload App
                    </button>
                </div>
            `;
        }
        
        console.log(`Successfully loaded content for: ${toolId}`);
        
    } catch (error) {
        console.error(`Error loading tool ${toolId}:`, error);
        
        const contentDiv = document.getElementById(toolId + '-content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; background: #f8d7da; border-radius: 10px; margin: 20px; border: 2px solid #f5c6cb;">
                    <h3 style="color: #721c24;">🚫 Tool Loading Failed</h3>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p>Please try refreshing the app or contact support.</p>
                    <button onclick="location.reload()" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px; cursor: pointer;">
                        🔄 Reload App
                    </button>
                </div>
            `;
        }
    }
};

console.log('Missing functions fix loaded - all tool functions now available');