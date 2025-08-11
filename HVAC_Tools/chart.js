// Chart.js configuration and utilities for HVAC Pro Tools
class HVACChartManager {
    constructor() {
        this.charts = new Map();
        this.defaultColors = {
            primary: '#4ecdc4',
            secondary: '#ff6b6b',
            accent: '#45b7d1',
            warning: '#f39c12',
            danger: '#e74c3c',
            success: '#27ae60',
            info: '#3498db'
        };
        
        this.init();
    }

    init() {
        // Set Chart.js default configurations
        if (typeof Chart !== 'undefined') {
            Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
            Chart.defaults.font.size = 12;
            Chart.defaults.responsive = true;
            Chart.defaults.maintainAspectRatio = false;
            Chart.defaults.plugins.legend.display = true;
            Chart.defaults.plugins.tooltip.enabled = true;
            Chart.defaults.plugins.tooltip.mode = 'nearest';
            Chart.defaults.plugins.tooltip.intersect = false;
        }
    }

    // Create P-T Chart for refrigerants
    createPTChart(canvasId, refrigerantData, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error('Chart canvas not found:', canvasId);
            return null;
        }

        const defaultOptions = {
            type: 'line',
            data: {
                datasets: this.preparePTDatasets(refrigerantData, options)
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Temperature (°C)',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Pressure (kPa)',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `P-T Chart for ${refrigerantData.name}`,
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.x.toFixed(1)}°C, ${context.parsed.y.toFixed(1)} kPa`;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        };

        // Destroy existing chart if it exists
        this.destroyChart(canvasId);

        // Create new chart
        const chart = new Chart(ctx, defaultOptions);
        this.charts.set(canvasId, chart);
        
        return chart;
    }

    // Create Psychrometric Chart
    createPsychrometricChart(canvasId, psychrometricData, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error('Chart canvas not found:', canvasId);
            return null;
        }

        const datasets = this.preparePsychrometricDatasets(psychrometricData, options);

        const chartOptions = {
            type: 'scatter',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: options.temperatureUnit === 'imperial' ? 'Dry Bulb Temperature (°F)' : 'Dry Bulb Temperature (°C)',
                            font: { size: 14, weight: 'bold' }
                        },
                        min: options.temperatureUnit === 'imperial' ? 32 : 0,
                        max: options.temperatureUnit === 'imperial' ? 140 : 60
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Absolute Humidity (g/kg dry air)',
                            font: { size: 14, weight: 'bold' }
                        },
                        min: 0,
                        max: 30
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Psychrometric Chart - ${psychrometricData.refrigerant || 'Standard Air'}`,
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        };

        this.destroyChart(canvasId);
        const chart = new Chart(ctx, chartOptions);
        this.charts.set(canvasId, chart);
        
