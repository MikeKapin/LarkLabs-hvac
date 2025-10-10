// services/mobileDetection.js
// Mobile Device Detection and Optimization Service for HVAC Jack 4.0

class MobileDetectionService {
    constructor() {
        this.userAgent = navigator.userAgent.toLowerCase();
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.screenWidth = window.screen.width;
        this.screenHeight = window.screen.height;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        
        this.deviceInfo = this.detectDevice();
        this.capabilities = this.detectCapabilities();
        
        // Initialize orientation change handler
        this.initOrientationHandler();
    }

    /**
     * Detects device type and characteristics
     * @returns {Object} Device information
     */
    detectDevice() {
        const device = {
            type: 'desktop',
            os: 'unknown',
            browser: 'unknown',
            isMobile: false,
            isTablet: false,
            isSmallScreen: this.screenWidth < 768,
            isMediumScreen: this.screenWidth >= 768 && this.screenWidth < 1024,
            isLargeScreen: this.screenWidth >= 1024
        };

        // Detect mobile devices
        if (this.userAgent.includes('mobile') || this.screenWidth < 768) {
            device.isMobile = true;
            device.type = 'mobile';
        }

        // Detect tablets
        if (this.userAgent.includes('tablet') || 
            (this.isTouchDevice && this.screenWidth >= 768 && this.screenWidth < 1024)) {
            device.isTablet = true;
            device.type = 'tablet';
        }

        // Detect OS
        if (this.userAgent.includes('android')) {
            device.os = 'android';
            device.isMobile = true;
        } else if (this.userAgent.includes('iphone') || this.userAgent.includes('ipad')) {
            device.os = 'ios';
            device.isMobile = this.userAgent.includes('iphone');
            device.isTablet = this.userAgent.includes('ipad');
        } else if (this.userAgent.includes('windows')) {
            device.os = 'windows';
        } else if (this.userAgent.includes('mac')) {
            device.os = 'mac';
        }

        // Detect browser
        if (this.userAgent.includes('chrome')) {
            device.browser = 'chrome';
        } else if (this.userAgent.includes('safari')) {
            device.browser = 'safari';
        } else if (this.userAgent.includes('firefox')) {
            device.browser = 'firefox';
        } else if (this.userAgent.includes('edge')) {
            device.browser = 'edge';
        }

        return device;
    }

    /**
     * Detects device capabilities
     * @returns {Object} Device capabilities
     */
    detectCapabilities() {
        return {
            touch: this.isTouchDevice,
            camera: this.hasCameraSupport(),
            geolocation: 'geolocation' in navigator,
            localStorage: this.hasLocalStorage(),
            serviceWorker: 'serviceWorker' in navigator,
            webGL: this.hasWebGL(),
            deviceOrientation: 'DeviceOrientationEvent' in window,
            vibration: 'vibrate' in navigator,
            speechRecognition: this.hasSpeechRecognition(),
            fileAPI: this.hasFileAPI(),
            batteryAPI: 'getBattery' in navigator,
            networkInformation: 'connection' in navigator
        };
    }

