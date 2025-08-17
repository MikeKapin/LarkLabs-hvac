import express from 'express';
import { LTI } from 'ltijs';
import { query } from '../config/database.js';
import { generateTokens } from '../middleware/auth.js';

const router = express.Router();

// Initialize LTI Provider for D2L Brightspace integration
const lti = new LTI(process.env.LTI_KEY, {
    url: process.env.DATABASE_URL,
    connection: {
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME
    }
}, {
    staticPath: '/public',
    keysetEndpoint: '/keys',
    loginEndpoint: '/login',
    sessionEndpoint: '/session',
    invalidTokenRedirect: '/invalid',
    tokenMaxAge: 60 * 60 * 1000 // 1 hour
});

// Register D2L Brightspace as platform
async function setupLTIPlatform() {
    try {
        await lti.registerPlatform({
            url: process.env.D2L_PLATFORM_URL,
            name: 'D2L Brightspace',
            clientId: process.env.D2L_CLIENT_ID,
            authenticationEndpoint: process.env.D2L_AUTH_ENDPOINT,
            accesstokenEndpoint: process.env.D2L_TOKEN_ENDPOINT,
            authConfig: {
                method: 'JWK_SET',
                key: process.env.D2L_KEYSET_ENDPOINT
            }
        });
        console.log('D2L Brightspace platform registered successfully');
    } catch (error) {
        console.error('LTI platform registration error:', error);
    }
}

// Main LTI launch endpoint
lti.onConnect(async (token, req, res) => {
    try {
        // Extract user and context information from LTI token
        const ltiUser = token.userInfo;
        const context = token.platformContext;
        const custom = token.custom;

        const {
            given_name: firstName,
            family_name: lastName,
            email,
            sub: ltiUserId
        } = ltiUser;

        const {
            id: contextId,
            label: courseCode,
            title: courseName
        } = context;

        // Check if user exists in our system
        let user = await query(
            'SELECT * FROM users WHERE lti_user_id = $1 OR email = $2',
            [ltiUserId, email]
        );

        if (user.rows.length === 0) {
            // Create new user from LTI launch
            const role = determineUserRole(token.roles);
            
            const newUser = await query(`
                INSERT INTO users (email, first_name, last_name, role, lti_user_id, password_hash, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, true)
                RETURNING *
            `, [email, firstName, lastName, role, ltiUserId, 'lti_auth']);

            user = newUser;
        } else {
            // Update existing user's LTI mapping
            await query(
                'UPDATE users SET lti_user_id = $1 WHERE id = $2',
                [ltiUserId, user.rows[0].id]
            );
        }

        const userData = user.rows[0];

        // Create or find course from LTI context
        let course = await query(
            'SELECT * FROM courses WHERE lti_context_id = $1',
            [contextId]
        );

        if (course.rows.length === 0 && userData.role === 'instructor') {
            // Create course if launched by instructor
            const newCourse = await query(`
                INSERT INTO courses (name, course_code, instructor_id, lti_context_id, school_id)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [courseName, courseCode, userData.id, contextId, userData.school_id]);

            course = newCourse;
        }

        // Auto-enroll student if course exists
        if (course.rows.length > 0 && userData.role === 'student') {
            await query(`
                INSERT INTO enrollments (student_id, course_id)
                VALUES ($1, $2)
                ON CONFLICT (student_id, course_id) DO NOTHING
            `, [userData.id, course.rows[0].id]);
        }

        // Log LTI launch for analytics
        await query(`
            INSERT INTO lti_launches (user_id, course_id, lti_deployment_id, lti_message_hint, context_id, resource_link_id, platform_instance_guid, session_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            userData.id,
            course.rows[0]?.id,
            token.deploymentId,
            token.messageHint,
            contextId,
            token.resourceLink?.id,
            token.platformInfo?.guid,
            JSON.stringify(token)
        ]);

        // Generate internal JWT tokens for session management
        const tokens = generateTokens(userData);

        // Redirect to appropriate interface based on role and content
        const targetPath = custom?.target_path || determineTargetPath(userData.role, course.rows[0]);
        
        res.redirect(`${process.env.FRONTEND_URL}${targetPath}?token=${tokens.accessToken}&lti=true`);

    } catch (error) {
        console.error('LTI connect error:', error);
        res.status(500).send('LTI launch failed');
    }
});

// Grade passback for D2L Brightspace
lti.onDeepLinking(async (token, req, res) => {
    try {
        // Deep linking allows instructors to select specific content
        const items = await query(`
            SELECT u.id, u.title, u.description, 'unit' as type
            FROM units u
            JOIN programs p ON u.program_id = p.id
            WHERE p.code IN ('G2', 'G3')
            ORDER BY p.code, u.order_index
        `);

        const deepLinkingItems = items.rows.map(item => ({
            type: 'ltiResourceLink',
            title: item.title,
            text: item.description,
            url: `${process.env.LTI_PLATFORM_URL}/lti/content/${item.id}`,
            custom: {
                content_type: item.type,
                content_id: item.id
            }
        }));

        return lti.DeepLinking.createDeepLinkingMessage(token, deepLinkingItems, {
            message: 'Select HVAC learning content for your course'
        });

    } catch (error) {
        console.error('Deep linking error:', error);
        res.status(500).send('Deep linking failed');
    }
});

// Assignment and Grade Services (AGS) - Grade passback to D2L
router.post('/grade-passback/:assignmentId', async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { studentId, score, maxScore } = req.body;

        // Get LTI context for grade passback
        const ltiContext = await query(`
            SELECT l.*, a.title, c.lti_context_id
            FROM lti_launches l
            JOIN assignments a ON a.id = $1
            JOIN courses c ON a.course_id = c.id
            WHERE l.user_id = $2 AND l.course_id = c.id
            ORDER BY l.launched_at DESC
            LIMIT 1
        `, [assignmentId, studentId]);

        if (ltiContext.rows.length === 0) {
            return res.status(404).json({ error: 'LTI context not found' });
        }

        const context = ltiContext.rows[0];
        
        // Send grade back to D2L Brightspace
        const gradePassback = await lti.Grade.ScorePublish(
            context.platform_instance_guid,
            context.lti_deployment_id,
            {
                userId: context.resource_link_id,
                scoreGiven: score,
                scoreMaximum: maxScore,
                activityProgress: 'Completed',
                gradingProgress: 'FullyGraded',
                timestamp: new Date().toISOString()
            }
        );

        res.json({
            message: 'Grade sent to D2L Brightspace successfully',
            gradePassback
        });

    } catch (error) {
        console.error('Grade passback error:', error);
        res.status(500).json({ error: 'Failed to send grade to D2L' });
    }
});

