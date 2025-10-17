// netlify/functions/ocr-processor.js
// Advanced OCR preprocessing for HVAC rating plates
// Integrates with Tesseract.js for text extraction before Claude Vision analysis

const tesseract = require('tesseract.js');

class OCRProcessor {
    constructor() {
        this.config = {
            lang: 'eng',
            oem: 1, // LSTM neural net mode
            psm: 6, // Assume single uniform block of text
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.,/\\() ',
            preserve_interword_spaces: '1'
        };
    }

    /**
     * Preprocess image for better OCR accuracy
     */
    async preprocessImage(imageBuffer) {
        try {
            // Create canvas for image processing
            const { createCanvas, loadImage } = require('canvas');
            const image = await loadImage(imageBuffer);
            
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            
            // Draw original image
            ctx.drawImage(image, 0, 0);
            
            // Apply preprocessing filters
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // 1. Contrast enhancement
            this.enhanceContrast(imageData, 1.3);
            
            // 2. Brightness adjustment
            this.adjustBrightness(imageData, 15);
            
            // 3. Noise reduction
            this.reduceNoise(imageData);
            
            ctx.putImageData(imageData, 0, 0);
            
            return canvas.toBuffer('image/png');
            
        } catch (error) {
            console.warn('Image preprocessing failed, using original:', error);
            return imageBuffer;
        }
    }

    /**
     * Extract text using Tesseract OCR
     */
    async extractText(imageData) {
        try {
            console.log('🔍 Starting OCR text extraction...');
            
            // Convert base64 to buffer if needed
            let imageBuffer;
            if (typeof imageData === 'string') {
                imageBuffer = Buffer.from(imageData, 'base64');
            } else {
                imageBuffer = imageData;
            }

            // Preprocess image for better OCR
            const processedImage = await this.preprocessImage(imageBuffer);
            
            // Perform OCR with optimized settings
            const { data: { text, confidence, words } } = await tesseract.recognize(
                processedImage,
                'eng',
                {
                    logger: m => console.log('OCR Progress:', m.status, m.progress),
                    ...this.config
                }
            );

            console.log(`✅ OCR completed. Confidence: ${confidence}%, Text length: ${text.length}`);
            
            // Clean and structure the extracted text
            const cleanedText = this.cleanOCRText(text);
            const structuredData = this.parseRatingPlateText(cleanedText, words);
            
            return {
                success: true,
                extractedText: cleanedText,
                rawText: text,
                confidence: confidence,
                structuredData: structuredData,
                wordDetails: words.filter(word => word.confidence > 60) // Only confident words
            };
            
        } catch (error) {
            console.error('❌ OCR extraction failed:', error);
            return {
                success: false,
                error: error.message,
                extractedText: null
            };
        }
    }

