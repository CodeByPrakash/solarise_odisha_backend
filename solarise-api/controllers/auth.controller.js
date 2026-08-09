import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

// Role hierarchy permission matrix for account creation
export const ALLOWED_ROLE_CREATION = {
  admin: ['admin', 'agent', 'site_manager', 'doc_team', 'accounts'],
  doc_team: ['agent', 'site_manager', 'doc_team'],
  site_manager: ['agent'],
  accounts: ['agent'],
  agent: ['agent']
};

export const validateRoleCreation = (creatorRole, targetRole) => {
  if (targetRole === 'admin' && creatorRole !== 'admin') {
    return { allowed: false, message: "Only an authorized Admin can create an Admin user." };
  }
  const allowedRoles = ALLOWED_ROLE_CREATION[creatorRole] || [];
  if (!allowedRoles.includes(targetRole)) {
    return { allowed: false, message: `Role '${creatorRole}' is not authorized to create '${targetRole}' users.` };
  }
  return { allowed: true };
};

export const register = async (req, res) => {
    try {
        // Check total users in database for bootstrapping
        const countRes = await pool.query("SELECT COUNT(*) FROM users");
        const totalUsers = parseInt(countRes.rows[0].count, 10);

        let creatorRole = req.user?.role;

        // If system has zero registered users, allow initial system admin setup
        if (totalUsers === 0) {
            creatorRole = 'admin';
        } else if (!req.user) {
            return res.status(401).json({ error: "Authentication required to register new users." });
        }

        let { first_name, last_name, full_name, email, phone, role, password } = req.body;

        // Support full_name string fallback
        if (!first_name && full_name) {
            const parts = full_name.trim().split(/\s+/);
            first_name = parts[0];
            last_name = parts.slice(1).join(" ") || "User";
        }

        if (!first_name || !last_name || !email || !phone || !password) {
            return res.status(400).json({ error: "first_name, last_name (or full_name), email, phone, and password are required" });
        }

        const targetRole = role || "agent";

        // Enforce strict Role Hierarchy Creation Rules
        const roleValidation = validateRoleCreation(creatorRole, targetRole);
        if (!roleValidation.allowed) {
            return res.status(403).json({ error: roleValidation.message });
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
            `INSERT INTO users (first_name, last_name, email, phone, role, password_hash)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, first_name, last_name, email, phone, role, is_active, created_at`,
            [first_name, last_name, email, phone, targetRole, password_hash]
        );

        const user = result.rows[0];
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(201).json({
            message: `User created successfully with role '${user.role}'`,
            data: { user, token }
        });
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
            "SELECT id, first_name, last_name, email, phone, role, password_hash, is_active FROM users WHERE email = $1 OR phone = $1",
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
                    first_name: user.first_name,
                    last_name: user.last_name,
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
            "SELECT id, first_name, last_name, email, phone, role, is_active, created_at FROM users WHERE id = $1",
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