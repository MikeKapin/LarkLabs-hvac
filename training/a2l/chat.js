/**
 * A2L Calculator Chat System
 * Provides contextual help and guidance for HVAC professionals
 */

class A2LChatSystem {
    constructor() {
        this.isInitialized = false;
        this.currentContext = 'general';
        this.chatHistory = [];
        this.responses = this.initializeResponses();
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.createChatInterface();
        this.bindEvents();
        this.isInitialized = true;
        console.log('A2L Chat System initialized');
    }

    createChatInterface() {
        // Create chat button
        const chatButton = document.createElement('button');
        chatButton.id = 'chat-toggle';
        chatButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
            <span>Help</span>
        `;
        chatButton.className = 'chat-toggle-btn';
        chatButton.setAttribute('aria-label', 'Open HVAC Help Chat');

        // Create chat panel
        const chatPanel = document.createElement('div');
        chatPanel.id = 'chat-panel';
        chatPanel.className = 'chat-panel';
        chatPanel.innerHTML = `
            <div class="chat-header">
                <h3>A2L HVAC Assistant</h3>
                <button id="chat-close" aria-label="Close chat">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/>
                    </svg>
                </button>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Ask about A2L refrigerants, safety, or calculations..." maxlength="200">
                <button id="chat-send" aria-label="Send message">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                    </svg>
                </button>
            </div>
            <div class="chat-quick-actions">
                <button class="quick-btn" data-query="What are A2L refrigerants?">What are A2L?</button>
                <button class="quick-btn" data-query="A2L safety requirements">Safety Requirements</button>
                <button class="quick-btn" data-query="How to use leak detector">Leak Detection</button>
                <button class="quick-btn" data-query="Charge limits for A2L">Charge Limits</button>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .chat-toggle-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
                z-index: 1000;
                min-width: 60px;
            }

