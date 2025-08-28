// components/MaintenanceForm/GasFurnaceForm.js
// Touch-optimized Gas Furnace Maintenance Form for HVAC Jack 4.0
// Based on the existing HTML form with mobile enhancements

class GasFurnaceForm {
    constructor(containerElement, mobileService) {
        this.container = containerElement;
        this.mobileService = mobileService;
        this.formData = {};
        this.autoSaveInterval = null;
        this.validationRules = this.initValidationRules();
        
        this.init();
    }

    /**
     * Initialize the form component
     */
    async init() {
        try {
            // Apply mobile-specific configuration
            this.configureMobileSettings();
            
            // Initialize auto-save
            this.initAutoSave();
            
            console.log('✅ Gas Furnace Form initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Gas Furnace Form:', error);
        }
    }

    /**
     * Configure mobile-specific settings
     */
    configureMobileSettings() {
        this.isMobile = this.mobileService.deviceInfo.isMobile;
        this.isTablet = this.mobileService.deviceInfo.isTablet;
        this.touchTargetSize = this.mobileService.getTouchTargetSize();
        this.fontSizes = this.mobileService.getFontSizes();
        this.spacing = this.mobileService.getSpacing();
    }

    /**
     * Render the complete form
     */
    async render() {
        this.container.innerHTML = this.generateFormHTML();
        
        // Apply mobile optimizations after rendering
        this.applyMobileOptimizations();
        
        // Setup form interactions
        this.setupFormInteractions();
        
        // Initialize form validation
        this.initFormValidation();
        
        // Setup accessibility features
        this.setupAccessibility();
    }

    /**
     * Generate the complete form HTML with mobile optimizations
     */
    generateFormHTML() {
        return `
            <div class="gas-furnace-form ${this.isMobile ? 'mobile-layout' : ''}">
                ${this.generateHeaderSection()}
                ${this.generateCustomerInfoSection()}
                ${this.generateEquipmentInfoSection()}
                ${this.generatePreServiceSection()}
                ${this.generateCombustionAnalysisSection()}
                ${this.generatePerformanceTestingSection()}
                ${this.generateSafetyInspectionSection()}
                ${this.generateMaintenanceActionsSection()}
                ${this.generateCommentsSection()}
                ${this.generateServiceSummarySection()}
                ${this.generateSignatureSection()}
                ${this.generateEmailSection()}
                ${this.generateMobileActions()}
            </div>
        `;
    }

