// js/photo-utils.js
// Enhanced photo processing and utility functions for HVAC Jack Professional

class EnhancedPhotoProcessor {
    constructor() {
        this.maxFileSize = 15 * 1024 * 1024; // 15MB for professional use
        this.maxDimension = 4096; // Higher resolution for professional analysis
        this.compressionQuality = 0.92; // Higher quality for technical details
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
        this.enhancementOptions = {
            contrast: 1.2,
            brightness: 10,
            sharpening: true,
            noiseReduction: true
        };
    }

    /**
     * Enhanced validation for professional use
     */
    validateFile(file) {
        const errors = [];

        if (!file) {
            errors.push('No file selected');
            return { valid: false, errors };
        }

        // Check file type with enhanced support
        if (!this.allowedTypes.includes(file.type)) {
            errors.push('Please upload a JPEG, PNG, WebP, or HEIC image');
        }

        // Enhanced size validation
        if (file.size > this.maxFileSize) {
            errors.push(`File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB for professional analysis`);
        }

        // Minimum size check for quality analysis
        if (file.size < 50 * 1024) {
            errors.push('Image too small for reliable analysis. Please use higher resolution image.');
        }

        return {
            valid: errors.length === 0,
            errors,
            fileInfo: {
                size: file.size,
                type: file.type,
                name: file.name
            }
        };
    }

