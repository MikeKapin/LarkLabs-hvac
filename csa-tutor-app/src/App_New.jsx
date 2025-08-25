/**
 * Main Application Component - TSSA Adaptive Exam System
 * Complete application using actual G2/G3 questions and comprehensive features
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdaptiveExamSystem from './components/AdaptiveExamSystem.jsx';
import AuthenticationSystem from './components/AuthenticationSystem.jsx';
import ProgressDashboard from './components/ProgressDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import CSAModuleViewer from './components/CSAModuleViewer.jsx';
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import authService from './services/authService.js';
import { registerServiceWorker, isRunningStandalone } from './utils/pwa.js';
import './index.css';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPWA, setIsPWA] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Register service worker for PWA functionality
      await registerServiceWorker();
      setIsPWA(isRunningStandalone());

      // Check authentication status
      const user = authService.getCurrentUser();
      const authenticated = authService.isAuthenticated();
      
      setCurrentUser(user);
      setIsAuthenticated(authenticated);

      // Initialize theme from localStorage
      const savedTheme = localStorage.getItem('tssa-exam-theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;

      // Setup automatic token refresh if authenticated
      if (authenticated) {
        authService.setupTokenRefresh();
      }

    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('tssa-exam-theme', newTheme);
    document.documentElement.className = newTheme;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Initializing TSSA Exam System</h2>
          <p className="text-gray-600">Loading your personalized learning environment...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <Navigation
          user={currentUser}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          theme={theme}
          onThemeToggle={toggleTheme}
          isPWA={isPWA}
        />
        
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <AdaptiveExamSystem 
                  user={currentUser}
                  isAuthenticated={isAuthenticated}
                />
              } 
            />
            
            <Route 
              path="/auth" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <AuthenticationSystem onLogin={handleLogin} />
              } 
            />

            <Route 
              path="/modules" 
              element={<CSAModuleViewer />} 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                <ProgressDashboard user={currentUser} /> : 
                <Navigate to="/auth" />
              } 
            />

            <Route 
              path="/progress" 
              element={
                isAuthenticated ? 
                <ProgressDashboard user={currentUser} view="progress" /> : 
                <Navigate to="/auth" />
              } 
            />

            <Route 
              path="/analytics" 
              element={
                isAuthenticated ? 
                <ProgressDashboard user={currentUser} view="analytics" /> : 
                <Navigate to="/auth" />
              } 
            />

            <Route 
              path="/study-plan" 
              element={
                isAuthenticated ? 
                <ProgressDashboard user={currentUser} view="study-plan" /> : 
                <Navigate to="/auth" />
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                isAuthenticated && authService.isAdmin() ? 
                <AdminDashboard user={currentUser} /> : 
                <Navigate to="/" />
              } 
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
        <InstallPrompt />
      </div>
    </Router>
  );
};

export default App;