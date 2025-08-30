-- Create Storage Buckets with Clean, Simple Policies
-- This script creates the buckets and policies without the complex RLS issues

-- Create project-files bucket
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

-- Create avatars bucket
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

-- Create simple, permissive policies for project-files bucket
-- These policies allow all operations for authenticated users

CREATE POLICY "project-files-allow-all-insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');

CREATE POLICY "project-files-allow-all-select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project-files');

CREATE POLICY "project-files-allow-all-update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-files')
WITH CHECK (bucket_id = 'project-files');

CREATE POLICY "project-files-allow-all-delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-files');

-- Create simple, permissive policies for avatars bucket
-- These policies allow all operations for authenticated users

CREATE POLICY "avatars-allow-all-insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars-allow-all-select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "avatars-allow-all-update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars-allow-all-delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Success message
SELECT 
  'Storage buckets and policies created successfully!' as status,
  'project-files: private, 50MB limit' as bucket1,
  'avatars: public, 2MB limit' as bucket2,
  'All policies allow authenticated users to perform all operations' as policies; 