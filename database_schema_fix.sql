-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'accounting_entries'
ORDER BY ordinal_position;

-- If user_email exists and created_by doesn't, we need to handle this
-- Option 1: Use user_email instead of created_by
-- Option 2: Add created_by and make user_email nullable
-- Option 3: Drop user_email and use created_by

-- Let's see what the current structure looks like first