import express from 'express';
import { body, param, query as queryValidator, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { requireRole, requireSchoolAccess } from '../middleware/auth.js';

const router = express.Router();

// School licensing dashboard
router.get('/licensing/schools', [
    requireRole(['admin'])
], async (req, res) => {
    try {
        const schools = await query(`
            SELECT 
                s.*,
                COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'student') as total_students,
                COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'instructor') as total_instructors,
                COUNT(DISTINCT c.id) as active_courses,
                cl.license_start_date,
                cl.license_end_date,
                cl.student_limit,
                cl.annual_fee,
                cl.pricing_tier,
                CASE WHEN s.license_expires_at > NOW() THEN 'active' ELSE 'expired' END as license_status
            FROM schools s
            LEFT JOIN users u ON s.id = u.school_id AND u.is_active = true
            LEFT JOIN courses c ON s.id = c.school_id AND c.is_active = true
            LEFT JOIN content_licenses cl ON s.id = cl.school_id AND cl.is_active = true
            GROUP BY s.id, cl.license_start_date, cl.license_end_date, cl.student_limit, cl.annual_fee, cl.pricing_tier
            ORDER BY s.created_at DESC
        `);

        res.json({
            schools: schools.rows
        });

    } catch (error) {
        console.error('Schools licensing fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch schools licensing data' });
    }
});

// Create new school license
router.post('/licensing/schools', [
    body('name').isLength({ min: 1 }).trim(),
    body('contactEmail').isEmail(),
    body('licenseType').isIn(['trial', 'basic', 'premium', 'enterprise']),
    body('maxStudents').isInt({ min: 1 }),
    body('billingAddress').optional().isString(),
    body('programs').isArray(),
    requireRole(['admin'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            contactEmail,
            licenseType,
            maxStudents,
            billingAddress,
            programs // Array of program IDs ['G2', 'G3']
        } = req.body;

        // Calculate license duration and pricing
        const licenseDuration = getLicenseDuration(licenseType);
        const pricing = calculatePricing(licenseType, maxStudents, programs);

        // Create school
        const school = await query(`
            INSERT INTO schools (
                name, contact_email, license_type, max_students, 
                billing_address, license_expires_at
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            name,
            contactEmail,
            licenseType,
            maxStudents,
            billingAddress,
            new Date(Date.now() + licenseDuration)
        ]);

        const schoolId = school.rows[0].id;

        // Create content licenses for each program
        for (const programCode of programs) {
            const program = await query('SELECT id FROM programs WHERE code = $1', [programCode]);
            
            if (program.rows.length > 0) {
                await query(`
                    INSERT INTO content_licenses (
                        school_id, program_id, license_start_date, license_end_date,
                        student_limit, pricing_tier, annual_fee
                    )
                    VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6)
                `, [
                    schoolId,
                    program.rows[0].id,
                    new Date(Date.now() + licenseDuration),
                    maxStudents,
                    licenseType,
                    pricing.annualFee
                ]);
            }
        }

        res.status(201).json({
            message: 'School license created successfully',
            school: school.rows[0],
            pricing,
            programs
        });

    } catch (error) {
        console.error('School license creation error:', error);
        res.status(500).json({ error: 'Failed to create school license' });
    }
});

// Get usage analytics for a school
router.get('/analytics/school/:schoolId', [
    param('schoolId').isUUID(),
    queryValidator('startDate').optional().isISO8601(),
    queryValidator('endDate').optional().isISO8601(),
    requireRole(['admin', 'school_admin']),
    requireSchoolAccess
], async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { startDate, endDate } = req.query;

        const dateFilter = startDate && endDate 
            ? 'AND ua.date BETWEEN $2 AND $3'
            : 'AND ua.date >= CURRENT_DATE - INTERVAL \'30 days\'';

        const queryParams = startDate && endDate 
            ? [schoolId, startDate, endDate]
            : [schoolId];

        // Get usage analytics
        const analytics = await query(`
            SELECT 
                ua.*,
                s.name as school_name,
                s.license_type
            FROM usage_analytics ua
            JOIN schools s ON ua.school_id = s.id
            WHERE ua.school_id = $1 ${dateFilter}
            ORDER BY ua.date DESC
        `, queryParams);

        // Get current enrollment statistics
        const currentStats = await query(`
            SELECT 
                COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'student' AND u.is_active = true) as active_students,
                COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'instructor' AND u.is_active = true) as active_instructors,
                COUNT(DISTINCT c.id) as active_courses,
                COUNT(DISTINCT e.id) as total_enrollments,
                AVG(e.final_grade) FILTER (WHERE e.final_grade IS NOT NULL) as average_grade
            FROM schools s
            LEFT JOIN users u ON s.id = u.school_id
            LEFT JOIN courses c ON s.id = c.school_id AND c.is_active = true
            LEFT JOIN enrollments e ON c.id = e.course_id
            WHERE s.id = $1
        `, [schoolId]);

        // Get certification statistics
        const certificationStats = await query(`
            SELECT 
                p.name as program_name,
                p.code as program_code,
                COUNT(*) as total_certifications,
                AVG(cert.final_score) as average_score
            FROM certifications cert
            JOIN programs p ON cert.program_id = p.id
            JOIN users u ON cert.student_id = u.id
            WHERE u.school_id = $1
            GROUP BY p.id, p.name, p.code
            ORDER BY p.code
        `, [schoolId]);

        res.json({
            analytics: analytics.rows,
            currentStatistics: currentStats.rows[0],
            certificationStatistics: certificationStats.rows
        });

    } catch (error) {
        console.error('Analytics fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
});

// Update school license
router.put('/licensing/schools/:schoolId', [
    param('schoolId').isUUID(),
    body('licenseType').optional().isIn(['trial', 'basic', 'premium', 'enterprise']),
    body('maxStudents').optional().isInt({ min: 1 }),
    body('licenseExpiresAt').optional().isISO8601(),
    requireRole(['admin'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { schoolId } = req.params;
        const updates = req.body;

        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                const dbField = key === 'licenseType' ? 'license_type' : 
                               key === 'maxStudents' ? 'max_students' :
                               key === 'licenseExpiresAt' ? 'license_expires_at' : key;
                
                updateFields.push(`${dbField} = $${paramIndex}`);
                updateValues.push(value);
                paramIndex++;
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(schoolId);

        const updateQuery = `
            UPDATE schools 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'School not found' });
        }

        res.json({
            message: 'School license updated successfully',
            school: result.rows[0]
        });

    } catch (error) {
        console.error('School license update error:', error);
        res.status(500).json({ error: 'Failed to update school license' });
    }
});

