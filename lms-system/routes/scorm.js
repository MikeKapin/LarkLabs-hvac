import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { query } from '../config/database.js';

const router = express.Router();

// SCORM 2004 Runtime API Implementation
class SCORMRuntime {
    constructor(studentId, courseId, scoId) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.scoId = scoId;
        this.data = {};
        this.initialized = false;
    }

    // SCORM API Implementation
    async Initialize(parameter) {
        if (parameter !== '') {
            return 'false';
        }

        try {
            // Load existing CMI data for this student/SCO
            const result = await query(`
                SELECT cmi_data FROM scorm_sessions 
                WHERE student_id = $1 AND course_id = $2 AND sco_id = $3
                ORDER BY created_at DESC LIMIT 1
            `, [this.studentId, this.courseId, this.scoId]);

            if (result.rows.length > 0) {
                this.data = JSON.parse(result.rows[0].cmi_data || '{}');
            } else {
                this.data = this.getDefaultCMIData();
            }

            this.initialized = true;
            return 'true';
        } catch (error) {
            console.error('SCORM Initialize error:', error);
            return 'false';
        }
    }

    GetValue(element) {
        if (!this.initialized) {
            return '';
        }

        const value = this.getNestedValue(this.data, element);
        return value !== undefined ? value.toString() : '';
    }

    SetValue(element, value) {
        if (!this.initialized) {
            return 'false';
        }

        this.setNestedValue(this.data, element, value);
        return 'true';
    }

    async Commit(parameter) {
        if (parameter !== '' || !this.initialized) {
            return 'false';
        }

        try {
            // Save CMI data to database
            await query(`
                INSERT INTO scorm_sessions (student_id, course_id, sco_id, cmi_data, last_accessed)
                VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                ON CONFLICT (student_id, course_id, sco_id)
                DO UPDATE SET 
                    cmi_data = EXCLUDED.cmi_data,
                    last_accessed = EXCLUDED.last_accessed
            `, [this.studentId, this.courseId, this.scoId, JSON.stringify(this.data)]);

            // Update progress in main LMS
            await this.updateLMSProgress();

            return 'true';
        } catch (error) {
            console.error('SCORM Commit error:', error);
            return 'false';
        }
    }

    Terminate(parameter) {
        if (parameter !== '') {
            return 'false';
        }

        this.initialized = false;
        return 'true';
    }

    GetLastError() {
        return '0'; // No error
    }

    GetErrorString(errorCode) {
        const errors = {
            '0': 'No error',
            '101': 'General exception',
            '102': 'General initialization failure',
            '103': 'Already initialized',
            '104': 'Content instance terminated',
            '111': 'General termination failure',
            '112': 'Termination before initialization',
            '113': 'Termination after termination',
            '122': 'Retrieve data before initialization',
            '123': 'Retrieve data after termination',
            '132': 'Store data before initialization',
            '133': 'Store data after termination',
            '142': 'Commit before initialization',
            '143': 'Commit after termination',
            '201': 'General argument error',
            '301': 'General get value error',
            '351': 'General set value error',
            '391': 'General commit error',
            '401': 'Undefined data model',
            '402': 'Unimplemented data model element',
            '403': 'Data model element value not initialized',
            '404': 'Data model element is read only',
            '405': 'Data model element is write only'
        };
        return errors[errorCode] || 'Unknown error';
    }

    GetDiagnostic(errorCode) {
        return '';
    }

    // Helper methods
    getDefaultCMIData() {
        return {
            'cmi.core.lesson_status': 'not attempted',
            'cmi.core.score.raw': '',
            'cmi.core.score.max': '100',
            'cmi.core.score.min': '0',
            'cmi.core.session_time': '00:00:00',
            'cmi.core.total_time': '00:00:00',
            'cmi.core.exit': '',
            'cmi.core.lesson_location': '',
            'cmi.suspend_data': '',
            'cmi.launch_data': '',
            'cmi.comments': '',
            'cmi.core.student_id': this.studentId,
            'cmi.core.student_name': '',
            'cmi.core.lesson_mode': 'normal'
        };
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    async updateLMSProgress() {
        try {
            const lessonStatus = this.data['cmi.core.lesson_status'];
            const scoreRaw = parseFloat(this.data['cmi.core.score.raw'] || '0');
            const totalTime = this.data['cmi.core.total_time'] || '00:00:00';

            // Convert SCORM time to minutes
            const timeMatches = totalTime.match(/(\d+):(\d+):(\d+)/);
            const totalMinutes = timeMatches 
                ? parseInt(timeMatches[1]) * 60 + parseInt(timeMatches[2]) + parseInt(timeMatches[3]) / 60
                : 0;

            // Map SCORM status to LMS progress
            const completed = ['completed', 'passed'].includes(lessonStatus);
            const completionPercentage = scoreRaw || (completed ? 100 : 0);

            // Update chapter progress if this is mapped to a chapter
            const chapterMapping = await query(`
                SELECT chapter_id FROM scorm_chapter_mapping 
                WHERE sco_id = $1
            `, [this.scoId]);

            if (chapterMapping.rows.length > 0) {
                const chapterId = chapterMapping.rows[0].chapter_id;
                
                const enrollment = await query(`
                    SELECT e.id FROM enrollments e
                    JOIN courses c ON e.course_id = c.id
                    WHERE c.id = $1 AND e.student_id = $2
                `, [this.courseId, this.studentId]);

                if (enrollment.rows.length > 0) {
                    await query(`
                        INSERT INTO student_progress (enrollment_id, chapter_id, completion_percentage, time_spent_minutes, completed_at, last_accessed_at)
                        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                        ON CONFLICT (enrollment_id, chapter_id)
                        DO UPDATE SET 
                            completion_percentage = GREATEST(student_progress.completion_percentage, $3),
                            time_spent_minutes = student_progress.time_spent_minutes + $4,
                            completed_at = CASE WHEN $5 IS NOT NULL THEN $5 ELSE student_progress.completed_at END,
                            last_accessed_at = CURRENT_TIMESTAMP
                    `, [enrollment.rows[0].id, chapterId, completionPercentage, totalMinutes, completed ? new Date() : null]);
                }
            }

            // Track xAPI activity
            await query(`
                INSERT INTO learning_activities (student_id, course_id, activity_type, object_id, verb, result_data, context_data)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                this.studentId,
                this.courseId,
                lessonStatus === 'completed' ? 'completed' : 'experienced',
                `scorm-${this.scoId}`,
                lessonStatus === 'completed' ? 'completed' : 'experienced',
                JSON.stringify({
                    completion: completed,
                    score: { raw: scoreRaw, scaled: scoreRaw / 100 },
                    duration: totalTime
                }),
                JSON.stringify({
                    scorm_version: '2004',
                    lesson_mode: this.data['cmi.core.lesson_mode']
                })
            ]);

        } catch (error) {
            console.error('LMS progress update error:', error);
        }
    }
}

// SCORM API endpoint for content
router.post('/api/:studentId/:courseId/:scoId', async (req, res) => {
    try {
        const { studentId, courseId, scoId } = req.params;
        const { method, parameters } = req.body;

        // Verify student access
        if (studentId !== req.user.id && !['instructor', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const runtime = new SCORMRuntime(studentId, courseId, scoId);

        let result;
        switch (method) {
            case 'Initialize':
                result = await runtime.Initialize(parameters[0] || '');
                break;
            case 'GetValue':
                result = runtime.GetValue(parameters[0] || '');
                break;
            case 'SetValue':
                result = runtime.SetValue(parameters[0] || '', parameters[1] || '');
                break;
            case 'Commit':
                result = await runtime.Commit(parameters[0] || '');
                break;
            case 'Terminate':
                result = runtime.Terminate(parameters[0] || '');
                break;
            case 'GetLastError':
                result = runtime.GetLastError();
                break;
            case 'GetErrorString':
                result = runtime.GetErrorString(parameters[0] || '0');
                break;
            case 'GetDiagnostic':
                result = runtime.GetDiagnostic(parameters[0] || '0');
                break;
            default:
                return res.status(400).json({ error: 'Invalid SCORM API method' });
        }

        res.json({ result });

    } catch (error) {
        console.error('SCORM API error:', error);
        res.status(500).json({ error: 'SCORM API call failed' });
    }
});

// xAPI (Tin Can API) Statement endpoint
router.post('/xapi/statements', [
    body('actor').isObject(),
    body('verb').isObject(),
    body('object').isObject()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { actor, verb, object, result, context } = req.body;

        // Extract student information
        const studentEmail = actor.mbox?.replace('mailto:', '') || actor.account?.name;
        
        // Find student in our system
        const student = await query(
            'SELECT id FROM users WHERE email = $1 AND role = $2',
            [studentEmail, 'student']
        );

        if (student.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const studentId = student.rows[0].id;

        // Extract course context
        const courseContext = context?.contextActivities?.parent?.[0]?.id;
        let courseId = null;

        if (courseContext) {
            const course = await query(
                'SELECT id FROM courses WHERE lti_context_id = $1 OR id::text = $1',
                [courseContext]
            );
            courseId = course.rows[0]?.id;
        }

        // Store xAPI statement
        await query(`
            INSERT INTO learning_activities (
                student_id, course_id, activity_type, object_id, verb, result_data, context_data, timestamp
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            studentId,
            courseId,
            verb.id.split('/').pop(), // Extract verb name from URI
            object.id,
            verb.display?.['en-US'] || verb.id,
            JSON.stringify(result || {}),
            JSON.stringify(context || {}),
            new Date()
        ]);

        // Update progress based on xAPI statement
        if (verb.id.includes('completed') && result?.completion) {
            await updateProgressFromXAPI(studentId, courseId, object.id, result);
        }

        res.status(200).json({
            success: true,
            statement_id: `statement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });

    } catch (error) {
        console.error('xAPI statement error:', error);
        res.status(500).json({ error: 'Failed to process xAPI statement' });
    }
});

// Get xAPI statements for analytics
router.get('/xapi/statements', async (req, res) => {
    try {
        const { student, course, since, until, limit = 100 } = req.query;

        let whereClause = '1=1';
        const queryParams = [];
        let paramIndex = 1;

        if (student) {
            whereClause += ` AND la.student_id = $${paramIndex}`;
            queryParams.push(student);
            paramIndex++;
        }

        if (course) {
            whereClause += ` AND la.course_id = $${paramIndex}`;
            queryParams.push(course);
            paramIndex++;
        }

        if (since) {
            whereClause += ` AND la.timestamp >= $${paramIndex}`;
            queryParams.push(since);
            paramIndex++;
        }

        if (until) {
            whereClause += ` AND la.timestamp <= $${paramIndex}`;
            queryParams.push(until);
            paramIndex++;
        }

        const statements = await query(`
            SELECT 
                la.*,
                u.email as student_email,
                u.first_name,
                u.last_name,
                c.name as course_name
            FROM learning_activities la
            JOIN users u ON la.student_id = u.id
            LEFT JOIN courses c ON la.course_id = c.id
            WHERE ${whereClause}
            ORDER BY la.timestamp DESC
            LIMIT $${paramIndex}
        `, [...queryParams, limit]);

        // Convert to xAPI format
        const xapiStatements = statements.rows.map(statement => ({
            id: statement.id,
            actor: {
                mbox: `mailto:${statement.student_email}`,
                name: `${statement.first_name} ${statement.last_name}`
            },
            verb: {
                id: `http://adlnet.gov/expapi/verbs/${statement.verb}`,
                display: { 'en-US': statement.verb }
            },
            object: {
                id: statement.object_id,
                definition: {
                    name: { 'en-US': statement.activity_type }
                }
            },
            result: statement.result_data,
            context: statement.context_data,
            timestamp: statement.timestamp,
            stored: statement.timestamp
        }));

        res.json({
            statements: xapiStatements,
            more: statements.rows.length === limit ? '/xapi/statements?since=' + statements.rows[statements.rows.length - 1].timestamp : ''
        });

    } catch (error) {
        console.error('xAPI statements fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch xAPI statements' });
    }
});

