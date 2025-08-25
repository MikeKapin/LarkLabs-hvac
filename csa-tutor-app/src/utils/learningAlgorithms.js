/**
 * Supporting algorithms for the Adaptive Learning Engine
 * Includes spaced repetition, difficulty calculation, and performance prediction
 */

/**
 * Spaced Repetition Algorithm (SM-2 based)
 * Optimizes retention through scientifically-backed review intervals
 */
export class SpacedRepetitionAlgorithm {
  constructor() {
    this.defaultEaseFactor = 2.5;
    this.minEaseFactor = 1.3;
    this.maxEaseFactor = 4.0;
  }

  /**
   * Calculate next review date and ease factor
   * @param {Object} card - Spaced repetition card data
   * @param {number} quality - Response quality (0-5)
   * @returns {Object} Updated card with new interval and ease factor
   */
  updateCard(card, quality) {
    const { repetitionNumber = 0, easeFactor = this.defaultEaseFactor } = card;
    
    let newEaseFactor = easeFactor;
    let newInterval = 1;
    let newRepetition = repetitionNumber + 1;

    // Update ease factor based on response quality
    if (quality >= 3) {
      // Correct response
      newEaseFactor = Math.max(
        this.minEaseFactor,
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );

      // Calculate interval based on repetition number
      if (newRepetition === 1) {
        newInterval = 1;
      } else if (newRepetition === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.ceil(card.intervalDays * newEaseFactor);
      }
    } else {
      // Incorrect response - reset repetition
      newRepetition = 0;
      newInterval = 1;
      // Reduce ease factor for difficult questions
      newEaseFactor = Math.max(this.minEaseFactor, easeFactor - 0.2);
    }

    // Cap the maximum interval at 180 days for active learning
    newInterval = Math.min(newInterval, 180);

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      ...card,
      repetitionNumber: newRepetition,
      easeFactor: newEaseFactor,
      intervalDays: newInterval,
      nextReviewDate,
      lastReviewDate: new Date(),
      qualityOfResponse: quality
    };
  }

  /**
   * Get questions due for review
   * @param {Array} cards - Array of spaced repetition cards
   * @returns {Array} Questions due for review today
   */
  getQuestionsForReview(cards) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return cards.filter(card => {
      const reviewDate = new Date(card.nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate <= today;
    });
  }

  /**
   * Calculate retention probability
   * @param {Object} card - Spaced repetition card
   * @returns {number} Probability of retention (0-1)
   */
  calculateRetentionProbability(card) {
    const daysSinceLastReview = Math.ceil(
      (new Date() - new Date(card.lastReviewDate)) / (1000 * 60 * 60 * 24)
    );
    
    // Ebbinghaus forgetting curve approximation
    const retentionRate = Math.pow(0.5, daysSinceLastReview / card.intervalDays);
    
    // Adjust for ease factor (higher ease = better retention)
    const easeAdjustment = (card.easeFactor - this.minEaseFactor) / 
                          (this.maxEaseFactor - this.minEaseFactor);
    
    return Math.min(1.0, retentionRate * (0.8 + 0.4 * easeAdjustment));
  }
}

/**
 * Question Difficulty Algorithm
 * Dynamically adjusts question difficulty based on user performance
 */
export class QuestionDifficultyAlgorithm {
  constructor() {
    this.initialDifficulty = 2.5;
    this.minDifficulty = 1.0;
    this.maxDifficulty = 5.0;
    this.adjustmentFactor = 0.3;
  }

  /**
   * Calculate statistical difficulty of a question
   * @param {Array} responses - Array of user responses to the question
   * @returns {number} Calculated difficulty (1-5)
   */
  calculateStatisticalDifficulty(responses) {
    if (responses.length < 10) {
      // Not enough data, return initial estimate
      return this.initialDifficulty;
    }

    const correctResponses = responses.filter(r => r.isCorrect).length;
    const successRate = correctResponses / responses.length;
    
    // Calculate average response time
    const avgResponseTime = responses.reduce((sum, r) => sum + r.timeSpent, 0) / responses.length;
    
    // Base difficulty from success rate (inverse relationship)
    let difficulty = 5.0 - (successRate * 4.0);
    
    // Adjust for response time (slower = more difficult)
    const avgTimeMinutes = avgResponseTime / 60;
    if (avgTimeMinutes > 3) {
      difficulty += Math.min(1.0, (avgTimeMinutes - 3) * 0.2);
    } else if (avgTimeMinutes < 1) {
      difficulty -= Math.min(1.0, (1 - avgTimeMinutes) * 0.3);
    }

    // Consider confidence levels
    const avgConfidence = responses.reduce((sum, r) => sum + (r.confidence || 3), 0) / responses.length;
    difficulty += (3 - avgConfidence) * 0.2;

    return Math.max(this.minDifficulty, Math.min(this.maxDifficulty, difficulty));
  }

