/**
 * Progress Tracking Service for TSSA Practice Exam System
 * Handles user progress, performance analytics, and learning state management
 */

import { performancePrediction, learningAnalytics } from '../utils/learningAlgorithms.js';
import authService from './authService.js';

class ProgressTrackingService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
  }

  /**
   * Initialize user progress tracking
   */
  async initializeUserProgress(userId, certificationLevel) {
    try {
      const response = await fetch(`${this.baseURL}/progress/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authService.getAuthHeader(),
        },
        body: JSON.stringify({
          userId,
          certificationLevel
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize progress tracking');
      }

      return {
        success: true,
        progress: data.progress
      };
    } catch (error) {
      console.error('Progress initialization error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Record exam attempt
   */
  async recordExamAttempt(examData) {
    try {
      const response = await fetch(`${this.baseURL}/progress/exam-attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authService.getAuthHeader(),
        },
        body: JSON.stringify({
          userId: authService.getCurrentUser()?.id,
          practiceExamId: examData.examId,
          examType: examData.examType,
          totalQuestions: examData.totalQuestions,
          timeLimit: examData.timeLimit,
          sessionMetadata: {
            device: navigator.userAgent,
            startTime: examData.startTime,
            examConfig: examData.examConfig
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to record exam attempt');
      }

      return {
        success: true,
        attemptId: data.attemptId
      };
    } catch (error) {
      console.error('Exam attempt recording error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Record question response
   */
  async recordQuestionResponse(responseData) {
    try {
      const response = await fetch(`${this.baseURL}/progress/question-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authService.getAuthHeader(),
        },
        body: JSON.stringify({
          userId: authService.getCurrentUser()?.id,
          examAttemptId: responseData.attemptId,
          questionId: responseData.questionId,
          userAnswer: responseData.userAnswer,
          isCorrect: responseData.isCorrect,
          confidenceLevel: responseData.confidenceLevel,
          timeSpentSeconds: responseData.timeSpent,
          hintsUsed: responseData.hintsUsed || 0,
          attemptNumber: responseData.attemptNumber || 1
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to record question response');
      }

      // Update real-time progress
      await this.updateCompetencyProgress(
        responseData.questionId, 
        responseData.isCorrect, 
        responseData.timeSpent,
        responseData.confidenceLevel
      );

      return {
        success: true,
        responseId: data.responseId
      };
    } catch (error) {
      console.error('Question response recording error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Complete exam attempt
   */
  async completeExamAttempt(attemptId, results) {
    try {
      const response = await fetch(`${this.baseURL}/progress/complete-exam`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authService.getAuthHeader(),
        },
        body: JSON.stringify({
          attemptId,
          totalScore: results.totalScore,
          percentageScore: results.percentageScore,
          timeTakenMinutes: results.timeTaken,
          questionsAnswered: results.questionsAnswered,
          questionsCorrect: results.questionsCorrect,
          endTime: new Date().toISOString(),
          status: results.status || 'completed'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete exam attempt');
      }

      // Trigger progress analysis update
      await this.updateProgressAnalytics();

      return {
        success: true,
        attempt: data.attempt,
        updatedProgress: data.progress
      };
    } catch (error) {
      console.error('Exam completion error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get user progress overview
   */
  async getUserProgress(userId = null) {
    try {
      const targetUserId = userId || authService.getCurrentUser()?.id;
      const response = await fetch(`${this.baseURL}/progress/user/${targetUserId}`, {
        headers: {
          'Authorization': authService.getAuthHeader(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user progress');
      }

      return {
        success: true,
        progress: data.progress,
        competencyScores: data.competencyScores,
        recentActivity: data.recentActivity,
        learningState: data.learningState
      };
    } catch (error) {
      console.error('User progress fetch error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get detailed performance analytics
   */
  async getPerformanceAnalytics(timeRange = '30days') {
    try {
      const userId = authService.getCurrentUser()?.id;
      const response = await fetch(`${this.baseURL}/progress/analytics/${userId}?timeRange=${timeRange}`, {
        headers: {
          'Authorization': authService.getAuthHeader(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch performance analytics');
      }

      return {
        success: true,
        analytics: data.analytics,
        trends: data.trends,
        predictions: data.predictions,
        recommendations: data.recommendations
      };
    } catch (error) {
      console.error('Performance analytics fetch error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get exam readiness assessment
   */
  async getExamReadiness(certificationLevel) {
    try {
      const userId = authService.getCurrentUser()?.id;
      const response = await fetch(`${this.baseURL}/progress/readiness/${userId}?cert=${certificationLevel}`, {
        headers: {
          'Authorization': authService.getAuthHeader(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to assess exam readiness');
      }

      // Use client-side prediction algorithm as backup/validation
      const clientPrediction = performancePrediction.predictExamScore(
        data.userProgress, 
        certificationLevel
      );

      return {
        success: true,
        readiness: data.readiness,
        prediction: data.prediction,
        clientPrediction,
        recommendations: data.recommendations,
        strengths: data.strengths,
        weaknesses: data.weaknesses
      };
    } catch (error) {
      console.error('Exam readiness assessment error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get learning analytics and insights
   */
  async getLearningAnalytics() {
    try {
      const userId = authService.getCurrentUser()?.id;
      const response = await fetch(`${this.baseURL}/progress/learning-analytics/${userId}`, {
        headers: {
          'Authorization': authService.getAuthHeader(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch learning analytics');
      }

      return {
        success: true,
        analytics: data.analytics,
        patterns: data.patterns,
        insights: data.insights,
        velocity: data.velocity
      };
    } catch (error) {
      console.error('Learning analytics fetch error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Update study preferences
   */
  async updateStudyPreferences(preferences) {
    try {
      const userId = authService.getCurrentUser()?.id;
      const response = await fetch(`${this.baseURL}/progress/preferences/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authService.getAuthHeader(),
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update study preferences');
      }

      return {
        success: true,
        preferences: data.preferences
      };
    } catch (error) {
      console.error('Study preferences update error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get spaced repetition schedule
   */
  async getSpacedRepetitionSchedule() {
    try {
      const userId = authService.getCurrentUser()?.id;
      const response = await fetch(`${this.baseURL}/progress/spaced-repetition/${userId}`, {
        headers: {
          'Authorization': authService.getAuthHeader(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch spaced repetition schedule');
      }

      return {
        success: true,
        schedule: data.schedule,
        dueToday: data.dueToday,
        upcoming: data.upcoming
      };
    } catch (error) {
      console.error('Spaced repetition schedule fetch error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Bookmark question for review
   */
  async bookmarkQuestion(questionId, bookmarked = true) {
    try {
      const userId = authService.getCurrentUser()?.id;
      const response = await fetch(`${this.baseURL}/progress/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authService.getAuthHeader(),
        },
        body: JSON.stringify({
          userId,
          questionId,
          bookmarked
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to bookmark question');
      }

      return {
        success: true,
        bookmarked: data.bookmarked
      };
    } catch (error) {
      console.error('Question bookmark error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get bookmarked questions
   */
  async getBookmarkedQuestions() {
    try {
      const userId = authService.getCurrentUser()?.id;
      const response = await fetch(`${this.baseURL}/progress/bookmarks/${userId}`, {
        headers: {
          'Authorization': authService.getAuthHeader(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookmarked questions');
      }

      return {
        success: true,
        bookmarks: data.bookmarks
      };
    } catch (error) {
      console.error('Bookmarked questions fetch error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get study session history
   */
  async getStudySessionHistory(limit = 10) {
    try {
      const userId = authService.getCurrentUser()?.id;
      const response = await fetch(`${this.baseURL}/progress/study-sessions/${userId}?limit=${limit}`, {
        headers: {
          'Authorization': authService.getAuthHeader(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch study session history');
      }

      return {
        success: true,
        sessions: data.sessions,
        statistics: data.statistics
      };
    } catch (error) {
      console.error('Study session history fetch error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Start study session
   */
  async startStudySession(sessionType, focusAreas = []) {
    try {
      const userId = authService.getCurrentUser()?.id;
      const response = await fetch(`${this.baseURL}/progress/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authService.getAuthHeader(),
        },
        body: JSON.stringify({
          userId,
          sessionType,
          focusAreas,
          startTime: new Date().toISOString()
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to start study session');
      }

      return {
        success: true,
        sessionId: data.sessionId
      };
    } catch (error) {
      console.error('Study session start error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * End study session
   */
  async endStudySession(sessionId, results) {
    try {
      const response = await fetch(`${this.baseURL}/progress/end-session/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authService.getAuthHeader(),
        },
        body: JSON.stringify({
          endTime: new Date().toISOString(),
          questionsAttempted: results.questionsAttempted,
          questionsCorrect: results.questionsCorrect,
          performanceMetrics: results.metrics,
          notes: results.notes
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to end study session');
      }

      return {
        success: true,
        session: data.session
      };
    } catch (error) {
      console.error('Study session end error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Private helper methods

  /**
   * Update competency progress based on question response
   */
  async updateCompetencyProgress(questionId, isCorrect, timeSpent, confidence) {
    try {
      const userId = authService.getCurrentUser()?.id;
      await fetch(`${this.baseURL}/progress/competency-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authService.getAuthHeader(),
        },
        body: JSON.stringify({
          userId,
          questionId,
          isCorrect,
          timeSpent,
          confidence
        }),
      });
    } catch (error) {
      console.error('Competency progress update error:', error);
    }
  }

  /**
   * Update progress analytics
   */
  async updateProgressAnalytics() {
    try {
      const userId = authService.getCurrentUser()?.id;
      await fetch(`${this.baseURL}/progress/update-analytics/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': authService.getAuthHeader(),
        },
      });
    } catch (error) {
      console.error('Progress analytics update error:', error);
    }
  }

  /**
   * Calculate local progress statistics
   */
  calculateLocalProgress(responses) {
    if (!responses || responses.length === 0) {
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageTime: 0,
        averageConfidence: 0
      };
    }

    const totalQuestions = responses.length;
    const correctAnswers = responses.filter(r => r.isCorrect).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const averageTime = responses.reduce((sum, r) => sum + r.timeSpent, 0) / totalQuestions;
    const averageConfidence = responses.reduce((sum, r) => sum + (r.confidence || 3), 0) / totalQuestions;

    return {
      totalQuestions,
      correctAnswers,
      accuracy: Math.round(accuracy * 100) / 100,
      averageTime: Math.round(averageTime),
      averageConfidence: Math.round(averageConfidence * 100) / 100
    };
  }

  /**
   * Get progress summary for dashboard
   */
  getProgressSummary(progressData) {
    const summary = {
      overallProgress: 0,
      strengths: [],
      weaknesses: [],
      recentImprovement: false,
      studyStreak: 0,
      totalStudyTime: 0
    };

    if (!progressData) return summary;

    // Calculate overall progress based on competency scores
    if (progressData.competencyScores) {
      const scores = Object.values(progressData.competencyScores);
      summary.overallProgress = scores.length > 0 
        ? Math.round((scores.reduce((sum, score) => sum + score.mastery, 0) / scores.length) * 100)
        : 0;

      // Identify strengths (>80%) and weaknesses (<60%)
      Object.entries(progressData.competencyScores).forEach(([competency, data]) => {
        const masteryPercent = data.mastery * 100;
        if (masteryPercent >= 80) {
          summary.strengths.push(competency);
        } else if (masteryPercent < 60) {
          summary.weaknesses.push(competency);
        }
      });
    }

    // Calculate study streak and total time
    if (progressData.recentActivity) {
      summary.studyStreak = this.calculateStudyStreak(progressData.recentActivity);
      summary.totalStudyTime = this.calculateTotalStudyTime(progressData.recentActivity);
    }

    return summary;
  }

  /**
   * Calculate study streak
   */
  calculateStudyStreak(activities) {
    if (!activities || activities.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateString = currentDate.toISOString().split('T')[0];
      const hasActivity = activities.some(activity => 
        activity.date && activity.date.startsWith(dateString)
      );

      if (hasActivity) {
        streak++;
      } else if (streak > 0) {
        break; // Streak broken
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  /**
   * Calculate total study time
   */
  calculateTotalStudyTime(activities) {
    if (!activities || activities.length === 0) return 0;

    return activities.reduce((total, activity) => {
      return total + (activity.duration || 0);
    }, 0);
  }
}

// Create singleton instance
const progressTrackingService = new ProgressTrackingService();

export default progressTrackingService;