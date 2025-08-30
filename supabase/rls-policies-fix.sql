-- Fix for RLS policies to work with user creation
-- This supplements the existing RLS policies

-- Allow users to create their own record
CREATE POLICY "Users can create their own record" ON users
  FOR INSERT WITH CHECK (
    -- Allow if user is creating their own record
    auth.uid() = id
  );

-- Alternative: You can also disable RLS temporarily for user creation
-- Uncomment the line below if you want to completely disable RLS for users table
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- If you want to re-enable it later with better policies:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY; 