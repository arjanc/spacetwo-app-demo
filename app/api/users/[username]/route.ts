import { NextResponse } from 'next/server'
import { createClientSupabase } from '@/lib/supabase/server'

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

// Helper function to create responses with CORS headers
function createCorsResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  })
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
}

// GET /api/users/{username} - Get a user by username
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')
    const supabase = await createClientSupabase()

    const { data, error } = await supabase.from('users').select().eq('username', username).maybeSingle()

    if (data === null) {
      return createCorsResponse({ error: 'User not found' }, 404)
    }

    if (error) throw error

    return createCorsResponse(
      {
        data,
      },
      200
    )
  } catch (error) {
    console.error('Error in GET /api/users/{username}:', error)
    return createCorsResponse({ error: 'Failed to fetch the user' }, 500)
  }
}