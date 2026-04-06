const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Student'");
    console.log('Columns in Student table:');
    console.log(res.rows.map(r => r.column_name));
    
    const res2 = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'TeacherProfile'");
    console.log('Columns in TeacherProfile table:');
    console.log(res2.rows.map(r => r.column_name));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

check();
