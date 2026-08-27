BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;

-- ============================================================
-- Enums
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'agent',
  'site_manager',
  'doc_team',
  'accounts',
  'admin'
);

CREATE TYPE payment_mode AS ENUM ('cash', 'bank_loan');

CREATE TYPE occupation_type AS ENUM (
  'salaried',
  'businessman',
  'self_employed',
  'farmer',
  'housewife'
);

CREATE TYPE document_type AS ENUM (
  'electric_bill',
  'aadhaar_card',
  'pan_card',
  'bank_passbook',
  'roof_geotagged_photo',
  'land_ror',
  'sale_deed',
  'malgujani',
  'bank_statement_6m',
  'salary_slip',
  'it_return',
  'beneficiary_aadhaar',
  'noc',
  'form_1',
  'self_undertaking',
  'death_certificate',
  'legal_heir_certificate',
  'material_sealing_video',
  'customer_consent_video',
  'plant_geotagged_photo',
  'inverter_serial_photo',
  'inverter_setup_photo',
  'earthing_photo',
  'la_photo',
  'inspection_report',
  'psa_agreement',
  'net_metering_agreement',
  'other'
);

CREATE TYPE document_status AS ENUM (
  'uploaded',
  'verified',
  'rejected',
  'action_required'
);

CREATE TYPE action_type AS ENUM (
  'electric_bill_name_correction',
  'ownership_transfer',
  'commercial_to_domestic',
  'bank_passbook_name_correction',
  'bank_passbook_update',
  'other'
);

CREATE TYPE action_status AS ENUM (
  'open',
  'doc_uploaded',
  'in_review',
  'resolved',
  'cancelled'
);

CREATE TYPE project_status AS ENUM (
  'new_registration',
  'doc_requested',
  'doc_uploaded',
  'doc_verified',
  'action_required',
  'action_required_bank',
  'work_in_progress',
  'processing_fee_paid',
  'registration_no_generated',
  'master_data_pending',
  'name_corrected',
  'ownership_changed',
  'type_converted',
  'pending_with_discom',
  'security_deposit_pending',
  'security_deposit_paid',
  'psa_agreement_done',
  'pmsgy_done',
  'loan_applied',
  'loan_approved',
  'loan_rejected',
  'line_up_given',
  'materials_delivered',
  'installation_in_progress',
  'installation_done',
  'installation_uploaded_pmsgy',
  'net_metering_applied',
  'net_metering_rts_pending',
  'net_metering_payment_pending',
  'net_metering_agreement_done',
  'inspection_report_submitted',
  'site_activity',
  'approval_desk',
  'service_release',
  'service_released',
  'meter_installed',
  'project_commissioned',
  'subsidy_redeemed',
  'subsidy_return',
  'subsidy_pending',
  'subsidy_disbursed_cfa',
  'subsidy_disbursed_sfa',
  'project_handover_pending',
  'project_handed_over'
);

CREATE TYPE installation_item AS ENUM (
  'structure',
  'panel',
  'inverter_looping',
  'ac_wiring',
  'dc_wiring',
  'lightning_arrester',
  'earthing',
  'earthing_pit',
  'concreting',
  'output_service'
);

CREATE TYPE payment_type AS ENUM (
  'processing_fee',
  'security_deposit',
  'consumer_payment',
  'loan_disbursal',
  'subsidy_cfa',
  'subsidy_sfa'
);

CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

-- ============================================================
-- Core tables
-- ============================================================

