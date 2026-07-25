import pool from "../config/db.js";

// 1. GET /api/actions - List all open actions
export const getAllOpenActions = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                ar.id,
                ar.project_id,
                ar.action_type,
                ar.detail,
                ar.status,
                ar.raised_by,
                u1.full_name AS raised_by_name,
                ar.raised_at,
                ar.assigned_to,
                u2.full_name AS assigned_to_name,
                ar.resolved_by,
                u3.full_name AS resolved_by_name,
                ar.resolved_at,
                c.full_name AS consumer_name,
                p.current_status AS project_status
            FROM action_required ar
            JOIN projects p ON ar.project_id = p.id
            JOIN consumers c ON p.consumer_id = c.id
            LEFT JOIN users u1 ON ar.raised_by = u1.id
            LEFT JOIN users u2 ON ar.assigned_to = u2.id
            LEFT JOIN users u3 ON ar.resolved_by = u3.id
            WHERE ar.status NOT IN ('resolved', 'cancelled')
            ORDER BY ar.raised_at DESC
        `);
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. GET /api/actions/project/:projectId - Actions for a project
export const getActionsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const result = await pool.query(`
            SELECT 
                ar.id,
                ar.project_id,
                ar.action_type,
                ar.detail,
                ar.status,
                ar.raised_by,
                u1.full_name AS raised_by_name,
                ar.raised_at,
                ar.assigned_to,
                u2.full_name AS assigned_to_name,
                ar.resolved_by,
                u3.full_name AS resolved_by_name,
                ar.resolved_at
            FROM action_required ar
            LEFT JOIN users u1 ON ar.raised_by = u1.id
            LEFT JOIN users u2 ON ar.assigned_to = u2.id
            LEFT JOIN users u3 ON ar.resolved_by = u3.id
            WHERE ar.project_id = $1
            ORDER BY ar.raised_at DESC
        `, [projectId]);
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. POST /api/actions - Raise new action (doc team)
export const createAction = async (req, res) => {
    try {
        const { project_id, action_type, detail, raised_by, assigned_to } = req.body;

        if (!project_id || !action_type || !raised_by) {
            return res.status(400).json({ error: "project_id, action_type, and raised_by are required" });
        }

        // Verify project exists
        const projectCheck = await pool.query(
            "SELECT id FROM projects WHERE id = $1",
            [project_id]
        );
        if (projectCheck.rowCount === 0) {
            return res.status(404).json({ error: "Project not found" });
        }

        const result = await pool.query(`
            INSERT INTO action_required (project_id, action_type, detail, raised_by, assigned_to)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [project_id, action_type, detail || null, raised_by, assigned_to || null]);

        res.status(201).json({ data: result.rows[0] });
    } catch (err) {
        if (err.code === "23503") {
            return res.status(400).json({ error: "Referenced project or user does not exist" });
        }
        if (err.code === "22P02") {
            return res.status(400).json({ error: "Invalid action_type value" });
        }
        res.status(500).json({ error: err.message });
    }
};

// 4. PATCH /api/actions/:id/status - Update action status
export const updateActionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolved_by, assigned_to } = req.body;

        if (!status) {
            return res.status(400).json({ error: "status is required" });
        }

        // If resolving, set resolved_by and resolved_at
        let result;
        if (status === "resolved") {
            if (!resolved_by) {
                return res.status(400).json({ error: "resolved_by is required when resolving an action" });
            }
            result = await pool.query(`
                UPDATE action_required
                SET status = $1, resolved_by = $2, resolved_at = now(),
                    assigned_to = COALESCE($3, assigned_to)
                WHERE id = $4
                RETURNING *
            `, [status, resolved_by, assigned_to, id]);
        } else {
            result = await pool.query(`
                UPDATE action_required
                SET status = $1,
                    assigned_to = COALESCE($2, assigned_to)
                WHERE id = $3
                RETURNING *
            `, [status, assigned_to, id]);
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Action not found" });
        }

        res.status(200).json({ message: "Action status updated", data: result.rows[0] });
    } catch (err) {
        if (err.code === "22P02") {
            return res.status(400).json({ error: "Invalid status value" });
        }
        res.status(500).json({ error: err.message });
    }
};

// 5. GET /api/actions/overdue - Actions open > 7 days
export const getOverdueActions = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                ar.id,
                ar.project_id,
                ar.action_type,
                ar.detail,
                ar.status,
                ar.raised_by,
                u1.full_name AS raised_by_name,
                ar.raised_at,
                ar.assigned_to,
                u2.full_name AS assigned_to_name,
                c.full_name AS consumer_name,
                p.current_status AS project_status,
                EXTRACT(DAY FROM NOW() - ar.raised_at)::INTEGER AS days_open
            FROM action_required ar
            JOIN projects p ON ar.project_id = p.id
            JOIN consumers c ON p.consumer_id = c.id
            LEFT JOIN users u1 ON ar.raised_by = u1.id
            LEFT JOIN users u2 ON ar.assigned_to = u2.id
            WHERE ar.status NOT IN ('resolved', 'cancelled')
              AND ar.raised_at < NOW() - INTERVAL '7 days'
            ORDER BY ar.raised_at
        `);
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
