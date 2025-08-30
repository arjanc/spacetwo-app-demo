-- Fix Users Table RLS Policies
-- This ensures users can create their own records and the API can create user records

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own record" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view other users basic info" ON users;

-- Create comprehensive policies for users table

-- Allow users to create their own record (for signup)
CREATE POLICY "Users can create their own record" ON users
  FOR INSERT WITH CHECK (
    -- Allow if user is creating their own record
    auth.uid() = id
  );

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (
    auth.uid() = id
  );

-- Allow users to view other users' basic info (needed for collaboration)
CREATE POLICY "Users can view other users basic info" ON users
  FOR SELECT USING (
    -- Allow viewing basic info of other users
    true
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (
    auth.uid() = id
  );

-- Success message
SELECT 
  'Users table RLS policies updated successfully!' as status,
  'Users can now create their own records' as detail,
  'API can create user records during project creation' as note; 