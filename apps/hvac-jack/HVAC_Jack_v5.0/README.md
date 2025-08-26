# HVAC Jack 5.0 - Advanced Professional AI Assistant

![HVAC Jack 5.0](https://img.shields.io/badge/HVAC%20Jack-5.0-orange.svg)
![Python](https://img.shields.io/badge/Python-FastAPI-blue.svg)
![AI](https://img.shields.io/badge/AI-GPT--4-green.svg)
![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7.svg)

## 🚀 Overview

HVAC Jack 5.0 is the most advanced AI-powered HVAC troubleshooting assistant designed exclusively for certified HVAC technicians and gas professionals. This version introduces a revolutionary hybrid architecture combining Netlify Functions frontend with a powerful Python FastAPI backend powered by OpenAI's GPT-4.

### 🆕 What's New in 5.0

- **Advanced AI Integration**: Powered by OpenAI GPT-4 for professional-grade diagnostics
- **Hybrid Architecture**: Python FastAPI backend with Netlify Functions frontend
- **Structured Analysis**: Comprehensive framework with safety warnings, urgency classification, and immediate actions
- **Enhanced Photo Analysis**: Professional-grade rating plate analysis with structured data extraction
- **Equipment-Specific Guidance**: Manufacturer-specific troubleshooting with model-based recommendations
- **Conversation Memory**: Context-aware conversation history management
- **Professional Safety Focus**: Advanced safety warning detection and urgency level classification
- **Fallback System**: Graceful degradation when Python backend is unavailable

## 🏗️ Architecture

```
Frontend (Netlify)
├── HVAC_Jack_v5.html (Enhanced UI)
├── netlify/functions/
│   ├── hvac-jack-v5.js (Main AI Bridge)
│   └── photo-analyzer-v5.js (Photo Analysis Bridge)
└── Static Assets

Python Backend (FastAPI)
├── main.py (Core AI Logic)
├── requirements.txt
└── .env (Configuration)
```

## 🎯 Key Features

### 🧠 Advanced AI Diagnostics
- **GPT-4 Integration**: Professional-grade troubleshooting analysis
- **Structured Responses**: Safety warnings, urgency levels, immediate actions
- **Context Awareness**: Conversation history and equipment-specific guidance
- **Expert-Level Analysis**: Designed for certified professionals

### 📷 Enhanced Photo Analysis
- **Rating Plate Recognition**: Professional-grade data extraction
- **Equipment Identification**: Brand, model, capacity, specifications
- **Confidence Scoring**: Analysis quality assessment
- **Structured Data Output**: JSON formatted equipment specifications

### ⚠️ Safety & Compliance
- **Automatic Safety Detection**: Critical warning identification
- **Urgency Classification**: Emergency, urgent, moderate, routine
- **Code Compliance**: CSA B149.1, NEC, IRC, UMC references
- **Professional Requirements**: Licensed technician recommendations

### 🔧 Professional Tools
- **Diagnostic Framework**: Step-by-step troubleshooting procedures
- **Parts Prediction**: Intelligent component recommendation
- **Manufacturer Integration**: Model-specific guidance and bulletins
- **Performance Optimization**: Energy efficiency recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for Netlify Functions)
- Python 3.8+ (for backend)
- OpenAI API key with GPT-4 access
- Netlify CLI (for development)

### 1. Frontend Setup (Netlify)

```bash
# Clone the repository
cd HVAC_Jack_v5.0

# Install dependencies
npm install

# Set up environment variables
# Create .env file with:
# OPENAI_API_KEY=your_openai_key
# PYTHON_BACKEND_URL=http://localhost:8000 (for development)
# PYTHON_API_KEY=your_python_api_key (optional)

# Start development server
npm run dev
```

### 2. Python Backend Setup

```bash
# Navigate to Python backend
cd python-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your OpenAI API key and other settings

# Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Access the Application

- **Development**: http://localhost:8888 (Netlify dev server)
- **Python Backend**: http://localhost:8000 (FastAPI backend)
- **API Documentation**: http://localhost:8000/docs (Auto-generated Swagger docs)

## 🔧 Configuration

### Environment Variables

#### Frontend (Netlify)
```
OPENAI_API_KEY=your_openai_api_key
PYTHON_BACKEND_URL=https://your-python-backend.herokuapp.com
PYTHON_API_KEY=your_python_api_key
```

#### Backend (Python)
```
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET_KEY=your_jwt_secret
DEBUG=false
LOG_LEVEL=INFO
```

### System Configuration

#### Supported System Types
- Residential Split System
- Package Unit  
- Heat Pump
- Commercial Rooftop
- Gas Furnace
- Boiler
- Dual Fuel
- VRF/VRV

#### Issue Categories
- Heating
- Cooling
- Airflow
- Electrical
- Gas & Combustion
- Controls
- Refrigerant
- Ventilation

## 🚢 Deployment

### Option 1: Netlify + Heroku
```bash
# Deploy frontend to Netlify
netlify deploy --prod

# Deploy Python backend to Heroku
# (See detailed Heroku deployment guide below)
```

### Option 2: Netlify + Railway
```bash
# Deploy Python backend to Railway
railway login
railway deploy
```

### Option 3: Full Docker Deployment
```bash
# Build and deploy using docker-compose
docker-compose up -d
```

## 📚 API Documentation

### Main Troubleshooting Endpoint
```
POST /.netlify/functions/hvac-jack-v5
Content-Type: application/json

{
  "message": "Furnace not igniting - gas valve clicks but no flame",
  "sessionId": "hvac-5-session-123",
  "systemType": "gas_furnace",
  "issueCategory": "gas_combustion",
  "conversationHistory": [],
  "photoAnalysisData": null
}
```

### Photo Analysis Endpoint
```
POST /.netlify/functions/photo-analyzer-v5
Content-Type: application/json

{
  "imageData": "data:image/jpeg;base64,...",
  "query": "Analyze this rating plate for professional diagnosis"
}
```

### Python Backend API
Full API documentation available at: `http://your-backend-url/docs`

## 🔒 Security Features

- **CORS Protection**: Configurable origin restrictions
- **API Key Authentication**: Secure backend access
- **Rate Limiting**: Request throttling
- **Input Validation**: Comprehensive request validation
- **Content Security**: XSS and injection protection

## 🧪 Testing

### Frontend Testing
```bash
# Run basic functionality tests
npm run test

# Test Netlify functions locally
netlify dev
```

### Backend Testing
```bash
# Run Python backend tests
cd python-backend
pytest

# Test API endpoints
curl -X POST "http://localhost:8000/api/v1/troubleshoot" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "session_id": "test", "symptoms": "Test issue"}'
```

## 📈 Monitoring & Analytics

### Health Checks
- **Frontend**: Status indicators in header
- **Backend**: `/api/v1/health` endpoint
- **System Integration**: Automatic fallback detection

### Logging
- **Python Backend**: Structured logging with configurable levels
- **Netlify Functions**: Built-in logging and analytics
- **Error Tracking**: Comprehensive error handling and reporting

## 🛠️ Troubleshooting

### Common Issues

#### Backend Connection Failed
```javascript
// Check if Python backend is running
fetch('http://localhost:8000/api/v1/health')
  .then(response => console.log('Backend status:', response.status))
```

#### Environment Variables Missing
```bash
# Verify environment variables
echo $OPENAI_API_KEY
echo $PYTHON_BACKEND_URL
```

#### CORS Issues
```python
# Update Python backend CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-netlify-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔄 Migration from 4.0

### Key Changes
1. **New Architecture**: Hybrid Netlify + Python FastAPI
2. **Enhanced AI**: GPT-4 instead of Claude (with Claude fallback)
3. **Structured Responses**: Comprehensive analysis framework
4. **Professional Focus**: Certified technician-specific features

### Migration Steps
1. Deploy new 5.0 infrastructure
2. Test with sample requests  
3. Update environment variables
4. Switch traffic to 5.0
5. Monitor performance and fallback usage

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint (frontend) and Black (Python backend)
2. **Testing**: Write tests for new features
3. **Documentation**: Update README for significant changes
4. **Security**: Never commit API keys or sensitive data

### Feature Requests
- Create issue with detailed description
- Include use case and expected behavior
- Provide technical specifications if applicable

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

### Technical Support
- **Documentation**: Check this README and `/docs` endpoint
- **Issues**: Create GitHub issue with detailed description
- **Community**: LARK Labs professional community

### Professional Services
- **Custom Integration**: Contact LARK Labs for enterprise features
- **Training**: Professional HVAC Jack training programs
- **Consulting**: AI-powered HVAC system optimization

## 🔮 Roadmap

### Version 5.1 (Planned)
- [ ] Real-time manufacturer data integration
- [ ] Predictive maintenance algorithms
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Version 6.0 (Future)
- [ ] Mobile app integration
- [ ] IoT sensor integration
- [ ] Advanced machine learning models
- [ ] Fleet management capabilities

---

**HVAC Jack 5.0** - Revolutionizing professional HVAC diagnostics with advanced AI technology.

*Built with ❤️ by LARK Labs - "Technology should serve people, not the other way around"*