/**
 * Adaptive Learning Engine for TSSA G2/G3 Certification Practice Exams
 * Intelligent question selection based on user performance patterns
 * Supports full exam simulations and quick practice sessions
 */

import { questionDifficulty, spacedRepetition } from './learningAlgorithms.js';

class AdaptiveLearningEngine {
  constructor(userId, certificationLevel = 'G3') {
    this.userId = userId;
    this.certificationLevel = certificationLevel;
    this.algorithmVersion = '1.0';
    this.difficultyRange = [1, 5];
    this.currentDifficulty = 2.5;
    this.knowledgeGaps = [];
    this.strengthAreas = [];
    this.questionPool = [];
    this.selectedQuestions = [];
    this.userPerformanceHistory = {};
  }

  /**
   * Initialize exam session with adaptive parameters
   * @param {Object} examConfig - Exam configuration
   * @param {string} examConfig.examType - full_simulation, quick_session, practice, diagnostic
   * @param {number} examConfig.totalQuestions - Number of questions to generate
   * @param {number} examConfig.timeLimit - Time limit in minutes
   * @param {Object} userLearningState - Current user learning state
   */
  async initializeExamSession(examConfig, userLearningState = null) {
    try {
      this.examConfig = examConfig;
      
      if (userLearningState) {
        this.currentDifficulty = userLearningState.current_difficulty_level || 2.5;
        this.knowledgeGaps = userLearningState.knowledge_gaps || [];
        this.strengthAreas = userLearningState.strength_areas || [];
        this.userPerformanceHistory = userLearningState.performance_history || {};
      }

      // Load question pool based on certification level and exam type
      await this.loadQuestionPool();
      
      // Generate adaptive question selection
      this.selectedQuestions = await this.generateQuestionSelection();
      
      return {
        sessionId: this.generateSessionId(),
        questions: this.selectedQuestions,
        examConfig: this.examConfig,
        adaptiveParams: {
          initialDifficulty: this.currentDifficulty,
          knowledgeGaps: this.knowledgeGaps,
          strengthAreas: this.strengthAreas
        }
      };
    } catch (error) {
      console.error('Error initializing adaptive exam session:', error);
      throw new Error('Failed to initialize adaptive exam session');
    }
  }

  /**
   * Load question pool based on exam configuration
   */
  async loadQuestionPool() {
    // This would connect to the database in a real implementation
    // For now, we'll simulate with comprehensive question categories
    
    const competencyWeights = this.getCompetencyWeights();
    
    this.questionPool = {
      safety: await this.loadQuestionsByCompetency('safety', competencyWeights.safety),
      installation: await this.loadQuestionsByCompetency('installation', competencyWeights.installation),
      troubleshooting: await this.loadQuestionsByCompetency('troubleshooting', competencyWeights.troubleshooting),
      codes: await this.loadQuestionsByCompetency('codes', competencyWeights.codes),
      calculations: await this.loadQuestionsByCompetency('calculations', competencyWeights.calculations),
      appliances: await this.loadQuestionsByCompetency('appliances', competencyWeights.appliances),
      venting: await this.loadQuestionsByCompetency('venting', competencyWeights.venting),
      electricity: await this.loadQuestionsByCompetency('electricity', competencyWeights.electricity),
      piping: await this.loadQuestionsByCompetency('piping', competencyWeights.piping)
    };
  }

