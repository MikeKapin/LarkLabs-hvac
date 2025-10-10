// components/MaintenanceForm/MaintenanceFormContainer.js
// Main container for HVAC Jack 4.0 Maintenance Form system
// Handles form visibility, data mapping, and mobile responsiveness

class MaintenanceFormContainer {
    constructor(hvacJackInstance) {
        this.hvacJack = hvacJackInstance;
        this.isVisible = false;
        this.equipmentMapper = new EquipmentDataMapper();
        this.mobileService = new MobileDetectionService();
        this.currentFormType = 'gas-furnace';
        this.formData = {};
        
        this.init();
    }

    /**
     * Initialize the maintenance form system
     */
    async init() {
        try {
            // Load required services
            await this.loadDependencies();
            
            // Create UI elements
            this.createFormContainer();
            this.createToggleButton();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Apply mobile optimizations
            this.applyMobileOptimizations();
            
            console.log('✅ Maintenance Form Container initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Maintenance Form Container:', error);
        }
    }

    /**
     * Load required dependencies
     */
    async loadDependencies() {
        // Check if dependencies are loaded
        if (typeof EquipmentDataMapper === 'undefined') {
            await this.loadScript('./services/equipmentDataMapper.js');
        }
        
        if (typeof MobileDetectionService === 'undefined') {
            await this.loadScript('./services/mobileDetection.js');
        }

        if (typeof GasFurnaceForm === 'undefined') {
            await this.loadScript('./components/MaintenanceForm/GasFurnaceForm.js');
        }

        if (typeof MaintenanceFormPDF === 'undefined') {
            await this.loadScript('./components/MaintenanceForm/MaintenanceFormPDF.js');
        }
    }

