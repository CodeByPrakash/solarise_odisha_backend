-- ============================================================
-- ADP Green Energies — Complete Test Data Script
-- Generated: 2026-07-23
-- PostgreSQL 15+
-- ============================================================

-- ============================================================
-- 1. ENUMS (Run these first if not already created)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS citext;
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
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
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
    district TEXT NOT NULL DEFAULT 'Khurda',
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
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_material_deliveries_project ON material_deliveries(project_id);

-- ============================================================
-- 4. SCHEMA MIGRATIONS & SEQUENCE SYNCHRONIZATION
-- ============================================================

-- Ensure material_deliveries allows multiple delivery batches per project
ALTER TABLE material_deliveries DROP CONSTRAINT IF EXISTS material_deliveries_project_id_key;
DROP INDEX IF EXISTS material_deliveries_project_id_key;

-- Synchronize material_deliveries primary key sequence with existing rows
SELECT setval(
    pg_get_serial_sequence('material_deliveries', 'id'),
    COALESCE((SELECT MAX(id) FROM material_deliveries), 1),
    true
);

-- Ensure district column exists on area_blocks with default value
ALTER TABLE area_blocks ADD COLUMN IF NOT EXISTS district TEXT NOT NULL DEFAULT 'Khurda';

