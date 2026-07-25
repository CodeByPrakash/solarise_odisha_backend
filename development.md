# Solarise Odisha Backend Implementation Report

## Project Overview
This is a Node.js/Express REST API for ADP Green Energies designed to manage rooftop-solar consumer projects end-to-end. The API interfaces with a PostgreSQL database containing 13+ tables with complex relationships, enums, and constraints.

## Current State Analysis

### What's Already Implemented:
1. **Basic Project Structure**:
   - `server.js` - Express server setup with CORS and JSON middleware
   - `config/db.js` - PostgreSQL connection pool
   - Basic routing setup for `/api/users` and `/api/areaBlocks`

2. **Partially Implemented Controllers/Routes**:
   - `users.controller.js` - Full CRUD operations with proper error handling
   - `users.routes.js` - Complete route definitions
   - `areaBlocks.controller.js` - Full CRUD operations
   - `areaBlocks.routes.js` - Complete route definitions

3. **Database Files**:
   - `adp_solarise_system_table.sql` - Contains table schemas, enums, and indexes
   - `adp_green_energies_test_data.sql` - Test data for all tables

### What Needs Implementation:
Most controller and route files exist but are empty (0 bytes) or minimal. Based on the implementation plan, the following components need to be built:

## Implementation Plan by Table/Module

### 1. Consumers Module (Most Complex)
**Files to create/update:**
- `controllers/consumers.controller.js`
- `routes/consumers.routes.js`

**Key Features to Implement:**
- GET `/api/consumers` - List all with JOINs to area_blocks and users
- GET `/api/consumers/:id` - Get one with related block/creator names
- POST `/api/consumers` - Create new lead with validation
- PUT `/api/consumers/:id` - Update consumer
- DELETE `/api/consumers/:id` - Delete (cascades to related tables)
- GET `/api/consumers/mac-warnings` - Get consumers where age > 64
- GET `/api/consumers/by-block/:blockId` - Filter by area block
- GET `/api/consumers/by-agent/:userId` - Filter by creating agent

**Key SQL Queries to Implement:**
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

**Validation Requirements:**
- Aadhaar regex: `^[0-9]{12}$`
- PAN regex: `^[A-Z]{5}[0-9]{4}[A-Z]$`
- Age CHECK: BETWEEN 18 AND 120
- Electric consumer number uniqueness

### 2. Bank Loans Module (Conditional)
**Files to create/update:**
- `controllers/bankLoans.controller.js`
- `routes/bankLoans.routes.js`

**Key Features:**
- GET `/api/bank-loans` - List all with consumer name
- GET `/api/bank-loans/consumer/:consumerId` - Get loan for specific consumer
- POST `/api/bank-loans` - Create loan record (with payment_mode validation)
- PUT `/api/bank-loans/:id` - Update (approve/reject)
- DELETE `/api/bank-loans/:id` - Delete loan

**Business Rule:**
- Before INSERT, verify consumer's `payment_mode = 'bank_loan'`; reject if 'cash'

### 3. Projects Module (Core)
**Files to create/update:**
- `controllers/projects.controller.js`
- `routes/projects.routes.js`

**Key Features:**
- GET `/api/projects` - List all with consumer name and status
- GET `/api/projects/:id` - Get full project detail
- POST `/api/projects` - Create (auto-linked to consumer)
- PATCH `/api/projects/:id/status` - **Most critical endpoint** (status transition)
- GET `/api/projects/status/:status` - Filter by current status
- GET `/api/projects/dashboard` - Aggregate counts by status

**Critical Implementation (Status Transition):**
```javascript
// Inside PATCH /api/projects/:id/status
BEGIN;
-- 1. Read current status
SELECT current_status FROM projects WHERE id = $1;
-- 2. Update project status
UPDATE projects SET current_status = $1, updated_at = now() WHERE id = $2;
-- 3. Insert history record
INSERT INTO status_history (project_id, from_status, to_status, changed_by, remarks) 
VALUES ($1, $2, $3, $4, $5);
COMMIT;
```