// Get system-wide statistics (admin only)
router.get('/statistics/system', [
    requireRole(['admin'])
], async (req, res) => {
    try {
        // Get overall system statistics
        const systemStats = await query(`
            SELECT 
                COUNT(DISTINCT s.id) as total_schools,
                COUNT(DISTINCT s.id) FILTER (WHERE s.is_active = true AND s.license_expires_at > NOW()) as active_schools,
                COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'student' AND u.is_active = true) as total_students,
                COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'instructor' AND u.is_active = true) as total_instructors,
                COUNT(DISTINCT c.id) as total_courses,
                COUNT(DISTINCT cert.id) as total_certifications,
                SUM(cl.annual_fee) FILTER (WHERE cl.is_active = true) as total_annual_revenue
            FROM schools s
            LEFT JOIN users u ON s.id = u.school_id
            LEFT JOIN courses c ON s.id = c.school_id AND c.is_active = true
            LEFT JOIN certifications cert ON u.id = cert.student_id
            LEFT JOIN content_licenses cl ON s.id = cl.school_id
        `);

        // Get growth statistics (last 12 months)
        const growthStats = await query(`
            SELECT 
                DATE_TRUNC('month', created_at) as month,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '12 months') as new_schools,
                COUNT(DISTINCT u.id) FILTER (WHERE u.created_at >= NOW() - INTERVAL '12 months' AND u.role = 'student') as new_students
            FROM schools s
            LEFT JOIN users u ON s.id = u.school_id
            WHERE s.created_at >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', s.created_at)
            ORDER BY month DESC
        `);

        // Get program popularity
        const programStats = await query(`
            SELECT 
                p.name,
                p.code,
                COUNT(DISTINCT cl.school_id) as licensed_schools,
                COUNT(DISTINCT e.student_id) as enrolled_students,
                COUNT(DISTINCT cert.id) as completed_certifications,
                AVG(cert.final_score) as average_completion_score
            FROM programs p
            LEFT JOIN content_licenses cl ON p.id = cl.program_id AND cl.is_active = true
            LEFT JOIN courses c ON p.id = c.program_id AND c.is_active = true
            LEFT JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN certifications cert ON p.id = cert.program_id
            GROUP BY p.id, p.name, p.code
            ORDER BY enrolled_students DESC
        `);

        res.json({
            systemStatistics: systemStats.rows[0],
            growthStatistics: growthStats.rows,
            programStatistics: programStats.rows
        });

    } catch (error) {
        console.error('System statistics fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch system statistics' });
    }
});