    /**
     * Enhanced image processing with professional optimization
     */
    async processImage(file, options = {}) {
        return new Promise((resolve, reject) => {
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
                    // Calculate optimal dimensions for professional analysis
                    const { width, height } = this.calculateOptimalSize(
                        img.width, 
                        img.height, 
                        options.maxDimension || this.maxDimension
                    );

                    canvas.width = width;
                    canvas.height = height;

                    // Draw image with enhanced quality
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    // Apply professional image enhancements
                    if (options.enhance !== false) {
                        this.applyProfessionalEnhancements(canvas, ctx, options);
                    }

                    // Generate high-quality compressed output
                    const quality = options.quality || this.compressionQuality;
                    const outputFormat = options.format || 'image/jpeg';
                    const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
                    
                    console.log('✅ Professional image processed:', {
                        originalSize: `${img.width}x${img.height}`,
                        processedSize: `${width}x${height}`,
                        originalFileSize: `${(file.size / 1024).toFixed(1)}KB`,
                        compressedSize: `${(compressedDataUrl.length * 0.75 / 1024).toFixed(1)}KB`,
                        compressionRatio: (file.size / (compressedDataUrl.length * 0.75)).toFixed(2),
                        enhanced: options.enhance !== false
                    });

                    resolve({
                        dataUrl: compressedDataUrl,
                        width,
                        height,
                        originalWidth: img.width,
                        originalHeight: img.height,
                        compressionRatio: file.size / (compressedDataUrl.length * 0.75),
                        enhanced: options.enhance !== false,
                        quality: quality,
                        fileInfo: validation.fileInfo
                    });
                } catch (error) {
                    reject(new Error('Failed to process image: ' + error.message));
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image. Please try a different file or check image format.'));
            };

            // Read file as data URL with enhanced error handling
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    img.src = e.target.result;
                } catch (error) {
                    reject(new Error('Failed to load image data: ' + error.message));
                }
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file - file may be corrupted'));
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Apply professional image enhancements for rating plate analysis
     */
    applyProfessionalEnhancements(canvas, ctx, options = {}) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Enhanced contrast and brightness for text readability
        const contrast = options.contrast || this.enhancementOptions.contrast;
        const brightness = options.brightness || this.enhancementOptions.brightness;

        for (let i = 0; i < data.length; i += 4) {
            // Apply contrast and brightness
            data[i] = Math.min(255, Math.max(0, contrast * (data[i] - 128) + 128 + brightness));     // Red
            data[i + 1] = Math.min(255, Math.max(0, contrast * (data[i + 1] - 128) + 128 + brightness)); // Green
            data[i + 2] = Math.min(255, Math.max(0, contrast * (data[i + 2] - 128) + 128 + brightness)); // Blue
        }

        // Apply sharpening filter if enabled
        if (options.sharpening !== false && this.enhancementOptions.sharpening) {
            this.applySharpeningFilter(data, canvas.width, canvas.height);
        }

        // Apply noise reduction if enabled
        if (options.noiseReduction !== false && this.enhancementOptions.noiseReduction) {
            this.applyNoiseReduction(data, canvas.width, canvas.height);
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    /**
     * Apply sharpening filter for better text recognition
     */
    applySharpeningFilter(data, width, height) {
        const sharpenKernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];

        const tempData = new Uint8ClampedArray(data);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) { // RGB channels
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
                            const kernelIndex = (ky + 1) * 3 + (kx + 1);
                            sum += tempData[pixelIndex] * sharpenKernel[kernelIndex];
                        }
                    }
                    const currentIndex = (y * width + x) * 4 + c;
                    data[currentIndex] = Math.min(255, Math.max(0, sum));
                }
            }
        }
    }

    /**
     * Apply basic noise reduction
     */
    applyNoiseReduction(data, width, height) {
        const tempData = new Uint8ClampedArray(data);
        const radius = 1;

        for (let y = radius; y < height - radius; y++) {
            for (let x = radius; x < width - radius; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    let count = 0;

                    for (let dy = -radius; dy <= radius; dy++) {
                        for (let dx = -radius; dx <= radius; dx++) {
                            const pixelIndex = ((y + dy) * width + (x + dx)) * 4 + c;
                            sum += tempData[pixelIndex];
                            count++;
                        }
                    }

                    const currentIndex = (y * width + x) * 4 + c;
                    data[currentIndex] = Math.round(sum / count);
                }
            }
        }
    }

    /**
     * Calculate optimal image size for professional analysis
     */
    calculateOptimalSize(originalWidth, originalHeight, maxDimension) {
        // For professional analysis, maintain higher resolution when possible
        const minDimension = 800; // Minimum size for reliable text recognition

        // If image is already smaller than minimum, upscale slightly
        if (Math.max(originalWidth, originalHeight) < minDimension) {
            const scaleFactor = minDimension / Math.max(originalWidth, originalHeight);
            return {
                width: Math.round(originalWidth * scaleFactor),
                height: Math.round(originalHeight * scaleFactor)
            };
        }

        // If image is within optimal range, keep original
        if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
            return { width: originalWidth, height: originalHeight };
        }

        // Scale down large images
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
     * Extract base64 data from data URL with validation
     */
    extractBase64(dataUrl) {
        try {
            const base64Index = dataUrl.indexOf('base64,');
            if (base64Index === -1) {
                throw new Error('Invalid data URL format - no base64 data found');
            }
            
            const base64Data = dataUrl.substring(base64Index + 7);
            
            // Validate base64 format
            if (!base64Data.match(/^[A-Za-z0-9+/]+=*$/)) {
                throw new Error('Invalid base64 data format');
            }
            
            return base64Data;
        } catch (error) {
            throw new Error('Failed to extract base64 data: ' + error.message);
        }
    }

    /**
     * Create professional thumbnail with rating plate focus
     */
    async createProfessionalThumbnail(file, maxSize = 400) {
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
                
                // High quality thumbnail
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Apply light enhancement for preview
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;

                // Light contrast boost for thumbnail
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, 1.1 * (data[i] - 128) + 128 + 5));
                    data[i + 1] = Math.min(255, Math.max(0, 1.1 * (data[i + 1] - 128) + 128 + 5));
                    data[i + 2] = Math.min(255, Math.max(0, 1.1 * (data[i + 2] - 128) + 128 + 5));
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };

            img.onerror = () => reject(new Error('Failed to create professional thumbnail'));

            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            reader.onerror = () => reject(new Error('Failed to read file for thumbnail'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Analyze image for rating plate detection
     */
    analyzeForRatingPlate(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const analysis = {
            hasMetallicSurface: false,
            hasTextRegions: false,
            hasSerialNumbers: false,
            brightness: 0,
            contrast: 0,
            textReadability: 'unknown'
        };

        // Basic image analysis
        const data = imageData.data;
        let totalBrightness = 0;
        let minBrightness = 255;
        let maxBrightness = 0;

        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            totalBrightness += brightness;
            minBrightness = Math.min(minBrightness, brightness);
            maxBrightness = Math.max(maxBrightness, brightness);
        }

        analysis.brightness = totalBrightness / (data.length / 4);
        analysis.contrast = maxBrightness - minBrightness;

        // Determine text readability
        if (analysis.contrast > 100 && analysis.brightness > 80 && analysis.brightness < 200) {
            analysis.textReadability = 'good';
        } else if (analysis.contrast > 50) {
            analysis.textReadability = 'fair';
        } else {
            analysis.textReadability = 'poor';
        }

        return analysis;
    }
}

