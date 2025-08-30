import { NextResponse } from 'next/server'
import { createClientSupabase } from '@/lib/supabase/server'

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

// POST /api/users - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClientSupabase()

    const { data, error } = await supabase.from('users').insert(body).select().single()

    if (error) throw error

    return createCorsResponse(
      {
        message: 'User created successfully',
        data,
      },
      201
    )
  } catch (error) {
    console.error('Error in POST /api/users:', error)
    return createCorsResponse({ error: 'Failed to create user' }, 500)
  }
}

// DELETE /api/users - Delete a user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return createCorsResponse({ error: 'User ID is required' }, 400)
    }

    const supabase = await createClientSupabase()
    const { error } = await supabase.from('users').update({ deleted: true }).eq('id', userId)

    if (error) throw error

    return createCorsResponse({ message: 'User deleted successfully' }, 200)
  } catch (error) {
    console.error('Error in DELETE /api/users:', error)
    return createCorsResponse({ error: 'Failed to delete user' }, 500)
  }
}
