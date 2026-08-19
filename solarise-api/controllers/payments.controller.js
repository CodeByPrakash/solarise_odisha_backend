import pool from "../config/db.js";
import { notifyUsers } from "../utils/notificationHelper.js";

// GET /api/payments - List all payments (filtered by user role)
export const getAllPayments = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const role = req.user?.role;
        let query = `
            SELECT 
                pay.id,
                pay.project_id,
                p.registration_no,
                c.first_name || ' ' || c.last_name AS consumer_name,
                pay.payment_type,
                pay.amount,
                pay.status,
                pay.reference_no,
                pay.paid_at,
                pay.recorded_by,
                u.first_name || ' ' || u.last_name AS recorded_by_name,
                pay.remarks,
                pay.created_at
            FROM payments pay
            JOIN projects p ON pay.project_id = p.id
            JOIN consumers c ON p.consumer_id = c.id
            LEFT JOIN users u ON pay.recorded_by = u.id
        `;
        const params = [];
        if (role === 'agent') {
            query += ` WHERE c.created_by = $1`;
            params.push(userId);
        } else if (role === 'site_manager') {
            query += ` WHERE (p.assigned_site_manager = $1 OR c.created_by = $1)`;
            params.push(userId);
        }
        query += ` ORDER BY pay.created_at DESC`;

        const result = await pool.query(query, params);
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/payments/:id - Get payment record by ID
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                pay.id,
                pay.project_id,
                p.registration_no,
                COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '') AS consumer_name,
                pay.payment_type,
                pay.amount,
                pay.status,
                pay.reference_no,
                pay.paid_at,
                pay.recorded_by,
                u.first_name || ' ' || u.last_name AS recorded_by_name,
                pay.remarks,
                pay.created_at
            FROM payments pay
            JOIN projects p ON pay.project_id = p.id
            JOIN consumers c ON p.consumer_id = c.id
            LEFT JOIN users u ON pay.recorded_by = u.id
            WHERE pay.id = $1
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Payment record not found" });
        }

        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 1. GET /api/payments/project/:projectId - All payments for a project
export const getPaymentsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const result = await pool.query(`
            SELECT 
                pay.id,
                pay.project_id,
                pay.payment_type,
                pay.amount,
                pay.status,
                pay.reference_no,
                pay.paid_at,
                pay.recorded_by,
                u.first_name || ' ' || u.last_name AS recorded_by_name,
                pay.remarks,
                pay.created_at
            FROM payments pay
            LEFT JOIN users u ON pay.recorded_by = u.id
            WHERE pay.project_id = $1
            ORDER BY pay.created_at DESC
        `, [projectId]);

        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. POST /api/payments - Record a payment
export const createPayment = async (req, res) => {
    try {
        const { project_id, payment_type, amount, recorded_by, reference_no, remarks, paid_at } = req.body;

        if (!project_id || !payment_type || amount === undefined || !recorded_by) {
            return res.status(400).json({ error: "project_id, payment_type, amount, and recorded_by are required" });
        }

        if (amount < 0) {
            return res.status(400).json({ error: "amount must be >= 0" });
        }

        const result = await pool.query(`
            INSERT INTO payments (project_id, payment_type, amount, recorded_by, reference_no, remarks, paid_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [project_id, payment_type, amount, recorded_by, reference_no || null, remarks || null, paid_at || null]);

        const newPayment = result.rows[0];
        notifyUsers({
            targetRoles: ['admin', 'agent'],
            projectId: newPayment.project_id,
            title: `New Payment Recorded`,
            body: `Accounts logged ₹${newPayment.amount} (${newPayment.payment_type?.replace(/_/g, ' ')}) for Project #${newPayment.project_id}.`
        });

        res.status(201).json({ data: newPayment });
    } catch (err) {
        if (err.code === "23503") {
            return res.status(400).json({ error: "Referenced project or user does not exist" });
        }
        if (err.code === "22P02") {
            return res.status(400).json({ error: "Invalid payment_type value" });
        }
        res.status(500).json({ error: err.message });
    }
};

// 3. PATCH /api/payments/:id/status - Update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reference_no, paid_at, remarks } = req.body;

        if (!status) {
            return res.status(400).json({ error: "status is required" });
        }

        // If marking as 'paid', auto-set paid_at if not provided
        let result;
        if (status === "paid") {
            result = await pool.query(`
                UPDATE payments
                SET status = $1,
                    reference_no = COALESCE($2, reference_no),
                    paid_at = COALESCE($3, paid_at, now()),
                    remarks = COALESCE($4, remarks)
                WHERE id = $5
                RETURNING *
            `, [status, reference_no, paid_at, remarks, id]);
        } else {
            result = await pool.query(`
                UPDATE payments
                SET status = $1,
                    reference_no = COALESCE($2, reference_no),
                    remarks = COALESCE($3, remarks)
                WHERE id = $4
                RETURNING *
            `, [status, reference_no, remarks, id]);
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Payment not found" });
        }

        const updatedPayment = result.rows[0];
        notifyUsers({
            targetRoles: ['admin', 'agent'],
            projectId: updatedPayment.project_id,
            title: `Payment ${status.toUpperCase()}`,
            body: `Payment of ₹${updatedPayment.amount} status changed to ${status}.`
        });

        res.status(200).json({ message: "Payment status updated", data: result.rows[0] });
    } catch (err) {
        if (err.code === "22P02") {
            return res.status(400).json({ error: "Invalid status value" });
        }
        res.status(500).json({ error: err.message });
    }
};

// 4. GET /api/payments/pending - All pending payments
export const getPendingPayments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                pay.id,
                pay.project_id,
                p.registration_no,
                COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '') AS consumer_name,
                pay.payment_type,
                pay.amount,
                pay.status,
                pay.recorded_by,
                u.first_name || ' ' || u.last_name AS recorded_by_name,
                pay.remarks,
                pay.created_at
            FROM payments pay
            JOIN projects p ON pay.project_id = p.id
            JOIN consumers c ON p.consumer_id = c.id
            LEFT JOIN users u ON pay.recorded_by = u.id
            WHERE pay.status = 'pending'
            ORDER BY pay.created_at ASC
        `);

        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. GET /api/payments/summary - Aggregate totals by type
export const getPaymentsSummary = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                payment_type,
                COUNT(*)::INTEGER AS count,
                SUM(amount)::NUMERIC(12,2) AS total_amount,
                SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)::NUMERIC(12,2) AS paid_amount,
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END)::NUMERIC(12,2) AS pending_amount
            FROM payments
            GROUP BY payment_type
            ORDER BY total_amount DESC
        `);

        const grandTotal = await pool.query(`
            SELECT
                COUNT(*)::INTEGER AS total_payments,
                SUM(amount)::NUMERIC(12,2) AS grand_total,
                SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)::NUMERIC(12,2) AS total_paid,
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END)::NUMERIC(12,2) AS total_pending
            FROM payments
        `);

        res.status(200).json({
            summary: grandTotal.rows[0],
            by_type: result.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
