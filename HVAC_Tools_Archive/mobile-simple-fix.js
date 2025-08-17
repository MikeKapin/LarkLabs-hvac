// Simple Mobile Fix for HVAC Pro Tools
// Ensures mobile tool links work without breaking desktop functionality

(function() {
    'use strict';
    
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
                    window.innerWidth <= 768;
    
    console.log('📱 Simple mobile fix loading...', { isMobile });
    
    // Only apply mobile fixes if actually on mobile
    if (!isMobile) {
        console.log('⏩ Desktop detected - no mobile fixes needed');
        return;
    }
    
    function waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    function waitForScripts() {
        return new Promise((resolve) => {
            window.addEventListener('load', () => {
                // Wait a bit more for all scripts to initialize
                setTimeout(resolve, 1000);
            });
        });
    }
    
    async function initMobileFix() {
        await waitForDOM();
        await waitForScripts();
        
        console.log('🔧 Applying simple mobile fix for tool cards...');
        
        // Add mobile touch handlers to tool cards
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach((card) => {
            const onclickAttr = card.getAttribute('onclick');
            
            if (onclickAttr && onclickAttr.includes('openTool')) {
                // Extract tool ID
                const match = onclickAttr.match(/openTool\(['"]([^'"]+)['"]\)/);
                if (match) {
                    const toolId = match[1];
                    
                    // Add mobile touch handler
                    card.addEventListener('touchstart', function(e) {
                        // Add visual feedback
                        this.style.transform = 'scale(0.98)';
                        this.style.opacity = '0.9';
                    }, { passive: true });
                    
                    card.addEventListener('touchend', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Reset visual feedback
                        this.style.transform = '';
                        this.style.opacity = '';
                        
                        // Open tool
                        console.log(`📱 Mobile touch opening tool: ${toolId}`);
                        
                        // Use the original openTool function
                        if (typeof window.openTool === 'function') {
                            window.openTool(toolId);
                        } else {
                            // Fallback
                            document.getElementById('main-app').style.display = 'none';
                            document.getElementById(toolId).style.display = 'block';
                            if (typeof window.loadToolContent === 'function') {
                                window.loadToolContent(toolId);
                            }
                        }
                    }, { passive: false });
                    
                    card.addEventListener('touchcancel', function(e) {
                        // Reset visual feedback
                        this.style.transform = '';
                        this.style.opacity = '';
                    }, { passive: true });
                    
                    // Optimize for mobile
                    card.style.touchAction = 'manipulation';
                    card.style.webkitTapHighlightColor = 'transparent';
                    
                    console.log(`✅ Mobile handler added for: ${toolId}`);
                }
            }
        });
        
        // Fix back buttons for mobile
        const backButtons = document.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            btn.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
                
                // Execute back function
                if (typeof window.showMainApp === 'function') {
                    window.showMainApp();
                } else {
                    // Fallback
                    document.querySelectorAll('.app-content').forEach(content => {
                        content.style.display = 'none';
                    });
                    document.getElementById('main-app').style.display = 'block';
                }
            }, { passive: false });
        });
        
        // Add mobile CSS optimizations
        const mobileStyle = document.createElement('style');
        mobileStyle.textContent = `
            @media (max-width: 768px) {
                .tool-card {
                    min-height: 120px !important;
                    cursor: pointer !important;
                    -webkit-tap-highlight-color: rgba(42, 82, 152, 0.2) !important;
                    touch-action: manipulation !important;
                }
                
                button, .back-btn {
                    min-height: 44px !important;
                    touch-action: manipulation !important;
                    font-size: 16px !important;
                }
                
                input, select {
                    font-size: 16px !important; /* Prevent iOS zoom */
                    min-height: 44px !important;
                }
            }
        `;
        document.head.appendChild(mobileStyle);
        
        // Add success indicator
        const indicator = document.createElement('div');
        indicator.textContent = '📱 Mobile optimized';
        indicator.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 11px;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentElement) {
                indicator.remove();
            }
        }, 3000);
        
        console.log('✅ Simple mobile fix applied successfully');
    }
    
    // Initialize
    initMobileFix().catch(console.error);
    
})();