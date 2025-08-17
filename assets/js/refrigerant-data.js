// Refrigerant Data for HVAC Calculations
// Contains pressure-temperature relationships and properties for various refrigerants

// Refrigerant data for superheat/subcooling calculations
const refrigerantData = {
    'R22': {
        name: 'R-22 (HCFC-22)',
        type: 'HCFC',
        safety: 'A1',
        gwp: 1810,
        pressureTemp: {
            20: 43.0, 25: 47.5, 30: 52.5, 35: 57.8, 40: 63.5, 45: 69.5, 50: 76.0,
            55: 83.0, 60: 90.5, 65: 98.5, 70: 107.0, 75: 116.0, 80: 125.5, 85: 135.5,
            90: 146.0, 95: 157.0, 100: 169.0, 105: 181.5, 110: 194.5, 115: 208.0,
            120: 222.0, 125: 237.0, 130: 252.5
        }
    },
    'R134a': {
        name: 'R-134a (HFC-134a)',
        type: 'HFC',
        safety: 'A1',
        gwp: 1430,
        pressureTemp: {
            20: 21.0, 25: 24.0, 30: 27.5, 35: 31.5, 40: 35.7, 45: 40.3, 50: 45.2,
            55: 50.5, 60: 56.2, 65: 62.3, 70: 68.8, 75: 75.7, 80: 83.1, 85: 91.0,
            90: 99.4, 95: 108.3, 100: 117.8, 105: 127.9, 110: 138.6, 115: 149.9,
            120: 161.9, 125: 174.6, 130: 188.0
        }
    },
    'R404A': {
        name: 'R-404A (HFC Blend)',
        type: 'HFC Blend',
        safety: 'A1',
        gwp: 3922,
        pressureTemp: {
            '-20': 9.5, '-15': 12.0, '-10': 15.0, '-5': 18.5, 0: 22.5, 5: 27.0, 10: 32.0,
            15: 37.5, 20: 43.5, 25: 50.0, 30: 57.0, 35: 64.5, 40: 72.8, 45: 81.5,
            50: 91.0, 55: 101.0, 60: 112.0, 65: 123.5, 70: 136.0, 75: 149.0,
            80: 163.0, 85: 177.5, 90: 193.0
        }
    },
    'R407C': {
        name: 'R-407C (HFC Blend)',
        type: 'HFC Blend',
        safety: 'A1',
        gwp: 1774,
        pressureTemp: {
            20: 42.0, 25: 46.5, 30: 51.5, 35: 57.0, 40: 63.0, 45: 69.5, 50: 76.5,
            55: 84.0, 60: 92.0, 65: 100.5, 70: 109.5, 75: 119.0, 80: 129.0, 85: 140.0,
            90: 151.5, 95: 163.5, 100: 176.0, 105: 189.0, 110: 203.0, 115: 217.5,
            120: 233.0, 125: 249.0, 130: 266.0
        }
    },
    'R410A': {
        name: 'R-410A (HFC Blend)',
        type: 'HFC Blend',
        safety: 'A1',
        gwp: 2088,
        pressureTemp: {
            20: 71.0, 25: 78.0, 30: 85.5, 35: 93.5, 40: 102.0, 45: 111.0, 50: 120.5,
            55: 130.5, 60: 141.0, 65: 152.0, 70: 164.0, 75: 176.5, 80: 189.5, 85: 203.0,
            90: 217.5, 95: 232.5, 100: 248.0, 105: 264.5, 110: 281.5, 115: 299.0,
            120: 317.5, 125: 336.5, 130: 356.0
        }
    },
    'R32': {
        name: 'R-32 (HFC-32)',
        type: 'HFC',
        safety: 'A2L',
        gwp: 675,
        pressureTemp: {
            20: 78.0, 25: 86.0, 30: 94.5, 35: 103.5, 40: 113.0, 45: 123.0, 50: 133.5,
            55: 144.5, 60: 156.0, 65: 168.0, 70: 180.5, 75: 193.5, 80: 207.0, 85: 221.0,
            90: 235.5, 95: 250.5, 100: 266.0, 105: 282.0, 110: 298.5, 115: 315.5,
            120: 333.0, 125: 351.0, 130: 369.5
        }
    },
    'R454B': {
        name: 'R-454B (HFO Blend)',
        type: 'HFO Blend',
        safety: 'A2L',
        gwp: 466,
        pressureTemp: {
            20: 43.5, 25: 48.0, 30: 53.0, 35: 58.5, 40: 64.5, 45: 71.0, 50: 78.0,
            55: 85.5, 60: 93.5, 65: 102.0, 70: 111.0, 75: 120.5, 80: 130.5, 85: 141.0,
            90: 152.0, 95: 164.0, 100: 176.5, 105: 189.5, 110: 203.0, 115: 217.0,
            120: 231.5, 125: 247.0, 130: 263.0
        }
    },
    'R454C': {
        name: 'R-454C (HFO Blend)',
        type: 'HFO Blend',
        safety: 'A2L',
        gwp: 148,
        pressureTemp: {
            20: 42.8, 25: 47.2, 30: 52.2, 35: 57.6, 40: 63.5, 45: 69.8, 50: 76.6,
            55: 84.0, 60: 91.8, 65: 100.2, 70: 109.2, 75: 118.8, 80: 129.0, 85: 139.8,
            90: 151.2, 95: 163.2, 100: 175.8, 105: 189.0, 110: 202.8, 115: 217.2,
            120: 232.2, 125: 247.8, 130: 264.0
        }
    },
    'R455A': {
        name: 'R-455A (HFO Blend)',
        type: 'HFO Blend',
        safety: 'A2L',
        gwp: 148,
        pressureTemp: {
            20: 70.5, 25: 77.5, 30: 85.0, 35: 93.0, 40: 101.5, 45: 110.5, 50: 120.0,
            55: 130.0, 60: 140.5, 65: 151.5, 70: 163.0, 75: 175.0, 80: 187.5, 85: 200.5,
            90: 214.0, 95: 228.0, 100: 242.5, 105: 257.5, 110: 273.0, 115: 289.0,
            120: 305.5, 125: 322.5, 130: 340.0
        }
    },
    'R452B': {
        name: 'R-452B (HFO Blend)',
        type: 'HFO Blend',
        safety: 'A2L',
        gwp: 698,
        pressureTemp: {
            20: 70.8, 25: 77.8, 30: 85.3, 35: 93.3, 40: 101.8, 45: 110.8, 50: 120.3,
            55: 130.3, 60: 140.8, 65: 151.8, 70: 163.3, 75: 175.3, 80: 187.8, 85: 200.8,
            90: 214.3, 95: 228.3, 100: 242.8, 105: 257.8, 110: 273.3, 115: 289.3,
            120: 305.8, 125: 322.8, 130: 340.3
        }
    },
    'R466A': {
        name: 'R-466A (HFO Blend)',
        type: 'HFO Blend',
        safety: 'A2L',
        gwp: 733,
        pressureTemp: {
            20: 71.2, 25: 78.2, 30: 85.7, 35: 93.7, 40: 102.2, 45: 111.2, 50: 120.7,
            55: 130.7, 60: 141.2, 65: 152.2, 70: 163.7, 75: 175.7, 80: 188.2, 85: 201.2,
            90: 214.7, 95: 228.7, 100: 243.2, 105: 258.2, 110: 273.7, 115: 289.7,
            120: 306.2, 125: 323.2, 130: 340.7
        }
    },
    'R290': {
        name: 'R-290 (Propane)',
        type: 'Natural',
        safety: 'A3',
        gwp: 3,
        pressureTemp: {
            20: 36.0, 25: 41.0, 30: 46.5, 35: 52.5, 40: 59.0, 45: 66.0, 50: 73.5,
            55: 81.5, 60: 90.0, 65: 99.0, 70: 108.5, 75: 118.5, 80: 129.0, 85: 140.0,
            90: 151.5, 95: 163.5, 100: 176.0, 105: 189.0, 110: 202.5, 115: 216.5,
            120: 231.0, 125: 246.0, 130: 261.5
        }
    },
    'R600a': {
        name: 'R-600a (Isobutane)',
        type: 'Natural',
        safety: 'A3',
        gwp: 3,
        pressureTemp: {
            20: 7.5, 25: 9.0, 30: 10.8, 35: 12.8, 40: 15.0, 45: 17.5, 50: 20.3,
            55: 23.5, 60: 27.0, 65: 30.8, 70: 35.0, 75: 39.5, 80: 44.5, 85: 49.8,
            90: 55.5, 95: 61.5, 100: 68.0, 105: 75.0, 110: 82.5, 115: 90.5,
            120: 99.0, 125: 108.0, 130: 117.5
        }
    },
    'R744': {
        name: 'R-744 (CO2)',
        type: 'Natural',
        safety: 'A1',
        gwp: 1,
        pressureTemp: {
            '-20': 200.0, '-15': 230.0, '-10': 263.0, '-5': 300.0, 0: 340.0, 5: 383.0, 10: 430.0,
            15: 481.0, 20: 536.0, 25: 595.0, 30: 659.0, 35: 727.0, 40: 800.0, 45: 878.0,
            50: 962.0, 55: 1051.0, 60: 1146.0, 65: 1247.0, 70: 1354.0, 75: 1468.0,
            80: 1589.0, 85: 1717.0, '87.7': 1800.0
        }
    }
};

