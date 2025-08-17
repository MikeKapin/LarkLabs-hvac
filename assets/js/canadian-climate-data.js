// Canadian Climate Data for HVAC Load Calculations
// Heating Degree Days (HDD), Cooling Degree Days (CDD), and design temperatures by province/territory

const climateData = {
    'BC': { 
        hdd: 2800, 
        cdd: 150, 
        winterTemp: -8, 
        summerTemp: 28, 
        zone: 'Marine West Coast', 
        winterTempF: 18, 
        summerTempF: 82 
    },
    'AB': { 
        hdd: 4500, 
        cdd: 280, 
        winterTemp: -25, 
        summerTemp: 26, 
        zone: 'Continental', 
        winterTempF: -13, 
        summerTempF: 79 
    },
    'SK': { 
        hdd: 5200, 
        cdd: 350, 
        winterTemp: -28, 
        summerTemp: 25, 
        zone: 'Continental', 
        winterTempF: -18, 
        summerTempF: 77 
    },
    'MB': { 
        hdd: 5100, 
        cdd: 320, 
        winterTemp: -27, 
        summerTemp: 26, 
        zone: 'Continental', 
        winterTempF: -17, 
        summerTempF: 79 
    },
    'ON': { 
        hdd: 3800, 
        cdd: 300, 
        winterTemp: -18, 
        summerTemp: 28, 
        zone: 'Continental', 
        winterTempF: 0, 
        summerTempF: 82 
    },
    'QC': { 
        hdd: 4200, 
        cdd: 250, 
        winterTemp: -22, 
        summerTemp: 26, 
        zone: 'Continental', 
        winterTempF: -8, 
        summerTempF: 79 
    },
    'NB': { 
        hdd: 4100, 
        cdd: 180, 
        winterTemp: -18, 
        summerTemp: 24, 
        zone: 'Maritime', 
        winterTempF: 0, 
        summerTempF: 75 
    },
    'NS': { 
        hdd: 3600, 
        cdd: 120, 
        winterTemp: -12, 
        summerTemp: 23, 
        zone: 'Maritime', 
        winterTempF: 10, 
        summerTempF: 73 
    },
    'PE': { 
        hdd: 3800, 
        cdd: 150, 
        winterTemp: -14, 
        summerTemp: 24, 
        zone: 'Maritime', 
        winterTempF: 7, 
        summerTempF: 75 
    },
    'NL': { 
        hdd: 4800, 
        cdd: 80, 
        winterTemp: -18, 
        summerTemp: 20, 
        zone: 'Maritime', 
        winterTempF: 0, 
        summerTempF: 68 
    },
    'YT': { 
        hdd: 6500, 
        cdd: 100, 
        winterTemp: -35, 
        summerTemp: 20, 
        zone: 'Subarctic', 
        winterTempF: -31, 
        summerTempF: 68 
    },
    'NT': { 
        hdd: 7200, 
        cdd: 120, 
        winterTemp: -35, 
        summerTemp: 22, 
        zone: 'Subarctic', 
        winterTempF: -31, 
        summerTempF: 72 
    },
    'NU': { 
        hdd: 8500, 
        cdd: 50, 
        winterTemp: -40, 
        summerTemp: 15, 
        zone: 'Arctic', 
        winterTempF: -40, 
        summerTempF: 59 
    }
};

// Insulation R-values (Imperial and Metric)
const insulationValues = {
    'poor': { wall: 8, ceiling: 20, floor: 12 },
    'average': { wall: 12, ceiling: 30, floor: 20 },
    'good': { wall: 20, ceiling: 40, floor: 25 },
    'excellent': { wall: 24, ceiling: 50, floor: 30 }
};

// Window U-values (Imperial: BTU/hr·ft²·°F, Metric: W/m²·K)
const windowUValues = {
    'single': { imperial: 1.02, metric: 5.8 },
    'double': { imperial: 0.49, metric: 2.8 },
    'triple': { imperial: 0.32, metric: 1.8 },
    'low-e': { imperial: 0.35, metric: 2.0 },
    'low-e-triple': { imperial: 0.21, metric: 1.2 }
};

// Export for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { climateData, insulationValues, windowUValues };
}

// Make available globally (for direct HTML inclusion)
window.climateData = climateData;
window.insulationValues = insulationValues;
window.windowUValues = windowUValues;