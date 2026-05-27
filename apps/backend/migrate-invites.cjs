const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.match(/DATABASE_URL=(.*)/)[1].trim();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: dbUrl, ssl: dbUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false });

const migrate = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id_invitation SERIAL PRIMARY KEY,
        id_project INTEGER REFERENCES projects(id_project) ON DELETE CASCADE,
        id_user INTEGER REFERENCES users(id_user) ON DELETE CASCADE,
        invited_by INTEGER REFERENCES users(id_user) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL DEFAULT 'member',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(id_project, id_user)
      );
    `);
    console.log("Invitations table created successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
};

migrate();