    /**
     * Generate header section
     */
    generateHeaderSection() {
        return `
            <div class="form-section header-section">
                <div class="form-header ${this.isMobile ? 'mobile-header' : ''}">
                    <div class="logo-section">
                        <div class="hvac-jack-logo">🔧</div>
                        <div class="company-info">
                            <h1>HVAC Jack</h1>
                            <p>Professional HVAC Service Solutions</p>
                        </div>
                    </div>
                    <div class="form-title-section">
                        <h2>Gas Furnace Maintenance Form</h2>
                        <div class="service-info">
                            <div class="form-group inline-group">
                                <label>Service Date:</label>
                                <input type="date" id="service-date" class="touch-optimized" 
                                       value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group inline-group">
                                <label>Service Order #:</label>
                                <input type="text" id="service-order" class="touch-optimized" 
                                       placeholder="SO-${Date.now().toString().slice(-6)}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate customer information section
     */
    generateCustomerInfoSection() {
        return `
            <div class="form-section collapsible-section" data-section="customer-info">
                <div class="section-header touch-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3 class="section-title">
                        <span class="section-icon">👤</span>
                        Customer Information
                    </h3>
                    <span class="collapse-indicator">▼</span>
                </div>
                <div class="section-content">
                    <div class="form-grid ${this.isMobile ? 'mobile-grid' : ''}">
                        <div class="form-group">
                            <label for="customer-name">Customer Name <span class="required">*</span>:</label>
                            <input type="text" id="customer-name" class="touch-optimized required" 
                                   placeholder="Enter customer name" autocomplete="name">
                        </div>
                        <div class="form-group">
                            <label for="customer-phone">Phone Number:</label>
                            <input type="tel" id="customer-phone" class="touch-optimized" 
                                   placeholder="(555) 123-4567" autocomplete="tel">
                        </div>
                    </div>
                    <div class="form-grid ${this.isMobile ? 'mobile-grid' : ''}">
                        <div class="form-group">
                            <label for="customer-email-primary">Customer Email:</label>
                            <input type="email" id="customer-email-primary" class="touch-optimized" 
                                   placeholder="customer@email.com" autocomplete="email"
                                   onchange="window.gasFurnaceForm?.syncCustomerEmail()">
                        </div>
                        <div class="form-group">
                            <label for="service-address">Service Address <span class="required">*</span>:</label>
                            <input type="text" id="service-address" class="touch-optimized required" 
                                   placeholder="Enter complete service address" autocomplete="address-line1">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate equipment information section
     */
    generateEquipmentInfoSection() {
        return `
            <div class="form-section collapsible-section" data-section="equipment-info">
                <div class="section-header touch-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3 class="section-title">
                        <span class="section-icon">⚙️</span>
                        Equipment Information
                    </h3>
                    <span class="collapse-indicator">▼</span>
                </div>
                <div class="section-content">
                    <div class="auto-populated-notice">
                        <span class="notice-icon">📷</span>
                        <span>Data extracted from equipment rating plate photo</span>
                        <div class="confidence-indicator">
                            <span>Confidence: </span>
                            <span id="data-confidence" class="confidence-score">--</span>
                        </div>
                    </div>
                    <div class="form-grid ${this.isMobile ? 'mobile-grid' : ''}">
                        <div class="form-group">
                            <label for="equipment-manufacturer">Manufacturer:</label>
                            <input type="text" id="equipment-manufacturer" class="touch-optimized auto-filled" 
                                   placeholder="Auto-filled from photo">
                        </div>
                        <div class="form-group">
                            <label for="equipment-model">Model Number:</label>
                            <input type="text" id="equipment-model" class="touch-optimized auto-filled" 
                                   placeholder="Auto-filled from photo">
                        </div>
                    </div>
                    <div class="form-grid ${this.isMobile ? 'mobile-grid' : ''}">
                        <div class="form-group">
                            <label for="equipment-serial">Serial Number:</label>
                            <input type="text" id="equipment-serial" class="touch-optimized auto-filled" 
                                   placeholder="Auto-filled from photo">
                        </div>
                        <div class="form-group">
                            <label for="equipment-btu">Input BTU Rating:</label>
                            <input type="text" id="equipment-btu" class="touch-optimized auto-filled" 
                                   placeholder="Auto-filled from photo">
                        </div>
                    </div>
                    <div class="form-grid ${this.isMobile ? 'mobile-grid-3' : 'form-grid-3'}">
                        <div class="form-group">
                            <label for="equipment-afue">AFUE Rating:</label>
                            <input type="text" id="equipment-afue" class="touch-optimized auto-filled" 
                                   placeholder="Auto-filled">
                        </div>
                        <div class="form-group">
                            <label for="equipment-gas-type">Gas Type:</label>
                            <select id="equipment-gas-type" class="touch-optimized auto-filled">
                                <option value="Natural Gas">Natural Gas</option>
                                <option value="Propane">Propane (LP)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="equipment-install-date">Installation Date:</label>
                            <input type="text" id="equipment-install-date" class="touch-optimized auto-filled" 
                                   placeholder="Auto-filled if available">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate pre-service inspection section
     */
    generatePreServiceSection() {
        const inspectionItems = [
            { id: 'check-thermostat', label: 'Thermostat operation check' },
            { id: 'check-filter', label: 'Filter condition assessed' },
            { id: 'check-venting', label: 'Venting system inspection' },
            { id: 'check-gasline', label: 'Gas line leak check (soap test)' },
            { id: 'check-electrical', label: 'Electrical connections secure' },
            { id: 'check-safety-devices', label: 'Safety devices operational' }
        ];

        return `
            <div class="form-section collapsible-section" data-section="pre-service">
                <div class="section-header touch-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3 class="section-title">
                        <span class="section-icon">🔍</span>
                        Pre-Service Inspection Checklist
                    </h3>
                    <span class="collapse-indicator">▼</span>
                </div>
                <div class="section-content">
                    <div class="checkbox-grid ${this.isMobile ? 'mobile-checkbox-grid' : ''}">
                        ${inspectionItems.map(item => `
                            <div class="checkbox-item touch-checkbox">
                                <input type="checkbox" id="${item.id}" class="touch-checkbox-input">
                                <label for="${item.id}" class="touch-checkbox-label">${item.label}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate combustion analysis section
     */
    generateCombustionAnalysisSection() {
        const analysisParameters = [
            { parameter: 'Oxygen (O₂) %', target: '8-10%', id: 'oxygen' },
            { parameter: 'Carbon Monoxide (CO) ppm', target: '< 100 ppm', id: 'carbon-monoxide' },
            { parameter: 'Carbon Dioxide (CO₂) %', target: '8-9%', id: 'carbon-dioxide' },
            { parameter: 'Stack Temperature (°F)', target: '300-500°F', id: 'stack-temp' },
            { parameter: 'Draft ("WC)', target: '-0.02 to -0.04', id: 'draft' },
            { parameter: 'Gas Pressure - Manifold ("WC)', target: '3.5" WC (NG)', id: 'gas-pressure' }
        ];

        return `
            <div class="form-section collapsible-section" data-section="combustion-analysis">
                <div class="section-header touch-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3 class="section-title">
                        <span class="section-icon">🔥</span>
                        Combustion Analysis & Performance Testing
                    </h3>
                    <span class="collapse-indicator">▼</span>
                </div>
                <div class="section-content">
                    ${this.isMobile ? this.generateMobileCombustionTable(analysisParameters) : this.generateDesktopCombustionTable(analysisParameters)}
                </div>
            </div>
        `;
    }

    /**
     * Generate mobile-optimized combustion analysis cards
     */
    generateMobileCombustionTable(parameters) {
        return `
            <div class="mobile-analysis-cards">
                ${parameters.map(param => `
                    <div class="analysis-card">
                        <div class="card-header">
                            <h4 class="parameter-name">${param.parameter}</h4>
                            <div class="target-value">Target: ${param.target}</div>
                        </div>
                        <div class="card-body">
                            <div class="reading-input">
                                <label for="${param.id}-reading">Actual Reading:</label>
                                <input type="text" id="${param.id}-reading" class="touch-optimized reading-field" 
                                       placeholder="Enter reading" inputmode="decimal">
                            </div>
                            <div class="pass-fail-select">
                                <label for="${param.id}-result">Result:</label>
                                <select id="${param.id}-result" class="touch-optimized result-field">
                                    <option value="">Select Result</option>
                                    <option value="pass">✅ Pass</option>
                                    <option value="fail">❌ Fail</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Generate desktop combustion analysis table
     */
    generateDesktopCombustionTable(parameters) {
        return `
            <div class="analysis-table-container">
                <table class="readings-table">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Target Range</th>
                            <th>Actual Reading</th>
                            <th>Pass/Fail</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${parameters.map(param => `
                            <tr>
                                <td><strong>${param.parameter}</strong></td>
                                <td class="target-value">${param.target}</td>
                                <td>
                                    <input type="text" id="${param.id}-reading" class="table-input" 
                                           placeholder="Enter reading" inputmode="decimal">
                                </td>
                                <td>
                                    <select id="${param.id}-result" class="table-select">
                                        <option value="">-</option>
                                        <option value="pass">Pass</option>
                                        <option value="fail">Fail</option>
                                    </select>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Generate additional performance testing section
     */
    generatePerformanceTestingSection() {
        return `
            <div class="form-section collapsible-section" data-section="performance-testing">
                <div class="section-header touch-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3 class="section-title">
                        <span class="section-icon">📊</span>
                        Additional Performance Testing
                    </h3>
                    <span class="collapse-indicator">▼</span>
                </div>
                <div class="section-content">
                    <div class="form-grid ${this.isMobile ? 'mobile-grid' : ''}">
                        <div class="form-group">
                            <label for="temperature-rise">Temperature Rise (°F):</label>
                            <input type="text" id="temperature-rise" class="touch-optimized" 
                                   placeholder="Actual reading" inputmode="decimal">
                            <small class="field-hint">Spec range: Auto-filled based on equipment data</small>
                        </div>
                        <div class="form-group">
                            <label for="blower-amp-draw">Blower Motor Amp Draw (A):</label>
                            <input type="text" id="blower-amp-draw" class="touch-optimized" 
                                   placeholder="Actual reading" inputmode="decimal">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="static-pressure">Static Pressure Readings:</label>
                        <textarea id="static-pressure" class="touch-optimized" rows="${this.isMobile ? '3' : '2'}" 
                                  placeholder="Record supply and return static pressures..."></textarea>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate critical safety inspection section
     */
    generateSafetyInspectionSection() {
        const safetyItems = [
            { id: 'safety-heat-exchanger', label: 'Heat exchanger inspection (no cracks/corrosion)', critical: true },
            { id: 'safety-flue', label: 'Flue pipe connections secure', critical: true },
            { id: 'safety-co-test', label: 'CO test at registers (ambient air)', critical: true },
            { id: 'safety-gas-valve', label: 'Gas valve operation test', critical: true },
            { id: 'safety-limit-switch', label: 'Limit switch operation test', critical: true },
            { id: 'safety-flame-sensor', label: 'Flame sensor cleaned/tested', critical: true }
        ];

        return `
            <div class="form-section collapsible-section critical-section" data-section="safety-inspection">
                <div class="section-header touch-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3 class="section-title">
                        <span class="section-icon">🚨</span>
                        Critical Safety Inspection
                    </h3>
                    <span class="collapse-indicator">▼</span>
                </div>
                <div class="section-content">
                    <div class="safety-warning">
                        <span class="warning-icon">⚠️</span>
                        <strong>SAFETY ALERT:</strong> All safety inspection items must be completed before system operation.
                    </div>
                    <div class="checkbox-grid ${this.isMobile ? 'mobile-checkbox-grid' : ''}">
                        ${safetyItems.map(item => `
                            <div class="checkbox-item touch-checkbox safety-item">
                                <input type="checkbox" id="${item.id}" class="touch-checkbox-input safety-checkbox" 
                                       data-critical="${item.critical}">
                                <label for="${item.id}" class="touch-checkbox-label">${item.label}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate maintenance actions section
     */
    generateMaintenanceActionsSection() {
        const maintenanceItems = [
            { id: 'maint-filter-replace', label: 'Filter replaced' },
            { id: 'maint-flame-clean', label: 'Flame sensor cleaned' },
            { id: 'maint-burner-clean', label: 'Burner assembly cleaned' },
            { id: 'maint-blower-clean', label: 'Blower wheel cleaned' },
            { id: 'maint-condensate', label: 'Condensate drain cleared' },
            { id: 'maint-belt', label: 'Belt tension adjusted/replaced' },
            { id: 'maint-lubrication', label: 'Motor lubrication (if applicable)' },
            { id: 'maint-controls', label: 'Control calibration check' }
        ];

        return `
            <div class="form-section collapsible-section" data-section="maintenance-actions">
                <div class="section-header touch-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3 class="section-title">
                        <span class="section-icon">🔧</span>
                        Maintenance Actions Performed
                    </h3>
                    <span class="collapse-indicator">▼</span>
                </div>
                <div class="section-content">
                    <div class="checkbox-grid ${this.isMobile ? 'mobile-checkbox-grid' : ''}">
                        ${maintenanceItems.map(item => `
                            <div class="checkbox-item touch-checkbox">
                                <input type="checkbox" id="${item.id}" class="touch-checkbox-input">
                                <label for="${item.id}" class="touch-checkbox-label">${item.label}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate comments and recommendations section
     */
    generateCommentsSection() {
        return `
            <div class="form-section collapsible-section" data-section="comments">
                <div class="section-header touch-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3 class="section-title">
                        <span class="section-icon">📝</span>
                        Technician Comments & Recommendations
                    </h3>
                    <span class="collapse-indicator">▼</span>
                </div>
                <div class="section-content">
                    <div class="form-group">
                        <label for="observations">Observations & Issues Found:</label>
                        <textarea id="observations" class="touch-optimized" rows="${this.isMobile ? '4' : '4'}" 
                                  placeholder="Describe any issues found, unusual conditions, or areas of concern..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="recommendations">Recommendations for Customer:</label>
                        <textarea id="recommendations" class="touch-optimized" rows="${this.isMobile ? '3' : '3'}" 
                                  placeholder="List recommended repairs, upgrades, or future maintenance items..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="parts-needed">Parts Needed for Future Service:</label>
                        <textarea id="parts-needed" class="touch-optimized" rows="${this.isMobile ? '2' : '2'}" 
                                  placeholder="List any parts that should be ordered for future visits..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="next-maintenance">Next Scheduled Maintenance:</label>
                        <input type="date" id="next-maintenance" class="touch-optimized" 
                               min="${new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}">
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate service summary section
     */
    generateServiceSummarySection() {
        return `
            <div class="form-section" data-section="service-summary">
                <div class="section-header">
                    <h3 class="section-title">
                        <span class="section-icon">📋</span>
                        Service Summary
                    </h3>
                </div>
                <div class="section-content">
                    <div class="service-status">
                        <label for="service-status"><strong>Service Status:</strong></label>
                        <select id="service-status" class="touch-optimized status-select">
                            <option value="">Select Status</option>
                            <option value="completed">✅ Service Completed Successfully</option>
                            <option value="follow-up">⏰ Service Completed - Follow-up Required</option>
                            <option value="safety-issue">🚨 Service Incomplete - Safety Issue</option>
                            <option value="parts-required">🔧 Service Incomplete - Parts Required</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="service-time">Service Time (hours):</label>
                        <input type="number" id="service-time" class="touch-optimized" 
                               step="0.25" placeholder="2.5" inputmode="decimal">
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate signature section
     */
    generateSignatureSection() {
        return `
            <div class="form-section" data-section="signatures">
                <div class="section-header">
                    <h3 class="section-title">
                        <span class="section-icon">✍️</span>
                        Digital Signatures
                    </h3>
                </div>
                <div class="section-content">
                    <div class="signature-grid ${this.isMobile ? 'mobile-signature-grid' : ''}">
                        <div class="signature-box">
                            <h4>Customer Acknowledgment</h4>
                            <div class="signature-area" id="customer-signature">
                                <canvas class="signature-canvas" width="300" height="150"></canvas>
                                <div class="signature-placeholder">Tap to sign</div>
                            </div>
                            <button type="button" class="btn-clear-signature touch-btn" onclick="this.parentElement.querySelector('canvas').getContext('2d').clearRect(0,0,300,150)">
                                Clear Signature
                            </button>
                            <p class="signature-text">I acknowledge that the maintenance service has been completed as described above.</p>
                        </div>
                        <div class="signature-box">
                            <h4>Technician Certification</h4>
                            <div class="form-group">
                                <label for="technician-name">Technician Name:</label>
                                <input type="text" id="technician-name" class="touch-optimized" placeholder="Enter technician name">
                            </div>
                            <div class="form-group">
                                <label for="technician-license">License Number:</label>
                                <input type="text" id="technician-license" class="touch-optimized" placeholder="Certified Gas Technician License #">
                            </div>
                            <div class="signature-area" id="technician-signature">
                                <canvas class="signature-canvas" width="300" height="150"></canvas>
                                <div class="signature-placeholder">Tap to sign</div>
                            </div>
                            <button type="button" class="btn-clear-signature touch-btn" onclick="this.parentElement.querySelector('canvas').getContext('2d').clearRect(0,0,300,150)">
                                Clear Signature
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate email distribution section
     */
    generateEmailSection() {
        return `
            <div class="form-section collapsible-section" data-section="email-distribution">
                <div class="section-header touch-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3 class="section-title">
                        <span class="section-icon">📧</span>
                        Digital Record Distribution
                    </h3>
                    <span class="collapse-indicator">▼</span>
                </div>
                <div class="section-content">
                    <div class="form-grid ${this.isMobile ? 'mobile-grid' : ''}">
                        <div class="form-group">
                            <label for="customer-email">Customer Email:</label>
                            <input type="email" id="customer-email" class="touch-optimized" 
                                   placeholder="customer@email.com" autocomplete="email">
                        </div>
                        <div class="form-group">
                            <label for="company-email">Technician/Company Email:</label>
                            <input type="email" id="company-email" class="touch-optimized" 
                                   placeholder="tech@company.com" autocomplete="email">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="email-subject">Email Subject Line:</label>
                        <input type="text" id="email-subject" class="touch-optimized" 
                               placeholder="Gas Furnace Maintenance Report - [Customer Name] - [Service Date]">
                    </div>
                    <div class="checkbox-grid ${this.isMobile ? 'mobile-checkbox-grid' : ''}">
                        <div class="checkbox-item touch-checkbox">
                            <input type="checkbox" id="email-customer" class="touch-checkbox-input" checked>
                            <label for="email-customer" class="touch-checkbox-label">Email report to customer</label>
                        </div>
                        <div class="checkbox-item touch-checkbox">
                            <input type="checkbox" id="email-company" class="touch-checkbox-input" checked>
                            <label for="email-company" class="touch-checkbox-label">Email copy to technician/company</label>
                        </div>
                        <div class="checkbox-item touch-checkbox">
                            <input type="checkbox" id="auto-schedule-reminder" class="touch-checkbox-input">
                            <label for="auto-schedule-reminder" class="touch-checkbox-label">Include next maintenance reminder</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate mobile action buttons
     */
    generateMobileActions() {
        if (!this.isMobile) return '';
        
        return `
            <div class="mobile-action-bar">
                <button type="button" class="mobile-action-btn secondary" onclick="window.gasFurnaceForm?.collapseAllSections()">
                    <span class="btn-icon">📋</span>
                    <span>Collapse All</span>
                </button>
                <button type="button" class="mobile-action-btn secondary" onclick="window.gasFurnaceForm?.expandAllSections()">
                    <span class="btn-icon">📖</span>
                    <span>Expand All</span>
                </button>
                <button type="button" class="mobile-action-btn primary" onclick="window.gasFurnaceForm?.validateForm()">
                    <span class="btn-icon">✅</span>
                    <span>Validate</span>
                </button>
            </div>
        `;
    }

    /**
     * Apply mobile-specific optimizations after rendering
     */
    applyMobileOptimizations() {
        // Apply touch target sizes
        const touchElements = this.container.querySelectorAll('.touch-optimized, .touch-btn, .touch-checkbox-input');
        touchElements.forEach(element => {
            element.style.minHeight = `${this.touchTargetSize.recommended}px`;
            element.style.fontSize = `${this.fontSizes.normal}px`;
        });

        // Apply mobile spacing
        if (this.isMobile) {
            const sections = this.container.querySelectorAll('.form-section');
            sections.forEach(section => {
                section.style.marginBottom = `${this.spacing.lg}px`;
                section.style.padding = `${this.spacing.md}px`;
            });
        }

        // Setup signature canvases for touch
        this.setupSignatureCanvases();
        
        // Setup collapsible sections for mobile
        this.setupCollapsibleSections();
    }

    /**
     * Setup signature canvas functionality
     */
    setupSignatureCanvases() {
        const canvases = this.container.querySelectorAll('.signature-canvas');
        canvases.forEach(canvas => {
            this.initSignatureCanvas(canvas);
        });
    }

    /**
     * Initialize signature canvas with touch support
     */
    initSignatureCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // Set up canvas styling
        ctx.strokeStyle = '#2c5282';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Mouse events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch events
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        function startDrawing(e) {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
            
            // Hide placeholder
            const placeholder = canvas.parentElement.querySelector('.signature-placeholder');
            if (placeholder) placeholder.style.display = 'none';
        }

        function draw(e) {
            if (!isDrawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();

            lastX = currentX;
            lastY = currentY;
        }

        function stopDrawing() {
            isDrawing = false;
        }

        function handleTouchStart(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            isDrawing = true;
            lastX = touch.clientX - rect.left;
            lastY = touch.clientY - rect.top;
            
            // Hide placeholder
            const placeholder = canvas.parentElement.querySelector('.signature-placeholder');
            if (placeholder) placeholder.style.display = 'none';
        }

        function handleTouchMove(e) {
            e.preventDefault();
            if (!isDrawing) return;
            
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const currentX = touch.clientX - rect.left;
            const currentY = touch.clientY - rect.top;

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();

            lastX = currentX;
            lastY = currentY;
        }
    }

    /**
     * Setup collapsible sections
     */
    setupCollapsibleSections() {
        // Collapse all sections by default on mobile except first few
        if (this.isMobile) {
            const sections = this.container.querySelectorAll('.collapsible-section');
            sections.forEach((section, index) => {
                if (index > 2) { // Keep first 3 sections open
                    section.classList.add('collapsed');
                }
            });
        }
    }

    /**
     * Setup form interactions
     */
    setupFormInteractions() {
        // Set global reference for form methods
        window.gasFurnaceForm = this;

        // Setup auto-save
        this.setupAutoSave();

        // Setup validation on blur
        this.setupValidation();

        // Setup form sync methods
        this.setupFormSync();
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        const formElements = this.container.querySelectorAll('input, select, textarea, canvas');
        
        formElements.forEach(element => {
            if (element.tagName === 'CANVAS') return; // Skip canvases for now
            
            element.addEventListener('input', () => {
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.autoSave();
                }, 1000); // Auto-save 1 second after last change
            });
            
            element.addEventListener('change', () => {
                this.autoSave();
            });
        });
    }

    /**
     * Auto-save form data to localStorage
     */
    autoSave() {
        try {
            const formData = this.getFormData();
            localStorage.setItem('hvac-jack-maintenance-form-autosave', JSON.stringify({
                data: formData,
                timestamp: new Date().toISOString()
            }));
            
            // Show brief save indicator
            this.showAutoSaveIndicator();
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    /**
     * Show auto-save indicator
     */
    showAutoSaveIndicator() {
        // Create or update auto-save indicator
        let indicator = document.getElementById('auto-save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'auto-save-indicator';
            indicator.className = 'auto-save-indicator';
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = '💾 Auto-saved';
        indicator.classList.add('show');
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    /**
     * Initialize auto-save timer
     */
    initAutoSave() {
        // Load auto-saved data if available
        this.loadAutoSavedData();
        
        // Save every 30 seconds as backup
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 30000);
    }

    /**
     * Load auto-saved data
     */
    loadAutoSavedData() {
        try {
            const saved = localStorage.getItem('hvac-jack-maintenance-form-autosave');
            if (saved) {
                const { data, timestamp } = JSON.parse(saved);
                const saveTime = new Date(timestamp);
                const now = new Date();
                const hoursSinceSave = (now - saveTime) / (1000 * 60 * 60);
                
                // Only restore if saved within last 24 hours
                if (hoursSinceSave < 24) {
                    // Show restore option
                    this.showRestoreOption(data, saveTime);
                }
            }
        } catch (error) {
            console.error('Failed to load auto-saved data:', error);
        }
    }

    /**
     * Show restore auto-saved data option
     */
    showRestoreOption(data, saveTime) {
        const restoreDiv = document.createElement('div');
        restoreDiv.className = 'restore-autosave-notice';
        restoreDiv.innerHTML = `
            <div class="restore-content">
                <span class="restore-icon">💾</span>
                <div class="restore-text">
                    <strong>Auto-saved data found</strong>
                    <p>Last saved: ${saveTime.toLocaleString()}</p>
                </div>
                <div class="restore-actions">
                    <button type="button" class="btn-restore" onclick="window.gasFurnaceForm?.restoreAutoSavedData()">
                        Restore
                    </button>
                    <button type="button" class="btn-dismiss" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Dismiss
                    </button>
                </div>
            </div>
        `;
        
        // Store data for restoration
        this.pendingRestoreData = data;
        
        // Insert at top of form
        this.container.insertBefore(restoreDiv, this.container.firstChild);
    }

    /**
     * Restore auto-saved data
     */
    restoreAutoSavedData() {
        if (this.pendingRestoreData) {
            this.populateData(this.pendingRestoreData);
            
            // Remove restore notice
            const notice = this.container.querySelector('.restore-autosave-notice');
            if (notice) notice.remove();
            
            // Clear pending data
            delete this.pendingRestoreData;
            
            // Show success message
            this.showNotification('Auto-saved data restored successfully', 'success');
        }
    }

    /**
     * Setup form validation
     */
    setupValidation() {
        // Real-time validation for critical fields
        const criticalFields = this.container.querySelectorAll('.required');
        criticalFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
        });

        // Safety checkbox validation
        const safetyCheckboxes = this.container.querySelectorAll('.safety-checkbox');
        safetyCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.validateSafetyChecks();
            });
        });
    }

    /**
     * Validate individual field
     */
    validateField(field) {
        const isValid = field.value.trim() !== '';
        field.classList.toggle('invalid', !isValid);
        field.classList.toggle('valid', isValid);
        
        return isValid;
    }

    /**
     * Validate all safety checks
     */
    validateSafetyChecks() {
        const safetyCheckboxes = this.container.querySelectorAll('.safety-checkbox');
        const unchecked = Array.from(safetyCheckboxes).filter(cb => !cb.checked);
        
        if (unchecked.length > 0) {
            this.showSafetyWarning(unchecked);
            return false;
        } else {
            this.hideSafetyWarning();
            return true;
        }
    }

    /**
     * Show safety warning
     */
    showSafetyWarning(uncheckedItems) {
        let warning = this.container.querySelector('.safety-validation-warning');
        if (!warning) {
            warning = document.createElement('div');
            warning.className = 'safety-validation-warning warning-message';
            
            const safetySection = this.container.querySelector('[data-section="safety-inspection"]');
            safetySection.appendChild(warning);
        }
        
        warning.innerHTML = `
            <span class="warning-icon">⚠️</span>
            <strong>Incomplete Safety Checks:</strong>
            <p>${uncheckedItems.length} critical safety item(s) not completed. All safety checks must be performed before service completion.</p>
        `;
        warning.style.display = 'block';
    }

    /**
     * Hide safety warning
     */
    hideSafetyWarning() {
        const warning = this.container.querySelector('.safety-validation-warning');
        if (warning) {
            warning.style.display = 'none';
        }
    }

    /**
     * Setup form synchronization methods
     */
    setupFormSync() {
        // Customer email sync
        const primaryEmail = this.container.querySelector('#customer-email-primary');
        if (primaryEmail) {
            primaryEmail.addEventListener('change', () => {
                this.syncCustomerEmail();
            });
        }
    }

    /**
     * Sync customer email between fields
     */
    syncCustomerEmail() {
        const primaryEmail = this.container.querySelector('#customer-email-primary')?.value;
        const emailField = this.container.querySelector('#customer-email');
        
        if (primaryEmail && emailField && !emailField.value) {
            emailField.value = primaryEmail;
        }
    }

    /**
     * Initialize validation rules
     */
    initValidationRules() {
        return {
            required: ['customer-name', 'service-address'],
            email: ['customer-email-primary', 'customer-email', 'company-email'],
            numeric: ['temperature-rise', 'blower-amp-draw', 'service-time'],
            safety: ['safety-heat-exchanger', 'safety-flue', 'safety-co-test', 'safety-gas-valve', 'safety-limit-switch', 'safety-flame-sensor']
        };
    }

    /**
     * Validate entire form
     */
    validateForm() {
        let isValid = true;
        const errors = [];

        // Validate required fields
        this.validationRules.required.forEach(fieldId => {
            const field = this.container.querySelector(`#${fieldId}`);
            if (field && !this.validateField(field)) {
                errors.push(`${field.labels[0]?.textContent || fieldId} is required`);
                isValid = false;
            }
        });

        // Validate email fields
        this.validationRules.email.forEach(fieldId => {
            const field = this.container.querySelector(`#${fieldId}`);
            if (field && field.value && !this.isValidEmail(field.value)) {
                errors.push(`${field.labels[0]?.textContent || fieldId} must be a valid email address`);
                isValid = false;
            }
        });

        // Validate safety checks
        if (!this.validateSafetyChecks()) {
            errors.push('All safety inspection items must be completed');
            isValid = false;
        }

        // Show validation results
        if (isValid) {
            this.showNotification('Form validation passed! ✅', 'success');
        } else {
            this.showValidationErrors(errors);
        }

        return isValid;
    }

    /**
     * Check if email is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Show validation errors
     */
    showValidationErrors(errors) {
        const errorList = errors.map(error => `<li>${error}</li>`).join('');
        this.showNotification(
            `<strong>Form Validation Errors:</strong><ul>${errorList}</ul>`, 
            'error'
        );
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `form-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <div class="notification-message">${message}</div>
                <button type="button" class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    ✕
                </button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after delay
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, type === 'error' ? 8000 : 4000);

        // Scroll into view if mobile
        if (this.isMobile) {
            notification.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Collapse all sections (mobile utility)
     */
    collapseAllSections() {
        const sections = this.container.querySelectorAll('.collapsible-section');
        sections.forEach(section => {
            section.classList.add('collapsed');
        });
    }

    /**
     * Expand all sections (mobile utility)
     */
    expandAllSections() {
        const sections = this.container.querySelectorAll('.collapsible-section');
        sections.forEach(section => {
            section.classList.remove('collapsed');
        });
    }

    /**
     * Populate form with equipment data
     */
    populateData(data) {
        if (!data) return;

        // Basic equipment information
        this.setFieldValue('equipment-manufacturer', data.manufacturer);
        this.setFieldValue('equipment-model', data.model);
        this.setFieldValue('equipment-serial', data.serial);
        this.setFieldValue('equipment-btu', data.inputBTU);
        this.setFieldValue('equipment-afue', data.afueRating);
        this.setFieldValue('equipment-gas-type', data.gasType);
        this.setFieldValue('equipment-install-date', data.installDate);

        // Customer information
        this.setFieldValue('customer-name', data.customerName);
        this.setFieldValue('customer-phone', data.customerPhone);
        this.setFieldValue('customer-email-primary', data.customerEmail);
        this.setFieldValue('service-address', data.serviceAddress);

        // Service information
        this.setFieldValue('service-date', data.serviceDate);
        this.setFieldValue('technician-name', data.technician);

        // Update confidence indicator
        if (data.dataConfidence !== undefined) {
            const confidenceElement = this.container.querySelector('#data-confidence');
            if (confidenceElement) {
                confidenceElement.textContent = `${data.dataConfidence}%`;
                confidenceElement.className = `confidence-score ${data.dataConfidence >= 70 ? 'high' : data.dataConfidence >= 40 ? 'medium' : 'low'}`;
            }
        }

        // Update temperature rise target if available
        if (data.temperatureRiseTarget) {
            const tempRiseField = this.container.querySelector('#temperature-rise');
            if (tempRiseField) {
                tempRiseField.placeholder = `Target range: ${data.temperatureRiseTarget}`;
            }
        }

        // Sync customer email
        setTimeout(() => {
            this.syncCustomerEmail();
        }, 100);
    }

    /**
     * Set field value helper
     */
    setFieldValue(fieldId, value) {
        if (!value) return;
        
        const field = this.container.querySelector(`#${fieldId}`);
        if (field) {
            field.value = value;
            field.classList.add('auto-populated');
            
            // Trigger change event for any listeners
            field.dispatchEvent(new Event('change'));
        }
    }

    /**
     * Get all form data
     */
    getFormData() {
        const data = {};
        
        // Get all input values
        const inputs = this.container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.id) {
                if (input.type === 'checkbox') {
                    data[input.id] = input.checked;
                } else {
                    data[input.id] = input.value;
                }
            }
        });

        // Get signature data
        const signatureCanvases = this.container.querySelectorAll('.signature-canvas');
        signatureCanvases.forEach((canvas, index) => {
            const signatureType = index === 0 ? 'customer' : 'technician';
            data[`${signatureType}_signature`] = canvas.toDataURL();
        });

        return data;
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA labels and roles
        const sections = this.container.querySelectorAll('.collapsible-section');
        sections.forEach((section, index) => {
            const header = section.querySelector('.section-header');
            const content = section.querySelector('.section-content');
            
            if (header && content) {
                const headerId = `section-header-${index}`;
                const contentId = `section-content-${index}`;
                
                header.id = headerId;
                header.setAttribute('role', 'button');
                header.setAttribute('aria-expanded', !section.classList.contains('collapsed'));
                header.setAttribute('aria-controls', contentId);
                header.setAttribute('tabindex', '0');
                
                content.id = contentId;
                content.setAttribute('aria-labelledby', headerId);
            }
        });

        // Add keyboard navigation for collapsible sections
        this.container.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('section-header') && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                e.target.click();
            }
        });

        // Update ARIA attributes when sections are toggled
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const section = mutation.target;
                    const header = section.querySelector('.section-header');
                    if (header) {
                        header.setAttribute('aria-expanded', !section.classList.contains('collapsed'));
                    }
                }
            });
        });

        sections.forEach(section => {
            observer.observe(section, { attributes: true });
        });
    }

    /**
     * Cleanup when component is destroyed
     */
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        // Remove global reference
        if (window.gasFurnaceForm === this) {
            delete window.gasFurnaceForm;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GasFurnaceForm;
} else {
    window.GasFurnaceForm = GasFurnaceForm;
}