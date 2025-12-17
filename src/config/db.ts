import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
  connectionString: `${config.conection_str}`,
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone VARCHAR(15) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `);
};

export default initDB;
