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

// POST /api/users/create - Create user
export async function POST(request: Request) {
  try {
    const { email, name, username, avatar } = await request.json();

    if (!email) {
      return createCorsResponse({ error: 'Email is required' }, 400);
    }

    const supabase = await createClientSupabase();

    // Check if user already exists
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();

    if (existingUser) {
      return createCorsResponse({
        message: 'User already exists',
        user: existingUser,
      });
    }

    // Create user record
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: email,
        name: name || email.split('@')[0] || 'User',
        username: username || email.split('@')[0],
        avatar: avatar,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return createCorsResponse(
        {
          error: 'Failed to create user',
          details: userError.message,
          code: userError.code,
        },
        500,
      );
    }

    return createCorsResponse({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error in POST /api/users/create:', error);
    return createCorsResponse(
      {
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
}