    /**
     * Clean OCR text output
     */
    cleanOCRText(text) {
        return text
            .replace(/[^\w\s\-.,/\\()]/g, '') // Remove special chars except common ones
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/([A-Z])([0-9])/g, '$1 $2') // Add space between letters and numbers
            .replace(/([0-9])([A-Z])/g, '$1 $2') // Add space between numbers and letters
            .trim();
    }

    /**
     * Parse rating plate text into structured data
     */
    parseRatingPlateText(text, words) {
        const data = {
            brand: null,
            model: null,
            serial: null,
            electrical: {},
            gas: {},
            capacity: null,
            efficiency: null,
            certification: [],
            manufacturing: null,
            confidence: 0
        };

        // Brand detection patterns
        const brandPatterns = [
            /(?:CARRIER|TRANE|LENNOX|YORK|RHEEM|RUUD|GOODMAN|AMANA|PAYNE|BRYANT|AMERICAN STANDARD|KOHLER|GENERAC|CUMMINS|STANDBY|GUARDIAN)/i,
            /(?:WILLIAMS|RINNAI|NAVIEN|BOSCH|VIESSMANN|BUDERUS|WEIL-MCLAIN|BURNHAM|CROWN|DUCANE)/i
        ];

        for (const pattern of brandPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.brand = match[0].toUpperCase();
                data.confidence += 25;
                break;
            }
        }

        // Model number patterns (enhanced)
        const modelPatterns = [
            /MODEL[:\s]*([A-Z0-9\-]{4,20})/i,
            /MOD[:\s]*([A-Z0-9\-]{4,20})/i,
            /M\/N[:\s]*([A-Z0-9\-]{4,20})/i,
            /MODEL NO[:\s]*([A-Z0-9\-]{4,20})/i
        ];

        for (const pattern of modelPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.model = match[1].trim();
                data.confidence += 30;
                break;
            }
        }

        // Serial number patterns
        const serialPatterns = [
            /SERIAL[:\s]*([A-Z0-9]{6,20})/i,
            /S\/N[:\s]*([A-Z0-9]{6,20})/i,
            /SER[:\s]*([A-Z0-9]{6,20})/i
        ];

        for (const pattern of serialPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.serial = match[1].trim();
                data.confidence += 20;
                break;
            }
        }

        // Electrical specifications
        const voltageMatch = text.match(/(\d{3})\s*V(?:OLTS?)?/i);
        if (voltageMatch) {
            data.electrical.voltage = voltageMatch[1] + 'V';
            data.confidence += 10;
        }

        const ampMatch = text.match(/(\d+\.?\d*)\s*(?:FLA|AMPS?|A)/i);
        if (ampMatch) {
            data.electrical.fla = ampMatch[1] + 'A';
            data.confidence += 10;
        }

        const mcaMatch = text.match(/MCA[:\s]*(\d+\.?\d*)/i);
        if (mcaMatch) {
            data.electrical.mca = mcaMatch[1] + 'A';
            data.confidence += 10;
        }

        // Gas input patterns
        const gasInputMatch = text.match(/(\d+,?\d*)\s*(?:BTU|BTUH|MBH)/i);
        if (gasInputMatch) {
            data.gas.input = gasInputMatch[1].replace(',', '') + ' BTU/h';
            data.confidence += 15;
        }

        // Gas type
        if (text.includes('NAT') || text.includes('NATURAL')) {
            data.gas.type = 'Natural Gas';
            data.confidence += 5;
        } else if (text.includes('LP') || text.includes('PROPANE')) {
            data.gas.type = 'LP/Propane';
            data.confidence += 5;
        }

        // Manufacturing date
        const yearMatch = text.match(/(?:MFG|MADE|DATE)[:\s]*.*?(\d{4})/i);
        if (yearMatch) {
            data.manufacturing = yearMatch[1];
            data.confidence += 10;
        }

        // Efficiency ratings
        const seerMatch = text.match(/(\d+\.?\d*)\s*SEER/i);
        if (seerMatch) {
            data.efficiency = seerMatch[1] + ' SEER';
            data.confidence += 10;
        }

        const afueMatch = text.match(/(\d+\.?\d*)\s*AFUE/i);
        if (afueMatch) {
            data.efficiency = seerMatch[1] + ' AFUE';
            data.confidence += 10;
        }

        return data;
    }

    /**
     * Image enhancement filters
     */
    enhanceContrast(imageData, factor) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));     // Red
            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // Green
            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // Blue
        }
    }

    adjustBrightness(imageData, adjustment) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] + adjustment));     // Red
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment)); // Green
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment)); // Blue
        }
    }

    reduceNoise(imageData) {
        // Simple noise reduction by averaging neighboring pixels
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const newData = new Uint8ClampedArray(data);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // Average with neighboring pixels
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nIdx = ((y + dy) * width + (x + dx)) * 4;
                            sum += data[nIdx + c];
                        }
                    }
                    newData[idx + c] = sum / 9;
                }
            }
        }

        for (let i = 0; i < data.length; i++) {
            data[i] = newData[i];
        }
    }
}

module.exports = { OCRProcessor };