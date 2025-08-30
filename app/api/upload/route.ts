import { createClientSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Helper function to create responses with CORS headers
function createCorsResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    console.log('Upload API: Starting request');

    // Get user ID from the headers set by the middleware
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      console.log('Upload API: User not authenticated');
      return createCorsResponse({ error: 'User not authenticated' }, 401);
    }
    
    const supabase = await createClientSupabase();
    console.log(`Upload API: Processing request for user ${userId}`);

    const body = await request.json();
    const { fileName, fileType, fileSize, projectName, collectionName } = body;

    console.log('Upload API: Request body:', { fileName, fileType, fileSize, projectName, collectionName });

    if (!fileName || !projectName || !collectionName) {
      console.log('Upload API: Missing required fields');
      return createCorsResponse({ error: 'Missing required fields: fileName, projectName, collectionName' }, 400);
    }

    // Step 1: Find all accessible project IDs for the user
    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('owner_id', userId)
      .eq('deleted', false);

    const { data: collabProjects, error: collabError } = await supabase
      .from('project_collaborators')
      .select('project_id')
      .eq('user_id', userId)
      .in('role', ['admin', 'editor'])
      .not('accepted_at', 'is', null);

    if (ownedError || collabError) {
      console.log('Upload API: Error fetching accessible projects:', ownedError, collabError);
      return createCorsResponse({ error: 'Error fetching accessible projects' }, 500);
    }

    const accessibleProjectIds = [
      ...(ownedProjects?.map((p) => p.id) || []),
      ...(collabProjects?.map((c) => c.project_id) || []),
    ];

    console.log('Upload API: Accessible project IDs:', accessibleProjectIds);
    console.log('Upload API: Searching for project name:', projectName);

    // Step 2: Find the project by name and accessible ID
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('name', projectName)
      .in('id', accessibleProjectIds)
      .eq('deleted', false)
      .single();

    if (projectError || !projectData) {
      console.log('Upload API: Project not found or access denied:', projectError);
      return createCorsResponse({ error: 'Project not found or access denied' }, 404);
    }

    const projectId = projectData.id;
    console.log('Upload API: Found project ID:', projectId);

    // Generate a unique file ID
    const fileId = crypto.randomUUID();
    const fileExtension = fileName.split('.').pop() || '';

    // Sanitize collection name for file path (remove special characters, replace spaces with underscores)
    const sanitizedCollectionName = collectionName
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    // Use project ID as the first part of the path to match storage policies
    const filePath = `${projectId}/${sanitizedCollectionName}/${fileId}.${fileExtension}`;

    console.log('Upload API: Generated file path:', filePath);

    // Try to create signed upload URL for the project-files bucket first
    console.log('Upload API: Trying project-files bucket first...');
    console.log('Upload API: File path for project-files:', filePath);
    let { data, error } = await supabase.storage.from('project-files').createSignedUploadUrl(filePath);

    // If project-files bucket fails, fallback to avatars bucket
    if (error) {
      console.log('Upload API: project-files bucket failed, trying avatars bucket...');
      console.error('Upload API: Error with project-files:', error.message);
      console.error('Upload API: Error details:', error);

      // Try with avatars bucket as fallback
      const fallbackPath = `uploads/${projectId}/${sanitizedCollectionName}/${fileId}.${fileExtension}`;
      console.log('Upload API: Fallback path for avatars:', fallbackPath);
      const fallbackResult = await supabase.storage.from('avatars').createSignedUploadUrl(fallbackPath);

      if (fallbackResult.error) {
        console.error('Upload API: Both buckets failed:', fallbackResult.error.message);
        console.error('Upload API: Fallback error details:', fallbackResult.error);
        return createCorsResponse(
          {
            error: 'Failed to generate upload URL',
            details: 'Storage buckets not properly configured. Please check your Supabase storage setup.',
          },
          500,
        );
      }

      data = fallbackResult.data;
      console.log('Upload API: Using avatars bucket as fallback');
    } else {
      console.log('Upload API: project-files bucket worked successfully');
    }

    console.log('Upload API: Signed upload URL created successfully');

    // Get the collection ID from the collection name
    const { data: collectionData, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('title', collectionName)
      .eq('project_id', projectId)
      .eq('deleted', false)
      .single();

    if (collectionError || !collectionData) {
      console.log('Upload API: Collection not found:', collectionError);
      // Continue without collection_id for now
    }

    // Determine file type based on MIME type
    let fileTypeEnum = 'image' as 'image' | 'video' | 'animation' | 'design';
    if (fileType?.startsWith('video/')) {
      fileTypeEnum = 'video';
    } else if (fileType?.startsWith('image/')) {
      fileTypeEnum = 'image';
    } else if (fileType?.includes('gif') || fileType?.includes('webp')) {
      fileTypeEnum = 'animation';
    } else {
      fileTypeEnum = 'design'; // Default for other file types
    }

    // Map unsupported MIME types to supported ones for Supabase storage
    let mappedMimeType = fileType;
    if (fileType === 'video/quicktime' || fileType === 'video/x-msvideo') {
      // Map QuickTime and AVI to MP4 for better compatibility
      mappedMimeType = 'video/mp4';
    }

    // Create a file record in the database
    const { error: dbError } = await supabase.from('files').insert([
      {
        id: fileId,
        title: fileName,
        description: `Uploaded to ${collectionName}`,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize || 0,
        mime_type: mappedMimeType || 'unknown',
        type: fileTypeEnum,
        orientation: 'landscape', // Default orientation
        preview_url: filePath, // Store just the path, will be converted to signed URL when needed
        thumbnail_url: filePath, // Store just the path, will be converted to signed URL when needed
        collection_id: collectionData?.id || null,
        owner_id: userId,
        deleted: false,
      },
    ]);

    if (dbError) {
      console.error('Upload API: Error creating file record:', dbError);
      return createCorsResponse({ error: 'Failed to create file record', details: dbError.message }, 500);
    }

    console.log('Upload API: File record created successfully');

    if (!data) {
      console.error('Upload API: No data returned from signed URL creation');
      return createCorsResponse({ error: 'Failed to generate upload URL', details: 'No data returned' }, 500);
    }

    return createCorsResponse(
      {
        message: 'Upload URL created successfully',
        uploadUrl: data.signedUrl,
        fileId: fileId,
        path: filePath,
      },
      201,
    );
  } catch (error) {
    console.error('Upload API: Unexpected error:', error);
    return createCorsResponse(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
}
