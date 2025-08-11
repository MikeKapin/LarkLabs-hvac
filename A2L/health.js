/**
 * A2L Calculator Health Monitoring System
 * Monitors app performance, connectivity, and provides system diagnostics
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
        this.createHealthIndicator();
        console.log('A2L Health Monitor initialized');
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
        this.updateHealthIndicator();

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

    createHealthIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'health-indicator';
        indicator.className = 'health-indicator';
        indicator.setAttribute('aria-label', 'App health status');
        
        const styles = document.createElement('style');
        styles.textContent = `
            .health-indicator {
                position: fixed;
                top: 20px;
                left: 20px;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #48bb78;
                z-index: 999;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
            }

            .health-indicator.warning {
                background: #ed8936;
                box-shadow: 0 0 0 0 rgba(237, 137, 54, 0.7);
            }

            .health-indicator.error {
                background: #e53e3e;
                box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7);
                animation: pulse 2s infinite;
            }

            .health-indicator.offline {
                background: #718096;
                box-shadow: 0 0 0 0 rgba(113, 128, 150, 0.7);
            }

            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
                100% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
            }

            .health-indicator:hover {
                transform: scale(1.2);
            }

            .health-tooltip {
                position: absolute;
                top: 25px;
                left: 0;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
                z-index: 1000;
            }

            .health-indicator:hover .health-tooltip {
                opacity: 1;
            }

            @media (max-width: 768px) {
                .health-indicator {
                    top: 10px;
                    left: 10px;
                    width: 10px;
                    height: 10px;
                }
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(indicator);

        // Add click handler for detailed health info
        indicator.addEventListener('click', () => {
            this.showHealthDetails();
        });
    }

    updateHealthIndicator() {
        const indicator = document.getElementById('health-indicator');
        if (!indicator) return;

        // Remove existing status classes
        indicator.className = 'health-indicator';
        
        // Add current status class
        if (this.healthStatus !== 'healthy') {
            indicator.classList.add(this.healthStatus);
        }

        // Update tooltip
        let existingTooltip = indicator.querySelector('.health-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'health-tooltip';
        tooltip.textContent = this.getStatusMessage();
        indicator.appendChild(tooltip);
    }

    getStatusMessage() {
        const messages = {
            healthy: 'App running normally',
            warning: 'Minor issues detected',
            error: 'Errors detected',
            offline: 'Working offline'
        };
        return messages[this.healthStatus] || 'Status unknown';
    }

    showHealthDetails() {
        if (!this.lastHealthCheck) {
            alert('No health data available yet');
            return;
        }

        const healthInfo = this.formatHealthInfo(this.lastHealthCheck);
        
        // Create modal for health details
        const modal = document.createElement('div');
        modal.className = 'health-modal';
        modal.innerHTML = `
            <div class="health-modal-content">
                <div class="health-modal-header">
                    <h3>App Health Status</h3>
                    <button class="health-modal-close">&times;</button>
                </div>
                <div class="health-modal-body">
                    <pre>${healthInfo}</pre>
                </div>
                <div class="health-modal-footer">
                    <button class="health-export-btn">Export Health Data</button>
                    <button class="health-refresh-btn">Refresh Check</button>
                </div>
            </div>
        `;

        // Add modal styles
        const modalStyles = document.createElement('style');
        modalStyles.textContent = `
            .health-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }

            .health-modal-content {
                background: white;
                border-radius: 8px;
                width: 90%;
                max-width: 600px;
                max-height: 80%;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .health-modal-header {
                padding: 20px;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f7fafc;
            }

            .health-modal-header h3 {
                margin: 0;
                color: #2d3748;
            }

            .health-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #718096;
            }

            .health-modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }

            .health-modal-body pre {
                background: #f7fafc;
                padding: 15px;
                border-radius: 4px;
                font-size: 12px;
                line-height: 1.4;
                margin: 0;
                white-space: pre-wrap;
                word-wrap: break-word;
            }

            .health-modal-footer {
                padding: 20px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }

            .health-modal-footer button {
                padding: 8px 16px;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }

            .health-export-btn {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }

            .health-refresh-btn {
                background: white;
                color: #4a5568;
            }

            .health-refresh-btn:hover {
                background: #f7fafc;
            }
        `;

        document.head.appendChild(modalStyles);
        document.body.appendChild(modal);

        // Bind modal events
        modal.querySelector('.health-modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(modalStyles);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(modalStyles);
            }
        });

        modal.querySelector('.health-export-btn').addEventListener('click', () => {
            this.exportHealthData();
        });

        modal.querySelector('.health-refresh-btn').addEventListener('click', () => {
            this.performHealthCheck();
            modal.querySelector('.health-modal-body pre').textContent = this.formatHealthInfo(this.lastHealthCheck);
        });
    }

    formatHealthInfo(healthData) {
        return `STATUS: ${this.healthStatus.toUpperCase()}
LAST CHECK: ${new Date(healthData.timestamp).toLocaleString()}

CONNECTIVITY:
  Online: ${healthData.online ? 'Yes' : 'No'}
  
PERFORMANCE:
  Load Time: ${healthData.performance.loadTime || 'N/A'}ms
  DOM Ready: ${healthData.performance.domContentLoaded || 'N/A'}ms
  First Paint: ${healthData.performance.firstPaint || 'N/A'}ms
  Health Check: ${healthData.healthCheckDuration.toFixed(2)}ms

MEMORY:
  Used: ${healthData.memory.available ? `${(healthData.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : 'N/A'}
  Total: ${healthData.memory.available ? `${(healthData.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB` : 'N/A'}
  Usage: ${healthData.memory.available ? `${healthData.memory.usagePercentage}%` : 'N/A'}

SERVICE WORKER:
  Supported: ${healthData.serviceWorker.supported ? 'Yes' : 'No'}
  Active: ${healthData.serviceWorker.controller ? 'Yes' : 'No'}

PWA FEATURES:
  Standalone Mode: ${healthData.features.pwa.standalone ? 'Yes' : 'No'}
  Manifest Support: ${healthData.features.pwa.manifest ? 'Yes' : 'No'}

RECENT ERRORS: ${healthData.errors.length}
${healthData.errors.length > 0 ? healthData.errors.map(err => `  • ${err.type}: ${err.details.message || 'No message'}`).join('\n') : '  None'}

VIEWPORT: ${healthData.viewport.width}x${healthData.viewport.height}`;
    }

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

        // Remove health indicator
        const indicator = document.getElementById('health-indicator');
        if (indicator) {
            indicator.remove();
        }

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
