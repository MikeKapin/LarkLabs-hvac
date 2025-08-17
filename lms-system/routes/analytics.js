import express from 'express';
import { param, query as queryValidator, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { requireRole, requireSchoolAccess } from '../middleware/auth.js';

const router = express.Router();

// Comprehensive institutional reporting dashboard
router.get('/institutional/:schoolId', [
    param('schoolId').isUUID(),
    queryValidator('period').optional().isIn(['week', 'month', 'quarter', 'year']),
    queryValidator('programCode').optional().isIn(['G2', 'G3']),
    requireRole(['admin', 'school_admin']),
    requireSchoolAccess
], async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { period = 'month', programCode } = req.query;

        // Calculate date range based on period
        const dateRanges = {
            week: "NOW() - INTERVAL '7 days'",
            month: "NOW() - INTERVAL '30 days'",
            quarter: "NOW() - INTERVAL '90 days'",
            year: "NOW() - INTERVAL '365 days'"
        };

        const dateFilter = dateRanges[period];
        
        let programFilter = '';
        let programParams = [];
        if (programCode) {
            programFilter = 'AND p.code = $3';
            programParams = [programCode];
        }

        // Student engagement metrics
        const engagement = await query(`
            SELECT 
                COUNT(DISTINCT u.id) as total_students,
                COUNT(DISTINCT CASE WHEN sp.last_accessed_at >= ${dateFilter} THEN u.id END) as active_students,
                AVG(sp.completion_percentage) FILTER (WHERE sp.last_accessed_at >= ${dateFilter}) as avg_progress,
                SUM(sp.time_spent_minutes) FILTER (WHERE sp.last_accessed_at >= ${dateFilter}) as total_study_time,
                COUNT(DISTINCT sp.id) FILTER (WHERE sp.completed_at >= ${dateFilter}) as chapters_completed
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            JOIN courses c ON e.course_id = c.id
            JOIN programs p ON c.program_id = p.id
            LEFT JOIN student_progress sp ON e.id = sp.enrollment_id
            WHERE u.school_id = $1 AND u.role = 'student' AND u.is_active = true
            ${programFilter}
        `, [schoolId, ...programParams]);

        // Assessment performance metrics
        const assessments = await query(`
            SELECT 
                COUNT(DISTINCT s.id) as total_submissions,
                AVG(ge.percentage) as average_score,
                COUNT(CASE WHEN ge.percentage >= 70 THEN 1 END) as passing_submissions,
                COUNT(CASE WHEN ge.percentage < 70 THEN 1 END) as failing_submissions,
                COUNT(DISTINCT a.id) as total_assessments
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            JOIN courses c ON a.course_id = c.id
            JOIN programs p ON c.program_id = p.id
            LEFT JOIN gradebook_entries ge ON a.id = ge.assignment_id AND ge.enrollment_id = (
                SELECT id FROM enrollments WHERE student_id = s.student_id AND course_id = c.id
            )
            WHERE c.school_id = $1 AND s.submitted_at >= ${dateFilter}
            ${programFilter}
        `, [schoolId, ...programParams]);

        // Certification completion rates
        const certifications = await query(`
            SELECT 
                p.name as program_name,
                p.code as program_code,
                COUNT(DISTINCT e.student_id) as enrolled_students,
                COUNT(DISTINCT cert.id) as completed_certifications,
                AVG(cert.final_score) as average_certification_score,
                COUNT(DISTINCT cert.id) FILTER (WHERE cert.tssa_registered = true) as tssa_registered
            FROM programs p
            JOIN courses c ON p.id = c.program_id
            JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN certifications cert ON p.id = cert.program_id AND cert.student_id = e.student_id
            WHERE c.school_id = $1 AND c.is_active = true
            ${programFilter}
            GROUP BY p.id, p.name, p.code
            ORDER BY p.code
        `, [schoolId, ...programParams]);

        // Learning path analytics
        const learningPaths = await query(`
            SELECT 
                u.title as unit_title,
                u.unit_number,
                COUNT(DISTINCT sp.enrollment_id) as students_started,
                COUNT(CASE WHEN sp.completed_at IS NOT NULL THEN 1 END) as students_completed,
                AVG(sp.completion_percentage) as average_progress,
                AVG(sp.time_spent_minutes) as average_time_spent
            FROM units u
            JOIN chapters ch ON u.id = ch.unit_id
            JOIN student_progress sp ON ch.id = sp.chapter_id
            JOIN enrollments e ON sp.enrollment_id = e.id
            JOIN courses c ON e.course_id = c.id
            JOIN programs p ON u.program_id = p.id
            WHERE c.school_id = $1 AND sp.last_accessed_at >= ${dateFilter}
            ${programFilter}
            GROUP BY u.id, u.title, u.unit_number
            ORDER BY u.unit_number
        `, [schoolId, ...programParams]);

        // Instructor effectiveness metrics
        const instructorMetrics = await query(`
            SELECT 
                u.first_name,
                u.last_name,
                u.email,
                COUNT(DISTINCT c.id) as courses_taught,
                COUNT(DISTINCT e.student_id) as total_students,
                AVG(e.final_grade) as average_student_grade,
                COUNT(DISTINCT cert.id) as student_certifications
            FROM users u
            JOIN courses c ON u.id = c.instructor_id
            LEFT JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN certifications cert ON e.student_id = cert.student_id
            WHERE u.school_id = $1 AND u.role = 'instructor' AND u.is_active = true
            AND c.created_at >= ${dateFilter}
            GROUP BY u.id, u.first_name, u.last_name, u.email
            ORDER BY total_students DESC
        `, [schoolId]);

        res.json({
            reportPeriod: period,
            programFilter: programCode || 'all',
            schoolId,
            engagement: engagement.rows[0],
            assessments: assessments.rows[0],
            certifications: certifications.rows,
            learningPaths: learningPaths.rows,
            instructorMetrics: instructorMetrics.rows,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Institutional analytics error:', error);
        res.status(500).json({ error: 'Failed to generate institutional report' });
    }
});

// Compliance and accreditation reporting
router.get('/compliance/:schoolId', [
    param('schoolId').isUUID(),
    queryValidator('reportType').optional().isIn(['accreditation', 'audit', 'tssa']),
    requireRole(['admin', 'school_admin']),
    requireSchoolAccess
], async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { reportType = 'accreditation' } = req.query;

        // Get school information
        const school = await query(`
            SELECT s.*, cl.license_start_date, cl.license_end_date
            FROM schools s
            LEFT JOIN content_licenses cl ON s.id = cl.school_id AND cl.is_active = true
            WHERE s.id = $1
        `, [schoolId]);

        if (school.rows.length === 0) {
            return res.status(404).json({ error: 'School not found' });
        }

        // Student completion and success rates
        const studentOutcomes = await query(`
            SELECT 
                p.name as program_name,
                p.code as program_code,
                COUNT(DISTINCT e.student_id) as total_enrolled,
                COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.student_id END) as completed_students,
                COUNT(DISTINCT cert.id) as total_certifications,
                COUNT(DISTINCT cert.id) FILTER (WHERE cert.tssa_registered = true) as tssa_certifications,
                AVG(e.final_grade) FILTER (WHERE e.status = 'completed') as average_completion_grade,
                AVG(cert.final_score) as average_certification_score
            FROM programs p
            JOIN courses c ON p.id = c.program_id
            JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN certifications cert ON p.id = cert.program_id AND cert.student_id = e.student_id
            WHERE c.school_id = $1 AND c.is_active = true
            GROUP BY p.id, p.name, p.code
            ORDER BY p.code
        `, [schoolId]);

        // Quality assurance metrics
        const qualityMetrics = await query(`
            SELECT 
                COUNT(DISTINCT c.id) as total_courses,
                COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'instructor') as total_instructors,
                AVG(
                    (SELECT AVG(ge.percentage) 
                     FROM gradebook_entries ge 
                     JOIN enrollments e ON ge.enrollment_id = e.id 
                     WHERE e.course_id = c.id)
                ) as course_average_performance,
                COUNT(DISTINCT cert.id) FILTER (WHERE cert.final_score >= 80) as high_performing_graduates
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            LEFT JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN certifications cert ON e.student_id = cert.student_id
            WHERE c.school_id = $1 AND c.is_active = true
        `, [schoolId]);

        // Learning objectives achievement
        const learningObjectives = await query(`
            SELECT 
                u.title as unit_title,
                u.learning_objectives,
                COUNT(DISTINCT sp.enrollment_id) as students_attempted,
                COUNT(CASE WHEN sp.completion_percentage >= 80 THEN 1 END) as students_mastered,
                AVG(sp.completion_percentage) as average_mastery
            FROM units u
            JOIN chapters ch ON u.id = ch.unit_id
            JOIN student_progress sp ON ch.id = sp.chapter_id
            JOIN enrollments e ON sp.enrollment_id = e.id
            JOIN courses c ON e.course_id = c.id
            WHERE c.school_id = $1 AND u.is_active = true
            GROUP BY u.id, u.title, u.learning_objectives
            ORDER BY u.unit_number
        `, [schoolId]);

        // Generate report based on type
        let report = {
            school: school.rows[0],
            reportType,
            generatedAt: new Date().toISOString(),
            studentOutcomes: studentOutcomes.rows,
            qualityMetrics: qualityMetrics.rows[0],
            learningObjectives: learningObjectives.rows
        };

        if (reportType === 'tssa') {
            // TSSA-specific compliance data
            const tssaCompliance = await query(`
                SELECT 
                    p.code as program_code,
                    COUNT(DISTINCT cert.id) as total_tssa_certifications,
                    COUNT(DISTINCT cert.id) FILTER (WHERE cert.issued_date >= NOW() - INTERVAL '12 months') as recent_certifications,
                    AVG(cert.final_score) as average_tssa_score,
                    MIN(cert.final_score) as minimum_tssa_score,
                    MAX(cert.final_score) as maximum_tssa_score
                FROM programs p
                JOIN certifications cert ON p.id = cert.program_id
                JOIN users u ON cert.student_id = u.id
                WHERE u.school_id = $1 AND cert.tssa_registered = true
                GROUP BY p.id, p.code
                ORDER BY p.code
            `, [schoolId]);

            report.tssaCompliance = tssaCompliance.rows;
        }

        res.json(report);

    } catch (error) {
        console.error('Compliance report error:', error);
        res.status(500).json({ error: 'Failed to generate compliance report' });
    }
});

