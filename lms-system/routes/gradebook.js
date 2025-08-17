import express from 'express';
import { body, param, query as queryValidator, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { requireRole, requireSchoolAccess } from '../middleware/auth.js';

const router = express.Router();

// Get gradebook for a course (instructor/admin view)
router.get('/course/:courseId', [
    param('courseId').isUUID(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { courseId } = req.params;

        // Verify course access
        const courseCheck = await query(`
            SELECT c.id, c.name, c.school_id 
            FROM courses c 
            WHERE c.id = $1 AND (c.instructor_id = $2 OR $3 = 'admin' OR ($3 = 'school_admin' AND c.school_id = $4))
        `, [courseId, req.user.id, req.user.role, req.user.school_id]);

        if (courseCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this course' });
        }

        // Get full gradebook data
        const gradebookData = await query(`
            SELECT 
                u.id as student_id,
                u.first_name,
                u.last_name,
                u.email,
                e.final_grade,
                e.status as enrollment_status,
                json_agg(
                    json_build_object(
                        'assignment_id', a.id,
                        'assignment_title', a.title,
                        'assignment_type', a.assignment_type,
                        'max_points', a.max_points,
                        'due_date', a.due_date,
                        'points_earned', ge.points_earned,
                        'percentage', ge.percentage,
                        'letter_grade', ge.letter_grade,
                        'submitted_at', ge.submitted_at,
                        'graded_at', ge.graded_at,
                        'is_dropped', ge.is_dropped
                    ) ORDER BY a.created_at
                ) as assignments
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            LEFT JOIN gradebook_entries ge ON e.id = ge.enrollment_id
            LEFT JOIN assignments a ON ge.assignment_id = a.id
            WHERE e.course_id = $1 AND u.is_active = true
            GROUP BY u.id, u.first_name, u.last_name, u.email, e.final_grade, e.status
            ORDER BY u.last_name, u.first_name
        `, [courseId]);

        // Get course statistics
        const stats = await query(`
            SELECT 
                COUNT(DISTINCT e.student_id) as total_students,
                AVG(e.final_grade) as average_grade,
                COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.student_id END) as completed_students,
                COUNT(DISTINCT a.id) as total_assignments
            FROM enrollments e
            LEFT JOIN assignments a ON a.course_id = e.course_id
            WHERE e.course_id = $1
        `, [courseId]);

        res.json({
            course: courseCheck.rows[0],
            students: gradebookData.rows,
            statistics: stats.rows[0]
        });

    } catch (error) {
        console.error('Gradebook fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch gradebook data' });
    }
});

// Get student's own grades
router.get('/student/:studentId?', [
    param('studentId').optional().isUUID(),
    queryValidator('courseId').optional().isUUID()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const studentId = req.params.studentId || req.user.id;
        const { courseId } = req.query;

        // Students can only view their own grades unless they're an instructor/admin
        if (studentId !== req.user.id && !['instructor', 'admin', 'school_admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        let courseFilter = '';
        let queryParams = [studentId];

        if (courseId) {
            courseFilter = 'AND c.id = $2';
            queryParams.push(courseId);
        }

        const gradesData = await query(`
            SELECT 
                c.id as course_id,
                c.name as course_name,
                c.course_code,
                e.final_grade,
                e.status as enrollment_status,
                json_agg(
                    json_build_object(
                        'assignment_id', a.id,
                        'assignment_title', a.title,
                        'assignment_type', a.assignment_type,
                        'max_points', a.max_points,
                        'due_date', a.due_date,
                        'points_earned', ge.points_earned,
                        'percentage', ge.percentage,
                        'letter_grade', ge.letter_grade,
                        'submitted_at', ge.submitted_at,
                        'graded_at', ge.graded_at,
                        'feedback', s.feedback
                    ) ORDER BY a.due_date
                ) FILTER (WHERE a.id IS NOT NULL) as assignments
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN gradebook_entries ge ON e.id = ge.enrollment_id
            LEFT JOIN assignments a ON ge.assignment_id = a.id
            LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
            WHERE e.student_id = $1 ${courseFilter}
            GROUP BY c.id, c.name, c.course_code, e.final_grade, e.status
            ORDER BY c.start_date DESC
        `, queryParams);

        res.json({
            courses: gradesData.rows
        });

    } catch (error) {
        console.error('Student grades fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch student grades' });
    }
});

