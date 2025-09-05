export type UserTier = 'FREE' | 'PREMIUM' | 'INSTITUTIONAL';

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  skillLevel: SkillLevel;
  registrationDate: Date;
  lastActiveDate: Date;
  preferences: UserPreferences;
  certifications: Certification[];
}

export interface UserPreferences {
  enableHapticFeedback: boolean;
  enableVoiceNarration: boolean;
  preferredMeasurementUnits: 'METRIC' | 'IMPERIAL';
  darkModeEnabled: boolean;
  showSafetyReminders: boolean;
  autoSaveProgress: boolean;
  difficultyProgression: 'LINEAR' | 'ADAPTIVE';
}

export interface UserProgress {
  userId: string;
  circuitsCompleted: string[];
  totalTimeSpent: number; // minutes
  skillAssessments: SkillAssessment[];
  achievements: Achievement[];
  currentStreak: number; // days
  longestStreak: number;
  lastSessionDate: Date;
  weakAreas: string[]; // circuit categories where user struggles
  strongAreas: string[]; // circuit categories where user excels
}

export interface SkillAssessment {
  id: string;
  category: 'MULTIMETER_USE' | 'CIRCUIT_ANALYSIS' | 'SAFETY_PROTOCOLS' | 'TROUBLESHOOTING';
  score: number; // 0-100
  completedDate: Date;
  timeToComplete: number; // minutes
  mistakesMade: AssessmentMistake[];
  recommendations: string[];
}

export interface AssessmentMistake {
  questionId: string;
  incorrectAnswer: string;
  correctAnswer: string;
  category: string;
  explanation: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedDate: Date;
  category: 'SAFETY' | 'SKILL' | 'PROGRESS' | 'SPECIAL';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';
}

export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: Date;
  expirationDate?: Date;
  certificateNumber: string;
  isVerified: boolean;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  prerequisiteSkills: string[];
  circuits: string[]; // circuit IDs in order
  milestones: LearningMilestone[];
  completionCertificate?: string;
}

export interface LearningMilestone {
  id: string;
  name: string;
  description: string;
  requiredScore: number;
  isCompleted: boolean;
  completedDate?: Date;
  rewards: Achievement[];
}

export interface SessionData {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  circuitId: string;
  measurements: SessionMeasurement[];
  safetyViolations: SafetyViolation[];
  completionStatus: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  finalScore?: number;
  timeToComplete?: number;
}

export interface SessionMeasurement {
  timestamp: Date;
  multimeterMode: string;
  testPoint: string;
  measuredValue: number;
  expectedValue: number;
  accuracy: number;
  isCorrect: boolean;
}

export interface SafetyViolation {
  timestamp: Date;
  violationType: 'PROBE_PLACEMENT' | 'RANGE_SELECTION' | 'POWER_STATE' | 'PPE_MISSING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  preventionTip: string;
}