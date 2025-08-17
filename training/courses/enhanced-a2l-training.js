// Enhanced A2L Safety Training Certificate Course Engine
// Professional Learning Management System for CSA B52 Compliance Training

class EnhancedA2LTraining {
    constructor() {
        this.studentProgress = JSON.parse(localStorage.getItem('a2l_training_progress')) || {
            currentModule: 1,
            completedModules: [],
            quizScores: {},
            timeSpent: {},
            startDate: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            certificateEarned: false,
            attempts: {}
        };
        
        this.modules = [
            { id: 1, title: 'A2L Fundamentals', requiredScore: 80, timeEstimate: 45 },
            { id: 2, title: 'CSA B52 Compliance', requiredScore: 85, timeEstimate: 60 },
            { id: 3, title: 'Installation Requirements', requiredScore: 80, timeEstimate: 50 },
            { id: 4, title: 'Safety Protocols', requiredScore: 90, timeEstimate: 55 },
            { id: 5, title: 'Leak Detection & Response', requiredScore: 85, timeEstimate: 65 },
            { id: 6, title: 'Service & Maintenance', requiredScore: 80, timeEstimate: 70 },
            { id: 7, title: 'Emergency Procedures', requiredScore: 95, timeEstimate: 40 },
            { id: 8, title: 'Final Assessment', requiredScore: 85, timeEstimate: 90 }
        ];
        
        this.init();
    }
    
    init() {
        this.createProgressTracker();
        this.createInteractiveElements();
        this.setupAdvancedQuizEngine();
        this.initializeStudentDashboard();
        this.setupAutosave();
        console.log('Enhanced A2L Training System initialized');
    }
    
    createProgressTracker() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'enhanced-progress-tracker';
        progressContainer.innerHTML = `
            <div class="student-dashboard">
                <div class="dashboard-header">
                    <h3>📊 Training Progress Dashboard</h3>
                    <div class="completion-badge" id="completionBadge">0% Complete</div>
                </div>
                <div class="progress-grid">
                    <div class="progress-card">
                        <div class="card-icon">📚</div>
                        <div class="card-content">
                            <div class="card-title">Modules Completed</div>
                            <div class="card-value" id="modulesCompleted">0/8</div>
                        </div>
                    </div>
                    <div class="progress-card">
                        <div class="card-icon">⏱️</div>
                        <div class="card-content">
                            <div class="card-title">Time Spent</div>
                            <div class="card-value" id="timeSpent">0h 0m</div>
                        </div>
                    </div>
                    <div class="progress-card">
                        <div class="card-icon">🎯</div>
                        <div class="card-content">
                            <div class="card-title">Average Score</div>
                            <div class="card-value" id="averageScore">--</div>
                        </div>
                    </div>
                    <div class="progress-card">
                        <div class="card-icon">🏆</div>
                        <div class="card-content">
                            <div class="card-title">Certificate Status</div>
                            <div class="card-value" id="certificateStatus">In Progress</div>
                        </div>
                    </div>
                </div>
                <div class="detailed-progress">
                    <h4>Module Progress</h4>
                    <div class="module-progress-list" id="moduleProgressList"></div>
                </div>
            </div>
        `;
        
        // Insert at the top of the container
        const container = document.querySelector('.container');
        container.insertBefore(progressContainer, container.firstChild);
        