// Update grade for an assignment
router.put('/grade/:enrollmentId/:assignmentId', [
    param('enrollmentId').isUUID(),
    param('assignmentId').isUUID(),
    body('pointsEarned').isNumeric().isFloat({ min: 0 }),
    body('feedback').optional().isString(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { enrollmentId, assignmentId } = req.params;
        const { pointsEarned, feedback } = req.body;

        // Verify instructor has access to this assignment
        const accessCheck = await query(`
            SELECT a.max_points, c.instructor_id, c.school_id
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            JOIN enrollments e ON e.course_id = c.id
            WHERE a.id = $1 AND e.id = $2
            AND (c.instructor_id = $3 OR $4 = 'admin' OR ($4 = 'school_admin' AND c.school_id = $5))
        `, [assignmentId, enrollmentId, req.user.id, req.user.role, req.user.school_id]);

        if (accessCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to grade this assignment' });
        }

        const assignment = accessCheck.rows[0];
        const maxPoints = assignment.max_points;
        const percentage = (pointsEarned / maxPoints) * 100;
        
        // Calculate letter grade
        let letterGrade = 'F';
        if (percentage >= 90) letterGrade = 'A+';
        else if (percentage >= 85) letterGrade = 'A';
        else if (percentage >= 80) letterGrade = 'A-';
        else if (percentage >= 77) letterGrade = 'B+';
        else if (percentage >= 73) letterGrade = 'B';
        else if (percentage >= 70) letterGrade = 'B-';
        else if (percentage >= 67) letterGrade = 'C+';
        else if (percentage >= 63) letterGrade = 'C';
        else if (percentage >= 60) letterGrade = 'C-';
        else if (percentage >= 50) letterGrade = 'D';

        // Update gradebook entry
        await query(`
            INSERT INTO gradebook_entries (enrollment_id, assignment_id, points_earned, points_possible, percentage, letter_grade, graded_at)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            ON CONFLICT (enrollment_id, assignment_id) 
            DO UPDATE SET 
                points_earned = EXCLUDED.points_earned,
                percentage = EXCLUDED.percentage,
                letter_grade = EXCLUDED.letter_grade,
                graded_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
        `, [enrollmentId, assignmentId, pointsEarned, maxPoints, percentage, letterGrade]);

        // Update submission with feedback
        if (feedback) {
            await query(`
                UPDATE submissions 
                SET feedback = $1, graded_at = CURRENT_TIMESTAMP, graded_by = $2, status = 'graded'
                WHERE assignment_id = $3 AND student_id = (
                    SELECT student_id FROM enrollments WHERE id = $4
                )
            `, [feedback, req.user.id, assignmentId, enrollmentId]);
        }

        // Calculate and update final course grade
        await updateFinalGrade(enrollmentId);

        res.json({
            message: 'Grade updated successfully',
            pointsEarned,
            percentage: percentage.toFixed(2),
            letterGrade
        });

    } catch (error) {
        console.error('Grade update error:', error);
        res.status(500).json({ error: 'Failed to update grade' });
    }
});

