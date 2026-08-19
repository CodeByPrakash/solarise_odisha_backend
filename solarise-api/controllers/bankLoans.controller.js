import pool from "../config/db.js";

// 1. GET /api/bank-loans - List all with consumer name
export const getAllBankLoans = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                bl.id,
                bl.consumer_id,
                COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '') AS consumer_name,
                c.phone_primary AS consumer_phone,
                c.payment_mode,
                bl.is_ghanbani_land,
                bl.bank_name,
                bl.loan_amount,
                bl.applied_at,
                bl.approved_at,
                bl.rejected_at,
                bl.remarks
            FROM bank_loans bl
            JOIN consumers c ON bl.consumer_id = c.id
            ORDER BY bl.id DESC
        `);
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getBankLoanByConsumer = async (req, res) => {
    try {
        const { consumerId } = req.params;
        const result = await pool.query(`
            SELECT 
                bl.id,
                bl.consumer_id,
                COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '') AS consumer_name,
                c.payment_mode,
                bl.is_ghanbani_land,
                bl.bank_name,
                bl.loan_amount,
                bl.applied_at,
                bl.approved_at,
                bl.rejected_at,
                bl.remarks
            FROM bank_loans bl
            JOIN consumers c ON bl.consumer_id = c.id
            WHERE bl.consumer_id = $1
        `, [consumerId]);
        if (result.rowCount === 0) {
            return res.status(200).json({ data: null, message: "No bank loan record found for this consumer" });
        }
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createBankLoan = async (req, res) => {
    try {
        const { consumer_id, is_ghanbani_land, bank_name, loan_amount, applied_at, remarks } = req.body;
        if (!consumer_id) {
            return res.status(400).json({ error: "consumer_id is required" });
        }
        // BUSINESS RULE: Verify consumer's payment_mode = 'bank_loan'
        const consumerCheck = await pool.query(
            "SELECT id, first_name, last_name, payment_mode FROM consumers WHERE id = $1",
            [consumer_id]
        );
        if (consumerCheck.rowCount === 0) {
            return res.status(404).json({ error: "Consumer not found" });
        }
        if (consumerCheck.rows[0].payment_mode !== "bank_loan") {
            return res.status(400).json({
                error: "Cannot create bank loan: consumer's payment_mode is 'cash', not 'bank_loan'",
                consumer_payment_mode: consumerCheck.rows[0].payment_mode
            });
        }
        const result = await pool.query(`
            INSERT INTO bank_loans (consumer_id, is_ghanbani_land, bank_name, loan_amount, applied_at, remarks)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [consumer_id, is_ghanbani_land || null, bank_name || null, loan_amount || null, applied_at || null, remarks || null]);
        res.status(201).json({ data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "A bank loan already exists for this consumer" });
        }
        res.status(500).json({ error: err.message });
    }
};

export const updateBankLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_ghanbani_land, bank_name, loan_amount, applied_at, approved_at, rejected_at, remarks } = req.body;
        const result = await pool.query(`
            UPDATE bank_loans
            SET is_ghanbani_land = COALESCE($1, is_ghanbani_land),
                bank_name = COALESCE($2, bank_name),
                loan_amount = COALESCE($3, loan_amount),
                applied_at = COALESCE($4, applied_at),
                approved_at = COALESCE($5, approved_at),
                rejected_at = COALESCE($6, rejected_at),
                remarks = COALESCE($7, remarks)
            WHERE id = $8
            RETURNING *
        `, [is_ghanbani_land, bank_name, loan_amount, applied_at, approved_at, rejected_at, remarks, id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Bank loan not found" });
        }
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// 5. DELETE /api/bank-loans/:id - Delete loan
export const deleteBankLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM bank_loans WHERE id = $1 RETURNING id, consumer_id",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Bank loan not found" });
        }
        res.status(200).json({ message: "Bank loan deleted", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};