// Learning analytics dashboard
router.get('/learning/:courseId', [
    param('courseId').isUUID(),
    queryValidator('studentId').optional().isUUID(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const { courseId } = req.params;
        const { studentId } = req.query;

        // Verify course access
        const courseCheck = await query(`
            SELECT c.id, c.name, p.name as program_name
            FROM courses c
            JOIN programs p ON c.program_id = p.id
            WHERE c.id = $1 AND (c.instructor_id = $2 OR $3 = 'admin' OR ($3 = 'school_admin' AND c.school_id = $4))
        `, [courseId, req.user.id, req.user.role, req.user.school_id]);

        if (courseCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this course' });
        }

        let studentFilter = '';
        let extraParams = [];
        if (studentId) {
            studentFilter = 'AND e.student_id = $5';
            extraParams = [studentId];
        }

        // Learning progression analytics
        const progression = await query(`
            SELECT 
                u.unit_number,
                u.title as unit_title,
                COUNT(DISTINCT e.student_id) as students_enrolled,
                COUNT(DISTINCT sp.id) FILTER (WHERE sp.started_at IS NOT NULL) as students_started,
                COUNT(DISTINCT sp.id) FILTER (WHERE sp.completed_at IS NOT NULL) as students_completed,
                AVG(sp.completion_percentage) as average_progress,
                AVG(sp.time_spent_minutes) as average_time_spent,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sp.time_spent_minutes) as median_time_spent
            FROM units u
            JOIN chapters ch ON u.id = ch.unit_id
            JOIN student_progress sp ON ch.id = sp.chapter_id
            JOIN enrollments e ON sp.enrollment_id = e.id
            WHERE e.course_id = $1 ${studentFilter}
            GROUP BY u.id, u.unit_number, u.title
            ORDER BY u.unit_number
        `, [courseId, ...extraParams]);

        // Assessment performance analytics
        const assessmentPerformance = await query(`
            SELECT 
                a.title as assignment_title,
                a.assignment_type,
                a.max_points,
                COUNT(s.id) as total_submissions,
                AVG(ge.percentage) as average_score,
                STDDEV(ge.percentage) as score_std_dev,
                MIN(ge.percentage) as min_score,
                MAX(ge.percentage) as max_score,
                COUNT(CASE WHEN ge.percentage >= 70 THEN 1 END) as passing_count,
                COUNT(CASE WHEN s.attempt_number > 1 THEN 1 END) as retake_count
            FROM assignments a
            LEFT JOIN submissions s ON a.id = s.assignment_id
            LEFT JOIN gradebook_entries ge ON a.id = ge.assignment_id
            LEFT JOIN enrollments e ON ge.enrollment_id = e.id
            WHERE a.course_id = $1 AND a.is_active = true ${studentFilter}
            GROUP BY a.id, a.title, a.assignment_type, a.max_points
            ORDER BY a.created_at
        `, [courseId, ...extraParams]);

        // Time-on-task analytics
        const timeAnalytics = await query(`
            SELECT 
                DATE_TRUNC('week', sp.last_accessed_at) as week,
                COUNT(DISTINCT e.student_id) as active_students,
                SUM(sp.time_spent_minutes) as total_time_spent,
                AVG(sp.time_spent_minutes) as average_time_per_student,
                COUNT(DISTINCT sp.id) FILTER (WHERE sp.completed_at IS NOT NULL) as completions
            FROM student_progress sp
            JOIN enrollments e ON sp.enrollment_id = e.id
            WHERE e.course_id = $1 AND sp.last_accessed_at >= NOW() - INTERVAL '12 weeks'
            ${studentFilter}
            GROUP BY DATE_TRUNC('week', sp.last_accessed_at)
            ORDER BY week DESC
            LIMIT 12
        `, [courseId, ...extraParams]);

        // Learning pathway analysis
        const pathwayAnalysis = await query(`
            SELECT 
                source_unit.title as from_unit,
                target_unit.title as to_unit,
                COUNT(*) as transition_count,
                AVG(target_progress.completion_percentage - source_progress.completion_percentage) as progress_improvement
            FROM student_progress source_progress
            JOIN chapters source_ch ON source_progress.chapter_id = source_ch.id
            JOIN units source_unit ON source_ch.unit_id = source_unit.id
            JOIN student_progress target_progress ON source_progress.enrollment_id = target_progress.enrollment_id
            JOIN chapters target_ch ON target_progress.chapter_id = target_ch.id
            JOIN units target_unit ON target_ch.unit_id = target_unit.id
            JOIN enrollments e ON source_progress.enrollment_id = e.id
            WHERE e.course_id = $1 
            AND target_unit.order_index = source_unit.order_index + 1
            AND source_progress.completed_at IS NOT NULL
            ${studentFilter}
            GROUP BY source_unit.id, source_unit.title, target_unit.id, target_unit.title
            ORDER BY source_unit.unit_number
        `, [courseId, ...extraParams]);

        res.json({
            course: courseCheck.rows[0],
            period,
            studentFilter: studentId ? 'individual' : 'all',
            analytics: {
                progression: progression.rows,
                assessmentPerformance: assessmentPerformance.rows,
                timeAnalytics: timeAnalytics.rows,
                pathwayAnalysis: pathwayAnalysis.rows
            }
        });

    } catch (error) {
        console.error('Learning analytics error:', error);
        res.status(500).json({ error: 'Failed to generate learning analytics' });
    }
});

