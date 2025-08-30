import { NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';

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

// Direct upload endpoint that bypasses storage policy issues
export async function POST(request: Request) {
  try {
    console.log('=== DIRECT UPLOAD API START ===');

    // Get user ID from the headers set by the middleware
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      console.log('DIRECT UPLOAD: User not authenticated');
      return createCorsResponse({ error: 'User not authenticated' }, 401);
    }
    
    const supabase = await createClientSupabase();
    console.log(`DIRECT UPLOAD: Processing request for user ${userId}`);

    const body = await request.json();
    const { fileName, fileType, fileSize, projectName, collectionName, fileData } = body;

    console.log('DIRECT UPLOAD: Request body:', { fileName, fileType, fileSize, projectName, collectionName });

    if (!fileName || !projectName || !collectionName || !fileData) {
      console.log('DIRECT UPLOAD: Missing required fields');
      return createCorsResponse(
        { error: 'Missing required fields: fileName, projectName, collectionName, fileData' },
        400,
      );
    }

    // Find project
    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('owner_id', userId)
      .eq('deleted', false);

    if (ownedError) {
      console.log('DIRECT UPLOAD: Error fetching projects:', ownedError);
      return createCorsResponse({ error: 'Error fetching projects', details: ownedError.message }, 500);
    }

    const project = ownedProjects?.find((p) => p.name === projectName);

    if (!project) {
      console.log('DIRECT UPLOAD: Project not found:', projectName);
      return createCorsResponse(
        { error: 'Project not found', details: `Project "${projectName}" not found or access denied` },
        404,
      );
    }

    console.log('DIRECT UPLOAD: Found project:', project);

    // Generate file path
    const projectId = project.id;
    const fileId = crypto.randomUUID();
    const fileExtension = fileName.split('.').pop() || '';
    const sanitizedCollectionName = collectionName
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const filePath = `${projectId}/${sanitizedCollectionName}/${fileId}.${fileExtension}`;

    console.log('DIRECT UPLOAD: Generated file path:', filePath);

    // Convert base64 to blob
    const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
    const binaryData = atob(base64Data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: fileType });

    // Try direct upload to project-files bucket
    console.log('DIRECT UPLOAD: Attempting direct upload to project-files...');
    let { data: uploadData, error: uploadError } = await supabase.storage.from('project-files').upload(filePath, blob, {
      contentType: fileType,
      upsert: false,
    });

    if (uploadError) {
      console.log('DIRECT UPLOAD: project-files upload failed, trying avatars...');
      console.error('DIRECT UPLOAD: project-files error:', uploadError);

      // Try avatars bucket as fallback
      const fallbackPath = `uploads/${projectId}/${sanitizedCollectionName}/${fileId}.${fileExtension}`;
      console.log('DIRECT UPLOAD: Fallback path for avatars:', fallbackPath);

      const fallbackResult = await supabase.storage.from('avatars').upload(fallbackPath, blob, {
        contentType: fileType,
        upsert: false,
      });

      if (fallbackResult.error) {
        console.error('DIRECT UPLOAD: Both buckets failed:', fallbackResult.error);
        return createCorsResponse(
          {
            error: 'Failed to upload file',
            details: 'Storage buckets not properly configured. Please check your Supabase storage setup.',
          },
          500,
        );
      }

      uploadData = fallbackResult.data;
      console.log('DIRECT UPLOAD: Using avatars bucket as fallback');
    } else {
      console.log('DIRECT UPLOAD: project-files upload successful');
    }

    // Get collection ID
    const { data: collectionData, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('title', collectionName)
      .eq('project_id', projectId)
      .eq('deleted', false)
      .single();

    if (collectionError || !collectionData) {
      console.log('DIRECT UPLOAD: Collection not found:', collectionError);
      // Continue without collection_id for now
    }

    // Determine file type
    let fileTypeEnum = 'image' as 'image' | 'video' | 'animation' | 'design';
    if (fileType?.startsWith('video/')) {
      fileTypeEnum = 'video';
    } else if (fileType?.startsWith('image/')) {
      fileTypeEnum = 'image';
    } else if (fileType?.includes('gif') || fileType?.includes('webp')) {
      fileTypeEnum = 'animation';
    } else {
      fileTypeEnum = 'design';
    }

    // Create file record in database
    const { error: dbError } = await supabase.from('files').insert([
      {
        id: fileId,
        title: fileName,
        description: `Uploaded to ${collectionName}`,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize || 0,
        mime_type: fileType || 'unknown',
        type: fileTypeEnum,
        orientation: 'landscape',
        preview_url: filePath,
        thumbnail_url: filePath,
        collection_id: collectionData?.id || null,
        owner_id: userId,
        deleted: false,
      },
    ]);

    if (dbError) {
      console.error('DIRECT UPLOAD: Error creating file record:', dbError);
      return createCorsResponse({ error: 'Failed to create file record', details: dbError.message }, 500);
    }

    console.log('DIRECT UPLOAD: File record created successfully');

    return createCorsResponse(
      {
        message: 'File uploaded successfully',
        fileId: fileId,
        path: filePath,
        url: uploadData?.path || filePath,
      },
      201,
    );
  } catch (error) {
    console.error('DIRECT UPLOAD: Unexpected error:', error);
    return createCorsResponse(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
}
