import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Submit quiz/exam answers
router.post('/submit/:assignmentId', [
    param('assignmentId').isUUID(),
    body('answers').isObject(),
    body('timeSpent').optional().isInt({ min: 0 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { assignmentId } = req.params;
        const { answers, timeSpent = 0 } = req.body;

        // Verify student is enrolled and assignment exists
        const assignmentCheck = await query(`
            SELECT 
                a.id, a.title, a.assignment_type, a.max_points, a.time_limit_minutes,
                a.attempts_allowed, a.questions_data,
                e.id as enrollment_id,
                COUNT(s.id) as previous_attempts
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
            WHERE a.id = $1 AND e.student_id = $2 AND a.is_active = true
            GROUP BY a.id, a.title, a.assignment_type, a.max_points, a.time_limit_minutes, a.attempts_allowed, a.questions_data, e.id
        `, [assignmentId, req.user.id]);

        if (assignmentCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found or not enrolled' });
        }

        const assignment = assignmentCheck.rows[0];

        // Check attempt limits
        if (assignment.previous_attempts >= assignment.attempts_allowed) {
            return res.status(400).json({ error: 'Maximum attempts exceeded' });
        }

        // Check time limit if specified
        if (assignment.time_limit_minutes && timeSpent > assignment.time_limit_minutes) {
            return res.status(400).json({ error: 'Time limit exceeded' });
        }

        // Auto-grade the submission
        const gradeResult = await autoGradeQuiz(assignment, answers);

        // Create submission record
        const submission = await query(`
            INSERT INTO submissions (
                assignment_id, student_id, attempt_number, answers_data, 
                points_earned, submitted_at, graded_at, status
            )
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'graded')
            RETURNING *
        `, [
            assignmentId,
            req.user.id,
            assignment.previous_attempts + 1,
            JSON.stringify(answers),
            gradeResult.pointsEarned
        ]);

        // Update gradebook
        const percentage = (gradeResult.pointsEarned / assignment.max_points) * 100;
        const letterGrade = calculateLetterGrade(percentage);

        await query(`
            INSERT INTO gradebook_entries (
                enrollment_id, assignment_id, points_earned, points_possible, 
                percentage, letter_grade, graded_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            ON CONFLICT (enrollment_id, assignment_id) 
            DO UPDATE SET 
                points_earned = GREATEST(gradebook_entries.points_earned, EXCLUDED.points_earned),
                percentage = GREATEST(gradebook_entries.percentage, EXCLUDED.percentage),
                letter_grade = CASE 
                    WHEN EXCLUDED.percentage > gradebook_entries.percentage 
                    THEN EXCLUDED.letter_grade 
                    ELSE gradebook_entries.letter_grade 
                END,
                graded_at = EXCLUDED.graded_at,
                updated_at = CURRENT_TIMESTAMP
        `, [
            assignment.enrollment_id,
            assignmentId,
            gradeResult.pointsEarned,
            assignment.max_points,
            percentage,
            letterGrade
        ]);

        // Track learning activity for xAPI compliance
        await query(`
            INSERT INTO learning_activities (
                student_id, course_id, activity_type, object_id, verb, result_data, context_data
            )
            SELECT $1, c.id, 'completed', $2, 'answered', $3, $4
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            WHERE a.id = $5
        `, [
            req.user.id,
            `assignment-${assignmentId}`,
            JSON.stringify({
                completion: true,
                success: percentage >= 70,
                score: { scaled: percentage / 100 },
                duration: `PT${timeSpent}M`
            }),
            JSON.stringify({
                assignment_type: assignment.assignment_type,
                attempt_number: assignment.previous_attempts + 1,
                time_limit: assignment.time_limit_minutes
            }),
            assignmentId
        ]);

        res.json({
            message: 'Quiz submitted and graded successfully',
            submission: submission.rows[0],
            grade: {
                pointsEarned: gradeResult.pointsEarned,
                pointsPossible: assignment.max_points,
                percentage: percentage.toFixed(2),
                letterGrade,
                passed: percentage >= 70
            },
            feedback: gradeResult.feedback,
            correctAnswers: gradeResult.correctAnswers
        });

    } catch (error) {
        console.error('Quiz submission error:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// Get quiz questions for student
router.get('/take/:assignmentId', [
    param('assignmentId').isUUID()
], async (req, res) => {
    try {
        const { assignmentId } = req.params;

        // Verify student access and get assignment details
        const assignment = await query(`
            SELECT 
                a.id, a.title, a.description, a.assignment_type, a.max_points,
                a.time_limit_minutes, a.attempts_allowed, a.questions_data,
                COUNT(s.id) as attempts_used
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
            WHERE a.id = $1 AND e.student_id = $2 AND a.is_active = true
            GROUP BY a.id, a.title, a.description, a.assignment_type, a.max_points, a.time_limit_minutes, a.attempts_allowed, a.questions_data
        `, [assignmentId, req.user.id]);

        if (assignment.rows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found or not enrolled' });
        }

        const assignmentData = assignment.rows[0];

        // Check if attempts are exhausted
        if (assignmentData.attempts_used >= assignmentData.attempts_allowed) {
            return res.status(400).json({ error: 'No more attempts available' });
        }

        // Return questions (remove correct answers for security)
        const questions = JSON.parse(assignmentData.questions_data || '[]');
        const sanitizedQuestions = questions.map(q => ({
            id: q.id,
            question: q.question,
            type: q.type,
            options: q.options,
            points: q.points
            // Remove 'correctAnswer' and 'explanation' for security
        }));

        res.json({
            assignment: {
                id: assignmentData.id,
                title: assignmentData.title,
                description: assignmentData.description,
                type: assignmentData.assignment_type,
                maxPoints: assignmentData.max_points,
                timeLimit: assignmentData.time_limit_minutes,
                attemptsAllowed: assignmentData.attempts_allowed,
                attemptsUsed: assignmentData.attempts_used
            },
            questions: sanitizedQuestions
        });

    } catch (error) {
        console.error('Quiz fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
});

// Create quiz/exam (instructor only)
router.post('/create', [
    body('courseId').isUUID(),
    body('title').isLength({ min: 1 }).trim(),
    body('description').optional().isString(),
    body('assignmentType').isIn(['quiz', 'exam']),
    body('maxPoints').isFloat({ min: 0 }),
    body('dueDate').optional().isISO8601(),
    body('timeLimitMinutes').optional().isInt({ min: 1 }),
    body('attemptsAllowed').optional().isInt({ min: 1 }),
    body('questions').isArray(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            courseId,
            title,
            description,
            assignmentType,
            maxPoints,
            dueDate,
            timeLimitMinutes,
            attemptsAllowed = 1,
            questions,
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

        // Validate questions format
        for (const question of questions) {
            if (!question.id || !question.question || !question.type || !question.correctAnswer) {
                return res.status(400).json({ error: 'Invalid question format' });
            }
        }

        // Create assignment with questions
        const assignment = await query(`
            INSERT INTO assignments (
                course_id, unit_id, title, description, assignment_type, max_points,
                due_date, attempts_allowed, time_limit_minutes, questions_data
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            courseId, unitId, title, description, assignmentType, maxPoints,
            dueDate, attemptsAllowed, timeLimitMinutes, JSON.stringify(questions)
        ]);

        res.status(201).json({
            message: 'Quiz created successfully',
            assignment: assignment.rows[0]
        });

    } catch (error) {
        console.error('Quiz creation error:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
});

// Get quiz results and analytics (instructor view)
router.get('/:assignmentId/results', [
    param('assignmentId').isUUID(),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const { assignmentId } = req.params;

        // Verify assignment access
        const assignmentCheck = await query(`
            SELECT a.id, a.title, a.questions_data, a.max_points, c.instructor_id, c.school_id
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            WHERE a.id = $1 
            AND (c.instructor_id = $2 OR $3 = 'admin' OR ($3 = 'school_admin' AND c.school_id = $4))
        `, [assignmentId, req.user.id, req.user.role, req.user.school_id]);

        if (assignmentCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this assignment' });
        }

        // Get all submissions and results
        const results = await query(`
            SELECT 
                u.first_name,
                u.last_name,
                u.email,
                s.attempt_number,
                s.submitted_at,
                s.points_earned,
                s.answers_data,
                ge.percentage,
                ge.letter_grade
            FROM submissions s
            JOIN users u ON s.student_id = u.id
            LEFT JOIN gradebook_entries ge ON s.assignment_id = ge.assignment_id 
                AND ge.enrollment_id = (
                    SELECT id FROM enrollments 
                    WHERE student_id = s.student_id 
                    AND course_id = (SELECT course_id FROM assignments WHERE id = $1)
                )
            WHERE s.assignment_id = $1
            ORDER BY u.last_name, u.first_name, s.attempt_number
        `, [assignmentId]);

        // Analyze question performance
        const questions = JSON.parse(assignmentCheck.rows[0].questions_data || '[]');
        const questionAnalysis = questions.map(question => {
            const responses = results.rows.map(result => {
                const answers = JSON.parse(result.answers_data || '{}');
                return answers[question.id];
            }).filter(answer => answer !== undefined);

            const correctCount = responses.filter(answer => 
                Array.isArray(question.correctAnswer) 
                    ? JSON.stringify(answer) === JSON.stringify(question.correctAnswer)
                    : answer === question.correctAnswer
            ).length;

            return {
                questionId: question.id,
                question: question.question,
                totalResponses: responses.length,
                correctResponses: correctCount,
                successRate: responses.length > 0 ? (correctCount / responses.length * 100).toFixed(2) : 0,
                difficulty: correctCount / responses.length < 0.5 ? 'Hard' : 
                           correctCount / responses.length < 0.8 ? 'Medium' : 'Easy'
            };
        });

        res.json({
            assignment: assignmentCheck.rows[0],
            results: results.rows,
            questionAnalysis,
            statistics: {
                totalSubmissions: results.rows.length,
                averageScore: results.rows.reduce((sum, r) => sum + parseFloat(r.percentage || 0), 0) / results.rows.length || 0,
                passRate: results.rows.filter(r => parseFloat(r.percentage || 0) >= 70).length / results.rows.length * 100 || 0
            }
        });

    } catch (error) {
        console.error('Quiz results fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz results' });
    }
});

// Get individual student's quiz attempt
router.get('/:assignmentId/attempt/:attemptNumber', [
    param('assignmentId').isUUID(),
    param('attemptNumber').isInt({ min: 1 })
], async (req, res) => {
    try {
        const { assignmentId, attemptNumber } = req.params;

        // Get submission details
        let submissionQuery;
        let queryParams;

        if (req.user.role === 'student') {
            submissionQuery = `
                SELECT s.*, a.title, a.questions_data, a.max_points
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                WHERE s.assignment_id = $1 AND s.student_id = $2 AND s.attempt_number = $3
            `;
            queryParams = [assignmentId, req.user.id, attemptNumber];
        } else {
            // Instructors can view any student's attempt
            submissionQuery = `
                SELECT s.*, a.title, a.questions_data, a.max_points, u.first_name, u.last_name
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                JOIN users u ON s.student_id = u.id
                JOIN courses c ON a.course_id = c.id
                WHERE s.assignment_id = $1 AND s.attempt_number = $2
                AND (c.instructor_id = $3 OR $4 = 'admin' OR ($4 = 'school_admin' AND c.school_id = $5))
            `;
            queryParams = [assignmentId, attemptNumber, req.user.id, req.user.role, req.user.school_id];
        }

        const submission = await query(submissionQuery, queryParams);

        if (submission.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const submissionData = submission.rows[0];
        const questions = JSON.parse(submissionData.questions_data || '[]');
        const answers = JSON.parse(submissionData.answers_data || '{}');

        // Show detailed results with correct answers (after submission)
        const detailedResults = questions.map(question => ({
            id: question.id,
            question: question.question,
            type: question.type,
            options: question.options,
            points: question.points,
            studentAnswer: answers[question.id],
            correctAnswer: question.correctAnswer,
            isCorrect: Array.isArray(question.correctAnswer) 
                ? JSON.stringify(answers[question.id]) === JSON.stringify(question.correctAnswer)
                : answers[question.id] === question.correctAnswer,
            explanation: question.explanation
        }));

        res.json({
            submission: {
                id: submissionData.id,
                attemptNumber: submissionData.attempt_number,
                submittedAt: submissionData.submitted_at,
                pointsEarned: submissionData.points_earned,
                maxPoints: submissionData.max_points,
                percentage: ((submissionData.points_earned / submissionData.max_points) * 100).toFixed(2)
            },
            questions: detailedResults,
            summary: {
                totalQuestions: questions.length,
                correctAnswers: detailedResults.filter(q => q.isCorrect).length,
                pointsEarned: submissionData.points_earned,
                pointsPossible: submissionData.max_points
            }
        });

    } catch (error) {
        console.error('Quiz attempt fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz attempt' });
    }
});

// Auto-grading function
async function autoGradeQuiz(assignment, studentAnswers) {
    try {
        const questions = JSON.parse(assignment.questions_data || '[]');
        let totalPoints = 0;
        let earnedPoints = 0;
        const feedback = [];
        const correctAnswers = {};

        for (const question of questions) {
            totalPoints += question.points || 1;
            const studentAnswer = studentAnswers[question.id];
            const correctAnswer = question.correctAnswer;
            
            let isCorrect = false;
            
            // Handle different question types
            switch (question.type) {
                case 'multiple_choice':
                    isCorrect = studentAnswer === correctAnswer;
                    break;
                case 'multiple_select':
                    isCorrect = Array.isArray(studentAnswer) && Array.isArray(correctAnswer) &&
                               studentAnswer.length === correctAnswer.length &&
                               studentAnswer.every(ans => correctAnswer.includes(ans));
                    break;
                case 'true_false':
                    isCorrect = studentAnswer === correctAnswer;
                    break;
                case 'short_answer':
                    // Simple string matching (could be enhanced with fuzzy matching)
                    isCorrect = studentAnswer && studentAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
                    break;
                default:
                    isCorrect = studentAnswer === correctAnswer;
            }

            if (isCorrect) {
                earnedPoints += question.points || 1;
            }

            correctAnswers[question.id] = correctAnswer;
            
            if (question.explanation) {
                feedback.push({
                    questionId: question.id,
                    correct: isCorrect,
                    explanation: question.explanation
                });
            }
        }

        return {
            pointsEarned: earnedPoints,
            pointsPossible: totalPoints,
            percentage: (earnedPoints / totalPoints) * 100,
            feedback,
            correctAnswers
        };

    } catch (error) {
        console.error('Auto-grading error:', error);
        throw error;
    }
}

// Helper function for letter grade calculation
function calculateLetterGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 77) return 'B+';
    if (percentage >= 73) return 'B';
    if (percentage >= 70) return 'B-';
    if (percentage >= 67) return 'C+';
    if (percentage >= 63) return 'C';
    if (percentage >= 60) return 'C-';
    if (percentage >= 50) return 'D';
    return 'F';
}

// Generate TSSA-style exam questions from content
router.post('/generate-questions/:unitId', [
    param('unitId').isUUID(),
    body('questionCount').isInt({ min: 5, max: 50 }),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const { unitId } = req.params;
        const { questionCount, difficulty = 'medium' } = req.body;

        // Get unit content for question generation
        const unit = await query(`
            SELECT u.*, p.code as program_code
            FROM units u
            JOIN programs p ON u.program_id = p.id
            WHERE u.id = $1
        `, [unitId]);

        if (unit.rows.length === 0) {
            return res.status(404).json({ error: 'Unit not found' });
        }

        // This would integrate with your existing content to generate TSSA-style questions
        // For now, return template questions that can be customized
        const sampleQuestions = generateTSSAQuestions(unit.rows[0], questionCount, difficulty);

        res.json({
            message: 'Questions generated successfully',
            unit: unit.rows[0],
            questions: sampleQuestions,
            totalPoints: sampleQuestions.reduce((sum, q) => sum + q.points, 0)
        });

    } catch (error) {
        console.error('Question generation error:', error);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
});

// Sample TSSA question generator
function generateTSSAQuestions(unit, count, difficulty) {
    const baseQuestions = {
        safety: [
            {
                id: 'safety_1',
                question: 'What is the minimum clearance required between a gas meter and an electrical panel?',
                type: 'multiple_choice',
                options: ['3 feet', '5 feet', '6 feet', '10 feet'],
                correctAnswer: '3 feet',
                points: 2,
                explanation: 'CSA B149.1 requires a minimum 3-foot clearance between gas meters and electrical equipment.'
            },
            {
                id: 'safety_2',
                question: 'Which gas has a lower explosive limit of 5% by volume?',
                type: 'multiple_choice',
                options: ['Natural Gas', 'Propane', 'Butane', 'Hydrogen'],
                correctAnswer: 'Natural Gas',
                points: 2,
                explanation: 'Natural gas (methane) has an LEL of approximately 5% by volume in air.'
            }
        ],
        technical: [
            {
                id: 'tech_1',
                question: 'What are the acceptable methods for testing gas piping for leaks?',
                type: 'multiple_select',
                options: ['Soap solution', 'Electronic leak detector', 'Open flame', 'Pressure gauge'],
                correctAnswer: ['Soap solution', 'Electronic leak detector', 'Pressure gauge'],
                points: 3,
                explanation: 'Never use open flame for leak detection. Approved methods include soap solutions, electronic detectors, and pressure testing.'
            }
        ]
    };

    // Generate questions based on unit content and difficulty
    const questions = [];
    const questionPool = [...baseQuestions.safety, ...baseQuestions.technical];
    
    for (let i = 0; i < Math.min(count, questionPool.length); i++) {
        const question = { ...questionPool[i] };
        question.id = `${unit.unit_number}_${i + 1}`;
        
        // Adjust points based on difficulty
        if (difficulty === 'easy') question.points = Math.max(1, question.points - 1);
        if (difficulty === 'hard') question.points += 1;
        
        questions.push(question);
    }

    return questions;
}

export default router;