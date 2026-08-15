import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { validateRoleCreation } from "./auth.controller.js";
import { validateMobile, validateEmail } from "../utils/validators.js";

// Helper function to ensure string is bcrypt hashed
const ensureHashedPassword = async (pwd) => {
    if (!pwd) return null;
    // Check if pwd is already a bcrypt hash ($2a$, $2b$, $2y$)
    if (/^\$2[aby]\$\d{2}\$/.test(pwd)) {
        return pwd;
    }
    return await bcrypt.hash(pwd, 10);
};

// GET /api/users
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, first_name, last_name, email, phone, role, is_active, created_at FROM users ORDER BY id"
        );
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/users/:id
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT id, first_name, last_name, email, phone, password_hash, role, is_active, created_at FROM users WHERE id = $1",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/users
export const createUser = async (req, res) => {
    try {
        const creatorRole = req.user?.role;
        let { first_name, last_name, full_name, email, phone, role, password_hash, password } = req.body;

        if (!first_name && full_name) {
            const parts = full_name.trim().split(/\s+/);
            first_name = parts[0];
            last_name = parts.slice(1).join(" ") || "User";
        }

        const rawPassword = password || password_hash;
        if (!first_name || !last_name || !email || !phone || !rawPassword) {
            return res.status(400).json({ error: "first_name, last_name (or full_name), email, phone, and password are required" });
        }

        const emailCheck = validateEmail(email);
        if (!emailCheck.valid) return res.status(400).json({ error: emailCheck.error });

        const phoneCheck = validateMobile(phone);
        if (!phoneCheck.valid) return res.status(400).json({ error: phoneCheck.error });

        const targetRole = role || "agent";

        // Enforce strict Role Hierarchy Creation Rules
        const roleValidation = validateRoleCreation(creatorRole, targetRole);
        if (!roleValidation.allowed) {
            return res.status(403).json({ error: roleValidation.message });
        }

        // Check if email or phone already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE phone = $1 OR email = $2",
            [phone, email]
        );
        if (existingUser.rowCount > 0) {
            return res.status(409).json({ error: "Email or phone number already exists" });
        }

        // Hash raw password with bcrypt before storing
        const finalHash = await ensureHashedPassword(rawPassword);

        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, phone, role, password_hash)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, phone, role`,
            [first_name, last_name, email, phone, targetRole, finalHash]
        );
        res.status(201).json({ data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "Email or phone already exists" });
        }
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUserId = req.user?.userId || req.user?.id;
        const creatorRole = req.user?.role;
        const { first_name, last_name, email, phone, role, is_active, password, password_hash } = req.body;

        if (email) {
            const emailCheck = validateEmail(email);
            if (!emailCheck.valid) return res.status(400).json({ error: emailCheck.error });
        }

        if (phone) {
            const phoneCheck = validateMobile(phone);
            if (!phoneCheck.valid) return res.status(400).json({ error: phoneCheck.error });
        }

        // Prevent logged-in user from deactivating their own account
        if (String(id) === String(loggedInUserId) && is_active === false) {
            return res.status(400).json({ error: "You cannot deactivate your own logged-in account." });
        }

        if (role && role === 'admin' && creatorRole !== 'admin') {
            return res.status(403).json({ error: "Only an authorized Admin can assign the Admin role." });
        }

        const rawPassword = password || password_hash;

        let queryParams = [];
        let setClauses = [];

        if (first_name !== undefined) {
            queryParams.push(first_name);
            setClauses.push(`first_name = $${queryParams.length}`);
        }
        if (last_name !== undefined) {
            queryParams.push(last_name);
            setClauses.push(`last_name = $${queryParams.length}`);
        }
        if (email !== undefined) {
            queryParams.push(email);
            setClauses.push(`email = $${queryParams.length}`);
        }
        if (phone !== undefined) {
            queryParams.push(phone);
            setClauses.push(`phone = $${queryParams.length}`);
        }
        if (role !== undefined) {
            queryParams.push(role);
            setClauses.push(`role = $${queryParams.length}`);
        }
        if (is_active !== undefined) {
            queryParams.push(is_active);
            setClauses.push(`is_active = $${queryParams.length}`);
        }
        if (rawPassword) {
            const hashed = await ensureHashedPassword(rawPassword);
            queryParams.push(hashed);
            setClauses.push(`password_hash = $${queryParams.length}`);
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ error: "No fields provided for update" });
        }

        setClauses.push(`updated_at = now()`);
        queryParams.push(id);

        const updateQuery = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${queryParams.length} RETURNING id, first_name, last_name, email, phone, role, is_active`;

        const result = await pool.query(updateQuery, queryParams);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "Email or phone already exists" });
        }
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUserId = req.user?.userId || req.user?.id;

        // Prevent logged-in user from deleting their own account
        if (String(id) === String(loggedInUserId)) {
            return res.status(400).json({ error: "You cannot delete your own logged-in account." });
        }

        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING id, first_name, last_name",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/users/role/:role
export const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const result = await pool.query(
            "SELECT id, first_name, last_name, email, phone, role FROM users WHERE role = $1",
            [role]
        );
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
