/**
 * Adaptive TSSA Exam System - Main Application Component
 * Comprehensive exam system using actual G2/G3 questions from existing simulators
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  BookOpen, Clock, CheckCircle, AlertCircle, BarChart3, 
  Trophy, Target, Brain, Zap, Users, Settings, Help,
  Play, Pause, RotateCcw, FileText, TrendingUp
} from 'lucide-react';
import { questionBankManager, CSA_MODULES, EXAM_CONFIGS } from '../data/questionBankManager.js';
import AdaptiveLearningEngine from '../utils/adaptiveLearningEngine.js';
import { performancePrediction } from '../utils/learningAlgorithms.js';
import authService from '../services/authService.js';
import progressTrackingService from '../services/progressTrackingService.js';

const AdaptiveExamSystem = () => {
  // Core application state
  const [currentView, setCurrentView] = useState('home'); // home, exam, results, progress, settings
  const [certificationLevel, setCertificationLevel] = useState('G3'); // G3 (Level 1) or G2 (Level 2)
  const [selectedExamConfig, setSelectedExamConfig] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Exam state
  const [examState, setExamState] = useState({
    isActive: false,
    isPaused: false,
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    timeRemaining: 0,
    startTime: null,
    adaptiveEngine: null
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [examResults, setExamResults] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // References
  const timerRef = useRef(null);
  const adaptiveEngineRef = useRef(null);

  // Initialize component
  useEffect(() => {
    initializeApplication();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Authentication check
  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsAuthenticated(authService.isAuthenticated());
    setCurrentUser(user);
    
    if (user) {
      loadUserProgress(user.id);
    }
  }, []);

  /**
   * Initialize the application
   */
  const initializeApplication = async () => {
    try {
      setLoading(true);
      
      // Validate question bank
      const validation = questionBankManager.validateQuestionBank();
      if (!validation.G3.valid || !validation.G2.valid) {
        console.warn('Question bank validation issues:', validation);
      }

      // Initialize adaptive learning engine
      if (isAuthenticated && currentUser) {
        adaptiveEngineRef.current = new AdaptiveLearningEngine(
          currentUser.id,
          certificationLevel
        );
      }

      setError(null);
    } catch (err) {
      console.error('Application initialization error:', err);
      setError('Failed to initialize application. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load user progress data
   */
  const loadUserProgress = async (userId) => {
    try {
      const response = await progressTrackingService.getUserProgress(userId);
      if (response.success) {
        setUserProgress(response.progress);
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  /**
   * Start a new exam
   */
  const startExam = async (examType) => {
    if (!isAuthenticated) {
      setError('Please sign in to take practice exams.');
      return;
    }

    try {
      setLoading(true);
      
      const config = EXAM_CONFIGS[certificationLevel][examType];
      if (!config) {
        throw new Error('Invalid exam configuration');
      }

      // Initialize adaptive engine
      const adaptiveEngine = new AdaptiveLearningEngine(currentUser.id, certificationLevel);
      
      // Get adaptive question selection
      const examSession = await adaptiveEngine.initializeExamSession(
        {
          examType: examType,
          totalQuestions: config.totalQuestions,
          timeLimit: config.timeLimitMinutes,
          certificationLevel: certificationLevel
        },
        userProgress?.learningState
      );

      // Record exam attempt
      const attemptResponse = await progressTrackingService.recordExamAttempt({
        examId: `${certificationLevel}_${examType}`,
        examType: examType,
        totalQuestions: config.totalQuestions,
        timeLimit: config.timeLimitMinutes,
        startTime: new Date().toISOString(),
        examConfig: config
      });

      if (!attemptResponse.success) {
        throw new Error('Failed to record exam attempt');
      }

      // Set exam state
      setExamState({
        isActive: true,
        isPaused: false,
        questions: examSession.questions,
        currentQuestionIndex: 0,
        userAnswers: {},
        timeRemaining: config.timeLimitMinutes * 60, // Convert to seconds
        startTime: new Date(),
        adaptiveEngine: adaptiveEngine,
        attemptId: attemptResponse.attemptId,
        config: config
      });

      setSelectedExamConfig(config);
      setCurrentView('exam');
      startTimer();

    } catch (error) {
      console.error('Failed to start exam:', error);
      setError(error.message || 'Failed to start exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Start exam timer
   */
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setExamState(prevState => {
        if (prevState.timeRemaining <= 1) {
          submitExam();
          return prevState;
        }
        return {
          ...prevState,
          timeRemaining: prevState.timeRemaining - 1
        };
      });
    }, 1000);
  };

  /**
   * Pause/Resume exam
   */
  const toggleExamPause = () => {
    if (examState.isPaused) {
      startTimer();
    } else {
      clearInterval(timerRef.current);
    }
    
    setExamState(prevState => ({
      ...prevState,
      isPaused: !prevState.isPaused
    }));
  };

  /**
   * Answer question
   */
  const answerQuestion = async (questionIndex, answerIndex, confidence = 3) => {
    const question = examState.questions[questionIndex];
    if (!question) return;

    const startTime = Date.now();
    const isCorrect = answerIndex === question.correctAnswer;
    
    // Update user answers
    const newAnswers = {
      ...examState.userAnswers,
      [questionIndex]: {
        questionId: question.id,
        selectedAnswer: answerIndex,
        isCorrect: isCorrect,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        confidence: confidence,
        timestamp: new Date().toISOString()
      }
    };

    setExamState(prevState => ({
      ...prevState,
      userAnswers: newAnswers
    }));

    // Record response with progress tracking service
    if (examState.attemptId) {
      try {
        await progressTrackingService.recordQuestionResponse({
          attemptId: examState.attemptId,
          questionId: question.id,
          userAnswer: answerIndex,
          isCorrect: isCorrect,
          confidenceLevel: confidence,
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
          attemptNumber: 1
        });

        // Update adaptive learning engine
        if (examState.adaptiveEngine) {
          examState.adaptiveEngine.updateAdaptiveState(
            question.id,
            answerIndex,
            isCorrect,
            Math.floor((Date.now() - startTime) / 1000),
            confidence
          );
        }
      } catch (error) {
        console.error('Failed to record question response:', error);
      }
    }
  };

  /**
   * Navigate to next/previous question
   */
  const navigateQuestion = (direction) => {
    const currentIndex = examState.currentQuestionIndex;
    const maxIndex = examState.questions.length - 1;
    
    let newIndex;
    if (direction === 'next' && currentIndex < maxIndex) {
      newIndex = currentIndex + 1;
    } else if (direction === 'previous' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return;
    }

    setExamState(prevState => ({
      ...prevState,
      currentQuestionIndex: newIndex
    }));
  };

  /**
   * Submit exam
   */
  const submitExam = async () => {
    if (!examState.isActive) return;

    try {
      setLoading(true);
      clearInterval(timerRef.current);

      const answers = Object.values(examState.userAnswers);
      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const totalQuestions = examState.questions.length;
      const percentage = Math.round((correctAnswers / totalQuestions) * 100);
      const timeTaken = Math.floor((Date.now() - examState.startTime.getTime()) / 1000 / 60);
      
      const results = {
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        percentage: percentage,
        passed: percentage >= examState.config.passingScore,
        timeTaken: timeTaken,
        passingScore: examState.config.passingScore,
        answers: examState.userAnswers,
        questions: examState.questions,
        certificationLevel: certificationLevel,
        examType: examState.config.name
      };

      // Complete exam attempt in progress tracking
      if (examState.attemptId) {
        await progressTrackingService.completeExamAttempt(examState.attemptId, {
          totalScore: correctAnswers,
          percentageScore: percentage,
          timeTaken: timeTaken,
          questionsAnswered: answers.length,
          questionsCorrect: correctAnswers,
          status: 'completed'
        });
      }

      // Generate detailed analytics
      const analytics = await generateExamAnalytics(results);
      results.analytics = analytics;

      setExamResults(results);
      setExamState(prevState => ({ ...prevState, isActive: false }));
      setCurrentView('results');

      // Reload user progress
      if (currentUser) {
        await loadUserProgress(currentUser.id);
      }

    } catch (error) {
      console.error('Failed to submit exam:', error);
      setError('Failed to submit exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate detailed exam analytics
   */
  const generateExamAnalytics = async (results) => {
    try {
      const analytics = {
        performanceByModule: {},
        difficultyAnalysis: {},
        topicAnalysis: {},
        timeAnalysis: {},
        recommendations: []
      };

      // Analyze performance by CSA module
      const modules = CSA_MODULES[certificationLevel].modules;
      Object.keys(modules).forEach(moduleId => {
        const moduleQuestions = results.questions.filter(q => 
          questionBankManager.questionTopicMap[certificationLevel][moduleId]?.some(
            mapQ => mapQ.questionId === q.id
          )
        );
        
        if (moduleQuestions.length > 0) {
          const moduleCorrect = moduleQuestions.filter(q => 
            results.answers[results.questions.indexOf(q)]?.isCorrect
          ).length;
          
          analytics.performanceByModule[moduleId] = {
            name: modules[moduleId].name,
            total: moduleQuestions.length,
            correct: moduleCorrect,
            percentage: Math.round((moduleCorrect / moduleQuestions.length) * 100)
          };
        }
      });

      // Generate recommendations based on performance
      const weakModules = Object.entries(analytics.performanceByModule)
        .filter(([_, data]) => data.percentage < 70)
        .sort((a, b) => a[1].percentage - b[1].percentage);

      if (weakModules.length > 0) {
        analytics.recommendations.push(
          `Focus on ${modules[weakModules[0][0]].name} - your weakest area at ${weakModules[0][1].percentage}%`
        );
      }

      if (results.percentage >= 85) {
        analytics.recommendations.push("Excellent performance! You're ready for the actual exam.");
      } else if (results.percentage >= 75) {
        analytics.recommendations.push("Good performance! Review weak areas and take more practice exams.");
      } else {
        analytics.recommendations.push("More study needed. Focus on fundamental concepts and retake practice exams.");
      }

      return analytics;
    } catch (error) {
      console.error('Failed to generate analytics:', error);
      return { recommendations: ['Unable to generate detailed analytics.'] };
    }
  };

  /**
   * Format time display
   */
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Home View Component
   */
  const HomeView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            TSSA Adaptive Exam System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Master Your Gas Technician Certification with AI-Powered Learning
          </p>
          
          {/* Certification Level Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-2 shadow-lg">
              <button
                onClick={() => setCertificationLevel('G3')}
                className={`px-6 py-3 rounded-md font-semibold transition-all ${
                  certificationLevel === 'G3'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                G3 - Level 1 Foundation
              </button>
              <button
                onClick={() => setCertificationLevel('G2')}
                className={`px-6 py-3 rounded-md font-semibold transition-all ${
                  certificationLevel === 'G2'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                G2 - Level 2 Advanced
              </button>
            </div>
          </div>
        </div>

        {/* Exam Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(EXAM_CONFIGS[certificationLevel]).map(([examType, config]) => (
            <div
              key={examType}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 cursor-pointer group"
              onClick={() => !loading && startExam(examType)}
            >
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {examType.includes('QUICK') && <Zap className="w-6 h-6 text-white" />}
                  {examType.includes('STANDARD') && <Target className="w-6 h-6 text-white" />}
                  {examType.includes('FULL') && <Trophy className="w-6 h-6 text-white" />}
                  {examType.includes('DIAGNOSTIC') && <BarChart3 className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{config.name}</h3>
                <p className="text-gray-600 mb-4">{config.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-semibold">{config.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Limit:</span>
                    <span className="font-semibold">{config.timeLimitMinutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pass Score:</span>
                    <span className="font-semibold">{config.passingScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Level Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {CSA_MODULES[certificationLevel].name}
          </h2>
          <p className="text-gray-600 mb-6">
            {CSA_MODULES[certificationLevel].description}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CSA_MODULES[certificationLevel].modules).map(([moduleId, module]) => (
              <div key={moduleId} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{module.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                <div className="text-xs text-gray-500">
                  Exam Weight: {Math.round(module.examWeight * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Authentication prompt */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Sign in to unlock full features
            </h3>
            <p className="text-yellow-700 mb-4">
              Create an account to track your progress, get personalized recommendations, and access advanced analytics.
            </p>
            <button
              onClick={() => setCurrentView('auth')}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Sign In / Register
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Exam View Component
   */
  const ExamView = () => {
    const currentQuestion = examState.questions[examState.currentQuestionIndex];
    const questionNumber = examState.currentQuestionIndex + 1;
    const totalQuestions = examState.questions.length;
    const userAnswer = examState.userAnswers[examState.currentQuestionIndex];

    if (!currentQuestion) {
      return <div className="text-center p-8">Loading question...</div>;
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h1 className="text-lg font-semibold text-gray-800">
                  {certificationLevel} Practice Exam
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Question {questionNumber} of {totalQuestions}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    examState.timeRemaining < 300 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    <Clock className="w-4 h-4 inline mr-1" />
                    {formatTime(examState.timeRemaining)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleExamPause}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                  title={examState.isPaused ? 'Resume' : 'Pause'}
                >
                  {examState.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Submit Exam
                </button>
              </div>
            </div>
          </div>
        </div>

        {examState.isPaused && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
            <div className="container mx-auto text-center text-yellow-800">
              <Pause className="w-5 h-5 inline mr-2" />
              Exam is paused. Click Resume to continue.
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round((questionNumber / totalQuestions) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <h2 className="text-xl font-medium text-gray-800 mb-6 leading-relaxed">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      userAnswer?.selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${examState.currentQuestionIndex}`}
                        value={index}
                        checked={userAnswer?.selectedAnswer === index}
                        onChange={() => answerQuestion(examState.currentQuestionIndex, index)}
                        className="mr-4 w-4 h-4 text-blue-500"
                      />
                      <span className="font-medium mr-3 text-gray-500">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="flex-1">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigateQuestion('previous')}
                disabled={examState.currentQuestionIndex === 0}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              
              <div className="flex space-x-2">
                {/* Question indicator dots */}
                {examState.questions.slice(
                  Math.max(0, examState.currentQuestionIndex - 5),
                  Math.min(totalQuestions, examState.currentQuestionIndex + 6)
                ).map((_, index) => {
                  const actualIndex = Math.max(0, examState.currentQuestionIndex - 5) + index;
                  return (
                    <button
                      key={actualIndex}
                      onClick={() => setExamState(prev => ({ ...prev, currentQuestionIndex: actualIndex }))}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        actualIndex === examState.currentQuestionIndex
                          ? 'bg-blue-500 text-white'
                          : examState.userAnswers[actualIndex]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {actualIndex + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => 
                  examState.currentQuestionIndex === totalQuestions - 1
                    ? setShowConfirmDialog(true)
                    : navigateQuestion('next')
                }
                className={`px-6 py-2 rounded-lg transition-colors ${
                  examState.currentQuestionIndex === totalQuestions - 1
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {examState.currentQuestionIndex === totalQuestions - 1 ? 'Finish Exam' : 'Next →'}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 m-4 max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit Exam?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit your exam? You have answered {Object.keys(examState.userAnswers).length} of {totalQuestions} questions.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Continue Exam
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    submitExam();
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Submit Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Results View Component
   */
  const ResultsView = () => {
    if (!examResults) return null;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Score Card */}
            <div className={`rounded-xl shadow-lg p-8 mb-8 text-center ${
              examResults.passed 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
            }`}>
              <div className="mb-4">
                {examResults.passed ? (
                  <CheckCircle className="w-16 h-16 mx-auto" />
                ) : (
                  <AlertCircle className="w-16 h-16 mx-auto" />
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {examResults.passed ? 'Congratulations!' : 'Keep Studying!'}
              </h1>
              <div className="text-5xl font-bold mb-4">
                {examResults.percentage}%
              </div>
              <p className="text-xl opacity-90">
                {examResults.correctAnswers} correct out of {examResults.totalQuestions} questions
              </p>
              <p className="opacity-80 mt-2">
                Passing score: {examResults.passingScore}% | Time taken: {examResults.timeTaken} minutes
              </p>
            </div>

            {/* Performance Breakdown */}
            {examResults.analytics && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Performance Analysis</h2>
                
                {/* Module Performance */}
                {Object.keys(examResults.analytics.performanceByModule).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance by Module</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(examResults.analytics.performanceByModule).map(([moduleId, data]) => (
                        <div key={moduleId} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-800">{data.name}</span>
                            <span className={`font-bold ${
                              data.percentage >= 80 ? 'text-green-600' :
                              data.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {data.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                data.percentage >= 80 ? 'bg-green-500' :
                                data.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${data.percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {data.correct} / {data.total} correct
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {examResults.analytics.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Recommendations</h3>
                    <div className="space-y-2">
                      {examResults.analytics.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                          <span className="text-gray-700">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  setCurrentView('home');
                  setExamResults(null);
                }}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Take Another Exam</span>
              </button>
              
              {isAuthenticated && (
                <button
                  onClick={() => setCurrentView('progress')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>View Progress</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  // TODO: Implement detailed review
                  console.log('Review answers:', examResults);
                }}
                className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Review Answers</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Loading Component
   */
  const LoadingView = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );

  /**
   * Error Component
   */
  const ErrorView = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setCurrentView('home');
          }}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );

  // Main render
  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView />;
  }

  switch (currentView) {
    case 'exam':
      return <ExamView />;
    case 'results':
      return <ResultsView />;
    default:
      return <HomeView />;
  }
};

export default AdaptiveExamSystem;