  /**
   * Adjust user's current difficulty level based on recent performance
   * @param {number} currentDifficulty - Current difficulty level
   * @param {Array} recentResponses - Recent user responses
   * @returns {number} Adjusted difficulty level
   */
  adjustUserDifficulty(currentDifficulty, recentResponses) {
    if (recentResponses.length < 3) {
      return currentDifficulty;
    }

    const recentCorrect = recentResponses.filter(r => r.isCorrect).length;
    const successRate = recentCorrect / recentResponses.length;
    
    let adjustment = 0;
    
    // Adjust based on success rate
    if (successRate > 0.8) {
      // High success rate - increase difficulty
      adjustment = this.adjustmentFactor * (successRate - 0.7);
    } else if (successRate < 0.5) {
      // Low success rate - decrease difficulty
      adjustment = -this.adjustmentFactor * (0.6 - successRate);
    }

    // Consider response times
    const avgResponseTime = recentResponses.reduce((sum, r) => sum + r.timeSpent, 0) / recentResponses.length;
    const avgTimeMinutes = avgResponseTime / 60;
    
    if (avgTimeMinutes < 1 && successRate > 0.7) {
      // Fast and accurate - increase difficulty more
      adjustment += 0.1;
    } else if (avgTimeMinutes > 4) {
      // Very slow responses - decrease difficulty
      adjustment -= 0.1;
    }

    const newDifficulty = currentDifficulty + adjustment;
    return Math.max(this.minDifficulty, Math.min(this.maxDifficulty, newDifficulty));
  }

  /**
   * Predict question difficulty for a user
   * @param {Object} question - Question object
   * @param {Object} userProfile - User performance profile
   * @returns {number} Predicted difficulty for this user
   */
  predictPersonalizedDifficulty(question, userProfile) {
    let baseDifficulty = question.difficulty_level || this.initialDifficulty;
    
    // Adjust for user's competency in this area
    const competencyScore = userProfile.competencyScores?.[question.competency_id] || 0.5;
    const competencyAdjustment = (0.5 - competencyScore) * 2.0;
    
    // Adjust for user's overall skill level
    const skillAdjustment = (this.initialDifficulty - userProfile.averageDifficulty) * 0.5;
    
    const personalizedDifficulty = baseDifficulty + competencyAdjustment + skillAdjustment;
    
    return Math.max(this.minDifficulty, Math.min(this.maxDifficulty, personalizedDifficulty));
  }
}

/**
 * Performance Prediction Algorithm
 * Predicts exam performance and readiness based on practice data
 */
export class PerformancePredictionAlgorithm {
  constructor() {
    this.confidenceThreshold = 0.75;
    this.readinessThreshold = 0.80;
  }

  /**
   * Predict exam score based on practice performance
   * @param {Object} userProgress - User progress data
   * @param {string} examType - Type of exam (G2, G3)
   * @returns {Object} Prediction with score and confidence
   */
  predictExamScore(userProgress, examType) {
    const competencyWeights = this.getExamWeights(examType);
    let weightedScore = 0;
    let totalWeight = 0;
    let confidenceSum = 0;
    let validCompetencies = 0;

    // Calculate weighted score across competencies
    Object.entries(competencyWeights).forEach(([competency, weight]) => {
      const progress = userProgress[competency];
      if (progress && progress.questionsAttempted >= 10) {
        const competencyScore = progress.questionsCorrect / progress.questionsAttempted;
        const difficultyAdjustment = this.adjustScoreForDifficulty(
          competencyScore, 
          progress.averageDifficulty
        );
        
        weightedScore += difficultyAdjustment * weight;
        totalWeight += weight;
        confidenceSum += progress.confidenceScore || 0.5;
        validCompetencies++;
      }
    });

    if (totalWeight === 0) {
      return {
        predictedScore: 50,
        confidence: 0.1,
        readiness: 'insufficient_data',
        recommendations: ['Complete more practice questions in all competency areas']
      };
    }

    const normalizedScore = (weightedScore / totalWeight) * 100;
    const avgConfidence = confidenceSum / validCompetencies;
    
    // Adjust for exam conditions (typically 5-10% lower than practice)
    const examConditionAdjustment = examType === 'full_simulation' ? 0.90 : 0.95;
    const finalPredictedScore = normalizedScore * examConditionAdjustment;

    return {
      predictedScore: Math.round(finalPredictedScore),
      confidence: avgConfidence,
      readiness: this.assessReadiness(finalPredictedScore, avgConfidence),
      recommendations: this.generateRecommendations(userProgress, competencyWeights),
      breakdown: this.generateScoreBreakdown(userProgress, competencyWeights)
    };
  }

