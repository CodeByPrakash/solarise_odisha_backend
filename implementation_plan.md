# Backend API for ADP Green Energies — Step-by-Step Build Guide

> Build a Node.js + Express REST API to test all database operations on your PostgreSQL schema.

---

## Your Database at a Glance

| # | Table | Rows in Test Data | Key Operations to Test |
|---|---|---|---|
| 1 | `users` | 10 | Auth, RBAC, CRUD |
| 2 | `area_blocks` | 15 | Lookup CRUD |
| 3 | `consumers` | 10 | Full CRUD, computed `surpassed_mac`, FK to `users` & `area_blocks` |
| 4 | `bank_loans` | 5 | Conditional create (only when `payment_mode = 'bank_loan'`) |
| 5 | `projects` | 10 | 1:1 with consumers, 42-state pipeline enum |
| 6 | `documents` | 80+ | Multi-version uploads, status transitions |
| 7 | `status_history` | 60+ | Append-only audit log |
| 8 | `action_required` | 2 | Workflow (open → doc_uploaded → resolved) |
| 9 | `ownership_transfers` | 1 | Conditional 1:1 with `action_required` |
| 10 | `material_deliveries` | 4 | 1:1 per project |
| 11 | `installation_progress` | 40 | Weighted checklist (must sum to 100%) |
| 12 | `payments` | 20+ | Multiple payment types & statuses |
| 13 | `notifications` | 30+ | Per-user activity feed |

---

## Phase 1 — Prerequisites & Project Setup

