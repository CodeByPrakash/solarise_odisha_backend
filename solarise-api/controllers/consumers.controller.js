import pool from "../config/db.js";
export const getAllConsumers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT full_name, address, area_block_id, email, phone_primary, phone_secondary, contact_person_name, contact_person_phone, contact_person_relation, same_as_contact_person, name_on_electric_bill, phone_on_electric_bill, geo_lat, geo_lng, electric_consumer_no, age, aadhaar_no, pan_no, bank_account_no, payment_mode, land_owned_by_consumer, occupation, created_by, created_at from consumers ORDER BY created_at DESC"
        );
        res.status(200).json({ count: result.rowCount, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
