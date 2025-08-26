# HVAC Jack 5.0 Deployment Guide

This guide covers deployment options for HVAC Jack 5.0's hybrid architecture.

## 🏗️ Architecture Overview

HVAC Jack 5.0 uses a hybrid deployment model:
- **Frontend**: Netlify (static site + serverless functions)
- **Backend**: Python FastAPI service (Heroku, Railway, or VPS)

## 🚀 Deployment Options

### Option 1: Netlify + Heroku (Recommended)

#### Step 1: Deploy Python Backend to Heroku

1. **Prepare Python Backend**
```bash
cd python-backend

# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Ensure requirements.txt is present
pip freeze > requirements.txt
```

2. **Deploy to Heroku**
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create hvac-jack-v5-backend

# Set environment variables
heroku config:set OPENAI_API_KEY=your_openai_key -a hvac-jack-v5-backend

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a hvac-jack-v5-backend
git push heroku main
```

3. **Configure Environment Variables in Heroku Dashboard**
```
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here  
CORS_ORIGINS=https://your-netlify-domain.netlify.app
DEBUG=false
LOG_LEVEL=INFO
```

#### Step 2: Deploy Frontend to Netlify

1. **Prepare Frontend**
```bash
# Update package.json if needed
npm install

# Set up environment variables in Netlify dashboard:
# OPENAI_API_KEY=your_openai_key (for fallback)
# PYTHON_BACKEND_URL=https://hvac-jack-v5-backend.herokuapp.com
# PYTHON_API_KEY=your_python_api_key
```

2. **Deploy to Netlify**
```bash
# Using Netlify CLI
netlify login
netlify init
netlify deploy --prod

# Or connect GitHub repository in Netlify dashboard
# Build settings:
# Build command: (leave empty)
# Publish directory: .
```

3. **Configure Netlify Environment Variables**
Go to Site settings → Environment variables and add:
```
OPENAI_API_KEY=your_openai_key
PYTHON_BACKEND_URL=https://hvac-jack-v5-backend.herokuapp.com
PYTHON_API_KEY=your_python_api_key
```

### Option 2: Netlify + Railway

#### Step 1: Deploy Python Backend to Railway

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

2. **Deploy Backend**
```bash
cd python-backend
railway init
railway deploy
```

3. **Set Environment Variables**
```bash
railway variables:set OPENAI_API_KEY=your_openai_key
railway variables:set JWT_SECRET_KEY=your_jwt_secret
railway variables:set CORS_ORIGINS=https://your-netlify-domain.netlify.app
```

#### Step 2: Deploy Frontend (same as Option 1, but use Railway URL)

### Option 3: Docker Deployment

#### Step 1: Create Docker Files

1. **Python Backend Dockerfile**
```dockerfile
# python-backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  hvac-jack-backend:
    build: ./python-backend
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - CORS_ORIGINS=http://localhost:8888
    restart: unless-stopped
    
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - hvac-jack-backend
    restart: unless-stopped
```

3. **Deploy with Docker**
```bash
# Create .env file with your variables
echo "OPENAI_API_KEY=your_key" > .env
echo "JWT_SECRET_KEY=your_jwt_secret" >> .env

# Start services
docker-compose up -d

# For frontend, still use Netlify or serve statically
```

## 🔧 Configuration

### Environment Variables by Platform

#### Netlify Environment Variables
```
OPENAI_API_KEY=sk-...
PYTHON_BACKEND_URL=https://your-backend-service.com
PYTHON_API_KEY=optional_security_key
```

#### Python Backend Environment Variables
```
OPENAI_API_KEY=sk-...
JWT_SECRET_KEY=your-256-bit-secret
CORS_ORIGINS=["https://your-netlify-site.netlify.app"]
DEBUG=false
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000
```

### Custom Domain Setup

#### For Netlify (Frontend)
1. Go to Netlify Dashboard → Domain settings
2. Add custom domain (e.g., hvac-jack.yourdomain.com)  
3. Configure DNS records as instructed
4. Enable HTTPS (automatic with Let's Encrypt)

#### For Heroku (Backend)
1. Add custom domain in Heroku Dashboard
2. Configure DNS CNAME to point to Heroku
3. Add SSL certificate (automatic for paid plans)

## 📊 Monitoring & Health Checks

### Health Check Endpoints

#### Frontend Health Check
```javascript
// Built into the app - check status indicators in header
fetch('/.netlify/functions/hvac-jack-v5', {
  method: 'POST',
  body: JSON.stringify({ message: 'health-check', sessionId: 'test' })
})
```

#### Backend Health Check
```bash
# Test backend directly
curl https://your-backend-url.herokuapp.com/api/v1/health

