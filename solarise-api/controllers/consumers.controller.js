import pool from "../config/db.js";
export const getAllConsumers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT full_name, address, area_block_id, email, phone_primary, phone_secondary, contact_person_name, contact_person_phone, contact_person_relation, same_as_contact_person, name_on_electric_bill, phone_on_electric_bill, geo_lat, geo_lng, electric_consumer_no, age, aadhaar_no, pan_no, bank_account_no, payment_mode, land_owned_by_consumer, occupation, created_by, created_at FROM consumers ORDER BY created_at DESC"
        );
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// export const getConsumerById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const result = await pool.query(
//             "SELECT full_name, address, area_block_id, email, phone_primary, phone_secondary, contact_person_name, contact_person_phone, contact_person_relation, same_as_contact_person, name_on_electric_bill, phone_on_electric_bill, geo_lat, geo_lng, electric_consumer_no, age, aadhaar_no, pan_no, bank_account_no, payment_mode, land_owned_by_consumer, occupation, created_by, created_at FROM consumers WHERE id=$1", [id]
//         );
//         res.status(200).json({
//             data: result.rows
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: error.message
//         });
//     }
// }

export const getConsumerById = async (req, res) => {
    try {
        const { id } = req.params;
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

        res.status(200).json({ data: result.rows[0] });
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
        const result = await pool.query(
            `WITH inserted_consumer AS (
                INSERT INTO consumers (full_name, address, area_block_id, email, phone_primary, phone_secondary, contact_person_name, contact_person_phone, contact_person_relation, same_as_contact_person, name_on_electric_bill, phone_on_electric_bill, geo_lat, geo_lng, electric_consumer_no, age, aadhaar_no, pan_no, bank_account_no, payment_mode, land_owned_by_consumer, occupation, created_by)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
                RETURNING *
            )
            SELECT i.full_name,
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
                   i.created_by
            FROM inserted_consumer i
            LEFT JOIN area_blocks ab ON i.area_block_id = ab.id`,
            [full_name, address, area_block_id, email, phone_primary, phone_secondary, contact_person_name, contact_person_phone, contact_person_relation, same_as_contact_person, name_on_electric_bill, phone_on_electric_bill, geo_lat, geo_lng, electric_consumer_no, age, aadhaar_no, pan_no, bank_account_no, payment_mode, land_owned_by_consumer, occupation, created_by]
        );
        res.status(200).json({
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

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

export const deleteConsumer = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM consumers WHERE id = $1 RETURNING id, full_name",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Consumer not found" });
        }
        res.status(200).json({ message: "Consumer deleted", data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
