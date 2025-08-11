// Health monitoring and performance tracking for HVAC Pro Tools
class HVACHealthMonitor {
    constructor() {
        this.metrics = {
            performance: {},
            errors: [],
            usage: {},
            device: {},
            network: {},
            serviceWorker: {}
        };
        
        this.startTime = Date.now();
        this.isOnline = navigator.onLine;
        this.errorThreshold = 10; // Maximum errors before alert
        this.performanceBuffer = [];
        this.maxBufferSize = 100;
        
        this.init();
    }

    init() {
        this.detectDevice();
        this.monitorPerformance();
        this.monitorErrors();
        this.monitorNetwork();
        this.monitorServiceWorker();
        this.trackPageVisibility();
        
        // Send initial health report
        this.scheduleHealthReports();
        
        console.log('HVAC Health Monitor initialized');
    }

    // Device and browser detection
    detectDevice() {
        const userAgent = navigator.userAgent;
        
        this.metrics.device = {
            userAgent: userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            memory: navigator.deviceMemory || 'unknown',
            connection: this.getConnectionInfo(),
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
            isTablet: /iPad|Android(?!.*Mobile)/i.test(userAgent),
            browser: this.getBrowserInfo(),
            os: this.getOSInfo()
        };
    }

    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';
        
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        else if (userAgent.includes('Opera')) browser = 'Opera';
        
        return browser;
    }

    getOSInfo() {
        const userAgent = navigator.userAgent;
        let os = 'Unknown';
        
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac')) os = 'macOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS')) os = 'iOS';
        
        return os;
    }

    getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }
        
        return { effectiveType: 'unknown' };
    }

    // Performance monitoring
    monitorPerformance() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                
                if (perfData) {
                    this.metrics.performance.pageLoad = {
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                        firstPaint: this.getFirstPaint(),
                        firstContentfulPaint: this.getFirstContentfulPaint(),
                        totalLoadTime: perfData.loadEventEnd - perfData.navigationStart,
                        dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
                        tcpConnection: perfData.connectEnd - perfData.connectStart,
                        serverResponse: perfData.responseEnd - perfData.requestStart
                    };
                }
                
                this.trackResourcePerformance();
            }, 1000);
        });

        // Monitor JavaScript performance
        setInterval(() => {
            this.trackJSPerformance();
        }, 30000); // Every 30 seconds
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
        return fpEntry ? fpEntry.startTime : null;
    }

    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : null;
    }

    trackResourcePerformance() {
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(resource => resource.duration > 1000);
        
        this.metrics.performance.resources = {
            total: resources.length,
            slow: slowResources.length,
            totalSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
            cacheHits: resources.filter(resource => resource.transferSize === 0).length
        };
    }

    trackJSPerformance() {
        const now = performance.now();
        const memoryInfo = performance.memory || {};
        
        const perfSnapshot = {
            timestamp: Date.now(),
            memoryUsed: memoryInfo.usedJSHeapSize || 'unknown',
            memoryTotal: memoryInfo.totalJSHeapSize || 'unknown',
            memoryLimit: memoryInfo.jsHeapSizeLimit || 'unknown',
            performanceNow: now,
            calculationCount: this.getCalculationCount(),
            activeCharts: this.getActiveChartsCount()
        };

        this.performanceBuffer.push(perfSnapshot);
        
        // Keep buffer size manageable
        if (this.performanceBuffer.length > this.maxBufferSize) {
            this.performanceBuffer.shift();
        }

        // Check for memory leaks
        this.checkMemoryLeaks();
    }

    getCalculationCount() {
        // Track how many calculations have been performed
        return window.hvacCalculationCount || 0;
    }

    getActiveChartsCount() {
        // Track active Chart.js instances
        return window.hvacChartManager ? window.hvacChartManager.charts.size : 0;
    }

    checkMemoryLeaks() {
        if (this.performanceBuffer.length >= 10) {
            const recent = this.performanceBuffer.slice(-10);
            const memoryTrend = recent.map(snapshot => snapshot.memoryUsed);
            
            // Check if memory usage is consistently increasing
            let increases = 0;
            for (let i = 1; i < memoryTrend.length; i++) {
                if (memoryTrend[i] > memoryTrend[i-1]) increases++;
            }
            
            if (increases >= 8) { // 80% of samples show increase
                this.logWarning('Potential memory leak detected', {
                    memoryTrend: memoryTrend,
                    timestamp: Date.now()
                });
            }
        }
    }

    // Error monitoring
    monitorErrors() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null,
                timestamp: Date.now(),
                url: window.location.href
            });
        });

        // Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise_rejection',
                message: event.reason ? event.reason.toString() : 'Unknown promise rejection',
                stack: event.reason ? event.reason.stack : null,
                timestamp: Date.now(),
                url: window.location.href
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError({
                    type: 'resource',
                    message: 'Failed to load resource',
                    resource: event.target.src || event.target.href,
                    tagName: event.target.tagName,
                    timestamp: Date.now(),
                    url: window.location.href
                });
            }
        }, true);
    }

    logError(error) {
        this.metrics.errors.push(error);
        
        // Keep error log manageable
        if (this.metrics.errors.length > 50) {
            this.metrics.errors.shift();
        }

        console.error('HVAC Health Monitor - Error logged:', error);

        // Check if error threshold exceeded
        if (this.metrics.errors.length >= this.errorThreshold) {
            this.alertHighErrorRate();
        }
    }

    logWarning(message, data = {}) {
        console.warn('HVAC Health Monitor - Warning:', message, data);
        
        // You could send warnings to analytics here
    }

    alertHighErrorRate() {
        console.error('HVAC Health Monitor - High error rate detected!', {
            errorCount: this.metrics.errors.length,
            recentErrors: this.metrics.errors.slice(-5)
        });
        
        // You could trigger user notification or send alert to monitoring service
    }

    // Network monitoring
    monitorNetwork() {
        // Online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.metrics.network.lastOnline = Date.now();
            this.trackConnectivityChange('online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.metrics.network.lastOffline = Date.now();
            this.trackConnectivityChange('offline');
        });

        // Connection change monitoring
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                this.metrics.device.connection = this.getConnectionInfo();
                this.trackConnectivityChange('connection_change');
            });
        }
    }

    trackConnectivityChange(type) {
        if (!this.metrics.network.connectivityChanges) {
            this.metrics.network.connectivityChanges = [];
        }

        this.metrics.network.connectivityChanges.push({
            type: type,
            timestamp: Date.now(),
            connection: this.getConnectionInfo()
        });

        // Keep history manageable
        if (this.metrics.network.connectivityChanges.length > 20) {
            this.metrics.network.connectivityChanges.shift();
        }
    }

    // Service Worker monitoring
    monitorServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration) {
                    this.metrics.serviceWorker = {
                        registered: true,
                        scope: registration.scope,
                        updateViaCache: registration.updateViaCache,
                        state: registration.active ? registration.active.state : 'unknown'
                    };

                    // Monitor service worker updates
                    registration.addEventListener('updatefound', () => {
                        this.metrics.serviceWorker.updateFound = Date.now();
                        console.log('HVAC Health Monitor - Service worker update found');
                    });
                } else {
                    this.metrics.serviceWorker = { registered: false };
                }
            }).catch(error => {
                this.metrics.serviceWorker = { registered: false, error: error.message };
            });
        } else {
            this.metrics.serviceWorker = { supported: false };
        }
    }

    // Page visibility tracking
    trackPageVisibility() {
        let visibilityStart = Date.now();
        
        document.addEventListener('visibilitychange', () => {
            const now = Date.now();
            
            if (document.hidden) {
                // Page became hidden
                const visibleTime = now - visibilityStart;
                this.addUsageMetric('visibleTime', visibleTime);
            } else {
                // Page became visible
                visibilityStart = now;
                this.addUsageMetric('visibilityChange', now);
            }
        });

        // Track initial visibility
        if (!document.hidden) {
            visibilityStart = Date.now();
        }
    }

    // Usage tracking
    addUsageMetric(key, value) {
        if (!this.metrics.usage[key]) {
            this.metrics.usage[key] = [];
        }
        
        this.metrics.usage[key].push({
            value: value,
            timestamp: Date.now()
        });

        // Keep usage history manageable
        if (this.metrics.usage[key].length > 100) {
            this.metrics.usage[key].shift();
        }
    }

    trackToolUsage(toolName, action = 'open') {
        this.addUsageMetric('toolUsage', {
            tool: toolName,
            action: action,
            timestamp: Date.now()
        });
    }

    trackCalculation(calculationType, duration = null) {
        this.addUsageMetric('calculations', {
            type: calculationType,
            duration: duration,
            timestamp: Date.now()
        });

        // Increment global calculation counter
        if (!window.hvacCalculationCount) window.hvacCalculationCount = 0;
        window.hvacCalculationCount++;
    }

    // Health reporting
    generateHealthReport() {
        const now = Date.now();
        const uptime = now - this.startTime;
        
        return {
            timestamp: now,
            uptime: uptime,
            version: '1.2.0', // App version
            device: this.metrics.device,
            performance: {
                ...this.metrics.performance,
                currentMemory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null,
                recentPerformance: this.performanceBuffer.slice(-10)
            },
            errors: {
                count: this.metrics.errors.length,
                recent: this.metrics.errors.slice(-5)
            },
            network: {
                ...this.metrics.network,
                isOnline: this.isOnline,
                connection: this.getConnectionInfo()
            },
            serviceWorker: this.metrics.serviceWorker,
            usage: this.getUsageSummary()
        };
    }

    getUsageSummary() {
        const summary = {};
        
        Object.keys(this.metrics.usage).forEach(key => {
            const data = this.metrics.usage[key];
            summary[key] = {
                count: data.length,
                recent: data.slice(-5)
            };
        });
        
        return summary;
    }

    scheduleHealthReports() {
        // Send initial report after 30 seconds
        setTimeout(() => {
            this.sendHealthReport();
        }, 30000);

        // Send periodic reports every 5 minutes
        setInterval(() => {
            this.sendHealthReport();
        }, 300000);

        // Send report when page is about to unload
        window.addEventListener('beforeunload', () => {
            this.sendHealthReport(true);
        });
    }

    sendHealthReport(isUnloading = false) {
        const report = this.generateHealthReport();
        
        // In a real app, you would send this to your analytics service
        console.log('HVAC Health Report:', report);
        
        // Example of how you might send to an analytics service:
        // if (isUnloading) {
        //     navigator.sendBeacon('/api/health', JSON.stringify(report));
        // } else {
        //     fetch('/api/health', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(report)
        //     });
        // }
    }

    // Public API methods
    getMetrics() {
        return { ...this.metrics };
    }

    getPerformanceSnapshot() {
        return this.performanceBuffer.slice(-1)[0] || null;
    }

    clearErrorLog() {
        this.metrics.errors = [];
    }

    isHealthy() {
        const report = this.generateHealthReport();
        
        // Define health criteria
        const criteria = {
            errorRate: this.metrics.errors.length < this.errorThreshold,
            performance: report.performance.currentMemory ? 
                report.performance.currentMemory.used < report.performance.currentMemory.limit * 0.8 : true,
            network: this.isOnline,
            uptime: report.uptime > 0
        };

        return Object.values(criteria).every(criterion => criterion === true);
    }
}

// Initialize health monitor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.hvacHealthMonitor = new HVACHealthMonitor();
    
    // Expose tracking methods globally for easy access
    window.trackToolUsage = (toolName, action) => {
        if (window.hvacHealthMonitor) {
            window.hvacHealthMonitor.trackToolUsage(toolName, action);
        }
    };
    
    window.trackCalculation = (type, duration) => {
        if (window.hvacHealthMonitor) {
            window.hvacHealthMonitor.trackCalculation(type, duration);
        }
    };
    
    console.log('HVAC Health Monitor ready');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HVACHealthMonitor;
}