// Early warning system - identify at-risk students
router.get('/early-warning/:courseId', [
    param('courseId').isUUID(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const { courseId } = req.params;

        // Verify course access
        const courseCheck = await query(`
            SELECT id FROM courses 
            WHERE id = $1 AND (instructor_id = $2 OR $3 = 'admin' OR ($3 = 'school_admin' AND school_id = $4))
        `, [courseId, req.user.id, req.user.role, req.user.school_id]);

        if (courseCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this course' });
        }

        // Identify at-risk students based on multiple factors
        const atRiskStudents = await query(`
            SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                e.enrollment_date,
                AVG(sp.completion_percentage) as average_progress,
                MAX(sp.last_accessed_at) as last_activity,
                COUNT(CASE WHEN sp.completed_at IS NULL AND sp.last_accessed_at < NOW() - INTERVAL '7 days' THEN 1 END) as chapters_behind,
                AVG(ge.percentage) as average_grade,
                COUNT(CASE WHEN ge.percentage < 70 THEN 1 END) as failing_assignments,
                EXTRACT(DAYS FROM NOW() - MAX(sp.last_accessed_at)) as days_since_last_activity,
                -- Risk score calculation
                CASE 
                    WHEN MAX(sp.last_accessed_at) < NOW() - INTERVAL '14 days' THEN 50
                    WHEN MAX(sp.last_accessed_at) < NOW() - INTERVAL '7 days' THEN 30
                    ELSE 0
                END +
                CASE 
                    WHEN AVG(sp.completion_percentage) < 30 THEN 30
                    WHEN AVG(sp.completion_percentage) < 50 THEN 20
                    ELSE 0
                END +
                CASE 
                    WHEN AVG(ge.percentage) < 60 THEN 20
                    WHEN AVG(ge.percentage) < 70 THEN 10
                    ELSE 0
                END as risk_score
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            LEFT JOIN student_progress sp ON e.id = sp.enrollment_id
            LEFT JOIN gradebook_entries ge ON e.id = ge.enrollment_id
            WHERE e.course_id = $1 AND e.status = 'active' AND u.is_active = true
            GROUP BY u.id, u.first_name, u.last_name, u.email, e.enrollment_date
            HAVING (
                MAX(sp.last_accessed_at) < NOW() - INTERVAL '7 days' OR
                AVG(sp.completion_percentage) < 50 OR
                AVG(ge.percentage) < 70 OR
                COUNT(CASE WHEN ge.percentage < 70 THEN 1 END) >= 2
            )
            ORDER BY risk_score DESC, days_since_last_activity DESC
        `, [courseId]);

        // Recommended interventions
        const interventions = atRiskStudents.rows.map(student => {
            const recommendations = [];
            
            if (student.days_since_last_activity > 14) {
                recommendations.push({
                    type: 'engagement',
                    priority: 'high',
                    action: 'Contact student immediately - no activity for 2+ weeks'
                });
            } else if (student.days_since_last_activity > 7) {
                recommendations.push({
                    type: 'engagement',
                    priority: 'medium',
                    action: 'Send reminder email or schedule check-in call'
                });
            }

            if (student.average_progress < 30) {
                recommendations.push({
                    type: 'academic',
                    priority: 'high',
                    action: 'Schedule one-on-one tutoring session'
                });
            } else if (student.average_progress < 50) {
                recommendations.push({
                    type: 'academic',
                    priority: 'medium',
                    action: 'Provide additional study resources'
                });
            }

            if (student.failing_assignments >= 2) {
                recommendations.push({
                    type: 'assessment',
                    priority: 'high',
                    action: 'Review assessment strategies and offer retake opportunities'
                });
            }

            return {
                ...student,
                recommendations
            };
        });

        res.json({
            course: courseCheck.rows[0],
            atRiskStudents: interventions,
            summary: {
                totalAtRisk: atRiskStudents.rows.length,
                highRisk: atRiskStudents.rows.filter(s => s.risk_score >= 70).length,
                mediumRisk: atRiskStudents.rows.filter(s => s.risk_score >= 40 && s.risk_score < 70).length,
                lowRisk: atRiskStudents.rows.filter(s => s.risk_score < 40).length
            }
        });

    } catch (error) {
        console.error('Early warning system error:', error);
        res.status(500).json({ error: 'Failed to generate early warning report' });
    }
});