// SCORM package upload and processing
router.post('/package/upload', [
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        // This would handle SCORM package uploads
        // For now, return structure for manual content mapping
        
        res.json({
            message: 'SCORM package upload endpoint',
            note: 'Implementation would extract manifest, create SCO records, and map to course content',
            supportedVersions: ['SCORM 1.2', 'SCORM 2004'],
            nextSteps: [
                'Extract imsmanifest.xml',
                'Parse organization and resources',
                'Create SCO records in database',
                'Map to existing course content'
            ]
        });

    } catch (error) {
        console.error('SCORM upload error:', error);
        res.status(500).json({ error: 'Failed to process SCORM package' });
    }
});

// Map SCORM content to LMS chapters
router.post('/mapping/chapter', [
    body('chapterId').isUUID(),
    body('scoId').isString(),
    body('scormVersion').isIn(['1.2', '2004']),
    requireRole(['instructor', 'admin', 'school_admin'])
], async (req, res) => {
    try {
        const { chapterId, scoId, scormVersion } = req.body;

        // Create mapping between SCORM content and LMS chapters
        await query(`
            INSERT INTO scorm_chapter_mapping (chapter_id, sco_id, scorm_version)
            VALUES ($1, $2, $3)
            ON CONFLICT (chapter_id) DO UPDATE SET
                sco_id = EXCLUDED.sco_id,
                scorm_version = EXCLUDED.scorm_version
        `, [chapterId, scoId, scormVersion]);

        res.json({
            message: 'SCORM content mapped to chapter successfully',
            mapping: { chapterId, scoId, scormVersion }
        });

    } catch (error) {
        console.error('SCORM mapping error:', error);
        res.status(500).json({ error: 'Failed to create SCORM mapping' });
    }
});

