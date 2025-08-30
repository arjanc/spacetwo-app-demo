-- Disable Storage RLS (Alternative Method)
-- This script attempts to disable RLS on storage.objects using different approaches

-- Method 1: Try to disable RLS directly (might work in some cases)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Method 2: If Method 1 fails, create a permissive policy that allows everything
-- This effectively disables RLS by allowing all operations

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can upload files to accessible projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can view project files they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in accessible projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in accessible projects" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload files to their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in their projects" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to upload to project-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view project-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update project-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete project-files" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow anyone to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete avatars" ON storage.objects;

DROP POLICY IF EXISTS "project-files-insert-policy" ON storage.objects;
DROP POLICY IF EXISTS "project-files-select-policy" ON storage.objects;
DROP POLICY IF EXISTS "project-files-update-policy" ON storage.objects;
DROP POLICY IF EXISTS "project-files-delete-policy" ON storage.objects;

DROP POLICY IF EXISTS "avatars-insert-policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars-select-policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars-update-policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars-delete-policy" ON storage.objects;

-- Create permissive policies that allow everything (effectively disables RLS)
CREATE POLICY "allow-all-insert"
ON storage.objects FOR INSERT
WITH CHECK (true);

CREATE POLICY "allow-all-select"
ON storage.objects FOR SELECT
USING (true);

CREATE POLICY "allow-all-update"
ON storage.objects FOR UPDATE
USING (true);

CREATE POLICY "allow-all-delete"
ON storage.objects FOR DELETE
USING (true);

-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-files', 'project-files', false, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Storage RLS effectively disabled with permissive policies. Uploads should now work.' as status; 