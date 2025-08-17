// netlify/functions/multi-photo-analysis.js
// Advanced multi-photo composite analysis for complete equipment profiling

const { OCRProcessor } = require('./ocr-processor');
const { ComprehensiveEquipmentDatabase } = require('./equipment-database');

class MultiPhotoAnalyzer {
    constructor() {
        this.maxPhotos = 5;
        this.analysisTimeout = 60000; // 60 seconds
        this.confidenceThreshold = 0.8;
    }

    /**
     * Analyze multiple photos for comprehensive equipment profiling
     */
    async analyzeMultiplePhotos(photos, mode = 'technician') {
        const startTime = Date.now();
        const sessionId = `multi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`📸 Multi-photo analysis started - Session: ${sessionId}`);
        console.log(`Photos received: ${photos.length}`);

        try {
            // Validate input
            if (!photos || photos.length === 0) {
                throw new Error('No photos provided');
            }

            if (photos.length > this.maxPhotos) {
                throw new Error(`Too many photos. Maximum ${this.maxPhotos} allowed`);
            }

            // Classify and analyze each photo
            const photoAnalyses = await this.classifyAndAnalyzePhotos(photos, mode);
            
            // Combine results into comprehensive profile
            const compositeProfile = await this.createCompositeProfile(photoAnalyses, mode);
            
            // Validate and cross-reference data
            const validatedProfile = await this.validateCompositeData(compositeProfile);
            
            // Generate comprehensive report
            const comprehensiveReport = await this.generateComprehensiveReport(
                validatedProfile, 
                photoAnalyses, 
                mode
            );

            const responseTime = (Date.now() - startTime) / 1000;
            console.log(`✅ Multi-photo analysis completed in ${responseTime}s`);

            return {
                success: true,
                sessionId: sessionId,
                photoCount: photos.length,
                compositeProfile: validatedProfile,
                comprehensiveReport: comprehensiveReport,
                individualAnalyses: photoAnalyses,
                responseTime: responseTime,
                mode: mode,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Multi-photo analysis error:', error);
            return {
                success: false,
                error: error.message,
                sessionId: sessionId,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Classify photos by type and analyze each
     */
    async classifyAndAnalyzePhotos(photos, mode) {
        const analyses = [];
        const ocrProcessor = new OCRProcessor();

        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            console.log(`🔍 Analyzing photo ${i + 1}/${photos.length}`);

            try {
                // Step 1: Classify photo type
                const photoType = await this.classifyPhotoType(photo.imageData);
                
                // Step 2: Extract text with OCR
                const ocrResult = await ocrProcessor.extractText(photo.imageData);
                
                // Step 3: Perform specialized analysis based on type
                const specializedAnalysis = await this.performSpecializedAnalysis(
                    photo.imageData, 
                    photoType, 
                    ocrResult, 
                    mode
                );

                analyses.push({
                    photoIndex: i,
                    photoType: photoType,
                    ocrResult: ocrResult,
                    analysis: specializedAnalysis,
                    confidence: this.calculatePhotoConfidence(ocrResult, specializedAnalysis),
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.warn(`⚠️ Failed to analyze photo ${i + 1}:`, error);
                analyses.push({
                    photoIndex: i,
                    photoType: 'unknown',
                    error: error.message,
                    confidence: 0
                });
            }
        }

        return analyses;
    }

    /**
     * Classify photo type using Claude Vision
     */
    async classifyPhotoType(imageData) {
        const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error('Claude API key not configured');

        const fetch = (await import('node-fetch')).default;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 200,
                temperature: 0.1,
                system: "You are an HVAC equipment photo classifier. Classify this photo into ONE of these categories: RATING_PLATE, WIRING_DIAGRAM, INSTALLATION_VIEW, COMPONENT_CLOSEUP, ERROR_DISPLAY, or OTHER. Respond with just the category name.",
                messages: [{
                    role: "user",
                    content: [{
                        type: "text",
                        text: "Classify this HVAC equipment photo. What type of photo is this?"
                    }, {
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: "image/jpeg",
                            data: imageData
                        }
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Photo classification failed: ${response.status}`);
        }

        const data = await response.json();
        const classification = data.content[0].text.trim().toUpperCase();
        
        const validTypes = ['RATING_PLATE', 'WIRING_DIAGRAM', 'INSTALLATION_VIEW', 'COMPONENT_CLOSEUP', 'ERROR_DISPLAY', 'OTHER'];
        return validTypes.includes(classification) ? classification : 'OTHER';
    }

    /**
     * Perform specialized analysis based on photo type
     */
    async performSpecializedAnalysis(imageData, photoType, ocrResult, mode) {
        const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
        const fetch = (await import('node-fetch')).default;

        // Create specialized prompts based on photo type
        const prompt = this.createSpecializedPrompt(photoType, mode, ocrResult);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 2000,
                temperature: 0.05,
                system: prompt.system,
                messages: [{
                    role: "user",
                    content: [{
                        type: "text",
                        text: prompt.userPrompt
                    }, {
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: "image/jpeg",
                            data: imageData
                        }
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Specialized analysis failed: ${response.status}`);
        }

        const data = await response.json();
        return {
            type: photoType,
            analysis: data.content[0].text,
            extractedData: this.extractSpecializedData(data.content[0].text, photoType)
        };
    }

    /**
     * Create specialized prompts for different photo types
     */
    createSpecializedPrompt(photoType, mode, ocrResult) {
        const prompts = {
            RATING_PLATE: {
                system: "You are analyzing an HVAC equipment rating plate. Extract ALL technical specifications with maximum precision.",
                userPrompt: `Analyze this rating plate photo. Extract every technical detail visible.${ocrResult?.success ? `\n\nOCR TEXT: ${ocrResult.extractedText}` : ''}`
            },
            
            WIRING_DIAGRAM: {
                system: "You are analyzing an HVAC wiring diagram. Identify connections, components, and electrical specifications.",
                userPrompt: "Analyze this wiring diagram. Identify all components, wire colors, connections, and electrical specifications."
            },
            
            INSTALLATION_VIEW: {
                system: "You are analyzing an HVAC installation photo for code compliance and safety.",
                userPrompt: "Analyze this installation photo. Check for code compliance, clearances, venting, and safety issues."
            },
            
            COMPONENT_CLOSEUP: {
                system: "You are analyzing a specific HVAC component. Identify the component and any visible specifications or part numbers.",
                userPrompt: `Analyze this component photo. Identify the component type, part numbers, and specifications.${ocrResult?.success ? `\n\nOCR TEXT: ${ocrResult.extractedText}` : ''}`
            },
            
            ERROR_DISPLAY: {
                system: "You are analyzing an HVAC error display or diagnostic screen. Extract error codes and status information.",
                userPrompt: `Analyze this error display. Extract all error codes, status messages, and diagnostic information.${ocrResult?.success ? `\n\nOCR TEXT: ${ocrResult.extractedText}` : ''}`
            },
            
            OTHER: {
                system: "You are analyzing an HVAC-related photo. Describe what you see and extract any useful technical information.",
                userPrompt: "Analyze this HVAC photo and extract any useful technical information or identify what type of equipment/component this shows."
            }
        };

        return prompts[photoType] || prompts.OTHER;
    }

    /**
     * Extract specialized data based on photo type
     */
    extractSpecializedData(analysisText, photoType) {
        const extractors = {
            RATING_PLATE: this.extractRatingPlateData,
            WIRING_DIAGRAM: this.extractWiringData,
            INSTALLATION_VIEW: this.extractInstallationData,
            COMPONENT_CLOSEUP: this.extractComponentData,
            ERROR_DISPLAY: this.extractErrorData
        };

        const extractor = extractors[photoType];
        return extractor ? extractor(analysisText) : { type: photoType, data: analysisText };
    }

    extractRatingPlateData(text) {
        // Enhanced rating plate extraction
        const data = {
            equipment: {},
            electrical: {},
            gas: {},
            refrigeration: {},
            certification: {}
        };

        // Extract equipment info
        const brandMatch = text.match(/(?:BRAND|MANUFACTURER)[:\s]*([A-Za-z\s]+)/i);
        if (brandMatch) data.equipment.brand = brandMatch[1].trim();

        const modelMatch = text.match(/(?:MODEL|M\/N)[:\s]*([A-Z0-9\-]+)/i);
        if (modelMatch) data.equipment.model = modelMatch[1].trim();

        const serialMatch = text.match(/(?:SERIAL|S\/N)[:\s]*([A-Z0-9]+)/i);
        if (serialMatch) data.equipment.serial = serialMatch[1].trim();

        // Extract electrical specs
        const voltageMatch = text.match(/(\d{3})\s*V/i);
        if (voltageMatch) data.electrical.voltage = voltageMatch[1] + 'V';

        const flaMatch = text.match(/FLA[:\s]*(\d+\.?\d*)/i);
        if (flaMatch) data.electrical.fla = flaMatch[1] + 'A';

        return data;
    }

    extractWiringData(text) {
        return {
            components: this.extractComponents(text),
            wireColors: this.extractWireColors(text),
            voltages: this.extractVoltages(text),
            connections: this.extractConnections(text)
        };
    }

    extractInstallationData(text) {
        return {
            clearances: this.extractClearances(text),
            venting: this.extractVentingInfo(text),
            codeCompliance: this.checkCodeCompliance(text),
            safetyIssues: this.identifySafetyIssues(text)
        };
    }

    extractComponentData(text) {
        return {
            componentType: this.identifyComponent(text),
            partNumbers: this.extractPartNumbers(text),
            specifications: this.extractComponentSpecs(text)
        };
    }

    extractErrorData(text) {
        return {
            errorCodes: this.extractErrorCodes(text),
            statusMessages: this.extractStatusMessages(text),
            diagnosticInfo: this.extractDiagnosticInfo(text)
        };
    }

    /**
     * Create composite profile from multiple photo analyses
     */
    async createCompositeProfile(photoAnalyses, mode) {
        const profile = {
            equipment: {
                brand: null,
                model: null,
                serial: null,
                type: null,
                confidence: 0
            },
            specifications: {},
            installation: {},
            components: [],
            issues: [],
            confidence: 0
        };

        // Aggregate data from all photos
        for (const analysis of photoAnalyses) {
            if (analysis.error) continue;

            // Merge equipment data with confidence weighting
            this.mergeEquipmentData(profile.equipment, analysis, 0.3);
            
            // Add specialized data
            this.addSpecializedData(profile, analysis);
        }

        // Calculate overall confidence
        profile.confidence = this.calculateOverallConfidence(photoAnalyses);

        return profile;
    }

    mergeEquipmentData(equipment, analysis, weight) {
        const extracted = analysis.analysis?.extractedData;
        if (!extracted) return;

        // Brand consolidation
        if (extracted.equipment?.brand && !equipment.brand) {
            equipment.brand = extracted.equipment.brand;
            equipment.confidence += 25 * weight;
        }

        // Model consolidation  
        if (extracted.equipment?.model && !equipment.model) {
            equipment.model = extracted.equipment.model;
            equipment.confidence += 30 * weight;
        }

        // Serial consolidation
        if (extracted.equipment?.serial && !equipment.serial) {
            equipment.serial = extracted.equipment.serial;
            equipment.confidence += 20 * weight;
        }
    }

    addSpecializedData(profile, analysis) {
        const type = analysis.photoType;
        const data = analysis.analysis?.extractedData;

        switch (type) {
            case 'WIRING_DIAGRAM':
                profile.wiring = data;
                break;
            case 'INSTALLATION_VIEW':
                profile.installation = { ...profile.installation, ...data };
                break;
            case 'COMPONENT_CLOSEUP':
                profile.components.push(data);
                break;
            case 'ERROR_DISPLAY':
                profile.issues.push(data);
                break;
        }
    }

    /**
     * Validate composite data against equipment database
     */
    async validateCompositeData(profile) {
        if (!profile.equipment.brand || !profile.equipment.model) {
            return profile;
        }

        try {
            const equipmentDB = new ComprehensiveEquipmentDatabase();
            const lookup = await equipmentDB.comprehensiveLookup(
                profile.equipment.brand,
                profile.equipment.model,
                profile.equipment.serial
            );

            if (lookup.success) {
                // Cross-validate specifications
                profile.validated = true;
                profile.databaseMatch = lookup;
                profile.confidence += 15;
                
                // Flag any inconsistencies
                profile.inconsistencies = this.findInconsistencies(profile, lookup);
            }

        } catch (error) {
            console.warn('Database validation error:', error);
        }

        return profile;
    }

    findInconsistencies(profile, databaseLookup) {
        const inconsistencies = [];

        // Check specifications against database
        const dbSpecs = databaseLookup.specifications;
        if (dbSpecs) {
            // Voltage consistency
            if (profile.specifications?.voltage && dbSpecs.electrical?.voltage) {
                if (!profile.specifications.voltage.includes(dbSpecs.electrical.voltage)) {
                    inconsistencies.push({
                        field: 'voltage',
                        photo: profile.specifications.voltage,
                        database: dbSpecs.electrical.voltage,
                        severity: 'medium'
                    });
                }
            }
        }

        return inconsistencies;
    }

    /**
     * Generate comprehensive multi-photo report
     */
    async generateComprehensiveReport(profile, analyses, mode) {
        const report = {
            executiveSummary: this.generateExecutiveSummary(profile, analyses, mode),
            equipmentProfile: this.generateEquipmentProfile(profile),
            analysisBreakdown: this.generateAnalysisBreakdown(analyses),
            recommendations: this.generateRecommendations(profile, mode),
            nextSteps: this.generateNextSteps(profile, mode)
        };

        return report;
    }

    generateExecutiveSummary(profile, analyses, mode) {
        const photoCount = analyses.filter(a => !a.error).length;
        const equipment = profile.equipment;
        
        let summary = `## 📊 Multi-Photo Analysis Complete\n\n`;
        summary += `**Equipment Identified:** ${equipment.brand || 'Unknown'} ${equipment.model || 'Unknown'}\n`;
        summary += `**Photos Analyzed:** ${photoCount} photos processed\n`;
        summary += `**Overall Confidence:** ${profile.confidence.toFixed(1)}%\n`;
        summary += `**Database Match:** ${profile.validated ? '✅ Verified' : '⚠️ Partial'}\n\n`;

        if (mode === 'technician') {
            summary += `**Professional Analysis Summary:**\n`;
            summary += `• Complete technical specifications extracted\n`;
            summary += `• Installation compliance reviewed\n`;
            summary += `• Component condition assessed\n`;
            summary += `• Diagnostic data compiled\n\n`;
        } else {
            summary += `**Homeowner Summary:**\n`;
            summary += `• Equipment fully identified and verified\n`;
            summary += `• Safety status checked\n`;
            summary += `• Maintenance recommendations provided\n`;
            summary += `• Professional service needs identified\n\n`;
        }

        return summary;
    }

    generateEquipmentProfile(profile) {
        return {
            basic: {
                brand: profile.equipment.brand,
                model: profile.equipment.model,
                serial: profile.equipment.serial,
                type: profile.equipment.type
            },
            validated: profile.validated,
            confidence: profile.confidence,
            specifications: profile.specifications || {},
            components: profile.components || [],
            installation: profile.installation || {}
        };
    }

    generateAnalysisBreakdown(analyses) {
        return analyses.map(analysis => ({
            photoType: analysis.photoType,
            confidence: analysis.confidence,
            keyFindings: this.extractKeyFindings(analysis),
            dataExtracted: !!analysis.analysis?.extractedData
        }));
    }

    generateRecommendations(profile, mode) {
        const recommendations = [];

        if (profile.confidence < 80) {
            recommendations.push({
                type: 'data_quality',
                message: 'Consider taking additional photos for higher confidence analysis',
                priority: 'medium'
            });
        }

        if (profile.issues?.length > 0) {
            recommendations.push({
                type: 'issues_found',
                message: 'Error codes or issues detected - professional diagnosis recommended',
                priority: 'high'
            });
        }

        if (profile.installation && mode === 'technician') {
            recommendations.push({
                type: 'installation',
                message: 'Review installation compliance with local codes',
                priority: 'medium'
            });
        }

        return recommendations;
    }

    generateNextSteps(profile, mode) {
        const steps = [];

        if (mode === 'technician') {
            steps.push('Download service manuals and wiring diagrams');
            steps.push('Perform detailed diagnostic testing');
            steps.push('Document findings in service report');
        } else {
            steps.push('Contact qualified HVAC professional if issues found');
            steps.push('Schedule annual maintenance if due');
            steps.push('Register equipment for warranty if not already done');
        }

        return steps;
    }

    // Helper methods
    calculatePhotoConfidence(ocrResult, analysis) {
        let confidence = 0;
        
        if (ocrResult?.success) confidence += ocrResult.confidence * 0.3;
        if (analysis?.extractedData) confidence += 50;
        
        return Math.min(100, confidence);
    }

    calculateOverallConfidence(analyses) {
        const validAnalyses = analyses.filter(a => !a.error);
        if (validAnalyses.length === 0) return 0;

        const avgConfidence = validAnalyses.reduce((sum, a) => sum + a.confidence, 0) / validAnalyses.length;
        const completenessBonus = validAnalyses.length * 10; // Bonus for multiple photos
        
        return Math.min(100, avgConfidence + completenessBonus);
    }

    extractKeyFindings(analysis) {
        // Extract 3-5 key findings from analysis
        const text = analysis.analysis?.analysis || '';
        const lines = text.split('\n').filter(line => line.trim().length > 20);
        return lines.slice(0, 5);
    }

    // Specialized extraction methods (simplified implementations)
    extractComponents(text) {
        const components = [];
        const componentMatches = text.matchAll(/(?:capacitor|contactor|relay|transformer|motor)/gi);
        for (const match of componentMatches) {
            components.push(match[0]);
        }
        return [...new Set(components)];
    }

    extractWireColors(text) {
        const colors = [];
        const colorMatches = text.matchAll(/(?:red|black|white|blue|yellow|green|orange|brown|purple)\s*wire/gi);
        for (const match of colorMatches) {
            colors.push(match[0]);
        }
        return [...new Set(colors)];
    }

    extractVoltages(text) {
        const voltages = [];
        const voltageMatches = text.matchAll(/(\d+)\s*(?:volt|v)\b/gi);
        for (const match of voltageMatches) {
            voltages.push(match[1] + 'V');
        }
        return [...new Set(voltages)];
    }

    extractConnections(text) {
        // Extract connection information
        return text.match(/(?:terminal|connection|wire)\s+\w+/gi) || [];
    }

    extractClearances(text) {
        const clearances = [];
        const clearanceMatches = text.matchAll(/(\d+)\s*(?:inch|in|foot|ft|mm|cm)/gi);
        for (const match of clearanceMatches) {
            clearances.push(`${match[1]}${match[2]}`);
        }
        return clearances;
    }

    extractVentingInfo(text) {
        const ventingKeywords = ['vent', 'flue', 'exhaust', 'intake', 'combustion air'];
        const findings = [];
        
        ventingKeywords.forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                findings.push(keyword);
            }
        });
        
        return findings;
    }

    checkCodeCompliance(text) {
        const codeIssues = [];
        
        if (text.toLowerCase().includes('clearance') && text.toLowerCase().includes('insufficient')) {
            codeIssues.push('Insufficient clearances detected');
        }
        
        return codeIssues;
    }

    identifySafetyIssues(text) {
        const safetyKeywords = ['leak', 'damage', 'corrosion', 'blocked', 'obstruction'];
        const issues = [];
        
        safetyKeywords.forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                issues.push(`Potential ${keyword} detected`);
            }
        });
        
        return issues;
    }

    identifyComponent(text) {
        const components = ['capacitor', 'contactor', 'relay', 'transformer', 'motor', 'valve', 'sensor'];
        
        for (const component of components) {
            if (text.toLowerCase().includes(component)) {
                return component;
            }
        }
        
        return 'unknown';
    }

    extractPartNumbers(text) {
        const partMatches = text.matchAll(/(?:P\/N|PART|MODEL)[:\s]*([A-Z0-9\-]{4,20})/gi);
        const parts = [];
        
        for (const match of partMatches) {
            parts.push(match[1]);
        }
        
        return [...new Set(parts)];
    }

    extractComponentSpecs(text) {
        // Extract component specifications
        const specs = {};
        
        const capacitorMatch = text.match(/(\d+\.?\d*)\s*(?:MFD|µF)/i);
        if (capacitorMatch) specs.capacitance = capacitorMatch[1] + 'MFD';
        
        const voltageMatch = text.match(/(\d+)\s*V(?:AC|DC)?/i);
        if (voltageMatch) specs.voltage = voltageMatch[1] + 'V';
        
        return specs;
    }

    extractErrorCodes(text) {
        const codes = [];
        const codeMatches = text.matchAll(/(?:ERROR|CODE|FAULT)[:\s]*([A-Z0-9]{1,10})/gi);
        
        for (const match of codeMatches) {
            codes.push(match[1]);
        }
        
        return [...new Set(codes)];
    }

    extractStatusMessages(text) {
        // Extract status messages from display
        const statusPatterns = [
            /STATUS[:\s]*([^\n\r]+)/i,
            /READY|RUNNING|FAULT|ERROR|WARNING/gi
        ];
        
        const messages = [];
        statusPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                messages.push(match[0]);
            }
        });
        
        return [...new Set(messages)];
    }

    extractDiagnosticInfo(text) {
        // Extract diagnostic information
        return {
            pressures: text.match(/(\d+\.?\d*)\s*(?:PSI|KPA)/gi) || [],
            temperatures: text.match(/(\d+\.?\d*)\s*(?:°F|°C|F|C)/gi) || [],
            voltages: text.match(/(\d+\.?\d*)\s*V(?:AC|DC)?/gi) || []
        };
    }
}

// Export handler
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod === 'POST') {
        try {
            const { photos, mode = 'technician' } = JSON.parse(event.body);
            
            const analyzer = new MultiPhotoAnalyzer();
            const result = await analyzer.analyzeMultiplePhotos(photos, mode);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result)
            };
            
        } catch (error) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: error.message
                })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};

module.exports = { MultiPhotoAnalyzer };