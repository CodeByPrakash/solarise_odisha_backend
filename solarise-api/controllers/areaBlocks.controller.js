import pool from "../config/db.js";
export const getAllAreaBlocks = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, is_active FROM area_blocks ORDER BY id"
        );
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
export const getAreaBlockById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT id, name, is_active FROM area_blocks WHERE id = $1",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Area Block not found" });
        }
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
export const createAreaBlock = async (req, res) => {
    try {
        const { name, is_active } = req.body;
        const result = await pool.query(
            "INSERT INTO area_blocks (name, is_active) VALUES ($1, $2) RETURNING id, name, is_active",
            [name, is_active]
        );
        res.status(201).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
export const updateAreaBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, is_active } = req.body;
        const result = await pool.query(
            "UPDATE area_blocks SET name=$1, is_active=$2 WHERE id=$3 RETURNING id, name, is_active",
            [name, is_active, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Area Block not found" });
        }
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "Area block name already exists" });
        }
        res.status(500).json({ error: err.message });
    }

}
export const deleteAreaBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM area_blocks WHERE id = $1 RETURNING id, name",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Area Block not found" });
        }
        res.status(200).json({ message: "Area Block deleted", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
