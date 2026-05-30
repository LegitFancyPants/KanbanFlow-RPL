const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/DATABASE_URL=(.*)/);
const dbUrl = match ? match[1].trim() : '';
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl && dbUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'deadline';")
  .then(res => {
    console.log('DATA TYPE:', res.rows[0]?.data_type);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
