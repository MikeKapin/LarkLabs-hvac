/* LARK Labs Common JavaScript - Shared utilities across all apps */

// Common utility functions
const LarkUtils = {
    // Show loading spinner
    showLoading: (containerId) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="lark-spinner"></div>';
        }
    },

    // Hide loading spinner
    hideLoading: (containerId) => {
        const container = document.getElementById(containerId);
        if (container) {
            const spinner = container.querySelector('.lark-spinner');
            if (spinner) spinner.remove();
        }
    },

    // Format numbers with proper decimals
    formatNumber: (num, decimals = 2) => {
        return Number(num).toFixed(decimals);
    },

    // Validate numeric input
    validateNumber: (value, min = null, max = null) => {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
    },

    // Show result with styling
    showResult: (containerId, message, type = 'success') => {
        const container = document.getElementById(containerId);
        if (container) {
            container.className = `lark-result ${type}`;
            container.innerHTML = message;
        }
    },

    // Unit conversion utilities
    convertUnits: {
        // Temperature conversions
        celsiusToFahrenheit: (c) => (c * 9/5) + 32,
        fahrenheitToCelsius: (f) => (f - 32) * 5/9,
        
        // Pressure conversions
        psiToKpa: (psi) => psi * 6.89476,
        kpaToPsi: (kpa) => kpa / 6.89476,
        
        // Length conversions
        inchesToMm: (inches) => inches * 25.4,
        mmToInches: (mm) => mm / 25.4,
        feetToMeters: (feet) => feet * 0.3048,
        metersToFeet: (meters) => meters / 0.3048,
        
        // Area conversions
        sqFtToSqM: (sqFt) => sqFt * 0.092903,
        sqMToSqFt: (sqM) => sqM / 0.092903,
        
        // Volume conversions
        cfmToLps: (cfm) => cfm * 0.471947,
        lpsToCfm: (lps) => lps / 0.471947
    },

    // Local storage helpers
    storage: {
        save: (key, data) => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('Failed to save to localStorage:', e);
                return false;
            }
        },
        
        load: (key) => {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('Failed to load from localStorage:', e);
                return null;
            }
        },
        
        remove: (key) => {
            localStorage.removeItem(key);
        }
    },

    // Common validation messages
    showError: (containerId, message) => {
        LarkUtils.showResult(containerId, `❌ ${message}`, 'error');
    },

    showWarning: (containerId, message) => {
        LarkUtils.showResult(containerId, `⚠️ ${message}`, 'warning');
    },

    showSuccess: (containerId, message) => {
        LarkUtils.showResult(containerId, `✅ ${message}`, 'success');
    },

    // Print functionality
    printResults: () => {
        window.print();
    },

    // Export to CSV
    exportToCSV: (data, filename) => {
        const csv = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    // Common navigation back to main site
    goHome: () => {
        window.location.href = '/';
    },

    // Analytics tracking (placeholder)
    trackUsage: (appName, action) => {
        // Track app usage for analytics
        console.log(`App: ${appName}, Action: ${action}`);
        // Could integrate with Google Analytics or other tracking
    }
};

// Common event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add LARK Labs branding footer if not present
    if (!document.querySelector('.lark-footer')) {
        const footer = document.createElement('div');
        footer.className = 'lark-footer';
        footer.innerHTML = `
            <div style="text-align: center; padding: 20px; margin-top: 30px; border-top: 1px solid #ddd;">
                <p style="color: #7f8c8d; font-size: 0.9em;">
                    Powered by <a href="/" style="color: #3498db; text-decoration: none;">LARK Labs</a> - 
                    Free HVAC Tools for Canadian Technicians
                </p>
            </div>
        `;
        document.body.appendChild(footer);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LarkUtils;
}