// Link Checker Script for LARK Labs
// Verifies all internal and external links are working

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const SITE_ROOT = __dirname;
const RESULTS_FILE = 'link-check-results.json';
const TIMEOUT = 10000; // 10 seconds

// Results storage
let results = {
    timestamp: new Date().toISOString(),
    totalLinks: 0,
    workingLinks: 0,
    brokenLinks: 0,
    links: []
};

// Extract links from HTML files
function extractLinks(htmlContent, filePath) {
    const linkRegex = /(href|src)="([^"]+)"/g;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(htmlContent)) !== null) {
        const url = match[2];
        
        // Skip email, tel, and javascript links
        if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) {
            continue;
        }
        
        links.push({
            url: url,
            type: match[1], // href or src
            file: filePath,
            status: 'unchecked'
        });
    }
    
    return links;
}

// Check if URL is accessible
function checkURL(url) {
    return new Promise((resolve) => {
        // Handle relative URLs
        if (url.startsWith('/') || url.startsWith('./') || !url.includes('://')) {
            let filePath = url.startsWith('./') ? url.substring(2) : url.substring(1);
            filePath = path.join(SITE_ROOT, filePath);
            
            // Check if file exists
            if (fs.existsSync(filePath)) {
                resolve({ status: 'working', statusCode: 200 });
            } else {
                resolve({ status: 'broken', statusCode: 404, error: 'File not found' });
            }
            return;
        }
        
        // Handle external URLs
        const protocol = url.startsWith('https://') ? https : http;
        
        const req = protocol.get(url, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve({ status: 'working', statusCode: res.statusCode });
            } else {
                resolve({ status: 'broken', statusCode: res.statusCode });
            }
        });
        
        req.on('error', (error) => {
            resolve({ status: 'broken', statusCode: 0, error: error.message });
        });
        
        req.setTimeout(TIMEOUT, () => {
            req.abort();
            resolve({ status: 'broken', statusCode: 0, error: 'Timeout' });
        });
    });
}

// Scan directory for HTML files
function scanDirectory(dir) {
    const files = [];
    
    function scan(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Skip node_modules, .git, etc.
                if (!['node_modules', '.git', '.netlify', 'archive'].includes(item)) {
                    scan(fullPath);
                }
            } else if (item.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }
    
    scan(dir);
    return files;
}

// Main function
async function checkAllLinks() {
    console.log('🔍 Starting LARK Labs Link Check...\n');
    
    // Get all HTML files
    const htmlFiles = scanDirectory(SITE_ROOT);
    console.log(`Found ${htmlFiles.length} HTML files`);
    
    // Extract all links
    for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(SITE_ROOT, file);
        const links = extractLinks(content, relativePath);
        
        for (const link of links) {
            results.links.push(link);
        }
    }
    
    results.totalLinks = results.links.length;
    console.log(`\nFound ${results.totalLinks} total links`);
    
    // Check each link
    console.log('\nChecking links...');
    let checked = 0;
    
    for (const link of results.links) {
        checked++;
        process.stdout.write(`\r[${checked}/${results.totalLinks}] Checking: ${link.url.substring(0, 50)}...`);
        
        const result = await checkURL(link.url);
        link.status = result.status;
        link.statusCode = result.statusCode;
        link.error = result.error;
        
        if (result.status === 'working') {
            results.workingLinks++;
        } else {
            results.brokenLinks++;
        }
    }
    
    console.log('\n\n✅ Link check complete!');
    console.log(`📊 Results: ${results.workingLinks} working, ${results.brokenLinks} broken`);
    
    // Save results
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    console.log(`📄 Detailed results saved to: ${RESULTS_FILE}`);
    
    // Show broken links
    if (results.brokenLinks > 0) {
        console.log('\n❌ Broken Links:');
        results.links
            .filter(link => link.status === 'broken')
            .forEach(link => {
                console.log(`  ${link.url} (in ${link.file}) - ${link.error || link.statusCode}`);
            });
    }
    
    return results;
}

// Run if called directly
if (require.main === module) {
    checkAllLinks()
        .then(results => {
            process.exit(results.brokenLinks > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

module.exports = { checkAllLinks };