// Export comprehensive analytics report
router.get('/export/:schoolId', [
    param('schoolId').isUUID(),
    queryValidator('format').optional().isIn(['csv', 'json', 'pdf']),
    queryValidator('reportType').optional().isIn(['engagement', 'performance', 'compliance', 'full']),
    requireRole(['admin', 'school_admin']),
    requireSchoolAccess
], async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { format = 'csv', reportType = 'full' } = req.query;

        // Generate comprehensive data export
        const exportData = await query(`
            SELECT 
                s.name as school_name,
                u.first_name,
                u.last_name,
                u.email,
                c.name as course_name,
                c.course_code,
                p.name as program_name,
                p.code as program_code,
                e.enrollment_date,
                e.final_grade,
                e.status as enrollment_status,
                COUNT(sp.id) as total_chapters,
                COUNT(CASE WHEN sp.completed_at IS NOT NULL THEN 1 END) as completed_chapters,
                AVG(sp.completion_percentage) as overall_progress,
                SUM(sp.time_spent_minutes) as total_study_time,
                COUNT(subm.id) as total_submissions,
                AVG(ge.percentage) as average_assessment_score,
                cert.issued_date as certification_date,
                cert.final_score as certification_score,
                cert.tssa_registered
            FROM schools s
            JOIN users u ON s.id = u.school_id
            JOIN enrollments e ON u.id = e.student_id
            JOIN courses c ON e.course_id = c.id
            JOIN programs p ON c.program_id = p.id
            LEFT JOIN student_progress sp ON e.id = sp.enrollment_id
            LEFT JOIN submissions subm ON u.id = subm.student_id
            LEFT JOIN gradebook_entries ge ON e.id = ge.enrollment_id
            LEFT JOIN certifications cert ON p.id = cert.program_id AND cert.student_id = u.id
            WHERE s.id = $1 AND u.role = 'student' AND u.is_active = true
            GROUP BY s.name, u.id, u.first_name, u.last_name, u.email, c.id, c.name, c.course_code, p.name, p.code, e.enrollment_date, e.final_grade, e.status, cert.issued_date, cert.final_score, cert.tssa_registered
            ORDER BY u.last_name, u.first_name, c.course_code
        `, [schoolId]);

        if (format === 'csv') {
            // Generate CSV export
            const headers = Object.keys(exportData.rows[0] || {});
            const csvContent = [
                headers.join(','),
                ...exportData.rows.map(row => 
                    headers.map(header => `"${row[header] || ''}"`).join(',')
                )
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="school_${schoolId}_analytics_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvContent);

        } else if (format === 'json') {
            res.json({
                school: { id: schoolId },
                reportType,
                generatedAt: new Date().toISOString(),
                data: exportData.rows
            });

        } else {
            // PDF format would require additional PDF generation library
            res.status(501).json({ error: 'PDF export not yet implemented' });
        }

    } catch (error) {
        console.error('Analytics export error:', error);
        res.status(500).json({ error: 'Failed to export analytics data' });
    }
});