// Generate usage report for billing
router.get('/billing/usage/:schoolId', [
    param('schoolId').isUUID(),
    queryValidator('year').isInt({ min: 2020 }),
    queryValidator('month').optional().isInt({ min: 1, max: 12 }),
    requireRole(['admin'])
], async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { year, month } = req.query;

        let dateFilter = 'EXTRACT(YEAR FROM ua.date) = $2';
        let queryParams = [schoolId, year];

        if (month) {
            dateFilter += ' AND EXTRACT(MONTH FROM ua.date) = $3';
            queryParams.push(month);
        }

        // Get usage data for billing calculation
        const usageData = await query(`
            SELECT 
                s.name as school_name,
                s.license_type,
                s.max_students,
                cl.pricing_tier,
                cl.annual_fee,
                SUM(ua.active_students) as total_active_students,
                SUM(ua.modules_accessed) as total_modules_accessed,
                SUM(ua.assessments_completed) as total_assessments_completed,
                SUM(ua.total_study_time_minutes) as total_study_time_minutes,
                SUM(ua.certification_completions) as total_certifications,
                COUNT(ua.date) as billing_days
            FROM schools s
            LEFT JOIN usage_analytics ua ON s.id = ua.school_id
            LEFT JOIN content_licenses cl ON s.id = cl.school_id AND cl.is_active = true
            WHERE s.id = $1 AND ${dateFilter}
            GROUP BY s.id, s.name, s.license_type, s.max_students, cl.pricing_tier, cl.annual_fee
        `, queryParams);

        // Calculate overage charges if applicable
        const usage = usageData.rows[0];
        let overageCharges = 0;

        if (usage && usage.total_active_students > usage.max_students) {
            const overageStudents = usage.total_active_students - usage.max_students;
            overageCharges = overageStudents * getOverageRate(usage.pricing_tier);
        }

        res.json({
            school: {
                id: schoolId,
                name: usage?.school_name,
                licenseType: usage?.license_type,
                studentLimit: usage?.max_students
            },
            usage: usage || {},
            billing: {
                baseFee: usage?.annual_fee || 0,
                overageCharges,
                totalCharges: (usage?.annual_fee || 0) + overageCharges,
                billingPeriod: month ? `${year}-${month.toString().padStart(2, '0')}` : year.toString()
            }
        });

    } catch (error) {
        console.error('Billing usage fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch billing usage data' });
    }
});

// Update daily usage analytics (automated)
router.post('/analytics/update-daily', [
    requireRole(['admin'])
], async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Update analytics for all schools
        await query(`
            INSERT INTO usage_analytics (
                school_id, date, active_students, active_instructors, 
                modules_accessed, assessments_completed, total_study_time_minutes, certification_completions
            )
            SELECT 
                s.id as school_id,
                $1::date as date,
                COUNT(DISTINCT CASE WHEN u.role = 'student' AND sp.last_accessed_at::date = $1::date THEN u.id END) as active_students,
                COUNT(DISTINCT CASE WHEN u.role = 'instructor' AND u.created_at::date = $1::date THEN u.id END) as active_instructors,
                COUNT(DISTINCT sp.id) FILTER (WHERE sp.last_accessed_at::date = $1::date) as modules_accessed,
                COUNT(DISTINCT s_sub.id) FILTER (WHERE s_sub.submitted_at::date = $1::date) as assessments_completed,
                COALESCE(SUM(sp.time_spent_minutes) FILTER (WHERE sp.last_accessed_at::date = $1::date), 0) as total_study_time_minutes,
                COUNT(DISTINCT cert.id) FILTER (WHERE cert.issued_date = $1::date) as certification_completions
            FROM schools s
            LEFT JOIN users u ON s.id = u.school_id AND u.is_active = true
            LEFT JOIN enrollments e ON u.id = e.student_id
            LEFT JOIN student_progress sp ON e.id = sp.enrollment_id
            LEFT JOIN submissions s_sub ON u.id = s_sub.student_id
            LEFT JOIN certifications cert ON u.id = cert.student_id
            WHERE s.is_active = true
            GROUP BY s.id
            ON CONFLICT (school_id, date) 
            DO UPDATE SET 
                active_students = EXCLUDED.active_students,
                active_instructors = EXCLUDED.active_instructors,
                modules_accessed = EXCLUDED.modules_accessed,
                assessments_completed = EXCLUDED.assessments_completed,
                total_study_time_minutes = EXCLUDED.total_study_time_minutes,
                certification_completions = EXCLUDED.certification_completions
        `, [today]);

        res.json({
            message: 'Daily analytics updated successfully',
            date: today
        });

    } catch (error) {
        console.error('Daily analytics update error:', error);
        res.status(500).json({ error: 'Failed to update daily analytics' });
    }
});