// Helper function to update LMS progress from xAPI
async function updateProgressFromXAPI(studentId, courseId, objectId, result) {
    try {
        // Extract object type and ID from xAPI object
        const objectParts = objectId.split('-');
        if (objectParts[0] === 'chapter' && objectParts[1]) {
            const chapterId = objectParts[1];
            
            const enrollment = await query(`
                SELECT id FROM enrollments 
                WHERE student_id = $1 AND course_id = $2
            `, [studentId, courseId]);

            if (enrollment.rows.length > 0) {
                const completionPercentage = result.score?.scaled ? result.score.scaled * 100 : 100;
                const completed = result.completion || false;

                await query(`
                    INSERT INTO student_progress (enrollment_id, chapter_id, completion_percentage, completed_at, last_accessed_at)
                    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                    ON CONFLICT (enrollment_id, chapter_id)
                    DO UPDATE SET 
                        completion_percentage = GREATEST(student_progress.completion_percentage, $3),
                        completed_at = CASE WHEN $4 IS NOT NULL THEN $4 ELSE student_progress.completed_at END,
                        last_accessed_at = CURRENT_TIMESTAMP
                `, [enrollment.rows[0].id, chapterId, completionPercentage, completed ? new Date() : null]);
            }
        }
    } catch (error) {
        console.error('xAPI progress update error:', error);
    }
}

// Additional SCORM database tables (add to schema)
const scormTables = `
-- SCORM Support Tables
CREATE TABLE IF NOT EXISTS scorm_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    sco_id VARCHAR(255) NOT NULL,
    cmi_data JSONB,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, sco_id)
);

CREATE TABLE IF NOT EXISTS scorm_chapter_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id),
    sco_id VARCHAR(255) NOT NULL,
    scorm_version VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_scorm_sessions_student_course ON scorm_sessions(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_scorm_mapping_chapter ON scorm_chapter_mapping(chapter_id);
`;

export default router;
export { SCORMRuntime, scormTables };