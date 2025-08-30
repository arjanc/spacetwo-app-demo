# Storage Bucket Configuration Fix

## Problem

You're getting the error:

```json
{
  "error": "Failed to generate upload URL",
  "details": "Storage buckets not properly configured. Please check your Supabase storage setup."
}
```

This happens because the required storage buckets (`project-files` and `avatars`) are not properly configured in your Supabase project.

## Solution

### Step 1: Run the Storage Setup Script

1. **Go to your Supabase Dashboard**

   - Navigate to your project
   - Go to **SQL Editor**

2. **Run the Storage Setup Script**
   - Copy and paste the entire content from `supabase/storage.sql` into the SQL editor
   - Click **Run** to execute the script

This script will:

- Create the `project-files` bucket (private, 50MB limit)
- Create the `avatars` bucket (public, 2MB limit)
- Create the `previews` bucket (public, 10MB limit)
- Create the `thumbnails` bucket (public, 1MB limit)
- Set up all necessary storage policies for secure access

### Step 2: Verify Bucket Creation

After running the script:

1. **Go to Storage in your Supabase dashboard**
2. **Check that these buckets exist:**
   - `project-files` (should be private)
   - `avatars` (should be public)
   - `previews` (should be public)
   - `thumbnails` (should be public)

### Step 3: Check Storage Policies

1. **Go to Storage > Policies**
2. **Verify these policies exist for `project-files`:**
   - "Users can upload files to accessible projects" (INSERT)
   - "Users can view project files they have access to" (SELECT)
   - "Users can update files in accessible projects" (UPDATE)
   - "Users can delete files in accessible projects" (DELETE)

### Step 4: Test the Fix

1. **Restart your development server:**

   ```bash
   npm run dev
   ```

2. **Try uploading a file:**
   - Drag and drop a file into a collection
   - Check the browser console for success messages
   - Look for: "Upload API: project-files bucket worked successfully"

## Alternative: Manual Bucket Creation

If the SQL script doesn't work, create the buckets manually:

### 1. Create project-files bucket

1. Go to **Storage** in Supabase dashboard
2. Click **"Create a new bucket"**
3. Fill in the details:
   - **Name**: `project-files`
   - **Public**: `false` (unchecked)
   - **File size limit**: `52428800` (50MB)
   - **Allowed MIME types**:
     ```
     image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/ogg,application/pdf
     ```

### 2. Create storage policies for project-files

Go to **Storage > Policies** and add these policies:

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

**UPDATE Policy:**

```sql
CREATE POLICY "Users can update files in accessible projects"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text = split_part(name, '/', 1)
);
```

**DELETE Policy:**

```sql
CREATE POLICY "Users can delete files in accessible projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text = split_part(name, '/', 1)
);
```

## Troubleshooting

### Common Issues

1. **"Bucket doesn't exist" error**

   - Make sure you ran the storage SQL script
   - Check that the bucket names match exactly: `project-files`, `avatars`

2. **"Permission denied" error**

   - Check that the storage policies are correctly set up
   - Verify the user is authenticated
   - Check that the file path structure matches the policy expectations

3. **"File size too large" error**

   - Check the bucket's file size limit (should be 50MB for project-files)
   - Reduce file size or increase the limit

4. **"Invalid MIME type" error**
   - Check the bucket's allowed MIME types
   - The file type must be in the allowed list

### Debug Steps

1. **Check the server logs** for detailed error messages
2. **Verify authentication** - make sure the user is logged in
3. **Check file path structure** - should be `projectId/collectionName/fileId.extension`
4. **Test with a simple image file** first (JPEG, PNG)

### Fallback Behavior

The current code has a fallback mechanism:

- First tries `project-files` bucket
- If that fails, tries `avatars` bucket with a different path
- If both fail, returns the error you're seeing

## Expected Success Flow

After proper setup, you should see these log messages:

```
Upload API: Trying project-files bucket first...
Upload API: project-files bucket worked successfully
Upload API: Signed upload URL created successfully
Upload API: File record created successfully
```

## Next Steps

Once the storage buckets are properly configured:

1. **Test file uploads** work correctly
2. **Test file viewing** works with signed URLs
3. **Monitor storage usage** in your Supabase dashboard
4. **Set up backup strategies** if needed

The upload functionality should work seamlessly once the storage configuration is complete!
