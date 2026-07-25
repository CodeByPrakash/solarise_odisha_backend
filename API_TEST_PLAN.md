# Solarise Odisha Backend API Testing Plan

This document provides a comprehensive test plan for all APIs in the Solarise Odisha backend system. It covers test scenarios for all implemented and planned endpoints based on the code review of controllers, routes, and database schema.

## Table of Contents
1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Data Requirements](#test-data-requirements)
4. [API Testing Categories](#api-testing-categories)
5. [Detailed Test Scenarios by Module](#detailed-test-scenarios-by-module)
6. [Error Condition Testing](#error-condition-testing)
7. [Performance and Load Testing](#performance-and-load-testing)
8. [Security Testing](#security-testing)
9. [Test Execution Order](#test-execution-order)

---

## Overview

The Solarise Odisha API is a Node.js/Express REST API managing rooftop-solar consumer projects end-to-end. It interfaces with a PostgreSQL database containing 13+ tables with complex relationships, enums, and constraints.

This test plan covers:
- Users and authentication
- Area blocks (geographical divisions)
- Consumers (solar panel customers)
- Bank loans (financing options)
- Projects (solar installations)
- Documents (document management)
- Status history (status change tracking)
- Action required (action items requiring attention)
- Ownership transfers (consumer ownership changes)
- Material deliveries (solar equipment delivery tracking)
- Installation progress (installation checklist tracking)
- Payments (financial transactions)
- Notifications (user notifications system)

## Test Environment Setup

### Prerequisites
1. Node.js v18+
2. PostgreSQL v15+
3. Git

### Setup Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up database:
   ```bash
   createdb adp_green_energies
   psql -d adp_green_energies -f adp_solarise_system_table.sql
   psql -d adp_green_energies -f adp_green_energies_test_data.sql
   ```
4. Configure environment variables in `.env` file
5. Start development server: `npm run dev`

### Test Data Overview
Based on the test data SQL file, the database will contain:
- 10 users (agents, site_managers, doc_team, accounts, admin)
- 15 area blocks
- 50 consumers with various attributes
- Associated projects, documents, payments, etc.

## API Testing Categories

Each API endpoint should be tested for:
1. **Positive Tests** - Valid requests that should succeed
2. **Negative Tests** - Invalid requests that should return appropriate error codes
3. **Edge Cases** - Boundary conditions and special scenarios
4. **Authorization Tests** - Permission-based access control (when implemented)
5. **Data Integrity Tests** - Ensuring data consistency across related tables

## Detailed Test Scenarios by Module

### 1. Users API (`/api/users`)

#### Endpoints:
- GET `/api/users` - List all users
- GET `/api/users/:id` - Get user by ID
- POST `/api/users` - Create new user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/users` - Returns list of all users with pagination info
2. GET `/api/users/1` - Returns specific user details
3. POST `/api/users` - Creates new user with valid data
   - Valid role enum values: 'agent', 'site_manager', 'doc_team', 'accounts', 'admin'
   - Valid email format
   - Valid phone number format
4. PUT `/api/users/1` - Updates existing user with valid data
5. DELETE `/api/users/1` - Soft deletes user (sets is_active to false)

**Negative Tests:**
1. GET `/api/users/999` - Returns 404 for non-existent user
2. POST `/api/users` with missing required fields (full_name, email, phone, password_hash) - Returns 400
3. POST `/api/users` with invalid email format - Returns 400
4. POST `/api/users` with invalid phone format - Returns 400
5. POST `/api/users` with invalid role value - Returns 400
6. POST `/api/users` with duplicate email - Returns 409 (unique constraint violation)
7. PUT `/api/users/999` - Returns 404 for non-existent user
8. DELETE `/api/users/999` - Returns 404 for non-existent user

### 2. Area Blocks API (`/api/areaBlocks`)

#### Endpoints:
- GET `/api/areaBlocks` - List all area blocks
- GET `/api/areaBlocks/:id` - Get area block by ID
- POST `/api/areaBlocks` - Create new area block
- PUT `/api/areaBlocks/:id` - Update area block
- DELETE `/api/areaBlocks/:id` - Delete area block

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/areaBlocks` - Returns list of all area blocks
2. GET `/api/areaBlocks/1` - Returns specific area block details
3. POST `/api/areaBlocks` - Creates new area block with valid name
4. PUT `/api/areaBlocks/1` - Updates existing area block
5. DELETE `/api/areaBlocks/1` - Deletes area block

**Negative Tests:**
1. GET `/api/areaBlocks/999` - Returns 404 for non-existent area block
2. POST `/api/areaBlocks` with missing name - Returns 400
3. POST `/api/areaBlocks` with duplicate name - Returns 409 (unique constraint violation)
4. PUT `/api/areaBlocks/999` - Returns 404 for non-existent area block
5. DELETE `/api/areaBlocks/999` - Returns 404 for non-existent area block

### 3. Consumers API (`/api/consumers`)

#### Endpoints:
- GET `/api/consumers` - List all consumers with filters
- GET `/api/consumers/:id` - Get consumer by ID
- POST `/api/consumers` - Create new consumer
- PUT `/api/consumers/:id` - Update consumer
- DELETE `/api/consumers/:id` - Delete consumer
- GET `/api/consumers/mac-warnings` - Get consumers where age > 64
- GET `/api/consumers/by-block/:blockId` - Filter by area block
- GET `/api/consumers/by-agent/:userId` - Filter by creating agent

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/consumers` - Returns list of all consumers with joined data (area block name, creator name)
2. GET `/api/consumers/1` - Returns specific consumer with related data
3. POST `/api/consumers` - Creates new consumer with all valid fields
   - Valid Aadhaar format (12 digits)
   - Valid PAN format (5 letters, 4 numbers, 1 letter)
   - Valid age (18-120)
   - Valid payment_mode ('cash' or 'bank_loan')
   - Valid occupation type enum
4. PUT `/api/consumers/1` - Updates consumer with valid data
5. DELETE `/api/consumers/1` - Soft deletes consumer
6. GET `/api/consumers/mac-warnings` - Returns consumers with age > 64
7. GET `/api/consumers/by-block/1` - Returns consumers in specific area block
8. GET `/api/consumers/by-agent/1` - Returns consumers created by specific user

**Negative Tests:**
1. GET `/api/consumers/999` - Returns 404 for non-existent consumer
2. POST `/api/consumers` with missing required fields - Returns 400
3. POST `/api/consumers` with invalid Aadhaar format (not 12 digits) - Returns 400
4. POST `/api/consumers` with invalid PAN format - Returns 400
5. POST `/api/consumers` with age < 18 or > 120 - Returns 400 (check violation)
6. POST `/api/consumers` with invalid payment_mode - Returns 400 (enum violation)
7. POST `/api/consumers` with invalid occupation type - Returns 400 (enum violation)
8. POST `/api/consumers` with duplicate electric_consumer_no - Returns 409
9. PUT `/api/consumers/999` - Returns 404 for non-existent consumer
10. DELETE `/api/consumers/999` - Returns 404 for non-existent consumer

**Edge Cases:**
1. Consumer with age exactly 64 (not MAC warning)
2. Consumer with age exactly 65 (MAC warning)
3. Consumer with null optional fields (email, phone_secondary, etc.)
4. Consumer with maximum length text fields

### 4. Bank Loans API (`/api/bank-loans`)

#### Endpoints:
- GET `/api/bank-loans` - List all bank loans with consumer name
- GET `/api/bank-loans/consumer/:consumerId` - Get loan for specific consumer
- POST `/api/bank-loans` - Create new bank loan
- PUT `/api/bank-loans/:id` - Update bank loan
- DELETE `/api/bank-loans/:id` - Delete bank loan

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/bank-loans` - Returns list of all bank loans with consumer names
2. GET `/api/bank-loans/consumer/1` - Returns bank loan for specific consumer
3. POST `/api/bank-loans` - Creates new bank loan for consumer with payment_mode='bank_loan'
   - Valid loan amount (positive number)
   - Optional bank name, is_ghanbani_land, applied_at, remarks
4. PUT `/api/bank-loans/1` - Updates existing bank loan
5. DELETE `/api/bank-loans/1` - Deletes bank loan

**Negative Tests:**
1. GET `/api/bank-loans/consumer/999` - Returns 404 for non-existent consumer
2. GET `/api/bank-loans/consumer/1` where consumer has payment_mode='cash' - Returns 400 (business rule violation)
3. POST `/api/bank-loans` with missing consumer_id - Returns 400
4. POST `/api/bank-loans` for consumer with payment_mode='cash' - Returns 400 (business rule: cannot create bank loan for cash payment consumers)
5. POST `/api/bank-loans` for consumer that doesn't exist - Returns 404
6. POST `/api/bank-loans` with duplicate consumer_id (loan already exists) - Returns 409
7. POST `/api/bank-loans` with negative loan amount - Returns 400
8. PUT `/api/bank-loans/999` - Returns 404 for non-existent loan
9. DELETE `/api/bank-loans/999` - Returns 404 for non-existent loan

### 5. Projects API (`/api/projects`)

#### Endpoints:
- GET `/api/projects` - List all projects with consumer name and status
- GET `/api/projects/dashboard` - Aggregate counts by status
- GET `/api/projects/status/:status` - Filter by current status
- GET `/api/projects/:id` - Get full project detail with status history
- POST `/api/projects` - Create project (auto-linked to consumer)
- PATCH `/api/projects/:id/status` - Status transition (with transaction & status history record)
- PUT `/api/projects/:id` - General update for project details
- DELETE `/api/projects/:id` - Delete project

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/projects` - Returns list of all projects with consumer name and status
2. GET `/api/projects/dashboard` - Returns count of projects by status
3. GET `/api/projects/status/new_registration` - Returns projects filtered by status
4. GET `/api/projects/1` - Returns full project detail with joined consumer data and status history
5. POST `/api/projects` - Creates new project linked to existing consumer
   - Valid consumer_id (must exist)
   - Optional registration_no, capacity_kw, assigned_site_manager, current_status
   - Default status: 'new_registration' if not provided
6. PATCH `/api/projects/1/status` - Updates project status with transaction and history record
   - Requires: to_status (or status/current_status), changed_by (user ID)
   - Optional: remarks
   - Automatically records current status as from_status
   - Inserts record into status_history table
7. PUT `/api/projects/1` - Updates project details (registration_no, capacity_kw, assigned_site_manager, current_status)
8. DELETE `/api/projects/1` - Soft deletes project

**Negative Tests:**
1. GET `/api/projects/999` - Returns 404 for non-existent project
2. GET `/api/projects/status/invalid_status` - Returns 400 (invalid project_status enum)
3. POST `/api/projects` with missing consumer_id - Returns 400
4. POST `/api/projects` for consumer that doesn't exist - Returns 404
5. POST `/api/projects` with duplicate consumer_id (project already exists) - Returns 409
6. POST `/api/projects` with duplicate registration_no - Returns 409
7. POST `/api/projects` with invalid capacity_kw (negative) - Returns 400
8. POST `/api/projects` with invalid assigned_site_manager (non-existent user) - Returns 400
9. PATCH `/api/projects/999/status` - Returns 404 for non-existent project
10. PATCH `/api/projects/1/status` with missing to_status/status/current_status - Returns 400
11. PATCH `/api/projects/1/status` with missing changed_by - Returns 400
12. PATCH `/api/projects/1/status` with invalid status value - Returns 400 (invalid project_status enum)
13. PUT `/api/projects/999` - Returns 404 for non-existent project
14. DELETE `/api/projects/999` - Returns 404 for non-existent project

**Edge Cases:**
1. Project status transition through all possible workflow states
2. Project with null optional fields (registration_no, capacity_kw, assigned_site_manager)
3. Multiple status transitions for same project (verifying history tracking)
4. Project status transition validation (valid enum values)

### 6. Documents API (`/api/documents`)

#### Endpoints:
- GET `/api/documents/status-summary` - Count documents by status
- GET `/api/documents/consumer/:consumerId` - Get all documents for a consumer
- POST `/api/documents` - Create new document record
- PATCH `/api/documents/:id/verify` - Verify document (doc team)
- PATCH `/api/documents/:id/reject` - Reject document (doc team with reason)
- POST `/api/documents/:id/reupload` - Create new version of document

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/documents/status-summary` - Returns count of documents by status ('uploaded', 'verified', 'rejected', 'action_required')
2. GET `/api/documents/consumer/1` - Returns all documents for specific consumer with joined uploader/verifier names
3. POST `/api/documents` - Creates new document record
   - Required: consumer_id, doc_type, file_url, uploaded_by
   - Optional: file_name, mime_type, geo_lat, geo_lng
   - Default status: 'uploaded'
   - Default version: 1
4. PATCH `/api/documents/1/verify` - Marks document as verified
   - Required: verified_by (user ID)
   - Sets status to 'verified', sets verified_by and verified_at timestamps
5. PATCH `/api/documents/1/reject` - Marks document as rejected
   - Required: verified_by (user ID), reject_reason
   - Sets status to 'rejected', sets verified_by and verified_at timestamps, sets reject_reason
6. POST `/api/documents/1/reupload` - Creates new version of document
   - Required: file_url, uploaded_by
   - Optional: file_name, mime_type, geo_lat, geo_lng
   - Automatically increments version number
   - Preserves consumer_id and doc_type from original

**Negative Tests:**
1. GET `/api/documents/consumer/999` - Returns 404 for non-existent consumer
2. GET `/api/documents/status-summary` with invalid status filter - Should still work (returns all statuses)
3. POST `/api/documents` with missing required fields (consumer_id, doc_type, file_url, uploaded_by) - Returns 400
4. POST `/api/documents` for consumer that doesn't exist - Returns 400 (foreign key violation)
5. POST `/api/documents` for user that doesn't exist (uploaded_by) - Returns 400 (foreign key violation)
6. POST `/api/documents` with invalid doc_type - Returns 400 (enum violation)
7. POST `/api/documents` with invalid geo_lat/geo_lng (out of range) - Should be handled by application validation
8. PATCH `/api/documents/999/verify` - Returns 404 for non-existent document
9. PATCH `/api/documents/1/verify` with missing verified_by - Returns 400
10. PATCH `/api/documents/1/verify` for document with status != 'uploaded' - Returns 400 (business rule: can only verify uploaded documents)
11. PATCH `/api/documents/1/reject` with missing verified_by or reject_reason - Returns 400
12. PATCH `/api/documents/1/reject` for document with status != 'uploaded' - Returns 400
13. POST `/api/documents/999/reupload` - Returns 404 for non-existent document
14. POST `/api/documents/1/reupload` with missing file_url or uploaded_by - Returns 400

**Edge Cases:**
1. Document re-upload multiple times (version incrementing: 1 → 2 → 3 → ...)
2. Document with null optional fields (file_name, mime_type, geo coordinates)
3. Document verification/rejection by different users
4. Multiple documents of same type for same consumer (different versions)
5. Document with special characters in file_name or file_url

### 7. Status History API (`/api/status-history`)

#### Endpoints:
- GET `/api/status-history/project/:projectId` - Get full timeline for a project
- GET `/api/status-history/recent` - Get recent changes across all projects

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/status-history/project/1` - Returns all status history records for specific project with changed_by name
   - Ordered by changed_at DESC (newest first)
   - Includes from_status, to_status, changed_by name, remarks, changed_at
2. GET `/api/status-history/recent` - Returns recent status changes across all projects
   - Limited to reasonable number (e.g., 50 most recent)
   - Ordered by changed_at DESC

**Negative Tests:**
1. GET `/api/status-history/project/999` - Returns empty array (not 400, as project may exist but have no history)
2. GET `/api/status-history/recent` with invalid parameters - Should handle gracefully

**Edge Cases:**
1. Project with no status changes (returns empty array)
2. Project with multiple status changes over time (verifying chronological order)
3. Status history records with null from_status (initial status setup)
4. Status history with various remark lengths (empty to maximum)

### 8. Action Required API (`/api/actions`)

#### Endpoints:
- GET `/api/actions` - List all open actions (status not 'resolved' or 'cancelled')
- GET `/api/actions/project/:projectId` - Get actions for specific project
- POST `/api/actions` - Create new action (raised by doc team)
- PATCH `/api/actions/:id/status` - Update action status
- GET `/api/actions/overdue` - Get actions open > 7 days

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/actions` - Returns list of all open actions with joined project, consumer, and user data
   - Excludes actions with status 'resolved' or 'cancelled'
   - Ordered by raised_at DESC
2. GET `/api/actions/project/1` - Returns all actions for specific project
   - Includes project and consumer data
   - Ordered by raised_at DESC
3. POST `/api/actions` - Creates new action record
   - Required: project_id, action_type, raised_by
   - Optional: detail, assigned_to
   - Default status: 'open'
4. PATCH `/api/actions/1/status` - Updates action status
   - Required: status
   - Optional: resolved_by (when status='resolved'), assigned_to
   - When status='resolved': sets resolved_by and resolved_at timestamps
   - When status != 'resolved': updates assigned_to if provided
5. GET `/api/actions/overdue` - Returns actions open > 7 days
   - Includes days_open calculation
   - Ordered by raised_at ASC (oldest first)

**Negative Tests:**
1. GET `/api/actions/project/999` - Returns empty array (not 400)
2. POST `/api/actions` with missing required fields (project_id, action_type, raised_by) - Returns 400
3. POST `/api/actions` for project that doesn't exist - Returns 404
4. POST `/api/actions` for user that doesn't exist (raised_by) - Returns 400
5. POST `/api/actions` with invalid action_type - Returns 400 (enum violation)
6. POST `/api/actions` with invalid assigned_to (non-existent user) - Returns 400
7. PATCH `/api/actions/999/status` - Returns 404 for non-existent action
8. PATCH `/api/actions/1/status` with missing status - Returns 400
9. PATCH `/api/actions/1/status` with invalid status value - Returns 400 (enum violation)
10. PATCH `/api/actions/1/status` with status='resolved' but missing resolved_by - Returns 400

**Edge Cases:**
1. Action lifecycle: open → assigned → in_progress → resolved
2. Action reassignment (changing assigned_to while open)
3. Action reopening (changing status from resolved/cancelled back to open)
4. Overdue actions calculation accuracy
5. Actions with various action_type values (all enum options)
6. Actions with long detail text

### 9. Ownership Transfers API (`/api/ownership-transfers`)

#### Endpoints:
- GET `/api/ownership-transfers/:actionId` - Get transfer details by action ID
- POST `/api/ownership-transfers` - Create ownership transfer (with business rule validation)
- PUT `/api/ownership-transfers/:id` - Update ownership transfer

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/ownership-transfers/1` - Returns ownership transfer details with joined action, project, and consumer data
2. POST `/api/ownership-transfers` - Creates new ownership transfer record
   - Required: action_id, all_ror_members_alive, beneficiary_name
   - Optional: remarks
   - Business rule validation:
     * Verifies action_type = 'ownership_transfer' on linked action_required
     * If all_ror_members_alive = false, verifies death_certificate and legal_heir_certificate documents exist for consumer
3. PUT `/api/ownership-transfers/1` - Updates ownership transfer
   - Optional: all_ror_members_alive, beneficiary_name, remarks

**Negative Tests:**
1. GET `/api/ownership-transfers/999` - Returns 404 for non-existent ownership transfer
2. GET `/api/ownership-transfers/:actionId` for action_id that doesn't have ownership transfer - Returns 404
3. POST `/api/ownership-transfers` with missing required fields - Returns 400
4. POST `/api/ownership-transfers` for action_id that doesn't exist - Returns 404
5. POST `/api/ownership-transfers` for action_id where action_type != 'ownership_transfer' - Returns 400 (business rule)
6. POST `/api/ownership-transfers` with all_ror_members_alive = false but missing death_certificate document - Returns 400 (business rule)
7. POST `/api/ownership-transfers` with all_ror_members_alive = false but missing legal_heir_certificate document - Returns 400 (business rule)
8. POST `/api/ownership-transfers` for action_id where consumer doesn't exist - Returns 400
9. PUT `/api/ownership-transfers/999` - Returns 404 for non-existent ownership transfer

**Edge Cases:**
1. Ownership transfer with all_ror_members_alive = true (no document checks required)
2. Ownership transfer with all_ror_members_alive = false (requires both death and legal heir certificates)
3. Ownership transfer with various beneficiary name formats and lengths
4. Multiple ownership transfers for same action (should be prevented by unique constraint)

### 10. Material Deliveries API (`/api/material-deliveries`)

#### Endpoints:
- GET `/api/material-deliveries/project/:projectId` - Get delivery record for project
- POST `/api/material-deliveries` - Record material delivery
- PUT `/api/material-deliveries/:id` - Update DCR number

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/material-deliveries/project/1` - Returns delivery record for specific project with joined project, consumer, and user data
2. POST `/api/material-deliveries` - Records material delivery
   - Required: project_id, recorded_by
   - Optional: dcr_number, delivered_at
   - Business rule: Only allowed when project status is 'line_up_given' or later in pipeline
   - Default delivered_at: current timestamp
3. PUT `/api/material-deliveries/1` - Updates delivery record
   - Optional: dcr_number, delivered_at

**Negative Tests:**
1. GET `/api/material-deliveries/project/999` - Returns 404 for non-existent project
2. GET `/api/material-deliveries/project/1` for project with no delivery record - Returns 404
3. POST `/api/material-deliveries` with missing required fields (project_id, recorded_by) - Returns 400
4. POST `/api/material-deliveries` for project that doesn't exist - Returns 404
5. POST `/api/material-deliveries` for user that doesn't exist (recorded_by) - Returns 400
6. POST `/api/material-deliveries` for project with status before 'line_up_given' - Returns 400 (business rule)
   - Examples: 'new_registration', 'doc_requested', 'doc_uploaded', 'doc_verified', 'action_required', etc.
7. POST `/api/material-deliveries` with duplicate project_id (delivery already recorded) - Returns 409
8. PUT `/api/material-deliveries/999` - Returns 404 for non-existent delivery record

**Edge Cases:**
1. Material delivery at exact 'line_up_given' status (boundary condition)
2. Material delivery at various advanced statuses ('materials_delivered', 'installation_in_progress', etc.)
3. Delivery record with null dcr_number
4. Delivery record with various timestamp formats for delivered_at

### 11. Installation Progress API (`/api/installation`)

#### Endpoints:
- GET `/api/installation/project/:projectId` - Get all 10 checklist items for project
- POST `/api/installation/project/:projectId/init` - Initialize checklist with 10 items (weights hardcoded)
- PATCH `/api/installation/:id/complete` - Mark checklist item as done
- GET `/api/installation/project/:projectId/progress` - Calculate completion percentage

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/installation/project/1` - Returns all 10 installation checklist items for project with done_by name
   - Ordered by id (consistent ordering)
   - Includes item name, weight_pct, is_done, done_by name, done_at
2. POST `/api/installation/project/1/init` - Initializes installation checklist
   - Creates exactly 10 items with predefined weights (must sum to 100)
   - Returns created items with default is_done = false
3. PATCH `/api/installation/1/complete` - Marks checklist item as done
   - Required: done_by (user ID)
   - Sets is_done = true, sets done_by and done_at timestamps
   - Only works if is_done = false (prevents double-completion)
4. GET `/api/installation/project/1/progress` - Calculates completion percentage
   - Returns completion_pct (sum of weights for done items), items_done count, total_items count
   - Handles case where no checklist exists (returns 404)

**Negative Tests:**
1. GET `/api/installation/project/999` - Returns 404 for non-existent project
2. GET `/api/installation/project/1` for project with no checklist - Returns 404
3. POST `/api/installation/project/999/init` - Returns 404 for non-existent project
4. POST `/api/installation/project/1/init` when checklist already exists - Returns 409 (conflict)
5. PATCH `/api/installation/999/complete` - Returns 404 for non-existent checklist item
6. PATCH `/api/installation/1/complete` for item that's already done - Returns 400 (business rule)
7. PATCH `/api/installation/1/complete` with missing done_by - Returns 400
8. PATCH `/api/installation/1/complete` with done_by for non-existent user - Returns 400
9. GET `/api/installation/project/1/progress` for project with no checklist - Returns 404

**Edge Cases:**
1. Checklist with all items marked as done (100% completion)
2. Checklist with no items done (0% completion)
3. Checklist with partial completion (various percentages)
4. Checking off items in various orders
5. Verifying weight calculations (hardcoded weights must sum to 100)
6. Attempting to complete same item twice (should fail)

### 12. Payments API (`/api/payments`)

#### Endpoints:
- GET `/api/payments/project/:projectId` - Get all payments for project
- POST `/api/payments` - Record payment
- PATCH `/api/payments/:id/status` - Update payment status
- GET `/api/payments/pending` - Get all pending payments
- GET `/api/payments/summary` - Get payment summary by type

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/payments/project/1` - Returns all payments for specific project with joined project and consumer data
2. POST `/api/payments` - Records new payment
   - Required: project_id, payment_type, amount
   - Optional: status, reference_no, paid_at, recorded_by, remarks
  
   - Default status: 'pending'
   - Default recorded_at: current timestamp
   - Amount must be >= 0
3. PATCH `/api/payments/1/status` - Updates payment status
   - Required: status
   - Optional: paid_at (when status='paid'), recorded_by
   - Valid status values: 'pending', 'paid', 'refunded', 'failed'
4. GET `/api/payments/pending` - Returns all payments with status='pending'
5. GET `/api/payments/summary` - Returns aggregated payment data by type
   - Includes count, total_amount, paid_amount, pending_amount for each payment_type

**Negative Tests:**
1. GET `/api/payments/project/999` - Returns 404 for non-existent project
2. POST `/api/payments` with missing required fields (project_id, payment_type, amount) - Returns 400
3. POST `/api/payments` for project that doesn't exist - Returns 404
4. POST `/api/payments` for user that doesn't exist (recorded_by) - Returns 400
5. POST `/api/payments` with invalid payment_type - Returns 400 (enum violation)
6. POST `/api/payments` with negative amount - Returns 400 (check violation)
7. POST `/api/payments` with amount = 0 - Should be allowed (edge case)
8. PATCH `/api/payments/999/status` - Returns 404 for non-existent payment
9. PATCH `/api/payments/1/status` with missing status - Returns 400
10. PATCH `/api/payments/1/status` with invalid status value - Returns 400 (enum violation)
11. PATCH `/api/payments/1/status` with status='paid' but missing paid_at - Should still work (optional field)

**Edge Cases:**
1. Payment with amount = 0 (edge case for minimum value)
2. Payment with large amount (testing numeric limits)
3. Payment with various reference_no formats
4. Payment status transitions: pending → paid, pending → failed, pending → refunded
5. Multiple payments for same project
6. Payment summary calculations accuracy

### 13. Notifications API (`/api/notifications`)

#### Endpoints:
- GET `/api/notifications/user/:userId` - Get notifications for user
- GET `/api/notifications/user/:userId/unread` - Get unread notifications for user
- POST `/api/notifications` - Create notification
- PATCH `/api/notifications/:id/read` - Mark notification as read
- PATCH `/api/notifications/user/:userId/read-all` - Mark all notifications as read for user
- GET `/api/notifications/user/:userId/count` - Get unread count for user

#### Test Scenarios:

**Positive Tests:**
1. GET `/api/notifications/user/1` - Returns all notifications for specific user with optional project data
   - Ordered by created_at DESC (newest first)
2. GET `/api/notifications/user/1/unread` - Returns only unread notifications for user (is_read = false)
3. POST `/api/notifications` - Creates new notification
   - Required: user_id, title
   - Optional: body, project_id, is_read
   - Default is_read: false
   - Default created_at: current timestamp
4. PATCH `/api/notifications/1/read` - Marks notification as read
   - Sets is_read = true
5. PATCH `/api/notifications/user/1/read-all` - Marks all notifications as read for user
   - Sets is_read = true for all notifications where user_id = 1
6. GET `/api/notifications/user/1/count` - Returns count of unread notifications for user

**Negative Tests:**
1. GET `/api/notifications/user/999` - Returns empty array (not 400)
2. GET `/api/notifications/user/999/unread` - Returns empty array (not 400)
3. GET `/api/notifications/user/999/count` - Returns 0 (not 400)
4. POST `/api/notifications` with missing required fields (user_id, title) - Returns 400
5. POST `/api/notifications` for user that doesn't exist - Returns 400 (foreign key violation)
6. POST `/api/notifications` for project that doesn't exist (when provided) - Returns 400
7. PATCH `/api/notifications/999/read` - Returns 404 for non-existent notification
8. PATCH `/api/notifications/user/999/read-all` - Should handle gracefully (returns success with 0 affected)
9. PATCH `/api/notifications/1/read` for notification that's already read - Should still work (idempotent)

**Edge Cases:**
1. Notification with empty body
2. Notification with very long title and body (testing field limits)
3. Notification with and without project_id
4. Multiple notifications for same user
5. Marking same notification as read multiple times (idempotent)
6. Marking all as read when none exist or all already read
7. Unread count accuracy after various operations

## Error Condition Testing

### Database Constraint Violations
Test each endpoint for proper handling of:
1. **Unique constraint violations** (23505) → Should return 409 Conflict
2. **Foreign key violations** (23503) → Should return 400 Bad Request
3. **Check constraint violations** (23514) → Should return 400 Bad Request
4. **Invalid enum values** (22P02) → Should return 400 Bad Request
5. **Not null violations** (23502) → Should return 400 Bad Request
6. **Check violated** (23514) for range/length constraints

### Business Rule Violations
Test each endpoint with business-specific rules:
1. Invalid status transitions
2. Invalid payment_mode for bank loans
3. Missing required documents for ownership transfers
4. Invalid project status for material deliveries
5. Attempting to verify/reject non-uploaded documents
6. Attempting to complete already-completed checklist items
7. Creating duplicate entities where uniqueness is required

### Input Validation
Test each endpoint for:
1. Missing required fields
2. Invalid data types (string vs number vs boolean)
3. Invalid formats (email, phone, Aadhaar, PAN)
4. Values outside allowed ranges (age, amounts, percentages)
5. Empty strings where not allowed
6. Extremely long strings (testing field length limits)

## Performance and Load Testing

### Concurrent Requests
1. Test multiple simultaneous requests to same endpoint
2. Test mixed read/write operations
3. Test pagination with large datasets

### Response Time Benchmarks
1. GET requests should return within 200ms for cached/frequent data
2. POST/PUT/PATCH requests should return within 500ms for simple operations
3. Complex JOIN queries should return within 1-2 seconds
4. Report generation endpoints should complete within reasonable time

### Data Volume Testing
1. Test with maximum expected dataset size
2. Test pagination limits and performance
3. Test aggregation queries with large datasets

## Security Testing

### Input Sanitization
1. Test for SQL injection attempts in all parameters
2. Test for XSS attempts in text fields
3. Test for command injection where applicable

### Authentication & Authorization
*(Note: Based on code review, authentication appears to be planned but not yet implemented)*
1. Test endpoints without authentication (should fail when implemented)
2. Test role-based access control (when implemented)
3. Test privilege escalation attempts

### Data Protection
1. Verify sensitive data is not exposed inappropriately
2. Check that password hashes are not returned in API responses
3. Verify personal data handling complies with privacy requirements

## Test Execution Order

Based on dependencies and complexity, tests should be executed in this order:

1. **Health Check** - `GET /` or `/api/health`
2. **Foundation Data** - Users, Area Blocks
3. **Core Entities** - Consumers, Projects
4. **Dependent Modules** - Documents, Status History, Action Required
5. **Specialized Modules** - Bank Loans, Ownership Transfers, Material Deliveries, Installation Progress
6. **Financial Modules** - Payments
7. **Notification/System** - Notifications
8. **Dashboard/Aggregate** - Summary and reporting endpoints
9. **Edge Case & Error Condition** - All negative test cases
10. **Performance & Load** - Stress testing scenarios
11. **Security** - Penetration testing and validation

## Test Data Requirements

For comprehensive testing, the following test data should be available:

### Users
- Various roles: agent, site_manager, doc_team, accounts, admin
- Active and inactive users
- Valid contact information

### Area Blocks
- Multiple geographical areas with unique names

### Consumers
- Mix of payment modes (cash, bank_loan)
- Various age ranges (including >64 for MAC warnings)
- Valid and invalid Aadhaar/PAN formats for negative testing
- Various occupation types
- Different area blocks and creating agents

### Projects
- Linked to various consumers
- Various project statuses (testing all enum values)
- Projects with and without optional fields (registration_no, capacity_kw, etc.)
- Projects with status history for testing

### Documents
- Various document types (testing all enum values)
- Various document statuses (uploaded, verified, rejected, action_required)
- Multiple versions of same document type (for re-upload testing)
- Documents with and without optional fields

### Actions & Ownership Transfers
- Various action types
- Actions in different states (open, assigned, in_progress, resolved, cancelled)
- Ownership transfers linked to appropriate action types
- Test data for document verification scenarios (death certificate, legal heir certificate)

### Financial Data
- Bank loans for consumers with payment_mode='bank_loan'
- Payments of various types and statuses
- Payment amounts including edge cases (zero, large values)

### Installation Progress
- Projects with initialized checklists
- Projects with partially completed checklists
- Projects with completed checklists

### Notifications
- Various notification types (with and without project_id)
- Read and unread notifications
- Notifications for various users

## Reporting and Metrics

Test results should include:
1. **Pass/Fail Rates** - Percentage of tests passing
2. **Response Times** - Average, min, max, percentile response times
3. **Error Rates** - Frequency of different error types
4. **Coverage Metrics** - Percentage of code paths tested
5. **Regression Detection** - Comparison against baseline performance

## Automation Considerations

For automated testing:
1. Use a testing framework like Jest or Mocha
2. Use supertest for HTTP requests
3. Use database transactions for test isolation
4. Generate test data dynamically where possible
5. Implement proper test cleanup
6. Create reusable test helpers for common operations
7. Implement data validation helpers for response verification

## Conclusion

This test plan provides comprehensive coverage for all APIs in the Solarise Odisha backend system. By following this plan, teams can ensure:
- All functionality works as expected
- Error conditions are handled properly
- Data integrity is maintained
- Performance meets requirements
- Security vulnerabilities are identified and addressed
- The system is ready for production use

Regular execution of this test suite throughout development will help catch issues early and ensure a quality product.