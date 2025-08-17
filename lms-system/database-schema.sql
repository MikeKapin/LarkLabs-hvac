-- LARK Labs HVAC LMS Database Schema
-- D2L Brightspace Compatible Learning Management System
-- For G2/G3 TSSA Certification Courses

-- Core User Management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor', 'admin', 'school_admin')),
    school_id UUID REFERENCES schools(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    lti_user_id VARCHAR(255), -- For LTI integration
    brightspace_user_id VARCHAR(255) -- For D2L Brightspace mapping
);

-- Educational Institutions
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    license_type VARCHAR(50) NOT NULL CHECK (license_type IN ('trial', 'basic', 'premium', 'enterprise')),
    license_expires_at TIMESTAMP,
    max_students INTEGER DEFAULT 50,
    contact_email VARCHAR(255) NOT NULL,
    billing_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    lti_platform_id VARCHAR(255), -- For LTI platform identification
    brightspace_org_id VARCHAR(255) -- D2L organization ID
);

-- Certification Programs
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- 'G2 TSSA Certification', 'G3 TSSA Certification'
    code VARCHAR(10) NOT NULL UNIQUE, -- 'G2', 'G3'
    description TEXT,
    duration_weeks INTEGER DEFAULT 16,
    certification_authority VARCHAR(100) DEFAULT 'TSSA',
    prerequisites TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Course Structure
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id),
    school_id UUID NOT NULL REFERENCES schools(id),
    instructor_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    semester VARCHAR(20),
    start_date DATE,
    end_date DATE,
    enrollment_limit INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    lti_context_id VARCHAR(255), -- For LTI context mapping
    brightspace_course_id VARCHAR(255) -- D2L course ID
);

-- Learning Units (Maps to your CSA_Unit_X content)
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id),
    unit_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    learning_objectives TEXT[],
    estimated_hours DECIMAL(4,2),
    order_index INTEGER NOT NULL,
    content_file_path VARCHAR(500), -- Path to HTML content
    pdf_file_path VARCHAR(500), -- Path to PDF materials
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(program_id, unit_number)
);

-- Individual Chapters within Units
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id),
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_file_path VARCHAR(500) NOT NULL,
    estimated_minutes INTEGER DEFAULT 30,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(unit_id, chapter_number)
);

-- Student Enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    completion_date DATE,
    final_grade DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- Student Progress Tracking
CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id),
    chapter_id UUID NOT NULL REFERENCES chapters(id),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent_minutes INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, chapter_id)
);

-- Assignments and Assessments
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    unit_id UUID REFERENCES units(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('quiz', 'exam', 'practical', 'project', 'discussion')),
    max_points DECIMAL(8,2) NOT NULL DEFAULT 100,
    due_date TIMESTAMP,
    attempts_allowed INTEGER DEFAULT 1,
    time_limit_minutes INTEGER,
    questions_data JSONB, -- Stores quiz questions and answers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Student Assignment Submissions
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id),
    student_id UUID NOT NULL REFERENCES users(id),
    attempt_number INTEGER DEFAULT 1,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answers_data JSONB, -- Stores student responses
    points_earned DECIMAL(8,2),
    feedback TEXT,
    graded_at TIMESTAMP,
    graded_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('in_progress', 'submitted', 'graded', 'returned')),
    UNIQUE(assignment_id, student_id, attempt_number)
);

-- Gradebook Calculations
CREATE TABLE gradebook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id),
    assignment_id UUID NOT NULL REFERENCES assignments(id),
    points_earned DECIMAL(8,2),
    points_possible DECIMAL(8,2),
    percentage DECIMAL(5,2),
    letter_grade VARCHAR(5),
    submitted_at TIMESTAMP,
    graded_at TIMESTAMP,
    is_dropped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, assignment_id)
);

-- LTI Integration Support
CREATE TABLE lti_launches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    lti_deployment_id VARCHAR(255),
    lti_message_hint VARCHAR(255),
    context_id VARCHAR(255),
    resource_link_id VARCHAR(255),
    platform_instance_guid VARCHAR(255),
    launched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_data JSONB
);

-- SCORM/xAPI Compliance Support
CREATE TABLE learning_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    activity_type VARCHAR(50) NOT NULL, -- 'experienced', 'completed', 'mastered', 'failed'
    object_id VARCHAR(255) NOT NULL, -- Chapter, unit, or assessment identifier
    verb VARCHAR(50) NOT NULL, -- xAPI verb
    result_data JSONB, -- Score, completion, time, etc.
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    context_data JSONB -- Additional context for xAPI
);

-- School Analytics and Reporting
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id),
    date DATE NOT NULL,
    active_students INTEGER DEFAULT 0,
    active_instructors INTEGER DEFAULT 0,
    modules_accessed INTEGER DEFAULT 0,
    assessments_completed INTEGER DEFAULT 0,
    total_study_time_minutes INTEGER DEFAULT 0,
    certification_completions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, date)
);

-- Certification Tracking
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    issued_date DATE NOT NULL,
    expiry_date DATE,
    certificate_number VARCHAR(100) UNIQUE,
    final_score DECIMAL(5,2),
    certification_file_path VARCHAR(500),
    tssa_registered BOOLEAN DEFAULT FALSE,
    tssa_registration_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Licensing and Multi-Tenancy
CREATE TABLE content_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    license_start_date DATE NOT NULL,
    license_end_date DATE NOT NULL,
    student_limit INTEGER,
    features_included TEXT[],
    pricing_tier VARCHAR(50),
    annual_fee DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_role ON users(school_id, role);
CREATE INDEX idx_enrollments_student_course ON enrollments(student_id, course_id);
CREATE INDEX idx_student_progress_enrollment ON student_progress(enrollment_id);
CREATE INDEX idx_submissions_assignment_student ON submissions(assignment_id, student_id);
CREATE INDEX idx_gradebook_enrollment ON gradebook_entries(enrollment_id);
CREATE INDEX idx_analytics_school_date ON usage_analytics(school_id, date);
CREATE INDEX idx_lti_launches_user_course ON lti_launches(user_id, course_id);
CREATE INDEX idx_learning_activities_student_course ON learning_activities(student_id, course_id);

-- Sample Data for G3 and G2 Programs
INSERT INTO programs (name, code, description, duration_weeks) VALUES 
(
    'G3 TSSA Certification', 
    'G3', 
    'Entry-level gas technician certification covering safety, tools, regulations, and basic appliance knowledge. Prepares students for TSSA G3 certification exam.',
    12
),
(
    'G2 TSSA Certification', 
    'G2', 
    'Advanced gas technician certification covering complex systems, installations, troubleshooting, and specialized appliances. Prepares students for TSSA G2 certification exam.',
    24
);

-- Sample Units for G3 Program
INSERT INTO units (program_id, unit_number, title, description, learning_objectives, estimated_hours, order_index, content_file_path, pdf_file_path) 
SELECT 
    p.id,
    1,
    'Safety Fundamentals',
    'Comprehensive safety training for gas technicians including workplace safety, hazard identification, and emergency procedures.',
    ARRAY['Identify common workplace hazards', 'Apply proper safety procedures', 'Use personal protective equipment correctly', 'Respond to gas emergencies'],
    8.0,
    1,
    'training/g3/G3/CSA_Unit_1_Safety_Chapter_Reviews.html',
    'training/g3/G3/CSA_Unit_1_Safety.pdf'
FROM programs p WHERE p.code = 'G3';

-- Add more units as needed...