// Export gradebook to CSV (D2L compatible format)
router.get('/export/:courseId', [
    param('courseId').isUUID(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const { courseId } = req.params;

        // Verify course access
        const courseCheck = await query(`
            SELECT c.id, c.name, c.course_code 
            FROM courses c 
            WHERE c.id = $1 AND (c.instructor_id = $2 OR $3 = 'admin' OR ($3 = 'school_admin' AND c.school_id = $4))
        `, [courseId, req.user.id, req.user.role, req.user.school_id]);

        if (courseCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this course' });
        }

        // Get D2L Brightspace compatible gradebook export
        const exportData = await query(`
            SELECT 
                u.email as "Username",
                u.last_name as "Last Name",
                u.first_name as "First Name",
                u.email as "Email",
                e.final_grade as "Final Grade",
                string_agg(
                    a.title || ': ' || COALESCE(ge.points_earned::text, 'Not Graded'), 
                    ', ' ORDER BY a.created_at
                ) as "Assignment Grades"
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            LEFT JOIN gradebook_entries ge ON e.id = ge.enrollment_id
            LEFT JOIN assignments a ON ge.assignment_id = a.id
            WHERE e.course_id = $1 AND u.is_active = true
            GROUP BY u.id, u.email, u.last_name, u.first_name, e.final_grade
            ORDER BY u.last_name, u.first_name
        `, [courseId]);

        // Convert to CSV format
        const course = courseCheck.rows[0];
        const headers = Object.keys(exportData.rows[0] || {});
        const csvContent = [
            headers.join(','),
            ...exportData.rows.map(row => 
                headers.map(header => `"${row[header] || ''}"`).join(',')
            )
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${course.course_code}_gradebook_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);

    } catch (error) {
        console.error('Gradebook export error:', error);
        res.status(500).json({ error: 'Failed to export gradebook' });
    }
});

// Get assignment statistics
router.get('/assignment/:assignmentId/stats', [
    param('assignmentId').isUUID(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const { assignmentId } = req.params;

        // Verify access to assignment
        const accessCheck = await query(`
            SELECT a.id, a.title, a.max_points, c.instructor_id, c.school_id
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            WHERE a.id = $1 
            AND (c.instructor_id = $2 OR $3 = 'admin' OR ($3 = 'school_admin' AND c.school_id = $4))
        `, [assignmentId, req.user.id, req.user.role, req.user.school_id]);

        if (accessCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this assignment' });
        }

        // Get assignment statistics
        const stats = await query(`
            SELECT 
                COUNT(*) as total_submissions,
                AVG(ge.points_earned) as average_score,
                MAX(ge.points_earned) as highest_score,
                MIN(ge.points_earned) as lowest_score,
                STDDEV(ge.points_earned) as standard_deviation,
                COUNT(CASE WHEN ge.percentage >= 70 THEN 1 END) as passing_count,
                COUNT(CASE WHEN ge.percentage < 70 THEN 1 END) as failing_count,
                a.max_points
            FROM assignments a
            LEFT JOIN gradebook_entries ge ON a.id = ge.assignment_id
            WHERE a.id = $1
            GROUP BY a.id, a.max_points
        `, [assignmentId]);

        // Get grade distribution
        const distribution = await query(`
            SELECT 
                CASE 
                    WHEN ge.percentage >= 90 THEN 'A'
                    WHEN ge.percentage >= 80 THEN 'B' 
                    WHEN ge.percentage >= 70 THEN 'C'
                    WHEN ge.percentage >= 60 THEN 'D'
                    ELSE 'F'
                END as grade_band,
                COUNT(*) as count
            FROM gradebook_entries ge
            WHERE ge.assignment_id = $1
            GROUP BY grade_band
            ORDER BY grade_band
        `, [assignmentId]);

        res.json({
            assignment: accessCheck.rows[0],
            statistics: stats.rows[0],
            gradeDistribution: distribution.rows
        });

    } catch (error) {
        console.error('Assignment stats error:', error);
        res.status(500).json({ error: 'Failed to fetch assignment statistics' });
    }
});