### Step 1: Install Prerequisites
Make sure you have these installed:
- **Node.js** (v18+ recommended) — [nodejs.org](https://nodejs.org)
- **PostgreSQL** (v15+) — [postgresql.org](https://www.postgresql.org/download/)
- **pgAdmin** or **psql CLI** — to run your SQL scripts
- **Postman** or **Thunder Client** (VS Code extension) — to test API endpoints

### Step 2: Create Your PostgreSQL Database
```bash
# In psql CLI:
CREATE DATABASE adp_green_energies;
\c adp_green_energies
```
Then run your SQL scripts **in this order**:
1. `adp_solarise_system_table.sql` — creates enums, tables, and indexes
2. `adp_green_energies_test_data.sql` — seeds all test data

> [!IMPORTANT]
> The system table file includes `CREATE EXTENSION IF NOT EXISTS citext;` which is required for case-insensitive email columns. Make sure it runs first.

> [!WARNING]
> There's a mismatch between the two files — `system_table.sql` defines `occupation_type` as `('salaried', 'businessman', 'self_employed', 'farmer', 'housewife')` but `test_data.sql` defines it as `('self_employed', 'farmer', 'housewife', 'government_service', 'private_job', 'other')`. **Run the system_table.sql first** so the enums are created, then the test_data file's `IF NOT EXISTS` checks will skip re-creating them. The test data inserts use values from the system_table enum, so it should work. But double-check `occupation` values in your INSERT statements match the enum you created.

### Step 3: Initialize the Node.js Project
```bash
mkdir solarise-api
cd solarise-api
npm init -y
```

### Step 4: Install Dependencies
```bash
npm install express pg dotenv cors
npm install --save-dev nodemon
```

| Package | Purpose |
|---|---|
| `express` | HTTP server & routing |
| `pg` | PostgreSQL client for Node.js |
| `dotenv` | Load `.env` config |
| `cors` | Enable cross-origin requests |
| `nodemon` | Auto-restart on file changes (dev only) |

### Step 5: Create the Folder Structure
```
solarise-api/
├── .env
├── package.json
├── server.js                  ← Entry point
├── config/
│   └── db.js                  ← PostgreSQL pool connection
├── routes/
│   ├── users.routes.js
│   ├── areaBlocks.routes.js
│   ├── consumers.routes.js
│   ├── bankLoans.routes.js
│   ├── projects.routes.js
│   ├── documents.routes.js
│   ├── statusHistory.routes.js
│   ├── actionRequired.routes.js
│   ├── ownershipTransfers.routes.js
│   ├── materialDeliveries.routes.js
│   ├── installationProgress.routes.js
│   ├── payments.routes.js
│   └── notifications.routes.js
├── controllers/
│   ├── users.controller.js
│   ├── areaBlocks.controller.js
│   ├── consumers.controller.js
│   ├── bankLoans.controller.js
│   ├── projects.controller.js
│   ├── documents.controller.js
│   ├── statusHistory.controller.js
│   ├── actionRequired.controller.js
│   ├── ownershipTransfers.controller.js
│   ├── materialDeliveries.controller.js
│   ├── installationProgress.controller.js
│   ├── payments.controller.js
│   └── notifications.controller.js
└── middleware/
    └── errorHandler.js
```

---

## Phase 2 — Database Connection & Server

### Step 6: Configure `.env`
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adp_green_energies
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### Step 7: Create `config/db.js`
- Import `pg` and create a `Pool` instance using your `.env` values
- Export the pool so controllers can use `pool.query()`
- **Key concept**: A connection pool reuses connections instead of opening/closing for every query

### Step 8: Create `server.js`
- Load `dotenv` config
- Create an Express app
- Use `cors()` and `express.json()` middleware
- Import and mount all route files under a base path like `/api`
- Add a global error handler middleware
- Listen on `PORT` from env
- Add a health-check route: `GET /api/health` that queries `SELECT NOW()` to verify the DB connection

### Step 9: Update `package.json` scripts
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## Phase 3 — Build CRUD Routes (Table by Table)

For each table, follow this pattern:

> [!TIP]
> **Pattern for every resource:**
> 1. Create a route file that defines HTTP methods → controller functions
> 2. Create a controller file that writes the actual SQL queries
> 3. Mount the route in `server.js`

---

### Step 10: `users` — Staff Management

| Method | Route | Operation | SQL to write |
|---|---|---|---|
| `GET` | `/api/users` | List all users | `SELECT id, full_name, email, phone, role, is_active, created_at FROM users ORDER BY id` |
| `GET` | `/api/users/:id` | Get one user | `SELECT * FROM users WHERE id = $1` |
| `POST` | `/api/users` | Create user | `INSERT INTO users (full_name, email, phone, role, password_hash) VALUES ($1,$2,$3,$4,$5) RETURNING *` |
| `PUT` | `/api/users/:id` | Update user | `UPDATE users SET full_name=$1, email=$2, phone=$3, role=$4, is_active=$5, updated_at=now() WHERE id=$6 RETURNING *` |
| `DELETE` | `/api/users/:id` | Delete user | `DELETE FROM users WHERE id = $1 RETURNING *` |
| `GET` | `/api/users/role/:role` | **Filter by role** | `SELECT * FROM users WHERE role = $1` |

> [!IMPORTANT]
> **Business Rule**: Reserved roles (`accounts`, `admin`) can only be assigned by an admin. Add a check in your POST/PUT controller: if the `role` being set is `accounts` or `admin`, require that the requesting user is an admin. For now, you can pass the requesting user's ID as a header like `x-user-id` and query their role from DB.

**Things to test with Postman:**
- ✅ Create a user with each role type
- ✅ Try creating duplicate email/phone → should get unique constraint error
- ✅ Try invalid role enum value → should get PostgreSQL enum error
- ❌ Never return `password_hash` in GET responses (exclude it from SELECT)

---

### Step 11: `area_blocks` — Master Data Lookup

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/area-blocks` | List all (optionally filter `?active=true`) |
| `GET` | `/api/area-blocks/:id` | Get one |
| `POST` | `/api/area-blocks` | Create |
| `PUT` | `/api/area-blocks/:id` | Update (name, is_active) |
| `DELETE` | `/api/area-blocks/:id` | Delete |

**Things to test:**
- ✅ Duplicate name → unique constraint error
- ✅ Delete a block that has consumers → FK constraint error (cascade not set, so it should fail)
- ✅ Soft-delete by setting `is_active = false` instead of hard delete

---

### Step 12: `consumers` — The Core Lead Record

This is the most complex table. Build these routes:

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/consumers` | List all (with JOINs to `area_blocks` and `users`) |
| `GET` | `/api/consumers/:id` | Get one (include related block name, creator name) |
| `POST` | `/api/consumers` | Create new lead |
| `PUT` | `/api/consumers/:id` | Update |
| `DELETE` | `/api/consumers/:id` | Delete (cascades to bank_loans, documents, projects) |
| `GET` | `/api/consumers/mac-warnings` | Get all consumers where `surpassed_mac = TRUE` |
| `GET` | `/api/consumers/by-block/:blockId` | Filter by area block |
| `GET` | `/api/consumers/by-agent/:userId` | Filter by creating agent |

**Key SQL concepts to practice:**
```sql
-- JOIN query for GET /consumers
SELECT c.*, ab.name as area_block_name, u.full_name as created_by_name
FROM consumers c
JOIN area_blocks ab ON c.area_block_id = ab.id
JOIN users u ON c.created_by = u.id;

-- MAC warning query
SELECT full_name, age, surpassed_mac, payment_mode
FROM consumers WHERE surpassed_mac = TRUE;
```

**Things to test:**
- ✅ `surpassed_mac` auto-computes: insert with age=68 → `surpassed_mac` should be `TRUE`
- ✅ Aadhaar regex validation: try `'12345'` → should fail (`'^[0-9]{12}$'`)
- ✅ PAN regex validation: try `'ABC'` → should fail (`'^[A-Z]{5}[0-9]{4}[A-Z]$'`)
- ✅ Age CHECK: try age=150 → should fail (`BETWEEN 18 AND 120`)
- ✅ FK constraint: try `area_block_id = 999` (non-existent) → should fail

---

### Step 13: `bank_loans` — Conditional on Payment Mode

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/bank-loans` | List all with consumer name |
| `GET` | `/api/bank-loans/consumer/:consumerId` | Get loan for a specific consumer |
| `POST` | `/api/bank-loans` | Create loan record |
| `PUT` | `/api/bank-loans/:id` | Update (approve/reject) |
| `DELETE` | `/api/bank-loans/:id` | Delete |

> [!IMPORTANT]
> **Business Rule to enforce in your controller:**
> Before INSERT, query the consumer's `payment_mode`. If it's `'cash'`, reject the request with a 400 error — bank loans only exist when `payment_mode = 'bank_loan'`.

**Things to test:**
- ✅ Create loan for consumer with `payment_mode = 'bank_loan'` → should succeed
- ❌ Create loan for consumer with `payment_mode = 'cash'` → your code should reject it
- ✅ UNIQUE constraint on `consumer_id` → one loan per consumer
- ✅ Approve a loan: `UPDATE bank_loans SET approved_at = now() WHERE id = $1`
- ✅ Reject a loan: `UPDATE bank_loans SET rejected_at = now() WHERE id = $1`

---

### Step 14: `projects` — Pipeline Status Tracking

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/projects` | List all with consumer name and status |
| `GET` | `/api/projects/:id` | Get full project detail |
| `POST` | `/api/projects` | Create (auto-linked to consumer) |
| `PATCH` | `/api/projects/:id/status` | **Transition status** (the most important operation) |
| `GET` | `/api/projects/status/:status` | Filter by current status |
| `GET` | `/api/projects/dashboard` | Aggregate counts by status |

**The status transition endpoint is the most critical:**
```
PATCH /api/projects/:id/status
Body: { "to_status": "doc_verified", "changed_by": 4, "remarks": "All docs OK" }
```

In your controller, do this **inside a transaction**:
1. `BEGIN`
2. Read current `projects.current_status`
3. `UPDATE projects SET current_status = $1, updated_at = now() WHERE id = $2`
4. `INSERT INTO status_history (project_id, from_status, to_status, changed_by, remarks) VALUES (...)`
5. `COMMIT`

**Dashboard query to implement:**
```sql
SELECT current_status, COUNT(*) as project_count
FROM projects
GROUP BY current_status
ORDER BY project_count DESC;
```

**Things to test:**
- ✅ Status transition creates a history record
- ✅ Transaction rollback: if the history INSERT fails, the project status should not change
- ✅ UNIQUE `consumer_id` → one project per consumer
- ✅ Try invalid enum value → PostgreSQL error

---

### Step 15: `documents` — Upload Tracking & Verification

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/documents/consumer/:consumerId` | All docs for a consumer |
| `POST` | `/api/documents` | Record new upload |
| `PATCH` | `/api/documents/:id/verify` | Doc team verifies |
| `PATCH` | `/api/documents/:id/reject` | Doc team rejects (with reason) |
| `POST` | `/api/documents/:id/reupload` | Create a new version |
| `GET` | `/api/documents/status-summary` | Count by status |

**Re-upload logic:**
```sql
-- Get current version
SELECT MAX(version) FROM documents WHERE consumer_id = $1 AND doc_type = $2;

-- Insert new version
INSERT INTO documents (..., version) VALUES (..., current_version + 1);
```

**Things to test:**
- ✅ Upload → status defaults to `'uploaded'`
- ✅ Verify → sets `status='verified'`, `verified_by`, `verified_at`
- ✅ Reject → sets `status='rejected'`, `reject_reason`
- ✅ Re-upload bumps version number
- ✅ Geo-tagged photo: `geo_lat` and `geo_lng` should be provided for photo types

---

### Step 16: `status_history` — Audit Log (Read-Only)

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/status-history/project/:projectId` | Full timeline for a project |
| `GET` | `/api/status-history/recent` | Recent changes across all projects |

> [!NOTE]
> This table is **append-only**. No UPDATE or DELETE routes. Records are created automatically by the project status transition endpoint (Step 14). You only need GET routes here.

**Things to test:**
- ✅ After transitioning a project status, verify the history row was created
- ✅ Order by `changed_at DESC` to get most recent first

---

### Step 17: `action_required` — Doc Team Corrections

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/actions` | List all open actions |
| `GET` | `/api/actions/project/:projectId` | Actions for a project |
| `POST` | `/api/actions` | Raise new action (doc team) |
| `PATCH` | `/api/actions/:id/status` | Update action status |
| `GET` | `/api/actions/overdue` | Actions open > 7 days |

**Overdue query:**
```sql
SELECT ar.*, c.full_name,
       EXTRACT(DAY FROM NOW() - ar.raised_at) as days_open
FROM action_required ar
JOIN projects p ON ar.project_id = p.id
JOIN consumers c ON p.consumer_id = c.id
WHERE ar.status NOT IN ('resolved', 'cancelled')
  AND ar.raised_at < NOW() - INTERVAL '7 days'
ORDER BY ar.raised_at;
```

---

### Step 18: `ownership_transfers` — Conditional Detail

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/ownership-transfers/:actionId` | Get transfer details |
| `POST` | `/api/ownership-transfers` | Create (only for `action_type = 'ownership_transfer'`) |
| `PUT` | `/api/ownership-transfers/:id` | Update |

> [!IMPORTANT]
> **Business Rule**: Before INSERT, verify the linked `action_required.action_type` is `'ownership_transfer'`. Also validate: if `all_ror_members_alive = FALSE`, check that `death_certificate` and `legal_heir_certificate` documents exist for the consumer.

---

### Step 19: `material_deliveries` — Site Manager

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/material-deliveries/project/:projectId` | Get delivery record |
| `POST` | `/api/material-deliveries` | Record delivery |
| `PUT` | `/api/material-deliveries/:id` | Update DCR number |

**Things to test:**
- ✅ UNIQUE on `project_id` → one delivery per project
- ✅ Only record when project status is at `line_up_given` or later

---

### Step 20: `installation_progress` — Weighted Checklist

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/installation/project/:projectId` | All 10 checklist items |
| `POST` | `/api/installation/project/:projectId/init` | Create all 10 items with weights |
| `PATCH` | `/api/installation/:id/complete` | Mark one item as done |
| `GET` | `/api/installation/project/:projectId/progress` | Calculate completion % |

**Initialize checklist (hardcoded weights):**
```javascript
const INSTALLATION_ITEMS = [
  { item: 'structure', weight_pct: 30 },
  { item: 'panel', weight_pct: 10 },
  { item: 'inverter_looping', weight_pct: 20 },
  { item: 'ac_wiring', weight_pct: 14 },
  { item: 'dc_wiring', weight_pct: 10 },
  { item: 'lightning_arrester', weight_pct: 5 },
  { item: 'earthing', weight_pct: 5 },
  { item: 'earthing_pit', weight_pct: 3 },
  { item: 'concreting', weight_pct: 3 },
  { item: 'output_service', weight_pct: 0 },
];
```

**Progress calculation:**
```sql
SELECT
    SUM(CASE WHEN is_done THEN weight_pct ELSE 0 END) as completion_pct,
    COUNT(*) FILTER (WHERE is_done) as items_done,
    COUNT(*) as total_items
FROM installation_progress
WHERE project_id = $1;
```

**Things to test:**
- ✅ Weights must sum to 100
- ✅ Mark items done one by one and verify % increases correctly
- ✅ UNIQUE constraint on `(project_id, item)` prevents duplicates

---

### Step 21: `payments` — Accounts Tracking

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/payments/project/:projectId` | All payments for a project |
| `POST` | `/api/payments` | Record a payment |
| `PATCH` | `/api/payments/:id/status` | Update payment status |
| `GET` | `/api/payments/pending` | All pending payments |
| `GET` | `/api/payments/summary` | Aggregate totals by type |

**Summary query:**
```sql
SELECT
    payment_type,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
FROM payments
GROUP BY payment_type;
```

**Things to test:**
- ✅ CHECK constraint: `amount >= 0` → try negative amount
- ✅ Payment status transitions: `pending → paid → refunded`
- ✅ Record UTR/reference number when marking as paid

---

### Step 22: `notifications` — Activity Feed

| Method | Route | Operation |
|---|---|---|
| `GET` | `/api/notifications/user/:userId` | Get notifications for a user |
| `GET` | `/api/notifications/user/:userId/unread` | Unread only |
| `POST` | `/api/notifications` | Create notification |
| `PATCH` | `/api/notifications/:id/read` | Mark as read |
| `PATCH` | `/api/notifications/user/:userId/read-all` | Mark all as read |
| `GET` | `/api/notifications/user/:userId/count` | Unread count |

**Unread count query:**
```sql
SELECT COUNT(*) as unread_count
FROM notifications
WHERE user_id = $1 AND NOT is_read;
```

---

## Phase 4 — Advanced Operations to Test

### Step 23: Build Cross-Table Query Endpoints

These are the real-world queries your app will need. Add them as separate routes:

#### `GET /api/dashboard/overview`
```sql
-- Full overview: counts per table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'consumers', COUNT(*) FROM consumers
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'documents', COUNT(*) FROM documents
-- ... (same pattern for all 13 tables)
ORDER BY table_name;
```

#### `GET /api/dashboard/project-pipeline`
```sql
-- How many projects at each stage
SELECT current_status, COUNT(*) as count
FROM projects
GROUP BY current_status
ORDER BY count DESC;
```

#### `GET /api/dashboard/agent-performance`
```sql
-- Projects per agent
SELECT u.full_name, u.role, COUNT(c.id) as consumers_created
FROM users u
LEFT JOIN consumers c ON u.id = c.created_by
WHERE u.role = 'agent'
GROUP BY u.id, u.full_name, u.role
ORDER BY consumers_created DESC;
```

#### `GET /api/consumers/:id/full-profile`
```sql
-- Everything about a consumer in one shot
-- Consumer + project + bank loan + documents + payments + installation + actions
-- Use multiple queries or CTEs
```

---

### Step 24: Test PostgreSQL-Specific Features

These are great exercises to understand PostgreSQL behavior:

| Feature | How to test |
|---|---|
| **ENUM validation** | Try inserting invalid enum values (e.g., `role = 'superadmin'`) |
| **UNIQUE constraints** | Try duplicate `email`, `phone`, `electric_consumer_no` |
| **CHECK constraints** | Try `age = 5`, `amount = -100`, invalid Aadhaar/PAN |
| **FK constraints** | Try referencing non-existent IDs |
| **CASCADE DELETE** | Delete a consumer → verify projects, documents, etc. are deleted |
| **Generated columns** | Insert consumer with age=70 → verify `surpassed_mac = TRUE` automatically |
| **CITEXT** | Insert email as `'Test@Email.COM'` then query with `'test@email.com'` |
| **Partial indexes** | Query `documents WHERE status = 'uploaded'` → should use `idx_documents_status` |
| **Transactions** | Status transition: project update + history insert in one transaction |
| **TIMESTAMPTZ** | Insert with timezone `'+05:30'` and query — observe UTC conversion |

---

### Step 25: Test Error Handling

In your `middleware/errorHandler.js`, catch PostgreSQL error codes and return friendly messages:

| PG Error Code | Meaning | HTTP Status | Friendly Message |
|---|---|---|---|
| `23505` | Unique violation | `409 Conflict` | "A record with this value already exists" |
| `23503` | FK violation | `400 Bad Request` | "Referenced record does not exist" |
| `23514` | CHECK violation | `400 Bad Request` | "Value out of allowed range" |
| `22P02` | Invalid enum | `400 Bad Request` | "Invalid value for this field" |
| `42P01` | Table not found | `500 Internal` | "Database configuration error" |

---

## Phase 5 — Run & Verify

### Step 26: Start Your Server
```bash
npm run dev
```

### Step 27: Test with Postman — Suggested Order

Follow this order to test the full workflow with your test data:

1. **Health check** → `GET /api/health`
2. **List users** → `GET /api/users` (should return 10 users)
3. **List area blocks** → `GET /api/area-blocks` (should return 15)
4. **Create a new consumer** → `POST /api/consumers`
5. **Get MAC warnings** → `GET /api/consumers/mac-warnings` (Consumer 3: Gopal Yadav, age 68, and Consumer 9: Kamla Bai, age 70)
6. **Get project dashboard** → `GET /api/projects/dashboard`
7. **Transition a project status** → `PATCH /api/projects/10/status` (move "doc_uploaded" → "doc_verified")
8. **Verify status history** → `GET /api/status-history/project/10`
9. **Check installation progress** → `GET /api/installation/project/3/progress` (should be 74% — structure+panel+inverter_looping+ac_wiring done)
10. **Get pending payments** → `GET /api/payments/pending` (projects 4, 5, 9, 10)
11. **Mark notification read** → `PATCH /api/notifications/1/read`
12. **Test constraint violations** → try all the error cases from Step 24

---

## Bonus — Things to Add Later

Once basic CRUD works, consider these enhancements:

- [ ] **Pagination**: Add `?page=1&limit=10` to all list endpoints using `LIMIT $1 OFFSET $2`
- [ ] **Search**: Add `?search=mehta` to consumers using `WHERE full_name ILIKE '%' || $1 || '%'`
- [ ] **Sorting**: Add `?sort=created_at&order=desc` using dynamic `ORDER BY`
- [ ] **Validation middleware**: Use `express-validator` or `joi` to validate request bodies before hitting the DB
- [ ] **Authentication**: Add JWT-based auth with bcrypt password hashing
- [ ] **Rate limiting**: Use `express-rate-limit`
- [ ] **Logging**: Use `morgan` for request logging
- [ ] **API documentation**: Use Swagger/OpenAPI via `swagger-jsdoc`

---

> [!TIP]
> **Pro tip**: Start with just `users` and `area_blocks` (Steps 10–11) to get the pattern down. Then copy-paste the same pattern for each subsequent table. Every controller follows the same structure: import pool → write query → send response → catch errors.
