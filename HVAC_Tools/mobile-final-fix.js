// Final Mobile Fix for HVAC Pro Tools - Comprehensive Solution
// This script ensures mobile tool links work by fixing all touch event and loading issues

class FinalMobileFix {
    constructor() {
        this.isInitialized = false;
        this.isMobile = this.detectMobileDevice();
        this.init();
    }
    
    detectMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
               window.innerWidth <= 768;
    }
    
    init() {
        // Wait for all scripts to load, then apply the final fix
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.applyComprehensiveMobileFix();
            }, 1500); // Wait for all other scripts to initialize
        });
        
        // Also try on DOMContentLoaded as backup
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    this.applyComprehensiveMobileFix();
                }, 2000);
            });
        } else {
            setTimeout(() => {
                this.applyComprehensiveMobileFix();
            }, 2000);
        }
        
        // Additional fallback - apply fix when user interacts with the page
        document.addEventListener('touchstart', () => {
            if (!this.isInitialized) {
                setTimeout(() => {
                    this.applyComprehensiveMobileFix();
                }, 100);
            }
        }, { once: true, passive: true });
    }
    
    applyComprehensiveMobileFix() {
        if (this.isInitialized) return;
        
        console.log('🔧 Applying final comprehensive mobile fix...');
        
        if (this.isMobile) {
            this.fixMobileToolCards();
            this.fixMobileButtons();
            this.addMobileTouchStyles();
            this.overrideCoreFunctions();
            this.setupMobileBackButtons();
        }
        
        this.isInitialized = true;
        console.log('✅ Final mobile fix applied successfully');
        
        // Add debug indicator for mobile users
        if (this.isMobile) {
            this.addMobileDebugIndicator();
        }
    }
    
    fixMobileToolCards() {
        const toolCards = document.querySelectorAll('.tool-card');
        console.log(`Found ${toolCards.length} tool cards to fix`);
        
        toolCards.forEach((card, index) => {
            // Remove any existing event listeners
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            // Get the onclick attribute value
            const onclickAttr = newCard.getAttribute('onclick');
            
            if (onclickAttr) {
                // Remove onclick to prevent conflicts
                newCard.removeAttribute('onclick');
                
                // Extract tool ID from onclick
                const toolIdMatch = onclickAttr.match(/openTool\(['"]([^'"]+)['"]\)/);
                const comingSoonMatch = onclickAttr.match(/showComingSoon\(['"]([^'"]+)['"]\)/);
                
                if (toolIdMatch) {
                    const toolId = toolIdMatch[1];
                    console.log(`Setting up mobile handler for tool: ${toolId}`);
                    
                    // Add comprehensive touch handlers
                    this.addMobileCardHandler(newCard, toolId);
                } else if (comingSoonMatch) {
                    const toolName = comingSoonMatch[1];
                    this.addComingSoonHandler(newCard, toolName);
                }
            }
        });
    }
    
    addMobileCardHandler(card, toolId) {
        // Add mobile-friendly classes
        card.classList.add('mobile-ready');
        
        // Create comprehensive event handler
        const handleCardActivation = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            console.log(`Mobile card activation for: ${toolId}`);
            
            // Visual feedback
            card.style.transform = 'scale(0.96)';
            card.style.opacity = '0.8';
            
            // Haptic feedback if available
            if ('vibrate' in navigator) {
                navigator.vibrate(20);
            }
            
            // Reset visual feedback
            setTimeout(() => {
                card.style.transform = '';
                card.style.opacity = '';
            }, 150);
            
            // Open tool with delay for visual feedback
            setTimeout(() => {
                this.openToolMobileEnhanced(toolId);
            }, 150);
        };
        
        // Add multiple event listeners for maximum compatibility
        card.addEventListener('touchend', handleCardActivation, { passive: false });
        card.addEventListener('click', handleCardActivation, { passive: false });
        
        // Prevent default touch behaviors
        card.addEventListener('touchstart', (e) => {
            card.style.transform = 'scale(0.98)';
            card.style.opacity = '0.9';
        }, { passive: true });
        
        card.addEventListener('touchcancel', (e) => {
            card.style.transform = '';
            card.style.opacity = '';
        }, { passive: true });
        
        // Prevent context menu
        card.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Add touch-action CSS
        card.style.touchAction = 'manipulation';
        card.style.webkitTapHighlightColor = 'rgba(42, 82, 152, 0.3)';
        card.style.userSelect = 'none';
        card.style.webkitUserSelect = 'none';
    }
    
    addComingSoonHandler(card, toolName) {
        card.classList.add('mobile-ready', 'coming-soon');
        
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Visual feedback
            card.style.transform = 'scale(0.96)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
            
            // Show coming soon message
            this.showMobileComingSoon(toolName);
        };
        
        card.addEventListener('touchend', handler, { passive: false });
        card.addEventListener('click', handler, { passive: false });
        card.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    openToolMobileEnhanced(toolId) {
        console.log(`🚀 Opening tool on mobile (enhanced): ${toolId}`);
        
        try {
            // Show loading state
            this.showMobileLoading();
            
            // Hide main app
            const mainApp = document.getElementById('main-app');
            if (mainApp) {
                mainApp.style.display = 'none';
                console.log('Hidden main app');
            }
            
            // Show target tool
            const toolElement = document.getElementById(toolId);
            if (toolElement) {
                toolElement.style.display = 'block';
                console.log(`Showing tool element: ${toolId}`);
                
                // Load tool content with enhanced error handling
                setTimeout(() => {
                    this.loadToolContentEnhanced(toolId);
                    this.hideMobileLoading();
                    
                    // Scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    
                    console.log(`✅ Tool ${toolId} loaded successfully`);
                }, 300);
                
            } else {
                this.hideMobileLoading();
                console.error(`❌ Tool element not found: ${toolId}`);
                this.showMobileError(`Tool "${toolId}" not found. Please try refreshing the app.`);
            }
            
        } catch (error) {
            this.hideMobileLoading();
            console.error('❌ Mobile tool opening error:', error);
            this.showMobileError('Failed to open tool. Please try again.');
        }
    }
    
    loadToolContentEnhanced(toolId) {
        const contentDiv = document.getElementById(toolId + '-content');
        if (!contentDiv) {
            console.error(`Content div not found: ${toolId}`);
            this.showMobileError('Tool content area not found');
            return;
        }
        
        try {
            // Use the loadToolContent function if available
            if (typeof window.loadToolContent === 'function') {
                console.log(`Using window.loadToolContent for: ${toolId}`);
                window.loadToolContent(toolId);
            } else {
                console.log(`Fallback content loading for: ${toolId}`);
                contentDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px; margin: 20px;">
                        <h3 style="color: #2c3e50; margin-bottom: 15px;">🔧 ${this.formatToolName(toolId)}</h3>
                        <p style="color: #7f8c8d; margin-bottom: 20px;">This tool is loading...</p>
                        <div class="loading-spinner" style="margin: 20px auto; width: 40px; height: 40px; border: 4px solid #ecf0f1; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="font-size: 0.9em; color: #95a5a6;">If the tool doesn't load, please refresh the app</p>
                        <button onclick="location.reload()" style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 6px; margin-top: 15px; cursor: pointer; font-size: 16px;">
                            🔄 Refresh App
                        </button>
                    </div>
                `;
            }
            
            // Optimize loaded content for mobile
            this.optimizeContentForMobile(contentDiv);
            
        } catch (error) {
            console.error(`Error loading content for ${toolId}:`, error);
            this.showMobileError(`Failed to load ${this.formatToolName(toolId)} content`);
        }
    }
    
    formatToolName(toolId) {
        return toolId.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    optimizeContentForMobile(contentDiv) {
        // Make all inputs and buttons mobile-friendly
        const inputs = contentDiv.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.fontSize = '16px'; // Prevent iOS zoom
            input.style.minHeight = '44px';
            input.style.padding = '12px';
            input.style.touchAction = 'manipulation';
        });
        
        const buttons = contentDiv.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.touchAction = 'manipulation';
            btn.style.cursor = 'pointer';
        });
    }
    
    fixMobileButtons() {
        // Fix all buttons with onclick handlers for mobile
        const buttons = document.querySelectorAll('button[onclick]');
        
        buttons.forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr) {
                // Create mobile-optimized handler
                const mobileHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Visual feedback
                    btn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        btn.style.transform = '';
                    }, 100);
                    
                    // Execute original function
                    try {
                        eval(onclickAttr);
                    } catch (error) {
                        console.error('Button handler error:', error);
                    }
                };
                
                // Add touch and click handlers
                btn.addEventListener('touchend', mobileHandler, { passive: false });
                btn.addEventListener('click', mobileHandler, { passive: false });
            }
        });
    }
    
    setupMobileBackButtons() {
        // Ensure back buttons work on mobile
        const backButtons = document.querySelectorAll('.back-btn');
        
        backButtons.forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('showMainApp')) {
                // Remove onclick and add mobile handler
                btn.removeAttribute('onclick');
                
                const backHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Visual feedback
                    btn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        btn.style.transform = '';
                    }, 100);
                    
                    // Return to main app
                    this.showMainAppMobile();
                };
                
                btn.addEventListener('touchend', backHandler, { passive: false });
                btn.addEventListener('click', backHandler, { passive: false });
            }
        });
    }
    
    showMainAppMobile() {
        console.log('🏠 Returning to main app (mobile)');
        
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update navigation state
        this.updateNavState();
    }
    
    updateNavState() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        const homeBtn = document.querySelector('.nav-btn');
        if (homeBtn) {
            homeBtn.classList.add('active');
        }
    }
    
    addMobileTouchStyles() {
        const style = document.createElement('style');
        style.id = 'final-mobile-styles';
        style.textContent = `
            /* Final Mobile Touch Optimizations */
            @media (max-width: 768px) {
                .tool-card {
                    min-height: 140px !important;
                    padding: 20px !important;
                    cursor: pointer !important;
                    -webkit-tap-highlight-color: rgba(42, 82, 152, 0.3) !important;
                    touch-action: manipulation !important;
                    user-select: none !important;
                    -webkit-user-select: none !important;
                }
                
                .tool-card.mobile-ready {
                    border: 2px solid rgba(76, 175, 80, 0.3);
                    position: relative;
                }
                
                .tool-card.mobile-ready::before {
                    content: '📱';
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    font-size: 1.2em;
                    opacity: 0.7;
                }
                
                .tool-card:active,
                .tool-card.mobile-ready:active {
                    transform: scale(0.96) !important;
                    opacity: 0.8 !important;
                    transition: all 0.1s ease !important;
                }
                
                /* Enhanced button styling for mobile */
                button {
                    min-height: 44px !important;
                    min-width: 44px !important;
                    touch-action: manipulation !important;
                    font-size: 16px !important;
                    cursor: pointer !important;
                }
                
                .back-btn {
                    font-size: 18px !important;
                    padding: 15px 25px !important;
                    margin-bottom: 20px !important;
                }
                
                /* Fix input zoom issues on iOS */
                input, select, textarea {
                    font-size: 16px !important;
                    min-height: 44px !important;
                    -webkit-appearance: none;
                }
                
                /* Loading states */
                .mobile-loading {
                    pointer-events: none;
                    opacity: 0.6;
                }
                
                .mobile-loading::after {
                    content: '⏳ Loading...';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 20px;
                    font-size: 14px;
                    z-index: 1000;
                }
            }
            
            /* Touch feedback animations */
            @keyframes touchPulse {
                0% { transform: scale(1); }
                50% { transform: scale(0.98); }
                100% { transform: scale(1); }
            }
            
            .touch-feedback {
                animation: touchPulse 0.2s ease !important;
            }
        `;
        
        // Remove existing mobile styles to prevent conflicts
        const existingStyle = document.getElementById('final-mobile-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(style);
    }
    
    overrideCoreFunctions() {
        // Completely override the core functions with mobile-optimized versions
        console.log('🔄 Overriding core functions for mobile compatibility');
        
        // Store originals
        window._originalOpenTool = window.openTool;
        window._originalShowMainApp = window.showMainApp;
        window._originalLoadToolContent = window.loadToolContent;
        
        // Replace with mobile versions
        window.openTool = (toolId) => {
            console.log(`📱 Mobile openTool called: ${toolId}`);
            this.openToolMobileEnhanced(toolId);
        };
        
        window.showMainApp = () => {
            console.log('📱 Mobile showMainApp called');
            this.showMainAppMobile();
        };
        
        // Enhance loadToolContent to work better on mobile
        const originalLoadToolContent = window.loadToolContent || window._originalLoadToolContent;
        window.loadToolContent = (toolId) => {
            try {
                if (originalLoadToolContent) {
                    originalLoadToolContent(toolId);
                } else {
                    console.log(`No loadToolContent function available for: ${toolId}`);
                }
                
                // Always apply mobile optimizations after loading
                setTimeout(() => {
                    const contentDiv = document.getElementById(toolId + '-content');
                    if (contentDiv) {
                        this.optimizeContentForMobile(contentDiv);
                    }
                }, 100);
                
            } catch (error) {
                console.error(`Error in enhanced loadToolContent for ${toolId}:`, error);
                this.showMobileError(`Failed to load ${this.formatToolName(toolId)}`);
            }
        };
        
        console.log('✅ Core functions overridden for mobile');
    }
    
    showMobileLoading() {
        // Remove existing loader
        this.hideMobileLoading();
        
        const loader = document.createElement('div');
        loader.id = 'mobile-final-loader';
        loader.innerHTML = `
            <div class="mobile-loader-content">
                <div class="mobile-spinner"></div>
                <p>Loading tool...</p>
            </div>
        `;
        
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(30, 60, 114, 0.95);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        // Add spinner styles
        const spinnerStyle = document.createElement('style');
        spinnerStyle.id = 'mobile-spinner-style';
        spinnerStyle.textContent = `
            .mobile-loader-content {
                text-align: center;
            }
            
            .mobile-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid #4ecdc4;
                border-radius: 50%;
                animation: mobileSpinAnimation 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes mobileSpinAnimation {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .mobile-loader-content p {
                font-size: 18px;
                font-weight: 500;
            }
        `;
        
        document.head.appendChild(spinnerStyle);
        document.body.appendChild(loader);
    }
    
    hideMobileLoading() {
        const loader = document.getElementById('mobile-final-loader');
        if (loader) {
            loader.remove();
        }
        
        const spinnerStyle = document.getElementById('mobile-spinner-style');
        if (spinnerStyle) {
            spinnerStyle.remove();
        }
    }
    
    showMobileError(message) {
        const error = document.createElement('div');
        error.className = 'mobile-final-error';
        error.innerHTML = `
            <div class="mobile-error-content">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <div class="error-buttons">
                    <button onclick="location.reload()" class="error-btn primary">🔄 Refresh App</button>
                    <button onclick="this.closest('.mobile-final-error').remove()" class="error-btn">Close</button>
                </div>
            </div>
        `;
        
        error.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            padding: 20px;
        `;
        
        const errorContentStyle = `
            background: #e74c3c;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            max-width: 300px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        `;
        error.querySelector('.mobile-error-content').style.cssText = errorContentStyle;
        
        const errorButtonsStyle = `
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
        `;
        error.querySelector('.error-buttons').style.cssText = errorButtonsStyle;
        
        const buttons = error.querySelectorAll('.error-btn');
        buttons.forEach(btn => {
            btn.style.cssText = `
                padding: 12px 20px;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                font-weight: 600;
                min-width: 80px;
                font-size: 16px;
                touch-action: manipulation;
            `;
        });
        
        const primaryBtn = error.querySelector('.error-btn.primary');
        if (primaryBtn) {
            primaryBtn.style.background = 'white';
            primaryBtn.style.color = '#e74c3c';
        }
        
        const secondaryBtns = error.querySelectorAll('.error-btn:not(.primary)');
        secondaryBtns.forEach(btn => {
            btn.style.background = 'transparent';
            btn.style.color = 'white';
            btn.style.border = '2px solid white';
        });
        
        document.body.appendChild(error);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (error.parentElement) {
                error.remove();
            }
        }, 10000);
    }
    
    showMobileComingSoon(toolName) {
        const modal = document.createElement('div');
        modal.className = 'mobile-coming-soon';
        modal.innerHTML = `
            <div class="coming-soon-content">
                <h3>🚧 Coming Soon</h3>
                <h4>${toolName}</h4>
                <p>This feature is currently under development and will be available in a future update.</p>
                <button onclick="this.closest('.mobile-coming-soon').remove()" class="coming-soon-btn">OK</button>
            </div>
        `;
        
        modal.style.cssText = `
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
        `;
        
        const contentStyle = `
            background: white;
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            max-width: 300px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        `;
        modal.querySelector('.coming-soon-content').style.cssText = contentStyle;
        
        const btnStyle = `
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 20px;
            cursor: pointer;
            margin-top: 15px;
            font-weight: 600;
            min-width: 80px;
            font-size: 16px;
            touch-action: manipulation;
        `;
        modal.querySelector('.coming-soon-btn').style.cssText = btnStyle;
        
        document.body.appendChild(modal);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 5000);
    }
    
    addMobileDebugIndicator() {
        // Add small indicator to show mobile fix is active
        const indicator = document.createElement('div');
        indicator.id = 'mobile-debug-indicator';
        indicator.textContent = '📱 Mobile Fix Active';
        
        indicator.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 9999;
            pointer-events: none;
            animation: fadeInOut 4s ease forwards;
        `;
        
        // Add fade animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(20px); }
                20% { opacity: 1; transform: translateY(0); }
                80% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(20px); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(indicator);
        
        // Remove after animation
        setTimeout(() => {
            if (indicator.parentElement) {
                indicator.remove();
            }
        }, 4000);
    }
}

// Initialize the final mobile fix
console.log('🚀 Loading final mobile fix...');
const finalMobileFix = new FinalMobileFix();

// Add global error handler for mobile debugging
window.addEventListener('error', (e) => {
    if (finalMobileFix && finalMobileFix.isMobile) {
        console.error('🚨 Mobile app error:', e.error);
    }
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
        console.log('📱 Orientation change handled');
    }, 100);
});

console.log('✅ Final mobile fix script loaded');