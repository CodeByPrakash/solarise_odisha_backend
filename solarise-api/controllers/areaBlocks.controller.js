import pool from "../config/db.js";

// GET /api/areaBlocks - Get all area blocks
export const getAllAreaBlocks = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, district, is_active FROM area_blocks ORDER BY id ASC"
        );
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/areaBlocks/:id - Get single area block by ID
export const getAreaBlockById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT id, name, district, is_active FROM area_blocks WHERE id = $1",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Area Block not found" });
        }
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/areaBlocks - Create a new area block
export const createAreaBlock = async (req, res) => {
    try {
        const { name, block_name, district, is_active } = req.body;

        // Ensure name is properly sanitized from either 'name' or 'block_name' field
        const rawName = name ?? block_name;
        const blockName = (rawName !== undefined && rawName !== null) ? String(rawName).trim() : '';

        // Ensure district has a valid fallback
        const rawDistrict = district;
        const districtName = (rawDistrict !== undefined && rawDistrict !== null && String(rawDistrict).trim() !== '')
            ? String(rawDistrict).trim()
            : 'Khurda';

        if (!blockName) {
            return res.status(400).json({ error: "Area block name (name or block_name) is required and cannot be null" });
        }

        const activeStatus = is_active !== undefined && is_active !== null ? Boolean(is_active) : true;

        const result = await pool.query(
            "INSERT INTO area_blocks (name, district, is_active) VALUES ($1, $2, $3) RETURNING id, name, district, is_active",
            [blockName, districtName, activeStatus]
        );

        res.status(201).json({
            message: "Area block created successfully",
            data: result.rows[0]
        });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: `Area block "${req.body.name || req.body.block_name}" already exists` });
        }
        if (err.code === "23502") {
            return res.status(400).json({ error: `Missing required field: column '${err.column}' cannot be null` });
        }
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/areaBlocks/:id - Update an area block
export const updateAreaBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, block_name, district, is_active } = req.body;

        const existing = await pool.query("SELECT * FROM area_blocks WHERE id = $1", [id]);
        if (existing.rowCount === 0) {
            return res.status(404).json({ error: "Area Block not found" });
        }

        const currentName = existing.rows[0].name || '';
        const currentDistrict = existing.rows[0].district || 'Khurda';

        const rawName = name ?? block_name;
        const updatedName = (rawName !== undefined && rawName !== null && String(rawName).trim() !== '')
            ? String(rawName).trim()
            : currentName;

        const updatedDistrict = (district !== undefined && district !== null && String(district).trim() !== '')
            ? String(district).trim()
            : currentDistrict;

        const updatedStatus = is_active !== undefined && is_active !== null
            ? Boolean(is_active)
            : existing.rows[0].is_active;

        if (!updatedName) {
            return res.status(400).json({ error: "Area block name cannot be empty or null" });
        }

        const result = await pool.query(
            "UPDATE area_blocks SET name = $1, district = $2, is_active = $3 WHERE id = $4 RETURNING id, name, district, is_active",
            [updatedName, updatedDistrict, updatedStatus, id]
        );

        res.status(200).json({
            message: "Area block updated successfully",
            data: result.rows[0]
        });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "Area block name already exists" });
        }
        if (err.code === "23502") {
            return res.status(400).json({ error: `Missing required field: column '${err.column}' cannot be null` });
        }
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/areaBlocks/:id - Delete an area block
export const deleteAreaBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM area_blocks WHERE id = $1 RETURNING id, name, district",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Area Block not found" });
        }
        res.status(200).json({
            message: "Area Block deleted successfully",
            data: result.rows[0]
        });
    } catch (err) {
        if (err.code === "23503") {
            return res.status(400).json({
                error: "Cannot delete area block because it is currently linked to registered consumers"
            });
        }
        res.status(500).json({ error: err.message });
    }
};