**Dashboard Query:**
```sql
SELECT current_status, COUNT(*) as project_count
FROM projects
GROUP BY current_status
ORDER BY project_count DESC;
```

### 4. Documents Module
**Files to create/update:**
- `controllers/documents.controller.js`
- `routes/documents.routes.js`

**Key Features:**
- GET `/api/documents/consumer/:consumerId` - All docs for a consumer
- POST `/api/documents` - Record new upload
- PATCH `/api/documents/:id/verify` - Doc team verifies
- PATCH `/api/documents/:id/reject` - Doc team rejects (with reason)
- POST `/api/documents/:id/reupload` - Create new version
- GET `/api/documents/status-summary` - Count by status

**Re-upload Logic:**
```sql
-- Get current version
SELECT MAX(version) FROM documents WHERE consumer_id = $1 AND doc_type = $2;

-- Insert new version
INSERT INTO documents (..., version) VALUES (..., current_version + 1);
```

### 5. Status History Module (Read-Only)
**Files to create/update:**
- `controllers/statusHistory.controller.js`
- `routes/statusHistory.routes.js`

**Key Features:**
- GET `/api/status-history/project/:projectId` - Full timeline for a project
- GET `/api/status-history/recent` - Recent changes across all projects

### 6. Action Required Module
**Files to create/update:**
- `controllers/actionRequired.controller.js`
- `routes/actionRequired.routes.js`

**Key Features:**
- GET `/api/actions` - List all open actions
- GET `/api/actions/project/:projectId` - Actions for a project
- POST `/api/actions` - Raise new action (doc team)
- PATCH `/api/actions/:id/status` - Update action status
- GET `/api/actions/overdue` - Actions open > 7 days

**Overdue Query:**
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

### 7. Ownership Transfers Module (Conditional)
**Files to create/update:**
- `controllers/ownershipTransfers.controller.js`
- `routes/ownershipTransfers.routes.js`

**Key Features:**
- GET `/api/ownership-transfers/:actionId` - Get transfer details
- POST `/api/ownership-transfers` - Create (only for `action_type = 'ownership_transfer'`)
- PUT `/api/ownership-transfers/:id` - Update

**Business Rule:**
- Before INSERT, verify linked `action_required.action_type = 'ownership_transfer'`
- If `all_ror_members_alive = FALSE`, check that death_certificate and legal_heir_certificate documents exist

### 8. Material Deliveries Module
**Files to create/update:**
- `controllers/materialDeliveries.controller.js`
- `routes/materialDeliveries.routes.js`

**Key Features:**
- GET `/api/material-deliveries/project/:projectId` - Get delivery record
- POST `/api/material-deliveries` - Record delivery
- PUT `/api/material-deliveries/:id` - Update DCR number

**Business Rule:**
- Only record when project status is at `line_up_given` or later

### 9. Installation Progress Module (Weighted Checklist)
**Files to create/update:**
- `controllers/installationProgress.controller.js`
- `routes/installationProgress.routes.js`

**Key Features:**
- GET `/api/installation/project/:projectId` - All 10 checklist items
- POST `/api/installation/project/:projectId/init` - Create all 10 items with weights
- PATCH `/api/installation/:id/complete` - Mark one item as done
- GET `/api/installation/project/:projectId/progress` - Calculate completion %

**Hardcoded Weights (must sum to 100):**
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
  { item: 'output_service', weight_pct: 0 }
];
```

**Progress Calculation:**
```sql
SELECT
    SUM(CASE WHEN is_done THEN weight_pct ELSE 0 END) as completion_pct,
    COUNT(*) FILTER (WHERE is_done) as items_done,
    COUNT(*) as total_items
