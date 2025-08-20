import React, { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, AlertTriangle, Lightbulb, User, Bot, Upload, FileText, Search, Zap, ShieldCheck, Wrench } from 'lucide-react';
import { moduleInfo, getAIResponse } from './data/index.js';
import InstallPrompt from './components/InstallPrompt.jsx';
import { registerServiceWorker, isRunningStandalone } from './utils/pwa.js';

const CSAGasTutorApp = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "**Hey! I'm G3 Tudor!** 🎓\n\nI'm your AI assistant for TSSA G3 Gas Technician certification. I have complete knowledge of all 9 CSA modules:\n\n🛡️ **Safety** • 🔧 **Tools** • ⛽ **Gas Properties** • 📋 **Codes** • ⚡ **Electricity** • 📐 **Drawings** • 🤝 **Customer Relations** • 🔩 **Piping** • 🏠 **Appliances**\n\n**What do you need help understanding?**",
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
    "🛡️ PPE Requirements",
    "📏 Gas Pressure Calculations", 
    "🔧 Leak Testing Procedures",
    "⚠️ CO Safety Limits",
    "📋 CSA B149.1 Requirements",
    "⚡ Ohm's Law Applications",
    "🤝 Customer Service Skills",
    "🔩 Pipe Threading & Sealants"
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
    const cleanTopic = topic.replace(/^[\w\s]*\s/, ''); // Remove emoji and clean text
    setInputMessage(`Explain ${cleanTopic.toLowerCase()}`);
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
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">G3 Tudor</h1>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>TSSA G3 AI Assistant Ready</span>
            </div>
          </div>
        </div>
        {isPWA && (
          <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
            📱 App Mode
          </span>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-48">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                message.type === 'user' ? 'bg-blue-600' : 'bg-green-600'
              }`}>
                {message.type === 'user' ? '👤' : '🎓'}
              </div>
              <div className={`rounded-2xl px-4 py-3 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 border border-gray-700 text-gray-100'
              }`}>
                <div className="chat-message text-sm leading-relaxed">{message.content}</div>
                <div className={`text-xs mt-2 opacity-75 ${
                  message.type === 'user' ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                  {message.moduleContext && (
                    <span className="ml-2 px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
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
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-lg">
              🎓
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
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

      {/* Fixed Input Container - Like HVAC Jack */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 shadow-lg">
        {/* Quick Topics */}
        <div className="flex flex-wrap gap-2 mb-3">
          {quickTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => handleQuickTopic(topic)}
              className="text-xs bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-all"
            >
              {topic}
            </button>
          ))}
        </div>
        
        {/* Input Group */}
        <div className="flex gap-3 items-end">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            id="file-upload"
            className="hidden"
          />
          <label 
            htmlFor="file-upload"
            className="w-11 h-11 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-all"
            title="Upload files"
          >
            📎
          </label>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about G3 modules, safety, codes, calculations..."
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-gray-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed"
          >
            ➤
          </button>
        </div>
        
        {uploadedFiles.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">{uploadedFiles.length} files uploaded</p>
        )}
        
        {/* Compact Safety Notice */}
        <div className="flex items-center gap-2 mt-2 text-xs text-amber-400">
          <AlertTriangle size={12} />
          <span>Educational use only - Follow official codes and guidelines</span>
        </div>
      </div>
    </div>
    <InstallPrompt />
    </>
  );
};

export default CSAGasTutorApp;