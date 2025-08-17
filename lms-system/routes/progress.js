import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Update student progress for a chapter
router.post('/chapter/:chapterId', [
    param('chapterId').isUUID(),
    body('completionPercentage').isFloat({ min: 0, max: 100 }),
    body('timeSpentMinutes').optional().isInt({ min: 0 }),
    body('completed').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { chapterId } = req.params;
        const { completionPercentage, timeSpentMinutes = 0, completed = false } = req.body;

        // Get student's enrollment ID for this chapter
        const enrollmentCheck = await query(`
            SELECT sp.id as progress_id, e.id as enrollment_id, ch.title, u.title as unit_title
            FROM chapters ch
            JOIN units u ON ch.unit_id = u.id
            JOIN courses c ON u.program_id = c.program_id
            JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN student_progress sp ON ch.id = sp.chapter_id AND e.id = sp.enrollment_id
            WHERE ch.id = $1 AND e.student_id = $2 AND e.status = 'active'
        `, [chapterId, req.user.id]);

        if (enrollmentCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Chapter not found or not enrolled' });
        }

        const { progress_id, enrollment_id } = enrollmentCheck.rows[0];

        // Update or create progress record
        if (progress_id) {
            await query(`
                UPDATE student_progress 
                SET 
                    completion_percentage = GREATEST(completion_percentage, $1),
                    time_spent_minutes = time_spent_minutes + $2,
                    completed_at = CASE WHEN $3 = true THEN CURRENT_TIMESTAMP ELSE completed_at END,
                    last_accessed_at = CURRENT_TIMESTAMP
                WHERE id = $4
            `, [completionPercentage, timeSpentMinutes, completed, progress_id]);
        } else {
            await query(`
                INSERT INTO student_progress (enrollment_id, chapter_id, completion_percentage, time_spent_minutes, completed_at, started_at, last_accessed_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [
                enrollment_id, 
                chapterId, 
                completionPercentage, 
                timeSpentMinutes, 
                completed ? new Date() : null
            ]);
        }

        // Track xAPI activity
        await query(`
            INSERT INTO learning_activities (student_id, course_id, activity_type, object_id, verb, result_data, context_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            req.user.id,
            enrollmentCheck.rows[0].course_id,
            completed ? 'completed' : 'experienced',
            `chapter-${chapterId}`,
            completed ? 'completed' : 'experienced',
            JSON.stringify({
                completion: completed,
                progress: completionPercentage,
                duration: `PT${timeSpentMinutes}M`
            }),
            JSON.stringify({
                instructor: enrollmentCheck.rows[0].instructor_id,
                chapter: enrollmentCheck.rows[0].title,
                unit: enrollmentCheck.rows[0].unit_title
            })
        ]);

        res.json({
            message: 'Progress updated successfully',
            chapterId,
            completionPercentage,
            timeSpentMinutes,
            completed
        });

    } catch (error) {
        console.error('Progress update error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Get student progress overview
router.get('/student/:studentId?/course/:courseId', [
    param('studentId').optional().isUUID(),
    param('courseId').isUUID()
], async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.id;
        const { courseId } = req.params;

        // Students can only view their own progress unless user is instructor/admin
        if (studentId !== req.user.id && !['instructor', 'admin', 'school_admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Verify course access
        const enrollmentCheck = await query(`
            SELECT e.id as enrollment_id, c.name as course_name, p.name as program_name
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            JOIN programs p ON c.program_id = p.id
            WHERE e.course_id = $1 AND e.student_id = $2
        `, [courseId, studentId]);

        if (enrollmentCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        // Get detailed progress by unit and chapter
        const progressData = await query(`
            SELECT 
                u.id as unit_id,
                u.unit_number,
                u.title as unit_title,
                u.estimated_hours,
                json_agg(
                    json_build_object(
                        'chapter_id', ch.id,
                        'chapter_number', ch.chapter_number,
                        'title', ch.title,
                        'estimated_minutes', ch.estimated_minutes,
                        'completion_percentage', COALESCE(sp.completion_percentage, 0),
                        'time_spent_minutes', COALESCE(sp.time_spent_minutes, 0),
                        'completed', CASE WHEN sp.completed_at IS NOT NULL THEN true ELSE false END,
                        'started', CASE WHEN sp.started_at IS NOT NULL THEN true ELSE false END,
                        'last_accessed', sp.last_accessed_at
                    ) ORDER BY ch.order_index
                ) as chapters,
                AVG(COALESCE(sp.completion_percentage, 0)) as unit_progress,
                SUM(COALESCE(sp.time_spent_minutes, 0)) as unit_time_spent
            FROM units u
            JOIN chapters ch ON u.id = ch.unit_id
            LEFT JOIN student_progress sp ON ch.id = sp.chapter_id AND sp.enrollment_id = $1
            WHERE u.program_id = (SELECT program_id FROM courses WHERE id = $2)
            AND u.is_active = true AND ch.is_active = true
            GROUP BY u.id, u.unit_number, u.title, u.estimated_hours
            ORDER BY u.order_index
        `, [enrollmentCheck.rows[0].enrollment_id, courseId]);

        // Get overall course statistics
        const overallStats = await query(`
            SELECT 
                COUNT(ch.id) as total_chapters,
                COUNT(CASE WHEN sp.completed_at IS NOT NULL THEN 1 END) as completed_chapters,
                AVG(COALESCE(sp.completion_percentage, 0)) as overall_progress,
                SUM(COALESCE(sp.time_spent_minutes, 0)) as total_time_spent,
                MIN(sp.started_at) as course_started,
                MAX(sp.last_accessed_at) as last_activity
            FROM units u
            JOIN chapters ch ON u.id = ch.unit_id
            LEFT JOIN student_progress sp ON ch.id = sp.chapter_id AND sp.enrollment_id = $1
            WHERE u.program_id = (SELECT program_id FROM courses WHERE id = $2)
            AND u.is_active = true AND ch.is_active = true
        `, [enrollmentCheck.rows[0].enrollment_id, courseId]);

        res.json({
            course: enrollmentCheck.rows[0],
            progress: progressData.rows,
            statistics: overallStats.rows[0]
        });

    } catch (error) {
        console.error('Progress fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch progress data' });
    }
});

// Mark chapter as started
router.post('/chapter/:chapterId/start', [
    param('chapterId').isUUID()
], async (req, res) => {
    try {
        const { chapterId } = req.params;

        // Get enrollment for this chapter
        const enrollmentCheck = await query(`
            SELECT e.id as enrollment_id
            FROM chapters ch
            JOIN units u ON ch.unit_id = u.id
            JOIN courses c ON u.program_id = c.program_id
            JOIN enrollments e ON c.id = e.course_id
            WHERE ch.id = $1 AND e.student_id = $2 AND e.status = 'active'
        `, [chapterId, req.user.id]);

        if (enrollmentCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Chapter not found or not enrolled' });
        }

        // Update or create progress record with started timestamp
        await query(`
            INSERT INTO student_progress (enrollment_id, chapter_id, started_at, last_accessed_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (enrollment_id, chapter_id) 
            DO UPDATE SET 
                started_at = COALESCE(student_progress.started_at, CURRENT_TIMESTAMP),
                last_accessed_at = CURRENT_TIMESTAMP
        `, [enrollmentCheck.rows[0].enrollment_id, chapterId]);

        res.json({
            message: 'Chapter started successfully',
            chapterId,
            startedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chapter start error:', error);
        res.status(500).json({ error: 'Failed to start chapter' });
    }
});

// Get learning path recommendations
router.get('/recommendations/:courseId', [
    param('courseId').isUUID()
], async (req, res) => {
    try {
        const { courseId } = req.params;

        // Get student's current progress
        const progress = await query(`
            SELECT 
                u.unit_number,
                u.title as unit_title,
                ch.chapter_number,
                ch.title as chapter_title,
                ch.id as chapter_id,
                COALESCE(sp.completion_percentage, 0) as progress,
                CASE WHEN sp.completed_at IS NOT NULL THEN true ELSE false END as completed
            FROM units u
            JOIN chapters ch ON u.id = ch.unit_id
            LEFT JOIN student_progress sp ON ch.id = sp.chapter_id 
                AND sp.enrollment_id = (
                    SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2
                )
            WHERE u.program_id = (SELECT program_id FROM courses WHERE id = $1)
            AND u.is_active = true AND ch.is_active = true
            ORDER BY u.order_index, ch.order_index
        `, [courseId, req.user.id]);

        // Find next recommended chapters
        const recommendations = [];
        const progressData = progress.rows;

        for (let i = 0; i < progressData.length; i++) {
            const current = progressData[i];
            
            if (!current.completed && current.progress < 100) {
                recommendations.push({
                    type: 'continue',
                    priority: 'high',
                    chapter: current,
                    reason: current.progress > 0 ? 'Continue your current chapter' : 'Start your next required chapter'
                });
                break;
            }
        }

        // Find chapters that need review (low scores on related assessments)
        const reviewNeeded = await query(`
            SELECT 
                ch.id as chapter_id,
                ch.title as chapter_title,
                u.title as unit_title,
                AVG(ge.percentage) as average_score
            FROM chapters ch
            JOIN units u ON ch.unit_id = u.id
            JOIN assignments a ON u.id = a.unit_id
            JOIN gradebook_entries ge ON a.id = ge.assignment_id
            JOIN enrollments e ON ge.enrollment_id = e.id
            WHERE e.course_id = $1 AND e.student_id = $2
            AND ge.percentage < 75
            GROUP BY ch.id, ch.title, u.title
            ORDER BY AVG(ge.percentage) ASC
            LIMIT 3
        `, [courseId, req.user.id]);

        reviewNeeded.rows.forEach(chapter => {
            recommendations.push({
                type: 'review',
                priority: 'medium',
                chapter,
                reason: `Review recommended - average score: ${chapter.average_score.toFixed(1)}%`
            });
        });

        res.json({
            recommendations,
            overallProgress: {
                totalChapters: progressData.length,
                completedChapters: progressData.filter(ch => ch.completed).length,
                inProgressChapters: progressData.filter(ch => ch.progress > 0 && !ch.completed).length
            }
        });

    } catch (error) {
        console.error('Recommendations fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// Bulk progress update for instructors (manual override)
router.post('/bulk-update', [
    body('updates').isArray(),
    body('updates.*.studentId').isUUID(),
    body('updates.*.chapterId').isUUID(),
    body('updates.*.completionPercentage').isFloat({ min: 0, max: 100 }),
    body('updates.*.completed').optional().isBoolean(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { updates } = req.body;
        const results = [];

        for (const update of updates) {
            try {
                const { studentId, chapterId, completionPercentage, completed } = update;

                // Verify instructor has access to this student's course
                const accessCheck = await query(`
                    SELECT e.id as enrollment_id, c.instructor_id, c.school_id
                    FROM enrollments e
                    JOIN courses c ON e.course_id = c.id
                    JOIN units u ON c.program_id = u.program_id
                    JOIN chapters ch ON u.id = ch.unit_id
                    WHERE ch.id = $1 AND e.student_id = $2
                    AND (c.instructor_id = $3 OR $4 = 'admin' OR ($4 = 'school_admin' AND c.school_id = $5))
                `, [chapterId, studentId, req.user.id, req.user.role, req.user.school_id]);

                if (accessCheck.rows.length === 0) {
                    results.push({ studentId, chapterId, success: false, error: 'Access denied' });
                    continue;
                }

                const enrollmentId = accessCheck.rows[0].enrollment_id;

                // Update progress
                await query(`
                    INSERT INTO student_progress (enrollment_id, chapter_id, completion_percentage, completed_at, started_at, last_accessed_at)
                    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT (enrollment_id, chapter_id) 
                    DO UPDATE SET 
                        completion_percentage = GREATEST(student_progress.completion_percentage, $3),
                        completed_at = CASE WHEN $4 IS NOT NULL THEN $4 ELSE student_progress.completed_at END,
                        started_at = COALESCE(student_progress.started_at, CURRENT_TIMESTAMP),
                        last_accessed_at = CURRENT_TIMESTAMP
                `, [enrollmentId, chapterId, completionPercentage, completed ? new Date() : null]);

                results.push({ studentId, chapterId, success: true });

            } catch (error) {
                results.push({ studentId, chapterId, success: false, error: error.message });
            }
        }

        res.json({
            message: 'Bulk progress update completed',
            results,
            successCount: results.filter(r => r.success).length,
            failureCount: results.filter(r => !r.success).length
        });

    } catch (error) {
        console.error('Bulk progress update error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Get class progress overview (instructor view)
router.get('/class/:courseId', [
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

        // Get class progress summary
        const classProgress = await query(`
            SELECT 
                u.first_name,
                u.last_name,
                u.email,
                COUNT(ch.id) as total_chapters,
                COUNT(CASE WHEN sp.completed_at IS NOT NULL THEN 1 END) as completed_chapters,
                AVG(COALESCE(sp.completion_percentage, 0)) as overall_progress,
                SUM(COALESCE(sp.time_spent_minutes, 0)) as total_time_spent,
                MAX(sp.last_accessed_at) as last_activity,
                e.final_grade,
                e.status as enrollment_status
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
            JOIN units un ON c.program_id = un.program_id
            JOIN chapters ch ON un.id = ch.unit_id
            LEFT JOIN student_progress sp ON ch.id = sp.chapter_id AND e.id = sp.enrollment_id
            WHERE e.course_id = $1 AND u.is_active = true
            GROUP BY u.id, u.first_name, u.last_name, u.email, e.final_grade, e.status
            ORDER BY overall_progress DESC, u.last_name, u.first_name
        `, [courseId]);

        // Get unit-by-unit class progress
        const unitProgress = await query(`
            SELECT 
                u.unit_number,
                u.title as unit_title,
                COUNT(DISTINCT e.student_id) as total_students,
                COUNT(CASE WHEN sp.completed_at IS NOT NULL THEN 1 END) as students_completed,
                AVG(COALESCE(sp.completion_percentage, 0)) as average_progress
            FROM units u
            JOIN chapters ch ON u.id = ch.unit_id
            JOIN courses c ON u.program_id = c.program_id
            JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN student_progress sp ON ch.id = sp.chapter_id AND e.id = sp.enrollment_id
            WHERE c.id = $1 AND u.is_active = true AND ch.is_active = true
            GROUP BY u.id, u.unit_number, u.title
            ORDER BY u.order_index
        `, [courseId]);

        res.json({
            studentProgress: classProgress.rows,
            unitProgress: unitProgress.rows,
            summary: {
                totalStudents: classProgress.rows.length,
                averageProgress: classProgress.rows.reduce((sum, student) => sum + parseFloat(student.overall_progress), 0) / classProgress.rows.length || 0,
                totalTimeSpent: classProgress.rows.reduce((sum, student) => sum + parseInt(student.total_time_spent), 0)
            }
        });

    } catch (error) {
        console.error('Class progress fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch class progress' });
    }
});

// Export progress report (CSV format for D2L compatibility)
router.get('/export/:courseId', [
    param('courseId').isUUID(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const { courseId } = req.params;

        // Verify course access
        const courseCheck = await query(`
            SELECT c.name, c.course_code FROM courses c
            WHERE c.id = $1 AND (c.instructor_id = $2 OR $3 = 'admin' OR ($3 = 'school_admin' AND c.school_id = $4))
        `, [courseId, req.user.id, req.user.role, req.user.school_id]);

        if (courseCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this course' });
        }

        // Get progress export data
        const exportData = await query(`
            SELECT 
                u.email as "Student Email",
                u.last_name as "Last Name",
                u.first_name as "First Name",
                COUNT(ch.id) as "Total Chapters",
                COUNT(CASE WHEN sp.completed_at IS NOT NULL THEN 1 END) as "Completed Chapters",
                ROUND(AVG(COALESCE(sp.completion_percentage, 0)), 2) as "Overall Progress %",
                SUM(COALESCE(sp.time_spent_minutes, 0)) as "Total Time (Minutes)",
                e.final_grade as "Final Grade",
                e.status as "Enrollment Status"
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
            JOIN units un ON c.program_id = un.program_id
            JOIN chapters ch ON un.id = ch.unit_id
            LEFT JOIN student_progress sp ON ch.id = sp.chapter_id AND e.id = sp.enrollment_id
            WHERE e.course_id = $1 AND u.is_active = true
            GROUP BY u.id, u.email, u.last_name, u.first_name, e.final_grade, e.status
            ORDER BY u.last_name, u.first_name
        `, [courseId]);

        // Convert to CSV
        const course = courseCheck.rows[0];
        const headers = Object.keys(exportData.rows[0] || {});
        const csvContent = [
            headers.join(','),
            ...exportData.rows.map(row => 
                headers.map(header => `"${row[header] || ''}"`).join(',')
            )
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${course.course_code}_progress_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);

    } catch (error) {
        console.error('Progress export error:', error);
        res.status(500).json({ error: 'Failed to export progress data' });
    }
});

export default router;