    /**
     * Checks for camera support
     * @returns {boolean} True if camera is supported
     */
    hasCameraSupport() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    /**
     * Checks for localStorage support
     * @returns {boolean} True if localStorage is supported
     */
    hasLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Checks for WebGL support
     * @returns {boolean} True if WebGL is supported
     */
    hasWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    }

    /**
     * Checks for speech recognition support
     * @returns {boolean} True if speech recognition is supported
     */
    hasSpeechRecognition() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    /**
     * Checks for File API support
     * @returns {boolean} True if File API is supported
     */
    hasFileAPI() {
        return window.File && window.FileReader && window.FileList && window.Blob;
    }

    /**
     * Gets optimal touch target size based on device
     * @returns {Object} Touch target dimensions
     */
    getTouchTargetSize() {
        if (this.deviceInfo.isMobile) {
            return {
                minWidth: 44,
                minHeight: 44,
                recommended: 48
            };
        } else if (this.deviceInfo.isTablet) {
            return {
                minWidth: 40,
                minHeight: 40,
                recommended: 44
            };
        } else {
            return {
                minWidth: 32,
                minHeight: 32,
                recommended: 36
            };
        }
    }

    /**
     * Gets optimal font sizes for device
     * @returns {Object} Font size recommendations
     */
    getFontSizes() {
        const base = this.deviceInfo.isMobile ? 16 : 14;
        
        return {
            small: base - 2,
            normal: base,
            large: base + 2,
            xlarge: base + 4,
            heading: base + 6
        };
    }

    /**
     * Gets viewport dimensions
     * @returns {Object} Viewport information
     */
    getViewport() {
        return {
            width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
            deviceWidth: this.screenWidth,
            deviceHeight: this.screenHeight,
            pixelRatio: this.devicePixelRatio,
            orientation: this.getOrientation()
        };
    }

    /**
     * Gets current device orientation
     * @returns {string} Current orientation
     */
    getOrientation() {
        if (screen.orientation) {
            return screen.orientation.angle === 0 || screen.orientation.angle === 180 ? 'portrait' : 'landscape';
        } else if (window.orientation !== undefined) {
            return Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
        } else {
            return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        }
    }

    /**
     * Initializes orientation change handler
     */
    initOrientationHandler() {
        const handleOrientationChange = () => {
            setTimeout(() => {
                // Trigger custom event for orientation change
                window.dispatchEvent(new CustomEvent('hvacjack-orientation-change', {
                    detail: {
                        orientation: this.getOrientation(),
                        viewport: this.getViewport()
                    }
                }));
            }, 100); // Small delay to ensure dimensions are updated
        };

        if (screen.orientation) {
            screen.orientation.addEventListener('change', handleOrientationChange);
        } else {
            window.addEventListener('orientationchange', handleOrientationChange);
        }

        // Also listen for resize events
        window.addEventListener('resize', handleOrientationChange);
    }

    /**
     * Gets network information if available
     * @returns {Object} Network information
     */
    getNetworkInfo() {
        if (!navigator.connection) {
            return {
                type: 'unknown',
                effectiveType: 'unknown',
                downlink: null,
                rtt: null
            };
        }

        return {
            type: navigator.connection.type || 'unknown',
            effectiveType: navigator.connection.effectiveType || 'unknown',
            downlink: navigator.connection.downlink || null,
            rtt: navigator.connection.rtt || null,
            saveData: navigator.connection.saveData || false
        };
    }

    /**
     * Gets battery information if available
     * @returns {Promise<Object>} Battery information
     */
    async getBatteryInfo() {
        if (!navigator.getBattery) {
            return {
                level: null,
                charging: null,
                chargingTime: null,
                dischargingTime: null
            };
        }

        try {
            const battery = await navigator.getBattery();
            return {
                level: battery.level,
                charging: battery.charging,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime
            };
        } catch (error) {
            return {
                level: null,
                charging: null,
                chargingTime: null,
                dischargingTime: null
            };
        }
    }

    /**
     * Determines if device should use compact UI
     * @returns {boolean} True if compact UI is recommended
     */
    shouldUseCompactUI() {
        return this.deviceInfo.isMobile || this.deviceInfo.isSmallScreen;
    }

    /**
     * Determines if device supports hover interactions
     * @returns {boolean} True if hover is supported
     */
    supportsHover() {
        return !this.deviceInfo.isMobile && !this.isTouchDevice;
    }

    /**
     * Gets recommended spacing values
     * @returns {Object} Spacing recommendations
     */
    getSpacing() {
        const base = this.deviceInfo.isMobile ? 8 : 12;
        
        return {
            xs: base / 2,
            sm: base,
            md: base * 1.5,
            lg: base * 2,
            xl: base * 3
        };
    }

    /**
     * Checks if device is likely to have limited processing power
     * @returns {boolean} True if device has limited processing power
     */
    hasLimitedProcessingPower() {
        return this.deviceInfo.isMobile || this.devicePixelRatio > 2 || this.screenWidth < 768;
    }

    /**
     * Gets optimal image quality settings
     * @returns {Object} Image quality settings
     */
    getImageQualitySettings() {
        const networkInfo = this.getNetworkInfo();
        const isSlowConnection = networkInfo.effectiveType === '2g' || networkInfo.effectiveType === 'slow-2g';
        const isSaveDataEnabled = networkInfo.saveData;

        return {
            maxWidth: this.deviceInfo.isMobile ? 800 : 1200,
            maxHeight: this.deviceInfo.isMobile ? 600 : 900,
            quality: (isSlowConnection || isSaveDataEnabled) ? 0.7 : 0.85,
            format: this.capabilities.webGL ? 'webp' : 'jpeg'
        };
    }

    /**
     * Applies mobile-specific optimizations to an element
     * @param {HTMLElement} element - Element to optimize
     * @param {Object} options - Optimization options
     */
    applyMobileOptimizations(element, options = {}) {
        if (!element) return;

        const defaults = {
            touchTargets: true,
            fontSize: true,
            spacing: true,
            scrollBehavior: true
        };

        const config = { ...defaults, ...options };

        if (config.touchTargets && this.isTouchDevice) {
            const targetSize = this.getTouchTargetSize();
            const buttons = element.querySelectorAll('button, .btn, input[type="submit"], input[type="button"]');
            
            buttons.forEach(button => {
                button.style.minHeight = `${targetSize.recommended}px`;
                button.style.minWidth = `${targetSize.recommended}px`;
                button.style.padding = '12px 16px';
            });
        }

        if (config.fontSize && this.deviceInfo.isMobile) {
            const fontSizes = this.getFontSizes();
            element.style.fontSize = `${fontSizes.normal}px`;
        }

        if (config.spacing && this.deviceInfo.isMobile) {
            const spacing = this.getSpacing();
            element.style.padding = `${spacing.md}px`;
            element.style.margin = `${spacing.sm}px`;
        }

        if (config.scrollBehavior && this.deviceInfo.isMobile) {
            element.style.overflowY = 'auto';
            element.style.webkitOverflowScrolling = 'touch';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileDetectionService;
} else {
    window.MobileDetectionService = MobileDetectionService;
}