  /**
   * Get competency weights based on certification level and exam type
   */
  getCompetencyWeights() {
    const baseWeights = {
      G2: {
        safety: 0.20,           // 20% - Critical for both levels
        installation: 0.18,     // 18% - Primary G2 focus
        troubleshooting: 0.15,  // 15% - Important practical skill
        codes: 0.12,           // 12% - CSA B149.1, B149.2
        calculations: 0.10,     // 10% - Pipe sizing, pressure calculations
        appliances: 0.12,      // 12% - Appliance knowledge
        venting: 0.08,         // 8% - Venting systems
        electricity: 0.03,     // 3% - Basic electrical
        piping: 0.02          // 2% - Basic piping
      },
      G3: {
        safety: 0.25,          // 25% - Foundational knowledge
        installation: 0.08,    // 8% - Less hands-on than G2
        troubleshooting: 0.05, // 5% - Basic troubleshooting
        codes: 0.20,          // 20% - Heavy emphasis on codes
        calculations: 0.15,    // 15% - More complex calculations
        appliances: 0.10,     // 10% - Appliance theory
        venting: 0.08,        // 8% - Venting principles
        electricity: 0.07,    // 7% - More electrical than G2
        piping: 0.02         // 2% - Piping basics
      }
    };

    let weights = baseWeights[this.certificationLevel] || baseWeights.G3;

    // Adjust weights based on exam type
    if (this.examConfig.examType === 'diagnostic') {
      // Equal distribution for diagnostic assessment
      const competencyCount = Object.keys(weights).length;
      const equalWeight = 1.0 / competencyCount;
      weights = Object.keys(weights).reduce((acc, key) => {
        acc[key] = equalWeight;
        return acc;
      }, {});
    } else if (this.examConfig.examType === 'quick_session') {
      // Focus on identified knowledge gaps for quick sessions
      if (this.knowledgeGaps.length > 0) {
        weights = this.adjustWeightsForGaps(weights);
      }
    }

    return weights;
  }

  /**
   * Adjust competency weights to focus on knowledge gaps
   */
  adjustWeightsForGaps(baseWeights) {
    const adjustedWeights = { ...baseWeights };
    const gapBoost = 0.3; // Increase weight by 30% for gap areas
    
    this.knowledgeGaps.forEach(gap => {
      if (adjustedWeights[gap.competency]) {
        adjustedWeights[gap.competency] += gapBoost * gap.severity;
      }
    });

    // Normalize weights to sum to 1.0
    const total = Object.values(adjustedWeights).reduce((sum, weight) => sum + weight, 0);
    Object.keys(adjustedWeights).forEach(key => {
      adjustedWeights[key] = adjustedWeights[key] / total;
    });

    return adjustedWeights;
  }

  /**
   * Generate adaptive question selection
   */
  async generateQuestionSelection() {
    const selectedQuestions = [];
    const competencyWeights = this.getCompetencyWeights();
    const totalQuestions = this.examConfig.totalQuestions;

    // Calculate questions per competency based on weights
    const questionsPerCompetency = {};
    Object.keys(competencyWeights).forEach(competency => {
      questionsPerCompetency[competency] = Math.round(
        totalQuestions * competencyWeights[competency]
      );
    });

    // Ensure we have exactly the right number of questions
    const actualTotal = Object.values(questionsPerCompetency).reduce((sum, count) => sum + count, 0);
    if (actualTotal !== totalQuestions) {
      const diff = totalQuestions - actualTotal;
      const primaryCompetency = Object.keys(competencyWeights).reduce((a, b) => 
        competencyWeights[a] > competencyWeights[b] ? a : b
      );
      questionsPerCompetency[primaryCompetency] += diff;
    }

    // Select questions for each competency
    for (const [competency, questionCount] of Object.entries(questionsPerCompetency)) {
      if (questionCount > 0) {
        const competencyQuestions = await this.selectQuestionsForCompetency(
          competency, 
          questionCount
        );
        selectedQuestions.push(...competencyQuestions);
      }
    }

    // Shuffle questions for random presentation order
    return this.shuffleArray(selectedQuestions);
  }

