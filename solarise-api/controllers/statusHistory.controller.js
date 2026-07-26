import pool from "../config/db.js";

// Get all status history entries
export const getAllStatusHistory = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM status_history ORDER BY changed_at DESC"
        );

        res.status(200).json({
            success: true,
            message: "Status history fetched successfully",
            data: result.rows
        });
    } catch (error) {
        console.error("Error fetching status history:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get status history for a specific project
export const getStatusHistoryByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const result = await pool.query(
            "SELECT * FROM status_history WHERE project_id = $1 ORDER BY changed_at DESC",
            [projectId]
        );

        res.status(200).json({
            success: true,
            message: "Project status history fetched successfully",
            project_id: projectId,
            data: result.rows
        });
    } catch (error) {
        console.error("Error fetching project status history:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Create a status history entry
export const createStatusHistory = async (req, res) => {
    try {
        const { project_id, from_status, to_status, changed_by, remarks } = req.body;

        const result = await pool.query(
            `INSERT INTO status_history (project_id, from_status, to_status, changed_by, remarks)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [project_id, from_status, to_status, changed_by, remarks]
        );

        res.status(201).json({
            success: true,
            message: "Status history created successfully",
            status_history_id: result.rows[0].id
        });
    } catch (error) {
        console.error("Error creating status history:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
