-- Enable Row Level Security on the accounting_entries table
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users full access
CREATE POLICY "Allow all authenticated users full access" ON accounting_entries
    FOR ALL
    USING (true)
    WITH CHECK (true);