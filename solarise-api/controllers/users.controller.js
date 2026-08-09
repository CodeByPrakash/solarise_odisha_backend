import pool from "../config/db.js";
import { validateRoleCreation } from "./auth.controller.js";

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

        const effectivePassword = password_hash || password;
        if (!first_name || !last_name || !email || !phone || !effectivePassword) {
            return res.status(400).json({ error: "first_name, last_name (or full_name), email, phone, and password_hash are required" });
        }

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
        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, phone, role, password_hash)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, phone, role`,
            [first_name, last_name, email, phone, targetRole, effectivePassword]
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
        const creatorRole = req.user?.role;
        const { first_name, last_name, email, phone, role, is_active } = req.body;

        if (role && role === 'admin' && creatorRole !== 'admin') {
            return res.status(403).json({ error: "Only an authorized Admin can assign the Admin role." });
        }

        const result = await pool.query(
            `UPDATE users SET first_name=$1, last_name=$2, email=$3, phone=$4, role=$5, is_active=$6, updated_at=now()
             WHERE id=$7 RETURNING id, first_name, last_name, email, phone, role, is_active`,
            [first_name, last_name, email, phone, role, is_active, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
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
