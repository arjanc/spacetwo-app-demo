# Supabase Database Setup Guide

This guide will help you set up the Supabase database for your application with all the necessary tables, policies, and storage configurations.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Environment Variables**: Ensure you have your Supabase credentials in your `.env.local` file

## Step 1: Environment Configuration

Create or update your `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY is no longer needed
```

You can find these values in your Supabase dashboard under **Settings > API**.

## Step 2: Database Schema Setup

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL files in order:

#### 1. Create Database Schema

Copy and paste the content from `supabase/schema.sql` into the SQL editor and run it.

This will create:

- All database tables (users, projects, spaces, collections, files, etc.)
- Custom types and enums
- Indexes for performance
- Views for statistics
- Triggers for automatic timestamps
- Initial tag data

#### 2. Set up Row Level Security (RLS)

Copy and paste the content from `supabase/rls-policies.sql` into the SQL editor and run it.

This will:

- Enable RLS on all tables
- Create helper functions for access control
- Set up comprehensive security policies

#### 3. Configure Storage

Copy and paste the content from `supabase/storage.sql` into the SQL editor and run it.

This will:

- Create storage buckets for different file types
- Set up storage policies
- Create helper functions for file path generation

### Option B: Using Supabase CLI

If you prefer using the CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push --db-url your-database-url
```

## Step 3: Storage Buckets

The setup creates four storage buckets:

1. **project-files** (Private) - Main project files (50MB limit)
2. **avatars** (Public) - User avatars (2MB limit)
3. **previews** (Public) - File previews (10MB limit)
4. **thumbnails** (Public) - File thumbnails (1MB limit)

## Step 4: Update Your Application

### 1. Install TypeScript Types

The database types are already created in `lib/types/database.ts`. Make sure to import them in your API routes:

```typescript
import type { Database } from '@/lib/types/database';
import { createClientSupabase } from '@/lib/supabase/server';

// Use typed client
const supabase = createClientSupabase<Database>();
```

### 2. Update Supabase Client Configuration

Update your `lib/supabase/client.ts` to use the database types:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
    },
  },
);
```

### 3. Update Server Client Configuration

Update your `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/types/database';

export function createClientSupabase() {
  // ... existing cookie handling code ...

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ... existing cookie configuration ...
      },
    },
  );
}
```

## Step 5: Authentication Setup

### 1. Enable Authentication Providers

In your Supabase dashboard:

1. Go to **Authentication > Providers**
2. Enable your preferred providers (Email, Google, GitHub, etc.)
3. Configure redirect URLs for your application

### 2. Set up Auth Callback

The authentication callback is already configured in `app/auth/callback/route.ts`.

### 3. Update Auth Context

Make sure your `contexts/AuthContext.tsx` is properly configured to work with the new user schema.

## Step 6: File Upload Configuration

### 1. Update Upload API

The upload API in `app/api/upload/route.ts` needs to be updated to use the new storage buckets:

```typescript
import { createClientSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClientSupabase();
  const { projectId, collectionId, fileName, bucketName = 'project-files' } = await request.json();

  // Generate the file path
  const filePath = `${projectId}/${collectionId}/${fileName}`;

  const { data, error } = await supabase.storage.from(bucketName).createSignedUploadUrl(filePath);

  if (error) {
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
```

### 2. Update File Service

Update your `lib/file-service.ts` to work with the new storage system.

## Step 7: Testing the Setup

### 1. Database Connection Test

Create a simple test to verify your database connection:

```typescript
// Test in your API route or component
const { data: projects, error } = await supabase.from('projects').select('*').limit(1);

if (error) {
  console.error('Database connection failed:', error);
} else {
  console.log('Database connected successfully');
}
```

### 2. Storage Test

Test file upload functionality:

```typescript
// Test storage upload
const { data, error } = await supabase.storage.from('avatars').upload('test/test.jpg', file);

if (error) {
  console.error('Storage upload failed:', error);
} else {
  console.log('Storage working correctly');
}
```

## Database Schema Overview

### Core Tables

1. **users** - User profiles and authentication data
2. **projects** - Main project entities
3. **spaces** - Working spaces within projects
4. **collections** - File collections within spaces
5. **files** - Individual files and their metadata
6. **tags** - Tags for categorization
7. **comments** - Comments on files
8. **likes** - User likes on files
9. **project_collaborators** - Team collaboration
10. **file_views** - Analytics and view tracking

### Relationships

- Users can own multiple projects
- Projects can have multiple spaces
- Spaces can have multiple collections
- Collections can have multiple files
- Projects can have multiple collaborators
- Files can have multiple comments and likes

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Storage policies** for file access control
- **Role-based access control** for collaboration
- **Soft deletes** for data recovery

## Troubleshooting

### Common Issues

1. **Permission Denied for Schema Auth**

   - This is fixed in the provided SQL files - we use `auth.uid()` directly instead of creating wrapper functions
   - If you encounter this error, ensure you're using the corrected `supabase/rls-policies.sql` file
   - The `auth` schema is restricted and users cannot create functions there

2. **RLS User Creation Error (42501)**

   - If you get "new row violates row-level security policy for table 'users'", run the RLS fix:
   - Execute `supabase/rls-policies-fix.sql` in your SQL editor
   - Users are created through the regular API with proper authentication

3. **RLS Policies Not Working**

   - Ensure you're authenticated when testing
   - Check that the policies are correctly applied
   - Verify helper functions are created

4. **Storage Upload Fails**

   - Check bucket policies
   - Verify file size limits
   - Ensure correct MIME types

5. **Database Connection Issues**
   - Verify environment variables
   - Check Supabase service status
   - Ensure proper client configuration

### Debugging Tips

1. **Enable Supabase Logging**:

   ```typescript
   const supabase = createClient(url, key, {
     auth: {
       debug: true,
     },
   });
   ```

2. **Check RLS Policies**:

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
   ```

3. **Monitor Storage Usage**:
   Check your Supabase dashboard for storage usage and limits.

## Next Steps

1. **Implement Authentication**: Set up user registration and login
2. **Create Project Management**: Implement project creation and management
3. **File Upload System**: Build the file upload interface
4. **Collaboration Features**: Implement team collaboration features
5. **Analytics Dashboard**: Use the file_views table for analytics

## Support

If you encounter issues:

1. Check the Supabase documentation
2. Review the generated SQL files for any syntax errors
3. Test each component separately
4. Check the browser console and network tab for errors

## Security Considerations

- The service role key is no longer needed as we use regular authentication
- Always use RLS policies for data access control
- Regularly audit your storage and database access patterns
- Implement proper error handling in your API routes
- Consider implementing rate limiting for file uploads

This setup provides a robust, scalable foundation for your creative collaboration platform with proper security, storage management, and team collaboration features.
