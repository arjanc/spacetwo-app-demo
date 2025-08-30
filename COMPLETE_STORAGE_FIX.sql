-- Complete Storage Fix
-- This script completely resets and fixes all storage policies

-- Step 1: Disable RLS temporarily to clear all policies
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing storage policies to start fresh
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

-- Step 3: Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, working policies for project-files bucket
CREATE POLICY "project-files-insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-files');

CREATE POLICY "project-files-select"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-files');

CREATE POLICY "project-files-update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-files');

CREATE POLICY "project-files-delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-files');

-- Step 5: Create simple, working policies for avatars bucket
CREATE POLICY "avatars-insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars-select"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars-update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars');

CREATE POLICY "avatars-delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars');

-- Step 6: Verify buckets exist, create if they don't
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-files', 'project-files', false, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Complete storage fix applied! All policies reset and simplified.' as status; 