// P-T Chart refrigerant data with thermodynamic properties
const ptRefrigerantData = {
    // Traditional HFCs/HCFCs
    R22: {
        name: "R-22 (HCFC-22)",
        criticalTemp: 96.15,
        criticalPressure: 4990,
        molecularWeight: 86.47,
        ozoneDepleting: true,
        globalWarmingPotential: 1810,
        boilingPoint: -40.8,
        safetyClass: "A1",
        flammable: false,
        // Antoine equation coefficients for vapor pressure calculation
        antoine: { A: 8.2365, B: 1253.2, C: 230.0 }
    },
    R134a: {
        name: "R-134a (HFC-134a)",
        criticalTemp: 101.06,
        criticalPressure: 4059,
        molecularWeight: 102.03,
        ozoneDepleting: false,
        globalWarmingPotential: 1430,
        boilingPoint: -26.3,
        safetyClass: "A1",
        flammable: false,
        antoine: { A: 8.0956, B: 1214.4, C: 233.86 }
    },
    R410A: {
        name: "R-410A (HFC-410A)",
        criticalTemp: 71.34,
        criticalPressure: 4901,
        molecularWeight: 72.58,
        ozoneDepleting: false,
        globalWarmingPotential: 2088,
        boilingPoint: -51.6,
        safetyClass: "A1",
        flammable: false,
        antoine: { A: 8.1764, B: 1123.1, C: 231.4 }
    },
    R407C: {
        name: "R-407C (HFC-407C)",
        criticalTemp: 86.74,
        criticalPressure: 4631,
        molecularWeight: 86.2,
        ozoneDepleting: false,
        globalWarmingPotential: 1774,
        boilingPoint: -43.6,
        safetyClass: "A1",
        flammable: false,
        antoine: { A: 8.1234, B: 1198.7, C: 229.5 }
    },
    R404A: {
        name: "R-404A (HFC-404A)",
        criticalTemp: 72.13,
        criticalPressure: 3734,
        molecularWeight: 97.6,
        ozoneDepleting: false,
        globalWarmingPotential: 3922,
        boilingPoint: -46.6,
        safetyClass: "A1",
        flammable: false,
        antoine: { A: 8.0876, B: 1157.3, C: 228.9 }
    },
    
    // A2L Refrigerants (Mildly Flammable)
    R32: {
        name: "R-32 (HFC-32)",
        criticalTemp: 78.11,
        criticalPressure: 5782,
        molecularWeight: 52.02,
        ozoneDepleting: false,
        globalWarmingPotential: 675,
        boilingPoint: -51.7,
        safetyClass: "A2L",
        flammable: true,
        flammabilityLevel: "Lower (A2L)",
        antoine: { A: 8.3487, B: 1119.2, C: 231.2 }
    },
    R454B: {
        name: "R-454B (HFO Blend)",
        criticalTemp: 95.8,
        criticalPressure: 4730,
        molecularWeight: 68.4,
        ozoneDepleting: false,
        globalWarmingPotential: 466,
        boilingPoint: -46.1,
        safetyClass: "A2L",
        flammable: true,
        flammabilityLevel: "Lower (A2L)",
        antoine: { A: 8.1987, B: 1198.4, C: 232.1 }
    },
    R452A: {
        name: "R-452A (HFC/HFO Blend)",
        criticalTemp: 83.6,
        criticalPressure: 4520,
        molecularWeight: 69.5,
        ozoneDepleting: false,
        globalWarmingPotential: 2140,
        boilingPoint: -49.2,
        safetyClass: "A2L",
        flammable: true,
        flammabilityLevel: "Lower (A2L)",
        antoine: { A: 8.2145, B: 1156.8, C: 230.5 }
    },
    R454A: {
        name: "R-454A (HFO Blend)",
        criticalTemp: 81.2,
        criticalPressure: 4680,
        molecularWeight: 63.7,
        ozoneDepleting: false,
        globalWarmingPotential: 238,
        boilingPoint: -49.8,
        safetyClass: "A2L",
        flammable: true,
        flammabilityLevel: "Lower (A2L)",
        antoine: { A: 8.2987, B: 1134.5, C: 229.8 }
    },
    R1234yf: {
        name: "R-1234yf (HFO-1234yf)",
        criticalTemp: 94.7,
        criticalPressure: 3382,
        molecularWeight: 114.04,
        ozoneDepleting: false,
        globalWarmingPotential: 4,
        boilingPoint: -29.5,
        safetyClass: "A2L",
        flammable: true,
        flammabilityLevel: "Lower (A2L)",
        antoine: { A: 8.0876, B: 1182.5, C: 235.2 }
    },
    R1234ze: {
        name: "R-1234ze (HFO-1234ze)",
        criticalTemp: 109.4,
        criticalPressure: 3636,
        molecularWeight: 114.04,
        ozoneDepleting: false,
        globalWarmingPotential: 7,
        boilingPoint: -19.0,
        safetyClass: "A2L",
        flammable: true,
        flammabilityLevel: "Lower (A2L)",
        antoine: { A: 7.9876, B: 1267.3, C: 238.4 }
    },

    // Natural Refrigerants
    R290: {
        name: "R-290 (Propane)",
        criticalTemp: 96.74,
        criticalPressure: 4251,
        molecularWeight: 44.1,
        ozoneDepleting: false,
        globalWarmingPotential: 3,
        boilingPoint: -42.1,
        safetyClass: "A3",
        flammable: true,
        flammabilityLevel: "Higher (A3)",
        antoine: { A: 8.1126, B: 1050.2, C: 233.2 }
    },
    R600a: {
        name: "R-600a (Isobutane)",
        criticalTemp: 134.66,
        criticalPressure: 3629,
        molecularWeight: 58.12,
        ozoneDepleting: false,
        globalWarmingPotential: 3,
        boilingPoint: -11.7,
        safetyClass: "A3",
        flammable: true,
        flammabilityLevel: "Higher (A3)",
        antoine: { A: 8.0322, B: 1167.4, C: 239.8 }
    },
    R717: {
        name: "R-717 (Ammonia)",
        criticalTemp: 132.25,
        criticalPressure: 11333,
        molecularWeight: 17.03,
        ozoneDepleting: false,
        globalWarmingPotential: 0,
        boilingPoint: -33.3,
        safetyClass: "B2L",
        flammable: true,
        flammabilityLevel: "Lower (B2L)",
        antoine: { A: 8.9073, B: 1426.4, C: 240.2 }
    }
};

// Export for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { refrigerantData, ptRefrigerantData };
}

// Make available globally (for direct HTML inclusion)
window.refrigerantData = refrigerantData;
window.ptRefrigerantData = ptRefrigerantData;