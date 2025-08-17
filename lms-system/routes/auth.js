import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('firstName').isLength({ min: 1 }).trim(),
    body('lastName').isLength({ min: 1 }).trim(),
    body('role').isIn(['student', 'instructor', 'school_admin']),
    body('schoolId').optional().isUUID()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName, role, schoolId } = req.body;

        // Check if user already exists
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists with this email' });
        }

        // Verify school exists if provided
        if (schoolId) {
            const school = await query('SELECT id, is_active FROM schools WHERE id = $1', [schoolId]);
            if (school.rows.length === 0 || !school.rows[0].is_active) {
                return res.status(400).json({ error: 'Invalid or inactive school' });
            }
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const result = await query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role, school_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, first_name, last_name, role, school_id, created_at
        `, [email, passwordHash, firstName, lastName, role, schoolId]);

        const user = result.rows[0];
        const tokens = generateTokens(user);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                schoolId: user.school_id
            },
            ...tokens
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const result = await query(`
            SELECT u.*, s.name as school_name, s.license_type 
            FROM users u 
            LEFT JOIN schools s ON u.school_id = s.id 
            WHERE u.email = $1 AND u.is_active = true
        `, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if school license is active
        if (user.school_id && user.license_type) {
            const schoolCheck = await query(`
                SELECT license_expires_at FROM schools 
                WHERE id = $1 AND is_active = true 
                AND (license_expires_at IS NULL OR license_expires_at > NOW())
            `, [user.school_id]);

            if (schoolCheck.rows.length === 0) {
                return res.status(403).json({ error: 'School license expired or inactive' });
            }
        }

        const tokens = generateTokens(user);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                schoolId: user.school_id,
                schoolName: user.school_name,
                licenseType: user.license_type
            },
            ...tokens
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Refresh token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }

        const user = await verifyRefreshToken(refreshToken);
        const tokens = generateTokens(user);

        res.json({
            message: 'Token refreshed successfully',
            ...tokens
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});

// Logout (client-side token clearing)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

export default router;