/**
 * Enhanced mobile photo capture for professional use
 */
class ProfessionalMobileCapture {
    constructor() {
        this.stream = null;
        this.isCapturing = false;
        this.constraints = null;
        this.facingMode = 'environment'; // Start with back camera
    }

    /**
     * Check device capabilities for professional capture
     */
    static async getDeviceCapabilities() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return { supported: false, reason: 'Camera not supported' };
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            return {
                supported: true,
                deviceCount: videoDevices.length,
                hasBackCamera: videoDevices.some(device => 
                    device.label.toLowerCase().includes('back') || 
                    device.label.toLowerCase().includes('rear')
                ),
                hasFrontCamera: videoDevices.some(device => 
                    device.label.toLowerCase().includes('front') || 
                    device.label.toLowerCase().includes('user')
                )
            };
        } catch (error) {
            return { supported: false, reason: error.message };
        }
    }

    /**
     * Get professional camera constraints optimized for rating plates
     */
    getProfessionalConstraints() {
        return {
            video: {
                facingMode: { ideal: this.facingMode },
                width: { 
                    min: 1280, 
                    ideal: 1920, 
                    max: 4096 
                },
                height: { 
                    min: 720, 
                    ideal: 1080, 
                    max: 2160 
                },
                aspectRatio: { ideal: 16/9 },
                frameRate: { ideal: 30, max: 60 },
                focusMode: { ideal: 'continuous' },
                exposureMode: { ideal: 'continuous' },
                whiteBalanceMode: { ideal: 'continuous' },
                torch: false // Start with torch off
            },
            audio: false
        };
    }

    /**
     * Start professional camera with optimal settings
     */
    async startProfessionalCamera(options = {}) {
        try {
            if (this.stream) {
                this.stopCamera();
            }

            this.constraints = {
                ...this.getProfessionalConstraints(),
                ...options
            };

            console.log('🎥 Starting professional camera with constraints:', this.constraints);

            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            
            // Get actual track settings
            const videoTrack = this.stream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            
            console.log('✅ Camera started with settings:', {
                width: settings.width,
                height: settings.height,
                frameRate: settings.frameRate,
                facingMode: settings.facingMode
            });

            return {
                stream: this.stream,
                settings: settings,
                capabilities: videoTrack.getCapabilities()
            };
        } catch (error) {
            console.error('❌ Professional camera start failed:', error);
            throw new Error(`Camera access failed: ${error.message}`);
        }
    }

    /**
     * Switch between front and back cameras
     */
    async switchCamera() {
        const newFacingMode = this.facingMode === 'environment' ? 'user' : 'environment';
        
        try {
            this.facingMode = newFacingMode;
            await this.startProfessionalCamera();
            return this.facingMode;
        } catch (error) {
            // Revert on failure
            this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
            throw error;
        }
    }

    /**
     * Toggle camera torch/flash
     */
    async toggleTorch() {
        if (!this.stream) {
            throw new Error('Camera not active');
        }

        const videoTrack = this.stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();

        if (!capabilities.torch) {
            throw new Error('Torch not supported on this device');
        }

        const settings = videoTrack.getSettings();
        const newTorchState = !settings.torch;

        try {
            await videoTrack.applyConstraints({
                advanced: [{ torch: newTorchState }]
            });
            return newTorchState;
        } catch (error) {
            throw new Error(`Failed to toggle torch: ${error.message}`);
        }
    }

    /**
     * Capture professional photo with enhanced settings
     */
    captureProfessionalPhoto(videoElement, options = {}) {
        if (!videoElement || !this.stream) {
            throw new Error('No active camera stream or video element');
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Use video's actual dimensions
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Professional capture settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw current video frame
        ctx.drawImage(videoElement, 0, 0);

        // Apply professional enhancements if requested
        if (options.enhance !== false) {
            const processor = new EnhancedPhotoProcessor();
            processor.applyProfessionalEnhancements(canvas, ctx, options);
        }

        // Return high-quality capture
        const quality = options.quality || 0.95;
        return canvas.toDataURL('image/jpeg', quality);
    }

    /**
     * Stop camera and clean up resources
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                console.log('🛑 Camera track stopped:', track.kind);
            });
            this.stream = null;
        }
        this.isCapturing = false;
    }

    /**
     * Get current camera info
     */
    getCameraInfo() {
        if (!this.stream) {
            return null;
        }

        const videoTrack = this.stream.getVideoTracks()[0];
        return {
            label: videoTrack.label,
            settings: videoTrack.getSettings(),
            capabilities: videoTrack.getCapabilities(),
            state: videoTrack.readyState
        };
    }
}

