import { NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';

// Define the expected collection structure from the frontend
interface CollectionCreateData {
  title: string;
  description?: string;
  project_id: string;
  is_live?: boolean;
}

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

// GET /api/collections - Get collections by project ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const collectionId = searchParams.get('id');

  try {
    // Get user ID from the headers set by the middleware
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return createCorsResponse({ error: 'User not authenticated' }, 401);
    }
    
    const supabase = await createClientSupabase();

    if (collectionId) {
      // Get specific collection
      const { data: collection, error } = await supabase
        .from('collections')
        .select(
          `
          *,
          project:projects(id, name, created_at, updated_at, owner_id),
          files(id, title, file_path, preview_url, thumbnail_url, type, orientation, mime_type, created_at)
        `,
      )
      .eq('id', collectionId)
      .eq('project.owner_id', userId)
      .eq('deleted', false)
      .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createCorsResponse({ error: 'Collection not found' }, 404);
        }
        throw error;
      }

      return createCorsResponse(collection);
    }

    if (!projectId) {
      return createCorsResponse({ error: 'Project ID is required' }, 400);
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .eq('owner_id', userId)
      .eq('deleted', false)
      .single();

    if (projectError || !project) {
      return createCorsResponse({ error: 'Project not found or access denied' }, 404);
    }

    // Get all collections for the project
    const { data: collections, error } = await supabase
      .from('collections')
      .select(
        `
        *,
        files(id, title, file_path, preview_url, thumbnail_url, type, orientation, mime_type, created_at)
      `,
      )
      .eq('project_id', projectId)
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('Collections API: Raw collections from database:', JSON.stringify(collections, null, 2));

    // Transform collections to match frontend expectations
    const transformedCollections = await Promise.all(
      collections.map(async (collection: any) => {
        // Transform files with signed URLs
        const transformedFiles = await Promise.all(
          (collection.files || []).map(async (file: any) => {
            // Generate signed URL for the file image
            let imageUrl = '/placeholder.svg'; // Default fallback

            // For video files, prefer thumbnail_url if available
            let filePath = file.preview_url || file.thumbnail_url || file.file_path;

            // If it's a video and we have a thumbnail, use that for preview
            // For now, we'll use the video URL directly since thumbnails aren't generated yet
            if (file.type === 'video' && file.thumbnail_url && file.thumbnail_url !== file.file_path) {
              filePath = file.thumbnail_url;
            }

            if (filePath) {
              try {
                const { data: signedUrlData } = await supabase.storage
                  .from('project-files')
                  .createSignedUrl(filePath, 3600); // 1 hour expiry

                if (signedUrlData?.signedUrl) {
                  imageUrl = signedUrlData.signedUrl;
                }
              } catch (error) {
                console.error('Error generating signed URL for file:', file.id, error);
                // Keep the fallback URL
              }
            }

            return {
              id: file.id,
              title: file.title || `File ${file.id}`,
              image: imageUrl,
              type: file.type, // Preserve the actual file type from database
              orientation: file.orientation,
              mime_type: file.mime_type,
            };
          }),
        );

        return {
          id: collection.id,
          title: collection.title,
          description: collection.description,
          fileCount: transformedFiles.length,
          lastUpdated: formatLastUpdated(collection.updated_at),
          isLive: collection.is_live,
          files: transformedFiles,
        };
      }),
    );

    console.log('Collections API: Transformed collections:', JSON.stringify(transformedCollections, null, 2));

    return createCorsResponse(transformedCollections);
  } catch (error) {
    console.error('Error in GET /api/collections:', error);
    return createCorsResponse({ error: 'Failed to fetch collections' }, 500);
  }
}

// POST /api/collections - Create a new collection
export async function POST(request: Request) {
  try {
    const body: CollectionCreateData = await request.json();

    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return createCorsResponse({ error: 'Collection title is required' }, 400);
    }

    if (!body.project_id) {
      return createCorsResponse({ error: 'Project ID is required' }, 400);
    }

    // Get user ID from the headers set by the middleware
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return createCorsResponse({ error: 'User not authenticated' }, 401);
    }
    
    const supabase = await createClientSupabase();

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', body.project_id)
      .eq('owner_id', userId)
      .eq('deleted', false)
      .single();

    if (projectError || !project) {
      return createCorsResponse({ error: 'Project not found or access denied' }, 404);
    }

    // Prepare the data for database insertion
    const collectionData = {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      project_id: body.project_id,
      space_id: null, // We'll set this to null for now, as spaces are optional
      owner_id: userId,
      is_live: body.is_live || false,
      deleted: false,
    };

    console.log('Attempting to insert collection data:', collectionData);

    const { data, error } = await supabase.from('collections').insert(collectionData).select().single();

    console.log('Database response - data:', data);
    console.log('Database response - error:', error);

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return createCorsResponse(
        {
          error: 'Database error occurred',
          details: error.message,
          hint: error.hint,
          code: error.code,
        },
        500,
      );
    }

    // Transform the response to match frontend expectations
    const transformedCollection = {
      id: data.id,
      title: data.title,
      description: data.description,
      fileCount: 0,
      lastUpdated: 'Just now',
      isLive: data.is_live,
      files: [],
    };

    return createCorsResponse(
      {
        message: 'Collection created successfully',
        data: transformedCollection,
      },
      201,
    );
  } catch (error) {
    console.error('Error in POST /api/collections:', error);

    // Handle specific Supabase errors
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case '23505': // Unique constraint violation
          return createCorsResponse({ error: 'A collection with this title already exists in this project' }, 409);
        case '23502': // Not null constraint violation
          return createCorsResponse({ error: 'Missing required fields' }, 400);
        default:
          return createCorsResponse({ error: 'Database error occurred' }, 500);
      }
    }

    return createCorsResponse({ error: 'Failed to create collection' }, 500);
  }
}

// Helper function to format last updated time
function formatLastUpdated(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}