    /**
     * Dynamically load a script
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Create the main form container
     */
    createFormContainer() {
        // Create container element
        this.container = document.createElement('div');
        this.container.id = 'maintenance-form-container';
        this.container.className = 'maintenance-form-container';
        this.container.style.display = 'none';
        
        // Create mobile-optimized layout
        this.container.innerHTML = `
            <div class="maintenance-form-overlay">
                <div class="maintenance-form-modal">
                    <div class="maintenance-form-header">
                        <h2 class="maintenance-form-title">
                            <span class="form-icon">📋</span>
                            Gas Furnace Maintenance Form
                        </h2>
                        <button class="maintenance-form-close" id="maintenance-form-close" aria-label="Close Form">
                            <span>✕</span>
                        </button>
                    </div>
                    
                    <div class="maintenance-form-content" id="maintenance-form-content">
                        <div class="form-loading">
                            <div class="spinner"></div>
                            <p>Loading maintenance form...</p>
                        </div>
                    </div>
                    
                    <div class="maintenance-form-actions">
                        <button class="btn-secondary" id="maintenance-form-cancel">
                            Cancel
                        </button>
                        <button class="btn-primary" id="maintenance-form-save">
                            💾 Save Draft
                        </button>
                        <button class="btn-primary" id="maintenance-form-pdf">
                            📄 Generate PDF
                        </button>
                        <button class="btn-primary" id="maintenance-form-email">
                            📧 Email Report
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(this.container);
    }

    /**
     * Create the toggle button that shows/hides the form
     */
    createToggleButton() {
        this.toggleButton = document.createElement('button');
        this.toggleButton.id = 'generate-maintenance-form-btn';
        this.toggleButton.className = 'maintenance-form-toggle-btn';
        this.toggleButton.innerHTML = `
            <span class="btn-icon">📋</span>
            <span class="btn-text">Generate Maintenance Form</span>
            <span class="btn-badge" id="form-availability-badge" style="display: none;">
                Equipment Detected
            </span>
        `;
        
        // Initially hidden - only show when photo analysis is complete
        this.toggleButton.style.display = 'none';
        
        // Insert after the photo analyze button
        const photoSection = document.querySelector('.photo-section');
        if (photoSection) {
            photoSection.appendChild(this.toggleButton);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle button click
        this.toggleButton.addEventListener('click', () => {
            this.showMaintenanceForm();
        });

        // Close button click
        document.getElementById('maintenance-form-close').addEventListener('click', () => {
            this.hideMaintenanceForm();
        });

        // Cancel button click
        document.getElementById('maintenance-form-cancel').addEventListener('click', () => {
            this.hideMaintenanceForm();
        });

        // Save draft
        document.getElementById('maintenance-form-save').addEventListener('click', () => {
            this.saveDraft();
        });

        // Generate PDF
        document.getElementById('maintenance-form-pdf').addEventListener('click', () => {
            this.generatePDF();
        });

        // Email report
        document.getElementById('maintenance-form-email').addEventListener('click', () => {
            this.emailReport();
        });

        // Overlay click to close
        this.container.querySelector('.maintenance-form-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideMaintenanceForm();
            }
        });

        // Listen for photo analysis completion
        window.addEventListener('hvacjack-photo-analysis-complete', (event) => {
            this.onPhotoAnalysisComplete(event.detail);
        });

        // Listen for orientation changes
        window.addEventListener('hvacjack-orientation-change', () => {
            this.handleOrientationChange();
        });

        // Listen for keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isVisible && e.key === 'Escape') {
                this.hideMaintenanceForm();
            }
        });
    }

    /**
     * Apply mobile-specific optimizations
     */
    applyMobileOptimizations() {
        if (this.mobileService.deviceInfo.isMobile) {
            this.container.classList.add('mobile-optimized');
            
            // Apply touch-friendly styling
            this.mobileService.applyMobileOptimizations(this.container, {
                touchTargets: true,
                fontSize: true,
                spacing: true,
                scrollBehavior: true
            });

            // Add viewport meta tag if not present
            if (!document.querySelector('meta[name="viewport"]')) {
                const viewport = document.createElement('meta');
                viewport.name = 'viewport';
                viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
                document.head.appendChild(viewport);
            }
        }
    }

    /**
     * Show maintenance form when photo analysis indicates gas equipment
     */
    onPhotoAnalysisComplete(analysisData) {
        // Check if this is HVAC equipment that supports maintenance forms
        const isHVACEquipment = this.isHVACEquipmentDetected(analysisData);
        
        if (isHVACEquipment) {
            this.showToggleButton();
            
            // Store analysis data for form population
            this.analysisData = analysisData;
            
            // Show badge indicating equipment detected
            const badge = document.getElementById('form-availability-badge');
            if (badge) {
                badge.style.display = 'inline-block';
                badge.textContent = this.getEquipmentType(analysisData) + ' Detected';
            }
        } else {
            // Show button anyway but with generic message - let user manually specify equipment
            this.showToggleButton();
            this.analysisData = analysisData;
            
            const badge = document.getElementById('form-availability-badge');
            if (badge) {
                badge.style.display = 'inline-block';
                badge.textContent = 'Create Maintenance Form';
                badge.style.background = '#3498db'; // Blue color for generic
            }
        }
    }

    /**
     * Check if detected equipment supports maintenance forms
     */
    isHVACEquipmentDetected(analysisData) {
        if (!analysisData) return false;
        
        const analysisText = typeof analysisData === 'string' ? analysisData : JSON.stringify(analysisData);
        const lowerText = analysisText.toLowerCase();
        
        // Check for all HVAC equipment types that support maintenance forms
        const hvacEquipmentKeywords = [
            // Heating equipment
            'furnace', 'boiler', 'water heater', 'unit heater', 'radiant heater',
            'pool heater', 'fireplace', 'gas', 'natural gas', 'propane', 'lp',
            // Cooling equipment
            'air conditioner', 'air conditioning', 'ac unit', 'central air',
            'heat pump', 'mini split', 'ductless', 'split system',
            // General HVAC terms
            'hvac', 'rooftop', 'rtu', 'condenser', 'evaporator', 'compressor',
            'refrigerant', 'cooling coil', 'heating coil', 'air handler',
            'blower', 'fan coil', 'package unit', 'thermostat'
        ];
        
        return hvacEquipmentKeywords.some(keyword => lowerText.includes(keyword));
    }

    /**
     * Determine equipment type from analysis
     */
    getEquipmentType(analysisData) {
        const analysisText = typeof analysisData === 'string' ? analysisData : JSON.stringify(analysisData);
        const lowerText = analysisText.toLowerCase();
        
        // Check for specific equipment types in order of priority
        if (lowerText.includes('air conditioner') || lowerText.includes('air conditioning') || lowerText.includes('ac unit') || lowerText.includes('central air')) return 'Air Conditioner';
        if (lowerText.includes('heat pump')) return 'Heat Pump';
        if (lowerText.includes('furnace')) return 'Furnace';
        if (lowerText.includes('boiler')) return 'Boiler';
        if (lowerText.includes('water heater')) return 'Water Heater';
        if (lowerText.includes('unit heater')) return 'Unit Heater';
        if (lowerText.includes('pool heater')) return 'Pool Heater';
        if (lowerText.includes('radiant heater')) return 'Radiant Heater';
        if (lowerText.includes('fireplace')) return 'Fireplace';
        if (lowerText.includes('rooftop') || lowerText.includes('rtu')) return 'Rooftop Unit';
        if (lowerText.includes('mini split') || lowerText.includes('ductless')) return 'Mini Split';
        if (lowerText.includes('split system')) return 'Split System';
        if (lowerText.includes('package unit')) return 'Package Unit';
        if (lowerText.includes('air handler')) return 'Air Handler';
        
        // Fallback to generic HVAC equipment if specific type not detected
        return 'HVAC Equipment';
    }

    /**
     * Show the toggle button
     */
    showToggleButton() {
        this.toggleButton.style.display = 'block';
        
        // Add animation
        setTimeout(() => {
            this.toggleButton.classList.add('fade-in');
        }, 100);
    }

    /**
     * Hide the toggle button
     */
    hideToggleButton() {
        this.toggleButton.style.display = 'none';
        this.toggleButton.classList.remove('fade-in');
    }

    /**
     * Show the maintenance form
     */
    async showMaintenanceForm() {
        try {
            this.isVisible = true;
            this.container.style.display = 'flex';
            
            // Add opening animation
            setTimeout(() => {
                this.container.classList.add('visible');
            }, 10);

            // Map photo data to form fields
            const mappedData = this.equipmentMapper.mapPhotoDataToForm(this.analysisData);
            this.formData = mappedData;

            // Load appropriate form based on equipment type
            await this.loadForm(mappedData.equipmentType);

            // Populate form with mapped data
            this.populateForm(mappedData);

            // Validate data and show warnings
            const validation = this.equipmentMapper.validateMappedData(mappedData);
            this.showValidationResults(validation);

            // Focus management for accessibility
            this.manageFocus();

            // Track usage
            this.trackFormUsage('form_opened', {
                equipmentType: mappedData.equipmentType,
                dataConfidence: mappedData.dataConfidence
            });

        } catch (error) {
            console.error('Error showing maintenance form:', error);
            this.showError('Failed to load maintenance form. Please try again.');
        }
    }

    /**
     * Hide the maintenance form
     */
    hideMaintenanceForm() {
        this.isVisible = false;
        this.container.classList.remove('visible');
        
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 300);

        // Track usage
        this.trackFormUsage('form_closed');
    }

    /**
     * Load the appropriate form based on equipment type
     */
    async loadForm(equipmentType) {
        const formContent = document.getElementById('maintenance-form-content');
        
        // Show loading state
        formContent.innerHTML = `
            <div class="form-loading">
                <div class="spinner"></div>
                <p>Loading ${equipmentType} maintenance form...</p>
            </div>
        `;

        // Load the appropriate form
        let formInstance;
        
        switch (equipmentType) {
            case 'Gas Furnace':
            default:
                if (typeof GasFurnaceForm === 'undefined') {
                    await this.loadScript('./components/MaintenanceForm/GasFurnaceForm.js');
                }
                formInstance = new GasFurnaceForm(formContent, this.mobileService);
                break;
            
            // Future equipment types can be added here
            case 'Gas Boiler':
                // TODO: Implement GasBoilerForm
                formInstance = new GasFurnaceForm(formContent, this.mobileService);
                break;
        }

        this.currentForm = formInstance;
        await formInstance.render();
    }

    /**
     * Populate form with mapped data
     */
    populateForm(mappedData) {
        if (this.currentForm && this.currentForm.populateData) {
            this.currentForm.populateData(mappedData);
        }
    }

    /**
     * Show validation results
     */
    showValidationResults(validation) {
        if (validation.warnings.length > 0) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'validation-warnings';
            warningDiv.innerHTML = `
                <h4>⚠️ Data Extraction Warnings</h4>
                <ul>
                    ${validation.warnings.map(warning => `<li>${warning}</li>`).join('')}
                </ul>
                <p class="confidence-score">
                    Data Confidence: ${validation.confidence}%
                    ${validation.confidence < 70 ? '<span class="low-confidence">(Manual verification recommended)</span>' : ''}
                </p>
            `;

            const formContent = document.getElementById('maintenance-form-content');
            formContent.insertBefore(warningDiv, formContent.firstChild);
        }
    }

    /**
     * Manage focus for accessibility
     */
    manageFocus() {
        // Focus on first form input
        const firstInput = this.container.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
            }, 300);
        }

        // Trap focus within modal
        const focusableElements = this.container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    /**
     * Handle orientation changes
     */
    handleOrientationChange() {
        if (this.isVisible && this.mobileService.deviceInfo.isMobile) {
            // Adjust form layout for new orientation
            setTimeout(() => {
                this.applyMobileOptimizations();
            }, 100);
        }
    }

    /**
     * Save form data as draft
     */
    saveDraft() {
        try {
            const formData = this.currentForm ? this.currentForm.getFormData() : {};
            const draftData = {
                ...this.formData,
                ...formData,
                savedAt: new Date().toISOString(),
                draftId: this.generateDraftId()
            };

            localStorage.setItem('hvac-jack-maintenance-draft', JSON.stringify(draftData));
            this.showSuccess('Draft saved successfully');
            
            this.trackFormUsage('draft_saved');
        } catch (error) {
            console.error('Error saving draft:', error);
            this.showError('Failed to save draft');
        }
    }

    /**
     * Generate PDF report
     */
    async generatePDF() {
        try {
            if (!this.currentForm) {
                throw new Error('No form data available');
            }

            const formData = this.currentForm.getFormData();
            const completeData = { ...this.formData, ...formData };

            // Load PDF generator if not already loaded
            if (typeof MaintenanceFormPDF === 'undefined') {
                await this.loadScript('./components/MaintenanceForm/MaintenanceFormPDF.js');
            }

            const pdfGenerator = new MaintenanceFormPDF();
            await pdfGenerator.generate(completeData, this.mobileService);

            this.trackFormUsage('pdf_generated');
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showError('Failed to generate PDF report');
        }
    }

    /**
     * Email report
     */
    async emailReport() {
        try {
            const formData = this.currentForm ? this.currentForm.getFormData() : {};
            const completeData = { ...this.formData, ...formData };

            // Load email service if not already loaded
            if (typeof EmailService === 'undefined') {
                await this.loadScript('./components/MaintenanceForm/EmailService.js');
            }

            const emailService = new EmailService();
            await emailService.sendMaintenanceReport(completeData);

            this.trackFormUsage('email_sent');
            this.showSuccess('Maintenance report sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            this.showError('Failed to send email report');
        }
    }

    /**
     * Generate unique draft ID
     */
    generateDraftId() {
        return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `maintenance-form-notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="notification-message">${message}</span>
        `;

        this.container.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Track form usage for analytics
     */
    trackFormUsage(action, data = {}) {
        if (this.hvacJack && this.hvacJack.trackUsage) {
            this.hvacJack.trackUsage(`maintenance_form_${action}`, {
                timestamp: new Date().toISOString(),
                deviceType: this.mobileService.deviceInfo.type,
                formType: this.currentFormType,
                ...data
            });
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaintenanceFormContainer;
} else {
    window.MaintenanceFormContainer = MaintenanceFormContainer;
}