// Names and Role Provisioning Service (NRPS) - Get course roster
router.get('/roster/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;

        // Get course LTI context
        const course = await query(
            'SELECT lti_context_id FROM courses WHERE id = $1',
            [courseId]
        );

        if (course.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Use NRPS to get updated roster from D2L
        const roster = await lti.NamesAndRoles.getMembers(course.rows[0].lti_context_id);

        // Sync roster with local database
        for (const member of roster) {
            await syncUserFromLTI(member, courseId);
        }

        res.json({
            message: 'Roster synced from D2L Brightspace',
            memberCount: roster.length
        });

    } catch (error) {
        console.error('Roster sync error:', error);
        res.status(500).json({ error: 'Failed to sync roster' });
    }
});

// Helper functions
function determineUserRole(ltiRoles) {
    const roleString = Array.isArray(ltiRoles) ? ltiRoles.join(',').toLowerCase() : ltiRoles.toLowerCase();
    
    if (roleString.includes('instructor') || roleString.includes('teacher')) {
        return 'instructor';
    } else if (roleString.includes('administrator') || roleString.includes('admin')) {
        return 'school_admin';
    } else {
        return 'student';
    }
}

function determineTargetPath(role, course) {
    if (role === 'instructor') {
        return course ? `/instructor/course/${course.id}` : '/instructor/dashboard';
    } else if (role === 'school_admin') {
        return '/admin/dashboard';
    } else {
        return course ? `/student/course/${course.id}` : '/student/dashboard';
    }
}

async function syncUserFromLTI(member, courseId) {
    try {
        const { 
            user_id: ltiUserId,
            name: fullName,
            email,
            roles
        } = member;

        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ') || '';
        const role = determineUserRole(roles);

        // Update or create user
        await query(`
            INSERT INTO users (lti_user_id, email, first_name, last_name, role, password_hash, is_active)
            VALUES ($1, $2, $3, $4, $5, 'lti_auth', true)
            ON CONFLICT (email) DO UPDATE SET
                lti_user_id = EXCLUDED.lti_user_id,
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                role = EXCLUDED.role
        `, [ltiUserId, email, firstName, lastName, role]);

        // Auto-enroll students
        if (role === 'student') {
            const user = await query('SELECT id FROM users WHERE email = $1', [email]);
            if (user.rows.length > 0) {
                await query(`
                    INSERT INTO enrollments (student_id, course_id)
                    VALUES ($1, $2)
                    ON CONFLICT (student_id, course_id) DO NOTHING
                `, [user.rows[0].id, courseId]);
            }
        }

    } catch (error) {
        console.error('User sync error:', error);
    }
}

// Initialize LTI provider
async function initializeLTI() {
    try {
        await lti.deploy({ port: process.env.LTI_PORT || 3001 });
        await setupLTIPlatform();
        console.log('LTI Provider initialized successfully');
    } catch (error) {
        console.error('LTI initialization error:', error);
    }
}

// Start LTI provider if in production
if (process.env.NODE_ENV === 'production') {
    initializeLTI();
}

export default router;
export { lti };