# Expected response:
{
  "status": "healthy",
  "service": "HVAC Jack 5.0 Advanced AI",
  "version": "5.0.0",
  "timestamp": "2025-08-26T20:30:00.000Z"
}
```

### Monitoring Setup

#### Heroku Monitoring
```bash
# Add New Relic monitoring
heroku addons:create newrelic:wayne -a hvac-jack-v5-backend

# Add logging
heroku addons:create papertrail:choklad -a hvac-jack-v5-backend
```

#### Netlify Monitoring
- Built-in analytics in Netlify dashboard
- Function logs available in dashboard
- Set up notifications for deploy failures

## 🔒 Security Configuration

### CORS Setup
```python
# In main.py, configure CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-netlify-domain.netlify.app",
        "https://hvac-jack.yourdomain.com"  # if using custom domain
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)
```

### API Security
```python
# Add API key middleware (optional)
@app.middleware("http")
async def validate_api_key(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        api_key = request.headers.get("Authorization")
        if not api_key or not api_key.startswith("Bearer "):
            return Response(
                content="API key required",
                status_code=401
            )
    
    response = await call_next(request)
    return response
```

### Netlify Security Headers
```toml
# In netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-XSS-Protection = "1; mode=block"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Backend Not Accessible
```bash
# Check if backend is running
curl -I https://your-backend-url.herokuapp.com/api/v1/health

# Check logs
heroku logs --tail -a hvac-jack-v5-backend
```

#### CORS Errors
1. Verify CORS_ORIGINS environment variable
2. Check that Netlify domain matches CORS settings
3. Ensure HTTPS is used (not HTTP)

#### Function Timeout
```javascript
// Increase timeout in netlify.toml
[functions."hvac-jack-v5"]
  timeout = 30
```

#### Environment Variables Missing
```bash
# Check Netlify environment variables
netlify env:list

# Check Heroku environment variables
heroku config -a hvac-jack-v5-backend
```

### Performance Optimization

#### Python Backend
```python
# Add caching (Redis)
import redis
from functools import wraps

redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))

def cache_response(expire_time=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expire_time, json.dumps(result))
            return result
        return wrapper
    return decorator
```

#### Frontend Optimization
```html
<!-- Add service worker for caching -->
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
</script>
```

## 🔄 Continuous Deployment

### GitHub Actions for Heroku
```yaml
# .github/workflows/deploy.yml
name: Deploy to Heroku

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "hvac-jack-v5-backend"
        heroku_email: "your-email@example.com"
        appdir: "python-backend"
```

### Auto-deploy from Git
- **Netlify**: Connect GitHub repository for automatic deploys
- **Heroku**: Connect GitHub repository or use GitHub Actions
- **Railway**: Connect GitHub repository for automatic deploys

## 📈 Scaling Considerations

### Backend Scaling
```bash
# Heroku scaling
heroku ps:scale web=2 -a hvac-jack-v5-backend

# Add database if needed
heroku addons:create heroku-postgresql:mini -a hvac-jack-v5-backend
```

### Performance Monitoring
- Set up error tracking (Sentry)
- Monitor response times
- Set up alerts for downtime
- Track API usage and costs

---

This deployment guide ensures a robust, scalable deployment of HVAC Jack 5.0. Choose the option that best fits your infrastructure needs and technical expertise.