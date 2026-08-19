import pool from "../config/db.js";
import { notifyUsers } from "../utils/notificationHelper.js";
import { deleteFileFromS3, uploadFileToS3 } from "../services/s3Storage.js";

// GET /api/documents - List all documents (filtered by role)
export const getAllDocuments = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const role = req.user?.role;
        let query = `
            SELECT 
                d.id,
                d.consumer_id,
                COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '') AS consumer_name,
                d.doc_type,
                d.file_url,
                d.file_name,
                d.mime_type,
                d.geo_lat,
                d.geo_lng,
                d.status,
                d.uploaded_by,
                u1.first_name || ' ' || u1.last_name AS uploaded_by_name,
                d.uploaded_at,
                d.verified_by,
                u2.first_name || ' ' || u2.last_name AS verified_by_name,
                d.verified_at,
                d.reject_reason,
                d.version
            FROM documents d
            JOIN consumers c ON d.consumer_id = c.id
            LEFT JOIN users u1 ON d.uploaded_by = u1.id
            LEFT JOIN users u2 ON d.verified_by = u2.id
        `;
        const params = [];
        if (role === 'agent') {
            query += ` WHERE c.created_by = $1`;
            params.push(userId);
        } else if (role === 'site_manager') {
            query += ` WHERE (c.created_by = $1 OR EXISTS (SELECT 1 FROM projects p WHERE p.consumer_id = c.id AND p.assigned_site_manager = $1))`;
            params.push(userId);
        }
        query += ` ORDER BY d.uploaded_at DESC`;

        const result = await pool.query(query, params);
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/documents/:id - Get document details by ID
export const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                d.id,
                d.consumer_id,
                COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '') AS consumer_name,
                d.doc_type,
                d.file_url,
                d.file_name,
                d.mime_type,
                d.geo_lat,
                d.geo_lng,
                d.status,
                d.uploaded_by,
                u1.first_name || ' ' || u1.last_name AS uploaded_by_name,
                d.uploaded_at,
                d.verified_by,
                u2.first_name || ' ' || u2.last_name AS verified_by_name,
                d.verified_at,
                d.reject_reason,
                d.version
            FROM documents d
            JOIN consumers c ON d.consumer_id = c.id
            LEFT JOIN users u1 ON d.uploaded_by = u1.id
            LEFT JOIN users u2 ON d.verified_by = u2.id
            WHERE d.id = $1
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Document not found" });
        }

        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getDocumentsByConsumer = async (req, res) => {
    try {
        const { consumerId } = req.params;
        const result = await pool.query(`
            SELECT 
                d.id,
                d.consumer_id,
                d.doc_type,
                d.file_url,
                d.file_name,
                d.mime_type,
                d.geo_lat,
                d.geo_lng,
                d.status,
                d.uploaded_by,
                u1.first_name || ' ' || u1.last_name AS uploaded_by_name,
                d.uploaded_at,
                d.verified_by,
                u2.first_name || ' ' || u2.last_name AS verified_by_name,
                d.verified_at,
                d.reject_reason,
                d.version
            FROM documents d
            LEFT JOIN users u1 ON d.uploaded_by = u1.id
            LEFT JOIN users u2 ON d.verified_by = u2.id
            WHERE d.consumer_id = $1
            ORDER BY d.doc_type, d.version DESC
        `, [consumerId]);
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createDocument = async (req, res) => {
    try {
        const { consumer_id, doc_type, file_url, file_name, mime_type, geo_lat, geo_lng, uploaded_by } = req.body;
        if (!consumer_id || !doc_type || !file_url || !uploaded_by) {
            return res.status(400).json({ error: "consumer_id, doc_type, file_url, and uploaded_by are required" });
        }
        const result = await pool.query(`
            INSERT INTO documents (consumer_id, doc_type, file_url, file_name, mime_type, geo_lat, geo_lng, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [consumer_id, doc_type, file_url, file_name || null, mime_type || null, geo_lat || null, geo_lng || null, uploaded_by]);
        res.status(201).json({ data: result.rows[0] });
    } catch (err) {
        if (err.code === "23503") {
            return res.status(400).json({ error: "Referenced consumer or user does not exist" });
        }
        res.status(500).json({ error: err.message });
    }
};

export const verifyDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { verified_by } = req.body;
        if (!verified_by) {
            return res.status(400).json({ error: "verified_by (user ID) is required" });
        }
        const result = await pool.query(`
            UPDATE documents
            SET status = 'verified', verified_by = $1, verified_at = now(), reject_reason = NULL
            WHERE id = $2 AND status IN ('uploaded', 'action_required', 'rejected')
            RETURNING *
        `, [verified_by, id]);
        if (result.rowCount === 0) {
            // Check if the doc exists at all
            const check = await pool.query("SELECT id, status FROM documents WHERE id = $1", [id]);
            if (check.rowCount === 0) {
                return res.status(404).json({ error: "Document not found" });
            }
            return res.status(400).json({ error: `Cannot verify document with status '${check.rows[0].status}'.` });
        }

        const verifiedDoc = result.rows[0];
        notifyUsers({
            targetRoles: ['admin', 'site_manager', 'agent'],
            userId: verifiedDoc.uploaded_by,
            title: `Document Verified`,
            body: `Document "${verifiedDoc.doc_type?.replace(/_/g, ' ')}" verified by Document Desk.`
        });

        res.status(200).json({ message: "Document verified", data: verifiedDoc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const rejectDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { verified_by, reject_reason } = req.body;
        if (!verified_by) {
            return res.status(400).json({ error: "verified_by (user ID) is required" });
        }
        if (!reject_reason) {
            return res.status(400).json({ error: "reject_reason is required" });
        }
        const result = await pool.query(`
            UPDATE documents
            SET status = 'rejected', verified_by = $1, verified_at = now(), reject_reason = $2
            WHERE id = $3 AND status IN ('uploaded', 'action_required', 'rejected')
            RETURNING * 
        `, [verified_by, reject_reason, id]);
        if (result.rowCount === 0) {
            const check = await pool.query("SELECT id, status FROM documents WHERE id = $1", [id]);
            if (check.rowCount === 0) {
                return res.status(404).json({ error: "Document not found" });
            }
            return res.status(400).json({ error: `Cannot reject document with status '${check.rows[0].status}'. Only 'uploaded' or 'action_required' documents can be rejected.` });
        }

        const rejectedDoc = result.rows[0];
        notifyUsers({
            targetRoles: ['admin', 'site_manager', 'agent'],
            userId: rejectedDoc.uploaded_by,
            title: `Document Rejected`,
            body: `Document "${rejectedDoc.doc_type?.replace(/_/g, ' ')}" rejected. Reason: ${reject_reason}`
        });

        res.status(200).json({ message: "Document rejected", data: rejectedDoc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const reuploadDocument = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { file_url, file_name, mime_type, geo_lat, geo_lng, uploaded_by } = req.body;
        if (!file_url || !uploaded_by) {
            return res.status(400).json({ error: "file_url and uploaded_by are required" });
        }
        await client.query("BEGIN");
        // Step 1: Get the original document's consumer_id and doc_type
        const original = await client.query(
            "SELECT consumer_id, doc_type FROM documents WHERE id = $1",
            [id]
        );
        if (original.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Original document not found" });
        }
        const { consumer_id, doc_type } = original.rows[0];
        // Step 2: Get current max version for this consumer + doc_type
        const versionResult = await client.query(
            "SELECT COALESCE(MAX(version), 0) AS max_version FROM documents WHERE consumer_id = $1 AND doc_type = $2",
            [consumer_id, doc_type]
        );
        const newVersion = versionResult.rows[0].max_version + 1;
        // Step 3: Insert new version
        const insertResult = await client.query(`
            INSERT INTO documents (consumer_id, doc_type, file_url, file_name, mime_type, geo_lat, geo_lng, uploaded_by, version)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [consumer_id, doc_type, file_url, file_name || null, mime_type || null, geo_lat || null, geo_lng || null, uploaded_by, newVersion]);
        await client.query("COMMIT");
        res.status(201).json({
            message: `Document re-uploaded as version ${newVersion}`,
            data: insertResult.rows[0]
        });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

export const getDocumentStatusSummary = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                status,
                COUNT(*)::INTEGER AS count
            FROM documents
            GROUP BY status
            ORDER BY count DESC
        `);
        const totalResult = await pool.query("SELECT COUNT(*)::INTEGER AS total FROM documents");
        res.status(200).json({
            total_documents: totalResult.rows[0]?.total || 0,
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const flagDocument = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { flagged_by, action_type, detail } = req.body;

        if (!detail) {
            return res.status(400).json({ error: "detail (flag reason) is required" });
        }

        await client.query("BEGIN");

        // 1. Get document & project info
        const docRes = await client.query(`
            SELECT d.id, d.consumer_id, d.doc_type, p.id AS project_id, p.current_status
            FROM documents d
            LEFT JOIN projects p ON p.consumer_id = d.consumer_id
            WHERE d.id = $1
        `, [id]);

        if (docRes.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Document not found" });
        }

        const doc = docRes.rows[0];

        // Ensure valid user ID for FK constraint
        let validUserBy = req.user?.userId || req.user?.id || flagged_by;
        if (validUserBy) {
            const uCheck = await client.query("SELECT id FROM users WHERE id = $1", [validUserBy]);
            if (uCheck.rowCount === 0) {
                const fallbackUser = await client.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
                validUserBy = fallbackUser.rows[0]?.id || 1;
            }
        } else {
            const fallbackUser = await client.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
            validUserBy = fallbackUser.rows[0]?.id || 1;
        }

        const VALID_ACTION_TYPES = [
            'electric_bill_name_correction',
            'ownership_transfer',
            'commercial_to_domestic',
            'bank_passbook_name_correction',
            'bank_passbook_update',
            'other'
        ];

        let finalActionType = action_type;
        if (!finalActionType || !VALID_ACTION_TYPES.includes(finalActionType)) {
            if (doc.doc_type === 'electric_bill') finalActionType = 'electric_bill_name_correction';
            else if (doc.doc_type === 'bank_passbook') finalActionType = 'bank_passbook_name_correction';
            else if (['land_ror', 'aadhaar_card'].includes(doc.doc_type)) finalActionType = 'ownership_transfer';
            else finalActionType = 'other';
        }

        // 2. Update document status to 'action_required'
        const updatedDoc = await client.query(`
            UPDATE documents
            SET status = 'action_required', reject_reason = $1
            WHERE id = $2
            RETURNING *
        `, [detail, id]);

        // 3. Create entry in action_required if project exists
        let actionItem = null;
        if (doc.project_id) {
            const actionRes = await client.query(`
                INSERT INTO action_required (project_id, action_type, detail, raised_by, status)
                VALUES ($1, $2, $3, $4, 'open')
                RETURNING *
            `, [doc.project_id, finalActionType, detail, validUserBy]);
            actionItem = actionRes.rows[0];

            // 4. Update project current_status to 'action_required'
            await client.query(`
                UPDATE projects
                SET current_status = 'action_required', updated_at = now()
                WHERE id = $1
            `, [doc.project_id]);

            // 5. Record in status_history
            const VALID_PROJECT_STATUSES = [
                'new_registration', 'doc_requested', 'doc_uploaded', 'doc_verified', 'action_required',
                'action_required_bank', 'work_in_progress', 'processing_fee_paid', 'registration_no_generated',
                'master_data_pending', 'name_corrected', 'ownership_changed', 'type_converted',
                'pending_with_discom', 'security_deposit_pending', 'security_deposit_paid', 'psa_agreement_done',
                'pmsgy_done', 'loan_applied', 'loan_approved', 'loan_rejected', 'line_up_given',
                'materials_delivered', 'installation_in_progress', 'installation_done', 'installation_uploaded_pmsgy',
                'net_metering_applied', 'net_metering_rts_pending', 'net_metering_payment_pending',
                'net_metering_agreement_done', 'inspection_report_submitted', 'site_activity', 'approval_desk',
                'service_release', 'service_released', 'meter_installed', 'project_commissioned',
                'subsidy_redeemed', 'subsidy_return', 'subsidy_pending', 'subsidy_disbursed_cfa',
                'subsidy_disbursed_sfa', 'project_handover_pending', 'project_handed_over'
            ];
            const fromStatus = (doc.current_status && VALID_PROJECT_STATUSES.includes(doc.current_status)) ? doc.current_status : null;

            await client.query(`
                INSERT INTO status_history (project_id, from_status, to_status, changed_by, remarks)
                VALUES ($1, $2, 'action_required', $3, $4)
            `, [doc.project_id, fromStatus, validUserBy, `Document Flagged: ${detail}`]);
        }

        await client.query("COMMIT");

        try {
            notifyUsers({
                targetRoles: ['admin', 'agent', 'doc_team', 'site_manager'],
                projectId: doc.project_id || null,
                title: `Document Flagged: ${doc.doc_type?.replace(/_/g, ' ')}`,
                body: `Flagged by Document Desk. Reason: ${detail}`
            });
        } catch { /* notification catch */ }

        res.status(200).json({
            message: "Document successfully flagged for correction",
            data: {
                document: updatedDoc.rows[0],
                action: actionItem
            }
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error in flagDocument:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

export const uploadDocument = async (req, res) => {
    let uploadedObject;
    try {
        const { consumer_id, doc_type, file_name, geo_lat, geo_lng } = req.body;
        const uploaded_by = req.user?.userId || req.user?.id;
        if (!consumer_id || !doc_type || !req.file || !uploaded_by) {
            return res.status(400).json({ error: "consumer_id, doc_type, file, and an authenticated uploader are required" });
        }

        uploadedObject = await uploadFileToS3({ file: req.file, consumerId: consumer_id, documentType: doc_type });
        const result = await pool.query(`
            INSERT INTO documents (consumer_id, doc_type, file_url, file_name, mime_type, geo_lat, geo_lng, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [consumer_id, doc_type, uploadedObject.url, file_name || req.file.originalname, req.file.mimetype, geo_lat || null, geo_lng || null, uploaded_by]);

        res.status(201).json({ data: result.rows[0] });
    } catch (err) {
        if (uploadedObject?.key) await deleteFileFromS3(uploadedObject.key).catch(() => {});
        if (err.code === "23503") return res.status(400).json({ error: "Referenced consumer or authenticated user does not exist" });
        res.status(400).json({ error: err.message || "File upload failed" });
    }
};