import pool from "../config/db.js";

// GET /api/users
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, full_name, email, phone, role, is_active, created_at FROM users ORDER BY id"
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
            "SELECT id, full_name, email, phone, role, is_active, created_at FROM users WHERE id = $1",
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
        const { full_name, email, phone, role, password_hash } = req.body;
        const result = await pool.query(
            `INSERT INTO users (full_name, email, phone, role, password_hash)
             VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, phone, role`,
            [full_name, email, phone, role || "agent", password_hash]
        );
        res.status(201).json({ data: result.rows[0] });
    } catch (err) {
        // Handle PostgreSQL-specific errors
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
        const { full_name, email, phone, role, is_active } = req.body;
        const result = await pool.query(
            `UPDATE users SET full_name=$1, email=$2, phone=$3, role=$4, is_active=$5, updated_at=now()
             WHERE id=$6 RETURNING id, full_name, email, phone, role, is_active`,
            [full_name, email, phone, role, is_active, id]
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
            "DELETE FROM users WHERE id = $1 RETURNING id, full_name",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/users/role/:role
export const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const result = await pool.query(
            "SELECT id, full_name, email, phone, role FROM users WHERE role = $1",
            [role]
        );
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
