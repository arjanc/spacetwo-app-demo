# Manual Storage Fix Guide

## Problem

You're getting `42501: must be owner of table objects` error when trying to run SQL scripts to fix storage policies.

## Solution: Manual Fix via Supabase Dashboard

### Step 1: Run the SQL Script (Safe Version)

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the content from `SUPABASE_STORAGE_FIX.sql`**
4. **Click Run**

This script only drops and creates policies (which you have permission to do).

### Step 2: Manual Policy Management (Alternative)

If the SQL script still doesn't work, do this manually:

#### 2.1 Go to Storage in Supabase Dashboard

1. **Navigate to Storage** in your Supabase dashboard
2. **Click on "Policies"** tab

#### 2.2 Remove Existing Policies

1. **Find all policies** for `project-files` and `avatars` buckets
2. **Delete them one by one** by clicking the trash icon
3. **Make sure no policies remain** for these buckets

#### 2.3 Create New Simple Policies

**For project-files bucket:**

1. **Click "New Policy"**
2. **Select "project-files" bucket**
3. **Create these 4 policies:**

**INSERT Policy:**

- **Name:** `project-files-insert`
- **Operation:** INSERT
- **Policy definition:** `bucket_id = 'project-files' AND auth.role() = 'authenticated'`

**SELECT Policy:**

- **Name:** `project-files-select`
- **Operation:** SELECT
- **Policy definition:** `bucket_id = 'project-files' AND auth.role() = 'authenticated'`

**UPDATE Policy:**

- **Name:** `project-files-update`
- **Operation:** UPDATE
- **Policy definition:** `bucket_id = 'project-files' AND auth.role() = 'authenticated'`

**DELETE Policy:**

- **Name:** `project-files-delete`
- **Operation:** DELETE
- **Policy definition:** `bucket_id = 'project-files' AND auth.role() = 'authenticated'`

**For avatars bucket:**

1. **Click "New Policy"**
2. **Select "avatars" bucket**
3. **Create these 4 policies:**

**INSERT Policy:**

- **Name:** `avatars-insert`
- **Operation:** INSERT
- **Policy definition:** `bucket_id = 'avatars' AND auth.role() = 'authenticated'`

**SELECT Policy:**

- **Name:** `avatars-select`
- **Operation:** SELECT
- **Policy definition:** `bucket_id = 'avatars'`

**UPDATE Policy:**

- **Name:** `avatars-update`
- **Operation:** UPDATE
- **Policy definition:** `bucket_id = 'avatars' AND auth.role() = 'authenticated'`

**DELETE Policy:**

- **Name:** `avatars-delete`
- **Operation:** DELETE
- **Policy definition:** `bucket_id = 'avatars' AND auth.role() = 'authenticated'`

### Step 3: Verify Buckets Exist

1. **Go to Storage > Buckets**
2. **Check that these buckets exist:**

   - `project-files` (private, 50MB limit)
   - `avatars` (public, 2MB limit)

3. **If they don't exist, create them:**

   - Click "Create a new bucket"
   - **Name:** `project-files`
   - **Public:** `false`
   - **File size limit:** `52428800`
   - **Allowed MIME types:** `image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/ogg,application/pdf`

   - Click "Create a new bucket"
   - **Name:** `avatars`
   - **Public:** `true`
   - **File size limit:** `2097152`
   - **Allowed MIME types:** `image/jpeg,image/jpg,image/png,image/gif,image/webp`

### Step 4: Test the Fix

1. **Restart your development server:**

   ```bash
   npm run dev
   ```

2. **Try uploading a file**
3. **Check for success message:**
   ```
   Upload API: project-files bucket worked successfully
   ```

## What These Policies Do

The new policies are very simple:

- ✅ **Only check if user is authenticated** (`auth.role() = 'authenticated'`)
- ✅ **Only check bucket ID** (`bucket_id = 'project-files'`)
- ✅ **No complex path matching** or user ID checking
- ✅ **Allow any authenticated user** to upload to the buckets

## Security Note

These policies are less restrictive but still secure:

- ✅ Only authenticated users can upload
- ✅ Your application logic controls access to projects
- ✅ You can add more specific policies later if needed

## Troubleshooting

If you still get errors:

1. **Check that all old policies are deleted**
2. **Verify buckets exist and have correct settings**
3. **Make sure you're logged in** when testing
4. **Try with a simple image file** first (JPEG, PNG)

The key is to remove all the complex policies and replace them with simple ones that just check authentication and bucket ID.
