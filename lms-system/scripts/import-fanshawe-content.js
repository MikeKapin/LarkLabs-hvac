import fs from 'fs/promises';
import path from 'path';
import { query } from '../config/database.js';

// Fanshawe College HVAC Content Import Script
class FanshaweContentImporter {
    constructor(contentPath) {
        this.contentPath = contentPath;
        this.importLog = [];
    }

    async importProgram() {
        try {
            console.log('Starting Fanshawe HVAC content import...');
            
            // Create Fanshawe-specific program
            const fanshaweProgram = await this.createFanshaweProgram();
            
            // Import CSA Units (1-24)
            await this.importCSAUnits(fanshaweProgram.id);
            
            // Import Refrigeration Units
            await this.importRefrigerationUnits(fanshaweProgram.id);
            
            // Import Assessments and Practicals
            await this.importAssessments(fanshaweProgram.id);
            
            // Generate import report
            await this.generateImportReport();
            
            console.log('Fanshawe content import completed successfully');
            return this.importLog;
            
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    }

    async createFanshaweProgram() {
        const program = await query(`
            INSERT INTO programs (name, code, description, duration_weeks, certification_authority)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (code) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [
            'Fanshawe College HVAC Program',
            'FANSHAWE_HVAC',
            'Comprehensive HVAC program covering gas systems (CSA B149.1-25), refrigeration, air conditioning, and building systems. Designed for college-level technical education.',
            32, // 2 academic years
            'Fanshawe College'
        ]);

        this.importLog.push(`✅ Created Fanshawe HVAC Program: ${program.rows[0].id}`);
        return program.rows[0];
    }

    async importCSAUnits(programId) {
        const csaUnits = [
            {
                unit_number: 1,
                title: 'Safety Fundamentals',
                description: 'Comprehensive workplace safety, government regulations, hazardous materials, and fire safety practices for gas technicians.',
                learning_objectives: [
                    'Apply comprehensive on-the-job safety measures',
                    'Navigate government acts and regulations',
                    'Handle hazardous materials safely',
                    'Implement fire safety practices'
                ],
                estimated_hours: 12,
                chapters: [
                    'On-the-job Safety Measures',
                    'Government Acts and Regulations', 
                    'Hazardous Materials',
                    'Fire Safety Practices'
                ]
            },
            {
                unit_number: 2,
                title: 'Fasteners, Tools and Testing Equipment',
                description: 'Essential tools, fasteners, and testing instruments for professional gas installation work.',
                learning_objectives: [
                    'Select and use appropriate fasteners',
                    'Operate specialized gas tools safely',
                    'Perform accurate testing and measurements',
                    'Maintain tools and equipment properly'
                ],
                estimated_hours: 10,
                chapters: [
                    'Fastening Systems',
                    'Hand and Power Tools',
                    'Testing Instruments',
                    'Tool Maintenance and Safety'
                ]
            },
            {
                unit_number: 3,
                title: 'Properties and Safe Handling of Fuel Gases',
                description: 'Physical and chemical properties of natural gas, propane, and other fuel gases with safe handling procedures.',
                learning_objectives: [
                    'Understand gas properties and characteristics',
                    'Apply safe gas handling procedures',
                    'Recognize gas hazards and risks',
                    'Implement proper storage and transport methods'
                ],
                estimated_hours: 14,
                chapters: [
                    'Natural Gas Properties',
                    'Propane and LPG Characteristics',
                    'Gas Hazards and Safety',
                    'Storage and Transportation'
                ]
            },
            {
                unit_number: 10,
                title: 'Advanced Piping and Tubing Systems',
                description: 'Complex piping systems, welding safety, utility piping, layout drawings, high-pressure systems, purging, and rigging.',
                learning_objectives: [
                    'Design and install complex piping systems',
                    'Apply welding safety and techniques',
                    'Size high-pressure piping systems',
                    'Perform large system purging procedures',
                    'Execute rigging and hoisting operations'
                ],
                estimated_hours: 20,
                chapters: [
                    'Code Requirements for Advanced Piping',
                    'Welding Safety and Techniques',
                    'Utility and Non-Utility Piping',
                    'Piping Layout and Drawings',
                    'High-Pressure System Sizing',
                    'Large System Purging',
                    'Rigging and Hoisting Safety'
                ]
            },
            {
                unit_number: 11,
                title: 'Pressure Regulators and Control Systems',
                description: 'Pressure regulation, overpressure protection, meters, and fuel containers for gas systems.',
                learning_objectives: [
                    'Install and adjust pressure regulators',
                    'Implement overpressure protection',
                    'Read and maintain gas meters',
                    'Handle fuel containers safely'
                ],
                estimated_hours: 16,
                chapters: [
                    'Pressure Regulators',
                    'Overpressure Protection',
                    'Gas Meters and Measurement',
                    'Fuel Containers and Storage'
                ]
            },
            {
                unit_number: 12,
                title: 'Basic Electricity for Gas-Fired Equipment',
                description: 'Electrical fundamentals specific to gas appliances including power supply, circuits, motors, and millivolt systems.',
                learning_objectives: [
                    'Understand power supply systems',
                    'Interpret electrical drawings',
                    'Use electrical measuring instruments',
                    'Troubleshoot electrical circuits',
                    'Work with millivolt systems',
                    'Service electric motors'
                ],
                estimated_hours: 18,
                chapters: [
                    'Power Supply Systems',
                    'Electrical Drawing Interpretation',
                    'Measuring and Test Instruments',
                    'Circuits and Hardware',
                    'Millivolt Systems',
                    'Motors and Motor Controls'
                ]
            }
        ];

        for (let i = 0; i < csaUnits.length; i++) {
            const unit = csaUnits[i];
            
            // Create unit
            const unitResult = await query(`
                INSERT INTO units (program_id, unit_number, title, description, learning_objectives, estimated_hours, order_index)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (program_id, unit_number) DO UPDATE SET
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    learning_objectives = EXCLUDED.learning_objectives,
                    estimated_hours = EXCLUDED.estimated_hours
                RETURNING *
            `, [programId, unit.unit_number, unit.title, unit.description, unit.learning_objectives, unit.estimated_hours, i + 1]);

            const unitId = unitResult.rows[0].id;
            
            // Create chapters for this unit
            for (let j = 0; j < unit.chapters.length; j++) {
                await query(`
                    INSERT INTO chapters (unit_id, chapter_number, title, estimated_minutes, order_index)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (unit_id, chapter_number) DO UPDATE SET
                        title = EXCLUDED.title,
                        estimated_minutes = EXCLUDED.estimated_minutes
                `, [unitId, j + 1, unit.chapters[j], Math.round((unit.estimated_hours * 60) / unit.chapters.length), j + 1]);
            }

            this.importLog.push(`✅ Imported Unit ${unit.unit_number}: ${unit.title} with ${unit.chapters.length} chapters`);
        }
    }

    async importRefrigerationUnits(programId) {
        // Create refrigeration/HVAC track
        const refrigerationUnits = [
            {
                unit_number: 101,
                title: 'Fundamentals of Thermodynamics',
                description: 'Heat, temperature, pressure, matter, and energy principles for HVAC systems.',
                learning_objectives: [
                    'Understand heat transfer principles',
                    'Apply temperature and pressure relationships',
                    'Analyze matter and energy states',
                    'Calculate thermodynamic properties'
                ],
                estimated_hours: 15,
                chapters: [
                    'Heat, Temperature and Pressure',
                    'Matter and Energy',
                    'Refrigeration and Refrigerants',
                    'General Safety Practices'
                ]
            },
            {
                unit_number: 102,
                title: 'Tools, Equipment and System Procedures',
                description: 'Professional tools, fasteners, piping, leak detection, and system maintenance procedures.',
                learning_objectives: [
                    'Select and use HVAC tools properly',
                    'Install piping and tubing systems',
                    'Perform leak detection and system evacuation',
                    'Execute system charging procedures'
                ],
                estimated_hours: 20,
                chapters: [
                    'Tools and Equipment',
                    'Fasteners and Hardware',
                    'Tubing and Piping Systems',
                    'Leak Detection and System Evacuation',
                    'Refrigerant Chemistry and Management',
                    'System Charging Procedures'
                ]
            },
            {
                unit_number: 103,
                title: 'Refrigeration System Components',
                description: 'Evaporators, condensers, compressors, expansion devices, and specialized components.',
                learning_objectives: [
                    'Analyze evaporator performance',
                    'Size and select condensers',
                    'Troubleshoot compressor systems',
                    'Configure expansion devices'
                ],
                estimated_hours: 25,
                chapters: [
                    'Evaporators and Refrigeration Systems',
                    'Condensers and Heat Rejection',
                    'Compressors and Compression',
                    'Expansion Devices and Control'
                ]
            }
        ];

        for (let i = 0; i < refrigerationUnits.length; i++) {
            const unit = refrigerationUnits[i];
            
            const unitResult = await query(`
                INSERT INTO units (program_id, unit_number, title, description, learning_objectives, estimated_hours, order_index)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (program_id, unit_number) DO UPDATE SET
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    learning_objectives = EXCLUDED.learning_objectives,
                    estimated_hours = EXCLUDED.estimated_hours
                RETURNING *
            `, [programId, unit.unit_number, unit.title, unit.description, unit.learning_objectives, unit.estimated_hours, i + 20]);

            const unitId = unitResult.rows[0].id;
            
            for (let j = 0; j < unit.chapters.length; j++) {
                await query(`
                    INSERT INTO chapters (unit_id, chapter_number, title, estimated_minutes, order_index)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (unit_id, chapter_number) DO UPDATE SET
                        title = EXCLUDED.title
                `, [unitId, j + 1, unit.chapters[j], Math.round((unit.estimated_hours * 60) / unit.chapters.length), j + 1]);
            }

            this.importLog.push(`✅ Imported Refrigeration Unit ${unit.unit_number}: ${unit.title}`);
        }
    }

    async importAssessments(programId) {
        // Create sample assessment templates based on Fanshawe structure
        const assessmentTemplates = [
            {
                title: 'Unit 1 Safety Final Exam',
                type: 'exam',
                unit_number: 1,
                max_points: 100,
                time_limit: 120,
                question_types: ['multiple_choice', 'true_false', 'short_answer']
            },
            {
                title: 'Unit 10 Advanced Piping Midterm',
                type: 'exam',
                unit_number: 10,
                max_points: 75,
                time_limit: 90,
                question_types: ['multiple_choice', 'practical_application']
            },
            {
                title: 'Final Practical - G2L2 Level',
                type: 'practical',
                unit_number: 10,
                max_points: 150,
                time_limit: 180,
                question_types: ['hands_on', 'troubleshooting']
            }
        ];

        for (const template of assessmentTemplates) {
            // Find the corresponding unit
            const unit = await query(`
                SELECT id FROM units 
                WHERE program_id = $1 AND unit_number = $2
            `, [programId, template.unit_number]);

            if (unit.rows.length > 0) {
                this.importLog.push(`📝 Assessment template ready: ${template.title}`);
            }
        }
    }

    async generateImportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalUnits: this.importLog.filter(log => log.includes('Imported Unit')).length,
                totalAssessments: this.importLog.filter(log => log.includes('Assessment')).length,
                programType: 'Fanshawe College HVAC'
            },
            log: this.importLog
        };

        await fs.writeFile(
            path.join(this.contentPath, '../fanshawe-import-report.json'),
            JSON.stringify(report, null, 2)
        );

        return report;
    }
}

// Content mapping configuration for Fanshawe structure
export const fanshaweContentMap = {
    csaUnits: {
        'Unit 1 - Safety': {
            chapters: ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4'],
            assessments: ['Final Exam', 'Chapter Reviews'],
            practicals: ['Safety Procedures Lab']
        },
        'Unit 10 - Advanced Piping': {
            chapters: ['Code Requirements', 'Welding Safety', 'Utility Piping', 'Layout Drawings', 'High-Pressure Sizing', 'Purging', 'Rigging'],
            assessments: ['Midterm', 'Final Exam'],
            practicals: ['Design Project', 'Purging Practical']
        },
        'Unit 11 - Pressure Regulators': {
            chapters: ['Pressure Regulators', 'Overpressure Protection', 'Meters', 'Fuel Containers'],
            assessments: ['Midterm', 'Final Exam'],
            practicals: ['Regulator Lab 1', 'Regulator Lab 2']
        },
        'Unit 12 - Basic Electricity': {
            chapters: ['Power Supply', 'Electrical Drawings', 'Test Instruments', 'Circuits', 'Millivolt Systems', 'Motors'],
            assessments: ['Electrical Final Exam', 'Practical Exam'],
            practicals: ['Electrical Safety Lab']
        }
    },
    refrigerationUnits: {
        'Unit 1-10': 'Fundamentals and Tools',
        'Unit 11-14': 'System Components', 
        'Unit 15-29': 'Applications and Troubleshooting',
        'Unit 30-44': 'Advanced Systems',
        'Unit 45-50': 'Specialized Applications'
    }
};

// College-specific grading rubrics
export const fanshaweGradingRubrics = {
    letterGradeScale: {
        'A+': { min: 90, max: 100 },
        'A': { min: 85, max: 89 },
        'A-': { min: 80, max: 84 },
        'B+': { min: 77, max: 79 },
        'B': { min: 73, max: 76 },
        'B-': { min: 70, max: 72 },
        'C+': { min: 67, max: 69 },
        'C': { min: 63, max: 66 },
        'C-': { min: 60, max: 62 },
        'D': { min: 50, max: 59 },
        'F': { min: 0, max: 49 }
    },
    practicalAssessments: {
        'safety_compliance': { weight: 40, description: 'Safety procedures and compliance' },
        'technical_accuracy': { weight: 35, description: 'Technical execution and accuracy' },
        'professionalism': { weight: 15, description: 'Professional conduct and communication' },
        'efficiency': { weight: 10, description: 'Time management and efficiency' }
    },
    certificationRequirements: {
        'minimum_grade': 70,
        'attendance_requirement': 80,
        'practical_completion': 100,
        'safety_certification': true
    }
};

// Export for use in main application
export default FanshaweContentImporter;