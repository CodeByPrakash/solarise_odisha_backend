-- ============================================================
-- ADP Green Energies — Complete Test Data Script
-- Generated: 2026-07-23
-- PostgreSQL 15+
-- ============================================================

-- ============================================================
-- 1. ENUMS (Run these first if not already created)
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('agent', 'site_manager', 'doc_team', 'accounts', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_mode') THEN
        CREATE TYPE payment_mode AS ENUM ('cash', 'bank_loan');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'occupation_type') THEN
        CREATE TYPE occupation_type AS ENUM ('self_employed', 'farmer', 'housewife', 'government_service', 'private_job','other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM (
            'electric_bill', 'aadhaar_card', 'pan_card', 'bank_passbook', 'roof_geotagged_photo',
            'land_ror', 'sale_deed', 'malgujani',
            'bank_statement_6m', 'salary_slip', 'it_return',
            'beneficiary_aadhaar', 'noc', 'form_1', 'self_undertaking', 'death_certificate', 'legal_heir_certificate',
            'material_sealing_video', 'customer_consent_video', 'plant_geotagged_photo', 'inverter_serial_photo',
            'inverter_setup_photo', 'earthing_photo', 'la_photo',
            'inspection_report', 'psa_agreement', 'net_metering_agreement', 'other'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM ('uploaded', 'verified', 'rejected', 'action_required');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_type') THEN
        CREATE TYPE action_type AS ENUM (
            'electric_bill_name_correction', 'ownership_transfer', 'commercial_to_domestic',
            'bank_passbook_name_correction', 'bank_passbook_update', 'other'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_status') THEN
        CREATE TYPE action_status AS ENUM ('open', 'doc_uploaded', 'in_review', 'resolved', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM (
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
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'installation_item') THEN
        CREATE TYPE installation_item AS ENUM (
            'structure', 'panel', 'inverter_looping', 'ac_wiring', 'dc_wiring',
            'lightning_arrester', 'earthing', 'earthing_pit', 'concreting', 'output_service'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
        CREATE TYPE payment_type AS ENUM (
            'processing_fee', 'security_deposit', 'consumer_payment', 'loan_disbursal', 'subsidy_cfa', 'subsidy_sfa'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');
    END IF;
END $$;

-- ============================================================
-- 2. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name TEXT NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'agent',
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS area_blocks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS consumers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name TEXT NOT NULL,
    address TEXT NOT NULL,
    area_block_id BIGINT NOT NULL REFERENCES area_blocks(id),
    email CITEXT,
    phone_primary VARCHAR(15) NOT NULL,
    phone_secondary VARCHAR(15),
    contact_person_name TEXT,
    contact_person_phone VARCHAR(15),
    contact_person_relation TEXT,
    same_as_contact_person BOOLEAN NOT NULL DEFAULT FALSE,
    name_on_electric_bill TEXT NOT NULL,
    phone_on_electric_bill VARCHAR(15),
    geo_lat NUMERIC(9,6),
    geo_lng NUMERIC(9,6),
    electric_consumer_no TEXT NOT NULL UNIQUE,
    age SMALLINT CHECK (age BETWEEN 18 AND 120),
    surpassed_mac BOOLEAN GENERATED ALWAYS AS (age > 64) STORED,
    aadhaar_no CHAR(12) CHECK (aadhaar_no ~ '^[0-9]{12}$'),
    pan_no CHAR(10) CHECK (pan_no ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'),
    bank_account_no TEXT,
    payment_mode payment_mode NOT NULL,
    land_owned_by_consumer BOOLEAN NOT NULL DEFAULT TRUE,
    occupation occupation_type,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consumer_transfers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consumer_id BIGINT NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
    from_agent_id BIGINT NOT NULL REFERENCES users(id),
    to_agent_id BIGINT NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected')),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_consumer_transfer_agents CHECK (from_agent_id <> to_agent_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_consumer_transfers_pending
    ON consumer_transfers (consumer_id)
    WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS bank_loans (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consumer_id BIGINT NOT NULL UNIQUE REFERENCES consumers(id) ON DELETE CASCADE,
    is_ghanbani_land BOOLEAN,
    bank_name TEXT,
    loan_amount NUMERIC(12,2),
    applied_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    remarks TEXT
);

CREATE TABLE IF NOT EXISTS projects (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consumer_id BIGINT NOT NULL UNIQUE REFERENCES consumers(id) ON DELETE CASCADE,
    current_status project_status NOT NULL DEFAULT 'new_registration',
    registration_no TEXT UNIQUE,
    capacity_kw NUMERIC(6,2),
    assigned_site_manager BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consumer_id BIGINT NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
    doc_type document_type NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT,
    mime_type TEXT,
    geo_lat NUMERIC(9,6),
    geo_lng NUMERIC(9,6),
    status document_status NOT NULL DEFAULT 'uploaded',
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    verified_by BIGINT REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    reject_reason TEXT,
    version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS status_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    from_status project_status,
    to_status project_status NOT NULL,
    changed_by BIGINT NOT NULL REFERENCES users(id),
    remarks TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS action_required (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    action_type action_type NOT NULL,
    detail TEXT,
    status action_status NOT NULL DEFAULT 'open',
    raised_by BIGINT NOT NULL REFERENCES users(id),
    raised_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    assigned_to BIGINT REFERENCES users(id),
    resolved_by BIGINT REFERENCES users(id),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ownership_transfers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    action_id BIGINT NOT NULL UNIQUE REFERENCES action_required(id) ON DELETE CASCADE,
    all_ror_members_alive BOOLEAN NOT NULL,
    beneficiary_name TEXT NOT NULL,
    remarks TEXT
);

CREATE TABLE IF NOT EXISTS material_deliveries (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    delivered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    dcr_number TEXT,
    recorded_by BIGINT NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS installation_progress (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    item installation_item NOT NULL,
    weight_pct SMALLINT NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    done_by BIGINT REFERENCES users(id),
    done_at TIMESTAMPTZ,
    UNIQUE (project_id, item)
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    payment_type payment_type NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    status payment_status NOT NULL DEFAULT 'pending',
    reference_no TEXT,
    paid_at TIMESTAMPTZ,
    recorded_by BIGINT NOT NULL REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_consumers_block ON consumers(area_block_id);
CREATE INDEX IF NOT EXISTS idx_consumers_creator ON consumers(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_consumer ON documents(consumer_id, doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status) WHERE status = 'uploaded';
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(current_status);
CREATE INDEX IF NOT EXISTS idx_history_project ON status_history(project_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_open ON action_required(project_id) WHERE status <> 'resolved';
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(user_id) WHERE NOT is_read;

-- ============================================================
-- 4. TEST DATA
-- ============================================================

-- 4.1 USERS
INSERT INTO users (first_name, last_name, email, phone, role, password_hash, is_active, created_at) VALUES
('Rajesh', 'Sharma', 'rajesh.sharma@adpgreen.com', '+919876543210', 'admin', '$2b$12$hashedpassword1', TRUE, '2026-01-15 09:00:00+05:30'),
('Priya', 'Patel', 'priya.patel@adpgreen.com', '+919876543211', 'agent', '$2b$12$hashedpassword2', TRUE, '2026-01-20 10:30:00+05:30'),
('Amit', 'Kumar', 'amit.kumar@adpgreen.com', '+919876543212', 'agent', '$2b$12$hashedpassword3', TRUE, '2026-02-01 11:00:00+05:30'),
('Sneha', 'Gupta', 'sneha.gupta@adpgreen.com', '+919876543213', 'doc_team', '$2b$12$hashedpassword4', TRUE, '2026-01-25 14:00:00+05:30'),
('Vikram', 'Rao', 'vikram.rao@adpgreen.com', '+919876543214', 'site_manager', '$2b$12$hashedpassword5', TRUE, '2026-02-10 09:00:00+05:30'),
('Anita', 'Desai', 'anita.desai@adpgreen.com', '+919876543215', 'accounts', '$2b$12$hashedpassword6', TRUE, '2026-02-05 10:00:00+05:30'),
('Rahul', 'Verma', 'rahul.verma@adpgreen.com', '+919876543216', 'agent', '$2b$12$hashedpassword7', TRUE, '2026-03-01 08:30:00+05:30'),
('Meena', 'Joshi', 'meena.joshi@adpgreen.com', '+919876543217', 'doc_team', '$2b$12$hashedpassword8', TRUE, '2026-03-10 11:30:00+05:30'),
('Sunil', 'Nair', 'sunil.nair@adpgreen.com', '+919876543218', 'site_manager', '$2b$12$hashedpassword9', TRUE, '2026-03-15 09:00:00+05:30'),
('Deepa', 'Reddy', 'deepa.reddy@adpgreen.com', '+919876543219', 'agent', '$2b$12$hashedpassword10', TRUE, '2026-04-01 10:00:00+05:30');

-- 4.2 AREA BLOCKS
INSERT INTO area_blocks (name, is_active) VALUES
('Kalamboli', TRUE), ('Dharmasala', TRUE), ('Panvel', TRUE), ('Kharghar', TRUE),
('Nerul', TRUE), ('Vashi', TRUE), ('Belapur', TRUE), ('Airoli', TRUE),
('Ghansoli', TRUE), ('Turbhe', TRUE), ('Kopar Khairane', TRUE), ('Rabale', TRUE),
('Mahape', TRUE), ('Taloja', TRUE), ('Ulwe', TRUE);

-- 4.3 CONSUMERS
INSERT INTO consumers (full_name, address, area_block_id, email, phone_primary, phone_secondary,
    contact_person_name, contact_person_phone, contact_person_relation, same_as_contact_person,
    name_on_electric_bill, phone_on_electric_bill, geo_lat, geo_lng, electric_consumer_no,
    age, aadhaar_no, pan_no, bank_account_no, payment_mode, land_owned_by_consumer, occupation, created_by, created_at) VALUES
('Arun Mehta', 'Flat 402, Green Valley Apartments, Sector 12', 1, 'arun.mehta@gmail.com', '+919811223344', '+919811223345',
    'Arun Mehta', '+919811223344', 'Self', TRUE, 'Arun Kumar Mehta', '+919811223344', 19.0258, 73.0892, 'MSEB1234567890',
    35, '123456789012', 'ABCDE1234F', 'SBIN0012345678', 'cash', TRUE, 'salaried', 2, '2026-04-15 10:00:00+05:30'),
('Suresh Iyer', '45, Lakshmi Nagar, Near Bus Stand', 2, 'suresh.iyer@yahoo.com', '+919822334455', NULL,
    'Suresh Iyer', '+919822334455', 'Self', TRUE, 'S. Iyer', '+919822334455', 19.1185, 73.0298, 'MSEB2345678901',
    42, '234567890123', 'FGHIJ5678K', 'HDFC0023456789', 'bank_loan', TRUE, 'businessman', 2, '2026-04-20 11:30:00+05:30'),
('Gopal Yadav', 'Village Post Office, Block B', 3, NULL, '+919833445566', NULL,
    'Ravi Yadav', '+919833445567', 'Son', FALSE, 'Gopal Prasad Yadav', '+919833445566', 19.2045, 73.1302, 'MSEB3456789012',
    68, '345678901234', 'KLMNO9012P', 'PNB0034567890', 'cash', TRUE, 'farmer', 3, '2026-04-25 09:00:00+05:30'),
('Fatima Sheikh', 'House No. 78, Mahim Road', 4, 'fatima.sheikh@outlook.com', '+919844556677', '+919844556678',
    'Fatima Sheikh', '+919844556677', 'Self', TRUE, 'Fatima Bano Sheikh', '+919844556677', 19.0368, 73.0634, 'MSEB4567890123',
    29, '456789012345', 'PQRST3456U', 'ICIC0045678901', 'bank_loan', FALSE, 'self_employed', 3, '2026-05-01 14:00:00+05:30'),
('Lakshmi Devi', 'Plot 23, Shanti Colony', 5, NULL, '+919855667788', NULL,
    'Ramesh Kumar', '+919855667789', 'Husband', FALSE, 'Lakshmi Devi', '+919855667788', 19.0489, 73.0123, 'MSEB5678901234',
    52, '567890123456', 'UVWXY7890Z', 'AXIS0056789012', 'cash', TRUE, 'housewife', 2, '2026-05-05 10:30:00+05:30'),
('Vijay Malhotra', 'Tower B, Flat 1203, River View Complex', 1, 'vijay.malhotra@gmail.com', '+919866778899', NULL,
    'Vijay Malhotra', '+919866778899', 'Self', TRUE, 'Vijay Singh Malhotra', '+919866778899', 19.0156, 73.0956, 'MSEB6789012345',
    31, '678901234567', 'ZABCD0123E', 'KOTAK0067890123', 'bank_loan', TRUE, 'salaried', 7, '2026-05-10 09:00:00+05:30'),
('Rakesh Agarwal', 'Shop 12, Main Market Road', 6, 'rakesh.agarwal@business.com', '+919877889900', '+919877889901',
    'Rakesh Agarwal', '+919877889900', 'Self', TRUE, 'R. K. Agarwal', '+919877889900', 19.0723, 73.0987, 'MSEB7890123456',
    45, '789012345678', 'EFGHI4567J', 'YESB0078901234', 'cash', TRUE, 'businessman', 7, '2026-05-15 11:00:00+05:30'),
('Balram Singh', 'Gram Panchayat Road, Village Khed', 7, NULL, '+919888990011', NULL,
    'Balram Singh', '+919888990011', 'Self', TRUE, 'Balram Pratap Singh', '+919888990011', 19.1567, 73.0456, 'MSEB8901234567',
    55, '890123456789', 'KLMNO8901P', 'BOB0089012345', 'bank_loan', TRUE, 'farmer', 10, '2026-05-20 08:30:00+05:30'),
('Kamla Bai', 'Ward No. 5, Behind Temple', 8, NULL, '+919899001122', NULL,
    'Suresh Bai', '+919899001123', 'Son', FALSE, 'Kamla Devi', '+919899001122', 19.0234, 73.0789, 'MSEB9012345678',
    70, '901234567890', 'QRSTU2345V', 'CANR0090123456', 'cash', TRUE, 'housewife', 10, '2026-05-25 10:00:00+05:30'),
('Neha Kapoor', 'A-404, Sunshine Residency, Plot 45', 9, 'neha.kapoor@itfirm.com', '+919900112233', NULL,
    'Neha Kapoor', '+919900112233', 'Self', TRUE, 'Neha R. Kapoor', '+919900112233', 19.0890, 73.0567, 'MSEB0123456789',
    28, '012345678901', 'WXYZA5678B', 'IDFC0001234567', 'bank_loan', TRUE, 'salaried', 2, '2026-06-01 09:30:00+05:30');

-- 4.4 BANK LOANS
INSERT INTO bank_loans (consumer_id, is_ghanbani_land, bank_name, loan_amount, applied_at, approved_at, rejected_at, remarks) VALUES
(2, FALSE, 'State Bank of India', 250000.00, '2026-04-25 10:00:00+05:30', '2026-05-05 14:30:00+05:30', NULL, 'Loan approved for 3kW system'),
(4, TRUE, 'HDFC Bank', 320000.00, '2026-05-10 09:00:00+05:30', NULL, NULL, 'Under review - awaiting IT returns'),
(6, FALSE, 'ICICI Bank', 280000.00, '2026-05-20 11:00:00+05:30', '2026-06-01 16:00:00+05:30', NULL, 'Approved with reduced interest rate'),
(8, TRUE, 'Bank of Baroda', 150000.00, '2026-05-30 08:00:00+05:30', NULL, NULL, 'Pending land verification'),
(10, FALSE, 'Axis Bank', 350000.00, '2026-06-10 10:00:00+05:30', NULL, NULL, 'Initial application submitted');

-- 4.5 PROJECTS
INSERT INTO projects (consumer_id, current_status, registration_no, capacity_kw, assigned_site_manager, created_at, updated_at) VALUES
(1, 'project_handed_over', 'ADP-PMSGY-2026-001', 3.00, 5, '2026-04-15 10:00:00+05:30', '2026-07-10 16:00:00+05:30'),
(2, 'pmsgy_done', 'ADP-PMSGY-2026-002', 3.50, 5, '2026-04-20 11:30:00+05:30', '2026-06-25 14:00:00+05:30'),
(3, 'installation_in_progress', 'ADP-PMSGY-2026-003', 2.50, 9, '2026-04-25 09:00:00+05:30', '2026-07-15 10:00:00+05:30'),
(4, 'doc_verified', NULL, 4.00, NULL, '2026-05-01 14:00:00+05:30', '2026-06-20 11:30:00+05:30'),
(5, 'action_required', NULL, 2.00, NULL, '2026-05-05 10:30:00+05:30', '2026-06-28 09:00:00+05:30'),
(6, 'loan_approved', NULL, 3.20, NULL, '2026-05-10 09:00:00+05:30', '2026-06-15 16:00:00+05:30'),
(7, 'net_metering_applied', 'ADP-PMSGY-2026-007', 5.00, 5, '2026-05-15 11:00:00+05:30', '2026-07-05 10:00:00+05:30'),
(8, 'materials_delivered', 'ADP-PMSGY-2026-008', 2.00, 9, '2026-05-20 08:30:00+05:30', '2026-07-12 09:00:00+05:30'),
(9, 'action_required', NULL, 1.50, NULL, '2026-05-25 10:00:00+05:30', '2026-06-30 11:00:00+05:30'),
(10, 'doc_uploaded', NULL, 4.50, NULL, '2026-06-01 09:30:00+05:30', '2026-06-18 14:00:00+05:30');

-- 4.6 DOCUMENTS
INSERT INTO documents (consumer_id, doc_type, file_url, file_name, mime_type, geo_lat, geo_lng, status, uploaded_by, uploaded_at, verified_by, verified_at, reject_reason, version) VALUES
-- Consumer 1: All verified (completed project)
(1, 'electric_bill', 'https://storage.adpgreen.com/docs/1_electric_bill.pdf', 'electric_bill_apr2026.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-15 10:30:00+05:30', 4, '2026-04-16 11:00:00+05:30', NULL, 1),
(1, 'aadhaar_card', 'https://storage.adpgreen.com/docs/1_aadhaar.pdf', 'aadhaar_front_back.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-15 10:35:00+05:30', 4, '2026-04-16 11:05:00+05:30', NULL, 1),
(1, 'pan_card', 'https://storage.adpgreen.com/docs/1_pan.pdf', 'pan_card.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-15 10:40:00+05:30', 4, '2026-04-16 11:10:00+05:30', NULL, 1),
(1, 'bank_passbook', 'https://storage.adpgreen.com/docs/1_passbook.pdf', 'passbook_first_page.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-15 10:45:00+05:30', 4, '2026-04-16 11:15:00+05:30', NULL, 1),
(1, 'land_ror', 'https://storage.adpgreen.com/docs/1_ror.pdf', 'record_of_rights.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-15 10:50:00+05:30', 4, '2026-04-16 11:20:00+05:30', NULL, 1),
(1, 'roof_geotagged_photo', 'https://storage.adpgreen.com/docs/1_roof.jpg', 'roof_photo_geotagged.jpg', 'image/jpeg', 19.0258, 73.0892, 'verified', 2, '2026-04-15 11:00:00+05:30', 4, '2026-04-16 11:30:00+05:30', NULL, 1),
(1, 'plant_geotagged_photo', 'https://storage.adpgreen.com/docs/1_plant.jpg', 'plant_installed.jpg', 'image/jpeg', 19.0258, 73.0892, 'verified', 5, '2026-06-20 10:00:00+05:30', 4, '2026-06-21 09:00:00+05:30', NULL, 1),
(1, 'inverter_serial_photo', 'https://storage.adpgreen.com/docs/1_inverter_serial.jpg', 'inverter_serial.jpg', 'image/jpeg', 19.0258, 73.0892, 'verified', 5, '2026-06-20 10:05:00+05:30', 4, '2026-06-21 09:05:00+05:30', NULL, 1),
(1, 'psa_agreement', 'https://storage.adpgreen.com/docs/1_psa.pdf', 'psa_signed.pdf', 'application/pdf', NULL, NULL, 'verified', 4, '2026-05-20 14:00:00+05:30', 4, '2026-05-21 10:00:00+05:30', NULL, 1),
(1, 'net_metering_agreement', 'https://storage.adpgreen.com/docs/1_net_metering.pdf', 'net_metering_agreement.pdf', 'application/pdf', NULL, NULL, 'verified', 4, '2026-06-25 11:00:00+05:30', 4, '2026-06-26 09:00:00+05:30', NULL, 1),

-- Consumer 2: Bank loan docs
(2, 'electric_bill', 'https://storage.adpgreen.com/docs/2_electric_bill.pdf', 'electric_bill_mar2026.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-20 12:00:00+05:30', 4, '2026-04-21 10:00:00+05:30', NULL, 1),
(2, 'aadhaar_card', 'https://storage.adpgreen.com/docs/2_aadhaar.pdf', 'aadhaar_scan.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-20 12:05:00+05:30', 4, '2026-04-21 10:05:00+05:30', NULL, 1),
(2, 'pan_card', 'https://storage.adpgreen.com/docs/2_pan.pdf', 'pan_card_scan.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-20 12:10:00+05:30', 4, '2026-04-21 10:10:00+05:30', NULL, 1),
(2, 'bank_passbook', 'https://storage.adpgreen.com/docs/2_passbook.pdf', 'passbook_sbi.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-20 12:15:00+05:30', 4, '2026-04-21 10:15:00+05:30', NULL, 1),
(2, 'land_ror', 'https://storage.adpgreen.com/docs/2_ror.pdf', 'ror_dharmasala.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-20 12:20:00+05:30', 4, '2026-04-21 10:20:00+05:30', NULL, 1),
(2, 'roof_geotagged_photo', 'https://storage.adpgreen.com/docs/2_roof.jpg', 'roof_dharmasala.jpg', 'image/jpeg', 19.1185, 73.0298, 'verified', 2, '2026-04-20 12:30:00+05:30', 4, '2026-04-21 10:30:00+05:30', NULL, 1),
(2, 'bank_statement_6m', 'https://storage.adpgreen.com/docs/2_bank_stmt.pdf', '6months_statement.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-22 09:00:00+05:30', 4, '2026-04-23 11:00:00+05:30', NULL, 1),
(2, 'salary_slip', 'https://storage.adpgreen.com/docs/2_salary.pdf', 'last_3_salary_slips.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-04-22 09:05:00+05:30', 4, '2026-04-23 11:05:00+05:30', NULL, 1),
(2, 'psa_agreement', 'https://storage.adpgreen.com/docs/2_psa.pdf', 'psa_agreement_signed.pdf', 'application/pdf', NULL, NULL, 'verified', 4, '2026-05-30 14:00:00+05:30', 4, '2026-05-31 10:00:00+05:30', NULL, 1),

-- Consumer 3: Partial installation
(3, 'electric_bill', 'https://storage.adpgreen.com/docs/3_electric_bill.pdf', 'electric_bill_apr2026.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-04-25 09:30:00+05:30', 4, '2026-04-26 10:00:00+05:30', NULL, 1),
(3, 'aadhaar_card', 'https://storage.adpgreen.com/docs/3_aadhaar.pdf', 'aadhaar_elderly.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-04-25 09:35:00+05:30', 4, '2026-04-26 10:05:00+05:30', NULL, 1),
(3, 'pan_card', 'https://storage.adpgreen.com/docs/3_pan.pdf', 'pan_farmer.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-04-25 09:40:00+05:30', 4, '2026-04-26 10:10:00+05:30', NULL, 1),
(3, 'bank_passbook', 'https://storage.adpgreen.com/docs/3_passbook.pdf', 'passbook_pnb.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-04-25 09:45:00+05:30', 4, '2026-04-26 10:15:00+05:30', NULL, 1),
(3, 'land_ror', 'https://storage.adpgreen.com/docs/3_ror.pdf', 'ror_village.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-04-25 09:50:00+05:30', 4, '2026-04-26 10:20:00+05:30', NULL, 1),
(3, 'roof_geotagged_photo', 'https://storage.adpgreen.com/docs/3_roof.jpg', 'roof_village.jpg', 'image/jpeg', 19.2045, 73.1302, 'verified', 3, '2026-04-25 10:00:00+05:30', 4, '2026-04-26 10:30:00+05:30', NULL, 1),
(3, 'material_sealing_video', 'https://storage.adpgreen.com/docs/3_sealing.mp4', 'material_sealing.mp4', 'video/mp4', 19.2045, 73.1302, 'verified', 9, '2026-07-01 09:00:00+05:30', 4, '2026-07-02 10:00:00+05:30', NULL, 1),
(3, 'customer_consent_video', 'https://storage.adpgreen.com/docs/3_consent.mp4', 'customer_consent.mp4', 'video/mp4', 19.2045, 73.1302, 'verified', 9, '2026-07-01 09:05:00+05:30', 4, '2026-07-02 10:05:00+05:30', NULL, 1),
(3, 'plant_geotagged_photo', 'https://storage.adpgreen.com/docs/3_plant.jpg', 'plant_partial.jpg', 'image/jpeg', 19.2045, 73.1302, 'uploaded', 9, '2026-07-15 10:00:00+05:30', NULL, NULL, NULL, 1),

-- Consumer 4: Doc verified, land not owned
(4, 'electric_bill', 'https://storage.adpgreen.com/docs/4_electric_bill.pdf', 'electric_bill_may2026.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-05-01 14:30:00+05:30', 4, '2026-05-02 10:00:00+05:30', NULL, 1),
(4, 'aadhaar_card', 'https://storage.adpgreen.com/docs/4_aadhaar.pdf', 'aadhaar_selfemployed.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-05-01 14:35:00+05:30', 4, '2026-05-02 10:05:00+05:30', NULL, 1),
(4, 'pan_card', 'https://storage.adpgreen.com/docs/4_pan.pdf', 'pan_selfemployed.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-05-01 14:40:00+05:30', 4, '2026-05-02 10:10:00+05:30', NULL, 1),
(4, 'bank_passbook', 'https://storage.adpgreen.com/docs/4_passbook.pdf', 'passbook_icici.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-05-01 14:45:00+05:30', 4, '2026-05-02 10:15:00+05:30', NULL, 1),
(4, 'sale_deed', 'https://storage.adpgreen.com/docs/4_sale_deed.pdf', 'sale_deed_not_owned.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-05-01 14:50:00+05:30', 4, '2026-05-02 10:20:00+05:30', NULL, 1),
(4, 'roof_geotagged_photo', 'https://storage.adpgreen.com/docs/4_roof.jpg', 'roof_kharghar.jpg', 'image/jpeg', 19.0368, 73.0634, 'verified', 3, '2026-05-01 15:00:00+05:30', 4, '2026-05-02 10:30:00+05:30', NULL, 1),
(4, 'bank_statement_6m', 'https://storage.adpgreen.com/docs/4_bank_stmt.pdf', '6months_icici.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-05-05 09:00:00+05:30', 4, '2026-05-06 11:00:00+05:30', NULL, 1),
(4, 'it_return', 'https://storage.adpgreen.com/docs/4_it_return.pdf', 'it_return_ay2025.pdf', 'application/pdf', NULL, NULL, 'verified', 3, '2026-05-05 09:05:00+05:30', 4, '2026-05-06 11:05:00+05:30', NULL, 1),

-- Consumer 5: Action required - name correction (re-uploaded v2)
(5, 'electric_bill', 'https://storage.adpgreen.com/docs/5_electric_bill_v1.pdf', 'electric_bill_wrong_name.pdf', 'application/pdf', NULL, NULL, 'rejected', 2, '2026-05-05 11:00:00+05:30', 4, '2026-05-06 10:00:00+05:30', 'Name on bill does not match consumer name. Please upload corrected bill.', 1),
(5, 'electric_bill', 'https://storage.adpgreen.com/docs/5_electric_bill_v2.pdf', 'electric_bill_corrected.pdf', 'application/pdf', NULL, NULL, 'uploaded', 2, '2026-06-28 09:30:00+05:30', NULL, NULL, NULL, 2),
(5, 'aadhaar_card', 'https://storage.adpgreen.com/docs/5_aadhaar.pdf', 'aadhaar_housewife.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-05-05 11:05:00+05:30', 4, '2026-05-06 10:05:00+05:30', NULL, 1),
(5, 'pan_card', 'https://storage.adpgreen.com/docs/5_pan.pdf', 'pan_housewife.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-05-05 11:10:00+05:30', 4, '2026-05-06 10:10:00+05:30', NULL, 1),
(5, 'bank_passbook', 'https://storage.adpgreen.com/docs/5_passbook.pdf', 'passbook_axis.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-05-05 11:15:00+05:30', 4, '2026-05-06 10:15:00+05:30', NULL, 1),
(5, 'land_ror', 'https://storage.adpgreen.com/docs/5_ror.pdf', 'ror_nerul.pdf', 'application/pdf', NULL, NULL, 'verified', 2, '2026-05-05 11:20:00+05:30', 4, '2026-05-06 10:20:00+05:30', NULL, 1),
(5, 'roof_geotagged_photo', 'https://storage.adpgreen.com/docs/5_roof.jpg', 'roof_nerul.jpg', 'image/jpeg', 19.0489, 73.0123, 'verified', 2, '2026-05-05 11:30:00+05:30', 4, '2026-05-06 10:30:00+05:30', NULL, 1),

-- Consumer 6: Loan approved
(6, 'electric_bill', 'https://storage.adpgreen.com/docs/6_electric_bill.pdf', 'electric_bill_may2026.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-10 09:30:00+05:30', 8, '2026-05-11 10:00:00+05:30', NULL, 1),
(6, 'aadhaar_card', 'https://storage.adpgreen.com/docs/6_aadhaar.pdf', 'aadhaar_salaried.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-10 09:35:00+05:30', 8, '2026-05-11 10:05:00+05:30', NULL, 1),
(6, 'pan_card', 'https://storage.adpgreen.com/docs/6_pan.pdf', 'pan_salaried.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-10 09:40:00+05:30', 8, '2026-05-11 10:10:00+05:30', NULL, 1),
(6, 'bank_passbook', 'https://storage.adpgreen.com/docs/6_passbook.pdf', 'passbook_kotak.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-10 09:45:00+05:30', 8, '2026-05-11 10:15:00+05:30', NULL, 1),
(6, 'land_ror', 'https://storage.adpgreen.com/docs/6_ror.pdf', 'ror_kalamboli.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-10 09:50:00+05:30', 8, '2026-05-11 10:20:00+05:30', NULL, 1),
(6, 'roof_geotagged_photo', 'https://storage.adpgreen.com/docs/6_roof.jpg', 'roof_kalamboli.jpg', 'image/jpeg', 19.0156, 73.0956, 'verified', 7, '2026-05-10 10:00:00+05:30', 8, '2026-05-11 10:30:00+05:30', NULL, 1),
(6, 'bank_statement_6m', 'https://storage.adpgreen.com/docs/6_bank_stmt.pdf', '6months_kotak.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-12 09:00:00+05:30', 8, '2026-05-13 11:00:00+05:30', NULL, 1),
(6, 'salary_slip', 'https://storage.adpgreen.com/docs/6_salary.pdf', 'salary_slips_3months.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-12 09:05:00+05:30', 8, '2026-05-13 11:05:00+05:30', NULL, 1),

-- Consumer 7: Net metering applied
(7, 'electric_bill', 'https://storage.adpgreen.com/docs/7_electric_bill.pdf', 'electric_bill_apr2026.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-15 11:30:00+05:30', 8, '2026-05-16 10:00:00+05:30', NULL, 1),
(7, 'aadhaar_card', 'https://storage.adpgreen.com/docs/7_aadhaar.pdf', 'aadhaar_businessman.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-15 11:35:00+05:30', 8, '2026-05-16 10:05:00+05:30', NULL, 1),
(7, 'pan_card', 'https://storage.adpgreen.com/docs/7_pan.pdf', 'pan_businessman.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-15 11:40:00+05:30', 8, '2026-05-16 10:10:00+05:30', NULL, 1),
(7, 'bank_passbook', 'https://storage.adpgreen.com/docs/7_passbook.pdf', 'passbook_yesbank.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-15 11:45:00+05:30', 8, '2026-05-16 10:15:00+05:30', NULL, 1),
(7, 'land_ror', 'https://storage.adpgreen.com/docs/7_ror.pdf', 'ror_vashi.pdf', 'application/pdf', NULL, NULL, 'verified', 7, '2026-05-15 11:50:00+05:30', 8, '2026-05-16 10:20:00+05:30', NULL, 1),
(7, 'roof_geotagged_photo', 'https://storage.adpgreen.com/docs/7_roof.jpg', 'roof_vashi.jpg', 'image/jpeg', 19.0723, 73.0987, 'verified', 7, '2026-05-15 12:00:00+05:30', 8, '2026-05-16 10:30:00+05:30', NULL, 1),
(7, 'psa_agreement', 'https://storage.adpgreen.com/docs/7_psa.pdf', 'psa_vashi_signed.pdf', 'application/pdf', NULL, NULL, 'verified', 8, '2026-06-10 14:00:00+05:30', 8, '2026-06-11 10:00:00+05:30', NULL, 1),
(7, 'net_metering_agreement', 'https://storage.adpgreen.com/docs/7_net_metering.pdf', 'net_metering_vashi.pdf', 'application/pdf', NULL, NULL, 'verified', 8, '2026-07-01 11:00:00+05:30', 8, '2026-07-02 09:00:00+05:30', NULL, 1),
(7, 'plant_geotagged_photo', 'https://storage.adpgreen.com/docs/7_plant.jpg', 'plant_vashi.jpg', 'image/jpeg', 19.0723, 73.0987, 'verified', 5, '2026-06-25 10:00:00+05:30', 8, '2026-06-26 09:00:00+05:30', NULL, 1),
(7, 'inverter_serial_photo', 'https://storage.adpgreen.com/docs/7_inverter_serial.jpg', 'inverter_serial_vashi.jpg', 'image/jpeg', 19.0723, 73.0987, 'verified', 5, '2026-06-25 10:05:00+05:30', 8, '2026-06-26 09:05:00+05:30', NULL, 1),
(7, 'earthing_photo', 'https://storage.adpgreen.com/docs/7_earthing.jpg', 'earthing_vashi.jpg', 'image/jpeg', 19.0723, 73.0987, 'verified', 5, '2026-06-25 10:10:00+05:30', 8, '2026-06-26 09:10:00+05:30', NULL, 1),
(7, 'la_photo', 'https://storage.adpgreen.com/docs/7_la.jpg', 'la_vashi.jpg', 'image/jpeg', 19.0723, 73.0987, 'verified', 5, '2026-06-25 10:15:00+05:30', 8, '2026-06-26 09:15:00+05:30', NULL, 1),

-- Consumer 8: Materials delivered
(8, 'electric_bill', 'https://storage.adpgreen.com/docs/8_electric_bill.pdf', 'electric_bill_may2026.pdf', 'application/pdf', NULL, NULL, 'verified', 10, '2026-05-20 09:00:00+05:30', 8, '2026-05-21 10:00:00+05:30', NULL, 1),
(8, 'aadhaar_card', 'https://storage.adpgreen.com/docs/8_aadhaar.pdf', 'aadhaar_farmer.pdf', 'application/pdf', NULL, NULL, 'verified', 10, '2026-05-20 09:05:00+05:30', 8, '2026-05-21 10:05:00+05:30', NULL, 1),
(8, 'pan_card', 'https://storage.adpgreen.com/docs/8_pan.pdf', 'pan_farmer.pdf', 'application/pdf', NULL, NULL, 'verified', 10, '2026-05-20 09:10:00+05:30', 8, '2026-05-21 10:10:00+05:30', NULL, 1),
(8, 'bank_passbook', 'https://storage.adpgreen.com/docs/8_passbook.pdf', 'passbook_bob.pdf', 'application/pdf', NULL, NULL, 'verified', 10, '2026-05-20 09:15:00+05:30', 8, '2026-05-21 10:15:00+05:30', NULL, 1),
(8, 'land_ror', 'https://storage.adpgreen.com/docs/8_ror.pdf', 'ror_ghanbani.pdf', 'application/pdf', NULL, NULL, 'verified', 10, '2026-05-20 09:20:00+05:30', 8, '2026-05-21 10:20:00+05:30', NULL, 1),
(8, 'roof_geotagged_photo', 'https://storage.adpgreen.com/docs/8_roof.jpg', 'roof_belapur.jpg', 'image/jpeg', 19.1567, 73.0456, 'verified', 10, '2026-05-20 09:30:00+05:30', 8, '2026-05-21 10:30:00+05:30', NULL, 1),
(8, 'bank_statement_6m', 'https://storage.adpgreen.com/docs/8_bank_stmt.pdf', '6months_bob.pdf', 'application/pdf', NULL, NULL, 'verified', 10, '2026-05-25 09:00:00+05:30', 8, '2026-05-26 11:00:00+05:30', NULL, 1),
(8, 'it_return', 'https://storage.adpgreen.com/docs/8_it_return.pdf', 'it_return_ay2025.pdf', 'application/pdf', NULL, NULL, 'verified', 10, '2026-05-25 09:05:00+05:30', 8, '2026-05-26 11:05:00+05:30', NULL, 1),
(8, 'material_sealing_video', 'https://storage.adpgreen.com/docs/8_sealing.mp4', 'material_sealing_belapur.mp4', 'video/mp4', 19.1567, 73.0456, 'verified', 9, '2026-07-10 09:00:00+05:30', 8, '2026-07-11 10:00:00+05:30', NULL, 1),
(8, 'customer_consent_video', 'https://storage.adpgreen.com/docs/8_consent.mp4', 'customer_consent_belapur.mp4', 'video/mp4', 19.1567, 73.0456, 'verified', 9, '2026-07-10 09:05:00+05:30', 8, '2026-07-11 10:05:00+05:30', NULL, 1),

-- Consumer 9: Ownership transfer docs uploaded
(9, 'electric_bill', 'https://storage.adpgreen.com/docs/9_electric_bill.pdf', 'electric_bill_may2026.pdf', 'application/pdf', NULL, NULL, 'action_required', 10, '2026-05-25 10:30:00+05:30', 8, '2026-05-26 10:00:00+05:30', 'Ownership transfer required - bill is in deceased husband name', 1),
(9, 'aadhaar_card', 'https://storage.adpgreen.com/docs/9_aadhaar.pdf', 'aadhaar_elderly_woman.pdf', 'application/pdf', NULL, NULL, 'verified', 10, '2026-05-25 10:35:00+05:30', 8, '2026-05-26 10:05:00+05:30', NULL, 1),
(9, 'pan_card', 'https://storage.adpgreen.com/docs/9_pan.pdf', 'pan_elderly.pdf', 'application/pdf', NULL, NULL, 'verified', 10, '2026-05-25 10:40:00+05:30', 8, '2026-05-26 10:10:00+05:30', NULL, 1),
(9, 'bank_passbook', 'https://storage.adpgreen.com/docs/9_passbook.pdf', 'passbook_canara.pdf', 'application/pdf', NULL, NULL, 'verified', 10, '2026-05-25 10:45:00+05:30', 8, '2026-05-26 10:15:00+05:30', NULL, 1),
(9, 'land_ror', 'https://storage.adpgreen.com/docs/9_ror.pdf', 'ror_airoli.pdf', 'application/pdf', NULL, NULL, 'verified', 10, '2026-05-25 10:50:00+05:30', 8, '2026-05-26 10:20:00+05:30', NULL, 1),
(9, 'roof_geotagged_photo', 'https://storage.adpgreen.com/docs/9_roof.jpg', 'roof_airoli.jpg', 'image/jpeg', 19.0234, 73.0789, 'verified', 10, '2026-05-25 11:00:00+05:30', 8, '2026-05-26 10:30:00+05:30', NULL, 1),
(9, 'death_certificate', 'https://storage.adpgreen.com/docs/9_death_cert.pdf', 'death_certificate_husband.pdf', 'application/pdf', NULL, NULL, 'uploaded', 10, '2026-06-30 11:30:00+05:30', NULL, NULL, NULL, 1),
(9, 'legal_heir_certificate', 'https://storage.adpgreen.com/docs/9_legal_heir.pdf', 'legal_heir_certificate.pdf', 'application/pdf', NULL, NULL, 'uploaded', 10, '2026-06-30 11:35:00+05:30', NULL, NULL, NULL, 1),
(9, 'beneficiary_aadhaar', 'https://storage.adpgreen.com/docs/9_ben_aadhaar.pdf', 'beneficiary_aadhaar_son.pdf', 'application/pdf', NULL, NULL, 'uploaded', 10, '2026-06-30 11:40:00+05:30', NULL, NULL, NULL, 1),
(9, 'noc', 'https://storage.adpgreen.com/docs/9_noc.pdf', 'noc_from_family.pdf', 'application/pdf', NULL, NULL, 'uploaded', 10, '2026-06-30 11:45:00+05:30', NULL, NULL, NULL, 1),

-- Consumer 10: Doc uploaded, awaiting verification
(10, 'electric_bill', 'https://storage.adpgreen.com/docs/10_electric_bill.pdf', 'electric_bill_jun2026.pdf', 'application/pdf', NULL, NULL, 'uploaded', 2, '2026-06-01 10:00:00+05:30', NULL, NULL, NULL, 1),
(10, 'aadhaar_card', 'https://storage.adpgreen.com/docs/10_aadhaar.pdf', 'aadhaar_itprofessional.pdf', 'application/pdf', NULL, NULL, 'uploaded', 2, '2026-06-01 10:05:00+05:30', NULL, NULL, NULL, 1),
(10, 'pan_card', 'https://storage.adpgreen.com/docs/10_pan.pdf', 'pan_itprofessional.pdf', 'application/pdf', NULL, NULL, 'uploaded', 2, '2026-06-01 10:10:00+05:30', NULL, NULL, NULL, 1),
(10, 'bank_passbook', 'https://storage.adpgreen.com/docs/10_passbook.pdf', 'passbook_idfc.pdf', 'application/pdf', NULL, NULL, 'uploaded', 2, '2026-06-01 10:15:00+05:30', NULL, NULL, NULL, 1),
(10, 'land_ror', 'https://storage.adpgreen.com/docs/10_ror.pdf', 'ror_ghansoli.pdf', 'application/pdf', NULL, NULL, 'uploaded', 2, '2026-06-01 10:20:00+05:30', NULL, NULL, NULL, 1),
(10, 'roof_geotagged_photo', 'https://storage.adpgreen.com/docs/10_roof.jpg', 'roof_ghansoli.jpg', 'image/jpeg', 19.0890, 73.0567, 'uploaded', 2, '2026-06-01 10:30:00+05:30', NULL, NULL, NULL, 1),
(10, 'bank_statement_6m', 'https://storage.adpgreen.com/docs/10_bank_stmt.pdf', '6months_idfc.pdf', 'application/pdf', NULL, NULL, 'uploaded', 2, '2026-06-05 09:00:00+05:30', NULL, NULL, NULL, 1),
(10, 'salary_slip', 'https://storage.adpgreen.com/docs/10_salary.pdf', 'salary_slips_3months.pdf', 'application/pdf', NULL, NULL, 'uploaded', 2, '2026-06-05 09:05:00+05:30', NULL, NULL, NULL, 1);

-- 4.7 STATUS HISTORY
INSERT INTO status_history (project_id, from_status, to_status, changed_by, remarks, changed_at) VALUES
-- Project 1: Full pipeline completion
(1, NULL, 'new_registration', 2, 'Lead created by agent Priya Patel', '2026-04-15 10:00:00+05:30'),
(1, 'new_registration', 'doc_uploaded', 2, 'All initial documents uploaded', '2026-04-15 11:30:00+05:30'),
(1, 'doc_uploaded', 'doc_verified', 4, 'All KYC and land documents verified', '2026-04-16 11:30:00+05:30'),
(1, 'doc_verified', 'work_in_progress', 4, 'Documents complete, moving to processing', '2026-04-17 10:00:00+05:30'),
(1, 'work_in_progress', 'processing_fee_paid', 6, 'Processing fee of Rs. 5,000 received', '2026-04-20 14:00:00+05:30'),
(1, 'processing_fee_paid', 'registration_no_generated', 4, 'Registration number ADP-PMSGY-2026-001 generated', '2026-04-22 09:00:00+05:30'),
(1, 'registration_no_generated', 'psa_agreement_done', 4, 'PSA agreement signed by consumer', '2026-05-20 14:00:00+05:30'),
(1, 'psa_agreement_done', 'pmsgy_done', 4, 'PM Surya Ghar registration complete', '2026-05-25 10:00:00+05:30'),
(1, 'pmsgy_done', 'line_up_given', 4, 'Line-up given to site manager Vikram Rao', '2026-05-28 09:00:00+05:30'),
(1, 'line_up_given', 'materials_delivered', 5, 'Materials delivered, DCR: DCR-2026-0456', '2026-06-01 10:00:00+05:30'),
(1, 'materials_delivered', 'installation_in_progress', 5, 'Installation started', '2026-06-02 08:00:00+05:30'),
(1, 'installation_in_progress', 'installation_done', 5, 'All installation items completed (100%)', '2026-06-20 16:00:00+05:30'),
(1, 'installation_done', 'installation_uploaded_pmsgy', 5, 'Installation photos uploaded to PMSGY portal', '2026-06-21 10:00:00+05:30'),
(1, 'installation_uploaded_pmsgy', 'net_metering_applied', 4, 'Net metering application submitted to MSEB', '2026-06-25 11:00:00+05:30'),
(1, 'net_metering_applied', 'net_metering_agreement_done', 4, 'Net metering agreement executed', '2026-06-28 14:00:00+05:30'),
(1, 'net_metering_agreement_done', 'inspection_report_submitted', 4, 'Inspection report submitted to discom', '2026-06-30 10:00:00+05:30'),
(1, 'inspection_report_submitted', 'service_released', 4, 'Service released by MSEB', '2026-07-05 09:00:00+05:30'),
(1, 'service_released', 'meter_installed', 5, 'Net meter installed at site', '2026-07-08 10:00:00+05:30'),
(1, 'meter_installed', 'project_commissioned', 4, 'Project commissioned successfully', '2026-07-10 12:00:00+05:30'),
(1, 'project_commissioned', 'subsidy_disbursed_cfa', 6, 'Central Financial Assistance of Rs. 78,000 disbursed', '2026-07-12 14:00:00+05:30'),
(1, 'subsidy_disbursed_cfa', 'subsidy_disbursed_sfa', 6, 'State Financial Assistance of Rs. 15,000 disbursed', '2026-07-13 10:00:00+05:30'),
(1, 'subsidy_disbursed_sfa', 'project_handed_over', 4, 'Project handed over to consumer Arun Mehta', '2026-07-15 16:00:00+05:30'),

-- Project 2: Up to PMSGY done
(2, NULL, 'new_registration', 2, 'Lead created by agent Priya Patel', '2026-04-20 11:30:00+05:30'),
(2, 'new_registration', 'doc_uploaded', 2, 'All documents including loan docs uploaded', '2026-04-22 12:00:00+05:30'),
(2, 'doc_uploaded', 'doc_verified', 4, 'All documents verified including bank statements', '2026-04-23 11:00:00+05:30'),
(2, 'doc_verified', 'work_in_progress', 4, 'Moving to processing phase', '2026-04-24 10:00:00+05:30'),
(2, 'work_in_progress', 'processing_fee_paid', 6, 'Processing fee received', '2026-04-25 14:00:00+05:30'),
(2, 'processing_fee_paid', 'registration_no_generated', 4, 'Registration ADP-PMSGY-2026-002 generated', '2026-04-28 09:00:00+05:30'),
(2, 'registration_no_generated', 'loan_applied', 4, 'Bank loan application submitted to SBI', '2026-04-30 10:00:00+05:30'),
(2, 'loan_applied', 'loan_approved', 4, 'SBI approved loan of Rs. 2,50,000', '2026-05-05 14:30:00+05:30'),
(2, 'loan_approved', 'psa_agreement_done', 4, 'PSA agreement signed', '2026-05-30 14:00:00+05:30'),
(2, 'psa_agreement_done', 'pmsgy_done', 4, 'PMSGY registration complete', '2026-06-25 10:00:00+05:30'),

-- Project 3: Installation in progress
(3, NULL, 'new_registration', 3, 'Lead created by agent Amit Kumar', '2026-04-25 09:00:00+05:30'),
(3, 'new_registration', 'doc_uploaded', 3, 'Documents uploaded', '2026-04-25 10:30:00+05:30'),
(3, 'doc_uploaded', 'doc_verified', 4, 'Documents verified - MAC warning noted (age 68)', '2026-04-26 10:30:00+05:30'),
(3, 'doc_verified', 'work_in_progress', 4, 'Processing started', '2026-04-27 09:00:00+05:30'),
(3, 'work_in_progress', 'processing_fee_paid', 6, 'Processing fee paid', '2026-04-28 14:00:00+05:30'),
(3, 'processing_fee_paid', 'registration_no_generated', 4, 'Registration ADP-PMSGY-2026-003 generated', '2026-04-30 09:00:00+05:30'),
(3, 'registration_no_generated', 'psa_agreement_done', 4, 'PSA signed', '2026-05-05 14:00:00+05:30'),
(3, 'psa_agreement_done', 'pmsgy_done', 4, 'PMSGY done', '2026-05-10 10:00:00+05:30'),
(3, 'pmsgy_done', 'line_up_given', 4, 'Assigned to site manager Sunil Nair', '2026-05-15 09:00:00+05:30'),
(3, 'line_up_given', 'materials_delivered', 9, 'Materials delivered, DCR: DCR-2026-0789', '2026-07-01 09:00:00+05:30'),
(3, 'materials_delivered', 'installation_in_progress', 9, 'Installation started by Sunil Nair', '2026-07-02 08:00:00+05:30'),

-- Project 4: Doc verified, awaiting processing fee
(4, NULL, 'new_registration', 3, 'Lead created by agent Amit Kumar', '2026-05-01 14:00:00+05:30'),
(4, 'new_registration', 'doc_uploaded', 3, 'Documents uploaded - land not owned by consumer, sale deed provided', '2026-05-05 10:00:00+05:30'),
(4, 'doc_uploaded', 'doc_verified', 4, 'All docs verified including IT returns for bank loan', '2026-05-06 11:00:00+05:30'),
(4, 'doc_verified', 'work_in_progress', 4, 'Awaiting processing fee payment', '2026-05-07 10:00:00+05:30'),

-- Project 5: Action required - name correction
(5, NULL, 'new_registration', 2, 'Lead created by agent Priya Patel', '2026-05-05 10:30:00+05:30'),
(5, 'new_registration', 'doc_uploaded', 2, 'Documents uploaded', '2026-05-05 11:30:00+05:30'),
(5, 'doc_uploaded', 'action_required', 4, 'Electric bill name mismatch - Action Required raised', '2026-05-06 10:00:00+05:30'),
(5, 'action_required', 'doc_uploaded', 2, 'Corrected electric bill uploaded (version 2)', '2026-06-28 09:30:00+05:30'),

-- Project 6: Loan approved
(6, NULL, 'new_registration', 7, 'Lead created by agent Rahul Verma', '2026-05-10 09:00:00+05:30'),
(6, 'new_registration', 'doc_uploaded', 7, 'All docs uploaded', '2026-05-12 09:00:00+05:30'),
(6, 'doc_uploaded', 'doc_verified', 8, 'Docs verified', '2026-05-13 11:00:00+05:30'),
(6, 'doc_verified', 'work_in_progress', 8, 'Processing started', '2026-05-14 10:00:00+05:30'),
(6, 'work_in_progress', 'processing_fee_paid', 6, 'Processing fee paid', '2026-05-15 14:00:00+05:30'),
(6, 'processing_fee_paid', 'registration_no_generated', 8, 'Registration generated', '2026-05-18 09:00:00+05:30'),
(6, 'registration_no_generated', 'loan_applied', 8, 'Loan applied to ICICI Bank', '2026-05-20 10:00:00+05:30'),
(6, 'loan_applied', 'loan_approved', 8, 'ICICI approved loan with reduced interest', '2026-06-01 16:00:00+05:30'),

-- Project 7: Net metering applied
(7, NULL, 'new_registration', 7, 'Lead created by agent Rahul Verma', '2026-05-15 11:00:00+05:30'),
(7, 'new_registration', 'doc_uploaded', 7, 'Docs uploaded', '2026-05-16 10:00:00+05:30'),
(7, 'doc_uploaded', 'doc_verified', 8, 'Docs verified', '2026-05-17 10:00:00+05:30'),
(7, 'doc_verified', 'work_in_progress', 8, 'Processing', '2026-05-18 09:00:00+05:30'),
(7, 'work_in_progress', 'processing_fee_paid', 6, 'Fee paid', '2026-05-20 14:00:00+05:30'),
(7, 'processing_fee_paid', 'registration_no_generated', 8, 'Reg: ADP-PMSGY-2026-007', '2026-05-22 09:00:00+05:30'),
(7, 'registration_no_generated', 'psa_agreement_done', 8, 'PSA signed', '2026-06-10 14:00:00+05:30'),
(7, 'psa_agreement_done', 'pmsgy_done', 8, 'PMSGY complete', '2026-06-15 10:00:00+05:30'),
(7, 'pmsgy_done', 'line_up_given', 8, 'Assigned to Vikram Rao', '2026-06-18 09:00:00+05:30'),
(7, 'line_up_given', 'materials_delivered', 5, 'Materials delivered', '2026-06-20 10:00:00+05:30'),
(7, 'materials_delivered', 'installation_in_progress', 5, 'Installation started', '2026-06-21 08:00:00+05:30'),
(7, 'installation_in_progress', 'installation_done', 5, 'Installation 100% complete', '2026-06-25 16:00:00+05:30'),
(7, 'installation_done', 'installation_uploaded_pmsgy', 5, 'Photos uploaded', '2026-06-26 10:00:00+05:30'),
(7, 'installation_uploaded_pmsgy', 'net_metering_applied', 8, 'Net metering application submitted', '2026-07-01 11:00:00+05:30'),

-- Project 8: Materials delivered
(8, NULL, 'new_registration', 10, 'Lead created by agent Deepa Reddy', '2026-05-20 08:30:00+05:30'),
(8, 'new_registration', 'doc_uploaded', 10, 'Docs uploaded', '2026-05-25 09:00:00+05:30'),
(8, 'doc_uploaded', 'doc_verified', 8, 'Docs verified', '2026-05-26 11:00:00+05:30'),
(8, 'doc_verified', 'work_in_progress', 8, 'Processing', '2026-05-27 10:00:00+05:30'),
(8, 'work_in_progress', 'processing_fee_paid', 6, 'Fee paid', '2026-05-28 14:00:00+05:30'),
(8, 'processing_fee_paid', 'registration_no_generated', 8, 'Reg: ADP-PMSGY-2026-008', '2026-05-30 09:00:00+05:30'),
(8, 'registration_no_generated', 'loan_applied', 8, 'Loan applied to BOB', '2026-06-01 10:00:00+05:30'),
(8, 'loan_applied', 'psa_agreement_done', 8, 'PSA signed', '2026-06-15 14:00:00+05:30'),
(8, 'psa_agreement_done', 'pmsgy_done', 8, 'PMSGY done', '2026-06-20 10:00:00+05:30'),
(8, 'pmsgy_done', 'line_up_given', 8, 'Assigned to Sunil Nair', '2026-06-25 09:00:00+05:30'),
(8, 'line_up_given', 'materials_delivered', 9, 'Materials delivered, DCR: DCR-2026-1023', '2026-07-10 09:00:00+05:30'),

-- Project 9: Action required - ownership transfer
(9, NULL, 'new_registration', 10, 'Lead created by agent Deepa Reddy', '2026-05-25 10:00:00+05:30'),
(9, 'new_registration', 'doc_uploaded', 10, 'Docs uploaded', '2026-05-25 11:00:00+05:30'),
(9, 'doc_uploaded', 'action_required', 8, 'Ownership transfer required - husband deceased, bill in his name', '2026-05-26 10:00:00+05:30'),
(9, 'action_required', 'doc_uploaded', 10, 'Ownership transfer docs uploaded: death cert, legal heir, NOC', '2026-06-30 11:30:00+05:30'),

-- Project 10: Doc uploaded, awaiting verification
(10, NULL, 'new_registration', 2, 'Lead created by agent Priya Patel', '2026-06-01 09:30:00+05:30'),
(10, 'new_registration', 'doc_uploaded', 2, 'All initial docs uploaded', '2026-06-05 09:30:00+05:30');

-- 4.8 ACTION REQUIRED
INSERT INTO action_required (project_id, action_type, detail, status, raised_by, raised_at, assigned_to, resolved_by, resolved_at) VALUES
(5, 'electric_bill_name_correction', 'Name on electric bill shows "Lakshmi Devi" but should match consumer name exactly. Consumer name is "Lakshmi Devi" - actually matches, but middle name missing on bill.', 'doc_uploaded', 4, '2026-05-06 10:00:00+05:30', 2, NULL, NULL),
(9, 'ownership_transfer', 'Electric bill is in name of deceased husband "Ram Prasad Bai". Need ownership transfer to Kamla Bai (widow) with son Suresh Bai as beneficiary.', 'doc_uploaded', 8, '2026-05-26 10:00:00+05:30', 10, NULL, NULL);

-- 4.9 OWNERSHIP TRANSFERS
INSERT INTO ownership_transfers (action_id, all_ror_members_alive, beneficiary_name, remarks) VALUES
(2, FALSE, 'Suresh Bai', 'Husband deceased. ROR has 3 members: deceased husband, Kamla Bai (widow), and Suresh Bai (son). Death certificate and legal heir certificate uploaded. NOC from all family members obtained.');

-- 4.10 MATERIAL DELIVERIES
INSERT INTO material_deliveries (project_id, delivered_at, dcr_number, recorded_by) VALUES
(1, '2026-06-01 10:00:00+05:30', 'DCR-2026-0456', 5),
(3, '2026-07-01 09:00:00+05:30', 'DCR-2026-0789', 9),
(7, '2026-06-20 10:00:00+05:30', 'DCR-2026-0891', 5),
(8, '2026-07-10 09:00:00+05:30', 'DCR-2026-1023', 9);

-- 4.11 INSTALLATION PROGRESS
INSERT INTO installation_progress (project_id, item, weight_pct, is_done, done_by, done_at) VALUES
-- Project 1: All done (100%)
(1, 'structure', 30, TRUE, 5, '2026-06-02 16:00:00+05:30'),
(1, 'panel', 10, TRUE, 5, '2026-06-05 14:00:00+05:30'),
(1, 'inverter_looping', 20, TRUE, 5, '2026-06-08 12:00:00+05:30'),
(1, 'ac_wiring', 14, TRUE, 5, '2026-06-10 10:00:00+05:30'),
(1, 'dc_wiring', 10, TRUE, 5, '2026-06-12 11:00:00+05:30'),
(1, 'lightning_arrester', 5, TRUE, 5, '2026-06-14 09:00:00+05:30'),
(1, 'earthing', 5, TRUE, 5, '2026-06-15 10:00:00+05:30'),
(1, 'earthing_pit', 3, TRUE, 5, '2026-06-16 08:00:00+05:30'),
(1, 'concreting', 3, TRUE, 5, '2026-06-17 14:00:00+05:30'),
(1, 'output_service', 0, TRUE, 5, '2026-06-18 10:00:00+05:30'),
-- Project 3: Partial (60%)
(3, 'structure', 30, TRUE, 9, '2026-07-03 16:00:00+05:30'),
(3, 'panel', 10, TRUE, 9, '2026-07-05 14:00:00+05:30'),
(3, 'inverter_looping', 20, TRUE, 9, '2026-07-08 12:00:00+05:30'),
(3, 'ac_wiring', 14, TRUE, 9, '2026-07-10 10:00:00+05:30'),
(3, 'dc_wiring', 10, FALSE, NULL, NULL),
(3, 'lightning_arrester', 5, FALSE, NULL, NULL),
(3, 'earthing', 5, FALSE, NULL, NULL),
(3, 'earthing_pit', 3, FALSE, NULL, NULL),
(3, 'concreting', 3, FALSE, NULL, NULL),
(3, 'output_service', 0, FALSE, NULL, NULL),
-- Project 7: All done (100%)
(7, 'structure', 30, TRUE, 5, '2026-06-22 16:00:00+05:30'),
(7, 'panel', 10, TRUE, 5, '2026-06-23 14:00:00+05:30'),
(7, 'inverter_looping', 20, TRUE, 5, '2026-06-23 16:00:00+05:30'),
(7, 'ac_wiring', 14, TRUE, 5, '2026-06-24 10:00:00+05:30'),
(7, 'dc_wiring', 10, TRUE, 5, '2026-06-24 14:00:00+05:30'),
(7, 'lightning_arrester', 5, TRUE, 5, '2026-06-24 16:00:00+05:30'),
(7, 'earthing', 5, TRUE, 5, '2026-06-25 08:00:00+05:30'),
(7, 'earthing_pit', 3, TRUE, 5, '2026-06-25 10:00:00+05:30'),
(7, 'concreting', 3, TRUE, 5, '2026-06-25 12:00:00+05:30'),
(7, 'output_service', 0, TRUE, 5, '2026-06-25 14:00:00+05:30'),
-- Project 8: Not started
(8, 'structure', 30, FALSE, NULL, NULL),
(8, 'panel', 10, FALSE, NULL, NULL),
(8, 'inverter_looping', 20, FALSE, NULL, NULL),
(8, 'ac_wiring', 14, FALSE, NULL, NULL),
(8, 'dc_wiring', 10, FALSE, NULL, NULL),
(8, 'lightning_arrester', 5, FALSE, NULL, NULL),
(8, 'earthing', 5, FALSE, NULL, NULL),
(8, 'earthing_pit', 3, FALSE, NULL, NULL),
(8, 'concreting', 3, FALSE, NULL, NULL),
(8, 'output_service', 0, FALSE, NULL, NULL);

-- 4.12 PAYMENTS
INSERT INTO payments (project_id, payment_type, amount, status, reference_no, paid_at, recorded_by, remarks, created_at) VALUES
-- Project 1: All completed
(1, 'processing_fee', 5000.00, 'paid', 'UTR-2026-001234', '2026-04-20 14:00:00+05:30', 6, 'Initial processing fee', '2026-04-20 14:00:00+05:30'),
(1, 'security_deposit', 10000.00, 'paid', 'UTR-2026-002345', '2026-05-15 10:00:00+05:30', 6, 'Security deposit to MSEB', '2026-05-15 10:00:00+05:30'),
(1, 'consumer_payment', 50000.00, 'paid', 'UTR-2026-003456', '2026-06-01 09:00:00+05:30', 6, 'First instalment', '2026-06-01 09:00:00+05:30'),
(1, 'consumer_payment', 50000.00, 'paid', 'UTR-2026-004567', '2026-06-15 10:00:00+05:30', 6, 'Second instalment', '2026-06-15 10:00:00+05:30'),
(1, 'consumer_payment', 45000.00, 'paid', 'UTR-2026-005678', '2026-07-01 11:00:00+05:30', 6, 'Final instalment', '2026-07-01 11:00:00+05:30'),
(1, 'subsidy_cfa', 78000.00, 'paid', 'CFA-2026-001', '2026-07-12 14:00:00+05:30', 6, 'Central Financial Assistance - 3kW system', '2026-07-12 14:00:00+05:30'),
(1, 'subsidy_sfa', 15000.00, 'paid', 'SFA-2026-001', '2026-07-13 10:00:00+05:30', 6, 'State Financial Assistance', '2026-07-13 10:00:00+05:30'),
-- Project 2
(2, 'processing_fee', 5000.00, 'paid', 'UTR-2026-006789', '2026-04-25 14:00:00+05:30', 6, 'Processing fee', '2026-04-25 14:00:00+05:30'),
(2, 'security_deposit', 12000.00, 'paid', 'UTR-2026-007890', '2026-05-20 10:00:00+05:30', 6, 'Security deposit - 3.5kW', '2026-05-20 10:00:00+05:30'),
(2, 'loan_disbursal', 250000.00, 'paid', 'SBI-LOAN-2026-002', '2026-05-10 16:00:00+05:30', 6, 'SBI loan disbursed to consumer account', '2026-05-10 16:00:00+05:30'),
-- Project 3
(3, 'processing_fee', 5000.00, 'paid', 'UTR-2026-008901', '2026-04-28 14:00:00+05:30', 6, 'Processing fee', '2026-04-28 14:00:00+05:30'),
(3, 'security_deposit', 8000.00, 'paid', 'UTR-2026-009012', '2026-05-10 10:00:00+05:30', 6, 'Security deposit - 2.5kW', '2026-05-10 10:00:00+05:30'),
(3, 'consumer_payment', 30000.00, 'paid', 'UTR-2026-010123', '2026-06-15 09:00:00+05:30', 6, 'First instalment', '2026-06-15 09:00:00+05:30'),
-- Project 4: Pending
(4, 'processing_fee', 5000.00, 'pending', NULL, NULL, 6, 'Awaiting consumer payment', '2026-05-10 10:00:00+05:30'),
-- Project 5: Pending
(5, 'processing_fee', 5000.00, 'pending', NULL, NULL, 6, 'On hold until action required resolved', '2026-05-10 10:00:00+05:30'),
-- Project 6
(6, 'processing_fee', 5000.00, 'paid', 'UTR-2026-011234', '2026-05-15 14:00:00+05:30', 6, 'Processing fee', '2026-05-15 14:00:00+05:30'),
(6, 'loan_disbursal', 280000.00, 'paid', 'ICICI-LOAN-2026-006', '2026-06-05 16:00:00+05:30', 6, 'ICICI loan disbursed', '2026-06-05 16:00:00+05:30'),
-- Project 7
(7, 'processing_fee', 5000.00, 'paid', 'UTR-2026-012345', '2026-05-20 14:00:00+05:30', 6, 'Processing fee', '2026-05-20 14:00:00+05:30'),
(7, 'security_deposit', 15000.00, 'paid', 'UTR-2026-013456', '2026-06-05 10:00:00+05:30', 6, 'Security deposit - 5kW', '2026-06-05 10:00:00+05:30'),
(7, 'consumer_payment', 75000.00, 'paid', 'UTR-2026-014567', '2026-06-25 09:00:00+05:30', 6, 'First instalment', '2026-06-25 09:00:00+05:30'),
-- Project 8
(8, 'processing_fee', 5000.00, 'paid', 'UTR-2026-015678', '2026-05-28 14:00:00+05:30', 6, 'Processing fee', '2026-05-28 14:00:00+05:30'),
(8, 'security_deposit', 6000.00, 'paid', 'UTR-2026-016789', '2026-06-10 10:00:00+05:30', 6, 'Security deposit - 2kW', '2026-06-10 10:00:00+05:30'),
-- Project 9: Pending
(9, 'processing_fee', 5000.00, 'pending', NULL, NULL, 6, 'On hold - ownership transfer pending', '2026-05-30 10:00:00+05:30'),
-- Project 10: Pending
(10, 'processing_fee', 5000.00, 'pending', NULL, NULL, 6, 'Awaiting doc verification', '2026-06-10 10:00:00+05:30');

-- 4.13 NOTIFICATIONS
INSERT INTO notifications (user_id, project_id, title, body, is_read, created_at) VALUES
-- Agent Priya (user 2)
(2, 1, 'Document Verified', 'All documents for Arun Mehta have been verified by doc team.', TRUE, '2026-04-16 11:30:00+05:30'),
(2, 1, 'Project Commissioned', 'Project for Arun Mehta has been commissioned successfully.', TRUE, '2026-07-10 12:00:00+05:30'),
(2, 5, 'Action Required', 'Electric bill name correction needed for Lakshmi Devi. Details: Name mismatch detected.', FALSE, '2026-05-06 10:00:00+05:30'),
(2, 5, 'Action Required Update', 'Corrected electric bill uploaded for Lakshmi Devi. Awaiting doc team review.', FALSE, '2026-06-28 09:30:00+05:30'),
(2, 10, 'Documents Uploaded', 'All initial documents uploaded for Neha Kapoor. Awaiting verification.', FALSE, '2026-06-05 09:30:00+05:30'),
-- Agent Amit (user 3)
(3, 3, 'MAC Warning', 'Consumer Gopal Yadav (age 68) has surpassed MAC. Please arrange alternate beneficiary.', TRUE, '2026-04-26 10:30:00+05:30'),
(3, 3, 'Installation Started', 'Installation has started for Gopal Yadav project by site manager Sunil Nair.', FALSE, '2026-07-02 08:00:00+05:30'),
(3, 4, 'Documents Verified', 'All documents for Fatima Sheikh verified. Awaiting processing fee.', TRUE, '2026-05-06 11:00:00+05:30'),
-- Doc Team Sneha (user 4)
(4, 1, 'New Document Upload', 'Agent Priya uploaded documents for Arun Mehta. Please verify.', TRUE, '2026-04-15 11:30:00+05:30'),
(4, 2, 'New Document Upload', 'Agent Priya uploaded documents for Suresh Iyer including loan docs.', TRUE, '2026-04-22 12:00:00+05:30'),
(4, 5, 'Action Required Resolved', 'Lakshmi Devi has uploaded corrected electric bill. Please review.', FALSE, '2026-06-28 09:30:00+05:30'),
(4, 10, 'New Document Upload', 'Agent Priya uploaded documents for Neha Kapoor. Please verify.', FALSE, '2026-06-05 09:30:00+05:30'),
-- Site Manager Vikram (user 5)
(5, 1, 'Line-up Assigned', 'Project Arun Mehta assigned to you. Materials to be delivered.', TRUE, '2026-05-28 09:00:00+05:30'),
(5, 1, 'Installation Complete', 'Installation for Arun Mehta completed. 100% checklist done.', TRUE, '2026-06-20 16:00:00+05:30'),
(5, 7, 'Line-up Assigned', 'Project Rakesh Agarwal assigned to you.', TRUE, '2026-06-18 09:00:00+05:30'),
(5, 7, 'Installation Complete', 'Installation for Rakesh Agarwal completed. 100% checklist done.', TRUE, '2026-06-25 16:00:00+05:30'),
-- Accounts Anita (user 6)
(6, 1, 'Processing Fee Received', 'Rs. 5,000 received from Arun Mehta.', TRUE, '2026-04-20 14:00:00+05:30'),
(6, 1, 'Subsidy Disbursed', 'CFA Rs. 78,000 and SFA Rs. 15,000 disbursed for Arun Mehta.', TRUE, '2026-07-13 10:00:00+05:30'),
(6, 2, 'Loan Disbursed', 'SBI loan of Rs. 2,50,000 disbursed for Suresh Iyer.', TRUE, '2026-05-10 16:00:00+05:30'),
-- Agent Rahul (user 7)
(7, 6, 'Loan Approved', 'ICICI Bank approved loan of Rs. 2,80,000 for Vijay Malhotra.', TRUE, '2026-06-01 16:00:00+05:30'),
(7, 7, 'Net Metering Applied', 'Net metering application submitted for Rakesh Agarwal.', TRUE, '2026-07-01 11:00:00+05:30'),
-- Doc Team Meena (user 8)
(8, 6, 'New Document Upload', 'Agent Rahul uploaded documents for Vijay Malhotra.', TRUE, '2026-05-12 09:00:00+05:30'),
(8, 7, 'New Document Upload', 'Agent Rahul uploaded documents for Rakesh Agarwal.', TRUE, '2026-05-16 10:00:00+05:30'),
(8, 9, 'Action Required', 'Ownership transfer needed for Kamla Bai. Husband deceased.', FALSE, '2026-05-26 10:00:00+05:30'),
(8, 9, 'Action Required Update', 'Kamla Bai uploaded ownership transfer documents. Please review.', FALSE, '2026-06-30 11:30:00+05:30'),
-- Site Manager Sunil (user 9)
(9, 3, 'Line-up Assigned', 'Project Gopal Yadav assigned to you.', TRUE, '2026-05-15 09:00:00+05:30'),
(9, 8, 'Line-up Assigned', 'Project Balram Singh assigned to you.', TRUE, '2026-06-25 09:00:00+05:30'),
(9, 8, 'Materials Delivered', 'Materials delivered for Balram Singh. DCR: DCR-2026-1023', FALSE, '2026-07-10 09:00:00+05:30'),
-- Agent Deepa (user 10)
(10, 8, 'Documents Verified', 'All documents for Balram Singh verified.', TRUE, '2026-05-26 11:00:00+05:30'),
(10, 9, 'Action Required', 'Ownership transfer required for Kamla Bai. Please coordinate with family.', FALSE, '2026-05-26 10:00:00+05:30'),
(10, 9, 'Action Required Update', 'Ownership transfer documents uploaded for Kamla Bai. Awaiting review.', FALSE, '2026-06-30 11:30:00+05:30');

-- ============================================================
-- 5. VERIFICATION QUERIES
-- ============================================================

-- Check total counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'area_blocks', COUNT(*) FROM area_blocks
UNION ALL SELECT 'consumers', COUNT(*) FROM consumers
UNION ALL SELECT 'bank_loans', COUNT(*) FROM bank_loans
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'documents', COUNT(*) FROM documents
UNION ALL SELECT 'status_history', COUNT(*) FROM status_history
UNION ALL SELECT 'action_required', COUNT(*) FROM action_required
UNION ALL SELECT 'ownership_transfers', COUNT(*) FROM ownership_transfers
UNION ALL SELECT 'material_deliveries', COUNT(*) FROM material_deliveries
UNION ALL SELECT 'installation_progress', COUNT(*) FROM installation_progress
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY table_name;

-- Project status distribution
SELECT current_status, COUNT(*) as project_count 
FROM projects 
GROUP BY current_status 
ORDER BY project_count DESC;

-- MAC warnings (age > 64)
SELECT full_name, age, surpassed_mac, payment_mode 
FROM consumers 
WHERE surpassed_mac = TRUE;

-- Document verification status
SELECT d.status, COUNT(*) as doc_count 
FROM documents d 
GROUP BY d.status 
ORDER BY doc_count DESC;

-- Installation progress per project
SELECT 
    p.id as project_id,
    c.full_name as consumer,
    SUM(CASE WHEN ip.is_done THEN ip.weight_pct ELSE 0 END) as completion_pct
FROM projects p
JOIN consumers c ON p.consumer_id = c.id
LEFT JOIN installation_progress ip ON p.id = ip.project_id
GROUP BY p.id, c.full_name
ORDER BY completion_pct DESC;

-- Pending payments
SELECT 
    p.id as project_id,
    c.full_name as consumer,
    py.payment_type,
    py.amount,
    py.status
FROM payments py
JOIN projects p ON py.project_id = p.id
JOIN consumers c ON p.consumer_id = c.id
WHERE py.status = 'pending'
ORDER BY py.amount DESC;

-- Open action required items
SELECT 
    ar.id as action_id,
    c.full_name as consumer,
    ar.action_type,
    ar.detail,
    ar.status,
    ar.raised_at,
    EXTRACT(DAY FROM NOW() - ar.raised_at) as days_open
FROM action_required ar
JOIN projects p ON ar.project_id = p.id
JOIN consumers c ON p.consumer_id = c.id
WHERE ar.status NOT IN ('resolved', 'cancelled')
ORDER BY ar.raised_at;