// Bulk grade update for multiple students
router.post('/bulk-grade', [
    body('grades').isArray(),
    body('grades.*.enrollmentId').isUUID(),
    body('grades.*.assignmentId').isUUID(),
    body('grades.*.pointsEarned').isNumeric(),
    body('grades.*.feedback').optional().isString(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { grades } = req.body;
        const results = [];

        // Process each grade update
        for (const gradeUpdate of grades) {
            try {
                const { enrollmentId, assignmentId, pointsEarned, feedback } = gradeUpdate;

                // Verify access to assignment
                const accessCheck = await query(`
                    SELECT a.max_points, c.instructor_id, c.school_id
                    FROM assignments a
                    JOIN courses c ON a.course_id = c.id
                    JOIN enrollments e ON e.course_id = c.id
                    WHERE a.id = $1 AND e.id = $2
                    AND (c.instructor_id = $3 OR $4 = 'admin' OR ($4 = 'school_admin' AND c.school_id = $5))
                `, [assignmentId, enrollmentId, req.user.id, req.user.role, req.user.school_id]);

                if (accessCheck.rows.length === 0) {
                    results.push({ enrollmentId, assignmentId, success: false, error: 'Access denied' });
                    continue;
                }

                const maxPoints = accessCheck.rows[0].max_points;
                const percentage = (pointsEarned / maxPoints) * 100;
                
                // Calculate letter grade (same logic as individual grade update)
                let letterGrade = 'F';
                if (percentage >= 90) letterGrade = 'A+';
                else if (percentage >= 85) letterGrade = 'A';
                else if (percentage >= 80) letterGrade = 'A-';
                else if (percentage >= 77) letterGrade = 'B+';
                else if (percentage >= 73) letterGrade = 'B';
                else if (percentage >= 70) letterGrade = 'B-';
                else if (percentage >= 67) letterGrade = 'C+';
                else if (percentage >= 63) letterGrade = 'C';
                else if (percentage >= 60) letterGrade = 'C-';
                else if (percentage >= 50) letterGrade = 'D';

                // Update gradebook entry
                await query(`
                    INSERT INTO gradebook_entries (enrollment_id, assignment_id, points_earned, points_possible, percentage, letter_grade, graded_at)
                    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                    ON CONFLICT (enrollment_id, assignment_id) 
                    DO UPDATE SET 
                        points_earned = EXCLUDED.points_earned,
                        percentage = EXCLUDED.percentage,
                        letter_grade = EXCLUDED.letter_grade,
                        graded_at = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                `, [enrollmentId, assignmentId, pointsEarned, maxPoints, percentage, letterGrade]);

                // Update submission feedback if provided
                if (feedback) {
                    await query(`
                        UPDATE submissions 
                        SET feedback = $1, graded_at = CURRENT_TIMESTAMP, graded_by = $2, status = 'graded'
                        WHERE assignment_id = $3 AND student_id = (
                            SELECT student_id FROM enrollments WHERE id = $4
                        )
                    `, [feedback, req.user.id, assignmentId, enrollmentId]);
                }

                // Update final grade
                await updateFinalGrade(enrollmentId);

                results.push({ 
                    enrollmentId, 
                    assignmentId, 
                    success: true, 
                    pointsEarned, 
                    percentage: percentage.toFixed(2),
                    letterGrade 
                });

            } catch (error) {
                console.error('Individual grade update error:', error);
                results.push({ enrollmentId, assignmentId, success: false, error: error.message });
            }
        }

        res.json({
            message: 'Bulk grade update completed',
            results,
            successCount: results.filter(r => r.success).length,
            failureCount: results.filter(r => !r.success).length
        });

    } catch (error) {
        console.error('Bulk grade update error:', error);
        res.status(500).json({ error: 'Failed to update grades' });
    }
});

// Helper function to calculate final course grade
async function updateFinalGrade(enrollmentId) {
    try {
        const gradeCalc = await query(`
            SELECT AVG(ge.percentage) as final_percentage
            FROM gradebook_entries ge
            WHERE ge.enrollment_id = $1 AND NOT ge.is_dropped
        `, [enrollmentId]);

        const finalPercentage = gradeCalc.rows[0]?.final_percentage;
        
        if (finalPercentage !== null) {
            await query(`
                UPDATE enrollments 
                SET final_grade = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [parseFloat(finalPercentage).toFixed(2), enrollmentId]);
        }
    } catch (error) {
        console.error('Final grade calculation error:', error);
    }
}

export default router;