        this.updateProgressDashboard();
    }
    
    createInteractiveElements() {
        // Enhanced drag-and-drop exercises
        this.createDragDropExercise();
        
        // Interactive system diagrams
        this.createInteractiveSystemDiagram();
        
        // Virtual reality-style scenarios
        this.createVRScenarios();
        
        // Real-time safety calculators
        this.createRealTimeCalculators();
    }
    
    createDragDropExercise() {
        const exercises = [
            {
                module: 3,
                title: 'A2L Installation Requirements Matching',
                items: [
                    { id: 'ventilation', text: 'Mechanical Ventilation Required', category: 'indoor-unit' },
                    { id: 'detector', text: 'Refrigerant Leak Detector', category: 'safety-equipment' },
                    { id: 'clearance', text: '3m Clearance from Ignition Sources', category: 'installation' },
                    { id: 'signage', text: 'A2L Safety Warning Labels', category: 'safety-equipment' }
                ],
                zones: [
                    { id: 'indoor-unit', title: 'Indoor Unit Requirements' },
                    { id: 'safety-equipment', title: 'Safety Equipment' },
                    { id: 'installation', title: 'Installation Clearances' }
                ]
            }
        ];
        
        exercises.forEach(exercise => {
            const container = document.createElement('div');
            container.className = 'enhanced-drag-drop-exercise';
            container.innerHTML = `
                <h4>🎯 Interactive Exercise: ${exercise.title}</h4>
                <div class="drag-drop-grid">
                    <div class="drag-items-enhanced">
                        ${exercise.items.map(item => `
                            <div class="drag-item-enhanced" draggable="true" data-id="${item.id}" data-category="${item.category}">
                                ${item.text}
                            </div>
                        `).join('')}
                    </div>
                    <div class="drop-zones-enhanced">
                        ${exercise.zones.map(zone => `
                            <div class="drop-zone-enhanced" data-category="${zone.id}">
                                <h5>${zone.title}</h5>
                                <div class="drop-area"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="exercise-feedback" id="exerciseFeedback${exercise.module}"></div>
            `;
            
            // Insert into appropriate module
            const moduleContent = document.querySelector(`#module${exercise.module} .module-content`);
            if (moduleContent) {
                moduleContent.appendChild(container);
            }
        });
        
        this.initializeDragDrop();
    }
    
    createInteractiveSystemDiagram() {
        const diagramContainer = document.createElement('div');
        diagramContainer.className = 'interactive-system-diagram';
        diagramContainer.innerHTML = `
            <h4>🔧 Interactive A2L System Diagram</h4>
            <div class="system-canvas" id="a2lSystemCanvas">
                <svg viewBox="0 0 800 600" style="width: 100%; height: 400px; border: 2px solid #ddd; border-radius: 10px;">
                    <!-- Outdoor Unit -->
                    <rect x="50" y="50" width="150" height="100" fill="#e3f2fd" stroke="#2196f3" stroke-width="2" rx="10"/>
                    <text x="125" y="105" text-anchor="middle" font-size="14" font-weight="bold">Outdoor Unit</text>
                    
                    <!-- Indoor Unit -->
                    <rect x="600" y="200" width="150" height="80" fill="#fff3e0" stroke="#ff9800" stroke-width="2" rx="10"/>
                    <text x="675" y="245" text-anchor="middle" font-size="14" font-weight="bold">Indoor Unit</text>
                    
                    <!-- Refrigerant Lines -->
                    <path d="M200 100 Q400 100 600 240" stroke="#4caf50" stroke-width="4" fill="none"/>
                    <path d="M600 260 Q400 300 200 120" stroke="#f44336" stroke-width="4" fill="none"/>
                    
                    <!-- Safety Equipment -->
                    <circle cx="500" cy="180" r="30" fill="#ffeb3b" stroke="#f57f17" stroke-width="2"/>
                    <text x="500" y="185" text-anchor="middle" font-size="12" font-weight="bold">Leak</text>
                    <text x="500" y="195" text-anchor="middle" font-size="12" font-weight="bold">Detector</text>
                    
                    <!-- Ventilation -->
                    <rect x="580" y="120" width="80" height="30" fill="#e8f5e8" stroke="#4caf50" stroke-width="2" rx="5"/>
                    <text x="620" y="140" text-anchor="middle" font-size="12" font-weight="bold">Ventilation</text>
                    
                    <!-- Interactive Hotspots -->
                    <circle cx="125" cy="100" r="8" fill="#ff4444" class="hotspot" data-info="outdoor-unit"/>
                    <circle cx="675" cy="240" r="8" fill="#ff4444" class="hotspot" data-info="indoor-unit"/>
                    <circle cx="500" cy="180" r="8" fill="#ff4444" class="hotspot" data-info="detector"/>
                    <circle cx="620" cy="135" r="8" fill="#ff4444" class="hotspot" data-info="ventilation"/>
                </svg>
                
                <div class="diagram-info" id="diagramInfo">
                    <h5>Click on red hotspots to learn about A2L safety requirements</h5>
                </div>
            </div>
        `;
        
        // Insert into Module 4
        const module4Content = document.querySelector('#module4 .module-content');
        if (module4Content) {
            module4Content.appendChild(diagramContainer);
        }
        
        this.initializeInteractiveDiagram();
    }
    
    createVRScenarios() {
        const scenarioContainer = document.createElement('div');
        scenarioContainer.className = 'vr-scenario-container';
        scenarioContainer.innerHTML = `
            <h4>🥽 Virtual Reality A2L Safety Scenarios</h4>
            <div class="scenario-grid">
                <div class="scenario-card" data-scenario="leak-response">
                    <div class="scenario-image">🚨</div>
                    <h5>Emergency Leak Response</h5>
                    <p>Practice A2L leak detection and emergency response procedures</p>
                    <button class="scenario-btn">Start Scenario</button>
                </div>
                <div class="scenario-card" data-scenario="installation">
                    <div class="scenario-image">🔧</div>
                    <h5>Safe Installation</h5>
                    <p>Learn proper A2L system installation with CSA B52 compliance</p>
                    <button class="scenario-btn">Start Scenario</button>
                </div>
                <div class="scenario-card" data-scenario="service">
                    <div class="scenario-image">⚙️</div>
                    <h5>Service Procedures</h5>
                    <p>Practice safe A2L system servicing and maintenance</p>
                    <button class="scenario-btn">Start Scenario</button>
                </div>
            </div>
            <div class="scenario-viewer" id="scenarioViewer" style="display: none;"></div>
        `;
        
        // Insert into Module 7
        const module7Content = document.querySelector('#module7 .module-content');
        if (module7Content) {
            module7Content.appendChild(scenarioContainer);
        }
    }
    
    createRealTimeCalculators() {
        const calculatorContainer = document.createElement('div');
        calculatorContainer.className = 'real-time-calculators';
        calculatorContainer.innerHTML = `
            <h4>⚡ Real-Time A2L Safety Calculators</h4>
            <div class="calculator-tabs">
                <button class="calc-tab active" data-calc="lfl">LFL Calculator</button>
                <button class="calc-tab" data-calc="charge">Charge Limits</button>
                <button class="calc-tab" data-calc="ventilation">Ventilation</button>
                <button class="calc-tab" data-calc="detection">Detection</button>
            </div>
            
            <div class="calculator-content">
                <!-- LFL Calculator -->
                <div class="calc-panel active" id="lfl-calc">
                    <h5>🔥 Lower Flammability Limit (LFL) Calculator</h5>
                    <div class="calc-inputs">
                        <label>Refrigerant Type:</label>
                        <select id="lfl-refrigerant">
                            <option value="R-32">R-32 (LFL: 0.307 kg/m³)</option>
                            <option value="R-454B">R-454B (LFL: 0.063 kg/m³)</option>
                            <option value="R-454C">R-454C (LFL: 0.070 kg/m³)</option>
                            <option value="R-468A">R-468A (LFL: 0.045 kg/m³)</option>
                        </select>
                        
                        <label>Room Volume (m³):</label>
                        <input type="number" id="lfl-volume" placeholder="Enter room volume" min="1">
                        
                        <label>Leak Rate (kg/h):</label>
                        <input type="number" id="lfl-leak-rate" placeholder="Enter leak rate" min="0" step="0.001">
                    </div>
                    <button class="calc-button" onclick="calculateLFL()">Calculate Time to LFL</button>
                    <div class="calc-result" id="lfl-result"></div>
                </div>
                
                <!-- Charge Limits Calculator -->
                <div class="calc-panel" id="charge-calc">
                    <h5>⚖️ Maximum Refrigerant Charge Calculator</h5>
                    <div class="calc-inputs">
                        <label>Room Area (m²):</label>
                        <input type="number" id="charge-area" placeholder="Enter room area" min="1">
                        
                        <label>Room Height (m):</label>
                        <input type="number" id="charge-height" placeholder="Enter ceiling height" min="2" step="0.1">
                        
                        <label>Refrigerant Type:</label>
                        <select id="charge-refrigerant">
                            <option value="R-32">R-32</option>
                            <option value="R-454B">R-454B</option>
                            <option value="R-454C">R-454C</option>
                            <option value="R-468A">R-468A</option>
                        </select>
                    </div>
                    <button class="calc-button" onclick="calculateChargeLimit()">Calculate Maximum Charge</button>
                    <div class="calc-result" id="charge-result"></div>
                </div>
                
                <!-- Ventilation Calculator -->
                <div class="calc-panel" id="ventilation-calc">
                    <h5>💨 Ventilation Requirements Calculator</h5>
                    <div class="calc-inputs">
                        <label>Refrigerant Charge (kg):</label>
                        <input type="number" id="vent-charge" placeholder="Enter total charge" min="0.1" step="0.1">
                        
                        <label>Room Type:</label>
                        <select id="vent-room-type">
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                        </select>
                        
                        <label>Installation Type:</label>
                        <select id="vent-install-type">
                            <option value="split">Split System</option>
                            <option value="ducted">Ducted System</option>
                            <option value="packaged">Packaged Unit</option>
                        </select>
                    </div>
                    <button class="calc-button" onclick="calculateVentilation()">Calculate Ventilation Needs</button>
                    <div class="calc-result" id="ventilation-result"></div>
                </div>
                
                <!-- Detection Calculator -->
                <div class="calc-panel" id="detection-calc">
                    <h5>🔍 Leak Detection Requirements</h5>
                    <div class="calc-inputs">
                        <label>System Charge (kg):</label>
                        <input type="number" id="detect-charge" placeholder="Enter system charge" min="0.1" step="0.1">
                        
                        <label>Installation Location:</label>
                        <select id="detect-location">
                            <option value="basement">Basement/Below Grade</option>
                            <option value="ground">Ground Floor</option>
                            <option value="upper">Upper Floor</option>
                            <option value="mechanical">Mechanical Room</option>
                        </select>
                        
                        <label>Occupancy Type:</label>
                        <select id="detect-occupancy">
                            <option value="residential">Residential</option>
                            <option value="office">Office</option>
                            <option value="retail">Retail</option>
                            <option value="industrial">Industrial</option>
                        </select>
                    </div>
                    <button class="calc-button" onclick="calculateDetectionReqs()">Determine Detection Requirements</button>
                    <div class="calc-result" id="detection-result"></div>
                </div>
            </div>
        `;
        
        // Insert into Module 3
        const module3Content = document.querySelector('#module3 .module-content');
        if (module3Content) {
            module3Content.appendChild(calculatorContainer);
        }
    }
    
    setupAdvancedQuizEngine() {
        const originalQuizzes = document.querySelectorAll('.quiz-container');
        originalQuizzes.forEach((quiz, index) => {
            this.enhanceQuizInteractivity(quiz, index + 1);
        });
    }
    
    enhanceQuizInteractivity(quizContainer, moduleNumber) {
        // Add timer to quiz
        const timer = document.createElement('div');
        timer.className = 'quiz-timer';
        timer.innerHTML = `<span>⏱️ Time: <span id="timer${moduleNumber}">0:00</span></span>`;
        quizContainer.insertBefore(timer, quizContainer.firstChild);
        
        // Add explanation for each answer
        const options = quizContainer.querySelectorAll('.quiz-option');
        options.forEach((option, optionIndex) => {
            option.addEventListener('click', () => {
                this.handleEnhancedQuizAnswer(moduleNumber, optionIndex, option);
            });
        });
        
        // Start quiz timer
        this.startQuizTimer(moduleNumber);
    }
    
    handleEnhancedQuizAnswer(moduleNumber, optionIndex, optionElement) {
        const isCorrect = optionElement.textContent.includes('✓') || 
                         optionElement.getAttribute('data-correct') === 'true';
        
        // Record attempt
        if (!this.studentProgress.attempts[moduleNumber]) {
            this.studentProgress.attempts[moduleNumber] = [];
        }
        this.studentProgress.attempts[moduleNumber].push({
            timestamp: new Date().toISOString(),
            correct: isCorrect,
            timeSpent: this.getQuizTime(moduleNumber)
        });
        
        // Provide detailed feedback
        this.showDetailedFeedback(moduleNumber, isCorrect, optionIndex);
        
        // Update progress
        this.updateModuleProgress(moduleNumber, isCorrect);
        this.saveProgress();
    }
    
    showDetailedFeedback(moduleNumber, isCorrect, optionIndex) {
        const feedbackTexts = {
            1: [
                "Correct! A2L refrigerants have a lower flammability limit and require special safety precautions.",
                "Incorrect. A2L refrigerants are mildly flammable, not non-flammable like A1 refrigerants."
            ],
            2: [
                "Excellent! CSA B52-22 is the primary standard governing A2L refrigerant systems in Canada.",
                "Not quite. While other codes may apply, CSA B52-22 is the specific A2L standard."
            ]
        };
        
        const feedback = feedbackTexts[moduleNumber] ? 
            feedbackTexts[moduleNumber][isCorrect ? 0 : 1] : 
            (isCorrect ? "Correct!" : "Incorrect, please review the material.");
        
        const feedbackElement = document.querySelector(`#module${moduleNumber} .quiz-feedback`);
        if (feedbackElement) {
            feedbackElement.innerHTML = `
                <div class="enhanced-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                    <strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</strong>
                    <p>${feedback}</p>
                    ${!isCorrect ? '<p><em>💡 Tip: Review the module content above for more information.</em></p>' : ''}
                </div>
            `;
            feedbackElement.style.display = 'block';
        }
    }
    
    initializeStudentDashboard() {
        // Create comprehensive student analytics
        const analytics = {
            totalTimeSpent: this.calculateTotalTime(),
            averageScore: this.calculateAverageScore(),
            strongestAreas: this.identifyStrongAreas(),
            improvementAreas: this.identifyImprovementAreas(),
            projectedCompletion: this.estimateCompletion()
        };
        
        this.displayAnalytics(analytics);
    }
    
    calculateTotalTime() {
        const times = Object.values(this.studentProgress.timeSpent);
        return times.reduce((total, time) => total + (time || 0), 0);
    }
    
    calculateAverageScore() {
        const scores = Object.values(this.studentProgress.quizScores);
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }
    
    updateProgressDashboard() {
        const completed = this.studentProgress.completedModules.length;
        const total = this.modules.length;
        const percentage = Math.round((completed / total) * 100);
        
        // Update completion badge
        const badge = document.getElementById('completionBadge');
        if (badge) {
            badge.textContent = `${percentage}% Complete`;
            badge.className = `completion-badge ${percentage >= 100 ? 'complete' : percentage >= 50 ? 'halfway' : 'started'}`;
        }
        
        // Update progress cards
        this.updateProgressCard('modulesCompleted', `${completed}/${total}`);
        this.updateProgressCard('timeSpent', this.formatTime(this.calculateTotalTime()));
        this.updateProgressCard('averageScore', this.calculateAverageScore() + '%');
        this.updateProgressCard('certificateStatus', 
            this.studentProgress.certificateEarned ? 'Earned 🏆' : 
            completed === total ? 'Ready' : 'In Progress');
        
        // Update detailed module progress
        this.updateModuleProgressList();
    }
    
    updateProgressCard(cardId, value) {
        const element = document.getElementById(cardId);
        if (element) {
            element.textContent = value;
        }
    }
    
    updateModuleProgressList() {
        const listContainer = document.getElementById('moduleProgressList');
        if (!listContainer) return;
        
        listContainer.innerHTML = this.modules.map(module => {
            const isCompleted = this.studentProgress.completedModules.includes(module.id);
            const score = this.studentProgress.quizScores[module.id] || '--';
            const timeSpent = this.formatTime(this.studentProgress.timeSpent[module.id] || 0);
            
            return `
                <div class="module-progress-item ${isCompleted ? 'completed' : ''}">
                    <div class="module-progress-info">
                        <span class="module-title">Module ${module.id}: ${module.title}</span>
                        <span class="module-stats">Score: ${score}% | Time: ${timeSpent}</span>
                    </div>
                    <div class="module-progress-status">
                        ${isCompleted ? '✅' : '⏳'}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    
    startQuizTimer(moduleNumber) {
        let seconds = 0;
        const timerElement = document.getElementById(`timer${moduleNumber}`);
        
        if (!timerElement) return;
        
        const interval = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timerElement.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            
            // Update time spent in progress
            if (!this.studentProgress.timeSpent[moduleNumber]) {
                this.studentProgress.timeSpent[moduleNumber] = 0;
            }
            this.studentProgress.timeSpent[moduleNumber] = Math.ceil(seconds / 60);
        }, 1000);
        
        // Store interval for cleanup
        this.quizTimers = this.quizTimers || {};
        this.quizTimers[moduleNumber] = interval;
    }
    
    updateModuleProgress(moduleNumber, quizPassed) {
        if (quizPassed && !this.studentProgress.completedModules.includes(moduleNumber)) {
            this.studentProgress.completedModules.push(moduleNumber);
            this.studentProgress.currentModule = Math.min(moduleNumber + 1, this.modules.length);
        }
        
        this.updateProgressDashboard();
        this.checkCertificateEligibility();
    }
    
    checkCertificateEligibility() {
        const allModulesCompleted = this.studentProgress.completedModules.length === this.modules.length;
        const allScoresPass = this.modules.every(module => {
            const score = this.studentProgress.quizScores[module.id] || 0;
            return score >= module.requiredScore;
        });
        
        if (allModulesCompleted && allScoresPass && !this.studentProgress.certificateEarned) {
            this.triggerCertificateGeneration();
        }
    }
    
    triggerCertificateGeneration() {
        this.studentProgress.certificateEarned = true;
        this.studentProgress.completionDate = new Date().toISOString();
        this.saveProgress();
        
        // Show certificate notification
        this.showCertificateNotification();
    }
    
    showCertificateNotification() {
        const notification = document.createElement('div');
        notification.className = 'certificate-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎉 Congratulations!</h3>
                <p>You've successfully completed the A2L Safety Training Certificate Course!</p>
                <p>Your professional certificate is now available for download.</p>
                <button class="notification-btn" onclick="this.parentElement.parentElement.remove(); document.getElementById('module8').scrollIntoView();">
                    View My Certificate
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
    
    generateEnhancedCertificate(studentName) {
        const certificateData = {
            studentName: studentName,
            courseTitle: 'Canadian A2L Refrigerant Safety Certificate',
            completionDate: new Date().toLocaleDateString('en-CA'),
            certificateId: 'A2L-CSA-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            totalScore: this.calculateAverageScore(),
            timeSpent: this.formatTime(this.calculateTotalTime()),
            moduleScores: this.modules.map(module => ({
                title: module.title,
                score: this.studentProgress.quizScores[module.id] || 0,
                required: module.requiredScore
            })),
            issuingAuthority: 'LARK Labs HVAC Training',
            validUntil: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'), // 2 years
            qrCode: this.generateQRCodeData(certificateData)
        };
        
        return this.createProfessionalCertificateHTML(certificateData);
    }
    
    createProfessionalCertificateHTML(data) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A2L Safety Certificate - ${data.studentName}</title>
    <style>
        @page { size: letter; margin: 0.5in; }
        body { 
            font-family: 'Times New Roman', serif; 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            margin: 0; padding: 20px;
        }
        .certificate-frame {
            max-width: 8in; margin: 0 auto; background: white;
            border: 8px solid #2a5298; border-radius: 20px;
            padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .cert-header { text-align: center; margin-bottom: 30px; }
        .cert-logo { font-size: 3em; color: #2a5298; margin-bottom: 10px; }
        .cert-title { font-size: 1.8em; color: #1e3c72; font-weight: bold; margin-bottom: 5px; }
        .cert-subtitle { font-size: 1.2em; color: #666; }
        .student-name { 
            font-size: 2.2em; color: #2a5298; font-weight: bold; 
            text-align: center; margin: 30px 0; 
            font-family: 'Brush Script MT', cursive, 'Dancing Script', cursive;
        }
        .achievement-text { text-align: center; font-size: 1.1em; line-height: 1.6; margin-bottom: 30px; }
        .details-grid { 
            display: grid; grid-template-columns: 1fr 1fr; gap: 20px; 
            margin: 30px 0; font-size: 0.95em; 
        }
        .detail-item { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #2a5298; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
        .signature { text-align: center; flex: 1; }
        .sig-line { border-top: 2px solid #333; margin-bottom: 5px; }
        .cert-footer { text-align: center; margin-top: 30px; font-size: 0.85em; color: #666; }
        .module-scores { margin: 20px 0; }
        .score-item { 
            display: flex; justify-content: space-between; 
            padding: 8px; border-bottom: 1px solid #eee; 
        }
        .qr-section { position: absolute; top: 20px; right: 20px; text-align: center; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="certificate-frame">
        <div class="qr-section">
            <div style="width: 80px; height: 80px; background: #f0f0f0; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 10px;">QR CODE</div>
            <div>Verify Online</div>
        </div>
        
        <div class="cert-header">
            <div class="cert-logo">🏆</div>
            <div class="cert-title">LARK Labs HVAC Training</div>
            <div class="cert-subtitle">Professional Certification Program</div>
        </div>
        
        <h2 style="text-align: center; color: #1e3c72; margin-bottom: 20px; font-size: 1.6em;">
            Canadian A2L Refrigerant Safety Certificate
        </h2>
        
        <div class="achievement-text">
            <p>This is to certify that</p>
        </div>
        
        <div class="student-name">${data.studentName}</div>
        
        <div class="achievement-text">
            <p>has successfully completed the comprehensive Canadian A2L Refrigerant Safety Certificate Course,
            demonstrating proficiency in safe practices for working with mildly flammable A2L refrigerants
            in accordance with CSA B52-22 and Canadian safety standards.</p>
        </div>
        
        <div class="details-grid">
            <div class="detail-item">
                <strong>Certificate ID:</strong><br>${data.certificateId}
            </div>
            <div class="detail-item">
                <strong>Completion Date:</strong><br>${data.completionDate}
            </div>
            <div class="detail-item">
                <strong>Overall Score:</strong><br>${data.totalScore}%
            </div>
            <div class="detail-item">
                <strong>Training Duration:</strong><br>${data.timeSpent}
            </div>
            <div class="detail-item">
                <strong>Valid Until:</strong><br>${data.validUntil}
            </div>
            <div class="detail-item">
                <strong>Issuing Authority:</strong><br>${data.issuingAuthority}
            </div>
        </div>
        
        <div class="module-scores">
            <h4 style="color: #1e3c72; margin-bottom: 15px;">Module Performance Summary</h4>
            ${data.moduleScores.map(module => `
                <div class="score-item">
                    <span>${module.title}</span>
                    <span style="color: ${module.score >= module.required ? '#28a745' : '#dc3545'};">
                        ${module.score}% (Required: ${module.required}%)
                    </span>
                </div>
            `).join('')}
        </div>
        
        <div class="signatures">
            <div class="signature">
                <div class="sig-line" style="width: 200px; margin: 0 auto 5px;"></div>
                <div><strong>Mike Kapin</strong></div>
                <div>Chief Training Officer</div>
                <div>LARK Labs HVAC Training</div>
            </div>
            <div class="signature">
                <div class="sig-line" style="width: 200px; margin: 0 auto 5px;"></div>
                <div><strong>Training Department</strong></div>
                <div>CSA B52 Compliance Officer</div>
                <div>LARK Labs</div>
            </div>
        </div>
        
        <div class="cert-footer">
            <p><strong>This certificate verifies completion of comprehensive A2L refrigerant safety training 
            covering CSA B52-22 requirements, installation protocols, safety procedures, and emergency response.</strong></p>
            <p style="margin-top: 10px;">
                Certificate verification available at: larklabs.ca/verify/${data.certificateId}
            </p>
            <p style="margin-top: 5px; font-size: 0.8em;">
                Issued by LARK Labs HVAC Training • Professional HVAC Education & Certification
            </p>
        </div>
    </div>
</body>
</html>`;
    }
    
    setupAutosave() {
        // Auto-save progress every 30 seconds
        setInterval(() => {
            this.saveProgress();
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });
    }
    
    saveProgress() {
        this.studentProgress.lastActivity = new Date().toISOString();
        localStorage.setItem('a2l_training_progress', JSON.stringify(this.studentProgress));
    }
    
    // Advanced quiz functionality
    initializeDragDrop() {
        const dragItems = document.querySelectorAll('.drag-item-enhanced');
        const dropZones = document.querySelectorAll('.drop-zone-enhanced');
        
        dragItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
                e.dataTransfer.setData('category', e.target.dataset.category);
            });
        });
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => e.preventDefault());
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const itemId = e.dataTransfer.getData('text/plain');
                const itemCategory = e.dataTransfer.getData('category');
                const zoneCategory = zone.dataset.category;
                
                if (itemCategory === zoneCategory) {
                    const draggedItem = document.querySelector(`[data-id="${itemId}"]`);
                    zone.querySelector('.drop-area').appendChild(draggedItem);
                    this.checkDragDropCompletion();
                }
            });
        });
    }
    
    checkDragDropCompletion() {
        const dropAreas = document.querySelectorAll('.drop-area');
        let allCorrect = true;
        
        dropAreas.forEach(area => {
            if (area.children.length === 0) {
                allCorrect = false;
            }
        });
        
        if (allCorrect) {
            this.showDragDropSuccess();
        }
    }
    
    showDragDropSuccess() {
        const feedback = document.querySelector('.exercise-feedback');
        if (feedback) {
            feedback.innerHTML = `
                <div class="success-message">
                    <h4>🎉 Excellent! All items correctly categorized!</h4>
                    <p>You've demonstrated strong understanding of A2L installation requirements.</p>
                </div>
            `;
            feedback.style.display = 'block';
        }
    }
    
    initializeInteractiveDiagram() {
        const hotspots = document.querySelectorAll('.hotspot');
        const infoDisplay = document.getElementById('diagramInfo');
        
        const infoData = {
            'outdoor-unit': {
                title: 'Outdoor Unit Safety',
                content: 'A2L outdoor units must be installed with proper clearances and ventilation per CSA B52-22.'
            },
            'indoor-unit': {
                title: 'Indoor Unit Requirements',
                content: 'Indoor units require mechanical ventilation and must be positioned away from ignition sources.'
            },
            'detector': {
                title: 'Leak Detection System',
                content: 'A2L systems require refrigerant leak detectors positioned in potential accumulation areas.'
            },
            'ventilation': {
                title: 'Ventilation System',
                content: 'Mechanical ventilation must provide adequate air changes to prevent accumulation.'
            }
        };
        
        hotspots.forEach(hotspot => {
            hotspot.addEventListener('click', () => {
                const info = infoData[hotspot.dataset.info];
                infoDisplay.innerHTML = `
                    <h5>${info.title}</h5>
                    <p>${info.content}</p>
                `;
            });
        });
    }
    
    exportTrainingRecord() {
        const record = {
            student: {
                completionDate: this.studentProgress.completionDate,
                totalTime: this.calculateTotalTime(),
                averageScore: this.calculateAverageScore()
            },
            modules: this.modules.map(module => ({
                id: module.id,
                title: module.title,
                completed: this.studentProgress.completedModules.includes(module.id),
                score: this.studentProgress.quizScores[module.id] || 0,
                timeSpent: this.studentProgress.timeSpent[module.id] || 0,
                attempts: this.studentProgress.attempts[module.id] || []
            })),
            certificate: {
                earned: this.studentProgress.certificateEarned,
                id: this.studentProgress.certificateId
            }
        };
        
        const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `A2L_Training_Record_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Enhanced calculator functions for real-time learning
window.calculateLFL = function() {
    const refrigerant = document.getElementById('lfl-refrigerant').value;
    const volume = parseFloat(document.getElementById('lfl-volume').value);
    const leakRate = parseFloat(document.getElementById('lfl-leak-rate').value);
    
    if (!volume || !leakRate) {
        document.getElementById('lfl-result').innerHTML = 
            '<div class="calc-warning">⚠️ Please enter both room volume and leak rate</div>';
        return;
    }
    
    const lflValues = {
        'R-32': 0.307,
        'R-454B': 0.063,
        'R-454C': 0.070,
        'R-468A': 0.045
    };
    
    const lfl = lflValues[refrigerant];
    const massToLFL = lfl * volume; // kg
    const timeToLFL = massToLFL / leakRate; // hours
    
    const resultHtml = `
        <div class="calc-success">
            <h5>🔥 LFL Analysis Results</h5>
            <div class="result-grid">
                <div class="result-item">
                    <strong>Refrigerant:</strong> ${refrigerant}
                </div>
                <div class="result-item">
                    <strong>LFL Concentration:</strong> ${lfl} kg/m³
                </div>
                <div class="result-item">
                    <strong>Mass to Reach LFL:</strong> ${massToLFL.toFixed(3)} kg
                </div>
                <div class="result-item">
                    <strong>Time to LFL:</strong> ${timeToLFL.toFixed(2)} hours
                </div>
            </div>
            <div class="safety-recommendation">
                <strong>Safety Recommendation:</strong>
                ${timeToLFL < 1 ? 
                    '🚨 HIGH RISK: Install enhanced ventilation and leak detection systems' :
                    timeToLFL < 24 ? 
                    '⚠️ MODERATE RISK: Ensure proper ventilation and regular monitoring' :
                    '✅ LOWER RISK: Standard A2L safety measures apply'
                }
            </div>
        </div>
    `;
    
    document.getElementById('lfl-result').innerHTML = resultHtml;
};

window.calculateChargeLimit = function() {
    const area = parseFloat(document.getElementById('charge-area').value);
    const height = parseFloat(document.getElementById('charge-height').value);
    const refrigerant = document.getElementById('charge-refrigerant').value;
    
    if (!area || !height) {
        document.getElementById('charge-result').innerHTML = 
            '<div class="calc-warning">⚠️ Please enter room area and height</div>';
        return;
    }
    
    const volume = area * height;
    const lflValues = {
        'R-32': 0.307,
        'R-454B': 0.063,
        'R-454C': 0.070,
        'R-468A': 0.045
    };
    
    const lfl = lflValues[refrigerant];
    const maxCharge = (lfl * volume * 0.25); // 25% of LFL per CSA B52
    
    const resultHtml = `
        <div class="calc-success">
            <h5>⚖️ Maximum Charge Calculation</h5>
            <div class="result-grid">
                <div class="result-item">
                    <strong>Room Volume:</strong> ${volume.toFixed(1)} m³
                </div>
                <div class="result-item">
                    <strong>Maximum Charge (25% LFL):</strong> ${maxCharge.toFixed(2)} kg
                </div>
                <div class="result-item">
                    <strong>Safety Factor:</strong> 4:1 (25% of LFL)
                </div>
            </div>
            <div class="compliance-note">
                <strong>CSA B52-22 Compliance:</strong> Maximum refrigerant charge must not exceed 25% of 
                the Lower Flammability Limit for the occupied space volume.
            </div>
        </div>
    `;
    
    document.getElementById('charge-result').innerHTML = resultHtml;
};

window.calculateVentilation = function() {
    const charge = parseFloat(document.getElementById('vent-charge').value);
    const roomType = document.getElementById('vent-room-type').value;
    const installType = document.getElementById('vent-install-type').value;
    
    if (!charge) {
        document.getElementById('ventilation-result').innerHTML = 
            '<div class="calc-warning">⚠️ Please enter refrigerant charge</div>';
        return;
    }
    
    // Ventilation requirements based on CSA B52-22
    const ventRates = {
        residential: { base: 0.5, enhanced: 2.0 },
        commercial: { base: 1.0, enhanced: 4.0 },
        industrial: { base: 2.0, enhanced: 6.0 }
    };
    
    const baseRate = ventRates[roomType].base;
    const enhancedRate = ventRates[roomType].enhanced;
    const requiresEnhanced = charge > 1.84; // kg threshold for enhanced ventilation
    
    const resultHtml = `
        <div class="calc-success">
            <h5>💨 Ventilation Requirements</h5>
            <div class="result-grid">
                <div class="result-item">
                    <strong>Charge Amount:</strong> ${charge} kg
                </div>
                <div class="result-item">
                    <strong>Required Ventilation:</strong> 
                    ${requiresEnhanced ? `${enhancedRate} ACH (Enhanced)` : `${baseRate} ACH (Standard)`}
                </div>
                <div class="result-item">
                    <strong>System Type Impact:</strong> 
                    ${installType === 'ducted' ? 'Ductwork ventilation acceptable' : 'Direct ventilation required'}
                </div>
            </div>
            <div class="compliance-note">
                <strong>CSA B52-22 Requirement:</strong> 
                ${requiresEnhanced ? 
                    'Enhanced mechanical ventilation required due to charge amount >1.84kg' :
                    'Standard ventilation acceptable for this charge amount'
                }
            </div>
        </div>
    `;
    
    document.getElementById('ventilation-result').innerHTML = resultHtml;
};

window.calculateDetectionReqs = function() {
    const charge = parseFloat(document.getElementById('detect-charge').value);
    const location = document.getElementById('detect-location').value;
    const occupancy = document.getElementById('detect-occupancy').value;
    
    if (!charge) {
        document.getElementById('detection-result').innerHTML = 
            '<div class="calc-warning">⚠️ Please enter system charge</div>';
        return;
    }
    
    // Detection requirements based on CSA B52-22
    const requiresDetection = charge > 1.84 || location === 'basement' || occupancy === 'residential';
    const detectionLevel = charge > 5.0 ? '25% LFL' : '50% LFL';
    const numDetectors = location === 'basement' ? Math.ceil(charge / 2.5) : Math.ceil(charge / 5.0);
    
    const resultHtml = `
        <div class="calc-success">
            <h5>🔍 Leak Detection Requirements</h5>
            <div class="result-grid">
                <div class="result-item">
                    <strong>Detection Required:</strong> 
                    ${requiresDetection ? '✅ Yes' : '❌ No'}
                </div>
                <div class="result-item">
                    <strong>Alarm Setpoint:</strong> ${detectionLevel}
                </div>
                <div class="result-item">
                    <strong>Minimum Detectors:</strong> ${numDetectors}
                </div>
                <div class="result-item">
                    <strong>Detector Placement:</strong> 
                    ${location === 'basement' ? 'Low level (A2L gases sink)' : 'Breathing zone level'}
                </div>
            </div>
            <div class="compliance-note">
                <strong>CSA B52-22 Compliance:</strong> 
                ${requiresDetection ? 
                    `Detection system mandatory. Detectors must be A2L-rated and interconnected with ventilation system.` :
                    'Detection recommended but not mandatory for this installation.'
                }
            </div>
        </div>
    `;
    
    document.getElementById('detection-result').innerHTML = resultHtml;
};

// Initialize enhanced training system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for original course to load, then enhance
    setTimeout(() => {
        window.enhancedA2LTraining = new EnhancedA2LTraining();
        console.log('Enhanced A2L Training System loaded successfully');
    }, 1000);
});

// Enhanced certificate download with professional validation
window.downloadEnhancedCertificate = function(studentName) {
    if (!window.enhancedA2LTraining) {
        alert('Training system not fully loaded. Please try again.');
        return;
    }
    
    const certificateHTML = window.enhancedA2LTraining.generateEnhancedCertificate(studentName);
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `A2L_Professional_Certificate_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Professional A2L Certificate downloaded! Open in browser and use Print → Save as PDF for official certification.');
};

// Export training analytics for instructors
window.exportTrainingAnalytics = function() {
    if (!window.enhancedA2LTraining) return;
    
    window.enhancedA2LTraining.exportTrainingRecord();
};