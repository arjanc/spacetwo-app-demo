export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';

// Define the expected project structure from the modal
interface ProjectModalData {
  name: string;
  type: 'icon' | 'text';
  icon?: string;
  label?: string;
  bg: string;
  color: string;
  projectCount?: number;
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

// GET /api/projects - Get all projects or a single project by ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('id');

  try {
    // Get user ID from the headers set by the middleware
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      console.error('User not authenticated');
      return createCorsResponse({ error: 'User not authenticated' }, 401);
    }
    
    const supabase = await createClientSupabase();
    console.log('User authenticated:', userId);

    if (projectId) {
      // Get specific project owned by the user
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('owner_id', userId)
        .eq('deleted', false)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createCorsResponse({ error: 'Project not found' }, 404);
        }
        throw error;
      }
      return createCorsResponse(project);
    }

    // Debug: Log the user ID to check authentication
    console.log('Authenticated user ID:', userId);

    // Get all projects owned by the user
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    console.log('Query result - projects:', projects);
    console.log('Query result - error:', error);

    if (error) {
      console.error('Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        user_id: userId,
        table: 'projects',
      });

      // Return more specific error information
      return createCorsResponse(
        {
          error: 'Database query failed',
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        500,
      );
    }

    return createCorsResponse(projects);
  } catch (error) {
    console.error('Error in GET /api/projects:', error);

    // Provide more specific error information
    if (error instanceof Error) {
      return createCorsResponse(
        {
          error: 'Failed to fetch projects',
          details: error.message,
          type: error.constructor.name,
        },
        500,
      );
    }

    return createCorsResponse(
      {
        error: 'Failed to fetch projects',
        details: 'Unknown error occurred',
      },
      500,
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const body: ProjectModalData = await request.json();

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return createCorsResponse({ error: 'Project name is required' }, 400);
    }

    if (!body.type || (body.type !== 'icon' && body.type !== 'text')) {
      return createCorsResponse({ error: 'Project type must be either "icon" or "text"' }, 400);
    }

    if (!body.bg || !body.color) {
      return createCorsResponse({ error: 'Background and text colors are required' }, 400);
    }

    // Validate type-specific requirements
    if (body.type === 'icon' && !body.icon) {
      return createCorsResponse({ error: 'Icon is required for icon-type projects' }, 400);
    }

    if (body.type === 'text' && !body.label?.trim()) {
      return createCorsResponse({ error: 'Label is required for text-type projects' }, 400);
    }

    // Validate label length
    if (body.type === 'text' && body.label && body.label.trim().length > 4) {
      return createCorsResponse({ error: 'Project label cannot exceed 4 characters' }, 400);
    }

    // Get user ID from the headers set by the middleware
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return createCorsResponse({ error: 'User not authenticated' }, 401);
    }
    
    const supabase = await createClientSupabase();
    
    console.log('Creating project for user:', userId);

    // Ensure user record exists in users table before creating project
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userCheckError && userCheckError.code === 'PGRST116') {
      // User doesn't exist in users table, create them
      console.log('User not found in users table, creating user record...');
      
      // Since we don't have the full user object, we'll create a minimal user record
      const { error: createUserError } = await supabase.from('users').insert({
        id: userId,
        email: '',
        name: 'User',
        username: `user_${Math.random().toString(36).substring(2, 10)}`,
        avatar: null,
        role: 'viewer',
        is_online: true,
        last_seen: new Date().toISOString(),
        deleted: false,
      });

      if (createUserError) {
        console.error('Error creating user record:', createUserError);
        return createCorsResponse(
          {
            error: 'Failed to create user record',
            details: createUserError.message,
            code: createUserError.code,
          },
          500,
        );
      }

      console.log('User record created successfully');
    } else if (userCheckError) {
      console.error('Error checking user existence:', userCheckError);
      return createCorsResponse(
        {
          error: 'Failed to verify user',
          details: userCheckError.message,
          code: userCheckError.code,
        },
        500,
      );
    } else {
      console.log('User record already exists');
    }

    // Prepare the data for database insertion
    const projectData = {
      name: body.name.trim(),
      type: body.type,
      icon: body.type === 'icon' ? body.icon : null,
      label: body.type === 'text' ? body.label?.trim() || null : null,
      bg: body.bg,
      color: body.color,
      owner_id: userId,
      deleted: false,
    };

    console.log('Creating project with data:', projectData);

    const { data, error } = await supabase.from('projects').insert(projectData).select().single();

    if (error) {
      console.error('Supabase error:', error);
      // Return more specific error information
      return createCorsResponse(
        {
          error: 'Database error occurred',
          details: error.message,
          code: error.code,
        },
        500,
      );
    }

    console.log('Project created successfully:', data);

    return createCorsResponse(
      {
        message: 'Project created successfully',
        data,
      },
      201,
    );
  } catch (error) {
    console.error('Error in POST /api/projects:', error);

    // Handle specific Supabase errors
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case '23505': // Unique constraint violation
          return createCorsResponse({ error: 'A project with this name already exists' }, 409);
        case '23502': // Not null constraint violation
          return createCorsResponse({ error: 'Missing required fields' }, 400);
        case '23503': // Foreign key constraint violation
          return createCorsResponse({ error: 'User not found in database' }, 400);
        default:
          return createCorsResponse({ error: 'Database error occurred' }, 500);
      }
    }

    return createCorsResponse({ error: 'Failed to create project' }, 500);
  }
}

