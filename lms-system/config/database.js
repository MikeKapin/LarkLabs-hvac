import pg from 'pg';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Database query helper
export async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('Query executed:', { text: text.substring(0, 100), duration, rows: res.rowCount });
        }
        
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Initialize database with schema
export async function initializeDatabase() {
    try {
        // Check if database is already initialized
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        `);

        if (tableCheck.rows[0].exists) {
            console.log('Database already initialized');
            return;
        }

        console.log('Initializing database schema...');
        
        // Read and execute schema file
        const schemaPath = join(__dirname, '../database-schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        await pool.query(schema);
        
        // Seed initial data
        await seedInitialData();
        
        console.log('Database initialized successfully');
        
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

// Seed initial data for G2/G3 programs
async function seedInitialData() {
    try {
        console.log('Seeding initial program data...');

        // Insert G3 units
        const g3Units = [
            { unit_number: 1, title: 'Safety Fundamentals', description: 'Workplace safety, hazard identification, and emergency procedures', learning_objectives: ['Identify workplace hazards', 'Apply safety procedures', 'Use PPE correctly'], estimated_hours: 8, content_file: 'CSA_Unit_1_Safety_Chapter_Reviews.html', pdf_file: 'training/g3/G3/CSA_Unit_1_Safety.pdf' },
            { unit_number: 2, title: 'Tools and Test Equipment', description: 'Fasteners, tools, and testing equipment for gas installations', learning_objectives: ['Select appropriate tools', 'Use test equipment safely', 'Maintain equipment properly'], estimated_hours: 6, content_file: 'CSA_Unit_2_Chapter_Reviews.html', pdf_file: 'training/g3/G3/CSA_Unit_2_Fasteners_Tools_and_Test_Equipment.pdf' },
            { unit_number: 3, title: 'Properties and Safe Handling of Fuel Gases', description: 'Gas properties, storage, and safe handling procedures', learning_objectives: ['Understand gas properties', 'Handle gases safely', 'Recognize gas hazards'], estimated_hours: 8, content_file: 'CSA_Unit_3_Chapter_Reviews.html', pdf_file: 'training/g3/G3/CSA_Unit_3_Properties_and_Safe_Handling_of_Fuel_Gases.pdf' },
            { unit_number: 4, title: 'Gas Industry Codes, Acts and Regulations', description: 'Overview of codes, acts, and regulations governing gas work', learning_objectives: ['Navigate code requirements', 'Understand regulations', 'Apply compliance measures'], estimated_hours: 10, content_file: 'CSA_Unit_4_&_4a_Chapter_Reviews.html', pdf_file: 'training/g3/G3/CSA_Unit_4_Gas-Industry-Codes-Acts-and-Regulations.pdf' },
            { unit_number: 5, title: 'Basic Electricity', description: 'Electrical fundamentals for gas appliance technicians', learning_objectives: ['Understand electrical circuits', 'Use electrical tools safely', 'Troubleshoot electrical issues'], estimated_hours: 12, content_file: 'CSA_Unit_5_Basic_Electricity_Chapter_Reviews.html', pdf_file: 'training/g3/G3/CSA_Unit_5_Basic_Electricity.pdf' },
            { unit_number: 6, title: 'Technical Manuals, Specifications and Drawings', description: 'Reading technical documentation and specifications', learning_objectives: ['Read technical drawings', 'Interpret specifications', 'Use manufacturer manuals'], estimated_hours: 6, content_file: 'CSA_Unit_6_Technical_Drawing_Manuals_Graphs_Reviews.html', pdf_file: 'training/g3/G3/CSA_Unit_6_Technical_Manuals_Specs_Drawings.pdf' },
            { unit_number: 7, title: 'Customer Relations', description: 'Professional customer interaction and communication', learning_objectives: ['Communicate professionally', 'Handle customer concerns', 'Provide quality service'], estimated_hours: 4, content_file: 'CSA_Unit_7_Customer_Relations_Chapter_Reviews.html', pdf_file: 'training/g3/G3/CSA_Unit_7_Customer_Relations.pdf' },
            { unit_number: 8, title: 'Introduction to Piping and Tubing Systems', description: 'Gas piping systems, materials, and installation basics', learning_objectives: ['Select piping materials', 'Install piping systems', 'Test for leaks'], estimated_hours: 10, content_file: 'CSA_Unit_8_Intro_to_Piping_Reviews.html', pdf_file: 'training/g3/G3/CSA_Unit_8_Intro_to_Piping_and_Tubing_Systems.pdf' },
            { unit_number: 9, title: 'Introduction to Gas Appliances', description: 'Basic gas appliance types, operation, and maintenance', learning_objectives: ['Identify appliance types', 'Understand operation principles', 'Perform basic maintenance'], estimated_hours: 8, content_file: 'CSA_Unit_9_Intro_to_Gas_Appliances_Reviews.html', pdf_file: 'training/g3/G3/CSA_Unit_9_Intro_to_Gas_Appliances.pdf' }
        ];

        // Get G3 program ID
        const g3Program = await query("SELECT id FROM programs WHERE code = 'G3'");
        const g3ProgramId = g3Program.rows[0].id;

        // Insert G3 units
        for (let i = 0; i < g3Units.length; i++) {
            const unit = g3Units[i];
            await query(`
                INSERT INTO units (program_id, unit_number, title, description, learning_objectives, estimated_hours, order_index, content_file_path, pdf_file_path)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (program_id, unit_number) DO NOTHING
            `, [g3ProgramId, unit.unit_number, unit.title, unit.description, unit.learning_objectives, unit.estimated_hours, i + 1, unit.content_file, unit.pdf_file]);
        }

        // Insert G2 units (abbreviated for space)
        const g2Program = await query("SELECT id FROM programs WHERE code = 'G2'");
        const g2ProgramId = g2Program.rows[0].id;

        const g2Units = [
            { unit_number: 10, title: 'Advanced Piping Systems', estimated_hours: 15 },
            { unit_number: 11, title: 'Pressure Regulators', estimated_hours: 10 },
            { unit_number: 12, title: 'Basic Electricity for Gas Fired Appliances', estimated_hours: 12 },
            { unit_number: 13, title: 'Controls', estimated_hours: 14 },
            { unit_number: 14, title: 'The Building as a System', estimated_hours: 8 },
            { unit_number: 15, title: 'Domestic Appliances', estimated_hours: 12 },
            { unit_number: 16, title: 'Gas Fired Refrigerators', estimated_hours: 6 },
            { unit_number: 17, title: 'Conversion Burners', estimated_hours: 8 },
            { unit_number: 18, title: 'Water Heaters and Combination Systems', estimated_hours: 10 },
            { unit_number: 19, title: 'Forced Warm Air Appliances', estimated_hours: 14 },
            { unit_number: 20, title: 'Hydronic Heating Systems', estimated_hours: 12 },
            { unit_number: 21, title: 'Space Heaters and Fireplaces', estimated_hours: 10 },
            { unit_number: 22, title: 'Venting Systems', estimated_hours: 16 },
            { unit_number: 23, title: 'Forced Air Add-Ons', estimated_hours: 8 },
            { unit_number: 24, title: 'Air Handling', estimated_hours: 10 }
        ];

        for (let i = 0; i < g2Units.length; i++) {
            const unit = g2Units[i];
            await query(`
                INSERT INTO units (program_id, unit_number, title, description, estimated_hours, order_index, content_file_path)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (program_id, unit_number) DO NOTHING
            `, [g2ProgramId, unit.unit_number, unit.title, `Advanced training for ${unit.title}`, unit.estimated_hours, i + 1, `training/g2/G2/CSA_Unit_${unit.unit_number}_Chapter_Reviews.html`]);
        }

        console.log('Initial data seeded successfully');

    } catch (error) {
        console.error('Data seeding error:', error);
        throw error;
    }
}

// Health check for database connection
export async function checkDatabaseHealth() {
    try {
        const result = await pool.query('SELECT NOW()');
        return { healthy: true, timestamp: result.rows[0].now };
    } catch (error) {
        console.error('Database health check failed:', error);
        return { healthy: false, error: error.message };
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down database connection...');
    await pool.end();
    process.exit(0);
});

export default pool;