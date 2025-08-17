// Accessibility and Mobile Enhancements for HVAC Pro Tools

class AccessibilityManager {
    constructor() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupMobileOptimizations();
        this.setupColorContrastMode();
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation for tool cards
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.highlightFocusedElements();
            }
            
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case 'h':
                        e.preventDefault();
                        showHelpGuide();
                        break;
                    case 's':
                        e.preventDefault();
                        hvacEnhanced.showSavedCalculations();
                        break;
                    case 'l':
                        e.preventDefault();
                        openTool('load-calculator');
                        break;
                }
            }
        });
    }

    highlightFocusedElements() {
        // Add visual focus indicators
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 3px solid #4ecdc4 !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 10px rgba(78, 205, 196, 0.5) !important;
            }
        `;
        if (!document.getElementById('focus-styles')) {
            style.id = 'focus-styles';
            document.head.appendChild(style);
        }
    }

    setupScreenReaderSupport() {
        // Add ARIA labels and live regions
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);

        // Announce calculation results
        this.originalAddMessage = window.addMessage;
        window.addMessage = (content, role) => {
            if (this.originalAddMessage) {
                this.originalAddMessage(content, role);
            }
            
            if (role === 'assistant') {
                liveRegion.textContent = `Calculation complete: ${content.substring(0, 100)}...`;
            }
        };
    }

    setupMobileOptimizations() {
        // Enhanced mobile gestures and touch support
        this.setupTouchGestures();
        this.setupMobileKeyboard();
        this.setupOrientationHandling();
    }

    setupTouchGestures() {
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipeGesture();
        });
    }

    handleSwipeGesture() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - could open quick tools menu
                this.showQuickToolsMenu();
            } else {
                // Swipe down - could close modals
                this.closeAllModals();
            }
        }
    }

    setupMobileKeyboard() {
        // Handle virtual keyboard on mobile
        const viewport = document.querySelector('meta[name=viewport]');
        
        window.addEventListener('resize', () => {
            if (window.innerHeight < 500) {
                // Virtual keyboard is probably open
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            } else {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
            }
        });
    }

    setupOrientationHandling() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.adjustLayoutForOrientation();
            }, 500);
        });
    }

    adjustLayoutForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const toolsGrid = document.querySelector('.tools-grid');
        
        if (isLandscape && window.innerWidth < 1024) {
            // Landscape mobile - adjust grid
            if (toolsGrid) {
                toolsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            }
        } else {
            // Portrait or desktop - reset
            if (toolsGrid) {
                toolsGrid.style.gridTemplateColumns = '';
            }
        }
    }

    setupColorContrastMode() {
        // High contrast mode support
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            this.enableHighContrastMode();
        }

        // Reduced motion support
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.enableReducedMotionMode();
        }
    }

    enableHighContrastMode() {
        const style = document.createElement('style');
        style.textContent = `
            .tool-card {
                border: 3px solid #ffffff !important;
                background: rgba(0, 0, 0, 0.9) !important;
            }
            
            .btn-primary, .btn-secondary {
                border: 2px solid #ffffff !important;
            }
            
            .input-field {
                border: 3px solid #ffffff !important;
                background: rgba(0, 0, 0, 0.8) !important;
            }
        `;
        document.head.appendChild(style);
    }

    enableReducedMotionMode() {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }

    showQuickToolsMenu() {
        // Quick access menu for mobile
        if (document.getElementById('quick-tools-menu')) return;

        const quickMenu = document.createElement('div');
        quickMenu.id = 'quick-tools-menu';
        quickMenu.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(26, 26, 26, 0.95);
            backdrop-filter: blur(10px);
            padding: 20px;
            z-index: 2000;
            border-top: 1px solid rgba(78, 205, 196, 0.3);
            animation: slideUp 0.3s ease;
        `;

        quickMenu.innerHTML = `
            <div style="display: flex; justify-content: space-around; align-items: center;">
                <button onclick="openTool('load-calculator'); this.parentElement.parentElement.remove();" 
                        style="background: none; border: none; color: #4ecdc4; text-align: center; cursor: pointer;">
                    <div style="font-size: 24px;">🏠</div>
                    <div style="font-size: 12px;">Load Calc</div>
                </button>
                <button onclick="openTool('superheat-subcool'); this.parentElement.parentElement.remove();" 
                        style="background: none; border: none; color: #4ecdc4; text-align: center; cursor: pointer;">
                    <div style="font-size: 24px;">🌡️</div>
                    <div style="font-size: 12px;">SuperHeat</div>
                </button>
                <button onclick="openTool('pt-chart'); this.parentElement.parentElement.remove();" 
                        style="background: none; border: none; color: #4ecdc4; text-align: center; cursor: pointer;">
                    <div style="font-size: 24px;">📊</div>
                    <div style="font-size: 12px;">P-T Chart</div>
                </button>
                <button onclick="hvacEnhanced.showSavedCalculations(); this.parentElement.parentElement.remove();" 
                        style="background: none; border: none; color: #4ecdc4; text-align: center; cursor: pointer;">
                    <div style="font-size: 24px;">💾</div>
                    <div style="font-size: 12px;">Saved</div>
                </button>
                <button onclick="this.parentElement.parentElement.remove();" 
                        style="background: none; border: none; color: #ff6b6b; text-align: center; cursor: pointer;">
                    <div style="font-size: 24px;">×</div>
                    <div style="font-size: 12px;">Close</div>
                </button>
            </div>
        `;

        document.body.appendChild(quickMenu);

        // Auto-close after 10 seconds
        setTimeout(() => {
            if (quickMenu.parentElement) {
                quickMenu.remove();
            }
        }, 10000);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        const quickMenu = document.getElementById('quick-tools-menu');
        if (quickMenu) {
            quickMenu.remove();
        }
    }

    // Performance monitoring
    setupPerformanceMonitoring() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log(`HVAC Pro Tools Performance:
                        Load Time: ${perfData.loadEventEnd - perfData.loadEventStart}ms
                        DOM Ready: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms
                        Total Time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
                }, 1000);
            });
        }
    }

    // Data usage tracking for mobile users
    setupDataUsageOptimization() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Optimize for slow connections
                this.enableLowDataMode();
            }
        }
    }

    enableLowDataMode() {
        // Reduce animations and effects for slow connections
        const style = document.createElement('style');
        style.textContent = `
            .tool-card { transition: none !important; }
            .modal { animation: none !important; }
            .btn-primary, .btn-secondary { transition: none !important; }
        `;
        document.head.appendChild(style);
        
        console.log('Low data mode enabled for better performance');
    }
}

// Enhanced error handling and user feedback
class UserFeedbackManager {
    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#4ecdc4' : '#74b9ff'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 3000;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            animation: toastSlideIn 0.3s ease;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static showProgressIndicator(show = true) {
        let indicator = document.getElementById('progress-indicator');
        
        if (show && !indicator) {
            indicator = document.createElement('div');
            indicator.id = 'progress-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #4ecdc4, #44a08d);
                z-index: 3000;
                animation: progressSlide 2s ease-in-out infinite;
            `;
            document.body.appendChild(indicator);
        } else if (!show && indicator) {
            indicator.remove();
        }
    }
}