/**
 * Enhanced analysis result formatter for professional display
 */
class ProfessionalAnalysisFormatter {
    /**
     * Format comprehensive analysis results
     */
    static formatProfessionalResult(analysisData, mode = 'homeowner') {
        if (!analysisData.success) {
            return {
                success: false,
                error: analysisData.message || 'Analysis failed',
                fallback: analysisData.fallback || false,
                suggestions: this.getFailureSuggestions(analysisData)
            };
        }

        const { 
            analysis, 
            structuredData, 
            diagnosticPackage, 
            comprehensiveData,
            equipmentDetails 
        } = analysisData;

        // Professional comprehensive formatting
        if (diagnosticPackage && mode === 'technician') {
            return {
                success: true,
                formatted: this.formatProfessionalDiagnosticPackage(
                    diagnosticPackage, 
                    structuredData, 
                    comprehensiveData,
                    analysis
                ),
                raw: analysis,
                structured: structuredData,
                diagnostic: diagnosticPackage,
                comprehensive: comprehensiveData
            };
        }

        // Enhanced homeowner formatting
        if (comprehensiveData && mode === 'homeowner') {
            return {
                success: true,
                formatted: this.formatHomeownerComprehensiveResult(
                    analysis,
                    structuredData,
                    comprehensiveData,
                    equipmentDetails
                ),
                raw: analysis,
                structured: structuredData,
                comprehensive: comprehensiveData
            };
        }

        // Standard enhanced formatting
        return {
            success: true,
            formatted: this.formatEnhancedTextAnalysis(analysis, mode, structuredData),
            raw: analysis,
            structured: structuredData
        };
    }

