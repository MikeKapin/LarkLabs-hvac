import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch fresh user data from database
        const result = await query(
            'SELECT id, email, first_name, last_name, role, school_id, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(401).json({ error: 'Account deactivated' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

export function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                required: allowedRoles,
                current: userRole
            });
        }

        next();
    };
}

export function requireSchoolAccess(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Admins can access any school
    if (req.user.role === 'admin') {
        return next();
    }

    // School admins and instructors can only access their own school
    const requestedSchoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
    
    if (requestedSchoolId && requestedSchoolId !== req.user.school_id) {
        return res.status(403).json({ error: 'Access denied to this school' });
    }

    next();
}

export function generateTokens(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.school_id
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN || '1h' 
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' 
    });

    return { accessToken, refreshToken };
}

export async function verifyRefreshToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        
        // Verify user still exists and is active
        const result = await query(
            'SELECT id, email, first_name, last_name, role, school_id, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0 || !result.rows[0].is_active) {
            throw new Error('User not found or inactive');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
}