// Add CSS animations for feedback elements
const feedbackStyles = document.createElement('style');
feedbackStyles.textContent = `
    @keyframes toastSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes toastSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes progressSlide {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(0); }
        100% { transform: translateX(100%); }
    }
    
    @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
`;
document.head.appendChild(feedbackStyles);

// Initialize accessibility manager
const accessibilityManager = new AccessibilityManager();

// Enhanced error handling for calculations
const originalCalculateLoadsLC = window.calculateLoadsLC;
window.calculateLoadsLC = function() {
    try {
        UserFeedbackManager.showProgressIndicator(true);
        UserFeedbackManager.showToast('Calculating loads...', 'info', 1000);
        
        const result = originalCalculateLoadsLC();
        
        UserFeedbackManager.showProgressIndicator(false);
        UserFeedbackManager.showToast('Calculation completed successfully!', 'success');
        
        return result;
    } catch (error) {
        UserFeedbackManager.showProgressIndicator(false);
        UserFeedbackManager.showToast('Calculation failed. Please check your inputs.', 'error');
        console.error('Load calculation error:', error);
    }
};

// Enhanced mobile detection and optimization
class MobileOptimizer {
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
               || window.innerWidth < 768;
    }

    static isTablet() {
        return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent) 
               || (window.innerWidth >= 768 && window.innerWidth < 1024);
    }

    static optimizeForDevice() {
        if (this.isMobile()) {
            this.enableMobileOptimizations();
        } else if (this.isTablet()) {
            this.enableTabletOptimizations();
        }
    }

    static enableMobileOptimizations() {
        // Larger touch targets
        const style = document.createElement('style');
        style.textContent = `
            .tool-card { min-height: 120px; padding: 20px; }
            .btn-primary, .btn-secondary { min-height: 48px; padding: 15px 25px; }
            .input-field { min-height: 48px; font-size: 16px; }
            .nav-btn { min-height: 44px; padding: 12px 20px; }
        `;
        document.head.appendChild(style);
        
        // Add haptic feedback for supported devices
        if ('vibrate' in navigator) {
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-primary') || 
                    e.target.classList.contains('tool-card')) {
                    navigator.vibrate(50);
                }
            });
        }
    }

    static enableTabletOptimizations() {
        // Optimize layout for tablet screens
        const style = document.createElement('style');
        style.textContent = `
            .tools-grid { grid-template-columns: repeat(2, 1fr); }
            .modal-content { max-width: 70vw; }
        `;
        document.head.appendChild(style);
    }
}

