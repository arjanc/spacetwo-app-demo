-- Fix for RLS policies to allow project creation via authenticated API
-- This supplements the existing RLS policies

-- Update the project creation policy to allow authenticated users to create projects
DROP POLICY IF EXISTS "Users can create projects" ON projects;

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (
    -- Allow if user is authenticated and creating their own project
    auth.uid() = owner_id
  );

-- Note: The API validates the user before setting owner_id
-- The API verifies the JWT token and only sets owner_id to the authenticated user's ID 