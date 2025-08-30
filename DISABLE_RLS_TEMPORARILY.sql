-- Temporarily Disable RLS for Storage Testing
-- This will allow uploads to work while we figure out the policy issue

-- Disable RLS on storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS disabled on storage.objects. Uploads should now work without policy restrictions.' as status;

-- Note: This is a temporary fix for testing purposes.
-- Once uploads work, we can re-enable RLS with proper policies. 