            .chat-toggle-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
            }

            .chat-toggle-btn svg {
                width: 20px;
                height: 20px;
            }

            .chat-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                display: none;
                flex-direction: column;
                z-index: 1001;
                overflow: hidden;
            }

            .chat-panel.open {
                display: flex;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .chat-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chat-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .chat-header button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.2s;
            }

            .chat-header button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .chat-message {
                max-width: 80%;
                padding: 10px 12px;
                border-radius: 12px;
                font-size: 14px;
                line-height: 1.4;
            }

            .chat-message.user {
                background: #667eea;
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }

            .chat-message.assistant {
                background: #f1f3f4;
                color: #333;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }

            .chat-input-area {
                padding: 15px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 10px;
            }

            .chat-input-area input {
                flex: 1;
                padding: 10px;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                font-size: 14px;
                outline: none;
            }

            .chat-input-area input:focus {
                border-color: #667eea;
            }

            .chat-input-area button {
                background: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 10px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .chat-input-area button:hover {
                background: #5a67d8;
            }

            .chat-quick-actions {
                padding: 10px 15px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .quick-btn {
                background: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 15px;
                padding: 6px 12px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                color: #4a5568;
            }

            .quick-btn:hover {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }

            @media (max-width: 480px) {
                .chat-panel {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 100px);
                    bottom: 10px;
                    right: 20px;
                    left: 20px;
                }

                .chat-toggle-btn span {
                    display: none;
                }
            }

            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 10px 12px;
                background: #f1f3f4;
                border-radius: 12px;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }

            .typing-dot {
                width: 6px;
                height: 6px;
                background: #999;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(chatButton);
        document.body.appendChild(chatPanel);

        // Add welcome message
        setTimeout(() => {
            this.addMessage('assistant', 'Hi! I\'m here to help with A2L refrigerants, safety requirements, and calculations. What would you like to know?');
        }, 1000);
    }

    bindEvents() {
        const chatToggle = document.getElementById('chat-toggle');
        const chatClose = document.getElementById('chat-close');
        const chatPanel = document.getElementById('chat-panel');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const quickBtns = document.querySelectorAll('.quick-btn');

        chatToggle.addEventListener('click', () => {
            chatPanel.classList.toggle('open');
            if (chatPanel.classList.contains('open')) {
                chatInput.focus();
            }
        });

        chatClose.addEventListener('click', () => {
            chatPanel.classList.remove('open');
        });

        chatSend.addEventListener('click', () => this.sendMessage());
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                this.handleUserMessage(query);
            });
        });

        // Update context based on active calculator
        this.updateContextFromPage();
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.handleUserMessage(message);
            input.value = '';
        }
    }

    handleUserMessage(message) {
        this.addMessage('user', message);
        this.chatHistory.push({ role: 'user', content: message });
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate processing time
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage('assistant', response);
            this.chatHistory.push({ role: 'assistant', content: response });
        }, 1000 + Math.random() * 1500);
    }

    addMessage(role, content) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        messageDiv.textContent = content;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateResponse(message) {
        const normalizedMessage = message.toLowerCase();
        
        // Check for specific keywords and topics
        for (const [keywords, responses] of Object.entries(this.responses)) {
            if (keywords.some(keyword => normalizedMessage.includes(keyword))) {
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
        
        // Default response
        return this.responses.default[Math.floor(Math.random() * this.responses.default.length)];
    }

    updateContextFromPage() {
        // Detect which calculator is active and update context
        const activeCalculator = document.querySelector('.calculator.active');
        if (activeCalculator) {
            this.currentContext = activeCalculator.id;
        }
    }

    initializeResponses() {
        return {
            ['a2l', 'refrigerant', 'what are']: [
                'A2L refrigerants are mildly flammable refrigerants with lower toxicity. They include R-32, R-454B, and R-454C. They have lower Global Warming Potential (GWP) than traditional refrigerants but require special safety considerations.',
                'A2L refers to the ASHRAE safety classification: A (low toxicity) and 2L (lower flammability). These refrigerants are more environmentally friendly but need enhanced safety measures during installation and service.'
            ],
            ['safety', 'requirements', 'code']: [
                'A2L safety requirements include: maximum charge limits (typically 4.4 lbs residential, 13.2 lbs commercial), leak detection systems, enhanced ventilation, and proper training. Always check local codes as requirements vary.',
                'Key A2L safety measures: Use certified A2L equipment, install leak detectors, ensure proper ventilation, follow manufacturer guidelines, and maintain detailed service records. Never exceed charge limits for the space.'
            ],
            ['leak', 'detector', 'detection']: [
                'A2L leak detectors must detect concentrations as low as 25% of the Lower Flammability Limit (LFL). They should be calibrated regularly and positioned properly based on refrigerant density. The Leak Detector Calibration tool can help calculate proper settings.',
                'For A2L systems, leak detection is critical. Detectors should alarm at 25% LFL, have backup power, and trigger ventilation systems. Use the calibration calculator to determine proper gas concentrations for testing.'
            ],
            ['charge', 'limit', 'how much']: [
                'A2L charge limits vary by space: Residential typically 4.4 lbs, Commercial up to 13.2 lbs without additional safety measures. Larger charges require enhanced safety systems. Use the Charge Calculator to determine proper amounts.',
                'Charge limits depend on room size, ventilation, and system type. The calculator considers these factors. Remember: more refrigerant requires more safety measures like enhanced detection and ventilation.'
            ],
            ['pressure', 'temperature', 'pt', 'chart']: [
                'A2L refrigerants have different pressure-temperature relationships than traditional refrigerants. R-32 operates at higher pressures, while R-454B and R-454C are closer to R-410A. Use the P-T Calculator for accurate values.',
                'P-T relationships are crucial for proper system operation. Each A2L refrigerant has unique characteristics. The P-T Calculator provides accurate pressure-temperature data for R-32, R-454B, R-454C, and R-290.'
            ],
            ['superheat', 'subcooling', 'diagnosis']: [
                'A2L superheat and subcooling targets are similar to traditional refrigerants: 8-12°F superheat for TXV systems, 12-20°F for fixed orifice, and 8-15°F subcooling. Use the diagnostic tools for system analysis.',
                'Proper superheat and subcooling are critical for A2L systems. Too low superheat risks compressor damage, while too high indicates undercharge. The System Diagnostic tool helps analyze performance.'
            ],
            ['flammable', 'fire', 'ignition']: [
                'A2L refrigerants are "mildly flammable" - they require an ignition source and specific air concentrations to ignite. Risk is low with proper installation and safety measures. Always follow safety protocols.',
                'While A2L refrigerants can ignite under specific conditions, the risk is manageable with proper safety measures: leak detection, ventilation, charge limits, and avoiding ignition sources during service.'
            ],
            ['installation', 'install', 'service']: [
                'A2L installation requires certified equipment, proper training, leak detection systems, and compliance with local codes. Use nitrogen for pressure testing, verify charge limits, and test all safety systems.',
                'Key installation steps: Verify equipment compatibility, install leak detectors, ensure proper ventilation, follow manufacturer procedures, and document all safety measures. Never improvise with A2L systems.'
            ],
            ['r32', 'r-32']: [
                'R-32 is a single-component A2L refrigerant with GWP of 675. It operates at higher pressures than R-410A, requires special handling, and has excellent efficiency. Charge limits are critical due to its properties.',
                'R-32 offers excellent performance but requires careful handling. Higher operating pressures mean stronger system components. Use proper tools and follow safety protocols strictly.'
            ],
            ['r454b', 'r-454b']: [
                'R-454B is an A2L blend replacing R-410A in many applications. It has a GWP of 466 and operates at similar pressures to R-410A. It\'s designed for easy retrofit applications.',
                'R-454B is formulated for R-410A replacement with minimal system changes. However, A2L safety requirements still apply: leak detection, charge limits, and proper training.'
            ],
            ['r454c', 'r-454c']: [
                'R-454C has the lowest GWP (148) among common A2L refrigerants. It\'s excellent for environmental impact but requires all A2L safety measures. Performance is similar to R-410A.',
                'R-454C offers the best environmental profile but still requires full A2L safety compliance. Don\'t let the low GWP reduce vigilance about safety requirements.'
            ],
            ['training', 'certification', 'learn']: [
                'A2L training should cover refrigerant properties, safety requirements, leak detection, charge limits, and emergency procedures. Many manufacturers and trade organizations offer certified A2L training programs.',
                'Proper A2L training is essential and often required by code. Cover safety protocols, equipment operation, leak detection, and emergency response. Stay updated as requirements evolve.'
            ],
            ['help', 'how to use', 'calculator']: [
                'Each calculator has specific inputs for accurate results. Start with the refrigerant type, then enter your measurements. The tools provide guidance on acceptable ranges and safety considerations.',
                'The calculators are designed for HVAC professionals. Enter accurate data, understand the results, and always verify against manufacturer specifications and local codes. When in doubt, consult an expert.'
            ],
            default: [
                'I can help with A2L refrigerants, safety requirements, calculations, and system diagnostics. What specific topic would you like to discuss?',
                'Feel free to ask about A2L safety, leak detection, charge calculations, pressure-temperature relationships, or system diagnostics. I\'m here to help!',
                'I\'m not sure about that specific question, but I can help with A2L refrigerant properties, safety requirements, or using the calculation tools. What would you like to know?'
            ]
        };
    }
}

// Initialize chat system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window !== 'undefined') {
        window.a2lChat = new A2LChatSystem();
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = A2LChatSystem;
}
