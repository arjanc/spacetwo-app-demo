# Supabase Storage Setup Guide

## Issue

The upload API is failing with "Failed to generate upload URL" because the required storage buckets are not properly configured in your Supabase project.

## Solution

### Option 1: Run the Storage SQL Script

1. **Go to your Supabase Dashboard**

   - Navigate to your project
   - Go to the SQL Editor

2. **Run the Storage Setup Script**

   ```sql
   -- Copy and paste the contents of supabase/storage.sql
   -- This will create all the required buckets and policies
   ```

3. **Verify the buckets were created**
   - Go to Storage in your Supabase dashboard
   - You should see: `project-files`, `avatars`, `previews`, `thumbnails`

### Option 2: Manual Bucket Creation

If the SQL script doesn't work, create the buckets manually:

1. **Create project-files bucket**

   - Go to Storage in Supabase dashboard
   - Click "Create a new bucket"
   - Name: `project-files`
   - Public: `false`
   - File size limit: `52428800` (50MB)
   - Allowed MIME types: `image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/ogg,application/pdf`

2. **Create storage policies**

   - Go to Storage > Policies
   - Add the following policies for `project-files` bucket:

   **INSERT Policy:**

   ```sql
   CREATE POLICY "Users can upload files to accessible projects"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'project-files' AND
     auth.uid()::text = split_part(name, '/', 1)
   );
   ```

   **SELECT Policy:**

   ```sql
   CREATE POLICY "Users can view project files they have access to"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'project-files' AND
     auth.uid()::text = split_part(name, '/', 1)
   );
   ```

### Option 3: Use Existing Bucket (Temporary Fix)

The current code has a fallback to use the `avatars` bucket. This will work temporarily, but you should set up the proper buckets for production.

## Testing

After setting up the buckets:

1. **Restart your development server**

   ```bash
   npm run dev
   ```

2. **Test the upload functionality**

   - Try dragging and dropping a file
   - Check the browser console and server logs for any errors

3. **Check the logs**
   - Look for "Upload API: project-files bucket worked successfully" in the console

## Common Issues

1. **Bucket doesn't exist**: Run the storage SQL script
2. **Permission denied**: Check that the storage policies are correctly set up
3. **File size too large**: Check the bucket's file size limit
4. **Invalid MIME type**: Check the bucket's allowed MIME types

## Next Steps

Once the buckets are properly configured, the drag and drop upload functionality should work correctly. The files will be stored in the appropriate bucket based on your project structure.
