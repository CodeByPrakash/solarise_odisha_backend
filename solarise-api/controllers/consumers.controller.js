import pool from "../config/db.js";

export const getAllConsumers = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const role = req.user?.role;

        let query = "SELECT id, full_name, address, area_block_id, email, phone_primary, phone_secondary, contact_person_name, contact_person_phone, contact_person_relation, same_as_contact_person, name_on_electric_bill, phone_on_electric_bill, geo_lat, geo_lng, electric_consumer_no, age, aadhaar_no, pan_no, bank_account_no, payment_mode, land_owned_by_consumer, occupation, is_active, created_by, created_at FROM consumers";
        const conditions = [];
        const params = [];

        // Regular roles (agent, site_manager, accounts) ONLY see active consumers (is_active = TRUE)
        const canSeeInactive = ['admin', 'doc_team'].includes(role);
        if (!canSeeInactive) {
            conditions.push("is_active = TRUE");
        }

        if (role === 'agent') {
            params.push(userId);
            conditions.push(`created_by = $${params.length}`);
        } else if (role === 'site_manager') {
            params.push(userId);
            conditions.push(`(created_by = $${params.length} OR id IN (SELECT consumer_id FROM projects WHERE assigned_site_manager = $${params.length}))`);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY created_at DESC";

        const result = await pool.query(query, params);
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getConsumerById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.user?.role;
        const result = await pool.query(
            `SELECT c.*,
              ab.id AS area_block_id,
              ab.name AS area_block_name
       FROM consumers c
       LEFT JOIN area_blocks ab ON c.area_block_id = ab.id
       WHERE c.id = $1`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Consumer not found" });
        }

        const consumer = result.rows[0];

        // Non-admin/doc_team cannot view deactivated consumers
        const canSeeInactive = ['admin', 'doc_team'].includes(role);
        if (!canSeeInactive && consumer.is_active === false) {
            return res.status(403).json({ error: "Access denied. Consumer account is deactivated." });
        }

        res.status(200).json({ data: consumer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createConsumer = async (req, res) => {
    try {
        const {
            full_name,
            address,
            area_block_id,
            email,
            phone_primary,
            phone_secondary,
            contact_person_name,
            contact_person_phone,
            contact_person_relation,
            same_as_contact_person,
            name_on_electric_bill,
            phone_on_electric_bill,
            geo_lat,
            geo_lng,
            electric_consumer_no,
            age,
            aadhaar_no,
            pan_no,
            bank_account_no,
            payment_mode,
            land_owned_by_consumer,
            occupation,
            created_by
        } = req.body;

        const effectiveCreatedBy = created_by || req.user?.userId || req.user?.id || 1;

        const result = await pool.query(
            `WITH inserted_consumer AS (
                INSERT INTO consumers (full_name, address, area_block_id, email, phone_primary, phone_secondary, contact_person_name, contact_person_phone, contact_person_relation, same_as_contact_person, name_on_electric_bill, phone_on_electric_bill, geo_lat, geo_lng, electric_consumer_no, age, aadhaar_no, pan_no, bank_account_no, payment_mode, land_owned_by_consumer, occupation, created_by, is_active)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23, TRUE)
                RETURNING *
            )
            SELECT i.id,
                   i.full_name,
                   i.address,
                   ab.id AS area_block_id,
                   ab.name AS area_block_name,
                   i.email,
                   i.phone_primary,
                   i.phone_secondary,
                   i.contact_person_name,
                   i.contact_person_phone,
                   i.contact_person_relation,
                   i.same_as_contact_person,
                   i.name_on_electric_bill,
                   i.phone_on_electric_bill,
                   i.geo_lat,
                   i.geo_lng,
                   i.electric_consumer_no,
                   i.age,
                   i.aadhaar_no,
                   i.pan_no,
                   i.bank_account_no,
                   i.payment_mode,
                   i.land_owned_by_consumer,
                   i.occupation,
                   i.is_active,
                   i.created_by
            FROM inserted_consumer i
            LEFT JOIN area_blocks ab ON i.area_block_id = ab.id`,
            [full_name, address, area_block_id || 1, email, phone_primary, phone_secondary, contact_person_name, contact_person_phone, contact_person_relation, same_as_contact_person, name_on_electric_bill, phone_on_electric_bill, geo_lat, geo_lng, electric_consumer_no, age, aadhaar_no, pan_no, bank_account_no, payment_mode, land_owned_by_consumer, occupation, effectiveCreatedBy]
        );
        res.status(200).json({
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

export const updateConsumer = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            full_name,
            address,
            area_block_id,
            email,
            phone_primary,
            phone_secondary,
            contact_person_name,
            contact_person_phone,
            contact_person_relation,
            same_as_contact_person,
            name_on_electric_bill,
            phone_on_electric_bill,
            geo_lat,
            geo_lng,
            electric_consumer_no,
            age,
            aadhaar_no,
            pan_no,
            bank_account_no,
            payment_mode,
            land_owned_by_consumer,
            occupation
        } = req.body;

        const result = await pool.query(
            `WITH updated_consumer AS (
        UPDATE consumers
        SET full_name = $1,
            address = $2,
            area_block_id = $3,
            email = $4,
            phone_primary = $5,
            phone_secondary = $6,
            contact_person_name = $7,
            contact_person_phone = $8,
            contact_person_relation = $9,
            same_as_contact_person = $10,
            name_on_electric_bill = $11,
            phone_on_electric_bill = $12,
            geo_lat = $13,
            geo_lng = $14,
            electric_consumer_no = $15,
            age = $16,
            aadhaar_no = $17,
            pan_no = $18,
            bank_account_no = $19,
            payment_mode = $20,
            land_owned_by_consumer = $21,
            occupation = $22,
            updated_at = NOW()
        WHERE id = $23
        RETURNING *
      )
      SELECT u.*,
             ab.id AS area_block_id,
             ab.name AS area_block_name
      FROM updated_consumer u
      LEFT JOIN area_blocks ab
        ON u.area_block_id = ab.id`,
            [
                full_name,
                address,
                area_block_id || 1,
                email,
                phone_primary,
                phone_secondary,
                contact_person_name,
                contact_person_phone,
                contact_person_relation,
                same_as_contact_person,
                name_on_electric_bill,
                phone_on_electric_bill,
                geo_lat,
                geo_lng,
                electric_consumer_no,
                age,
                aadhaar_no,
                pan_no,
                bank_account_no,
                payment_mode,
                land_owned_by_consumer,
                occupation,
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Consumer not found" });
        }

        res.status(200).json({ data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Deactivate Consumer (Sets is_active = FALSE)
export const deactivateConsumer = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE consumers SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id, full_name, is_active",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Consumer not found" });
        }
        res.status(200).json({
            message: "Consumer deactivated. Record preserved in database.",
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Activate Consumer (Sets is_active = TRUE)
export const activateConsumer = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE consumers SET is_active = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id, full_name, is_active",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Consumer not found" });
        }
        res.status(200).json({
            message: "Consumer activated successfully.",
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteConsumer = deactivateConsumer;
export const restoreConsumer = activateConsumer;