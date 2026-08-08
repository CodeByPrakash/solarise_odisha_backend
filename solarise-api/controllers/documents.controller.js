import pool from "../config/db.js";

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
                u1.full_name AS uploaded_by_name,
                d.uploaded_at,
                d.verified_by,
                u2.full_name AS verified_by_name,
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
            SET status = 'verified', verified_by = $1, verified_at = now()
            WHERE id = $2 AND status = 'uploaded'
            RETURNING *
        `, [verified_by, id]);
        if (result.rowCount === 0) {
            // Check if the doc exists at all
            const check = await pool.query("SELECT id, status FROM documents WHERE id = $1", [id]);
            if (check.rowCount === 0) {
                return res.status(404).json({ error: "Document not found" });
            }
            return res.status(400).json({ error: `Cannot verify document with status '${check.rows[0].status}'` });
        }
        res.status(200).json({ message: "Document verified", data: result.rows[0] });
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
            WHERE id = $3 AND status = 'uploaded'
            RETURNING * 
        `, [verified_by, reject_reason, id]);
        if (result.rowCount === 0) {
            const check = await pool.query("SELECT id, status FROM documents WHERE id = $1", [id]);
            if (check.rowCount === 0) {
                return res.status(404).json({ error: "Document not found" });
            }
            return res.status(400).json({ error: `Cannot reject document with status '${check.rows[0].status}'` });
        }
        res.status(200).json({ message: "Document rejected", data: result.rows[0] });
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