// Real-time dashboard data
router.get('/dashboard/:schoolId', [
    param('schoolId').isUUID(),
    requireRole(['admin', 'school_admin']),
    requireSchoolAccess
], async (req, res) => {
    try {
        const { schoolId } = req.params;

        // Get real-time metrics for dashboard
        const dashboardData = await query(`
            WITH today_activity AS (
                SELECT 
                    COUNT(DISTINCT sp.enrollment_id) as active_students_today,
                    SUM(sp.time_spent_minutes) FILTER (WHERE sp.last_accessed_at::date = CURRENT_DATE) as study_time_today,
                    COUNT(DISTINCT sp.id) FILTER (WHERE sp.completed_at::date = CURRENT_DATE) as chapters_completed_today
                FROM student_progress sp
                JOIN enrollments e ON sp.enrollment_id = e.id
                JOIN courses c ON e.course_id = c.id
                WHERE c.school_id = $1
            ),
            week_activity AS (
                SELECT 
                    COUNT(DISTINCT cert.id) as certifications_this_week,
                    COUNT(DISTINCT s.id) as assessments_submitted_this_week
                FROM certifications cert
                JOIN users u ON cert.student_id = u.id
                LEFT JOIN submissions s ON u.id = s.student_id AND s.submitted_at >= NOW() - INTERVAL '7 days'
                WHERE u.school_id = $1 AND cert.issued_date >= NOW() - INTERVAL '7 days'
            )
            SELECT 
                (SELECT COUNT(*) FROM users WHERE school_id = $1 AND role = 'student' AND is_active = true) as total_students,
                (SELECT COUNT(*) FROM courses WHERE school_id = $1 AND is_active = true) as active_courses,
                (SELECT COUNT(*) FROM users WHERE school_id = $1 AND role = 'instructor' AND is_active = true) as total_instructors,
                ta.active_students_today,
                ta.study_time_today,
                ta.chapters_completed_today,
                wa.certifications_this_week,
                wa.assessments_submitted_this_week
            FROM today_activity ta, week_activity wa
        `, [schoolId]);

        // Get trending data for charts
        const trendingData = await query(`
            SELECT 
                ua.date,
                ua.active_students,
                ua.modules_accessed,
                ua.assessments_completed,
                ua.total_study_time_minutes
            FROM usage_analytics ua
            WHERE ua.school_id = $1 AND ua.date >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY ua.date DESC
        `, [schoolId]);

        res.json({
            dashboard: dashboardData.rows[0],
            trending: trendingData.rows,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

export default router;