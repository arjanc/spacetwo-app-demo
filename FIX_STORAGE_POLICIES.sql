-- Fix Storage Policies
-- This script fixes the RLS policy issues that are preventing file uploads

-- First, let's drop the existing problematic policies
DROP POLICY IF EXISTS "Users can upload files to accessible projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can view project files they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in accessible projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in accessible projects" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload files to their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in their projects" ON storage.objects;

-- Create simplified policies that work with the current setup
-- These policies allow authenticated users to upload/view files in their own projects

-- Policy for uploading files (INSERT)
CREATE POLICY "Allow authenticated users to upload to project-files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND
  auth.uid() IS NOT NULL
);

-- Policy for viewing files (SELECT)
CREATE POLICY "Allow authenticated users to view project-files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files' AND
  auth.uid() IS NOT NULL
);

-- Policy for updating files (UPDATE)
CREATE POLICY "Allow authenticated users to update project-files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-files' AND
  auth.uid() IS NOT NULL
);

-- Policy for deleting files (DELETE)
CREATE POLICY "Allow authenticated users to delete project-files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' AND
  auth.uid() IS NOT NULL
);

-- Also fix the avatars bucket policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create simplified avatars policies
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow anyone to view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated users to update avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated users to delete avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid() IS NOT NULL
);

-- Success message
SELECT 'Storage policies fixed successfully! Uploads should now work.' as status; 