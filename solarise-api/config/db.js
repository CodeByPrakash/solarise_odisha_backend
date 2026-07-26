import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const pool = new pg.Pool({
    user: process.env.DB_USER || "username",
    host: process.env.DB_HOST || "host",
    database: process.env.DB_NAME || "db_name",
    password: process.env.DB_PASSWORD || "your_password",
    port: process.env.DB_PORT || 'portno',
});

pool.on('connect', () => {
    console.log('Connected to the database');
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
export default pool;