CREATE TABLE users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         CITEXT UNIQUE NOT NULL,
  phone         VARCHAR(15) UNIQUE NOT NULL,
  role          user_role NOT NULL DEFAULT 'agent',
  password_hash TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE area_blocks (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT UNIQUE NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE consumers (
  id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name               TEXT NOT NULL,
  last_name                TEXT,
  address                  TEXT NOT NULL,
  area_block_id            BIGINT NOT NULL REFERENCES area_blocks(id),
  email                    CITEXT,
  phone_primary            VARCHAR(15) NOT NULL,
  phone_secondary          VARCHAR(15),
  contact_person_name      TEXT,
  contact_person_phone     VARCHAR(15),
  contact_person_relation  TEXT,
  same_as_contact_person   BOOLEAN NOT NULL DEFAULT FALSE,
  name_on_electric_bill    TEXT NOT NULL,
  phone_on_electric_bill   VARCHAR(15),
  geo_lat                  NUMERIC(9,6),
  geo_lng                  NUMERIC(9,6),
  electric_consumer_no     TEXT NOT NULL UNIQUE,
  age                      SMALLINT CHECK (age BETWEEN 18 AND 120),
  surpassed_mac            BOOLEAN GENERATED ALWAYS AS (age > 64) STORED,
  aadhaar_no               CHAR(12) CHECK (aadhaar_no ~ '^[0-9]{12}$'),
  pan_no                   CHAR(10) CHECK (pan_no ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'),
  bank_account_no          TEXT,
  payment_mode             payment_mode NOT NULL,
  land_owned_by_consumer   BOOLEAN NOT NULL DEFAULT TRUE,
  occupation               occupation_type,
  created_by               BIGINT NOT NULL REFERENCES users(id),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_consumers_geo_pair CHECK (
    (geo_lat IS NULL AND geo_lng IS NULL)
    OR (geo_lat BETWEEN -90 AND 90 AND geo_lng BETWEEN -180 AND 180)
  )
);

CREATE TABLE consumer_transfers (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  consumer_id   BIGINT NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
  from_agent_id BIGINT NOT NULL REFERENCES users(id),
  to_agent_id   BIGINT NOT NULL REFERENCES users(id),
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'rejected')),
  remarks       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_consumer_transfer_agents CHECK (from_agent_id <> to_agent_id)
);

CREATE UNIQUE INDEX uq_consumer_transfers_pending
  ON consumer_transfers (consumer_id)
  WHERE status = 'pending';

CREATE TABLE bank_loans (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  consumer_id        BIGINT NOT NULL UNIQUE REFERENCES consumers(id) ON DELETE CASCADE,
  is_ghanbani_land   BOOLEAN,
  bank_name          TEXT,
  loan_amount        NUMERIC(12,2),
  applied_at         TIMESTAMPTZ,
  approved_at        TIMESTAMPTZ,
  rejected_at        TIMESTAMPTZ,
  remarks            TEXT,
  CONSTRAINT chk_bank_loans_timeline CHECK (
    (approved_at IS NULL OR rejected_at IS NULL) AND
    (approved_at IS NULL OR applied_at IS NOT NULL) AND
    (rejected_at IS NULL OR applied_at IS NOT NULL)
  )
);

CREATE TABLE projects (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  consumer_id           BIGINT NOT NULL UNIQUE REFERENCES consumers(id) ON DELETE CASCADE,
  current_status        project_status NOT NULL DEFAULT 'new_registration',
  registration_no       TEXT UNIQUE,
  capacity_kw           NUMERIC(6,2),
  assigned_site_manager BIGINT REFERENCES users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  consumer_id   BIGINT NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
  doc_type      document_type NOT NULL,
  file_url      TEXT NOT NULL,
  file_name     TEXT,
  mime_type     TEXT,
  geo_lat       NUMERIC(9,6),
  geo_lng       NUMERIC(9,6),
  status        document_status NOT NULL DEFAULT 'uploaded',
  uploaded_by   BIGINT NOT NULL REFERENCES users(id),
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_by   BIGINT REFERENCES users(id),
  verified_at   TIMESTAMPTZ,
  reject_reason TEXT,
  version       INT NOT NULL DEFAULT 1,
  CONSTRAINT chk_documents_geo_pair CHECK (
    (geo_lat IS NULL AND geo_lng IS NULL)
    OR (geo_lat BETWEEN -90 AND 90 AND geo_lng BETWEEN -180 AND 180)
  ),
  CONSTRAINT chk_documents_version_positive CHECK (version >= 1),
  UNIQUE (consumer_id, doc_type, version)
);

