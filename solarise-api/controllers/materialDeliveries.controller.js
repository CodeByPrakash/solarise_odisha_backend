import pool from "../config/db.js";

// Statuses that are at 'line_up_given' or later in the pipeline
const ALLOWED_STATUSES = [
    'line_up_given',
    'materials_delivered',
    'installation_in_progress',
    'installation_done',
    'installation_uploaded_pmsgy',
    'net_metering_applied',
    'net_metering_rts_pending',
    'net_metering_payment_pending',
    'net_metering_agreement_done',
    'inspection_report_submitted',
    'site_activity',
    'approval_desk',
    'service_release',
    'service_released',
    'meter_installed',
    'project_commissioned',
    'subsidy_redeemed',
    'subsidy_return',
    'subsidy_pending',
    'subsidy_disbursed_cfa',
    'subsidy_disbursed_sfa',
    'project_handover_pending',
    'project_handed_over'
];

// 1. GET /api/material-deliveries/project/:projectId - Get delivery record
export const getDeliveryByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const result = await pool.query(`
            SELECT 
                md.id,
                md.project_id,
                md.delivered_at,
                md.dcr_number,
                md.recorded_by,
                u.full_name AS recorded_by_name,
                c.full_name AS consumer_name,
                p.current_status AS project_status
            FROM material_deliveries md
            JOIN projects p ON md.project_id = p.id
            JOIN consumers c ON p.consumer_id = c.id
            LEFT JOIN users u ON md.recorded_by = u.id
            WHERE md.project_id = $1
        `, [projectId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "No material delivery found for this project" });
        }

        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. POST /api/material-deliveries - Record delivery
export const createDelivery = async (req, res) => {
    try {
        const { project_id, dcr_number, recorded_by, delivered_at } = req.body;

        if (!project_id || !recorded_by) {
            return res.status(400).json({ error: "project_id and recorded_by are required" });
        }

        // BUSINESS RULE: Only allow when project status is 'line_up_given' or later
        const projectCheck = await pool.query(
            "SELECT id, current_status FROM projects WHERE id = $1",
            [project_id]
        );

        if (projectCheck.rowCount === 0) {
            return res.status(404).json({ error: "Project not found" });
        }

        const currentStatus = projectCheck.rows[0].current_status;

        if (!ALLOWED_STATUSES.includes(currentStatus)) {
            return res.status(400).json({
                error: "Cannot record material delivery: project must be at 'line_up_given' or later",
                current_status: currentStatus
            });
        }

        const result = await pool.query(`
            INSERT INTO material_deliveries (project_id, dcr_number, recorded_by, delivered_at)
            VALUES ($1, $2, $3, COALESCE($4, now()))
            RETURNING *
        `, [project_id, dcr_number || null, recorded_by, delivered_at || null]);

        res.status(201).json({ data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "A material delivery already exists for this project" });
        }
        if (err.code === "23503") {
            return res.status(400).json({ error: "Referenced project or user does not exist" });
        }
        res.status(500).json({ error: err.message });
    }
};

// 3. PUT /api/material-deliveries/:id - Update DCR number
export const updateDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const { dcr_number, delivered_at } = req.body;

        const result = await pool.query(`
            UPDATE material_deliveries
            SET dcr_number = COALESCE($1, dcr_number),
                delivered_at = COALESCE($2, delivered_at)
            WHERE id = $3
            RETURNING *
        `, [dcr_number, delivered_at, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Material delivery not found" });
        }

        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
