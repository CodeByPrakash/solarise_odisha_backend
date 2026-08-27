-- Migration: Split consumers.full_name into first_name + last_name
-- Run this against your PostgreSQL database before deploying the updated backend code.

BEGIN;

-- Step 1: Add new columns
ALTER TABLE consumers ADD COLUMN first_name TEXT;
ALTER TABLE consumers ADD COLUMN last_name TEXT;

-- Step 2: Migrate existing data from full_name
-- first_name = first word, last_name = everything after the first space
UPDATE consumers
SET first_name = SPLIT_PART(full_name, ' ', 1),
    last_name  = CASE
                   WHEN POSITION(' ' IN full_name) > 0
                   THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
                   ELSE NULL
                 END;

-- Step 3: Set first_name as NOT NULL now that data is migrated
ALTER TABLE consumers ALTER COLUMN first_name SET NOT NULL;

-- Step 4: Drop the old full_name column
ALTER TABLE consumers DROP COLUMN full_name;

COMMIT;