CREATE TABLE status_history (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id  BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_status project_status,
  to_status   project_status NOT NULL,
  changed_by  BIGINT NOT NULL REFERENCES users(id),
  remarks     TEXT,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE action_required (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id   BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  action_type  action_type NOT NULL,
  detail       TEXT,
  status       action_status NOT NULL DEFAULT 'open',
  raised_by    BIGINT NOT NULL REFERENCES users(id),
  raised_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_to  BIGINT REFERENCES users(id),
  resolved_by  BIGINT REFERENCES users(id),
  resolved_at  TIMESTAMPTZ,
  CONSTRAINT chk_action_required_resolution CHECK (
    (
      status IN ('resolved', 'cancelled')
      AND resolved_at IS NOT NULL
      AND resolved_by IS NOT NULL
    )
    OR
    (
      status NOT IN ('resolved', 'cancelled')
      AND resolved_at IS NULL
      AND resolved_by IS NULL
    )
  )
);

CREATE TABLE ownership_transfers (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  action_id             BIGINT NOT NULL UNIQUE REFERENCES action_required(id) ON DELETE CASCADE,
  all_ror_members_alive BOOLEAN NOT NULL,
  beneficiary_name      TEXT NOT NULL,
  remarks               TEXT
);

CREATE TABLE material_deliveries (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id    BIGINT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  delivered_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  dcr_number    TEXT,
  recorded_by   BIGINT NOT NULL REFERENCES users(id)
);

CREATE TABLE installation_progress (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id    BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item          installation_item NOT NULL,
  weight_pct    SMALLINT NOT NULL,
  is_done       BOOLEAN NOT NULL DEFAULT FALSE,
  done_by       BIGINT REFERENCES users(id),
  done_at       TIMESTAMPTZ,
  UNIQUE (project_id, item)
);

CREATE TABLE payments (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id    BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  payment_type  payment_type NOT NULL,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status        payment_status NOT NULL DEFAULT 'pending',
  reference_no  TEXT,
  paid_at       TIMESTAMPTZ,
  recorded_by   BIGINT NOT NULL REFERENCES users(id),
  remarks       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id  BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_consumers_block
  ON consumers(area_block_id);

CREATE INDEX idx_consumers_creator
  ON consumers(created_by);

CREATE INDEX idx_projects_status
  ON projects(current_status);

CREATE INDEX idx_projects_site_manager_status
  ON projects(assigned_site_manager, current_status);

CREATE INDEX idx_documents_consumer_doc_type
  ON documents(consumer_id, doc_type);

CREATE INDEX idx_documents_status_uploaded
  ON documents(status) WHERE status = 'uploaded';

CREATE INDEX idx_documents_consumer_status_uploaded_at
  ON documents(consumer_id, status, uploaded_at DESC);

CREATE INDEX idx_history_project
  ON status_history(project_id, changed_at DESC);

CREATE INDEX idx_action_open
  ON action_required(project_id) WHERE status <> 'resolved';

CREATE INDEX idx_action_required_assignee_status
  ON action_required(assigned_to, status, raised_at DESC)
  WHERE status <> 'resolved';

CREATE INDEX idx_payments_project
  ON payments(project_id);

CREATE INDEX idx_notif_unread
  ON notifications(user_id) WHERE NOT is_read;

-- ============================================================
-- Trigger helpers
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_consumers_updated_at
BEFORE UPDATE ON consumers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Keep status history append-only by blocking updates/deletes.
CREATE OR REPLACE FUNCTION forbid_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Mutation not allowed on %', TG_TABLE_NAME;
END;
$$;

CREATE TRIGGER trg_status_history_no_update
BEFORE UPDATE ON status_history
FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TRIGGER trg_status_history_no_delete
BEFORE DELETE ON status_history
FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

COMMIT;
