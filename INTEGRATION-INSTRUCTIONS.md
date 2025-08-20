# G3 Tudor Integration Instructions

## 🚀 Quick Integration Steps

### 1. Add G3 Tudor Card to Main Tools Section

Open your `index.html` file and find the tools section (around line 1596). Add this tool card **at the top** of your tools grid for maximum visibility:

```html
<!-- Add this FIRST in your tools-grid div -->
<div class="tool-card revolutionary-tool" onclick="window.open('./tools/g3-tudor/', '_blank')">
    <div class="new-badge revolutionary-badge">NEW!</div>
    <div class="tool-icon revolutionary-icon">🎓</div>
    <h3>🚀 TSSA G3 Gas Technician AI Tutor 🚀</h3>
    <p>Master your TSSA G3 certification with our comprehensive AI-powered learning assistant! Interactive tutor covering all 9 CSA modules with instant answers, practical examples, and exam preparation.</p>
    <div style="margin: 1rem 0; text-align: left;">
        <h4 style="color: #e74c3c; margin-bottom: 0.8rem; font-size: 1rem;">📚 Complete G3 Module Coverage:</h4>
        <ul style="color: #bdc3c7; margin: 0; padding-left: 1.2rem; font-size: 0.9rem;">
            <li>🛡️ Module 1: Safety & PPE Requirements</li>
            <li>🔧 Module 2: Tools, Fasteners & Testing Equipment</li>
            <li>⛽ Module 3: Gas Properties & Safe Handling</li>
            <li>📋 Module 4: Codes, Acts & Regulations</li>
            <li>⚡ Module 5: Basic Electricity for Gas Systems</li>
            <li>📐 Module 6: Technical Drawings & Manuals</li>
            <li>🤝 Module 7: Customer Relations</li>
            <li>🔩 Module 8: Piping & Tubing Systems</li>
            <li>🏠 Module 9: Gas Appliance Fundamentals</li>
        </ul>
    </div>
    <div style="margin: 1rem 0; text-align: left;">
        <h4 style="color: #3498db; margin-bottom: 0.8rem; font-size: 1rem;">🤖 AI Tutor Features:</h4>
        <ul style="color: #bdc3c7; margin: 0; padding-left: 1.2rem; font-size: 0.9rem;">
            <li>💬 Interactive Q&A on any G3 topic</li>
            <li>📖 Module-specific knowledge base</li>
            <li>🔍 Smart keyword recognition</li>
            <li>📱 PWA - Install as mobile app</li>
            <li>📊 Practical calculations & examples</li>
            <li>⚠️ Safety reminders & best practices</li>
        </ul>
    </div>
    <div class="coming-soon-preview">
        <div class="preview-screens">
            <div class="preview-screen">🎓</div>
            <div class="preview-screen">📚</div>
            <div class="preview-screen">🧠</div>
        </div>
        <p style="font-size: 0.9rem; color: #27ae60; font-weight: bold; margin: 1rem 0;">✅ LIVE NOW - Completely FREE!</p>
        <p style="font-size: 0.8rem; color: #3498db; margin: 0;">Install as app for offline study sessions. Perfect for G3 exam prep!</p>
    </div>
    <div style="text-align: center; margin-top: 1.5rem;">
        <a href="./tools/g3-tudor/" target="_blank" class="cta-button" onclick="event.stopPropagation();">🎓 Launch G3 AI Tutor</a>
    </div>
    <span class="tool-status status-available">🚀 FREE - G3 Certification Prep!</span>
</div>
```

### 2. Add Enhanced Styling (Optional)

If you want the extra animations and effects, add this CSS anywhere in your `<style>` section:

```css
/* Enhanced G3 Tudor Card Styling */
.tool-card.revolutionary-tool::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: shine 3s infinite;
    pointer-events: none;
}

@keyframes shine {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.revolutionary-badge {
    background: linear-gradient(45deg, #e74c3c, #f39c12);
    animation: pulse 2s infinite;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.revolutionary-icon {
    font-size: 3.5rem;
    background: linear-gradient(45deg, #f39c12, #e67e22);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: bounce 2s infinite;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
}
```

### 3. Update Navigation (Optional)

Add G3 Tudor to your main navigation if desired:

```html
<li><a href="./tools/g3-tudor/" target="_blank">G3 Tutor</a></li>
```

### 4. Test the Integration

1. Save your changes to `index.html`
2. Visit your website
3. Scroll to tools section
4. Click the G3 Tudor card
5. Verify it opens the AI tutor app
6. Test PWA installation on mobile devices

## 📱 URLs Created
- **Main App**: `/tools/g3-tudor/` 
- **Landing Page**: `/tools/g3-tudor/landing.html`

## ✅ What's Already Done
- ✅ G3 Tudor app built and deployed
- ✅ PWA functionality with custom icon
- ✅ Service worker for offline access
- ✅ All 9 modules with comprehensive content
- ✅ Mobile-responsive design
- ✅ Lark Labs branding integration

## 🎉 You're Ready!
Once you add the tool card to your main site, students can access the G3 AI tutor immediately. The app is fully functional, works offline, and can be installed as a mobile app!

---
*Need help? The complete integration files are in `/tools/g3-tudor/`*