        return chart;
    }

    // Create Load Analysis Chart
    createLoadChart(canvasId, loadData, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error('Chart canvas not found:', canvasId);
            return null;
        }

        const chartOptions = {
            type: 'bar',
            data: {
                labels: ['Wall Loss', 'Ceiling Loss', 'Floor Loss', 'Window Loss', 'Infiltration', 'Internal Gains'],
                datasets: [{
                    label: 'Heat Load (W)',
                    data: [
                        loadData.wallLoss || 0,
                        loadData.ceilingLoss || 0,
                        loadData.floorLoss || 0,
                        loadData.windowLoss || 0,
                        loadData.infiltrationLoss || 0,
                        loadData.internalGains || 0
                    ],
                    backgroundColor: [
                        this.defaultColors.primary,
                        this.defaultColors.secondary,
                        this.defaultColors.accent,
                        this.defaultColors.warning,
                        this.defaultColors.info,
                        this.defaultColors.success
                    ],
                    borderColor: [
                        this.defaultColors.primary,
                        this.defaultColors.secondary,
                        this.defaultColors.accent,
                        this.defaultColors.warning,
                        this.defaultColors.info,
                        this.defaultColors.success
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Heat Load Breakdown',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Heat Load (W)'
                        }
                    }
                }
            }
        };

        this.destroyChart(canvasId);
        const chart = new Chart(ctx, chartOptions);
        this.charts.set(canvasId, chart);
        
        return chart;
    }

    // Prepare P-T Chart datasets
    preparePTDatasets(refrigerantData, options) {
        const datasets = [];

        if (options.showSaturation !== false) {
            datasets.push({
                label: 'Saturation Curve',
                data: refrigerantData.saturationData || [],
                borderColor: this.defaultColors.primary,
                backgroundColor: 'transparent',
                showLine: true,
                pointRadius: 3,
                borderWidth: 3,
                fill: false,
                tension: 0.4
            });
        }

        if (options.showIsotherms) {
            // Add isotherm lines
            const isothermTemps = [-20, -10, 0, 10, 20, 30, 40, 50];
            isothermTemps.forEach((temp, index) => {
                if (refrigerantData.isotherms && refrigerantData.isotherms[temp]) {
                    datasets.push({
                        label: `${temp}°C Isotherm`,
                        data: refrigerantData.isotherms[temp],
                        borderColor: temp < 0 ? this.defaultColors.info : this.defaultColors.secondary,
                        backgroundColor: 'transparent',
                        showLine: true,
                        pointRadius: 0,
                        borderWidth: 2,
                        borderDash: [5, 5]
                    });
                }
            });
        }

        return datasets;
    }

    // Prepare Psychrometric Chart datasets
    preparePsychrometricDatasets(psychrometricData, options) {
        const datasets = [];

        // Relative humidity lines
        if (psychrometricData.rhLines) {
            datasets.push({
                label: 'Constant RH Lines',
                data: psychrometricData.rhLines,
                borderColor: this.defaultColors.accent,
                backgroundColor: 'transparent',
                showLine: true,
                pointRadius: 0,
                borderWidth: 1
            });
        }

        // Enthalpy lines
        if (psychrometricData.enthalpyLines) {
            datasets.push({
                label: 'Constant Enthalpy Lines',
                data: psychrometricData.enthalpyLines,
                borderColor: this.defaultColors.warning,
                backgroundColor: 'transparent',
                showLine: true,
                pointRadius: 0,
                borderWidth: 1
            });
        }

        // Current state point
        if (psychrometricData.currentState) {
            datasets.push({
                label: 'Current State Point',
                data: [psychrometricData.currentState],
                backgroundColor: this.defaultColors.secondary,
                borderColor: this.defaultColors.secondary,
                pointRadius: 8,
                pointHoverRadius: 10
            });
        }

        // Saturation line
        if (psychrometricData.saturationLine) {
            datasets.push({
                label: 'Saturation Line',
                data: psychrometricData.saturationLine,
                borderColor: this.defaultColors.primary,
                backgroundColor: 'transparent',
                showLine: true,
                pointRadius: 0,
                borderWidth: 3
            });
        }

        return datasets;
    }

    // Update chart data
    updateChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.data = newData;
            chart.update('active');
        }
    }

    // Destroy specific chart
    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
    }

    // Destroy all charts
    destroyAllCharts() {
        this.charts.forEach((chart, canvasId) => {
            chart.destroy();
        });
        this.charts.clear();
    }

    // Export chart as image
    exportChart(canvasId, filename = 'chart.png') {
        const chart = this.charts.get(canvasId);
        if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
        }
    }

    // Get chart colors
    getColors() {
        return { ...this.defaultColors };
    }

    // Set custom colors
    setColors(newColors) {
        this.defaultColors = { ...this.defaultColors, ...newColors };
    }

    // Utility method to generate gradient colors
    generateGradient(ctx, colorStart, colorEnd) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    }

    // Resize all charts
    resizeCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }
}

// Initialize chart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined') {
        window.hvacChartManager = new HVACChartManager();
        console.log('HVAC Chart Manager initialized');
    } else {
        console.warn('Chart.js not loaded - chart functionality will be limited');
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.hvacChartManager) {
        window.hvacChartManager.resizeCharts();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HVACChartManager;
}