// Deactivate/activate school
router.patch('/schools/:schoolId/status', [
    param('schoolId').isUUID(),
    body('isActive').isBoolean(),
    requireRole(['admin'])
], async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { isActive } = req.body;

        const result = await query(`
            UPDATE schools 
            SET is_active = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `, [isActive, schoolId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'School not found' });
        }

        // Also update all users in the school
        await query(`
            UPDATE users 
            SET is_active = $1, updated_at = CURRENT_TIMESTAMP
            WHERE school_id = $2
        `, [isActive, schoolId]);

        res.json({
            message: `School ${isActive ? 'activated' : 'deactivated'} successfully`,
            school: result.rows[0]
        });

    } catch (error) {
        console.error('School status update error:', error);
        res.status(500).json({ error: 'Failed to update school status' });
    }
});

// Get compliance report
router.get('/compliance/report', [
    queryValidator('schoolId').optional().isUUID(),
    requireRole(['admin', 'school_admin'])
], async (req, res) => {
    try {
        const { schoolId } = req.query;
        
        let schoolFilter = '';
        let queryParams = [];
        
        if (schoolId) {
            schoolFilter = 'WHERE s.id = $1';
            queryParams.push(schoolId);
        } else if (req.user.role === 'school_admin') {
            schoolFilter = 'WHERE s.id = $1';
            queryParams.push(req.user.school_id);
        }

        // Generate compliance report
        const complianceData = await query(`
            SELECT 
                s.name as school_name,
                s.license_type,
                COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'student') as total_students,
                COUNT(DISTINCT cert.id) as total_certifications,
                COUNT(DISTINCT cert.id) FILTER (WHERE cert.tssa_registered = true) as tssa_registered_certs,
                AVG(cert.final_score) as average_certification_score,
                COUNT(DISTINCT c.id) as active_courses,
                MAX(ua.date) as last_activity_date
            FROM schools s
            LEFT JOIN users u ON s.id = u.school_id AND u.is_active = true
            LEFT JOIN certifications cert ON u.id = cert.student_id
            LEFT JOIN courses c ON s.id = c.school_id AND c.is_active = true
            LEFT JOIN usage_analytics ua ON s.id = ua.school_id
            ${schoolFilter}
            GROUP BY s.id, s.name, s.license_type
            ORDER BY s.name
        `, queryParams);

        res.json({
            complianceReport: complianceData.rows,
            generatedAt: new Date().toISOString(),
            reportType: schoolId ? 'school_specific' : 'system_wide'
        });

    } catch (error) {
        console.error('Compliance report error:', error);
        res.status(500).json({ error: 'Failed to generate compliance report' });
    }
});

// Helper functions
function getLicenseDuration(licenseType) {
    const durations = {
        trial: 30 * 24 * 60 * 60 * 1000, // 30 days
        basic: 365 * 24 * 60 * 60 * 1000, // 1 year
        premium: 365 * 24 * 60 * 60 * 1000, // 1 year
        enterprise: 365 * 24 * 60 * 60 * 1000 // 1 year
    };
    return durations[licenseType] || durations.basic;
}

function calculatePricing(licenseType, maxStudents, programs) {
    const basePricing = {
        trial: { monthly: 0, annual: 0, perStudent: 0 },
        basic: { monthly: 199, annual: 1999, perStudent: 5 },
        premium: { monthly: 399, annual: 3999, perStudent: 8 },
        enterprise: { monthly: 799, annual: 7999, perStudent: 12 }
    };

    const pricing = basePricing[licenseType] || basePricing.basic;
    const programMultiplier = programs.length > 1 ? 1.5 : 1;
    
    return {
        baseFee: pricing.annual,
        perStudentFee: pricing.perStudent,
        programMultiplier,
        annualFee: Math.round(pricing.annual * programMultiplier),
        estimatedCost: Math.round((pricing.annual + (maxStudents * pricing.perStudent)) * programMultiplier)
    };
}

function getOverageRate(pricingTier) {
    const rates = {
        trial: 0,
        basic: 5,
        premium: 8,
        enterprise: 12
    };
    return rates[pricingTier] || rates.basic;
}

export default router;