  /**
   * Adjust score based on average difficulty of questions answered
   */
  adjustScoreForDifficulty(rawScore, averageDifficulty) {
    // Boost score for higher difficulty questions
    const difficultyBonus = (averageDifficulty - 2.5) * 0.05;
    return Math.min(1.0, rawScore + difficultyBonus);
  }

  /**
   * Assess overall readiness for the exam
   */
  assessReadiness(predictedScore, confidence) {
    if (predictedScore >= 85 && confidence >= this.confidenceThreshold) {
      return 'excellent';
    } else if (predictedScore >= 78 && confidence >= 0.65) {
      return 'good';
    } else if (predictedScore >= 70 && confidence >= 0.55) {
      return 'borderline';
    } else if (predictedScore >= 60) {
      return 'needs_improvement';
    } else {
      return 'not_ready';
    }
  }

  /**
   * Generate personalized study recommendations
   */
  generateRecommendations(userProgress, competencyWeights) {
    const recommendations = [];
    const weakAreas = [];
    const strongAreas = [];

    Object.entries(competencyWeights).forEach(([competency, weight]) => {
      const progress = userProgress[competency];
      if (progress && progress.questionsAttempted >= 5) {
        const successRate = progress.questionsCorrect / progress.questionsAttempted;
        if (successRate < 0.6) {
          weakAreas.push({ competency, successRate, weight });
        } else if (successRate > 0.85) {
          strongAreas.push({ competency, successRate, weight });
        }
      }
    });

    // Prioritize weak areas by importance (weight)
    weakAreas.sort((a, b) => b.weight - a.weight);
    
    if (weakAreas.length > 0) {
      recommendations.push(
        `Focus on ${weakAreas[0].competency} - your weakest high-impact area (${Math.round(weakAreas[0].successRate * 100)}% success rate)`
      );
      
      if (weakAreas.length > 1) {
        recommendations.push(
          `Also review ${weakAreas.slice(1, 3).map(a => a.competency).join(' and ')}`
        );
      }
    }

    // Maintenance for strong areas
    if (strongAreas.length > 0) {
      recommendations.push(
        `Maintain your strength in ${strongAreas.slice(0, 2).map(a => a.competency).join(' and ')} with periodic review`
      );
    }

    // General recommendations
    if (Object.keys(userProgress).length < 6) {
      recommendations.push('Complete practice questions in all competency areas for a comprehensive assessment');
    }

    return recommendations;
  }

  /**
   * Generate detailed score breakdown by competency
   */
  generateScoreBreakdown(userProgress, competencyWeights) {
    const breakdown = {};

    Object.entries(competencyWeights).forEach(([competency, weight]) => {
      const progress = userProgress[competency];
      if (progress && progress.questionsAttempted > 0) {
        const successRate = progress.questionsCorrect / progress.questionsAttempted;
        breakdown[competency] = {
          score: Math.round(successRate * 100),
          weight: weight,
          questionsAnswered: progress.questionsAttempted,
          confidence: progress.confidenceScore || 0.5,
          averageDifficulty: progress.averageDifficulty || 2.5,
          contributionToTotal: Math.round(successRate * weight * 100)
        };
      }
    });

    return breakdown;
  }

  /**
   * Get exam weights for different certification levels
   */
  getExamWeights(examType) {
    const weights = {
      G2: {
        safety: 0.20,
        installation: 0.18,
        troubleshooting: 0.15,
        codes: 0.12,
        calculations: 0.10,
        appliances: 0.12,
        venting: 0.08,
        electricity: 0.03,
        piping: 0.02
      },
      G3: {
        safety: 0.25,
        codes: 0.20,
        calculations: 0.15,
        appliances: 0.10,
        installation: 0.08,
        venting: 0.08,
        electricity: 0.07,
        troubleshooting: 0.05,
        piping: 0.02
      }
    };

    return weights[examType] || weights.G3;
  }
}

/**
 * Learning Analytics Engine
 * Tracks and analyzes learning patterns and progress
 */
export class LearningAnalyticsEngine {
  /**
   * Calculate learning velocity (questions per hour)
   */
  calculateLearningVelocity(sessions) {
    if (sessions.length === 0) return 0;

    const totalQuestions = sessions.reduce((sum, session) => sum + session.questionsAttempted, 0);
    const totalTime = sessions.reduce((sum, session) => {
      const duration = new Date(session.endTime) - new Date(session.startTime);
      return sum + (duration / (1000 * 60 * 60)); // Convert to hours
    }, 0);

    return totalTime > 0 ? totalQuestions / totalTime : 0;
  }

