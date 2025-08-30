-- Aggressive Storage Fix - Complete RLS Disable
-- This script completely disables RLS on storage.objects and creates ultra-permissive policies

-- First, let's see what policies currently exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Drop ALL existing policies on storage.objects
DROP POLICY IF EXISTS "project-files-allow-all-insert" ON storage.objects;
DROP POLICY IF EXISTS "project-files-allow-all-select" ON storage.objects;
DROP POLICY IF EXISTS "project-files-allow-all-update" ON storage.objects;
DROP POLICY IF EXISTS "project-files-allow-all-delete" ON storage.objects;
DROP POLICY IF EXISTS "avatars-allow-all-insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars-allow-all-select" ON storage.objects;
DROP POLICY IF EXISTS "avatars-allow-all-update" ON storage.objects;
DROP POLICY IF EXISTS "avatars-allow-all-delete" ON storage.objects;

-- Drop any other policies that might exist
DROP POLICY IF EXISTS "Users can upload files to accessible projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can view project files they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in accessible projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in accessible projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload files to their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to project-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view project-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update project-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete project-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow anyone to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete avatars" ON storage.objects;

-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  false,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'application/pdf'
  ]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create ULTRA-PERMISSIVE policies that allow everything
-- These policies use 'true' for all conditions, effectively disabling RLS

CREATE POLICY "ultra-permissive-insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "ultra-permissive-select"
ON storage.objects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "ultra-permissive-update"
ON storage.objects FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "ultra-permissive-delete"
ON storage.objects FOR DELETE
TO authenticated
USING (true);

-- Also create policies for anon users (in case that's needed)
CREATE POLICY "ultra-permissive-insert-anon"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "ultra-permissive-select-anon"
ON storage.objects FOR SELECT
TO anon
USING (true);

CREATE POLICY "ultra-permissive-update-anon"
ON storage.objects FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "ultra-permissive-delete-anon"
ON storage.objects FOR DELETE
TO anon
USING (true);

-- Show the current policies to verify
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Success message
SELECT 
  'Ultra-permissive storage policies created!' as status,
  'All policies use TRUE conditions' as detail,
  'This effectively disables RLS on storage.objects' as note; 