// PUT /api/projects - Update an existing project
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return createCorsResponse({ error: 'Project ID is required for update' }, 400);
    }

    // Validate fields if they're being updated
    if (body.name !== undefined && (!body.name || !body.name.trim())) {
      return createCorsResponse({ error: 'Project name cannot be empty' }, 400);
    }

    if (body.type !== undefined && body.type !== 'icon' && body.type !== 'text') {
      return createCorsResponse({ error: 'Project type must be either "icon" or "text"' }, 400);
    }

    // Validate type-specific requirements when type is being updated
    if (body.type !== undefined) {
      if (body.type === 'icon' && !body.icon) {
        return createCorsResponse({ error: 'Icon is required for icon-type projects' }, 400);
      }

      if (body.type === 'text' && !body.label?.trim()) {
        return createCorsResponse({ error: 'Label is required for text-type projects' }, 400);
      }
    }

    // Validate label length
    if (body.label !== undefined && body.label && body.label.trim().length > 4) {
      return createCorsResponse({ error: 'Project label cannot exceed 4 characters' }, 400);
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return createCorsResponse({ error: 'Authentication token required' }, 401);
    }

    const supabase = await createClientSupabase();

    // Verify the token to get the user info
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return createCorsResponse(
        {
          error: 'Invalid authentication token',
          details: authError?.message,
        },
        401,
      );
    }

    // Prepare update data
    const updateData = { ...body };
    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }
    if (updateData.label) {
      updateData.label = updateData.label.trim();
    }

    // Only allow updating projects owned by the user
    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', body.id)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createCorsResponse({ error: 'Project not found' }, 404);
      }
      throw error;
    }

    return createCorsResponse({
      message: 'Project updated successfully',
      data,
    });
  } catch (error) {
    console.error('Error in PUT /api/projects:', error);
    return createCorsResponse({ error: 'Failed to update project' }, 500);
  }
}

// DELETE /api/projects - Delete a project
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return createCorsResponse({ error: 'Project ID is required' }, 400);
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return createCorsResponse({ error: 'Authentication token required' }, 401);
    }

    const supabase = await createClientSupabase();

    // Verify the token to get the user info
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return createCorsResponse(
        {
          error: 'Invalid authentication token',
          details: authError?.message,
        },
        401,
      );
    }

    // Only allow deleting projects owned by the user
    const { error } = await supabase
      .from('projects')
      .update({ deleted: true })
      .eq('id', projectId)
      .eq('owner_id', user.id);

    if (error) {
      if (error.code === 'PGRST116') {
        return createCorsResponse({ error: 'Project not found' }, 404);
      }
      throw error;
    }

    return createCorsResponse({ message: 'Project deleted successfully' }, 200);
  } catch (error) {
    console.error('Error in DELETE /api/projects:', error);
    return createCorsResponse({ error: 'Failed to delete project' }, 500);
  }
}
