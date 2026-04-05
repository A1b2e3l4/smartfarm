import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://smartfarm:ajvsGgtxm2LptR3vS5icL2pyLfy7GX0H@dpg-d798cv9r0fns73eccpe0-a.oregon-postgres.render.com/smartfarm_azmq',
  ssl: {
    rejectUnauthorized: false
  }
});

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected successfully.');

    const schemaPath = path.join(process.cwd(), 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await client.query(schema);
    console.log('Schema executed successfully.');

    // Check if admin exists, if not create one
    const adminEmail = 'abelmuturi04@gmail.com';
    const adminPassword = '@Muturi123#';
    const adminCheck = await client.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    if (adminCheck.rows.length === 0) {
      console.log('Creating default admin user...');
      await client.query(
        'INSERT INTO users (name, phone, email, password, location, role, is_suspended) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        ['Abel Itotia', '0700000000', adminEmail, hashedPassword, 'Nairobi', 'admin', false]
      );
      console.log(`Default admin created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log('Updating existing admin user...');
      await client.query(
        'UPDATE users SET password = $1, role = $2, is_suspended = $3 WHERE email = $4',
        [hashedPassword, 'admin', false, adminEmail]
      );
      console.log('Admin credentials updated.');
    }

    client.release();
    console.log('Database initialization complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

initializeDatabase();
