// Chart.js configurations and utilities for HVAC Pro Tools

// Global chart configuration
Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
Chart.defaults.color = '#333';
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

// HVAC Chart Utilities
class HVACChartUtils {
    
    // Color schemes for different chart types
    static colorSchemes = {
        temperature: {
            heating: ['#ff6b6b', '#ee5a24', '#fd79a8'],
            cooling: ['#74b9ff', '#0984e3', '#00b894']
        },
        pressure: {
            low: ['#00b894', '#00cec9'],
            medium: ['#fdcb6e', '#e17055'],
            high: ['#d63031', '#a29bfe']
        },
        efficiency: {
            good: ['#00b894', '#00cec9'],
            average: ['#fdcb6e', '#f39c12'],
            poor: ['#e17055', '#d63031']
        }
    };

    // Create a responsive chart with HVAC-specific styling
    static createChart(ctx, config) {
        const defaultConfig = {
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#4ecdc4',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666'
                        }
                    },
                    y: {
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666'
                        }
                    }
                }
            }
        };

        // Merge configurations
        const mergedConfig = this.deepMerge(defaultConfig, config);
        return new Chart(ctx, mergedConfig);
    }

    // Deep merge utility for configurations
    static deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    static isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // Generate pressure-temperature chart data
    static generatePTChartData(refrigerant, tempRange) {
        const data = [];
        const { min, max } = tempRange;
        
        // Simplified P-T relationship (Antoine equation approximation)
        for (let temp = min; temp <= max; temp += 1) {
            const pressure = this.calculateSaturationPressure(temp, refrigerant);
            data.push({ x: temp, y: pressure });
        }
        
        return data;
    }

    // Calculate saturation pressure (simplified Antoine equation)
    static calculateSaturationPressure(tempC, refrigerant) {
        const constants = {
            'R22': { A: 8.0, B: 1500, C: 230 },
            'R134a': { A: 8.1, B: 1600, C: 240 },
            'R410A': { A: 7.9, B: 1450, C: 220 },
            'R404A': { A: 8.2, B: 1550, C: 235 },
            'R407C': { A: 8.0, B: 1520, C: 232 }
        };

        const { A, B, C } = constants[refrigerant] || constants['R22'];
        const tempK = tempC + 273.15;
        
        // Antoine equation: log10(P) = A - B/(C + T)
        const logP = A - B / (C + tempC);
        const pressureBar = Math.pow(10, logP);
        
        // Convert bar to PSI
        return pressureBar * 14.5038;
    }

    // Generate psychrometric chart data
    static generatePsychrometricData(tempRange, humidityRange) {
        const data = {
            saturationLine: [],
            constantRH: {},
            constantEnthalpy: {}
        };

        // Generate saturation line
        for (let temp = tempRange.min; temp <= tempRange.max; temp += 1) {
            const satVaporPressure = this.calculateSaturationVaporPressure(temp);
            const maxHumidity = 0.622 * satVaporPressure / (101.325 - satVaporPressure);
            data.saturationLine.push({ x: temp, y: maxHumidity * 1000 });
        }

        // Generate constant RH lines
        [20, 40, 60, 80].forEach(rh => {
            data.constantRH[rh] = [];
            for (let temp = tempRange.min; temp <= tempRange.max; temp += 2) {
                const satVaporPressure = this.calculateSaturationVaporPressure(temp);
                const vaporPressure = (rh / 100) * satVaporPressure;
                const humidity = 0.622 * vaporPressure / (101.325 - vaporPressure);
                if (humidity > 0 && humidity < 0.03) {
                    data.constantRH[rh].push({ x: temp, y: humidity * 1000 });
                }
            }
        });

        return data;
    }

    // Calculate saturation vapor pressure (Magnus formula)
    static calculateSaturationVaporPressure(tempC) {
        return 0.61078 * Math.exp(17.27 * tempC / (tempC + 237.3));
    }

    // Create duct sizing visualization
    static createDuctSizingChart(ctx, ductData) {
        return this.createChart(ctx, {
            type: 'bar',
            data: {
                labels: ductData.rooms.map(room => room.name),
                datasets: [{
                    label: 'CFM Required',
                    data: ductData.rooms.map(room => room.cfm),
                    backgroundColor: this.colorSchemes.temperature.cooling[0],
                    borderColor: this.colorSchemes.temperature.cooling[1],
                    borderWidth: 2
                }, {
                    label: 'Heat Load (BTU/h)',
                    data: ductData.rooms.map(room => room.heatLoad),
                    backgroundColor: this.colorSchemes.temperature.heating[0],
                    borderColor: this.colorSchemes.temperature.heating[1],
                    borderWidth: 2,
                    yAxisID: 'y1'
                }]
            },
            options: {
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'CFM'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'BTU/h'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Room-by-Room Load and Airflow Analysis'
                    }
                }
            }
        });
    }

    // Create efficiency comparison chart
    static createEfficiencyChart(ctx, efficiencyData) {
        return this.createChart(ctx, {
            type: 'radar',
            data: {
                labels: efficiencyData.categories,
                datasets: [{
                    label: 'Current System',
                    data: efficiencyData.current,
                    borderColor: this.colorSchemes.efficiency.average[0],
                    backgroundColor: this.colorSchemes.efficiency.average[0] + '20',
                    pointBackgroundColor: this.colorSchemes.efficiency.average[0],
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this.colorSchemes.efficiency.average[0]
                }, {
                    label: 'Optimal System',
                    data: efficiencyData.optimal,
                    borderColor: this.colorSchemes.efficiency.good[0],
                    backgroundColor: this.colorSchemes.efficiency.good[0] + '20',
                    pointBackgroundColor: this.colorSchemes.efficiency.good[0],
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this.colorSchemes.efficiency.good[0]
                }]
            },
            options: {
                elements: {
                    line: {
                        borderWidth: 3
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'System Efficiency Analysis'
                    }
                }
            }
        });
    }

    // Utility to format numbers for display
    static formatNumber(value, decimals = 2, unit = '') {
        if (isNaN(value)) return 'N/A';
        return value.toFixed(decimals) + (unit ? ' ' + unit : '');
    }

    // Convert between units for display
    static convertUnits(value, fromUnit, toUnit) {
        const conversions = {
            'C_to_F': (c) => c * 9/5 + 32,
            'F_to_C': (f) => (f - 32) * 5/9,
            'kPa_to_PSI': (kPa) => kPa * 0.145038,
            'PSI_to_kPa': (psi) => psi / 0.145038,
            'BTU_to_kW': (btu) => btu * 0.000293071,
            'kW_to_BTU': (kw) => kw / 0.000293071,
            'CFM_to_m3h': (cfm) => cfm * 1.69901,
            'm3h_to_CFM': (m3h) => m3h / 1.69901
        };

        const conversionKey = `${fromUnit}_to_${toUnit}`;
        return conversions[conversionKey] ? conversions[conversionKey](value) : value;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HVACChartUtils;
}

// Make available globally
window.HVACChartUtils = HVACChartUtils;
