const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.match(/DATABASE_URL=(.*)/)[1].trim();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: dbUrl, ssl: dbUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false });

pool.query("SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'members';")
  .then(res => { console.log(res.rows); process.exit(0); });
