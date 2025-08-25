/**
 * Footer Component with Lark Labs Branding
 * Matches the styling from your existing simulators
 */

import React from 'react';
import { ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Lark Labs Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <div className="lark-labs-logo bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="lark-bird w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center relative">
                  <span className="text-lg">🐦</span>
                  <div className="absolute -top-2 -right-2 text-xs animate-pulse">💬</div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-teal-500 bg-clip-text text-transparent">
                  LARK LABS
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium tracking-wider">
                  SOFTWARE DEVELOPMENT
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Innovative software solutions for education and professional development. 
              Specializing in AI-powered learning systems and adaptive assessment technologies.
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@larklabs.ca</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>1-800-LARK-DEV</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Ontario, Canada</span>
              </div>
            </div>
          </div>

          {/* TSSA Exam System */}
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-4">TSSA Exam System</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Practice Exams
                </a>
              </li>
              <li>
                <a href="/modules" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  CSA Modules
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Progress Dashboard
                </a>
              </li>
              <li>
                <a href="/analytics" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Performance Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a 
                  href="https://www.tssa.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                >
                  TSSA Official Site <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.csagroup.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                >
                  CSA Group <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="/help" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Help & Support
                </a>
              </li>
              <li>
                <a href="/study-guide" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Study Guide
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>© <span className="text-blue-600 font-bold">{currentYear}</span> Lark Labs Software Development. All Rights Reserved.</strong>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 max-w-2xl">
                This software and its content are protected by copyright law. Unauthorized reproduction, 
                distribution, or modification is strictly prohibited. The TSSA Practice Exam System is 
                designed for educational purposes only and is not affiliated with or endorsed by TSSA 
                (Technical Standards and Safety Authority).
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center space-x-6 text-xs text-gray-500 dark:text-gray-500">
              <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Terms of Service
              </a>
              <a href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Contact
              </a>
            </div>
          </div>

          {/* Additional Disclaimer */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              <strong>Educational Disclaimer:</strong> This practice exam system uses comprehensive question banks 
              based on CSA B149.1 and B149.2 standards. While designed to prepare students for TSSA certification 
              exams, success on practice tests does not guarantee success on official examinations. Students should 
              supplement their studies with official TSSA materials and approved training programs.
            </p>
          </div>

          {/* Technology Stack Badge */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <span>Powered by</span>
              <div className="flex items-center space-x-1">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">React</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Node.js</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">AI</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">PWA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for Lark Labs Animation */}
      <style jsx>{`
        @keyframes chirp {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        
        .lark-bird::after {
          animation: chirp 3s infinite;
        }
        
        .lark-labs-logo:hover {
          transform: translateY(-2px);
        }
        
        .lark-labs-logo {
          transition: all 0.3s ease;
        }
      `}</style>
    </footer>
  );
};

export default Footer;