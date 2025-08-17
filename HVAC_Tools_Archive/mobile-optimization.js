// Comprehensive Mobile Optimization for HVAC Pro Tools PWA
// Ensures optimal mobile experience across all devices

class MobileOptimization {
    constructor() {
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isAndroid = /Android/.test(navigator.userAgent);
        this.isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    window.navigator.standalone || 
                    document.referrer.includes('android-app://');
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupMobileOptimizations());
        } else {
            this.setupMobileOptimizations();
        }
    }
    
    setupMobileOptimizations() {
        console.log('Setting up comprehensive mobile optimizations');
        
        // Core mobile fixes
        this.fixViewportIssues();
        this.optimizeScrolling();
        this.enhanceTouchTargets();
        this.addPWAOptimizations();
        this.setupMobileNavigation();
        this.fixIOSSpecificIssues();
        this.addMobileGestures();
        
        // Performance optimizations
        this.optimizeForMobile();
        
        console.log('Mobile optimizations complete');
    }
    
    fixViewportIssues() {
        // Fix viewport scaling issues on mobile
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no'
            );
        }
        
        // Add CSS to prevent zoom on input focus (iOS)
        const style = document.createElement('style');
        style.textContent = `
            @media screen and (max-width: 768px) {
                input, select, textarea {
                    font-size: 16px !important; /* Prevents iOS zoom */
                    -webkit-appearance: none;
                    border-radius: 0;
                }
                
                /* Fix iOS Safari bottom bar issues */
                body {
                    padding-bottom: env(safe-area-inset-bottom);
                    padding-top: env(safe-area-inset-top);
                }
                
                .app-header {
                    padding-top: calc(20px + env(safe-area-inset-top));
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    optimizeScrolling() {
        // Enable smooth scrolling and prevent scroll bouncing
        document.documentElement.style.scrollBehavior = 'smooth';
        document.body.style.overscrollBehavior = 'none';
        
        // Fix scroll issues in tool content areas
        const appContents = document.querySelectorAll('.app-content');
        appContents.forEach(content => {
            content.style.overflowY = 'auto';
            content.style.webkitOverflowScrolling = 'touch';
        });
    }
    
    enhanceTouchTargets() {
        // Ensure all interactive elements meet minimum touch target size (44px)
        const interactiveElements = document.querySelectorAll(
            'button, .tool-card, .nav-btn, input, select, .close-btn, a'
        );
        
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.height < 44 || rect.width < 44) {
                element.style.minHeight = '44px';
                element.style.minWidth = '44px';
                element.style.display = 'flex';
                element.style.alignItems = 'center';
                element.style.justifyContent = 'center';
            }
            
            // Add touch-friendly styling
            element.style.touchAction = 'manipulation';
            element.style.webkitTapHighlightColor = 'rgba(42, 82, 152, 0.3)';
        });
    }
    
    addPWAOptimizations() {
        if (this.isPWA) {
            console.log('PWA mode detected - applying PWA-specific optimizations');
            
            // Hide install button in PWA mode
            const installBtn = document.getElementById('installAppBtn');
            if (installBtn) {
                installBtn.style.display = 'none';
            }
            
            // Add PWA-specific styling
            document.body.classList.add('pwa-mode');
            
            // Add status bar styling for PWA
            const pwaStyle = document.createElement('style');
            pwaStyle.textContent = `
                .pwa-mode {
                    padding-top: env(safe-area-inset-top);
                    padding-bottom: env(safe-area-inset-bottom);
                }
                
                .pwa-mode .app-header {
                    background: rgba(30, 60, 114, 0.95);
                    backdrop-filter: blur(20px);
                }
            `;
            document.head.appendChild(pwaStyle);
        }
    }
    
    setupMobileNavigation() {
        // Add swipe navigation for mobile
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Horizontal swipe detection
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0 && Math.abs(deltaX) > 100) {
                    // Swipe right - go back if in tool view
                    const toolContents = document.querySelectorAll('.app-content');
                    const isInTool = Array.from(toolContents).some(content => 
                        content.style.display !== 'none' && content.style.display !== ''
                    );
                    
                    if (isInTool) {
                        this.showMainAppMobile();
                    }
                }
            }
            
            startX = 0;
            startY = 0;
        }, { passive: true });
    }
    
    fixIOSSpecificIssues() {
        if (this.isIOS) {
            console.log('iOS device detected - applying iOS-specific fixes');
            
            // Fix iOS Safari viewport issues
            const fixIOSViewport = () => {
                document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
            };
            
            fixIOSViewport();
            window.addEventListener('resize', fixIOSViewport);
            window.addEventListener('orientationchange', () => {
                setTimeout(fixIOSViewport, 100);
            });
            
            // Fix iOS click delay
            document.addEventListener('touchstart', () => {}, { passive: true });
            
            // Prevent iOS pull-to-refresh
            document.body.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1 && window.scrollY === 0) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            // Fix iOS form zoom issues
            const iosStyle = document.createElement('style');
            iosStyle.textContent = `
                @supports (-webkit-touch-callout: none) {
                    input, select, textarea {
                        font-size: 16px !important;
                        transform: scale(1);
                    }
                }
            `;
            document.head.appendChild(iosStyle);
        }
    }
    
    addMobileGestures() {
        // Add mobile gesture support for better UX
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach(card => {
            let pressTimer;
            
            card.addEventListener('touchstart', (e) => {
                // Visual feedback for touch
                card.style.transform = 'scale(0.98)';
                card.style.opacity = '0.9';
                
                // Long press detection
                pressTimer = setTimeout(() => {
                    if (card.classList.contains('coming-soon')) {
                        this.showToolPreview(card);
                    } else {
                        this.showToolQuickInfo(card);
                    }
                }, 800);
            }, { passive: true });
            
            card.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
                // Reset visual feedback
                card.style.transform = '';
                card.style.opacity = '';
            }, { passive: true });
            
            card.addEventListener('touchcancel', () => {
                clearTimeout(pressTimer);
                card.style.transform = '';
                card.style.opacity = '';
            }, { passive: true });
        });
    }
    
    showToolQuickInfo(card) {
        const title = card.querySelector('.tool-title').textContent;
        const description = card.querySelector('.tool-description').textContent;
        
        const info = document.createElement('div');
        info.className = 'tool-quick-info';
        info.innerHTML = `
            <div class="quick-info-content">
                <h4>${title}</h4>
                <p>${description}</p>
                <small>Tap to open, swipe right to go back</small>
            </div>
        `;
        
        document.body.appendChild(info);
        
        setTimeout(() => {
            if (info.parentElement) {
                info.remove();
            }
        }, 3000);
    }
    
    showToolPreview(card) {
        const title = card.querySelector('.tool-title').textContent;
        
        const preview = document.createElement('div');
        preview.className = 'tool-preview';
        preview.innerHTML = `
            <div class="preview-content">
                <h4>🚧 ${title}</h4>
                <p>This tool is coming soon! We're working hard to bring you the best HVAC calculation tools.</p>
                <small>Follow our updates for release notifications</small>
            </div>
        `;
        
        document.body.appendChild(preview);
        
        setTimeout(() => {
            if (preview.parentElement) {
                preview.remove();
            }
        }, 4000);
    }
    
    optimizeForMobile() {
        // Add mobile-specific performance optimizations
        
        // Lazy load images and heavy content
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.loading = 'lazy';
        });
        
        // Optimize animations for mobile
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                *, *::before, *::after {
                    animation-duration: 0.3s !important;
                    transition-duration: 0.3s !important;
                }
                
                /* Reduce motion for better performance */
                .tool-card:hover {
                    transform: translateY(-2px) !important;
                }
                
                /* Optimize backdrop filters for mobile */
                .app-header, .tool-card {
                    backdrop-filter: blur(5px) !important;
                }
            }
            
            /* Mobile-specific info overlays */
            .tool-quick-info, .tool-preview {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                border-radius: 15px;
                padding: 20px;
                z-index: 10000;
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .quick-info-content h4,
            .preview-content h4 {
                margin-bottom: 10px;
                color: #4ecdc4;
            }
            
            .quick-info-content p,
            .preview-content p {
                margin-bottom: 10px;
                line-height: 1.4;
            }
            
            .quick-info-content small,
            .preview-content small {
                opacity: 0.8;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }
    
    showMainAppMobile() {
        console.log('Returning to main app (mobile optimized)');
        
        // Hide all tool content with mobile animation
        const toolContents = document.querySelectorAll('.app-content');
        toolContents.forEach(content => {
            content.style.display = 'none';
        });
        
        // Show main app with fade-in
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            mainApp.style.display = 'block';
            mainApp.style.opacity = '0';
            mainApp.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                mainApp.style.opacity = '1';
            }, 10);
        }
        
        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Update navigation state
        this.updateNavState();
    }
    
    updateNavState() {
        // Update navigation button states
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const homeBtn = document.querySelector('.nav-btn[onclick*="showMainTools"]');
        if (homeBtn) {
            homeBtn.classList.add('active');
        }
    }
    
    // Add haptic feedback for supported devices
    addHapticFeedback(intensity = 'medium') {
        if ('vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30]
            };
            navigator.vibrate(patterns[intensity] || patterns.medium);
        }
    }
    
    // Mobile-specific error handling
    handleMobileError(error, context = 'Unknown') {
        console.error(`Mobile error in ${context}:`, error);
        
        // Show user-friendly error message
        const errorToast = document.createElement('div');
        errorToast.className = 'mobile-error-toast';
        errorToast.innerHTML = `
            <div class="error-toast-content">
                <span>⚠️ ${context} Error</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.2em; cursor: pointer;">×</button>
            </div>
        `;
        
        const toastStyle = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            background: rgba(231, 76, 60, 0.95);
            color: white;
            border-radius: 10px;
            padding: 15px;
            z-index: 10001;
            animation: slideDown 0.3s ease;
        `;
        errorToast.style.cssText = toastStyle;
        
        const toastContentStyle = `
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        errorToast.querySelector('.error-toast-content').style.cssText = toastContentStyle;
        
        document.body.appendChild(errorToast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorToast.parentElement) {
                errorToast.remove();
            }
        }, 5000);
        
        // Add haptic feedback
        this.addHapticFeedback('heavy');
    }
    
    // Enhanced PWA install prompt for mobile
    showMobileInstallPrompt() {
        if (this.isPWA) return; // Already installed
        
        const prompt = document.createElement('div');
        prompt.className = 'mobile-install-prompt';
        prompt.innerHTML = `
            <div class="install-prompt-content">
                <div class="prompt-header">
                    <span class="prompt-icon">📱</span>
                    <h3>Install HVAC Pro Tools</h3>
                </div>
                <p>Add to your home screen for quick access and offline functionality!</p>
                <div class="prompt-buttons">
                    <button class="install-btn-mobile" onclick="this.parentElement.parentElement.parentElement.remove()">Not Now</button>
                    <button class="install-btn-mobile primary" onclick="installPWAMobile()">Install</button>
                </div>
                <div class="install-steps">
                    <small>
                        ${this.isIOS ? 
                            'Tap Share → Add to Home Screen' : 
                            'Tap the menu and select "Add to Home Screen"'
                        }
                    </small>
                </div>
            </div>
        `;
        
        const promptStyle = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            z-index: 10002;
            animation: slideUpFromBottom 0.4s ease;
        `;
        prompt.style.cssText = promptStyle;
        
        document.body.appendChild(prompt);
    }
    
    // Mobile-specific tool opening with better error handling
    openToolMobile(toolId) {
        console.log(`Opening tool on mobile: ${toolId}`);
        
        try {
            // Add loading indicator
            this.showMobileLoader();
            
            // Hide main app
            const mainApp = document.getElementById('main-app');
            if (mainApp) {
                mainApp.style.display = 'none';
            }
            
            // Show tool content
            const toolElement = document.getElementById(toolId);
            if (toolElement) {
                toolElement.style.display = 'block';
                
                // Load content with mobile optimization
                setTimeout(() => {
                    this.loadToolContentMobile(toolId);
                    this.hideMobileLoader();
                    
                    // Scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    
                    // Add haptic feedback
                    this.addHapticFeedback('light');
                    
                }, 100);
                
            } else {
                this.hideMobileLoader();
                this.handleMobileError(new Error(`Tool element not found: ${toolId}`), 'Tool Opening');
            }
        } catch (error) {
            this.hideMobileLoader();
            this.handleMobileError(error, 'Tool Opening');
        }
    }
    
    loadToolContentMobile(toolId) {
        const contentDiv = document.getElementById(toolId + '-content');
        if (!contentDiv) {
            this.handleMobileError(new Error(`Content div not found: ${toolId}`), 'Content Loading');
            return;
        }
        
        try {
            // Call the original loadToolContent function if it exists
            if (typeof window.loadToolContent === 'function') {
                window.loadToolContent(toolId);
            } else if (typeof window.originalLoadToolContent === 'function') {
                window.originalLoadToolContent(toolId);
            } else {
                // Fallback content loading
                contentDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <h3>🔧 ${toolId.replace('-', ' ').toUpperCase()}</h3>
                        <p>Tool content is loading...</p>
                        <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
                            If this tool doesn't load properly, please try refreshing the app.
                        </p>
                        <button onclick="location.reload()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 15px; cursor: pointer;">
                            🔄 Refresh App
                        </button>
                    </div>
                `;
            }
            
            // Add mobile-specific optimizations to the loaded content
            this.optimizeToolContentForMobile(contentDiv);
            
        } catch (error) {
            this.handleMobileError(error, `${toolId} Content Loading`);
        }
    }
    
    optimizeToolContentForMobile(contentDiv) {
        // Optimize form elements in the tool content for mobile
        const inputs = contentDiv.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.style.fontSize = '16px'; // Prevent iOS zoom
            input.style.minHeight = '44px';
            input.style.padding = '12px';
        });
        
        // Optimize buttons for mobile
        const buttons = contentDiv.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.touchAction = 'manipulation';
        });
    }
    
    showMobileLoader() {
        const loader = document.createElement('div');
        loader.id = 'mobile-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>Loading tool...</p>
            </div>
        `;
        
        const loaderStyle = `
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
            z-index: 10003;
        `;
        loader.style.cssText = loaderStyle;
        
        const spinnerStyle = document.createElement('style');
        spinnerStyle.textContent = `
            .loader-content {
                text-align: center;
            }
            
            .loader-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(spinnerStyle);
        
        document.body.appendChild(loader);
    }
    
    hideMobileLoader() {
        const loader = document.getElementById('mobile-loader');
        if (loader) {
            loader.remove();
        }
    }
}

// Initialize mobile optimization
const mobileOptimization = new MobileOptimization();

// Add CSS animations
const mobileAnimations = document.createElement('style');
mobileAnimations.textContent = `
    @keyframes slideDown {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideUpFromBottom {
        from {
            transform: translateY(100%);
        }
        to {
            transform: translateY(0);
        }
    }
    
    .mobile-install-prompt .install-prompt-content {
        padding: 25px;
        text-align: center;
    }
    
    .mobile-install-prompt .prompt-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .mobile-install-prompt .prompt-icon {
        font-size: 2em;
    }
    
    .mobile-install-prompt .prompt-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 20px;
    }
    
    .mobile-install-prompt .install-btn-mobile {
        padding: 12px 20px;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 600;
        min-width: 100px;
    }
    
    .mobile-install-prompt .install-btn-mobile.primary {
        background: #4ecdc4;
        color: white;
    }
    
    .mobile-install-prompt .install-btn-mobile:not(.primary) {
        background: transparent;
        color: #ccc;
        border: 1px solid #666;
    }
    
    .mobile-install-prompt .install-steps {
        margin-top: 15px;
        opacity: 0.8;
    }
`;
document.head.appendChild(mobileAnimations);

// Global mobile functions
window.installPWAMobile = function() {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('PWA installation accepted');
                mobileOptimization.addHapticFeedback('medium');
            }
            window.deferredPrompt = null;
        });
    } else {
        // Fallback instructions
        mobileOptimization.showMobileInstallPrompt();
    }
    
    // Hide prompt
    const prompt = document.querySelector('.mobile-install-prompt');
    if (prompt) {
        prompt.remove();
    }
};

// Override global functions for mobile compatibility
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Store original functions
        if (typeof window.openTool === 'function') {
            window.originalOpenTool = window.openTool;
        }
        if (typeof window.showMainApp === 'function') {
            window.originalShowMainApp = window.showMainApp;
        }
        
        // Replace with mobile-optimized versions
        window.openTool = (toolId) => {
            mobileOptimization.openToolMobile(toolId);
        };
        
        window.showMainApp = () => {
            mobileOptimization.showMainAppMobile();
        };
        
        console.log('Mobile function overrides applied');
    }, 1000);
});

console.log('Mobile optimization script loaded');