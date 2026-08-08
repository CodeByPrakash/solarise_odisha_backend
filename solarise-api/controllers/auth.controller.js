import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

export const register = async (req, res) => {
    try {
        const { full_name, email, phone, role, password } = req.body;
        if (!full_name || !email || !phone || !password) {
            return res.status(400).json({ error: "full_name, email, phone, and password are required" });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1 OR phone = $2",
            [email, phone]
        );
        if (existingUser.rowCount > 0) {
            return res.status(409).json({ error: "Email or phone already exists" });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (full_name, email, phone, role, password_hash)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, full_name, email, phone, role, is_active, created_at`,
            [full_name, email, phone, role || "agent", password_hash]
        );

        const user = result.rows[0];
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(201).json({ data: { user, token } });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "Email or phone already exists" });
        }
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { identifier, email, phone, password } = req.body;
        const loginId = identifier || email || phone;
        if (!loginId || !password) {
            return res.status(400).json({ error: "Email or phone number and password are required" });
        }

        const result = await pool.query(
            "SELECT id, full_name, email, phone, role, password_hash, is_active FROM users WHERE email = $1 OR phone = $1",
            [loginId]
        );
        if (result.rowCount === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = result.rows[0];
        if (!user.is_active) {
            return res.status(403).json({ error: "User account is inactive" });
        }

        let passwordMatches = false;
        if (user.password_hash === password) {
            passwordMatches = true;
        } else {
            try {
                passwordMatches = await bcrypt.compare(password, user.password_hash);
            } catch (e) {
                passwordMatches = false;
            }
        }

        if (!passwordMatches) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(200).json({
            data: {
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    is_active: user.is_active
                },
                token
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const { userId } = req.user;
        const result = await pool.query(
            "SELECT id, full_name, email, phone, role, is_active, created_at FROM users WHERE id = $1",
            [userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};