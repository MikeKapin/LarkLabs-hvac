-- AI-Powered Adaptive Practice Exam System Database Schema
-- For Canadian Gas Technician TSSA G2/G3 Certification Preparation
-- Aligned with CSA B149.1-25 and CSA B149.2 standards

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table for authentication and basic info
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    certification_level VARCHAR(10) CHECK (certification_level IN ('G2', 'G3', 'BOTH')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- User profiles for detailed information
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    company_name VARCHAR(255),
    years_experience INTEGER,
    current_certification VARCHAR(50),
    target_exam_date DATE,
    study_preferences JSONB DEFAULT '{}',
    learning_style VARCHAR(50),
    preferred_difficulty VARCHAR(20) DEFAULT 'adaptive',
    timezone VARCHAR(50) DEFAULT 'America/Toronto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CSA code sections and standards
CREATE TABLE csa_standards (
    id SERIAL PRIMARY KEY,
    standard_code VARCHAR(20) NOT NULL, -- B149.1-25, B149.2, etc.
    section_number VARCHAR(50) NOT NULL,
    section_title VARCHAR(255) NOT NULL,
    description TEXT,
    applies_to_g2 BOOLEAN DEFAULT false,
    applies_to_g3 BOOLEAN DEFAULT false,
    version VARCHAR(20) DEFAULT '2025',
    effective_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competency areas and learning objectives
CREATE TABLE competencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    certification_level VARCHAR(10) NOT NULL CHECK (certification_level IN ('G2', 'G3', 'BOTH')),
    category VARCHAR(100), -- Safety, Installation, Troubleshooting, etc.
    weight DECIMAL(3,2) DEFAULT 1.0, -- Importance weighting for adaptive algorithm
    prerequisite_competency_id INTEGER REFERENCES competencies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question bank with comprehensive categorization
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_type VARCHAR(30) NOT NULL CHECK (question_type IN 
        ('multiple_choice', 'scenario_based', 'calculation', 'code_interpretation', 'image_based', 'matching')),
    question_text TEXT NOT NULL,
    question_data JSONB NOT NULL, -- Options, images, calculations, etc.
    correct_answer JSONB NOT NULL,
    explanation TEXT NOT NULL,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_time_minutes INTEGER DEFAULT 2,
    points INTEGER DEFAULT 1,
    certification_level VARCHAR(10) NOT NULL CHECK (certification_level IN ('G2', 'G3', 'BOTH')),
    competency_id INTEGER REFERENCES competencies(id),
    csa_standard_id INTEGER REFERENCES csa_standards(id),
    tags TEXT[], -- Additional categorization
    media_urls JSONB DEFAULT '[]', -- Images, diagrams, etc.
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    difficulty_data JSONB DEFAULT '{}' -- Statistical difficulty data
);

-- Question relationships for prerequisites and follow-ups
CREATE TABLE question_relationships (
    id SERIAL PRIMARY KEY,
    parent_question_id UUID REFERENCES questions(id),
    child_question_id UUID REFERENCES questions(id),
    relationship_type VARCHAR(30) CHECK (relationship_type IN ('prerequisite', 'follow_up', 'similar_topic', 'escalation')),
    strength DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Practice exams and exam sessions
CREATE TABLE practice_exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    certification_level VARCHAR(10) NOT NULL CHECK (certification_level IN ('G2', 'G3')),
    exam_type VARCHAR(30) DEFAULT 'practice' CHECK (exam_type IN ('practice', 'quick_session', 'full_simulation', 'diagnostic', 'final_prep')),
    total_questions INTEGER NOT NULL,
    time_limit_minutes INTEGER,
    passing_score DECIMAL(5,2) DEFAULT 75.0,
    is_adaptive BOOLEAN DEFAULT true,
    difficulty_range JSONB DEFAULT '[1,5]',
    competency_weights JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User exam attempts and sessions
CREATE TABLE user_exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    practice_exam_id UUID REFERENCES practice_exams(id),
    status VARCHAR(20) DEFAULT 'started' CHECK (status IN ('started', 'paused', 'completed', 'abandoned')),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    total_score DECIMAL(5,2),
    percentage_score DECIMAL(5,2),
    time_taken_minutes INTEGER,
    questions_answered INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    adaptive_data JSONB DEFAULT '{}', -- Algorithm state and adjustments
    session_metadata JSONB DEFAULT '{}' -- Device, browser, etc.
);

-- Individual question responses
CREATE TABLE user_question_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_attempt_id UUID REFERENCES user_exam_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    user_answer JSONB,
    is_correct BOOLEAN,
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
    time_spent_seconds INTEGER,
    attempt_number INTEGER DEFAULT 1,
    hints_used INTEGER DEFAULT 0,
    response_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feedback_viewed BOOLEAN DEFAULT false,
    bookmarked BOOLEAN DEFAULT false
);

-- User learning progress and analytics
CREATE TABLE user_progress (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    competency_id INTEGER REFERENCES competencies(id),
    mastery_level DECIMAL(3,2) DEFAULT 0.0 CHECK (mastery_level BETWEEN 0.0 AND 1.0),
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    avg_response_time DECIMAL(8,2), -- in seconds
    last_practiced TIMESTAMP,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, competency_id)
);

