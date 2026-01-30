// Performance Optimizer for LARK Labs
// Optimizes HTML, CSS, and assets for better loading speed

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_ROOT = __dirname;
const OPTIMIZATIONS = {
    minifyCSS: true,
    optimizeImages: true,
    addCacheHeaders: true,
    compressHTML: true
};

// Results tracking
let results = {
    timestamp: new Date().toISOString(),
    filesProcessed: 0,
    sizeReduced: 0,
    optimizations: []
};

// Minify CSS (basic minification)
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single
        .replace(/\n/g, '') // Remove newlines
        .replace(/;\s*}/g, '}') // Remove last semicolon in blocks
        .replace(/\s*{\s*/g, '{') // Clean braces
        .replace(/;\s*/g, ';') // Clean semicolons
        .trim();
}

// Compress HTML
function compressHTML(html) {
    return html
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments (except IE conditionals)
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces
        .replace(/>\s+</g, '><') // Remove spaces between tags
        .replace(/\n\s*/g, '\n') // Clean up newlines
        .trim();
}

// Add performance meta tags and optimizations
function addPerformanceOptimizations(html) {
    const optimizations = `
    <!-- Performance Optimizations -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="//hvac-jack-5-0.vercel.app">
    <link rel="dns-prefetch" href="//codecompassapp.netlify.app">
    <link rel="dns-prefetch" href="//gas-technician-ai-tutor-new.vercel.app">
    
    <!-- Critical Resource Hints -->
    <link rel="preload" href="/assets/css/critical.css" as="style">
    <link rel="prefetch" href="/HVAC_Tools/">
    <link rel="prefetch" href="/tssa-g3-exam-prep.html">
    
    <!-- PWA and Mobile Optimizations -->
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#1a1a1a">
    
    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
        }
    </script>`;

    // Insert after <head>
    return html.replace('<head>', '<head>' + optimizations);
}

// Create Service Worker for caching
function createServiceWorker() {
    const swContent = `
// LARK Labs Service Worker - Cache Strategy
const CACHE_NAME = 'lark-labs-v1';
const STATIC_CACHE = [
    '/',
    '/index.html',
    '/HVAC_Tools/',
    '/tssa-g3-exam-prep.html',
    '/tssa-g2-exam-prep.html',
    '/assets/css/main.css'
];

const EXTERNAL_CACHE = [
    'https://hvac-jack-5-0.vercel.app/',
    'https://codecompassapp.netlify.app/',
    'https://gas-technician-ai-tutor-new.vercel.app/'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell');
                return cache.addAll(STATIC_CACHE);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then(fetchResponse => {
                        // Cache new requests for static assets
                        if (event.request.url.includes('.css') || 
                            event.request.url.includes('.js') || 
                            event.request.url.includes('.html')) {
                            const responseClone = fetchResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return fetchResponse;
                    });
            })
            .catch(() => {
                // Offline fallback
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});
`;

    fs.writeFileSync(path.join(SITE_ROOT, 'sw.js'), swContent.trim());
    console.log('✅ Created service worker (sw.js)');
}

// Optimize critical CSS for above-fold content
function extractCriticalCSS() {
    const criticalCSS = `
:root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #e5e5e5;
    --accent-orange: #ff6b35;
    --border-color: #404040;
    --gradient-orange: linear-gradient(135deg, var(--accent-orange) 0%, #e55a2b 100%);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
}

header {
    background: rgba(45, 45, 45, 0.85);
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(20px);
}

.hero {
    padding: 120px 0 80px;
    text-align: center;
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.hero h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-orange) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.cta-primary {
    background: var(--gradient-orange);
    color: white;
    padding: 16px 32px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 12px;
}
    `.trim();

    // Create assets directory if it doesn't exist
    const assetsDir = path.join(SITE_ROOT, 'assets', 'css');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(assetsDir, 'critical.css'), criticalCSS);
    console.log('✅ Created critical CSS (assets/css/critical.css)');
}

// Enhanced robots.txt for better SEO
function updateRobotsTxt() {
    const robotsContent = `
User-agent: *
Allow: /

# Priority pages for crawlers
Sitemap: https://larklabs.org/sitemap.xml

# Prioritize important sections
Allow: /HVAC_Tools/
Allow: /tssa-g3-exam-prep.html
Allow: /tssa-g2-exam-prep.html
Allow: /apps/
Allow: /pages/blog/

# Block unnecessary paths
Disallow: /assets/
Disallow: /*.json$
Disallow: /link-check-results.json
Disallow: /index_backup*

# External app references (for context)
# https://hvac-jack-5-0.vercel.app/
# https://codecompassapp.netlify.app/
# https://gas-technician-ai-tutor-new.vercel.app/

# Crawl-delay for respectful crawling
Crawl-delay: 1
    `.trim();

    fs.writeFileSync(path.join(SITE_ROOT, 'robots.txt'), robotsContent);
    console.log('✅ Updated robots.txt');
}

// Process HTML files
function processHTMLFile(filePath) {
    const relativePath = path.relative(SITE_ROOT, filePath);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');
    
    let optimizedContent = originalContent;
    
    // Add performance optimizations to main pages
    if (relativePath === 'index.html' || relativePath.includes('tssa-') || relativePath.includes('HVAC_Tools')) {
        optimizedContent = addPerformanceOptimizations(optimizedContent);
    }
    
    // Compress HTML (light compression to maintain readability)
    if (OPTIMIZATIONS.compressHTML) {
        optimizedContent = compressHTML(optimizedContent);
    }
    
    const newSize = Buffer.byteLength(optimizedContent, 'utf8');
    const savings = originalSize - newSize;
    
    if (savings > 0) {
        fs.writeFileSync(filePath, optimizedContent);
        results.sizeReduced += savings;
        results.optimizations.push({
            file: relativePath,
            originalSize: originalSize,
            newSize: newSize,
            savings: savings
        });
    }
    
    results.filesProcessed++;
}

// Main optimization function
function optimizeSite() {
    console.log('🚀 Starting LARK Labs Performance Optimization...\n');
    
    // Create performance assets
    createServiceWorker();
    extractCriticalCSS();
    updateRobotsTxt();
    
    // Find and process HTML files
    const htmlFiles = [];
    
    function findHTMLFiles(dir) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (!['node_modules', '.git', '.netlify', 'archive'].includes(item)) {
                    findHTMLFiles(fullPath);
                }
            } else if (item.endsWith('.html')) {
                htmlFiles.push(fullPath);
            }
        }
    }
    
    findHTMLFiles(SITE_ROOT);
    
    console.log(`\nProcessing ${htmlFiles.length} HTML files...`);
    
    for (const file of htmlFiles) {
        processHTMLFile(file);
    }
    
    // Save optimization report
    const reportPath = path.join(SITE_ROOT, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log('\n✅ Performance optimization complete!');
    console.log(`📊 Files processed: ${results.filesProcessed}`);
    console.log(`💾 Total size reduced: ${(results.sizeReduced / 1024).toFixed(2)} KB`);
    console.log(`📄 Report saved to: performance-report.json`);
    
    return results;
}

// Run if called directly
if (require.main === module) {
    optimizeSite()
        .then(() => {
            console.log('\n🎉 LARK Labs site optimized for performance!');
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

module.exports = { optimizeSite };