const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_HoTyEFq4SUz0@ep-little-bread-ao5vp2fu-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' });
pool.query("SELECT enum_range(NULL::subtask_status_enum)")
  .then(r => { console.log(r.rows); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
