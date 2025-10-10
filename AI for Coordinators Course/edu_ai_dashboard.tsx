import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Circle, MessageSquare, User, LogOut, Download, Lock, Unlock } from 'lucide-react';

// Course structure
const courseData = {
  title: "College Educators & AI Tools",
  subtitle: "Professional Development Program by LARK Labs",
  sessions: [
    {
      id: 1,
      title: "AI Foundations & Quick Wins",
      duration: "3 hours",
      topics: [
        "Welcome & Tool Setup",
        "Compare AI Assistants",
        "Create with Gamma",
        "Make Videos with Pictory",
        "Practice & Reflection"
      ],
      description: "Hands-on introduction to AI tools for program coordinators"
    },
    {
      id: 2,
      title: "Building Your Digital Workspace",
      duration: "3 hours",
      topics: [
        "VSCodium Setup",
        "Program Coordinator Portal",
        "Weekly Report Generator",
        "Student Resource Hub",
        "Integration & Navigation"
      ],
      description: "Create professional HTML tools with VSCodium"
    },
    {
      id: 3,
      title: "Power Tools - PowerShell & Claude Code",
      duration: "3-4 hours",
      topics: [
        "PowerShell Introduction",
        "Node.js Installation",
        "Anthropic Console Setup",
        "Claude Code Installation",
        "Custom Project Development"
      ],
      description: "Transition to AI-powered development"
    },
    {
      id: 4,
      title: "Free Power Tools - Interactive Projects",
      duration: "3-4 hours",
      topics: [
        "LMArena Introduction",
        "NanoBanana Platform",
        "Interactive Human Body Project",
        "Advanced Features",
        "Custom Applications"
      ],
      description: "Professional development without spending money"
    }
  ]
};

const CourseDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [userNotes, setUserNotes] = useState({});
  const [userQuestions, setUserQuestions] = useState({});
  const [noteInput, setNoteInput] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [showLogin, setShowLogin] = useState(true);

  // Load data from memory
  useEffect(() => {
    const savedUsers = localStorage.getItem('courseUsers');
    const savedProgress = localStorage.getItem('courseProgress');
    const savedNotes = localStorage.getItem('courseNotes');
    const savedQuestions = localStorage.getItem('courseQuestions');
    const savedCurrentUser = localStorage.getItem('currentUser');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedProgress) setUserProgress(JSON.parse(savedProgress));
    if (savedNotes) setUserNotes(JSON.parse(savedNotes));
    if (savedQuestions) setUserQuestions(JSON.parse(savedQuestions));
    if (savedCurrentUser) {
      setCurrentUser(savedCurrentUser);
      setShowLogin(false);
    }
  }, []);

  // Save data to memory
  useEffect(() => {
    localStorage.setItem('courseUsers', JSON.stringify(users));
    localStorage.setItem('courseProgress', JSON.stringify(userProgress));
    localStorage.setItem('courseNotes', JSON.stringify(userNotes));
    localStorage.setItem('courseQuestions', JSON.stringify(userQuestions));
    if (currentUser) {
      localStorage.setItem('currentUser', currentUser);
    }
  }, [users, userProgress, userNotes, userQuestions, currentUser]);

  // Handle login/registration
  const handleLogin = () => {
    if (!loginEmail || !loginPassword) {
      alert('Please enter both email and password');
      return;
    }

    if (users[loginEmail]) {
      if (users[loginEmail].password === loginPassword) {
        setCurrentUser(loginEmail);
        setShowLogin(false);
      } else {
        alert('Incorrect password');
      }
    } else {
      // New user registration
      const newUsers = {
        ...users,
        [loginEmail]: {
          email: loginEmail,
          password: loginPassword,
          registeredDate: new Date().toISOString()
        }
      };
      setUsers(newUsers);
      setCurrentUser(loginEmail);
      setShowLogin(false);
      
      // Initialize progress for new user
      const newProgress = { ...userProgress };
      newProgress[loginEmail] = {};
      courseData.sessions.forEach(session => {
        newProgress[loginEmail][session.id] = {
          completed: false,
          topicsCompleted: {}
        };
      });
      setUserProgress(newProgress);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(true);
    localStorage.removeItem('currentUser');
    setSelectedSession(null);
  };

  // Toggle topic completion
  const toggleTopicCompletion = (sessionId, topicIndex) => {
    const newProgress = { ...userProgress };
    if (!newProgress[currentUser]) {
      newProgress[currentUser] = {};
    }
    if (!newProgress[currentUser][sessionId]) {
      newProgress[currentUser][sessionId] = { completed: false, topicsCompleted: {} };
    }
    
    newProgress[currentUser][sessionId].topicsCompleted[topicIndex] = 
      !newProgress[currentUser][sessionId].topicsCompleted[topicIndex];
    
    // Check if all topics are completed
    const session = courseData.sessions.find(s => s.id === sessionId);
    const allCompleted = session.topics.every((_, idx) => 
      newProgress[currentUser][sessionId].topicsCompleted[idx]
    );
    newProgress[currentUser][sessionId].completed = allCompleted;
    
    setUserProgress(newProgress);
  };

  // Add note
  const addNote = () => {
    if (!noteInput.trim()) return;
    
    const newNotes = { ...userNotes };
    if (!newNotes[currentUser]) newNotes[currentUser] = {};
    if (!newNotes[currentUser][selectedSession]) newNotes[currentUser][selectedSession] = [];
    
    newNotes[currentUser][selectedSession].push({
      text: noteInput,
      timestamp: new Date().toISOString()
    });
    
    setUserNotes(newNotes);
    setNoteInput('');
  };

  // Add question
  const addQuestion = () => {
    if (!questionInput.trim()) return;
    
    const newQuestions = { ...userQuestions };
    if (!newQuestions[currentUser]) newQuestions[currentUser] = {};
    if (!newQuestions[currentUser][selectedSession]) newQuestions[currentUser][selectedSession] = [];
    
    newQuestions[currentUser][selectedSession].push({
      text: questionInput,
      timestamp: new Date().toISOString(),
      answered: false
    });
    
    setUserQuestions(newQuestions);
    setQuestionInput('');
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!currentUser || !userProgress[currentUser]) return 0;
    
    const completed = Object.values(userProgress[currentUser]).filter(s => s.completed).length;
    return Math.round((completed / courseData.sessions.length) * 100);
  };

  // Login Screen
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🎓</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {courseData.title}
            </h1>
            <p className="text-gray-600">{courseData.subtitle}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@institution.edu"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Sign In / Register
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>New users will be automatically registered</p>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  const currentSession = courseData.sessions.find(s => s.id === selectedSession);
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{courseData.title}</h1>
              <p className="text-blue-100 mt-1">{courseData.subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-blue-100">Signed in as</div>
                <div className="font-semibold">{currentUser}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
            <span className="text-3xl font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Session List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Course Sessions</h3>
              <div className="space-y-3">
                {courseData.sessions.map((session) => {
                  const isCompleted = userProgress[currentUser]?.[session.id]?.completed;
                  const isSelected = selectedSession === session.id;
                  
                  return (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isCompleted ? (
                              <CheckCircle size={18} className={isSelected ? 'text-white' : 'text-green-500'} />
                            ) : (
                              <Circle size={18} className={isSelected ? 'text-white' : 'text-gray-400'} />
                            )}
                            <span className="font-semibold">Session {session.id}</span>
                          </div>
                          <div className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                            {session.title}
                          </div>
                          <div className={`text-xs mt-1 ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                            {session.duration}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="md:col-span-2">
            {selectedSession ? (
              <div className="space-y-6">
                {/* Session Info */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Session {currentSession.id}: {currentSession.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{currentSession.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen size={16} />
                    <span>Duration: {currentSession.duration}</span>
                  </div>
                </div>

                {/* Topics Checklist */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Topics Covered</h3>
                  <div className="space-y-3">
                    {currentSession.topics.map((topic, idx) => {
                      const isCompleted = userProgress[currentUser]?.[selectedSession]?.topicsCompleted[idx];
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleTopicCompletion(selectedSession, idx)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          {isCompleted ? (
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle size={20} className="text-gray-300 flex-shrink-0" />
                          )}
                          <span className={`${isCompleted ? 'text-gray-600 line-through' : 'text-gray-800'}`}>
                            {topic}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">My Notes</h3>
                  <div className="mb-4">
                    <textarea
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add your notes here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                    <button
                      onClick={addNote}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Note
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {userNotes[currentUser]?.[selectedSession]?.map((note, idx) => (
                      <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                        <p className="text-gray-800">{note.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(note.timestamp).toLocaleString()}
                        </p>
                      </div>
                    )) || <p className="text-gray-500 text-sm">No notes yet</p>}
                  </div>
                </div>

                {/* Questions */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Questions & Help</h3>
                  <div className="mb-4">
                    <textarea
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      placeholder="Ask a question or request help..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                    <button
                      onClick={addQuestion}
                      className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Submit Question
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {userQuestions[currentUser]?.[selectedSession]?.map((question, idx) => (
                      <div key={idx} className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <div className="flex items-start gap-2">
                          <MessageSquare size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-gray-800">{question.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(question.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )) || <p className="text-gray-500 text-sm">No questions yet</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <BookOpen size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a Session to Begin
                </h3>
                <p className="text-gray-500">
                  Choose a session from the left to view content and track your progress
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDashboard;