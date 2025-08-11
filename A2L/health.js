/**
 * A2L Calculator Health Monitoring System
 * Monitors app performance, connectivity, and provides system diagnostics
 * Modified version: Health monitoring without visual indicator
 */

class A2LHealthMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.performanceMetrics = {};
        this.lastHealthCheck = null;
        this.healthStatus = 'unknown';
        this.errorLog = [];
        this.maxErrorLogSize = 50;
        this.healthCheckInterval = 30000; // 30 seconds
        this.init();
    }

    init() {
        this.startHealthMonitoring();
        this.bindNetworkEvents();
        this.bindPerformanceMonitoring();
        this.bindErrorHandling();
        // REMOVED: this.createHealthIndicator();
        console.log('A2L Health Monitor initialized (no visual indicator)');
    }

    startHealthMonitoring() {
        // Initial health check
        this.performHealthCheck();
        
        // Periodic health checks
        setInterval(() => {
            this.performHealthCheck();
        }, this.healthCheckInterval);
    }

    performHealthCheck() {
        const startTime = performance.now();
        
        const healthData = {
            timestamp: new Date().toISOString(),
            online: navigator.onLine,
            userAgent: navigator.userAgent,
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            memory: this.getMemoryInfo(),
            performance: this.getPerformanceMetrics(),
            serviceWorker: this.getServiceWorkerStatus(),
            storage: this.getStorageInfo(),
            features: this.checkFeatureSupport(),
            errors: this.getRecentErrors()
        };

        const checkDuration = performance.now() - startTime;
        healthData.healthCheckDuration = checkDuration;

        this.lastHealthCheck = healthData;
        this.updateHealthStatus(healthData);
        // REMOVED: this.updateHealthIndicator();

        // Log health data for debugging
        console.log('Health Check:', {
            status: this.healthStatus,
            online: healthData.online,
            duration: `${checkDuration.toFixed(2)}ms`,
            errors: healthData.errors.length
        });

        return healthData;
    }

    getMemoryInfo() {
        if ('memory' in performance) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                usagePercentage: Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
            };
        }
        return { available: false };
    }

    getPerformanceMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        const metrics = {
            loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) : null,
            domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart) : null,
            firstPaint: null,
            firstContentfulPaint: null
        };

        paint.forEach(entry => {
            if (entry.name === 'first-paint') {
                metrics.firstPaint = Math.round(entry.startTime);
            } else if (entry.name === 'first-contentful-paint') {
                metrics.firstContentfulPaint = Math.round(entry.startTime);
            }
        });

        return metrics;
    }

    getServiceWorkerStatus() {
        if ('serviceWorker' in navigator) {
            return {
                supported: true,
                controller: !!navigator.serviceWorker.controller,
                ready: navigator.serviceWorker.ready ? 'pending' : 'unknown'
            };
        }
        return { supported: false };
    }

    getStorageInfo() {
        const storage = {
            localStorage: this.checkStorageQuota('localStorage'),
            sessionStorage: this.checkStorageQuota('sessionStorage'),
            indexedDB: 'indexedDB' in window,
            webSQL: 'openDatabase' in window,
            caches: 'caches' in window
        };

        // Check cache storage if available
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(estimate => {
                storage.quota = estimate.quota;
                storage.usage = estimate.usage;
                storage.usagePercentage = estimate.quota ? Math.round((estimate.usage / estimate.quota) * 100) : null;
            }).catch(err => {
                console.warn('Could not estimate storage:', err);
            });
        }

        return storage;
    }

    checkStorageQuota(storageType) {
        try {
            const storage = window[storageType];
            const testKey = '__health_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return { available: true, quota: 'unknown' };
        } catch (e) {
            return { available: false, error: e.name };
        }
    }

    checkFeatureSupport() {
        return {
            pwa: {
                serviceWorker: 'serviceWorker' in navigator,
                manifest: 'manifest' in document.createElement('link'),
                standalone: window.matchMedia('(display-mode: standalone)').matches
            },
            modern: {
                fetch: 'fetch' in window,
                promises: 'Promise' in window,
                arrow: (() => { try { eval('()=>{}'); return true; } catch(e) { return false; } })(),
                modules: 'noModule' in document.createElement('script'),
                classes: (() => { try { eval('class Test {}'); return true; } catch(e) { return false; } })()
            },
            apis: {
                geolocation: 'geolocation' in navigator,
                notifications: 'Notification' in window,
                deviceOrientation: 'DeviceOrientationEvent' in window,
                vibration: 'vibrate' in navigator,
                battery: 'getBattery' in navigator,
                connection: 'connection' in navigator
            }
        };
    }

    getRecentErrors() {
        return this.errorLog.slice(-10); // Last 10 errors
    }

    updateHealthStatus(healthData) {
        let status = 'healthy';
        const issues = [];

        // Check connectivity
        if (!healthData.online) {
            status = 'offline';
            issues.push('No internet connection');
        }

        // Check memory usage
        if (healthData.memory.available && healthData.memory.usagePercentage > 80) {
            status = 'warning';
            issues.push('High memory usage');
        }

        // Check recent errors
        if (healthData.errors.length > 5) {
            status = 'error';
            issues.push('Multiple recent errors');
        }

        // Check service worker
        if (healthData.serviceWorker.supported && !healthData.serviceWorker.controller) {
            if (status === 'healthy') status = 'warning';
            issues.push('Service worker not active');
        }

        this.healthStatus = status;
        this.performanceMetrics.healthIssues = issues;
    }

    bindNetworkEvents() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.logEvent('network', 'Connection restored');
            this.performHealthCheck();
            this.showNotification('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.logEvent('network', 'Connection lost');
            this.performHealthCheck();
            this.showNotification('Working offline', 'warning');
        });
    }

    bindPerformanceMonitoring() {
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.duration > 50) { // Tasks longer than 50ms
                            this.logEvent('performance', `Long task: ${entry.duration.toFixed(2)}ms`);
                        }
                    });
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.warn('Performance monitoring not available:', e);
            }
        }

        // Monitor page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.logEvent('visibility', 'Page hidden');
            } else {
                this.logEvent('visibility', 'Page visible');
                this.performHealthCheck(); // Check health when page becomes visible
            }
        });
    }

    bindErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null
            });
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });

        // Service worker error handler
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('error', (event) => {
                this.logError('Service Worker Error', event);
            });
        }
    }

    logError(type, details) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            type: type,
            details: details,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.errorLog.push(errorEntry);

        // Maintain max log size
        if (this.errorLog.length > this.maxErrorLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxErrorLogSize);
        }

        console.error('Health Monitor - Error logged:', errorEntry);
        this.performHealthCheck(); // Update health status after error
    }

    logEvent(category, message) {
        console.log(`Health Monitor - ${category}:`, message);
    }

    // REMOVED: createHealthIndicator() method
    // REMOVED: updateHealthIndicator() method
    // REMOVED: getStatusMessage() method
    // REMOVED: showHealthDetails() method
    // REMOVED: formatHealthInfo() method

    exportHealthData() {
        const data = {
            healthStatus: this.healthStatus,
            lastHealthCheck: this.lastHealthCheck,
            errorLog: this.errorLog,
            performanceMetrics: this.performanceMetrics,
            exportTimestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `a2l-health-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Health data exported', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `health-notification health-notification-${type}`;
        notification.textContent = message;

        // Add notification styles if not already present
        if (!document.getElementById('health-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'health-notification-styles';
            styles.textContent = `
                .health-notification {
                    position: fixed;
                    top: 50px;
                    right: 20px;
                    padding: 12px 16px;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 500;
                    z-index: 9999;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .health-notification.show {
                    transform: translateX(0);
                }

                .health-notification-success {
                    background: #48bb78;
                    color: white;
                }

                .health-notification-warning {
                    background: #ed8936;
                    color: white;
                }

                .health-notification-error {
                    background: #e53e3e;
                    color: white;
                }

                .health-notification-info {
                    background: #4299e1;
                    color: white;
                }

                @media (max-width: 480px) {
                    .health-notification {
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Public API methods
    getHealthStatus() {
        return {
            status: this.healthStatus,
            lastCheck: this.lastHealthCheck,
            isOnline: this.isOnline,
            errorCount: this.errorLog.length
        };
    }

    getPerformanceReport() {
        return {
            metrics: this.performanceMetrics,
            healthData: this.lastHealthCheck,
            recommendations: this.generateRecommendations()
        };
    }

    generateRecommendations() {
        const recommendations = [];

        if (this.lastHealthCheck) {
            // Memory recommendations
            if (this.lastHealthCheck.memory.available && this.lastHealthCheck.memory.usagePercentage > 70) {
                recommendations.push('Consider clearing browser cache or closing other tabs to free memory');
            }

            // Performance recommendations
            if (this.lastHealthCheck.performance.loadTime > 3000) {
                recommendations.push('Page load time is slow. Check network connection or clear cache');
            }

            // Service Worker recommendations
            if (this.lastHealthCheck.serviceWorker.supported && !this.lastHealthCheck.serviceWorker.controller) {
                recommendations.push('Service Worker not active. Refresh the page to enable offline functionality');
            }

            // Error recommendations
            if (this.errorLog.length > 10) {
                recommendations.push('Multiple errors detected. Consider refreshing the page or reporting the issue');
            }

            // Connectivity recommendations
            if (!this.isOnline) {
                recommendations.push('Working offline. Some features may be limited until connection is restored');
            }
        }

        return recommendations.length > 0 ? recommendations : ['App is running optimally'];
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        // REMOVED: Health indicator removal code

        console.log('A2L Health Monitor destroyed');
    }
}

// Initialize health monitor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window !== 'undefined') {
        window.a2lHealth = new A2LHealthMonitor();
        
        // Make health status available globally for debugging
        window.getHealthStatus = () => window.a2lHealth.getHealthStatus();
        window.exportHealthData = () => window.a2lHealth.exportHealthData();
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = A2LHealthMonitor;
}
