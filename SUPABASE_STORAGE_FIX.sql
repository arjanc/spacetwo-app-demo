-- Supabase Storage Fix
-- This script works within Supabase's permission limitations

-- Step 1: Drop existing policies (this should work)
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

-- Step 2: Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-files', 'project-files', false, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create the simplest possible policies
-- These policies only check if the user is authenticated and the bucket exists

-- Project-files bucket policies
CREATE POLICY "project-files-insert-policy"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "project-files-select-policy"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "project-files-update-policy"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "project-files-delete-policy"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' AND
  auth.role() = 'authenticated'
);

-- Avatars bucket policies
CREATE POLICY "avatars-insert-policy"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "avatars-select-policy"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars-update-policy"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "avatars-delete-policy"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Success message
SELECT 'Supabase storage fix applied! Policies created with minimal restrictions.' as status; 