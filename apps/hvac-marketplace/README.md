# HVAC Tools Affiliate Marketplace

A comprehensive, AI-powered marketplace for HVAC trade tools with affiliate tracking, premium memberships, and intelligent product recommendations.

## 🚀 Features

### Core Marketplace
- **Product Catalog**: 6 categories of HVAC tools with detailed specifications
- **Advanced Search**: Filter by category, price, brand, and skill level
- **Product Comparison**: Side-by-side tool comparisons
- **Wishlist System**: Save favorite tools for later
- **Shopping Cart**: Track selected items and pricing

### 🤖 AI Assistant
- **Intelligent Recommendations**: AI-powered tool suggestions based on job requirements
- **Technical Expertise**: Answers HVAC-specific questions about tools and applications
- **Budget Optimization**: Recommends tools within specified budgets
- **Skill-Level Guidance**: Tailored recommendations for students through masters
- **Quick Actions**: Pre-built prompts for common requests

### 💰 Affiliate System
- **UTM Tracking**: Comprehensive click tracking for commission attribution
- **Multi-Retailer Support**: Amazon, Home Depot, Grainger, and more
- **Analytics Dashboard**: Track clicks, conversions, and revenue
- **Conversion Analytics**: AI-driven purchase tracking

### ⭐ Premium Features
- **Exclusive Deals**: Member-only pricing and flash sales
- **Advanced AI**: Enhanced recommendations and custom project lists
- **Priority Support**: 24/7 technical assistance
- **Professional Networking**: Connect with other premium members
- **Analytics Dashboard**: Detailed performance metrics

## 📁 File Structure

```
hvac-marketplace/
├── index.html          # Main marketplace interface
├── premium.html        # Premium membership page
├── admin.html         # Admin panel for product management
└── README.md          # This file
```

## 🛠️ Setup Instructions

1. **Basic Setup**
   ```bash
   # Navigate to marketplace directory
   cd apps/hvac-marketplace
   
   # Open in browser
   open index.html
   ```

2. **Admin Access**
   - Navigate to `admin.html`
   - Default password: `hvac2024admin`
   - Manage products, view analytics, and configure AI responses

3. **Stripe Integration** (for production)
   - Replace `GA_MEASUREMENT_ID` with your Google Analytics ID
   - Update Stripe payment links in `premium.html`
   - Configure webhook endpoints for subscription management

## 🎯 AI Assistant Capabilities

### Supported Queries
- "What tools do I need for [specific job]?"
- "I'm a [skill level], what should I buy?"
- "Compare [tool A] vs [tool B]"
- "I have $[amount] budget, what tools?"
- "What safety equipment do I need?"

### Knowledge Areas
- **Tool Categories**: Hand tools, power tools, testing equipment, safety gear
- **Skill Levels**: Student, apprentice, journeyman, master recommendations
- **Applications**: Installation, maintenance, troubleshooting, diagnostics
- **Safety**: PPE requirements and workplace safety protocols
- **Budgeting**: Cost-effective tool selection and ROI analysis

## 💳 Premium Membership Plans

### Free Tier
- Basic tool catalog access
- Standard AI assistant
- Product reviews and ratings
- Basic search and filters

### Premium Professional ($19.99/month)
- Exclusive member deals (15-30% savings)
- Advanced AI recommendations
- Custom project tool lists
- Priority support
- Professional networking
- Early access to new tools

### Enterprise ($99.99/month)
- Team management features
- Bulk purchasing discounts
- Custom AI training
- API access
- Dedicated account manager
- White-label options

## 📊 Analytics & Tracking

### Metrics Tracked
- **Affiliate Clicks**: UTM-tagged links to retail partners
- **Conversion Rates**: Purchase completion tracking
- **AI Interactions**: Query types and response effectiveness
- **User Engagement**: Time spent, page views, return visits
- **Revenue Attribution**: AI-driven vs organic purchases

### Data Storage
- **Local Storage**: Demo mode uses browser storage
- **Production**: Designed for database integration (PostgreSQL/MongoDB)
- **Privacy**: No personal data collected without consent

## 🔧 Technical Implementation

### Frontend Architecture
- **Vanilla JavaScript**: Modern ES6+ with modular design
- **CSS Grid/Flexbox**: Responsive layouts without frameworks
- **Progressive Enhancement**: Works without JavaScript enabled
- **Mobile-First**: Responsive design for all device sizes

### AI System
- **Local Knowledge Base**: 500+ tool specifications and use cases
- **Context Awareness**: Maintains conversation history
- **Natural Language**: Understands HVAC terminology and slang
- **Learning Capability**: Admin can add custom responses

### Affiliate Integration
- **UTM Parameters**: `utm_source=larklabs_marketplace&utm_medium=affiliate`
- **Click Attribution**: Unique session and user tracking
- **Commission Tracking**: Revenue analytics and reporting
- **A/B Testing**: Different link placements and messaging

## 🚀 Deployment

### Local Development
1. Clone repository
2. Open `index.html` in modern browser
3. Test AI assistant and product filtering
4. Access admin panel with demo credentials

### Production Deployment
1. **Domain Setup**: Upload files to web server
2. **SSL Certificate**: Ensure HTTPS for secure payments
3. **Analytics**: Configure Google Analytics tracking
4. **Affiliate Programs**: Register with retail partners
5. **Stripe Account**: Set up payment processing
6. **Database**: Implement backend data storage

## 🎨 Customization

### Branding
- Update CSS variables in `:root` for color scheme
- Replace logo and favicon files
- Modify product categories and descriptions

### AI Enhancement
- Add custom responses via admin panel
- Expand knowledge base with new tool categories
- Integrate with external APIs for live pricing

### Affiliate Partners
- Add new retailer affiliate links
- Configure commission rates
- Set up tracking pixels and conversion events

## 📞 Support

For technical support or feature requests:
- Email: support@larklabs.org
- Documentation: This README file
- Admin Panel: Built-in analytics and management tools

## 🔒 Security Notes

- Admin panel uses demo authentication (replace in production)
- Affiliate links include security headers
- No sensitive data stored in localStorage
- CORS protection for API endpoints

---

**Built by LARK Labs** - Professional HVAC education and tools