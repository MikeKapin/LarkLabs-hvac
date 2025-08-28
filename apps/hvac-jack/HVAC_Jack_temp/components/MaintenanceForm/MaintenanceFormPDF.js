// components/MaintenanceForm/MaintenanceFormPDF.js
// PDF Generation Service for HVAC Jack 4.0 Maintenance Forms
// Mobile-optimized PDF generation with professional formatting

class MaintenanceFormPDF {
    constructor() {
        this.jsPDFLoaded = false;
        this.pageWidth = 8.5 * 72; // 8.5 inches in points
        this.pageHeight = 11 * 72; // 11 inches in points
        this.margin = 0.5 * 72; // 0.5 inch margins
        this.lineHeight = 14;
        this.currentY = 0;
        this.doc = null;
        
        this.colors = {
            primary: [44, 82, 130], // HVAC Jack blue
            secondary: [113, 128, 150],
            accent: [232, 90, 79],
            success: [34, 197, 94],
            warning: [245, 158, 11],
            error: [239, 68, 68],
            text: [51, 51, 51],
            lightGray: [248, 249, 250],
            border: [226, 232, 240]
        };
        
        this.fonts = {
            title: { size: 20, weight: 'bold' },
            heading: { size: 16, weight: 'bold' },
            subheading: { size: 14, weight: 'bold' },
            body: { size: 12, weight: 'normal' },
            small: { size: 10, weight: 'normal' }
        };
    }

    /**
     * Load jsPDF library if not already loaded
     */
    async loadJsPDF() {
        if (this.jsPDFLoaded || window.jspdf || window.jsPDF) {
            this.jsPDFLoaded = true;
            return true;
        }

        try {
            // Load jsPDF from CDN
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });

            this.jsPDFLoaded = true;
            return true;
        } catch (error) {
            console.error('Failed to load jsPDF:', error);
            return false;
        }
    }

    /**
     * Generate PDF report from form data
     * @param {Object} formData - Complete form data
     * @param {Object} mobileService - Mobile detection service for optimization
     */
    async generate(formData, mobileService = null) {
        try {
            // Show loading indicator
            this.showLoadingIndicator();

            // Load jsPDF if not loaded
            const jsPDFLoaded = await this.loadJsPDF();
            if (!jsPDFLoaded) {
                throw new Error('Failed to load PDF generation library');
            }

            // Initialize PDF document
            const { jsPDF } = window.jspdf || window;
            this.doc = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'letter'
            });

            this.currentY = this.margin;

            // Generate PDF content
            await this.generateHeader(formData);
            await this.generateCustomerInfo(formData);
            await this.generateEquipmentInfo(formData);
            await this.generateInspectionResults(formData);
            await this.generateCombustionAnalysis(formData);
            await this.generateSafetyChecks(formData);
            await this.generateMaintenanceActions(formData);
            await this.generateComments(formData);
            await this.generateServiceSummary(formData);
            await this.generateSignatures(formData);
            await this.generateFooter(formData);

            // Handle mobile-specific optimizations
            if (mobileService?.deviceInfo?.isMobile) {
                await this.optimizeForMobile();
            }

            // Generate filename
            const filename = this.generateFilename(formData);

            // Save PDF
            this.doc.save(filename);

            // Hide loading indicator
            this.hideLoadingIndicator();

            // Show success notification
            this.showNotification('PDF generated successfully! 📄', 'success');

            // Track analytics
            this.trackPDFGeneration(formData, mobileService);

        } catch (error) {
            console.error('PDF generation error:', error);
            this.hideLoadingIndicator();
            this.showNotification('Failed to generate PDF: ' + error.message, 'error');
            throw error;
        }
    }

    /**
     * Generate PDF header section
     */
    async generateHeader(formData) {
        // Company Logo and Title
        this.setFont(this.fonts.title);
        this.doc.setTextColor(...this.colors.primary);
        
        // HVAC Jack Logo (text-based)
        const logoX = this.margin;
        const logoY = this.currentY + 20;
        
        this.doc.rect(logoX, logoY, 50, 50, 'F');
        this.doc.setTextColor(255, 255, 255);
        this.doc.text('HJ', logoX + 15, logoY + 30);
        
        // Company Name and Title
        this.doc.setTextColor(...this.colors.primary);
        this.setFont(this.fonts.title);
        this.doc.text('HVAC Jack', logoX + 65, logoY + 15);
        
        this.setFont(this.fonts.body);
        this.doc.setTextColor(...this.colors.text);
        this.doc.text('Professional HVAC Service Solutions', logoX + 65, logoY + 35);
        
        // Dynamic Form Title (right side)
        const rightX = this.pageWidth - this.margin;
        this.setFont(this.fonts.heading);
        this.doc.setTextColor(...this.colors.primary);
        
        const dynamicTitle = this.generateDynamicTitle(formData);
        this.doc.text(dynamicTitle, rightX, logoY + 15, { align: 'right' });
        
        // Service Date and Order Number
        this.setFont(this.fonts.body);
        this.doc.setTextColor(...this.colors.text);
        const serviceDate = formData['service-date'] || new Date().toLocaleDateString();
        const serviceOrder = formData['service-order'] || 'N/A';
        
        this.doc.text(`Service Date: ${serviceDate}`, rightX, logoY + 35, { align: 'right' });
        this.doc.text(`Service Order: ${serviceOrder}`, rightX, logoY + 50, { align: 'right' });
        
        // Horizontal line
        this.currentY = logoY + 70;
        this.doc.setDrawColor(...this.colors.primary);
        this.doc.setLineWidth(2);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        
        this.currentY += 20;
    }

    /**
     * Generate dynamic title based on appliance and service type selections
     */
    generateDynamicTitle(formData) {
        const applianceType = formData['appliance-type'] || '';
        const serviceType = formData['service-type'] || '';

        // Map appliance values to display names
        const applianceNames = {
            'furnace': 'Furnace',
            'air-conditioner': 'Air Conditioner',
            'heat-pump': 'Heat Pump',
            'waterheater': 'Water Heater',
            'boiler': 'Boiler',
            'combo-boiler': 'Combo-Boiler',
            'unit-heater': 'Unit Heater',
            'pool-heater': 'Pool Heater',
            'radiant-heater': 'Radiant Heater',
            'fireplace': 'Fireplace',
            'other': 'Equipment'
        };

        // Map service values to display names
        const serviceNames = {
            'maintenance': 'Maintenance Report',
            'service': 'Service Report',
            'maintenance-service': 'Maintenance & Service Report'
        };

        // Build the dynamic title
        if (applianceType && serviceType) {
            const applianceName = applianceNames[applianceType] || 'Equipment';
            const serviceName = serviceNames[serviceType] || 'Service Report';
            return `${applianceName} ${serviceName}`;
        } else if (applianceType) {
            const applianceName = applianceNames[applianceType] || 'Equipment';
            return `${applianceName} Service Report`;
        } else if (serviceType) {
            const serviceName = serviceNames[serviceType] || 'Service Report';
            return `Equipment ${serviceName}`;
        } else {
            return 'Equipment Maintenance / Service Report';
        }
    }

    /**
     * Generate customer information section
     */
    async generateCustomerInfo(formData) {
        this.addSection('Customer Information', this.colors.primary);
        
        const customerData = [
            { label: 'Customer Name', value: formData['customer-name'] || 'N/A' },
            { label: 'Phone Number', value: formData['customer-phone'] || 'N/A' },
            { label: 'Email Address', value: formData['customer-email-primary'] || 'N/A' },
            { label: 'Service Address', value: formData['service-address'] || 'N/A' }
        ];

        this.addDataGrid(customerData, 2);
    }

    /**
     * Generate equipment information section
     */
    async generateEquipmentInfo(formData) {
        this.addSection('Equipment Information', this.colors.primary);
        
        // Auto-populated notice
        if (formData['data-confidence']) {
            this.addNoticeBox('Data extracted from equipment rating plate photo', 
                             `Confidence: ${formData['data-confidence']}%`, 
                             this.colors.primary);
        }
        
        const equipmentData = [
            { label: 'Manufacturer', value: formData['equipment-manufacturer'] || 'N/A' },
            { label: 'Model Number', value: formData['equipment-model'] || 'N/A' },
            { label: 'Serial Number', value: formData['equipment-serial'] || 'N/A' },
            { label: 'Input BTU Rating', value: formData['equipment-btu'] || 'N/A' },
            { label: 'AFUE Rating', value: formData['equipment-afue'] || 'N/A' },
            { label: 'Gas Type', value: formData['equipment-gas-type'] || 'N/A' },
            { label: 'Installation Date', value: formData['equipment-install-date'] || 'N/A' }
        ];

        this.addDataGrid(equipmentData, 2);
    }

    /**
     * Generate pre-service inspection results
     */
    async generateInspectionResults(formData) {
        this.addSection('Pre-Service Inspection Checklist', this.colors.primary);
        
        const inspectionItems = [
            { id: 'check-thermostat', label: 'Thermostat operation check' },
            { id: 'check-filter', label: 'Filter condition assessed' },
            { id: 'check-venting', label: 'Venting system inspection' },
            { id: 'check-gasline', label: 'Gas line leak check (soap test)' },
            { id: 'check-electrical', label: 'Electrical connections secure' },
            { id: 'check-safety-devices', label: 'Safety devices operational' }
        ];

        this.addChecklistGrid(inspectionItems, formData);
    }

    /**
     * Generate combustion analysis section
     */
    async generateCombustionAnalysis(formData) {
        this.addSection('Combustion Analysis & Performance Testing', this.colors.primary);
        
        const analysisData = [
            { parameter: 'Oxygen (O₂) %', target: '8-10%', reading: 'oxygen-reading', result: 'oxygen-result' },
            { parameter: 'Carbon Monoxide (CO) ppm', target: '< 100 ppm', reading: 'carbon-monoxide-reading', result: 'carbon-monoxide-result' },
            { parameter: 'Carbon Dioxide (CO₂) %', target: '8-9%', reading: 'carbon-dioxide-reading', result: 'carbon-dioxide-result' },
            { parameter: 'Stack Temperature (°F)', target: '300-500°F', reading: 'stack-temp-reading', result: 'stack-temp-result' },
            { parameter: 'Draft ("WC)', target: '-0.02 to -0.04', reading: 'draft-reading', result: 'draft-result' },
            { parameter: 'Gas Pressure - Manifold ("WC)', target: '3.5" WC (NG)', reading: 'gas-pressure-reading', result: 'gas-pressure-result' }
        ];

        this.addAnalysisTable(analysisData, formData);
        
        // Additional performance data
        const performanceData = [
            { label: 'Temperature Rise (°F)', value: formData['temperature-rise'] || 'N/A' },
            { label: 'Blower Motor Amp Draw (A)', value: formData['blower-amp-draw'] || 'N/A' }
        ];
        
        this.addDataGrid(performanceData, 2);
        
        // Static pressure readings
        if (formData['static-pressure']) {
            this.addTextBlock('Static Pressure Readings:', formData['static-pressure']);
        }
    }

    /**
     * Generate safety inspection results
     */
    async generateSafetyChecks(formData) {
        this.addSection('Critical Safety Inspection', this.colors.error);
        
        const safetyItems = [
            { id: 'safety-heat-exchanger', label: 'Heat exchanger inspection (no cracks/corrosion)' },
            { id: 'safety-flue', label: 'Flue pipe connections secure' },
            { id: 'safety-co-test', label: 'CO test at registers (ambient air)' },
            { id: 'safety-gas-valve', label: 'Gas valve operation test' },
            { id: 'safety-limit-switch', label: 'Limit switch operation test' },
            { id: 'safety-flame-sensor', label: 'Flame sensor cleaned/tested' }
        ];

        // Safety warning box
        this.addWarningBox('⚠️ SAFETY ALERT: All safety inspection items must be completed before system operation.');
        
        this.addChecklistGrid(safetyItems, formData);
    }

    /**
     * Generate maintenance actions performed
     */
    async generateMaintenanceActions(formData) {
        this.addSection('Maintenance Actions Performed', this.colors.primary);
        
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

        this.addChecklistGrid(maintenanceItems, formData);
    }

    /**
     * Generate comments and recommendations
     */
    async generateComments(formData) {
        this.addSection('Technician Comments & Recommendations', this.colors.primary);
        
        const comments = [
            { title: 'Observations & Issues Found:', content: formData['observations'] },
            { title: 'Recommendations for Customer:', content: formData['recommendations'] },
            { title: 'Parts Needed for Future Service:', content: formData['parts-needed'] }
        ];

        comments.forEach(comment => {
            if (comment.content) {
                this.addTextBlock(comment.title, comment.content);
            }
        });

        if (formData['next-maintenance']) {
            this.addTextBlock('Next Scheduled Maintenance:', 
                new Date(formData['next-maintenance']).toLocaleDateString());
        }
    }

    /**
     * Generate service summary
     */
    async generateServiceSummary(formData) {
        this.addSection('Service Summary', this.colors.success);
        
        const serviceStatus = formData['service-status'] || 'N/A';
        const serviceTime = formData['service-time'] || 'N/A';
        
        this.addStatusBox(serviceStatus);
        
        // Add proper spacing after status box
        this.currentY += 15;
        
        const summaryData = [
            { label: 'Service Time (hours)', value: serviceTime },
            { label: 'Report Generated', value: new Date().toLocaleString() }
        ];
        
        this.addDataGrid(summaryData, 2);
        
        // Add extra spacing after service summary
        this.currentY += 10;
    }

    /**
     * Generate signatures section
     */
    async generateSignatures(formData) {
        this.addSection('Digital Signatures', this.colors.primary);
        
        // Check if we need a new page
        if (this.currentY > this.pageHeight - 200) {
            this.doc.addPage();
            this.currentY = this.margin;
        }
        
        const signaturesY = this.currentY;
        const leftX = this.margin;
        const rightX = this.pageWidth / 2 + 10;
        const signatureWidth = (this.pageWidth - this.margin * 2 - 20) / 2;
        
        // Customer signature section
        this.setFont(this.fonts.subheading);
        this.doc.text('Customer Acknowledgment', leftX, signaturesY);
        
        // Signature box
        this.doc.setDrawColor(...this.colors.border);
        this.doc.rect(leftX, signaturesY + 15, signatureWidth, 60);
        
        // Add signature if available
        if (formData['customer_signature']) {
            try {
                this.doc.addImage(formData['customer_signature'], 'PNG', 
                    leftX + 5, signaturesY + 20, signatureWidth - 10, 50);
            } catch (error) {
                console.warn('Could not add customer signature to PDF:', error);
            }
        }
        
        this.setFont(this.fonts.small);
        this.doc.text('I acknowledge that the maintenance service has been completed as described above.', 
                     leftX, signaturesY + 90);
        this.doc.text(`Date: ${new Date().toLocaleDateString()}`, leftX, signaturesY + 105);
        
        // Technician signature section
        this.setFont(this.fonts.subheading);
        this.doc.text('Technician Certification', rightX, signaturesY);
        
        // Signature box
        this.doc.rect(rightX, signaturesY + 15, signatureWidth, 60);
        
        // Add signature if available
        if (formData['technician_signature']) {
            try {
                this.doc.addImage(formData['technician_signature'], 'PNG', 
                    rightX + 5, signaturesY + 20, signatureWidth - 10, 50);
            } catch (error) {
                console.warn('Could not add technician signature to PDF:', error);
            }
        }
        
        this.setFont(this.fonts.small);
        const techName = formData['technician-name'] || 'N/A';
        const techLicense = formData['technician-license'] || 'N/A';
        
        this.doc.text(`Technician: ${techName}`, rightX, signaturesY + 90);
        this.doc.text(`License #: ${techLicense}`, rightX, signaturesY + 105);
        this.doc.text(`Date: ${new Date().toLocaleDateString()}`, rightX, signaturesY + 120);
        
        this.currentY = signaturesY + 140;
    }

    /**
     * Generate footer
     */
    async generateFooter(formData) {
        const footerY = this.pageHeight - this.margin - 30;
        
        this.doc.setDrawColor(...this.colors.border);
        this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);
        
        this.setFont(this.fonts.small);
        this.doc.setTextColor(...this.colors.text);
        
        const footerText = `Generated by HVAC Jack 4.0 | ${new Date().toLocaleString()} | Report ID: ${this.generateReportId()}`;
        this.doc.text(footerText, this.pageWidth / 2, footerY + 15, { align: 'center' });
    }

    /**
     * Add section header
     */
    addSection(title, color) {
        this.checkPageBreak(40);
        
        // Section background
        this.doc.setFillColor(...color);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, 30, 'F');
        
        // Section title
        this.setFont(this.fonts.heading);
        this.doc.setTextColor(255, 255, 255);
        this.doc.text(title, this.margin + 10, this.currentY + 20);
        
        this.currentY += 40;
    }

    /**
     * Add data grid (key-value pairs)
     */
    addDataGrid(data, columns = 2) {
        this.checkPageBreak(data.length * 25);
        
        const colWidth = (this.pageWidth - this.margin * 2) / columns;
        const labelWidth = colWidth * 0.4; // 40% for label
        const valueWidth = colWidth * 0.6; // 60% for value
        let row = 0;
        let col = 0;
        
        this.setFont(this.fonts.body);
        this.doc.setTextColor(...this.colors.text);
        
        data.forEach(item => {
            const x = this.margin + col * colWidth;
            const y = this.currentY + row * 22; // Increased spacing
            
            // Label
            this.setFont(this.fonts.body, 'bold');
            const labelText = `${item.label}:`;
            this.doc.text(labelText, x, y);
            
            // Value with text wrapping to prevent overflow
            this.setFont(this.fonts.body);
            const valueText = item.value || 'N/A';
            const valueLines = this.doc.splitTextToSize(valueText, valueWidth - 10);
            
            valueLines.forEach((line, lineIndex) => {
                this.doc.text(line, x + labelWidth, y + (lineIndex * this.lineHeight));
            });
            
            col++;
            if (col >= columns) {
                col = 0;
                row++;
            }
        });
        
        this.currentY += Math.ceil(data.length / columns) * 22 + 15;
    }

    /**
     * Add checklist grid
     */
    addChecklistGrid(items, formData) {
        this.checkPageBreak(items.length * 20);
        
        this.setFont(this.fonts.body);
        this.doc.setTextColor(...this.colors.text);
        
        items.forEach((item, index) => {
            const y = this.currentY + index * 18;
            const isChecked = formData[item.id] === true || formData[item.id] === 'true';
            
            // Checkbox with enhanced visibility
            if (isChecked) {
                // Filled checkbox with green background for checked items
                this.doc.setFillColor(34, 197, 94); // Green background
                this.doc.setDrawColor(34, 197, 94); // Green border
                this.doc.rect(this.margin, y - 10, 14, 14, 'FD'); // Filled and outlined
                
                // Bold white checkmark
                this.doc.setTextColor(255, 255, 255); // White color for contrast
                this.setFont(this.fonts.body, 'bold');
                this.doc.text('✓', this.margin + 3, y - 1);
                
                // Make the label text bold for checked items
                this.setFont(this.fonts.body, 'bold');
                this.doc.setTextColor(...this.colors.text);
                this.doc.text(item.label, this.margin + 22, y);
            } else {
                // Empty checkbox for unchecked items
                this.doc.setDrawColor(...this.colors.border);
                this.doc.setLineWidth(1);
                this.doc.rect(this.margin, y - 10, 14, 14);
                
                // Regular label text for unchecked items
                this.setFont(this.fonts.body);
                this.doc.setTextColor(...this.colors.text);
                this.doc.text(item.label, this.margin + 22, y);
            }
        });
        
        this.currentY += items.length * 18 + 10;
    }

    /**
     * Add analysis table
     */
    addAnalysisTable(data, formData) {
        this.checkPageBreak(data.length * 25 + 40);
        
        // Table header
        const tableY = this.currentY;
        const colWidths = [150, 100, 80, 60];
        const headers = ['Parameter', 'Target Range', 'Actual Reading', 'Result'];
        
        this.doc.setFillColor(...this.colors.lightGray);
        this.doc.rect(this.margin, tableY, this.pageWidth - this.margin * 2, 25, 'F');
        
        this.setFont(this.fonts.body, 'bold');
        this.doc.setTextColor(...this.colors.text);
        
        let x = this.margin + 5;
        headers.forEach((header, i) => {
            this.doc.text(header, x, tableY + 15);
            x += colWidths[i];
        });
        
        // Table rows
        this.setFont(this.fonts.body);
        let rowY = tableY + 25;
        
        data.forEach(row => {
            // Alternating row colors
            if (data.indexOf(row) % 2 === 1) {
                this.doc.setFillColor(250, 250, 250);
                this.doc.rect(this.margin, rowY, this.pageWidth - this.margin * 2, 20, 'F');
            }
            
            x = this.margin + 5;
            
            // Parameter
            this.doc.setTextColor(...this.colors.text);
            this.doc.text(row.parameter, x, rowY + 12);
            x += colWidths[0];
            
            // Target
            this.doc.setTextColor(...this.colors.secondary);
            this.doc.text(row.target, x, rowY + 12);
            x += colWidths[1];
            
            // Reading
            this.doc.setTextColor(...this.colors.text);
            const reading = formData[row.reading] || 'N/A';
            this.doc.text(reading, x, rowY + 12);
            x += colWidths[2];
            
            // Result
            const result = formData[row.result];
            if (result === 'pass') {
                this.doc.setTextColor(...this.colors.success);
                this.doc.text('✓ Pass', x, rowY + 12);
            } else if (result === 'fail') {
                this.doc.setTextColor(...this.colors.error);
                this.doc.text('✗ Fail', x, rowY + 12);
            } else {
                this.doc.setTextColor(...this.colors.secondary);
                this.doc.text('-', x, rowY + 12);
            }
            
            rowY += 20;
        });
        
        this.currentY = rowY + 10;
    }

    /**
     * Add text block
     */
    addTextBlock(title, content) {
        if (!content) return;
        
        const estimatedHeight = 40 + (content.length / 80) * this.lineHeight;
        this.checkPageBreak(estimatedHeight);
        
        // Title
        this.setFont(this.fonts.subheading);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 22;
        
        // Content with proper text wrapping
        this.setFont(this.fonts.body);
        this.doc.setTextColor(...this.colors.text);
        
        const maxWidth = this.pageWidth - this.margin * 2 - 20; // Extra margin for safety
        const lines = this.doc.splitTextToSize(content, maxWidth);
        this.checkPageBreak(lines.length * this.lineHeight + 20);
        
        lines.forEach(line => {
            this.doc.text(line, this.margin + 10, this.currentY);
            this.currentY += this.lineHeight;
        });
        
        this.currentY += 15; // Better spacing after text blocks
    }

    /**
     * Add notice box
     */
    addNoticeBox(title, subtitle, color) {
        const maxWidth = this.pageWidth - this.margin * 2 - 20;
        const titleLines = this.doc.splitTextToSize(title, maxWidth);
        const subtitleLines = subtitle ? this.doc.splitTextToSize(subtitle, maxWidth) : [];
        const boxHeight = Math.max(30, titleLines.length * 14 + subtitleLines.length * 12 + 15);
        
        this.checkPageBreak(boxHeight + 10);
        
        // Background
        this.doc.setFillColor(...color, 0.1);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, boxHeight, 'F');
        
        // Border
        this.doc.setDrawColor(...color);
        this.doc.setLineWidth(1);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, boxHeight);
        
        // Content - Title
        this.setFont(this.fonts.body, 'bold');
        this.doc.setTextColor(...color);
        let textY = this.currentY + 12;
        
        titleLines.forEach(line => {
            this.doc.text(line, this.margin + 10, textY);
            textY += 14;
        });
        
        if (subtitle && subtitleLines.length > 0) {
            this.setFont(this.fonts.small);
            subtitleLines.forEach(line => {
                this.doc.text(line, this.margin + 10, textY);
                textY += 12;
            });
        }
        
        this.currentY += boxHeight + 10;
    }

    /**
     * Add warning box
     */
    addWarningBox(text) {
        const maxWidth = this.pageWidth - this.margin * 2 - 20;
        const textLines = this.doc.splitTextToSize(text, maxWidth);
        const boxHeight = Math.max(35, textLines.length * 16 + 10);
        
        this.checkPageBreak(boxHeight + 10);
        
        // Background
        this.doc.setFillColor(254, 242, 242);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, boxHeight, 'F');
        
        // Border
        this.doc.setDrawColor(...this.colors.error);
        this.doc.setLineWidth(2);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, boxHeight);
        
        // Content
        this.setFont(this.fonts.body, 'bold');
        this.doc.setTextColor(...this.colors.error);
        let textY = this.currentY + 18;
        
        textLines.forEach(line => {
            this.doc.text(line, this.margin + 10, textY);
            textY += 16;
        });
        
        this.currentY += boxHeight + 10;
    }

    /**
     * Add status box
     */
    addStatusBox(status) {
        let color = this.colors.secondary;
        let bgColor = [240, 255, 244];
        let icon = '✓';
        
        if (status.includes('Completed Successfully')) {
            color = this.colors.success;
            icon = '✅';
        } else if (status.includes('Safety Issue')) {
            color = this.colors.error;
            bgColor = [254, 242, 242];
            icon = '🚨';
        } else if (status.includes('Follow-up')) {
            color = this.colors.warning;
            bgColor = [255, 251, 235];
            icon = '⏰';
        }
        
        const statusText = `${icon} Service Status: ${status}`;
        const maxWidth = this.pageWidth - this.margin * 2 - 20;
        const statusLines = this.doc.splitTextToSize(statusText, maxWidth);
        const boxHeight = Math.max(35, statusLines.length * 16 + 10);
        
        this.checkPageBreak(boxHeight + 10);
        
        // Background
        this.doc.setFillColor(...bgColor);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, boxHeight, 'F');
        
        // Content
        this.setFont(this.fonts.body, 'bold');
        this.doc.setTextColor(...color);
        let textY = this.currentY + 18;
        
        statusLines.forEach(line => {
            this.doc.text(line, this.margin + 10, textY);
            textY += 16;
        });
        
        this.currentY += boxHeight + 10;
    }

    /**
     * Set font with proper fallbacks
     */
    setFont(fontConfig, weight = null) {
        const actualWeight = weight || fontConfig.weight || 'normal';
        this.doc.setFontSize(fontConfig.size);
        
        // jsPDF font handling
        if (actualWeight === 'bold') {
            this.doc.setFont('helvetica', 'bold');
        } else {
            this.doc.setFont('helvetica', 'normal');
        }
    }

    /**
     * Check if we need a page break
     */
    checkPageBreak(requiredHeight) {
        if (this.currentY + requiredHeight > this.pageHeight - this.margin - 50) {
            this.doc.addPage();
            this.currentY = this.margin;
        }
    }

    /**
     * Optimize PDF for mobile viewing
     */
    async optimizeForMobile() {
        // Add metadata for mobile optimization
        this.doc.setProperties({
            title: 'HVAC Maintenance Report',
            subject: 'Gas Furnace Maintenance Report',
            author: 'HVAC Jack 4.0',
            keywords: 'HVAC, maintenance, gas furnace, inspection',
            creator: 'HVAC Jack 4.0 Mobile'
        });
        
        // Mobile-specific optimizations could include:
        // - Larger fonts for better readability
        // - Simplified layouts
        // - Reduced complexity for faster loading
        // These would be implemented based on specific mobile requirements
    }

    /**
     * Generate unique filename
     */
    generateFilename(formData) {
        const customerName = (formData['customer-name'] || 'Customer')
            .replace(/[^a-zA-Z0-9]/g, '_');
        const date = new Date().toISOString().split('T')[0];
        const timestamp = Date.now().toString().slice(-6);
        
        return `HVAC_Maintenance_${customerName}_${date}_${timestamp}.pdf`;
    }

    /**
     * Generate PDF as blob for email attachment
     * @param {Object} formData - Complete form data
     * @param {Object} mobileService - Mobile detection service
     * @returns {Promise<Blob>} PDF blob
     */
    async generateBlob(formData, mobileService = null) {
        try {
            // Load jsPDF if not loaded
            const jsPDFLoaded = await this.loadJsPDF();
            if (!jsPDFLoaded) {
                throw new Error('Failed to load PDF generation library');
            }

            // Initialize PDF document
            const { jsPDF } = window.jspdf || window;
            this.doc = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'letter'
            });

            this.currentY = this.margin;

            // Generate PDF content (same as generate method but without saving)
            await this.generateHeader(formData);
            await this.generateCustomerInfo(formData);
            await this.generateEquipmentInfo(formData);
            await this.generateInspectionResults(formData);
            await this.generateCombustionAnalysis(formData);
            await this.generateSafetyChecks(formData);
            await this.generateMaintenanceActions(formData);
            await this.generateComments(formData);
            await this.generateServiceSummary(formData);
            await this.generateSignatures(formData);
            await this.generateFooter(formData);

            // Handle mobile-specific optimizations
            if (mobileService?.deviceInfo?.isMobile) {
                await this.optimizeForMobile();
            }

            // Return as blob instead of downloading
            return this.doc.output('blob');

        } catch (error) {
            console.error('PDF blob generation error:', error);
            throw error;
        }
    }

    /**
     * Generate unique report ID
     */
    generateReportId() {
        return `HJ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }

    /**
     * Show loading indicator
     */
    showLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'pdf-loading-indicator';
        indicator.className = 'pdf-loading-overlay';
        indicator.innerHTML = `
            <div class="pdf-loading-content">
                <div class="pdf-spinner"></div>
                <h3>Generating PDF Report...</h3>
                <p>Please wait while we create your maintenance report</p>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .pdf-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
            }
            .pdf-loading-content {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 30px;
                border-radius: 15px;
                max-width: 300px;
            }
            .pdf-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid #fff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(indicator);
    }

    /**
     * Hide loading indicator
     */
    hideLoadingIndicator() {
        const indicator = document.getElementById('pdf-loading-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `pdf-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span class="notification-message">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="notification-close">✕</button>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('pdf-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'pdf-notification-styles';
            style.textContent = `
                .pdf-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 400px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                }
                .pdf-notification.success {
                    border-left: 4px solid #22c55e;
                }
                .pdf-notification.error {
                    border-left: 4px solid #ef4444;
                }
                .pdf-notification .notification-content {
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .pdf-notification .notification-message {
                    flex: 1;
                    font-size: 14px;
                    color: #333;
                }
                .pdf-notification .notification-close {
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    color: #666;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Track PDF generation for analytics
     */
    trackPDFGeneration(formData, mobileService) {
        try {
            // Basic analytics tracking
            const analytics = {
                action: 'pdf_generated',
                timestamp: new Date().toISOString(),
                device_type: mobileService?.deviceInfo?.type || 'unknown',
                form_completion: this.calculateFormCompletion(formData),
                customer_name_provided: !!formData['customer-name'],
                equipment_detected: !!formData['equipment-manufacturer']
            };
            
            // Send to analytics service (if available)
            if (window.hvacJack && window.hvacJack.trackUsage) {
                window.hvacJack.trackUsage('maintenance_form_pdf_generated', analytics);
            }
            
            console.log('📊 PDF Generation Analytics:', analytics);
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
    }

    /**
     * Calculate form completion percentage
     */
    calculateFormCompletion(formData) {
        const totalFields = 50; // Approximate total number of form fields
        const completedFields = Object.values(formData).filter(value => 
            value !== null && value !== undefined && value !== ''
        ).length;
        
        return Math.round((completedFields / totalFields) * 100);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaintenanceFormPDF;
} else {
    window.MaintenanceFormPDF = MaintenanceFormPDF;
}