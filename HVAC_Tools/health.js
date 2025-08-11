// Health monitoring and diagnostics for HVAC Pro Tools
// This module handles app health, performance monitoring, and error tracking

class HVACHealthMonitor {
    constructor() {
        this.startTime = Date.now();
        this.errors = [];
        this.performance = {
            calculations: [],
            pageLoads: [],
            userInteractions: []
        };
        this.isOnline = navigator.onLine;
        this.lastHealthCheck = null;
        
        this.init();
    }

    init() {
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
        this.setupNetworkMonitoring();
        this.setupServiceWorkerMonitoring();
        this.startHealthChecks();
        
        console.log('🔧 HVAC Health Monitor initialized');
    }

    // Error handling and tracking
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });
    }

    logError(error) {
        this.errors.push(error);
        console.error('🚨 HVAC Error logged:', error);
        
        // Keep only last 50 errors to prevent memory bloat
        if (this.errors.length > 50) {
            this.errors = this.errors.slice(-50);
        }

        // Send to analytics in production
        if (this.isProduction()) {
            this.sendErrorToAnalytics(error);
        }
    }

    // Performance monitoring
    setupPerformanceMonitoring() {
        // Monitor calculation performance
        this.originalCalculateLoadsLC = window.calculateLoadsLC;
        if (this.originalCalculateLoadsLC) {
            window.calculateLoadsLC = (...args) => {
                const start = performance.now();
                const result = this.originalCalculateLoadsLC.apply(this, args);
                const duration = performance.now() - start;
                
                this.performance.calculations.push({
                    type: 'load-calculation',
                    duration,
                    timestamp: Date.now()
                });
                
                return result;
            };
        }

        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    this.performance.pageLoads.push({
                        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        totalTime: perfData.loadEventEnd - perfData.fetchStart,
                        timestamp: Date.now()
                    });
                }
            }, 1000);
        });

        // Monitor user interactions
        ['click', 'input', 'change'].forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                this.performance.userInteractions.push({
                    type: eventType,
                    target: event.target.tagName + (event.target.id ? '#' + event.target.id : ''),
                    timestamp: Date.now()
                });
            }, { passive: true });
        });
    }

    // Network monitoring
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Network connection restored');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 App is now offline');
        });

        // Monitor connection quality
        if ('connection' in navigator) {
            this.monitorConnectionQuality();
        }
    }

    monitorConnectionQuality() {
        const connection = navigator.connection;
        if (connection) {
            const logConnectionInfo = () => {
                console.log(`📶 Connection: ${connection.effectiveType}, Downlink: ${connection.downlink}Mbps`);
            };
            
            connection.addEventListener('change', logConnectionInfo);
            logConnectionInfo();
        }
    }

    // Service Worker monitoring
    setupServiceWorkerMonitoring() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 Service Worker controller changed');
            });

            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
                    this.notifyUserOfUpdate();
                }
            });
        }
    }

    // Health checks
    startHealthChecks() {
        // Initial health check
        this.performHealthCheck();
        
        // Periodic health checks every 5 minutes
        setInterval(() => {
            this.performHealthCheck();
        }, 5 * 60 * 1000);
    }

    performHealthCheck() {
        const healthData = {
            timestamp: Date.now(),
            uptime: Date.now() - this.startTime,
            isOnline: this.isOnline,
            errorCount: this.errors.length,
            memoryUsage: this.getMemoryUsage(),
            performance: this.getPerformanceSummary(),
            features: this.checkFeatureAvailability()
        };

        this.lastHealthCheck = healthData;
        console.log('💚 Health check completed:', healthData);

        // Alert if issues detected
        if (healthData.errorCount > 10) {
            console.warn('⚠️ High error count detected');
        }

        return healthData;
    }

    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }

    getPerformanceSummary() {
        const avgCalculationTime = this.performance.calculations.length > 0 
            ? this.performance.calculations.reduce((sum, calc) => sum + calc.duration, 0) / this.performance.calculations.length
            : 0;

        return {
            avgCalculationTime: Math.round(avgCalculationTime),
            totalCalculations: this.performance.calculations.length,
            totalInteractions: this.performance.userInteractions.length,
            pageLoadCount: this.performance.pageLoads.length
        };
    }

    checkFeatureAvailability() {
        return {
            serviceWorker: 'serviceWorker' in navigator,
            geolocation: 'geolocation' in navigator,
            storage: typeof(Storage) !== 'undefined',
            indexedDB: 'indexedDB' in window,
            webGL: this.checkWebGLSupport(),
            touch: 'ontouchstart' in window,
            vibration: 'vibrate' in navigator
        };
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    // Data synchronization
    syncOfflineData() {
        if (!this.isOnline) return;

        // Sync any pending calculations or user data
        const pendingData = this.getPendingData();
        if (pendingData.length > 0) {
            console.log(`🔄 Syncing ${pendingData.length} pending items`);
            // Implementation for syncing data would go here
        }
    }

    getPendingData() {
        // Return any data that needs to be synced
        return [];
    }

    // User notifications
    notifyUserOfUpdate() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.innerHTML = `
            <div>📱 App update available!</div>
            <button onclick="location.reload()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 4px; margin-top: 8px; cursor: pointer;">
                Update Now
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 10000);
    }

    // Diagnostics and reporting
    generateDiagnosticReport() {
        return {
            timestamp: Date.now(),
            version: '1.0.0',
            userAgent: navigator.userAgent,
            url: window.location.href,
            healthCheck: this.lastHealthCheck,
            recentErrors: this.errors.slice(-10),
            performance: this.performance,
            features: this.checkFeatureAvailability()
        };
    }

    downloadDiagnosticReport() {
        const report = this.generateDiagnosticReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], 
                             { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `hvac-diagnostic-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Analytics (placeholder for production implementation)
    sendErrorToAnalytics(error) {
        // In production, this would send to analytics service
        console.log('📊 Would send error to analytics:', error);
    }

    isProduction() {
        return window.location.hostname !== 'localhost' && 
               window.location.hostname !== '127.0.0.1';
    }

    // Public API
    getHealthStatus() {
        return {
            isHealthy: this.errors.length < 10 && this.isOnline,
            uptime: Date.now() - this.startTime,
            errorCount: this.errors.length,
            isOnline: this.isOnline,
            lastCheck: this.lastHealthCheck
        };
    }

    clearErrors() {
        this.errors = [];
        console.log('🧹 Error log cleared');
    }

    restart() {
        this.startTime = Date.now();
        this.errors = [];
        this.performance = {
            calculations: [],
            pageLoads: [],
            userInteractions: []
        };
        console.log('🔄 Health monitor restarted');
    }
}

// Initialize health monitor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hvacHealthMonitor = new HVACHealthMonitor();
    
    // Add diagnostic tools to global scope for debugging
    window.hvacDiagnostics = {
        getHealth: () => window.hvacHealthMonitor.getHealthStatus(),
        downloadReport: () => window.hvacHealthMonitor.downloadDiagnosticReport(),
        clearErrors: () => window.hvacHealthMonitor.clearErrors(),
        restart: () => window.hvacHealthMonitor.restart()
    };
});

// Auto-register service worker if available
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available
                            newWorker.postMessage({ type: 'SW_UPDATE_AVAILABLE' });
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
}
