# solarise_odisha_backend

Critical Re-Upload Flow
POST /api/documents/5/reupload
│
├── BEGIN transaction (pool.connect → client)
│
├── Step 1: SELECT consumer_id, doc_type FROM documents WHERE id = 5
│           → { consumer_id: 3, doc_type: 'aadhaar_card' }
│
├── Step 2: SELECT MAX(version) FROM documents 
│           WHERE consumer_id = 3 AND doc_type = 'aadhaar_card'
│           → max_version = 2
│
├── Step 3: INSERT INTO documents (..., version) VALUES (..., 3)
│
├── COMMIT
│
└── Response: { version: 3, status: 'uploaded' }

Critical Business Rule Flow
POST /api/bank-loans
│
├── Step 1: Validate consumer_id exists in body
│
├── Step 2: SELECT payment_mode FROM consumers WHERE id = $1
│           ├── Not found → 404
│           └── payment_mode = 'cash' → 400 REJECTED
│
├── Step 3 (only if payment_mode = 'bank_loan'):
│           INSERT INTO bank_loans (...) VALUES (...)
│           ├── Duplicate consumer_id (23505) → 409
│           └── Success → 201
│
└── Response: { data: { id, consumer_id, bank_name, ... } }

POST /api/ownership-transfers
│
├── Validate: action_id, all_ror_members_alive, beneficiary_name present
│
├── RULE 1: SELECT action_type FROM action_required WHERE id = $1
│           ├── Not found → 404
│           └── action_type ≠ 'ownership_transfer' → 400 REJECTED
│
├── RULE 2 (only if all_ror_members_alive = false):
│           SELECT doc_type FROM documents
│           WHERE consumer_id = $1 AND doc_type IN ('death_certificate','legal_heir_certificate')
│           ├── Missing either → 400 { missing_documents: [...] }
│           └── Both exist → proceed
│
├── INSERT INTO ownership_transfers (...)
│           ├── Duplicate action_id (23505) → 409
│           └── Success → 201
│
└── Response: { data: { id, action_id, all_ror_members_alive, beneficiary_name, ... } }

POST /api/material-deliveries
│
├── Validate: project_id, recorded_by present
│
├── RULE: SELECT current_status FROM projects WHERE id = $1
│         ├── Not found → 404
│         └── Status before 'line_up_given' → 400 REJECTED
│             e.g. 'doc_verified', 'loan_applied' → ❌
│             e.g. 'line_up_given', 'materials_delivered' → ✅
│
├── INSERT INTO material_deliveries (...)
│         ├── Duplicate project_id (23505) → 409
│         └── Success → 201
│
└── Response: { data: { id, project_id, delivered_at, dcr_number, ... } }