  /**
   * Analyze learning patterns and identify trends
   */
  analyzeLearningPatterns(userSessions, userResponses) {
    const patterns = {
      optimalStudyTime: this.findOptimalStudyTime(userSessions),
      difficultyProgression: this.analyzeDifficultyProgression(userResponses),
      retentionRate: this.calculateRetentionRate(userResponses),
      learningCurve: this.calculateLearningCurve(userResponses),
      weaknessPatterns: this.identifyWeaknessPatterns(userResponses)
    };

    return patterns;
  }

  /**
   * Find optimal study times based on performance
   */
  findOptimalStudyTime(sessions) {
    const timePerformance = {};
    
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      const successRate = session.questionsCorrect / session.questionsAttempted;
      
      if (!timePerformance[hour]) {
        timePerformance[hour] = { total: 0, count: 0 };
      }
      
      timePerformance[hour].total += successRate;
      timePerformance[hour].count += 1;
    });

    // Calculate average success rate per hour
    const hourlyAverages = Object.entries(timePerformance).map(([hour, data]) => ({
      hour: parseInt(hour),
      averageSuccess: data.total / data.count,
      sessionCount: data.count
    }));

    // Find hours with above-average performance and sufficient data
    const avgSuccess = hourlyAverages.reduce((sum, h) => sum + h.averageSuccess, 0) / hourlyAverages.length;
    const goodHours = hourlyAverages
      .filter(h => h.averageSuccess > avgSuccess && h.sessionCount >= 3)
      .sort((a, b) => b.averageSuccess - a.averageSuccess);

    return goodHours.slice(0, 3).map(h => h.hour);
  }

  /**
   * Analyze difficulty progression over time
   */
  analyzeDifficultyProgression(responses) {
    if (responses.length < 20) return null;

    const sortedResponses = responses.sort((a, b) => new Date(a.responseTime) - new Date(b.responseTime));
    const windowSize = Math.min(20, Math.floor(responses.length / 5));
    const progressionPoints = [];

    for (let i = 0; i < sortedResponses.length - windowSize; i += windowSize) {
      const window = sortedResponses.slice(i, i + windowSize);
      const avgDifficulty = window.reduce((sum, r) => sum + r.questionDifficulty, 0) / window.length;
      const successRate = window.filter(r => r.isCorrect).length / window.length;
      
      progressionPoints.push({
        position: i + windowSize / 2,
        averageDifficulty: avgDifficulty,
        successRate: successRate,
        timestamp: window[Math.floor(window.length / 2)].responseTime
      });
    }

    return progressionPoints;
  }

  /**
   * Calculate retention rate over different time intervals
   */
  calculateRetentionRate(responses) {
    // Group questions by first attempt
    const questionAttempts = {};
    
    responses.forEach(response => {
      if (!questionAttempts[response.questionId]) {
        questionAttempts[response.questionId] = [];
      }
      questionAttempts[response.questionId].push(response);
    });

    // Calculate retention for questions attempted multiple times
    const retentionData = {};
    const intervals = [1, 7, 30]; // 1 day, 1 week, 1 month

    intervals.forEach(interval => {
      let retained = 0;
      let total = 0;

      Object.values(questionAttempts).forEach(attempts => {
        if (attempts.length >= 2) {
          const sortedAttempts = attempts.sort((a, b) => new Date(a.responseTime) - new Date(b.responseTime));
          
          for (let i = 1; i < sortedAttempts.length; i++) {
            const daysDiff = (new Date(sortedAttempts[i].responseTime) - new Date(sortedAttempts[0].responseTime)) / (1000 * 60 * 60 * 24);
            
            if (daysDiff >= interval - 1 && daysDiff <= interval + 1) {
              total++;
              if (sortedAttempts[i].isCorrect) {
                retained++;
              }
              break;
            }
          }
        }
      });

      if (total > 0) {
        retentionData[`${interval}day`] = retained / total;
      }
    });

    return retentionData;
  }

  calculateLearningCurve(responses) {
    // Implementation for learning curve calculation
    // This would track improvement over time
    return {};
  }

  identifyWeaknessPatterns(responses) {
    // Implementation for identifying patterns in incorrect responses
    // This could identify common mistake types, difficult concepts, etc.
    return {};
  }
}

// Export instances for use in the adaptive learning engine
export const spacedRepetition = new SpacedRepetitionAlgorithm();
export const questionDifficulty = new QuestionDifficultyAlgorithm();
export const performancePrediction = new PerformancePredictionAlgorithm();
export const learningAnalytics = new LearningAnalyticsEngine();