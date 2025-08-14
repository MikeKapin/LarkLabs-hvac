// js/photo-utils.js
// Photo processing and utility functions for HVAC Jack

class PhotoProcessor {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
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
                    
                    console.log('Image processed:', {
                        originalSize: `${img.width}x${img.height}`,
                        processedSize: `${width}x${height}`,
                        originalFileSize: `${(file.size / 1024).toFixed(1)}KB`,
                        compressedSize: `${(compressedDataUrl.length * 0.75 / 1024).toFixed(1)}KB`
                    });

                    resolve({
                        dataUrl: compressedDataUrl,
                        width,
                        height,
                        originalWidth: img.width,
                        originalHeight: img.height,
                        compressionRatio: file.size / (compressedDataUrl.length * 0.75)
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
 * Analysis result formatter
 */
class AnalysisFormatter {
    /**
     * Format Claude API response for display
     */
    static formatAnalysisResult(analysisData, mode = 'homeowner') {
        if (!analysisData.success) {
            return {
                success: false,
                error: analysisData.message || 'Analysis failed',
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
                structured: structuredData
            };
        }

        // For homeowner mode or when no structured data, format the text response
        return {
            success: true,
            formatted: this.formatTextAnalysis(analysis, mode),
            raw: analysis
        };
    }

    /**
     * Format technical analysis with structured data
     */
    static formatTechnicalAnalysis(data, rawText) {
        let formatted = `<div class="rating-plate-info">`;
        
        // Equipment header
        if (data.equipment) {
            formatted += `
                <div class="rating-plate-header">
                    <div class="rating-plate-icon">📋</div>
                    <div>
                        <div class="rating-plate-title">${data.equipment.brand || 'Unknown'} ${data.equipment.type || 'Equipment'}</div>
                        <div class="rating-plate-subtitle">Model: ${data.equipment.model || 'N/A'} • Age: ${data.equipment.age || 'Unknown'}</div>
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
                            <div class="info-item-label">Capacity</div>
                            <div class="info-item-value">${data.equipment.capacity || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-item-label">Manufacturing Date</div>
                            <div class="info-item-value">${data.equipment.manufacturingDate || 'N/A'}</div>
                        </div>
                    </div>
                </div>`;
        }

        // Electrical specs
        if (data.electrical) {
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
                            <div class="info-item-label">LRA</div>
                            <div class="info-item-value">${data.electrical.lra || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-item-label">MCA</div>
                            <div class="info-item-value">${data.electrical.mca || 'N/A'}</div>
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

        // Warranty info
        if (data.warranty) {
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

        // Technical notes
        if (data.technicalNotes) {
            formatted += `
                <div class="info-section">
                    <div class="info-section-title">📝 Technical Notes</div>
                    <div style="color: #A0AEC0; font-size: 0.85rem; line-height: 1.4;">
                        ${data.technicalNotes.replace(/\n/g, '<br>')}
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

        // Wrap in appropriate container
        return `<div class="analysis-text-result">${formatted}</div>`;
    }
}

// Export classes for use in other files
if (typeof window !== 'undefined') {
    window.PhotoProcessor = PhotoProcessor;
    window.MobilePhotoCapture = MobilePhotoCapture;
    window.AnalysisFormatter = AnalysisFormatter;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PhotoProcessor,
        MobilePhotoCapture,
        AnalysisFormatter
    };
}