  /**
   * Select questions for a specific competency with adaptive difficulty
   */
  async selectQuestionsForCompetency(competency, questionCount) {
    const availableQuestions = this.questionPool[competency] || [];
    const selectedQuestions = [];

    if (availableQuestions.length === 0) {
      console.warn(`No questions available for competency: ${competency}`);
      return [];
    }

    // Apply spaced repetition for questions due for review
    const dueForReview = await this.getQuestionsForSpacedRepetition(competency);
    
    // Prioritize questions based on adaptive algorithm
    const prioritizedQuestions = this.prioritizeQuestions(
      availableQuestions, 
      competency, 
      dueForReview
    );

    // Select questions with adaptive difficulty progression
    for (let i = 0; i < Math.min(questionCount, prioritizedQuestions.length); i++) {
      const targetDifficulty = this.calculateTargetDifficulty(i, questionCount);
      const question = this.selectQuestionByDifficulty(prioritizedQuestions, targetDifficulty);
      
      if (question) {
        selectedQuestions.push({
          ...question,
          adaptiveMetadata: {
            targetDifficulty,
            competency,
            selectionReason: this.getSelectionReason(question, competency, dueForReview)
          }
        });
        
        // Remove selected question from available pool
        const index = prioritizedQuestions.findIndex(q => q.id === question.id);
        if (index > -1) prioritizedQuestions.splice(index, 1);
      }
    }

    return selectedQuestions;
  }

  /**
   * Calculate target difficulty for question position in exam
   */
  calculateTargetDifficulty(questionIndex, totalQuestions) {
    const examType = this.examConfig.examType;
    
    if (examType === 'full_simulation') {
      // TSSA exam simulation: start easier, peak in middle, maintain high difficulty
      const progress = questionIndex / totalQuestions;
      if (progress < 0.2) {
        // Start with easier questions (20% of exam)
        return Math.max(1, this.currentDifficulty - 0.5);
      } else if (progress < 0.8) {
        // Main section with adaptive difficulty
        return this.currentDifficulty + (Math.sin(progress * Math.PI) * 0.5);
      } else {
        // Final section with challenging questions
        return Math.min(5, this.currentDifficulty + 0.5);
      }
    } else if (examType === 'quick_session') {
      // Quick session: focus on current difficulty level
      const variation = (Math.random() - 0.5) * 0.5;
      return Math.max(1, Math.min(5, this.currentDifficulty + variation));
    } else if (examType === 'diagnostic') {
      // Diagnostic: evenly distribute difficulty levels
      return 1 + (questionIndex % 5);
    } else {
      // Standard practice: progressive difficulty
      const progress = questionIndex / totalQuestions;
      return Math.max(1, Math.min(5, this.currentDifficulty + (progress * 1.5)));
    }
  }

  /**
   * Select question by target difficulty
   */
  selectQuestionByDifficulty(questions, targetDifficulty) {
    const tolerance = 0.5;
    
    // Find questions within difficulty tolerance
    const suitableQuestions = questions.filter(q => 
      Math.abs(q.difficulty_level - targetDifficulty) <= tolerance
    );

    if (suitableQuestions.length === 0) {
      // If no questions in tolerance, find closest
      return questions.reduce((closest, current) => {
        const closestDiff = Math.abs(closest.difficulty_level - targetDifficulty);
        const currentDiff = Math.abs(current.difficulty_level - targetDifficulty);
        return currentDiff < closestDiff ? current : closest;
      });
    }

    // Randomly select from suitable questions
    return suitableQuestions[Math.floor(Math.random() * suitableQuestions.length)];
  }

  /**
   * Update adaptive parameters based on user response
   */
  updateAdaptiveState(questionId, userResponse, isCorrect, responseTime, confidence) {
    const question = this.selectedQuestions.find(q => q.id === questionId);
    if (!question) return;

    const competency = question.adaptiveMetadata.competency;
    const difficulty = question.difficulty_level;

    // Update current difficulty based on performance
    if (isCorrect) {
      if (responseTime < question.estimated_time_minutes * 60 * 0.7) {
        // Fast correct answer - increase difficulty slightly
        this.currentDifficulty = Math.min(5, this.currentDifficulty + 0.1);
      }
      // Remove from knowledge gaps if consistently correct
      this.knowledgeGaps = this.knowledgeGaps.filter(gap => 
        gap.competency !== competency || gap.severity > 0.3
      );
      // Add to strength areas
      this.addToStrengthAreas(competency, difficulty);
    } else {
      // Incorrect answer - decrease difficulty and add to gaps
      this.currentDifficulty = Math.max(1, this.currentDifficulty - 0.2);
      this.addToKnowledgeGaps(competency, difficulty, confidence);
    }

    // Update spaced repetition parameters
    this.updateSpacedRepetition(questionId, isCorrect, confidence, responseTime);
  }

