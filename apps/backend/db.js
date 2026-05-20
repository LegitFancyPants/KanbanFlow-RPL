const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

// Test koneksi
pool.connect((err, client, release) => {
  if (err) {
    console.error('Koneksi gagal:', err.message);
  } else {
    console.log('✅ Database terkoneksi!');
    release();
  }
});

module.exports = pool;