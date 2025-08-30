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

// Debug upload endpoint
export async function POST(request: Request) {
  try {
    console.log('=== DEBUG UPLOAD API START ===');

    // Get authorization header for user authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('DEBUG: No authorization token provided');
      return createCorsResponse({ error: 'Authentication token required' }, 401);
    }

    const supabase = await createClientSupabase();

    // Verify the token to get the user info
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log('DEBUG: Authentication failed:', authError);
      return createCorsResponse({ error: 'Invalid authentication token' }, 401);
    }

    console.log('DEBUG: User authenticated:', user.id);

    const body = await request.json();
    const { fileName, fileType, fileSize, projectName, collectionName } = body;

    console.log('DEBUG: Request body:', { fileName, fileType, fileSize, projectName, collectionName });

    if (!fileName || !projectName || !collectionName) {
      console.log('DEBUG: Missing required fields');
      return createCorsResponse({ error: 'Missing required fields: fileName, projectName, collectionName' }, 400);
    }

    // Step 1: Check if storage buckets exist
    console.log('DEBUG: Checking storage buckets...');

    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

      if (bucketsError) {
        console.error('DEBUG: Error listing buckets:', bucketsError);
        return createCorsResponse(
          {
            error: 'Failed to list storage buckets',
            details: bucketsError.message,
            code: bucketsError.code,
          },
          500,
        );
      }

      console.log(
        'DEBUG: Available buckets:',
        buckets?.map((b) => ({ id: b.id, name: b.name, public: b.public })),
      );

      const projectFilesBucket = buckets?.find((b) => b.id === 'project-files');
      const avatarsBucket = buckets?.find((b) => b.id === 'avatars');

      console.log('DEBUG: project-files bucket exists:', !!projectFilesBucket);
      console.log('DEBUG: avatars bucket exists:', !!avatarsBucket);

      if (!projectFilesBucket && !avatarsBucket) {
        return createCorsResponse(
          {
            error: 'No storage buckets found',
            details: 'Neither project-files nor avatars buckets exist. Please run the storage setup script.',
            availableBuckets: buckets?.map((b) => b.id) || [],
          },
          500,
        );
      }
    } catch (bucketCheckError) {
      console.error('DEBUG: Error checking buckets:', bucketCheckError);
      return createCorsResponse(
        {
          error: 'Failed to check storage buckets',
          details: bucketCheckError instanceof Error ? bucketCheckError.message : 'Unknown error',
        },
        500,
      );
    }

    // Step 2: Find project
    console.log('DEBUG: Finding project...');

    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('owner_id', user.id)
      .eq('deleted', false);

    if (ownedError) {
      console.error('DEBUG: Error fetching owned projects:', ownedError);
      return createCorsResponse({ error: 'Error fetching projects', details: ownedError.message }, 500);
    }

    console.log('DEBUG: Owned projects:', ownedProjects);

    const project = ownedProjects?.find((p) => p.name === projectName);

    if (!project) {
      console.log('DEBUG: Project not found:', projectName);
      return createCorsResponse(
        { error: 'Project not found', details: `Project "${projectName}" not found or access denied` },
        404,
      );
    }

    console.log('DEBUG: Found project:', project);

    // Step 3: Test storage access
    const projectId = project.id;
    const fileId = crypto.randomUUID();
    const fileExtension = fileName.split('.').pop() || '';
    const sanitizedCollectionName = collectionName
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const filePath = `${projectId}/${sanitizedCollectionName}/${fileId}.${fileExtension}`;

    console.log('DEBUG: Generated file path:', filePath);
    console.log('DEBUG: User ID for policy check:', user.id);
    console.log('DEBUG: Project ID for policy check:', projectId);

    // Test project-files bucket
    console.log('DEBUG: Testing project-files bucket...');
    let { data: projectFilesData, error: projectFilesError } = await supabase.storage
      .from('project-files')
      .createSignedUploadUrl(filePath);

    if (projectFilesError) {
      console.error('DEBUG: project-files bucket error:', {
        message: projectFilesError.message,
        code: projectFilesError.code,
        details: projectFilesError.details,
        hint: projectFilesError.hint,
      });
    } else {
      console.log('DEBUG: project-files bucket success!');
    }

    // Test avatars bucket
    console.log('DEBUG: Testing avatars bucket...');
    const fallbackPath = `uploads/${projectId}/${sanitizedCollectionName}/${fileId}.${fileExtension}`;
    let { data: avatarsData, error: avatarsError } = await supabase.storage
      .from('avatars')
      .createSignedUploadUrl(fallbackPath);

    if (avatarsError) {
      console.error('DEBUG: avatars bucket error:', {
        message: avatarsError.message,
        code: avatarsError.code,
        details: avatarsError.details,
        hint: avatarsError.hint,
      });
    } else {
      console.log('DEBUG: avatars bucket success!');
    }

    // Return detailed debug information
    return createCorsResponse({
      debug: {
        user: {
          id: user.id,
          email: user.email,
        },
        project: {
          id: project.id,
          name: project.name,
        },
        filePath,
        fallbackPath,
        projectFilesBucket: {
          success: !projectFilesError,
          error: projectFilesError
            ? {
                message: projectFilesError.message,
                code: projectFilesError.code,
                details: projectFilesError.details,
                hint: projectFilesError.hint,
              }
            : null,
        },
        avatarsBucket: {
          success: !avatarsError,
          error: avatarsError
            ? {
                message: avatarsError.message,
                code: avatarsError.code,
                details: avatarsError.details,
                hint: avatarsError.hint,
              }
            : null,
        },
        policyCheck: {
          userOwnsProject: user.id === projectId,
          filePathFirstPart: filePath.split('/')[0],
          projectId: projectId,
        },
      },
    });
  } catch (error) {
    console.error('DEBUG: Unexpected error:', error);
    return createCorsResponse(
      {
        error: 'Unexpected error in debug endpoint',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      500,
    );
  }
}
