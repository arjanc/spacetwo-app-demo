-- Quick Storage Bucket Fix
-- Run this in your Supabase SQL Editor to fix the upload issue

-- Step 1: Create the required storage buckets
-- This will create the buckets that the upload API is looking for

-- Create project-files bucket (main bucket for project files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files', 
  'project-files', 
  false, 
  52428800, 
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket (fallback bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  2097152, 
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create basic storage policies for project-files bucket
-- These policies allow users to upload and view files in their own projects

-- Policy for uploading files (INSERT)
CREATE POLICY "Users can upload files to their projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Policy for viewing files (SELECT)
CREATE POLICY "Users can view files in their projects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Policy for updating files (UPDATE)
CREATE POLICY "Users can update files in their projects"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Policy for deleting files (DELETE)
CREATE POLICY "Users can delete files in their projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Step 3: Create basic storage policies for avatars bucket
-- These policies allow users to upload and view avatars

-- Policy for uploading avatars (INSERT)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Policy for viewing avatars (SELECT)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy for updating avatars (UPDATE)
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Policy for deleting avatars (DELETE)
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Success message
SELECT 'Storage buckets and policies created successfully!' as status; 