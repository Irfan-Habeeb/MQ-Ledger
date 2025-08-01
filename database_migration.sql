-- Add created_by column to accounting_entries table
ALTER TABLE accounting_entries 
ADD COLUMN created_by TEXT;

-- Add an index for better query performance
CREATE INDEX idx_accounting_entries_created_by ON accounting_entries(created_by);

-- Add a comment to document the column
COMMENT ON COLUMN accounting_entries.created_by IS 'Email of the user who created this entry';