FROM installation_progress
WHERE project_id = $1;
```

### 10. Payments Module
**Files to create/update:**
- `controllers/payments.controller.js`
- `routes/payments.routes.js`

**Key Features:**
- GET `/api/payments/project/:projectId` - All payments for a project
- POST `/api/payments` - Record a payment
- PATCH `/api/payments/:id/status` - Update payment status
- GET `/api/payments/pending` - All pending payments
- GET `/api/payments/summary` - Aggregate totals by type

**Summary Query:**
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

### 11. Notifications Module (Activity Feed)
**Files to create/update:**
- `controllers/notifications.controller.js`
- `routes/notifications.routes.js`

**Key Features:**
- GET `/api/notifications/user/:userId` - Get notifications for a user
- GET `/api/notifications/user/:userId/unread` - Unread only
- POST `/api/notifications` - Create notification
- PATCH `/api/notifications/:id/read` - Mark as read
- PATCH `/api/notifications/user/:userId/read-all` - Mark all as read
- GET `/api/notifications/user/:userId/count` - Unread count

**Unread Count Query:**
```sql
SELECT COUNT(*) as unread_count
FROM notifications
WHERE user_id = $1 AND NOT is_read;
```

## Advanced Operations (Dashboard Endpoints)

### 1. Overview Dashboard
**Endpoint:** `GET /api/dashboard/overview`
```sql
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'consumers', COUNT(*) FROM consumers
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'documents', COUNT(*) FROM documents
-- ... (same pattern for all 13 tables)
ORDER BY table_name;
```

### 2. Project Pipeline Dashboard
**Endpoint:** `GET /api/dashboard/project-pipeline`
```sql
SELECT current_status, COUNT(*) as count
FROM projects
GROUP BY current_status
ORDER BY count DESC;
```

### 3. Agent Performance Dashboard
**Endpoint:** `GET /api/dashboard/agent-performance`
```sql
SELECT u.full_name, u.role, COUNT(c.id) as consumers_created
FROM users u
LEFT JOIN consumers c ON u.id = c.created_by
WHERE u.role = 'agent'
GROUP BY u.id, u.full_name, u.role
ORDER BY consumers_created DESC;
```

### 4. Full Consumer Profile
**Endpoint:** `GET /api/consumers/:id/full-profile`
```sql
-- Everything about a consumer in one shot
-- Consumer + project + bank loan + documents + payments + installation + actions
-- Use multiple queries or CTEs
```

## Technical Implementation Guidelines

### 1. Error Handling
Implement proper PostgreSQL error code handling in controllers:
- `23505` - Unique violation → 409 Conflict
- `23503` - Foreign key violation → 400 Bad Request
- `23514` - Check violation → 400 Bad Request
- `22P02` - Invalid enum → 400 Bad Request
- `42P01` - Table not found → 500 Internal Server Error

### 2. Database Connection
Use the existing connection pool from `config/db.js`:
```javascript
import pool from "../config/db.js";
// Then use: pool.query(query, params)
```

### 3. Response Format
Follow the established pattern from existing controllers:
```javascript
return res.status(200).json({ count: result.rowCount, data: result.rows });
// For single items:
return res.status(200).json({ data: result.rows[0] });
// For created items:
return res.status(201).json({ data: result.rows[0] });
```

### 4. Validation Requirements
Implement validation for:
- Required fields
- Data types and formats (regex for Aadhaar/PAN)
- Range validations (age, amounts)
- Enum validation
- Business rule validations (conditional logic)

### 5. Implementation Order Recommendation
Based on the implementation plan, follow this order:
1. Start with `users` and `area_blocks` (already mostly done)
2. Implement `consumers` (most complex, foundational)
3. Implement `projects` (core entity)
4. Implement `documents` and `status_history` (tied to projects)
5. Implement `action_required` and related modules
6. Implement remaining modules in order of complexity

## Database Considerations

### Enums to Handle in Code
The database defines several ENUM types that should be validated:
- `user_role`: 'agent', 'site_manager', 'doc_team', 'accounts', 'admin'
- `payment_mode`: 'cash', 'bank_loan'
- `occupation_type`: 'salaried', 'businessman', 'self_employed', 'farmer', 'housewife'
- `document_type`: 30+ document types
- `document_status`: 'uploaded', 'verified', 'rejected', 'action_required'
- `action_type`: 6 action types
- `action_status`: 5 statuses
- `project_status`: 40+ pipeline statuses
- `installation_item`: 10 checklist items
- `payment_type`: 6 payment types
- `payment_status`: 4 statuses

### Important Constraints
- Many tables have `ON DELETE CASCADE` foreign keys
- Several tables have UNIQUE constraints
- Generated columns: `surpassed_mac` (age > 64)
- Many tables have timestamps with timezone

## Testing Recommendations

### Test Order (as per implementation plan):
1. Health check → `GET /api/health`
2. List users → `GET /api/users` (should return 10 users)
3. List area blocks → `GET /api/area-blocks` (should return 15)
4. Create a new consumer → `POST /api/consumers`
5. Get MAC warnings → `GET /api/consumers/mac-warnings`
6. Get project dashboard → `GET /api/projects/dashboard`
7. Transition a project status → `PATCH /api/projects/10/status`
8. Verify status history → `GET /api/status-history/project/10`
9. Check installation progress → `GET /api/installation/project/3/progress`
10. Get pending payments → `GET /api/payments/pending`
11. Mark notification read → `PATCH /api/notifications/1/read`
12. Test constraint violations (invalid data, duplicates, etc.)

## Security Considerations
1. Implement proper input validation/sanitization
2. Use parameterized queries (already using $1, $2 syntax - good)
3. Consider implementing authentication/authorization (mentioned as future enhancement)
4. Hash passwords (currently storing plain `password_hash` - should be bcrypt)
5. Implement rate limiting for public endpoints
6. Add helmet.js for security headers
7. Use cors configuration to restrict origins in production

## Missing Components to Create

Based on the directory structure, these files need to be created or significantly updated:

### Controllers (need implementation):
- `bankLoans.controller.js` (currently 0 bytes)
- `documents.controller.js` (currently 0 bytes)
- `installationProgress.controller.js` (currently 0 bytes)
- `materialDeliveries.controller.js` (currently 0 bytes)
- `notifications.controller.js` (currently 0 bytes)
- `ownershipTransfers.controller.js` (currently 0 bytes)
- `payments.controller.js` (currently 0 bytes)
- `projects.controller.js` (currently 0 bytes)
- `statusHistory.controller.js` (currently 0 bytes)

### Routes (need implementation):
- `bankLoans.routes.js` (currently 0 bytes)
- `documents.routes.js` (currently 0 bytes)
- `installationProgress.routes.js` (currently 0 bytes)
- `materialDeliveries.routes.js` (currently 0 bytes)
- `notifications.routes.js` (currently 0 bytes)
- `ownershipTransfers.routes.js` (currently 0 bytes)
- `payments.routes.js` (currently 0 bytes)
- `projects.route.js` (currently 0 bytes)
- `statusHistory.routes.js` (currently 0 bytes)

### Middleware (needs enhancement):
- `errorHandler.js` (currently 0 bytes) - should implement PostgreSQL error code mapping

## Environment Setup Required
Based on the implementation plan, developers need to:
1. Install Node.js v18+
2. Install PostgreSQL v15+
3. Create database: `CREATE DATABASE adp_green_energies;`
4. Run SQL scripts in order:
   - `adp_solarise_system_table.sql` (creates schema, enums, tables)
   - `adp_green_energies_test_data.sql` (seeds test data)
5. Set up `.env` file with database credentials
6. Install dependencies: `npm install`
7. Start development server: `npm run dev`

## Estimated Effort
Based on the complexity and number of endpoints:
- **Controllers**: ~10-15 hours each for complex ones (consumers, projects, documents)
- **Routes**: ~1-2 hours each (mostly boilerplate)
- **Testing & Validation**: ~20-30 hours
- **Total**: Approximately 80-120 hours for complete implementation

The foundation is well-laid with proper directory structure, database design, and basic server setup. The main effort will be implementing the controller logic with proper SQL queries, validation, and error handling for each of the 13+ entities.