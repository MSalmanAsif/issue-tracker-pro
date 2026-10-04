// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Required for cloud databases like Neon/Supabase
  ssl: {
    rejectUnauthorized: false, 
  },
});

module.exports = pool;