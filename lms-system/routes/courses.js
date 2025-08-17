import express from 'express';
import { body, param, query as queryValidator, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { requireRole, requireSchoolAccess } from '../middleware/auth.js';

const router = express.Router();

// Get all courses for user (student sees enrolled courses, instructor sees teaching courses)
router.get('/', async (req, res) => {
    try {
        let coursesQuery;
        let queryParams;

        if (req.user.role === 'student') {
            coursesQuery = `
                SELECT 
                    c.id, c.name, c.course_code, c.start_date, c.end_date,
                    p.name as program_name, p.code as program_code,
                    u.first_name as instructor_first_name, u.last_name as instructor_last_name,
                    e.final_grade, e.status as enrollment_status,
                    COUNT(sp.id) as total_chapters,
                    COUNT(CASE WHEN sp.completed_at IS NOT NULL THEN 1 END) as completed_chapters
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                JOIN programs p ON c.program_id = p.id
                LEFT JOIN users u ON c.instructor_id = u.id
                LEFT JOIN units un ON p.id = un.program_id
                LEFT JOIN chapters ch ON un.id = ch.unit_id
                LEFT JOIN student_progress sp ON ch.id = sp.chapter_id AND sp.enrollment_id = e.id
                WHERE e.student_id = $1 AND c.is_active = true
                GROUP BY c.id, c.name, c.course_code, c.start_date, c.end_date, p.name, p.code, u.first_name, u.last_name, e.final_grade, e.status
                ORDER BY c.start_date DESC
            `;
            queryParams = [req.user.id];
        } else if (req.user.role === 'instructor') {
            coursesQuery = `
                SELECT 
                    c.id, c.name, c.course_code, c.start_date, c.end_date,
                    p.name as program_name, p.code as program_code,
                    COUNT(DISTINCT e.student_id) as enrolled_students,
                    COUNT(DISTINCT a.id) as total_assignments,
                    AVG(e.final_grade) as class_average
                FROM courses c
                JOIN programs p ON c.program_id = p.id
                LEFT JOIN enrollments e ON c.id = e.course_id
                LEFT JOIN assignments a ON c.id = a.course_id
                WHERE c.instructor_id = $1 AND c.is_active = true
                GROUP BY c.id, c.name, c.course_code, c.start_date, c.end_date, p.name, p.code
                ORDER BY c.start_date DESC
            `;
            queryParams = [req.user.id];
        } else {
            // Admin/school_admin sees all courses for their school
            coursesQuery = `
                SELECT 
                    c.id, c.name, c.course_code, c.start_date, c.end_date,
                    p.name as program_name, p.code as program_code,
                    u.first_name as instructor_first_name, u.last_name as instructor_last_name,
                    COUNT(DISTINCT e.student_id) as enrolled_students,
                    COUNT(DISTINCT a.id) as total_assignments,
                    AVG(e.final_grade) as class_average
                FROM courses c
                JOIN programs p ON c.program_id = p.id
                LEFT JOIN users u ON c.instructor_id = u.id
                LEFT JOIN enrollments e ON c.id = e.course_id
                LEFT JOIN assignments a ON c.id = a.course_id
                WHERE ($1 = 'admin' OR c.school_id = $2) AND c.is_active = true
                GROUP BY c.id, c.name, c.course_code, c.start_date, c.end_date, p.name, p.code, u.first_name, u.last_name
                ORDER BY c.start_date DESC
            `;
            queryParams = [req.user.role, req.user.school_id];
        }

        const courses = await query(coursesQuery, queryParams);

        res.json({
            courses: courses.rows
        });

    } catch (error) {
        console.error('Courses fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Get detailed course information
router.get('/:courseId', [
    param('courseId').isUUID()
], async (req, res) => {
    try {
        const { courseId } = req.params;

        // Get course details with access control
        let accessQuery;
        let queryParams;

        if (req.user.role === 'student') {
            accessQuery = `
                SELECT c.*, p.name as program_name, p.code as program_code,
                       u.first_name as instructor_first_name, u.last_name as instructor_last_name,
                       e.final_grade, e.status as enrollment_status
                FROM courses c
                JOIN programs p ON c.program_id = p.id
                LEFT JOIN users u ON c.instructor_id = u.id
                JOIN enrollments e ON c.id = e.course_id
                WHERE c.id = $1 AND e.student_id = $2 AND c.is_active = true
            `;
            queryParams = [courseId, req.user.id];
        } else {
            accessQuery = `
                SELECT c.*, p.name as program_name, p.code as program_code,
                       u.first_name as instructor_first_name, u.last_name as instructor_last_name
                FROM courses c
                JOIN programs p ON c.program_id = p.id
                LEFT JOIN users u ON c.instructor_id = u.id
                WHERE c.id = $1 AND (c.instructor_id = $2 OR $3 = 'admin' OR ($3 = 'school_admin' AND c.school_id = $4))
                AND c.is_active = true
            `;
            queryParams = [courseId, req.user.id, req.user.role, req.user.school_id];
        }

        const course = await query(accessQuery, queryParams);

        if (course.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found or access denied' });
        }

        // Get course curriculum (units and chapters)
        const curriculum = await query(`
            SELECT 
                u.id as unit_id, u.unit_number, u.title as unit_title, u.description as unit_description,
                u.estimated_hours, u.learning_objectives,
                json_agg(
                    json_build_object(
                        'id', ch.id,
                        'chapter_number', ch.chapter_number,
                        'title', ch.title,
                        'content_file_path', ch.content_file_path,
                        'estimated_minutes', ch.estimated_minutes,
                        'completed', CASE WHEN sp.completed_at IS NOT NULL THEN true ELSE false END,
                        'progress_percentage', COALESCE(sp.completion_percentage, 0)
                    ) ORDER BY ch.order_index
                ) FILTER (WHERE ch.id IS NOT NULL) as chapters
            FROM units u
            LEFT JOIN chapters ch ON u.id = ch.unit_id AND ch.is_active = true
            LEFT JOIN student_progress sp ON ch.id = sp.chapter_id 
                AND sp.enrollment_id = (
                    SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2
                )
            WHERE u.program_id = (SELECT program_id FROM courses WHERE id = $1)
            AND u.is_active = true
            GROUP BY u.id, u.unit_number, u.title, u.description, u.estimated_hours, u.learning_objectives
            ORDER BY u.order_index
        `, [courseId, req.user.id]);

        // Get course assignments
        const assignments = await query(`
            SELECT 
                a.id, a.title, a.description, a.assignment_type, a.max_points,
                a.due_date, a.attempts_allowed, a.time_limit_minutes,
                ge.points_earned, ge.percentage, ge.letter_grade, ge.graded_at,
                s.submitted_at, s.status as submission_status
            FROM assignments a
            LEFT JOIN gradebook_entries ge ON a.id = ge.assignment_id 
                AND ge.enrollment_id = (
                    SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2
                )
            LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $2
            WHERE a.course_id = $1 AND a.is_active = true
            ORDER BY a.due_date ASC
        `, [courseId, req.user.id]);

        res.json({
            course: course.rows[0],
            curriculum: curriculum.rows,
            assignments: assignments.rows
        });

    } catch (error) {
        console.error('Course detail fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch course details' });
    }
});

// Create new course (instructor/admin only)
router.post('/', [
    body('name').isLength({ min: 1 }).trim(),
    body('courseCode').isLength({ min: 1 }).trim(),
    body('programId').isUUID(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('enrollmentLimit').optional().isInt({ min: 1, max: 200 }),
    requireRole(['instructor', 'admin', 'school_admin']),
    requireSchoolAccess
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { 
            name, 
            courseCode, 
            programId, 
            startDate, 
            endDate, 
            enrollmentLimit = 30,
            semester
        } = req.body;

        // Verify program exists
        const program = await query('SELECT id, name FROM programs WHERE id = $1', [programId]);
        if (program.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid program ID' });
        }

        // Create course
        const newCourse = await query(`
            INSERT INTO courses (
                program_id, school_id, instructor_id, name, course_code, 
                semester, start_date, end_date, enrollment_limit
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            programId, 
            req.user.school_id, 
            req.user.id, 
            name, 
            courseCode, 
            semester,
            startDate, 
            endDate, 
            enrollmentLimit
        ]);

        res.status(201).json({
            message: 'Course created successfully',
            course: newCourse.rows[0]
        });

    } catch (error) {
        console.error('Course creation error:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
});

// Enroll student in course
router.post('/:courseId/enroll', [
    param('courseId').isUUID(),
    body('studentId').optional().isUUID(),
    body('studentEmail').optional().isEmail()
], async (req, res) => {
    try {
        const { courseId } = req.params;
        const { studentId, studentEmail } = req.body;

        // Students can self-enroll, instructors can enroll others
        let targetStudentId = studentId || req.user.id;

        if (studentEmail && ['instructor', 'admin', 'school_admin'].includes(req.user.role)) {
            // Find student by email
            const student = await query(
                'SELECT id FROM users WHERE email = $1 AND role = $2 AND school_id = $3',
                [studentEmail, 'student', req.user.school_id]
            );
            
            if (student.rows.length === 0) {
                return res.status(404).json({ error: 'Student not found' });
            }
            
            targetStudentId = student.rows[0].id;
        }

        // Verify course exists and has capacity
        const course = await query(`
            SELECT c.*, COUNT(e.id) as current_enrollment
            FROM courses c
            LEFT JOIN enrollments e ON c.id = e.course_id
            WHERE c.id = $1 AND c.is_active = true
            AND ($2 = 'admin' OR c.school_id = $3)
            GROUP BY c.id
        `, [courseId, req.user.role, req.user.school_id]);

        if (course.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found or access denied' });
        }

        const courseData = course.rows[0];
        
        if (courseData.current_enrollment >= courseData.enrollment_limit) {
            return res.status(400).json({ error: 'Course is at capacity' });
        }

        // Create enrollment
        const enrollment = await query(`
            INSERT INTO enrollments (student_id, course_id)
            VALUES ($1, $2)
            ON CONFLICT (student_id, course_id) DO NOTHING
            RETURNING *
        `, [targetStudentId, courseId]);

        if (enrollment.rows.length === 0) {
            return res.status(409).json({ error: 'Student already enrolled in course' });
        }

        // Initialize progress tracking for all chapters
        await query(`
            INSERT INTO student_progress (enrollment_id, chapter_id)
            SELECT $1, ch.id
            FROM units u
            JOIN chapters ch ON u.id = ch.unit_id
            WHERE u.program_id = $2 AND u.is_active = true AND ch.is_active = true
            ON CONFLICT (enrollment_id, chapter_id) DO NOTHING
        `, [enrollment.rows[0].id, courseData.program_id]);

        res.status(201).json({
            message: 'Enrollment successful',
            enrollment: enrollment.rows[0]
        });

    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ error: 'Failed to enroll student' });
    }
});

// Get course roster (instructor/admin only)
router.get('/:courseId/roster', [
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

        const roster = await query(`
            SELECT 
                u.id, u.first_name, u.last_name, u.email,
                e.enrollment_date, e.final_grade, e.status,
                COUNT(sp.id) as total_chapters,
                COUNT(CASE WHEN sp.completed_at IS NOT NULL THEN 1 END) as completed_chapters,
                ROUND(AVG(sp.completion_percentage), 2) as overall_progress,
                MAX(sp.last_accessed_at) as last_activity
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            LEFT JOIN student_progress sp ON e.id = sp.enrollment_id
            WHERE e.course_id = $1 AND u.is_active = true
            GROUP BY u.id, u.first_name, u.last_name, u.email, e.enrollment_date, e.final_grade, e.status
            ORDER BY u.last_name, u.first_name
        `, [courseId]);

        res.json({
            students: roster.rows
        });

    } catch (error) {
        console.error('Roster fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch course roster' });
    }
});

// Get course assignments
router.get('/:courseId/assignments', [
    param('courseId').isUUID()
], async (req, res) => {
    try {
        const { courseId } = req.params;

        // Verify course access
        let accessQuery;
        let queryParams;

        if (req.user.role === 'student') {
            accessQuery = `
                SELECT c.id FROM courses c
                JOIN enrollments e ON c.id = e.course_id
                WHERE c.id = $1 AND e.student_id = $2
            `;
            queryParams = [courseId, req.user.id];
        } else {
            accessQuery = `
                SELECT id FROM courses 
                WHERE id = $1 AND (instructor_id = $2 OR $3 = 'admin' OR ($3 = 'school_admin' AND school_id = $4))
            `;
            queryParams = [courseId, req.user.id, req.user.role, req.user.school_id];
        }

        const courseCheck = await query(accessQuery, queryParams);
        if (courseCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this course' });
        }

        // Get assignments with submission status for student
        let assignmentsQuery;
        if (req.user.role === 'student') {
            assignmentsQuery = `
                SELECT 
                    a.id, a.title, a.description, a.assignment_type, a.max_points,
                    a.due_date, a.attempts_allowed, a.time_limit_minutes,
                    s.submitted_at, s.status as submission_status, s.attempt_number,
                    ge.points_earned, ge.percentage, ge.letter_grade, ge.graded_at
                FROM assignments a
                LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $2
                LEFT JOIN gradebook_entries ge ON a.id = ge.assignment_id 
                    AND ge.enrollment_id = (
                        SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2
                    )
                WHERE a.course_id = $1 AND a.is_active = true
                ORDER BY a.due_date ASC, a.created_at ASC
            `;
            queryParams = [courseId, req.user.id];
        } else {
            assignmentsQuery = `
                SELECT 
                    a.id, a.title, a.description, a.assignment_type, a.max_points,
                    a.due_date, a.attempts_allowed, a.time_limit_minutes,
                    COUNT(s.id) as total_submissions,
                    COUNT(CASE WHEN s.status = 'graded' THEN 1 END) as graded_submissions,
                    AVG(ge.points_earned) as average_score
                FROM assignments a
                LEFT JOIN submissions s ON a.id = s.assignment_id
                LEFT JOIN gradebook_entries ge ON a.id = ge.assignment_id
                WHERE a.course_id = $1 AND a.is_active = true
                GROUP BY a.id, a.title, a.description, a.assignment_type, a.max_points, a.due_date, a.attempts_allowed, a.time_limit_minutes
                ORDER BY a.due_date ASC, a.created_at ASC
            `;
            queryParams = [courseId];
        }

        const assignments = await query(assignmentsQuery, queryParams);

        res.json({
            assignments: assignments.rows
        });

    } catch (error) {
        console.error('Assignments fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// Create new assignment (instructor/admin only)
router.post('/:courseId/assignments', [
    param('courseId').isUUID(),
    body('title').isLength({ min: 1 }).trim(),
    body('description').optional().isString(),
    body('assignmentType').isIn(['quiz', 'exam', 'practical', 'project', 'discussion']),
    body('maxPoints').isFloat({ min: 0 }),
    body('dueDate').optional().isISO8601(),
    body('attemptsAllowed').optional().isInt({ min: 1 }),
    body('timeLimitMinutes').optional().isInt({ min: 1 }),
    body('questionsData').optional().isObject(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { courseId } = req.params;
        const {
            title,
            description,
            assignmentType,
            maxPoints,
            dueDate,
            attemptsAllowed = 1,
            timeLimitMinutes,
            questionsData,
            unitId
        } = req.body;

        // Verify course access
        const courseCheck = await query(`
            SELECT id FROM courses 
            WHERE id = $1 AND (instructor_id = $2 OR $3 = 'admin' OR ($3 = 'school_admin' AND school_id = $4))
        `, [courseId, req.user.id, req.user.role, req.user.school_id]);

        if (courseCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this course' });
        }

        // Create assignment
        const assignment = await query(`
            INSERT INTO assignments (
                course_id, unit_id, title, description, assignment_type, max_points,
                due_date, attempts_allowed, time_limit_minutes, questions_data
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            courseId, unitId, title, description, assignmentType, maxPoints,
            dueDate, attemptsAllowed, timeLimitMinutes, JSON.stringify(questionsData)
        ]);

        res.status(201).json({
            message: 'Assignment created successfully',
            assignment: assignment.rows[0]
        });

    } catch (error) {
        console.error('Assignment creation error:', error);
        res.status(500).json({ error: 'Failed to create assignment' });
    }
});

export default router;