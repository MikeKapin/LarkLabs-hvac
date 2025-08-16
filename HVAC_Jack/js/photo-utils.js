// js/photo-utils.js
// Photo processing and utility functions for HVAC Jack
// Compatible with analyze-photo.js backend

class PhotoProcessor {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB (matches backend expectations)
        this.maxDimension = 2048; // Max width/height
        this.compressionQuality = 0.85;
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    }

    /**
     * Validate uploaded file
     */
    validateFile(file) {
        const errors = [];

        if (!file) {
            errors.push('No file selected');
            return { valid: false, errors };
        }

        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
            errors.push('Please upload a JPEG, PNG, or WebP image');
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            errors.push(`File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Process and optimize image for analysis
     * Returns base64 data compatible with analyze-photo.js backend
     */
    async processImage(file) {
        return new Promise((resolve, reject) => {
            // Validate file first
            const validation = this.validateFile(file);
            if (!validation.valid) {
                reject(new Error(validation.errors.join(', ')));
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                try {
                    // Calculate optimal dimensions
                    const { width, height } = this.calculateOptimalSize(
                        img.width, 
                        img.height, 
                        this.maxDimension
                    );

                    // Set canvas size
                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 with compression
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', this.compressionQuality);
                    
                    // Extract just the base64 data (without data:image/jpeg;base64, prefix)
                    const base64Data = this.extractBase64(compressedDataUrl);
                    
                    console.log('Image processed for analysis:', {
                        originalSize: `${img.width}x${img.height}`,
                        processedSize: `${width}x${height}`,
                        originalFileSize: `${(file.size / 1024).toFixed(1)}KB`,
                        compressedSize: `${(base64Data.length * 0.75 / 1024).toFixed(1)}KB`,
                        base64Length: base64Data.length
                    });

                    resolve({
                        base64Data: base64Data, // Pure base64 for backend
                        dataUrl: compressedDataUrl, // Full data URL for preview
                        width,
                        height,
                        originalWidth: img.width,
                        originalHeight: img.height,
                        compressionRatio: file.size / (base64Data.length * 0.75),
                        fileSize: base64Data.length * 0.75
                    });
                } catch (error) {
                    reject(new Error('Failed to process image: ' + error.message));
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image. Please try a different file.'));
            };

            // Read file as data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Calculate optimal image size for analysis
     */
    calculateOptimalSize(originalWidth, originalHeight, maxDimension) {
        // If image is already small enough, keep original size
        if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
            return { width: originalWidth, height: originalHeight };
        }

        // Calculate scaling factor
        const scaleFactor = Math.min(
            maxDimension / originalWidth,
            maxDimension / originalHeight
        );

        return {
            width: Math.round(originalWidth * scaleFactor),
            height: Math.round(originalHeight * scaleFactor)
        };
    }

    /**
     * Extract base64 data from data URL
     */
    extractBase64(dataUrl) {
        const base64Index = dataUrl.indexOf('base64,');
        if (base64Index === -1) {
            throw new Error('Invalid data URL format');
        }
        return dataUrl.substring(base64Index + 7);
    }

    /**
     * Create thumbnail for preview
     */
    async createThumbnail(file, maxSize = 300) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const { width, height } = this.calculateOptimalSize(
                    img.width, 
                    img.height, 
                    maxSize
                );

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };

            img.onerror = () => reject(new Error('Failed to create thumbnail'));

            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            reader.onerror = () => reject(new Error('Failed to read file for thumbnail'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Apply image enhancement for better OCR
     */
    enhanceForOCR(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply basic contrast enhancement
        const contrast = 1.2;
        const brightness = 10;

        for (let i = 0; i < data.length; i += 4) {
            // Apply contrast and brightness
            data[i] = Math.min(255, Math.max(0, contrast * (data[i] - 128) + 128 + brightness));     // Red
            data[i + 1] = Math.min(255, Math.max(0, contrast * (data[i + 1] - 128) + 128 + brightness)); // Green
            data[i + 2] = Math.min(255, Math.max(0, contrast * (data[i + 2] - 128) + 128 + brightness)); // Blue
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }
}

/**
 * Photo capture utilities for mobile devices
 */
class MobilePhotoCapture {
    constructor() {
        this.stream = null;
        this.isCapturing = false;
    }

    /**
     * Check if device supports camera
     */
    static isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    /**
     * Get optimal camera constraints for rating plate capture
     */
    getCameraConstraints() {
        return {
            video: {
                facingMode: { ideal: 'environment' }, // Use back camera
                width: { ideal: 1920, max: 2048 },
                height: { ideal: 1080, max: 1536 },
                focusMode: { ideal: 'continuous' },
                whiteBalanceMode: { ideal: 'auto' }
            },
            audio: false
        };
    }

    /**
     * Start camera stream
     */
    async startCamera() {
        if (!MobilePhotoCapture.isSupported()) {
            throw new Error('Camera not supported on this device');
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(this.getCameraConstraints());
            return this.stream;
        } catch (error) {
            console.error('Failed to start camera:', error);
            throw new Error('Camera access denied or not available');
        }
    }

    /**
     * Stop camera stream
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    /**
     * Capture photo from video stream
     */
    capturePhoto(videoElement) {
        if (!videoElement || !this.stream) {
            throw new Error('No active camera stream');
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to video dimensions
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Draw current video frame to canvas
        ctx.drawImage(videoElement, 0, 0);

        // Return as data URL
        return canvas.toDataURL('image/jpeg', 0.9);
    }
}

/**
 * Analysis result formatter compatible with analyze-photo.js response format
 */
class AnalysisFormatter {
    /**
     * Format Claude API response for display
     */
    static formatAnalysisResult(analysisData, mode = 'homeowner') {
        if (!analysisData.success) {
            return {
                success: false,
                error: analysisData.message || analysisData.error || 'Analysis failed',
                fallback: analysisData.fallback || false
            };
        }

        const { analysis, structuredData } = analysisData;

        // If we have structured data, use it to create enhanced display
        if (structuredData && mode === 'technician') {
            return {
                success: true,
                formatted: this.formatTechnicalAnalysis(structuredData, analysis),
                raw: analysis,
                structured: structuredData,
                mode: mode
            };
        }

        // For homeowner mode or when no structured data, format the text response
        return {
            success: true,
            formatted: this.formatTextAnalysis(analysis, mode),
            raw: analysis,
            structured: structuredData || null,
            mode: mode
        };
    }

    /**
     * Format technical analysis with structured data
     */
    static formatTechnicalAnalysis(data, rawText) {
        let formatted = `<div class="rating-plate-info">`;
        
        // Equipment header
        if (data.equipment) {
            const equipmentIcon = this.getEquipmentIcon(data.equipment.type);
            const warrantyIcon = this.getWarrantyIcon(data.warranty?.status);
            
            formatted += `
                <div class="rating-plate-header">
                    <div class="rating-plate-icon">${equipmentIcon}</div>
                    <div>
                        <div class="rating-plate-title">${data.equipment.brand || 'Unknown'} ${data.equipment.type || 'Equipment'}</div>
                        <div class="rating-plate-subtitle">
                            Model: ${data.equipment.model || 'N/A'} • 
                            Age: ${data.equipment.age || 'Unknown'} • 
                            ${warrantyIcon} ${data.warranty?.status || 'Unknown'}
                        </div>
                    </div>
                </div>`;
        }

        // Equipment specs
        if (data.equipment) {
            formatted += `
                <div class="info-section">
                    <div class="info-section-title">🔧 Equipment Specifications</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-item-label">Model Number</div>
                            <div class="info-item-value">${data.equipment.model || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-item-label">Serial Number</div>
                            <div class="info-item-value">${data.equipment.serial || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-item-label">Category</div>
                            <div class="info-item-value">${data.equipment.category || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-item-label">Manufacturing Date</div>
                            <div class="info-item-value">${data.equipment.manufacturingDate || 'N/A'}</div>
                        </div>
                    </div>
                </div>`;
        }

        // Gas specifications (if gas equipment)
        if (data.gas && (data.gas.type || data.gas.input)) {
            formatted += `
                <div class="info-section">
                    <div class="info-section-title">🔥 Gas Specifications</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-item-label">Gas Type</div>
                            <div class="info-item-value">${data.gas.type || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-item-label">Input Rating</div>
                            <div class="info-item-value">${data.gas.input || 'N/A'}</div>
                        </div>
                    </div>
                </div>`;
        }

        // Electrical specs
        if (data.electrical && data.electrical.summary) {
            formatted += `
                <div class="info-section">
                    <div class="info-section-title">⚡ Electrical Specifications</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-item-label">Voltage</div>
                            <div class="info-item-value">${data.electrical.voltage || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-item-label">FLA</div>
                            <div class="info-item-value">${data.electrical.fla || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-item-label">MCA</div>
                            <div class="info-item-value">${data.electrical.mca || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-item-label">MOCP</div>
                            <div class="info-item-value">${data.electrical.mocp || 'N/A'}</div>
                        </div>
                    </div>
                </div>`;
        }

        // Capacitors
        if (data.capacitors && data.capacitors.length > 0) {
            formatted += `
                <div class="info-section">
                    <div class="info-section-title">🔋 Capacitor Requirements</div>
                    <div class="capacitor-list">`;
            
            data.capacitors.forEach(cap => {
                formatted += `
                    <div class="capacitor-item">
                        <div class="capacitor-component">${cap.component}</div>
                        <div class="capacitor-specs">${cap.mfd} MFD, ${cap.voltage}V ${cap.type}</div>
                    </div>`;
            });
            
            formatted += `</div></div>`;
        }

        // Performance/Efficiency
        if (data.performance && data.performance.efficiency) {
            formatted += `
                <div class="info-section">
                    <div class="info-section-title">📊 Performance Specifications</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-item-label">Efficiency Rating</div>
                            <div class="info-item-value">${data.performance.efficiency}</div>
                        </div>
                    </div>
                </div>`;
        }

        // Warranty info
        if (data.warranty && data.warranty.status) {
            const statusClass = data.warranty.status === 'active' ? 'warranty-active' : 
                               data.warranty.status === 'expiring' ? 'warranty-expiring' : 'warranty-expired';
            
            formatted += `
                <div class="info-section">
                    <div class="info-section-title">🛡️ Warranty Status</div>
                    <div class="warranty-status ${statusClass}">
                        ${data.warranty.status === 'active' ? '✅ WARRANTY ACTIVE' : 
                          data.warranty.status === 'expiring' ? '⚠️ WARRANTY EXPIRING' : 
                          '❌ WARRANTY EXPIRED'}
                    </div>
                    <div style="margin-top: 0.5rem; color: #A0AEC0; font-size: 0.85rem;">
                        ${data.warranty.coverage || 'Standard manufacturer warranty terms apply'}
                    </div>
                </div>`;
        }

        // Safety notes
        if (data.safety && data.safety.notes) {
            formatted += `
                <div class="info-section">
                    <div class="info-section-title">⚠️ Safety Notes</div>
                    <div style="color: #FFA500; font-size: 0.9rem; line-height: 1.4;">
                        ${data.safety.notes.replace(/\n/g, '<br>')}
                    </div>
                </div>`;
        }

        // Manual search prompt for technician mode
        if (data.equipment?.brand && data.equipment?.model) {
            formatted += `
                <div class="info-section">
                    <div class="info-section-title">📚 Technical Documentation</div>
                    <div style="margin-bottom: 1rem;">
                        <button onclick="searchForManuals('${data.equipment.brand}', '${data.equipment.model}', '${data.equipment.type || 'equipment'}')" 
                                class="manual-search-btn">
                            🔍 Search for Service Manuals
                        </button>
                    </div>
                    <div style="font-size: 0.85rem; color: #A0AEC0;">
                        Search for official service manuals, wiring diagrams, and troubleshooting guides
                    </div>
                </div>`;
        }

        formatted += `</div>`;
        return formatted;
    }

    /**
     * Format text analysis for display
     */
    static formatTextAnalysis(text, mode) {
        // Convert markdown-style formatting to HTML
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

        // Add manual search prompts for homeowner mode
        if (mode === 'homeowner' && /model|brand|manufacturer/i.test(text)) {
            formatted += `
                <div style="margin-top: 1.5rem; padding: 1rem; background: #2D3748; border-radius: 8px; border-left: 4px solid #4A90E2;">
                    <div style="font-weight: bold; margin-bottom: 0.5rem;">📚 Need Manuals?</div>
                    <div style="font-size: 0.9rem; color: #A0AEC0;">
                        I can help you find official service manuals and documentation for this equipment. 
                        Just ask "Find manuals for [brand] [model]"
                    </div>
                </div>`;
        }

        // Wrap in appropriate container
        return `<div class="analysis-text-result">${formatted}</div>`;
    }

    /**
     * Get equipment icon based on type
     */
    static getEquipmentIcon(type) {
        const iconMap = {
            'generator': '🔋',
            'furnace': '🔥',
            'gas furnace': '🔥',
            'water heater': '🚿',
            'gas water heater': '🚿',
            'boiler': '♨️',
            'gas boiler': '♨️',
            'air conditioner': '❄️',
            'heat pump': '🌡️',
            'unit heater': '🔥',
            'gas unit heater': '🔥',
            'range': '🍳',
            'gas range': '🍳',
            'dryer': '👕',
            'gas dryer': '👕',
            'fireplace': '🔥',
            'gas fireplace': '🔥'
        };
        
        return iconMap[type?.toLowerCase()] || '📋';
    }

    /**
     * Get warranty status icon
     */
    static getWarrantyIcon(status) {
        const iconMap = {
            'active': '✅',
            'expiring': '⚠️',
            'expired': '❌'
        };
        
        return iconMap[status] || '❓';
    }

    /**
     * Create equipment summary for chat context
     */
    static createEquipmentSummary(structuredData) {
        if (!structuredData || !structuredData.equipment) return null;

        const eq = structuredData.equipment;
        return {
            brand: eq.brand,
            model: eq.model,
            type: eq.type,
            age: eq.age,
            category: eq.category,
            warrantyStatus: structuredData.warranty?.status,
            hasElectricalSpecs: !!(structuredData.electrical?.voltage),
            hasGasSpecs: !!(structuredData.gas?.type),
            hasCapacitors: !!(structuredData.capacitors?.length > 0)
        };
    }
}

/**
 * Photo analysis API integration
 */
class PhotoAnalysisAPI {
    constructor() {
        this.baseUrl = '/.netlify/functions';
        this.processor = new PhotoProcessor();
    }

    /**
     * Analyze rating plate photo
     */
    async analyzePhoto(file, mode = 'homeowner', sessionId = null) {
        try {
            // Process image first
            const processedImage = await this.processor.processImage(file);
            
            console.log('Sending photo for analysis...', {
                mode,
                imageSize: processedImage.base64Data.length,
                sessionId
            });

            // Send to analyze-photo function
            const response = await fetch(`${this.baseUrl}/analyze-photo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageData: processedImage.base64Data, // Pure base64 expected by backend
                    mode: mode,
                    sessionId: sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.status}`);
            }

            const result = await response.json();
            
            console.log('Photo analysis result:', {
                success: result.success,
                hasStructuredData: !!(result.structuredData),
                responseTime: result.responseTime
            });

            return result;

        } catch (error) {
            console.error('Photo analysis error:', error);
            throw error;
        }
    }

    /**
     * Search for equipment manuals
     */
    async searchManuals(brand, model, equipmentType) {
        try {
            const response = await fetch(`${this.baseUrl}/search-manuals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    brand,
                    model,
                    equipmentType
                })
            });

            if (!response.ok) {
                throw new Error(`Manual search failed: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Manual search error:', error);
            throw error;
        }
    }
}

// Global function for manual search (called from formatted analysis)
if (typeof window !== 'undefined') {
    window.searchForManuals = async function(brand, model, equipmentType) {
        try {
            const api = new PhotoAnalysisAPI();
            const result = await api.searchManuals(brand, model, equipmentType);
            
            if (result.success && result.manuals.length > 0) {
                // Display manual search results in a modal or new section
                console.log('Found manuals:', result.manuals);
                // You can implement the UI display logic here
                alert(`Found ${result.manuals.length} manuals for ${brand} ${model}`);
            } else {
                alert('No manuals found. Try searching the manufacturer website directly.');
            }
        } catch (error) {
            console.error('Manual search failed:', error);
            alert('Manual search failed. Please try again.');
        }
    };
}

// Export classes for use in other files
if (typeof window !== 'undefined') {
    window.PhotoProcessor = PhotoProcessor;
    window.MobilePhotoCapture = MobilePhotoCapture;
    window.AnalysisFormatter = AnalysisFormatter;
    window.PhotoAnalysisAPI = PhotoAnalysisAPI;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PhotoProcessor,
        MobilePhotoCapture,
        AnalysisFormatter,
        PhotoAnalysisAPI
    };
}
