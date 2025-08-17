// Mobile Touch Fix for HVAC Pro Tools
// Ensures proper tool opening on mobile devices

class MobileTouchFix {
    constructor() {
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupMobileHandlers());
        } else {
            this.setupMobileHandlers();
        }
    }
    
    setupMobileHandlers() {
        console.log('Setting up mobile touch handlers for HVAC Pro Tools');
        
        // Replace onclick handlers with proper touch and click event listeners
        this.setupToolCardHandlers();
        this.setupNavigationHandlers();
        this.setupButtonHandlers();
        this.addMobileTouchFeedback();
        
        // Add mobile-specific optimizations
        this.optimizeForMobile();
        
        console.log('Mobile touch handlers setup complete');
    }
    
    setupToolCardHandlers() {
        // Find all tool cards and add proper mobile event handlers
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach(card => {
            // Remove existing onclick handler conflicts
            const onclickAttr = card.getAttribute('onclick');
            if (onclickAttr) {
                // Extract the tool ID from onclick
                const toolIdMatch = onclickAttr.match(/openTool\(['"]([^'"]+)['"]\)/);
                const comingSoonMatch = onclickAttr.match(/showComingSoon\(['"]([^'"]+)['"]\)/);
                
                if (toolIdMatch) {
                    const toolId = toolIdMatch[1];
                    this.addMobileToolHandler(card, toolId);
                } else if (comingSoonMatch) {
                    const toolName = comingSoonMatch[1];
                    this.addComingSoonHandler(card, toolName);
                }
            }
        });
    }
    
    addMobileToolHandler(card, toolId) {
        // Add visual feedback class
        card.classList.add('mobile-interactive');
        
        // Remove the onclick attribute to prevent conflicts
        card.removeAttribute('onclick');
        
        // Add proper event listeners for mobile
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Add visual feedback
            card.classList.add('mobile-pressed');
            setTimeout(() => card.classList.remove('mobile-pressed'), 150);
            
            // Open the tool
            this.openToolMobile(toolId);
        };
        
        // Add both touch and click handlers for compatibility
        card.addEventListener('touchstart', this.handleTouchStart.bind(this, card), { passive: false });
        card.addEventListener('touchend', handler, { passive: false });
        card.addEventListener('click', handler);
        
        // Prevent context menu on long press
        card.addEventListener('contextmenu', (e) => e.preventDefault());
        
        console.log(`Mobile handler added for tool: ${toolId}`);
    }
    
    addComingSoonHandler(card, toolName) {
        card.classList.add('mobile-interactive');
        card.removeAttribute('onclick');
        
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            card.classList.add('mobile-pressed');
            setTimeout(() => card.classList.remove('mobile-pressed'), 150);
            
            this.showComingSoonMobile(toolName);
        };
        
        card.addEventListener('touchend', handler, { passive: false });
        card.addEventListener('click', handler);
        card.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleTouchStart(card, e) {
        // Add touch feedback
        card.classList.add('mobile-touching');
    }
    
    openToolMobile(toolId) {
        console.log(`Opening tool on mobile: ${toolId}`);
        
        try {
            // Hide main app
            const mainApp = document.getElementById('main-app');
            if (mainApp) {
                mainApp.style.display = 'none';
            }
            
            // Show tool content
            const toolElement = document.getElementById(toolId);
            if (toolElement) {
                toolElement.style.display = 'block';
                
                // Load tool content
                this.loadToolContentMobile(toolId);
                
                // Scroll to top
                window.scrollTo(0, 0);
                
                // Add mobile back button functionality
                this.setupMobileBackButton(toolId);
                
                console.log(`Tool ${toolId} opened successfully on mobile`);
            } else {
                console.error(`Tool element not found: ${toolId}`);
                this.showMobileError(`Tool "${toolId}" not found`);
            }
        } catch (error) {
            console.error('Error opening tool on mobile:', error);
            this.showMobileError('Failed to open tool');
        }
    }
    
    loadToolContentMobile(toolId) {
        const contentDiv = document.getElementById(toolId + '-content');
        if (!contentDiv) {
            console.error(`Content div not found for: ${toolId}`);
            return;
        }
        
        // Use existing content loading functions but with mobile error handling
        try {
            if (typeof loadToolContent === 'function') {
                loadToolContent(toolId);
            } else {
                // Fallback: call specific tool loading functions
                switch(toolId) {
                    case 'load-calculator':
                        if (typeof getLoadCalculatorContent === 'function') {
                            contentDiv.innerHTML = getLoadCalculatorContent();
                            if (typeof initializeLoadCalculator === 'function') {
                                initializeLoadCalculator();
                            }
                        }
                        break;
                    case 'superheat-subcool':
                        if (typeof getSuperheatSubcoolContent === 'function') {
                            contentDiv.innerHTML = getSuperheatSubcoolContent();
                            if (typeof initializeSuperheatSubcool === 'function') {
                                initializeSuperheatSubcool();
                            }
                        }
                        break;
                    case 'pt-chart':
                        if (typeof getPTChartContent === 'function') {
                            contentDiv.innerHTML = getPTChartContent();
                            if (typeof initializePTChart === 'function') {
                                initializePTChart();
                            }
                        }
                        break;
                    case 'psychrometric':
                        if (typeof getPsychrometricContent === 'function') {
                            contentDiv.innerHTML = getPsychrometricContent();
                            if (typeof initializePsychrometric === 'function') {
                                initializePsychrometric();
                            }
                        }
                        break;
                    case 'unit-converter':
                        if (typeof getUnitConverterContent === 'function') {
                            contentDiv.innerHTML = getUnitConverterContent();
                            if (typeof initializeUnitConverter === 'function') {
                                initializeUnitConverter();
                            }
                        }
                        break;
                    case 'duct-sizing':
                        if (typeof getDuctSizingContent === 'function') {
                            contentDiv.innerHTML = getDuctSizingContent();
                            if (typeof initializeDuctSizing === 'function') {
                                initializeDuctSizing();
                            }
                        }
                        break;
                    default:
                        console.warn(`Unknown tool: ${toolId}`);
                        contentDiv.innerHTML = '<p>Tool content loading...</p>';
                }
            }
        } catch (error) {
            console.error(`Error loading content for ${toolId}:`, error);
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #e74c3c;">
                    <h3>⚠️ Loading Error</h3>
                    <p>There was an issue loading this tool. Please try again.</p>
                    <button onclick="location.reload()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px; cursor: pointer;">Reload App</button>
                </div>
            `;
        }
    }
    
    setupMobileBackButton(toolId) {
        const backBtn = document.querySelector(`#${toolId} .back-btn`);
        if (backBtn) {
            // Remove onclick and add mobile-friendly handler
            backBtn.removeAttribute('onclick');
            
            const backHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showMainAppMobile();
            };
            
            backBtn.addEventListener('touchend', backHandler, { passive: false });
            backBtn.addEventListener('click', backHandler);
        }
    }
    
    showMainAppMobile() {
        console.log('Returning to main app on mobile');
        
        // Hide all tool content
        const toolContents = document.querySelectorAll('.app-content');
        toolContents.forEach(content => {
            content.style.display = 'none';
        });
        
        // Show main app
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            mainApp.style.display = 'block';
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    showComingSoonMobile(toolName) {
        // Create mobile-friendly coming soon modal
        const modal = document.createElement('div');
        modal.className = 'mobile-modal';
        modal.innerHTML = `
            <div class="mobile-modal-content">
                <h3>🚧 Coming Soon</h3>
                <p><strong>${toolName}</strong></p>
                <p>This feature is currently under development and will be available in a future update.</p>
                <button class="mobile-modal-btn" onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 5000);
    }
    
    showMobileError(message) {
        const errorModal = document.createElement('div');
        errorModal.className = 'mobile-error-modal';
        errorModal.innerHTML = `
            <div class="mobile-modal-content error">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button class="mobile-modal-btn" onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        document.body.appendChild(errorModal);
        
        setTimeout(() => {
            if (errorModal.parentElement) {
                errorModal.remove();
            }
        }, 5000);
    }
    
    setupNavigationHandlers() {
        // Fix navigation buttons for mobile
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr) {
                btn.removeAttribute('onclick');
                
                const handler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    btn.classList.add('mobile-pressed');
                    setTimeout(() => btn.classList.remove('mobile-pressed'), 150);
                    
                    // Execute the original function
                    try {
                        eval(onclickAttr);
                    } catch (error) {
                        console.error('Navigation handler error:', error);
                    }
                };
                
                btn.addEventListener('touchend', handler, { passive: false });
                btn.addEventListener('click', handler);
            }
        });
    }
    
    setupButtonHandlers() {
        // Fix all buttons with onclick handlers for mobile
        const buttonsWithOnclick = document.querySelectorAll('button[onclick]');
        buttonsWithOnclick.forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr) {
                const handler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    btn.classList.add('mobile-pressed');
                    setTimeout(() => btn.classList.remove('mobile-pressed'), 150);
                    
                    try {
                        eval(onclickAttr);
                    } catch (error) {
                        console.error('Button handler error:', error);
                    }
                };
                
                btn.addEventListener('touchend', handler, { passive: false });
                btn.addEventListener('click', handler);
            }
        });
    }
    
    addMobileTouchFeedback() {
        // Add CSS for mobile touch feedback
        const style = document.createElement('style');
        style.textContent = `
            .mobile-interactive {
                -webkit-tap-highlight-color: rgba(42, 82, 152, 0.3);
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
            
            .mobile-pressed {
                transform: scale(0.98) !important;
                opacity: 0.8 !important;
                transition: all 0.1s ease !important;
            }
            
            .mobile-touching {
                transform: scale(0.99);
                opacity: 0.9;
            }
            
            .mobile-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            }
            
            .mobile-modal-content {
                background: white;
                border-radius: 15px;
                padding: 25px;
                text-align: center;
                max-width: 300px;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            }
            
            .mobile-modal-content.error {
                border: 3px solid #e74c3c;
            }
            
            .mobile-modal-content h3 {
                color: #2c3e50;
                margin-bottom: 15px;
            }
            
            .mobile-modal-content p {
                color: #555;
                margin-bottom: 10px;
                line-height: 1.4;
            }
            
            .mobile-modal-btn {
                background: #3498db;
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 20px;
                cursor: pointer;
                margin-top: 15px;
                font-weight: 600;
                min-width: 80px;
            }
            
            .mobile-modal-content.error .mobile-modal-btn {
                background: #e74c3c;
            }
            
            /* Enhanced mobile tool card styling */
            @media (max-width: 768px) {
                .tool-card {
                    padding: 20px !important;
                    min-height: 120px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-align: center;
                }
                
                .tool-icon {
                    font-size: 2.5em !important;
                    margin-bottom: 10px !important;
                }
                
                .tool-title {
                    font-size: 1.1em !important;
                    margin-bottom: 8px !important;
                }
                
                .tool-description {
                    font-size: 0.85em !important;
                    line-height: 1.3 !important;
                }
                
                .tools-grid {
                    grid-template-columns: 1fr !important;
                    gap: 15px !important;
                    padding: 15px !important;
                }
                
                /* Improve button touch targets */
                .nav-btn {
                    min-height: 44px !important;
                    padding: 12px 16px !important;
                    font-size: 0.9em !important;
                }
                
                .back-btn {
                    min-height: 44px !important;
                    padding: 12px 20px !important;
                    font-size: 1em !important;
                    margin-bottom: 20px !important;
                }
                
                /* Ensure form elements are touch-friendly */
                input, select, button {
                    min-height: 44px !important;
                    font-size: 16px !important; /* Prevents zoom on iOS */
                }
                
                /* Improve modal touch targets */
                .close-btn {
                    min-width: 44px !important;
                    min-height: 44px !important;
                    font-size: 1.5em !important;
                }
            }
            
            /* Touch-specific improvements */
            @media (pointer: coarse) {
                .tool-card {
                    min-height: 140px;
                }
                
                .tool-card:active {
                    transform: scale(0.98);
                }
                
                button:active {
                    transform: scale(0.98);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    optimizeForMobile() {
        // Add mobile-specific optimizations
        
        // Prevent double-tap zoom on buttons and interactive elements
        const interactiveElements = document.querySelectorAll('button, .tool-card, .nav-btn');
        interactiveElements.forEach(element => {
            element.style.touchAction = 'manipulation';
        });
        
        // Add viewport meta tag optimization for better mobile handling
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
            );
        }
        
        // Add mobile debugging (remove in production)
        if (this.isMobileDevice()) {
            console.log('Mobile device detected - enhanced touch handlers active');
            this.addMobileDebugInfo();
        }
    }
    
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
    }
    
    addMobileDebugInfo() {
        // Add a small debug indicator for mobile testing
        const debugInfo = document.createElement('div');
        debugInfo.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 10px;
            z-index: 9999;
            pointer-events: none;
        `;
        debugInfo.textContent = 'Mobile Touch: Active';
        document.body.appendChild(debugInfo);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (debugInfo.parentElement) {
                debugInfo.remove();
            }
        }, 3000);
    }
    
    // Override the global openTool function to ensure mobile compatibility
    replaceGlobalFunctions() {
        // Store original functions as fallbacks
        window.originalOpenTool = window.openTool;
        window.originalShowMainApp = window.showMainApp;
        
        // Replace with mobile-optimized versions
        window.openTool = (toolId) => {
            console.log('Mobile-optimized openTool called:', toolId);
            this.openToolMobile(toolId);
        };
        
        window.showMainApp = () => {
            console.log('Mobile-optimized showMainApp called');
            this.showMainAppMobile();
        };
    }
}

// Initialize mobile touch fix when script loads
const mobileFix = new MobileTouchFix();

// Also replace global functions for any remaining onclick handlers
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        mobileFix.replaceGlobalFunctions();
        console.log('Mobile touch fix fully initialized');
    }, 500);
});

// Add mobile-specific error handling for PWA
window.addEventListener('error', (e) => {
    if (mobileFix && mobileFix.isMobileDevice()) {
        console.error('Mobile app error:', e.error);
        // Could add mobile-specific error reporting here
    }
});

// Handle orientation changes on mobile
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});

console.log('Mobile touch fix script loaded');