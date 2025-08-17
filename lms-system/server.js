import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import gradebookRoutes from './routes/gradebook.js';
import ltiRoutes from './routes/lti.js';
import adminRoutes from './routes/admin.js';
import progressRoutes from './routes/progress.js';
import certificationRoutes from './routes/certification.js';
import analyticsRoutes from './routes/analytics.js';

import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeDatabase } from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.anthropic.com"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration for D2L Brightspace integration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests from D2L Brightspace domains and localhost
        const allowedOrigins = [
            /\.brightspace\.com$/,
            /\.d2l\.com$/,
            /localhost/,
            process.env.FRONTEND_URL
        ];
        
        if (!origin || allowedOrigins.some(pattern => 
            typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
        )) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static content files
app.use('/content', express.static(join(__dirname, '../')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', authenticateToken, courseRoutes);
app.use('/api/gradebook', authenticateToken, gradebookRoutes);
app.use('/api/progress', authenticateToken, progressRoutes);
app.use('/api/certification', authenticateToken, certificationRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// LTI routes (special handling for external integration)
app.use('/lti', ltiRoutes);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, 'client/dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(join(__dirname, 'client/dist/index.html'));
    });
}

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
    try {
        await initializeDatabase();
        console.log('Database initialized successfully');
        
        app.listen(PORT, () => {
            console.log(`LARK Labs HVAC LMS Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`LTI Platform URL: ${process.env.LTI_PLATFORM_URL || 'http://localhost:3000'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;