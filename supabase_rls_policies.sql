-- Enable Row Level Security on the accounting_entries table
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to read all entries
CREATE POLICY "Allow all users to read accounting entries" ON accounting_entries
    FOR SELECT
    USING (true);

-- Create a policy that allows all authenticated users to insert entries
CREATE POLICY "Allow all users to insert accounting entries" ON accounting_entries
    FOR INSERT
    WITH CHECK (true);

-- Create a policy that allows users to update their own entries
CREATE POLICY "Allow users to update their own entries" ON accounting_entries
    FOR UPDATE
    USING (created_by = auth.jwt() ->> 'email')
    WITH CHECK (created_by = auth.jwt() ->> 'email');

-- Create a policy that allows users to delete their own entries
CREATE POLICY "Allow users to delete their own entries" ON accounting_entries
    FOR DELETE
    USING (created_by = auth.jwt() ->> 'email');

-- Alternative: If you want all users to be able to update/delete any entry:
-- CREATE POLICY "Allow all users to update accounting entries" ON accounting_entries
--     FOR UPDATE
--     USING (true)
--     WITH CHECK (true);

-- CREATE POLICY "Allow all users to delete accounting entries" ON accounting_entries
--     FOR DELETE
--     USING (true);