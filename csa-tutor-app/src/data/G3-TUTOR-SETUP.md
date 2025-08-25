# TSSA G3 AI Tutor - Setup Guide

## Overview
This AI-powered tutor helps students prepare for TSSA G3 certification by providing expert guidance on CSA Gas Technician Modules 1-9. The system uses Claude AI with a specialized prompt designed for HVAC education.

## Files Created

### Core Application Files
1. **`g3-tutor-app.html`** - Main application with complete chat interface
2. **`claude-api-integration.js`** - Claude API integration with production-ready code
3. **`module-integration.js`** - Integration with existing module data files

## Quick Start (Demo Mode)

### Option 1: Local File Testing
1. Open `g3-tutor-app.html` in any modern web browser
2. The demo version works immediately with simulated responses
3. Try the example questions or ask your own questions
4. Select different modules from the sidebar for context

### Option 2: Simple Web Server
```bash
# If you have Python installed
cd src/data
python -m http.server 8000

# Then visit: http://localhost:8000/g3-tutor-app.html
```

## Production Setup (Claude API Integration)

### Step 1: Get Claude API Access
1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Create a new API key
3. Note your API key securely

### Step 2: Configure API Integration
1. Open `claude-api-integration.js`
2. Replace `YOUR_CLAUDE_API_KEY_HERE` with your actual API key:
   ```javascript
   const CLAUDE_API_CONFIG = {
       apiKey: 'sk-ant-your-actual-key-here', // Your Claude API key
       model: 'claude-3-sonnet-20240229',
       maxTokens: 2000,
       apiUrl: 'https://api.anthropic.com/v1/messages'
   };
   ```

### Step 3: Update HTML File
In `g3-tutor-app.html`, replace the `simulateClaudeResponse` function call with:
```javascript
// Replace line ~280 in the HTML file:
// return await simulateClaudeResponse(userMessage, selectedModule, contextInfo);

// With this:
return await getClaudeResponse(userMessage, selectedModule, moduleData);
```

### Step 4: Include API Integration Script
Add this to your HTML file before the closing `</body>` tag:
```html
<script src="claude-api-integration.js"></script>
```

## Advanced Integration (Full Module Data)

### Using Real Module Data
1. Ensure all module data files are in the same directory
2. Use the `module-integration.js` file for enhanced responses
3. Replace the basic module data in HTML with imports from data files

### Example Integration
```javascript
// In your HTML file, replace the basic moduleData with:
import { getIntegratedAIResponse } from './module-integration.js';

// Then use in your getAIResponse function:
return await getIntegratedAIResponse(userMessage, selectedModule);
```

## Features

### 🎯 Specialized G3 Tutoring
- Expert knowledge of CSA Gas Technician Modules 1-9
- Safety-first approach to all explanations
- Real-world examples and analogies
- Step-by-step procedural guidance

### 💬 Smart Chat Interface
- Context-aware responses based on selected module
- Quick topic buttons for common questions
- Typing indicators and smooth animations
- Mobile-responsive design

### 📚 Module Integration
- Module-specific knowledge base
- Search across all modules
- Common Q&A for each module
- Progressive learning approach

### 🛡️ Safety Focus
- Emphasizes safety in all responses
- Code compliance reminders
- Best practices integration
- Emergency procedure guidance

## Customization

### Modify System Prompt
Edit the `G3_SYSTEM_PROMPT` in `claude-api-integration.js` to adjust the AI's teaching style and focus areas.

### Add New Topics
Update the `responses` object in the fallback function to add more pattern-matched responses for specific topics.

### Customize Interface
Modify the CSS in `g3-tutor-app.html` to match your branding or design preferences.

### Add Module-Specific Features
Use the `getQuickTopicsForModule` function to customize sidebar topics based on the selected module.

## API Usage & Costs

### Claude API Pricing (as of 2024)
- **Claude 3 Haiku:** ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- **Claude 3 Sonnet:** ~$3 per 1M input tokens, ~$15 per 1M output tokens

### Typical Usage
- Average conversation: 10-20 messages
- Each response: ~500-1000 tokens
- Daily cost for moderate use: $1-5

### Cost Optimization Tips
1. Use Haiku model for faster, cheaper responses
2. Implement response caching for common questions
3. Set reasonable token limits
4. Monitor usage through Anthropic Console

## Troubleshooting

### Common Issues

#### 1. API Key Not Working
- Verify key is correct and has billing enabled
- Check API key permissions in Anthropic Console
- Ensure key is properly formatted (starts with `sk-ant-`)

#### 2. CORS Errors (Browser)
- Use a local web server instead of opening file directly
- Consider using a simple proxy for development
- For production, implement proper CORS handling

#### 3. Slow Responses
- Switch to Claude 3 Haiku for faster responses
- Reduce maxTokens limit
- Implement local caching for common questions

#### 4. Module Data Not Loading
- Check that all module data files are in the correct directory
- Verify import paths are correct
- Use browser developer tools to debug import errors

### Browser Compatibility
- **Supported:** Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Features:** ES6 modules, Fetch API, CSS Grid, Flexbox
- **Mobile:** Responsive design works on all modern mobile browsers

## Security Considerations

### API Key Security
- **Never commit API keys to version control**
- Use environment variables in production
- Implement rate limiting
- Monitor API usage for abuse

### Content Security
- Validate all user inputs
- Implement content filtering if needed
- Log conversations for quality assurance
- Consider user privacy requirements

## Deployment Options

### Option 1: Static Hosting
- Deploy to Netlify, Vercel, or GitHub Pages
- Use environment variables for API key
- Implement serverless functions for API calls

### Option 2: Traditional Web Server
- Host on Apache/Nginx
- Use server-side proxy for API calls
- Implement user authentication if needed

### Option 3: Learning Management System
- Integrate with existing LMS
- Use LTI (Learning Tools Interoperability)
- Implement progress tracking

## Support & Maintenance

### Regular Updates
- Monitor Claude API changes and updates
- Update module content as CSA standards change
- Refresh example questions and responses
- Update safety information and code requirements

### Performance Monitoring
- Track API response times
- Monitor user engagement metrics
- Analyze common question patterns
- Optimize based on usage data

### Content Quality
- Regularly review AI responses for accuracy
- Update knowledge base with new information
- Gather user feedback for improvements
- Test against current CSA examination standards

## License & Usage

This educational tool is designed for TSSA G3 certification preparation. Ensure all content aligns with current CSA standards and TSSA requirements. Users should verify all information with official sources before applying in real-world situations.

---

**Need Help?** Check the troubleshooting section above or review the code comments in the JavaScript files for detailed implementation guidance.