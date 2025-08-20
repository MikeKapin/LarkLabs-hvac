import React, { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, AlertTriangle, Lightbulb, User, Bot, Upload, FileText, Search } from 'lucide-react';
import { moduleInfo, getAIResponse } from './data/index.js';
import InstallPrompt from './components/InstallPrompt.jsx';
import { registerServiceWorker, isRunningStandalone } from './utils/pwa.js';

const CSAGasTutorApp = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your TSSA G3 Gas Technician Course AI Tutor. I'm here to help you understand any concepts from Modules 1-9. You can ask me about gas codes, safety procedures, installation techniques, or any specific topics you're struggling with. What would you like to learn about today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isPWA, setIsPWA] = useState(false);
  const messagesEndRef = useRef(null);

  const quickTopics = [
    "Gas pressure calculations",
    "Pipe sizing formulas",
    "Venting requirements", 
    "Leak testing procedures",
    "CO safety limits",
    "Appliance clearances",
    "Code violations",
    "Emergency shutdown",
    "PPE requirements",
    "Natural gas vs propane",
    "Ohm's law applications",
    "CSA B149.1 requirements"
  ];

  const moduleCategories = [
    { id: 1, title: "Safety", icon: "🛡️", color: "bg-red-500", description: "PPE & Safety Protocols" },
    { id: 2, title: "Tools", icon: "🔧", color: "bg-blue-500", description: "Equipment & Testing" },
    { id: 3, title: "Gas Properties", icon: "⛽", color: "bg-orange-500", description: "Handling & Properties" },
    { id: 4, title: "Codes", icon: "📋", color: "bg-green-500", description: "Regulations & Acts" },
    { id: 5, title: "Electricity", icon: "⚡", color: "bg-yellow-500", description: "Basic Electrical" },
    { id: 6, title: "Drawings", icon: "📐", color: "bg-purple-500", description: "Technical Plans" },
    { id: 7, title: "Relations", icon: "🤝", color: "bg-pink-500", description: "Customer Service" },
    { id: 8, title: "Piping", icon: "🔩", color: "bg-indigo-500", description: "Systems & Tubing" },
    { id: 9, title: "Appliances", icon: "🏠", color: "bg-teal-500", description: "Gas Equipment" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();
    // Check if running as PWA
    setIsPWA(isRunningStandalone());
  }, []);

  const simulateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      // Use the module-aware AI response system
      const moduleId = selectedModule ? parseInt(selectedModule) : null;
      const aiResponse = await getAIResponse(userMessage, moduleId);
      
      setTimeout(() => {
        let responseContent = aiResponse.response;
        
        // Add module context if available
        if (aiResponse.moduleContext && aiResponse.responseType === 'module_specific') {
          responseContent = `**${aiResponse.moduleContext} - Module ${moduleId}**\n\n${responseContent}`;
        }
        
        // Add follow-up suggestions for general responses
        if (aiResponse.responseType === 'general') {
          responseContent += "\n\n💡 **Pro Tip:** Select a specific module from the sidebar for more targeted information!";
        }
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          type: 'bot',
          content: responseContent,
          timestamp: new Date(),
          moduleContext: aiResponse.moduleContext
        }]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000); // Simulate processing time
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          type: 'bot',
          content: "I apologize, but I'm having trouble processing your question right now. Please try rephrasing your question or ask about a specific topic from the available modules.",
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: inputMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      simulateAIResponse(inputMessage);
      setInputMessage('');
    }
  };

  const handleQuickTopic = (topic) => {
    setInputMessage(`Explain ${topic}`);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
    
    const fileMessage = {
      id: messages.length + 1,
      type: 'user',
      content: `📁 Uploaded: ${files.map(f => f.name).join(', ')}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, fileMessage]);
    
    setTimeout(() => {
      simulateAIResponse(`I've uploaded module materials: ${files.map(f => f.name).join(', ')}. Please help me understand this content.`);
    }, 500);
  };

  const getModuleTitle = (moduleId) => {
    const module = moduleInfo.find(m => m.id.toString() === moduleId);
    return module ? module.title : 'All Modules';
  };

  return (
    <>
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            TSSA G3 Gas Technician Tutor
          </h1>
          <p className="text-sm text-gray-600 mt-1">AI-powered learning assistant</p>
          {isPWA && (
            <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              📱 Installed
            </span>
          )}
        </div>
        
        {/* Module Selection */}
        <div className="p-4 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Module</label>
          <select 
            value={selectedModule} 
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Modules</option>
            {moduleInfo.map(module => (
              <option key={module.id} value={module.id}>
                Module {module.id}: {module.title}
              </option>
            ))}
          </select>
          {selectedModule && (
            <p className="text-xs text-gray-500 mt-1">
              {moduleInfo.find(m => m.id.toString() === selectedModule)?.description}
            </p>
          )}
        </div>
        
        {/* File Upload */}
        <div className="p-4 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Module Materials</label>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploadedFiles.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600">{uploadedFiles.length} file(s) uploaded</p>
            </div>
          )}
        </div>
        
        {/* Quick Topics */}
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Topics</h3>
          <div className="space-y-2">
            {quickTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleQuickTopic(topic)}
                className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
        
        {/* Safety Notice */}
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-yellow-600 mt-1" size={16} />
            <div>
              <p className="text-xs font-medium text-yellow-800">Safety Reminder</p>
              <p className="text-xs text-yellow-700">Always follow current codes and manufacturer instructions. This AI tutor supplements but doesn't replace official training.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedModule ? `Module ${selectedModule}: ${getModuleTitle(selectedModule)}` : 'TSSA G3 Gas Technician Help'}
              </h2>
              <p className="text-sm text-gray-600">Ask questions about gas codes, safety, installation, and more</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lightbulb size={16} />
              <span>AI Tutor Active</span>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {message.type === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                </div>
                <div className={`rounded-lg p-3 ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  <div className="chat-message whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                    {message.moduleContext && (
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {message.moduleContext}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about gas codes, installation procedures, safety requirements..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {quickTopics.slice(0, 4).map((topic, index) => (
              <button
                key={index}
                onClick={() => handleQuickTopic(topic)}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    <InstallPrompt />
    </>
  );
};

export default CSAGasTutorApp;