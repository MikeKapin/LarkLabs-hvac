// LarkLabs Blog Scheduler - Updated Version
// Automatically publishes scheduled blogs and updates the blog index page

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BLOG_DIR = path.join(__dirname, 'pages', 'blog');
const INDEX_FILE = path.join(BLOG_DIR, 'index.html');
const SCHEDULED_BLOGS_FILE = path.join(__dirname, 'scheduled-blogs.json');

// Scheduled blogs configuration
const scheduledBlogs = [
    {
        publishDate: '2025-10-10',
        publishTime: '09:00',
        filename: 'energy-efficient-hvac-systems-guide-2024.html',
        title: 'Ultimate Guide to Energy Efficient HVAC Systems for 2024',
        description: 'Complete guide to maximizing HVAC efficiency and reducing energy costs in Canadian homes. Expert tips for modern energy-efficient heating and cooling systems.',
        badge: '🏠 Homeowner Series',
        badgeClass: 'free',
        readTime: '12 min read',
        bullets: [
            'Energy-efficient HVAC technologies',
            'Cost-saving strategies for Canadian homes',
            'Government rebates and incentives',
            'Maintenance tips for peak efficiency'
        ]
    },
    {
        publishDate: '2025-10-17',
        publishTime: '09:00',
        filename: 'maximizing-energy-efficiency-hvac-tips-canadian-winters.html',
        title: 'Maximizing Energy Efficiency: HVAC Tips for Canadian Winters',
        description: 'Expert strategies for reducing heating costs and improving comfort during harsh Canadian winters.',
        badge: '🏠 Homeowner Series',
        badgeClass: 'free',
        readTime: '10 min read',
        bullets: [
            'Winter energy-saving strategies',
            'Smart thermostat optimization',
            'Insulation and weatherproofing tips',
            'Heat pump winter performance'
        ]
    },
    {
        publishDate: '2025-10-24',
        publishTime: '09:00',
        filename: 'maximizing-hvac-efficiency-tips-canadian-homes.html',
        title: 'Maximizing HVAC Efficiency: Tips for Canadian Homes',
        description: 'Comprehensive guide to improving HVAC system performance and reducing energy costs year-round.',
        badge: '🏠 Homeowner Series',
        badgeClass: 'free',
        readTime: '11 min read',
        bullets: [
            'Year-round efficiency strategies',
            'Professional maintenance schedules',
            'DIY optimization tips',
            'Energy monitoring and tracking'
        ]
    }
];

// Function to add blog card to index.html
function addBlogToIndex(blogInfo) {
    console.log(`\n📝 Adding blog to index page...`);

    try {
        // Read the current index.html
        let indexContent = fs.readFileSync(INDEX_FILE, 'utf8');

        // Create the blog card HTML
        const bulletsList = blogInfo.bullets.map(bullet =>
            `<li>${bullet}</li>`
        ).join('\n                            ');

        const blogCardHTML = `
                <!-- New Blog Post: ${blogInfo.title} -->
                <a href="${blogInfo.filename}" class="blog-card">
                    <div class="blog-card-header">
                        <span class="blog-badge ${blogInfo.badgeClass}">${blogInfo.badge}</span>
                        <h2>${blogInfo.title}</h2>
                        <div class="blog-card-meta">Published ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <div class="blog-card-content">
                        <p>${blogInfo.description}</p>
                        <ul style="color: #e67e22; font-size: 0.95rem; margin-left: 1rem;">
                            ${bulletsList}
                        </ul>
                    </div>
                    <div class="blog-card-footer">
                        <span class="read-more">Read Complete Guide →</span>
                        <span class="read-time">${blogInfo.readTime}</span>
                    </div>
                </a>
`;

        // Find the location to insert (after the blog-grid div opens)
        const insertMarker = '<div class="blog-grid">';
        const insertIndex = indexContent.indexOf(insertMarker);

        if (insertIndex === -1) {
            console.error('   ❌ Could not find blog-grid div in index.html');
            return false;
        }

        // Insert after the marker and its newline
        const insertPosition = insertIndex + insertMarker.length;
        indexContent = indexContent.slice(0, insertPosition) +
                      blogCardHTML +
                      indexContent.slice(insertPosition);

        // Write back to file
        fs.writeFileSync(INDEX_FILE, indexContent, 'utf8');
        console.log(`   ✅ Added blog card to index page`);
        return true;

    } catch (error) {
        console.error(`   ❌ Error updating index page:`, error.message);
        return false;
    }
}

// Function to commit and push changes
function gitCommitAndPush(blogTitle, filename) {
    console.log(`\n📤 Committing and pushing to GitHub...`);

    try {
        // Add files
        execSync(`git add "${path.join('pages', 'blog', filename)}"`, { cwd: __dirname });
        execSync(`git add "${INDEX_FILE}"`, { cwd: __dirname });

        // Commit
        const commitMessage = `Add Friday blog: ${blogTitle}`;
        execSync(`git commit -m "${commitMessage}"`, { cwd: __dirname });
        console.log(`   ✅ Committed changes`);

        // Push
        execSync('git push', { cwd: __dirname });
        console.log(`   ✅ Pushed to GitHub`);

        return true;
    } catch (error) {
        console.error(`   ❌ Git error:`, error.message);
        return false;
    }
}

// Function to deploy to Netlify
function deployToNetlify() {
    console.log(`\n🚀 Deploying to Netlify...`);

    try {
        execSync('netlify deploy --prod', {
            cwd: __dirname,
            stdio: 'inherit'
        });
        console.log(`   ✅ Deployed to larklabs.org`);
        return true;
    } catch (error) {
        console.error(`   ❌ Netlify deploy error:`, error.message);
        return false;
    }
}

// Function to check if it's time to publish a blog
function checkAndPublish() {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 5 = Friday

    console.log(`\n🔍 Checking for blogs to publish...`);
    console.log(`   Current date: ${currentDate}`);
    console.log(`   Current time: ${now.toLocaleTimeString()}`);
    console.log(`   Day of week: ${currentDay === 5 ? 'Friday ✅' : 'Not Friday'}`);

    // Only publish on Fridays between 9am and 10am
    if (currentDay !== 5 || currentHour < 9 || currentHour >= 10) {
        console.log(`   ⏳ Not publishing time yet (Fridays 9-10am EST)`);
        return;
    }

    // Find blogs scheduled for today
    const blogsToPublish = scheduledBlogs.filter(blog => {
        const blogFilePath = path.join(BLOG_DIR, blog.filename);
        const blogExists = fs.existsSync(blogFilePath);
        const scheduledForToday = blog.publishDate === currentDate;

        return scheduledForToday && blogExists;
    });

    if (blogsToPublish.length === 0) {
        console.log(`   📭 No blogs scheduled for today`);
        return;
    }

    // Publish each blog
    blogsToPublish.forEach(blog => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📰 Publishing Blog!`);
        console.log(`   Title: ${blog.title}`);
        console.log(`   File: ${blog.filename}`);
        console.log(`${'='.repeat(60)}`);

        // Step 1: Add to index page
        const indexUpdated = addBlogToIndex(blog);
        if (!indexUpdated) {
            console.error(`\n❌ Failed to update index page`);
            return;
        }

        // Step 2: Commit and push
        const pushed = gitCommitAndPush(blog.title, blog.filename);
        if (!pushed) {
            console.error(`\n❌ Failed to push to GitHub`);
            return;
        }

        // Step 3: Deploy to Netlify
        const deployed = deployToNetlify();
        if (!deployed) {
            console.error(`\n❌ Failed to deploy to Netlify`);
            return;
        }

        console.log(`\n✅ Blog published successfully!`);
        console.log(`   Live at: https://larklabs.org/pages/blog/${blog.filename}`);
        console.log(`${'='.repeat(60)}\n`);
    });
}

// Main scheduler function
function runScheduler() {
    console.log('='.repeat(60));
    console.log('LarkLabs Blog Scheduler - Enhanced Version');
    console.log('='.repeat(60));
    console.log(`\n✅ Found ${scheduledBlogs.length} scheduled blogs\n`);

    console.log('📅 Upcoming Schedule:');
    console.log('-'.repeat(60));
    scheduledBlogs.forEach(blog => {
        const date = new Date(blog.publishDate + 'T' + blog.publishTime);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        console.log(`   ${blog.publishDate} ${blog.publishTime} (${dayName}) - ${blog.title}`);
    });
    console.log('-'.repeat(60));

    console.log('\n🔄 Scheduler running... (Press Ctrl+C to stop)');
    console.log('   Checking every hour for blogs to publish on Fridays\n');

    // Check immediately on start
    checkAndPublish();

    // Then check every hour
    setInterval(checkAndPublish, 60 * 60 * 1000); // 1 hour
}

// Start the scheduler
runScheduler();