  /**
   * Add competency to knowledge gaps
   */
  addToKnowledgeGaps(competency, difficulty, confidence) {
    const existingGap = this.knowledgeGaps.find(gap => gap.competency === competency);
    const severity = this.calculateGapSeverity(difficulty, confidence);
    
    if (existingGap) {
      existingGap.severity = Math.min(1.0, existingGap.severity + severity * 0.3);
      existingGap.lastEncountered = new Date();
    } else {
      this.knowledgeGaps.push({
        competency,
        severity,
        firstEncountered: new Date(),
        lastEncountered: new Date(),
        occurrences: 1
      });
    }
  }

  /**
   * Add competency to strength areas
   */
  addToStrengthAreas(competency, difficulty) {
    const existingStrength = this.strengthAreas.find(strength => 
      strength.competency === competency
    );
    
    if (existingStrength) {
      existingStrength.confidence = Math.min(1.0, existingStrength.confidence + 0.1);
      existingStrength.maxDifficulty = Math.max(existingStrength.maxDifficulty, difficulty);
    } else {
      this.strengthAreas.push({
        competency,
        confidence: 0.7,
        maxDifficulty: difficulty,
        lastReinforced: new Date()
      });
    }
  }

  /**
   * Calculate gap severity based on difficulty and confidence
   */
  calculateGapSeverity(difficulty, confidence) {
    const baseSeverity = 0.3;
    const difficultyFactor = (6 - difficulty) * 0.1; // Easier questions = higher severity
    const confidenceFactor = (5 - confidence) * 0.1; // Lower confidence = higher severity
    
    return Math.min(1.0, baseSeverity + difficultyFactor + confidenceFactor);
  }

  /**
   * Get current learning state for persistence
   */
  getLearningState() {
    return {
      userId: this.userId,
      currentDifficultyLevel: this.currentDifficulty,
      knowledgeGaps: this.knowledgeGaps,
      strengthAreas: this.strengthAreas,
      recommendedFocus: this.generateRecommendedFocus(),
      algorithmVersion: this.algorithmVersion,
      lastUpdated: new Date()
    };
  }

  /**
   * Generate recommended focus areas for future study
   */
  generateRecommendedFocus() {
    const recommendations = {};
    
    // Prioritize knowledge gaps
    this.knowledgeGaps
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 3)
      .forEach((gap, index) => {
        recommendations[gap.competency] = {
          priority: 'high',
          reason: 'knowledge_gap',
          severity: gap.severity,
          recommendedQuestions: Math.ceil(20 * gap.severity),
          suggestedDifficulty: Math.max(1, this.currentDifficulty - 1)
        };
      });

    // Add maintenance for strength areas
    this.strengthAreas.forEach(strength => {
      if (!recommendations[strength.competency]) {
        recommendations[strength.competency] = {
          priority: 'maintenance',
          reason: 'strength_reinforcement',
          confidence: strength.confidence,
          recommendedQuestions: 5,
          suggestedDifficulty: strength.maxDifficulty
        };
      }
    });

    return recommendations;
  }

  /**
   * Utility functions
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Placeholder methods for database integration
  async loadQuestionsByCompetency(competency, weight) {
    // This would query the database for questions
    // Returning mock data structure for now
    return [];
  }

  async getQuestionsForSpacedRepetition(competency) {
    // This would query spaced repetition table
    return [];
  }

  prioritizeQuestions(questions, competency, dueForReview) {
    // Implement question prioritization logic
    return questions;
  }

  getSelectionReason(question, competency, dueForReview) {
    if (dueForReview.includes(question.id)) return 'spaced_repetition';
    if (this.knowledgeGaps.some(gap => gap.competency === competency)) return 'knowledge_gap';
    return 'adaptive_selection';
  }

  updateSpacedRepetition(questionId, isCorrect, confidence, responseTime) {
    // Implement spaced repetition update logic
    console.log('Updating spaced repetition for question:', questionId);
  }
}

export default AdaptiveLearningEngine;