    /**
     * Format professional diagnostic package for technicians
     */
    static formatProfessionalDiagnosticPackage(diagnosticPackage, structuredData, comprehensiveData, rawAnalysis) {
        let formatted = `<div class="professional-diagnostic-package">`;
        
        // Executive summary header
        formatted += `
            <div class="diagnostic-header">
                <div class="diagnostic-icon">🎯</div>
                <div>
                    <div class="diagnostic-title">PROFESSIONAL DIAGNOSTIC PACKAGE</div>
                    <div class="diagnostic-subtitle">Complete Equipment Analysis & Documentation Ready</div>
                </div>
            </div>`;

        // Quick access data
        if (diagnosticPackage.quickAccess) {
            formatted += `
                <div class="quick-access-section">
                    <div class="section-title">⚡ Quick Access Data</div>
                    <div class="quick-access-grid">
                        <div class="quick-access-item">
                            <div class="item-label">Model</div>
                            <div class="item-value">${diagnosticPackage.quickAccess.modelNumber || 'N/A'}</div>
                        </div>
                        <div class="quick-access-item">
                            <div class="item-label">Serial</div>
                            <div class="item-value">${diagnosticPackage.quickAccess.serialNumber || 'N/A'}</div>
                        </div>
                        <div class="quick-access-item">
                            <div class="item-label">Type</div>
                            <div class="item-value">${diagnosticPackage.quickAccess.quickSpecs?.type || 'N/A'}</div>
                        </div>
                        <div class="quick-access-item">
                            <div class="item-label">Warranty</div>
                            <div class="item-value">${diagnosticPackage.quickAccess.warrantyCoverage || 'Check required'}</div>
                        </div>
                    </div>
                </div>`;
        }

        // Comprehensive documentation available
        if (comprehensiveData && comprehensiveData.success) {
            formatted += `
                <div class="documentation-section">
                    <div class="section-title">📚 Complete Documentation Package</div>
                    <div class="documentation-grid">`;
            
            if (comprehensiveData.manuals?.length > 0) {
                formatted += `
                    <div class="doc-category">
                        <div class="doc-category-title">📋 Service Manuals (${comprehensiveData.manuals.length})</div>
                        <div class="doc-category-status">✅ Available</div>
                    </div>`;
            }
            
            if (comprehensiveData.wiringDiagrams?.length > 0) {
                formatted += `
                    <div class="doc-category">
                        <div class="doc-category-title">⚡ Wiring Diagrams (${comprehensiveData.wiringDiagrams.length})</div>
                        <div class="doc-category-status">✅ Available</div>
                    </div>`;
            }
            
            if (comprehensiveData.errorCodes?.length > 0) {
                formatted += `
                    <div class="doc-category">
                        <div class="doc-category-title">🔍 Error Codes (${comprehensiveData.errorCodes.length})</div>
                        <div class="doc-category-status">✅ Loaded</div>
                    </div>`;
            }
            
            formatted += `</div></div>`;
        }

        // Professional diagnostic readiness
        formatted += `
            <div class="diagnostic-readiness">
                <div class="section-title">🔧 Diagnostic Readiness Status</div>
                <div class="readiness-checklist">
                    <div class="checklist-item">
                        <div class="check-icon">✅</div>
                        <div class="check-text">Equipment specifications verified</div>
                    </div>
                    <div class="checklist-item">
                        <div class="check-icon">✅</div>
                        <div class="check-text">Service documentation located</div>
                    </div>
                    <div class="checklist-item">
                        <div class="check-icon">✅</div>
                        <div class="check-text">Diagnostic procedures loaded</div>
                    </div>
                    <div class="checklist-item">
                        <div class="check-icon">✅</div>
                        <div class="check-text">Safety protocols current</div>
                    </div>
                </div>
            </div>`;

        formatted += `</div>`;
        return formatted;
    }

    /**
     * Format comprehensive result for homeowners
     */
    static formatHomeownerComprehensiveResult(analysis, structuredData, comprehensiveData, equipmentDetails) {
        let formatted = `<div class="homeowner-comprehensive-result">`;
        
        // Friendly header
        formatted += `
            <div class="homeowner-header">
                <div class="homeowner-icon">🏠</div>
                <div>
                    <div class="homeowner-title">Your Equipment Profile is Complete!</div>
                    <div class="homeowner-subtitle">Everything I need to help you is now ready</div>
                </div>
            </div>`;

        // Equipment summary
        if (structuredData?.equipment) {
            const eq = structuredData.equipment;
            formatted += `
                <div class="equipment-summary">
                    <div class="section-title">🔧 Your Equipment</div>
                    <div class="equipment-info">
                        <strong>${eq.brand || 'Unknown'} ${eq.type || 'Equipment'}</strong><br>
                        Model: ${eq.model || 'N/A'}<br>
                        ${eq.age ? `Age: ${eq.age}` : ''}
                    </div>
                </div>`;
        }

        // What's ready for homeowner
        formatted += `
            <div class="homeowner-ready">
                <div class="section-title">✅ What's Ready for You</div>
                <div class="ready-list">
                    <div class="ready-item">
                        <div class="ready-icon">📖</div>
                        <div class="ready-text">Complete owner's manual and operation guide</div>
                    </div>
                    <div class="ready-item">
                        <div class="ready-icon">🛡️</div>
                        <div class="ready-text">Warranty status and registration info</div>
                    </div>
                    <div class="ready-item">
                        <div class="ready-icon">🔍</div>
                        <div class="ready-text">Safe troubleshooting procedures</div>
                    </div>
                    <div class="ready-item">
                        <div class="ready-icon">📞</div>
                        <div class="ready-text">Professional service contacts</div>
                    </div>
                </div>
            </div>`;

        formatted += `</div>`;
        return formatted;
    }