// Network status handling
class NetworkManager {
    constructor() {
        this.setupNetworkHandling();
    }

    setupNetworkHandling() {
        window.addEventListener('online', () => {
            UserFeedbackManager.showToast('Connection restored', 'success');
            this.syncPendingData();
        });

        window.addEventListener('offline', () => {
            UserFeedbackManager.showToast('Working offline - calculations will be saved locally', 'info');
        });
    }

    syncPendingData() {
        // Sync any pending calculations when back online
        const pendingCalcs = JSON.parse(localStorage.getItem('hvacPendingSync') || '[]');
        if (pendingCalcs.length > 0) {
            console.log(`Syncing ${pendingCalcs.length} pending calculations`);
            // Implementation would depend on your backend sync requirements
            localStorage.removeItem('hvacPendingSync');
        }
    }

    isOnline() {
        return navigator.onLine;
    }
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', () => {
    const networkManager = new NetworkManager();
    MobileOptimizer.optimizeForDevice();
    
    // Add keyboard shortcut hints
    const shortcutHints = document.createElement('div');
    shortcutHints.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 8px 12px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    shortcutHints.textContent = 'Alt+H: Help | Alt+S: Saved | Alt+L: Load Calc';
    document.body.appendChild(shortcutHints);

    // Show hints on first visit
    if (!localStorage.getItem('hvacProHintsShown')) {
        setTimeout(() => {
            shortcutHints.style.opacity = '1';
            setTimeout(() => {
                shortcutHints.style.opacity = '0';
            }, 5000);
        }, 2000);
        localStorage.setItem('hvacProHintsShown', 'true');
    }
});

// Performance optimization
window.addEventListener('load', () => {
    // Lazy load non-critical features
    setTimeout(() => {
        accessibilityManager.setupPerformanceMonitoring();
        accessibilityManager.setupDataUsageOptimization();
    }, 1000);
});