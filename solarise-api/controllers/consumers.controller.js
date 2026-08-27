import pool from "../config/db.js";
import { validateMobile, validateEmail, validatePAN, validateAadhaar } from "../utils/validators.js";

/**
 * Splits a full_name string into first_name and last_name.
 * first_name = first word, last_name = remaining words (or null).
 */
const splitFullName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return { first_name: '', last_name: null };
    const trimmed = fullName.trim();
    const spaceIndex = trimmed.indexOf(' ');
    if (spaceIndex === -1) {
        return { first_name: trimmed, last_name: null };
    }
    return {
        first_name: trimmed.substring(0, spaceIndex),
        last_name: trimmed.substring(spaceIndex + 1).trim() || null,
    };
};

const validateConsumerData = (data) => {
    if (data.phone_primary) {
        const check = validateMobile(data.phone_primary, "Primary phone number");
        if (!check.valid) return check.error;
    }
    if (data.phone_secondary) {
        const check = validateMobile(data.phone_secondary, "Secondary phone number");
        if (!check.valid) return check.error;
    }
    if (data.contact_person_phone) {
        const check = validateMobile(data.contact_person_phone, "Contact person phone");
        if (!check.valid) return check.error;
    }
    if (data.phone_on_electric_bill) {
        const check = validateMobile(data.phone_on_electric_bill, "Phone on electric bill");
        if (!check.valid) return check.error;
    }
    if (data.email) {
        const check = validateEmail(data.email, "Consumer email");
        if (!check.valid) return check.error;
    }
    if (data.pan_no) {
        const check = validatePAN(data.pan_no);
        if (!check.valid) return check.error;
    }
    if (data.aadhaar_no) {
        const check = validateAadhaar(data.aadhaar_no);
        if (!check.valid) return check.error;
    }
    return null;
};

export const getAllConsumers = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const role = req.user?.role;

        let query = `
            SELECT c.*,
                   TRIM(CONCAT(c.first_name, ' ', COALESCE(c.last_name, ''))) AS full_name,
                   ab.name AS area_block_name,
                   u.first_name AS creator_first_name,
                   u.last_name AS creator_last_name,
                   u.role AS creator_role,
                   u.email AS creator_email
            FROM consumers c
            LEFT JOIN area_blocks ab ON c.area_block_id = ab.id
            LEFT JOIN users u ON c.created_by = u.id
        `;
        const conditions = [];
        const params = [];

        // Regular roles (agent, site_manager, accounts) ONLY see active consumers (is_active = TRUE)
        const canSeeInactive = ['admin', 'doc_team'].includes(role);
        if (!canSeeInactive) {
            conditions.push("c.is_active = TRUE");
        }

        if (role === 'agent') {
            params.push(userId);
            conditions.push(`c.created_by = $${params.length}`);
        } else if (role === 'site_manager') {
            params.push(userId);
            conditions.push(`(c.created_by = $${params.length} OR c.id IN (SELECT consumer_id FROM projects WHERE assigned_site_manager = $${params.length}))`);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY c.created_at DESC";

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
                    TRIM(CONCAT(c.first_name, ' ', COALESCE(c.last_name, ''))) AS full_name,
              ab.id AS area_block_id,
              ab.name AS area_block_name,
              u.first_name AS creator_first_name,
              u.last_name AS creator_last_name,
              u.role AS creator_role,
              u.email AS creator_email
       FROM consumers c
       LEFT JOIN area_blocks ab ON c.area_block_id = ab.id
       LEFT JOIN users u ON c.created_by = u.id
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

        const valError = validateConsumerData(req.body);
        if (valError) {
            return res.status(400).json({ error: valError });
        }

        // Split full_name into first_name and last_name
        const { first_name, last_name } = splitFullName(full_name);

        const effectiveCreatedBy = created_by || req.user?.userId || req.user?.id || 1;

        const result = await pool.query(
            `WITH inserted_consumer AS (
                INSERT INTO consumers (first_name, last_name, address, area_block_id, email, phone_primary, phone_secondary, contact_person_name, contact_person_phone, contact_person_relation, same_as_contact_person, name_on_electric_bill, phone_on_electric_bill, geo_lat, geo_lng, electric_consumer_no, age, aadhaar_no, pan_no, bank_account_no, payment_mode, land_owned_by_consumer, occupation, created_by, is_active)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24, TRUE)
                RETURNING *
            )
            SELECT i.id,
                   i.first_name,
                   i.last_name,
                   TRIM(CONCAT(i.first_name, ' ', COALESCE(i.last_name, ''))) AS full_name,
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
                   i.created_by,
                   u.first_name AS creator_first_name,
                   u.last_name AS creator_last_name,
                   u.role AS creator_role,
                   u.email AS creator_email
            FROM inserted_consumer i
            LEFT JOIN area_blocks ab ON i.area_block_id = ab.id
            LEFT JOIN users u ON i.created_by = u.id`,
            [first_name, last_name, address, area_block_id || 1, email, phone_primary, phone_secondary, contact_person_name, contact_person_phone, contact_person_relation, same_as_contact_person, name_on_electric_bill, phone_on_electric_bill, geo_lat, geo_lng, electric_consumer_no, age, aadhaar_no, pan_no, bank_account_no, payment_mode, land_owned_by_consumer, occupation, effectiveCreatedBy]
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

        const valError = validateConsumerData(req.body);
        if (valError) {
            return res.status(400).json({ error: valError });
        }

        // Split full_name into first_name and last_name
        const { first_name, last_name } = splitFullName(full_name);

        const result = await pool.query(
            `WITH updated_consumer AS (
        UPDATE consumers
        SET first_name = $1,
            last_name = $2,
            address = $3,
            area_block_id = $4,
            email = $5,
            phone_primary = $6,
            phone_secondary = $7,
            contact_person_name = $8,
            contact_person_phone = $9,
            contact_person_relation = $10,
            same_as_contact_person = $11,
            name_on_electric_bill = $12,
            phone_on_electric_bill = $13,
            geo_lat = $14,
            geo_lng = $15,
            electric_consumer_no = $16,
            age = $17,
            aadhaar_no = $18,
            pan_no = $19,
            bank_account_no = $20,
            payment_mode = $21,
            land_owned_by_consumer = $22,
            occupation = $23,
            updated_at = NOW()
        WHERE id = $24
        RETURNING *
      )
      SELECT u.*,
             TRIM(CONCAT(u.first_name, ' ', COALESCE(u.last_name, ''))) AS full_name,
             ab.id AS area_block_id,
             ab.name AS area_block_name
      FROM updated_consumer u
      LEFT JOIN area_blocks ab
        ON u.area_block_id = ab.id`,
            [
                first_name,
                last_name,
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
            "UPDATE consumers SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id, first_name, last_name, is_active",
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
            "UPDATE consumers SET is_active = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id, first_name, last_name, is_active",
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