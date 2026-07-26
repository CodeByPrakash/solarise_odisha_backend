import pool from "../config/db.js";

// 1. GET /api/ownership-transfers/:actionId - Get transfer details by action ID
export const getTransferByActionId = async (req, res) => {
    try {
        const { actionId } = req.params;
        const result = await pool.query(`
            SELECT 
                ot.id,
                ot.action_id,
                ot.all_ror_members_alive,
                ot.beneficiary_name,
                ot.remarks,
                ar.project_id,
                ar.action_type,
                ar.status AS action_status,
                ar.detail AS action_detail,
                c.full_name AS consumer_name
            FROM ownership_transfers ot
            JOIN action_required ar ON ot.action_id = ar.id
            JOIN projects p ON ar.project_id = p.id
            JOIN consumers c ON p.consumer_id = c.id
            WHERE ot.action_id = $1
        `, [actionId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Ownership transfer not found for this action" });
        }

        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. POST /api/ownership-transfers - Create (with business rule validation)
export const createTransfer = async (req, res) => {
    try {
        const { action_id, all_ror_members_alive, beneficiary_name, remarks } = req.body;

        if (!action_id || all_ror_members_alive === undefined || !beneficiary_name) {
            return res.status(400).json({ error: "action_id, all_ror_members_alive, and beneficiary_name are required" });
        }

        // BUSINESS RULE 1: Verify action_type = 'ownership_transfer'
        const actionCheck = await pool.query(`
            SELECT ar.id, ar.action_type, ar.project_id, p.consumer_id
            FROM action_required ar
            JOIN projects p ON ar.project_id = p.id
            WHERE ar.id = $1
        `, [action_id]);

        if (actionCheck.rowCount === 0) {
            return res.status(404).json({ error: "Action not found" });
        }

        if (actionCheck.rows[0].action_type !== "ownership_transfer") {
            return res.status(400).json({
                error: "Cannot create ownership transfer: action_type must be 'ownership_transfer'",
                actual_action_type: actionCheck.rows[0].action_type
            });
        }

        const consumer_id = actionCheck.rows[0].consumer_id;

        // BUSINESS RULE 2: If all_ror_members_alive = false,
        // check death_certificate & legal_heir_certificate exist
        if (all_ror_members_alive === false) {
            const docCheck = await pool.query(`
                SELECT doc_type FROM documents
                WHERE consumer_id = $1
                  AND doc_type IN ('death_certificate', 'legal_heir_certificate')
                  AND status != 'rejected'
            `, [consumer_id]);

            const foundTypes = docCheck.rows.map(r => r.doc_type);
            const missing = [];

            if (!foundTypes.includes("death_certificate")) {
                missing.push("death_certificate");
            }
            if (!foundTypes.includes("legal_heir_certificate")) {
                missing.push("legal_heir_certificate");
            }

            if (missing.length > 0) {
                return res.status(400).json({
                    error: "Required documents missing when all_ror_members_alive is false",
                    missing_documents: missing
                });
            }
        }

        const result = await pool.query(`
            INSERT INTO ownership_transfers (action_id, all_ror_members_alive, beneficiary_name, remarks)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [action_id, all_ror_members_alive, beneficiary_name, remarks || null]);

        res.status(201).json({ data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "An ownership transfer already exists for this action" });
        }
        res.status(500).json({ error: err.message });
    }
};

// 3. PUT /api/ownership-transfers/:id - Update
export const updateTransfer = async (req, res) => {
    try {
        const { id } = req.params;
        const { all_ror_members_alive, beneficiary_name, remarks } = req.body;

        const result = await pool.query(`
            UPDATE ownership_transfers
            SET all_ror_members_alive = COALESCE($1, all_ror_members_alive),
                beneficiary_name = COALESCE($2, beneficiary_name),
                remarks = COALESCE($3, remarks)
            WHERE id = $4
            RETURNING *
        `, [all_ror_members_alive, beneficiary_name, remarks, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Ownership transfer not found" });
        }

        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