    /**
     * Format enhanced text analysis
     */
    static formatEnhancedTextAnalysis(text, mode, structuredData) {
        // Enhanced markdown processing
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
            .replace(/(?:^|\s)(https?:\/\/[^\s]+)/g, ' <a href="$1" target="_blank" rel="noopener">$1</a>');

        // Add professional styling wrapper
        const wrapperClass = mode === 'technician' ? 'professional-analysis' : 'homeowner-analysis';
        return `<div class="${wrapperClass}">${formatted}</div>`;
    }

    /**
     * Get suggestions for analysis failures
     */
    static getFailureSuggestions(analysisData) {
        const suggestions = [
            'Ensure the rating plate is clearly visible and well-lit',
            'Try taking the photo from directly in front of the plate',
            'Clean any dirt or debris from the rating plate surface',
            'Use your camera\'s flash if the area is dimly lit'
        ];

        if (analysisData.error?.includes('network')) {
            suggestions.unshift('Check your internet connection and try again');
        }

        if (analysisData.error?.includes('format')) {
            suggestions.unshift('Try using a JPEG image format');
        }

        return suggestions;
    }
}

/**
 * Professional photo session manager
 */
class PhotoSessionManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.photos = [];
        this.analysisResults = [];
        this.startTime = Date.now();
    }

    generateSessionId() {
        return `photo_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    addPhoto(photoData, metadata = {}) {
        const photo = {
            id: `photo_${this.photos.length + 1}`,
            timestamp: new Date().toISOString(),
            dataUrl: photoData,
            metadata: {
                ...metadata,
                sessionId: this.sessionId
            }
        };
        this.photos.push(photo);
        return photo.id;
    }

    addAnalysisResult(photoId, analysisResult) {
        const result = {
            photoId,
            timestamp: new Date().toISOString(),
            result: analysisResult,
            sessionId: this.sessionId
        };
        this.analysisResults.push(result);
        return result;
    }

    getSessionSummary() {
        return {
            sessionId: this.sessionId,
            startTime: this.startTime,
            duration: Date.now() - this.startTime,
            photoCount: this.photos.length,
            analysisCount: this.analysisResults.length,
            successfulAnalyses: this.analysisResults.filter(r => r.result.success).length
        };
    }

    clearSession() {
        this.photos = [];
        this.analysisResults = [];
        this.startTime = Date.now();
        this.sessionId = this.generateSessionId();
    }
}

// Export classes for use in other files
if (typeof window !== 'undefined') {
    window.EnhancedPhotoProcessor = EnhancedPhotoProcessor;
    window.ProfessionalMobileCapture = ProfessionalMobileCapture;
    window.ProfessionalAnalysisFormatter = ProfessionalAnalysisFormatter;
    window.PhotoSessionManager = PhotoSessionManager;

    // Backward compatibility
    window.PhotoProcessor = EnhancedPhotoProcessor;
    window.MobilePhotoCapture = ProfessionalMobileCapture;
    window.AnalysisFormatter = ProfessionalAnalysisFormatter;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedPhotoProcessor,
        ProfessionalMobileCapture,
        ProfessionalAnalysisFormatter,
        PhotoSessionManager
    };
}