-- Adaptive learning algorithm state
CREATE TABLE user_learning_state (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_difficulty_level DECIMAL(3,2) DEFAULT 2.5,
    knowledge_gaps JSONB DEFAULT '[]',
    strength_areas JSONB DEFAULT '[]',
    recommended_focus JSONB DEFAULT '{}',
    learning_velocity DECIMAL(5,2), -- Questions per hour
    retention_rate DECIMAL(3,2),
    prediction_confidence DECIMAL(3,2),
    next_review_date TIMESTAMP,
    algorithm_version VARCHAR(10) DEFAULT '1.0',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spaced repetition tracking
CREATE TABLE spaced_repetition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    repetition_number INTEGER DEFAULT 1,
    ease_factor DECIMAL(3,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    next_review_date TIMESTAMP NOT NULL,
    last_review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quality_of_response INTEGER CHECK (quality_of_response BETWEEN 0 AND 5)
);

-- Study sessions and learning analytics
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(30) DEFAULT 'practice' CHECK (session_type IN ('practice', 'review', 'exam', 'focused_study')),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    focus_areas JSONB DEFAULT '[]',
    performance_metrics JSONB DEFAULT '{}',
    notes TEXT
);

-- Performance analytics and reporting
CREATE TABLE performance_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    analysis_date DATE DEFAULT CURRENT_DATE,
    certification_level VARCHAR(10) NOT NULL,
    overall_readiness DECIMAL(5,2),
    predicted_score DECIMAL(5,2),
    weak_areas JSONB DEFAULT '[]',
    strong_areas JSONB DEFAULT '[]',
    recommended_study_hours INTEGER,
    target_exam_date DATE,
    confidence_interval JSONB DEFAULT '{}',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content management for instructors
CREATE TABLE content_versions (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(30) NOT NULL CHECK (content_type IN ('question', 'explanation', 'media')),
    content_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    changes_description TEXT,
    changed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT false
);

-- System configuration and settings
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for optimal performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_questions_certification_level ON questions(certification_level);
CREATE INDEX idx_questions_competency_id ON questions(competency_id);
CREATE INDEX idx_questions_difficulty_level ON questions(difficulty_level);
CREATE INDEX idx_questions_is_active ON questions(is_active);
CREATE INDEX idx_user_exam_attempts_user_id ON user_exam_attempts(user_id);
CREATE INDEX idx_user_exam_attempts_status ON user_exam_attempts(status);
CREATE INDEX idx_user_question_responses_user_id ON user_question_responses(user_id);
CREATE INDEX idx_user_question_responses_question_id ON user_question_responses(question_id);
CREATE INDEX idx_user_question_responses_is_correct ON user_question_responses(is_correct);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_mastery_level ON user_progress(mastery_level);
CREATE INDEX idx_spaced_repetition_next_review ON spaced_repetition(next_review_date);
CREATE INDEX idx_performance_analytics_user_date ON performance_analytics(user_id, analysis_date);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial system settings with TSSA exam parameters
INSERT INTO system_settings (key, value, description, is_public) VALUES
('adaptive_algorithm_version', '"1.0"', 'Current version of the adaptive learning algorithm', true),
('tssa_full_exam_questions_min', '145', 'Minimum questions for TSSA full exam simulation', true),
('tssa_full_exam_questions_max', '175', 'Maximum questions for TSSA full exam simulation', true),
('tssa_full_exam_time_minutes', '210', 'TSSA full exam time limit (3.5 hours)', true),
('tssa_full_exam_passing_score', '75.0', 'TSSA full exam minimum passing score (75%)', true),
('quick_session_questions', '25', 'Number of questions for quick study sessions', true),
('quick_session_time_minutes', '30', 'Time limit for quick study sessions', true),
('quick_session_passing_score', '70.0', 'Passing score for quick sessions', true),
('practice_session_questions', '50', 'Number of questions for standard practice sessions', true),
('practice_session_time_minutes', '75', 'Time limit for standard practice sessions', true),
('spaced_repetition_enabled', 'true', 'Enable spaced repetition algorithm', false),
('analytics_retention_days', '730', 'How long to keep detailed analytics data', false);

-- Insert default exam templates
INSERT INTO practice_exams (id, name, description, certification_level, exam_type, total_questions, time_limit_minutes, passing_score, is_adaptive) VALUES
(uuid_generate_v4(), 'TSSA G2 Full Simulation', 'Complete TSSA G2 exam simulation with 160 questions over 3.5 hours', 'G2', 'full_simulation', 160, 210, 75.0, true),
(uuid_generate_v4(), 'TSSA G3 Full Simulation', 'Complete TSSA G3 exam simulation with 160 questions over 3.5 hours', 'G3', 'full_simulation', 160, 210, 75.0, true),
(uuid_generate_v4(), 'G2 Quick Session', 'Quick 25-question practice session for G2 certification', 'G2', 'quick_session', 25, 30, 70.0, true),
(uuid_generate_v4(), 'G3 Quick Session', 'Quick 25-question practice session for G3 certification', 'G3', 'quick_session', 25, 30, 70.0, true),
(uuid_generate_v4(), 'G2 Practice Session', 'Standard 50-question practice for G2 certification', 'G2', 'practice', 50, 75, 70.0, true),
(uuid_generate_v4(), 'G3 Practice Session', 'Standard 50-question practice for G3 certification', 'G3', 'practice', 50, 75, 70.0, true),
(uuid_generate_v4(), 'G2 Diagnostic Assessment', 'Comprehensive diagnostic to identify knowledge gaps', 'G2', 'diagnostic', 75, 90, 65.0, true),
(uuid_generate_v4(), 'G3 Diagnostic Assessment', 'Comprehensive diagnostic to identify knowledge gaps', 'G3', 'diagnostic', 75, 90, 65.0, true);