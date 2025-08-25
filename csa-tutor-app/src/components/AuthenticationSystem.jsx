/**
 * Authentication System Component
 * Complete login/registration system for TSSA Exam users
 */

import React, { useState } from 'react';
import { 
  Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn, 
  AlertCircle, CheckCircle, Calendar, Building, Briefcase
} from 'lucide-react';
import authService from '../services/authService.js';

const AuthenticationSystem = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register' or 'forgot'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    certificationLevel: 'G3',
    phone: '',
    companyName: '',
    yearsExperience: '',
    currentCertification: '',
    targetExamDate: '',
    rememberMe: false
  });

  // Form validation
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!authService.isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (mode !== 'forgot') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (mode === 'register') {
        const passwordValidation = authService.validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.errors[0];
        }
      }
    }

    // Registration-specific validation
    if (mode === 'register') {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let result;

      switch (mode) {
        case 'login':
          result = await authService.login(formData.email, formData.password, formData.rememberMe);
          break;
        
        case 'register':
          result = await authService.register(formData);
          break;
        
        case 'forgot':
          result = await authService.requestPasswordReset(formData.email);
          break;
        
        default:
          throw new Error('Invalid authentication mode');
      }

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        
        if (mode === 'login' || mode === 'register') {
          // Success - user is logged in
          setTimeout(() => onLogin(result.user), 1000);
        } else if (mode === 'forgot') {
          // Password reset email sent
          setTimeout(() => setMode('login'), 2000);
        }
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const MessageAlert = ({ type, text }) => (
    <div className={`rounded-lg p-4 mb-4 ${
      type === 'success' 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex items-center">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        )}
        <span className={`text-sm ${
          type === 'success' ? 'text-green-700' : 'text-red-700'
        }`}>
          {text}
        </span>
      </div>
    </div>
  );

  const InputField = ({ name, type = 'text', placeholder, icon: Icon, required = false, ...props }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          errors[name] ? 'border-red-300' : 'border-gray-300'
        }`}
        {...props}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            {mode === 'register' ? (
              <UserPlus className="h-6 w-6 text-white" />
            ) : (
              <LogIn className="h-6 w-6 text-white" />
            )}
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' && 'Access your TSSA exam progress and continue learning'}
            {mode === 'register' && 'Start your journey to TSSA certification success'}
            {mode === 'forgot' && 'Enter your email to receive reset instructions'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {message.text && <MessageAlert type={message.type} text={message.text} />}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Registration Fields */}
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    name="firstName"
                    placeholder="First Name"
                    icon={User}
                    required
                  />
                  <InputField
                    name="lastName"
                    placeholder="Last Name"
                    icon={User}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certification Level
                  </label>
                  <select
                    name="certificationLevel"
                    value={formData.certificationLevel}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="G3">G3 - Foundation Level (Entry Level)</option>
                    <option value="G2">G2 - Advanced Level (Requires G3)</option>
                    <option value="BOTH">Both G3 and G2</option>
                  </select>
                </div>
              </>
            )}

            {/* Email Field */}
            <InputField
              name="email"
              type="email"
              placeholder="Email address"
              icon={Mail}
              required
            />

            {/* Password Fields */}
            {mode !== 'forgot' && (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    required
                    className={`block w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {mode === 'register' && (
                  <InputField
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    icon={Lock}
                    required
                  />
                )}
              </>
            )}

            {/* Additional Registration Fields */}
            {mode === 'register' && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Professional Information (Optional)</h3>
                
                <InputField
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  icon={User}
                />

                <InputField
                  name="companyName"
                  placeholder="Company Name"
                  icon={Building}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <select
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select...</option>
                      <option value="0">No experience</option>
                      <option value="1-2">1-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  <InputField
                    name="targetExamDate"
                    type="date"
                    placeholder="Target Exam Date"
                    icon={Calendar}
                  />
                </div>

                <InputField
                  name="currentCertification"
                  placeholder="Current Certification (if any)"
                  icon={Briefcase}
                />
              </div>
            )}

            {/* Remember Me */}
            {mode === 'login' && (
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Email'}
                </>
              )}
            </button>
          </form>

          {/* Mode Switching */}
          <div className="mt-6 text-center">
            {mode === 'login' && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  Forgot your password?
                </button>
                <div>
                  <span className="text-gray-600 text-sm">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    Sign up here
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <span className="text-gray-600 text-sm">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Sign in here
                </button>
              </div>
            )}

            {mode === 'forgot' && (
              <div>
                <span className="text-gray-600 text-sm">Remember your password? </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Sign in here
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationSystem;