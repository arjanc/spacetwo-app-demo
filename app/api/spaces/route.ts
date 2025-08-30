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

// GET /api/spaces - Get all spaces or a single space by ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const spaceId = searchParams.get('id')

  try {
    const supabase = await createClientSupabase()

    if (spaceId) {
      const { data: space, error } = await supabase.from('spaces').select('*').eq('id', spaceId).single()

      if (error) throw error
      return createCorsResponse(space)
    }

    const { data: spaces, error } = await supabase.from('spaces').select('*')

    if (error) throw error
    return createCorsResponse(spaces)
  } catch (error) {
    return createCorsResponse({ error: 'Failed to fetch spaces' }, 500)
  }
}

// POST /api/spaces - Create a new space
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClientSupabase()

    const { data, error } = await supabase.from('spaces').insert(body).select().single()

    if (error) throw error

    return createCorsResponse(
      {
        message: 'Space created successfully',
        data,
      },
      201
    )
  } catch (error) {
    console.error('Error in POST /api/spaces:', error)
    return createCorsResponse({ error: 'Failed to create space' }, 500)
  }
}

// PUT /api/spaces - Update an existing space
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClientSupabase()

    if (!body.id) {
      return createCorsResponse({ error: 'Space ID is required for update' }, 400)
    }

    const { data, error } = await supabase.from('spaces').update(body).eq('id', body.id).select().single()

    if (error) throw error

    return createCorsResponse({
      message: 'Space updated successfully',
      data,
    })
  } catch (error) {
    console.error('Error in PUT /api/spaces:', error)
    return createCorsResponse({ error: 'Failed to update space' }, 500)
  }
}

// DELETE /api/spaces - Delete a space
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('id')

    if (!spaceId) {
      return createCorsResponse({ error: 'Space ID is required' }, 400)
    }

    const supabase = await createClientSupabase()
    const { error } = await supabase.from('spaces').update({ deleted: true }).eq('id', spaceId)

    if (error) throw error

    return createCorsResponse({ message: 'Space deleted successfully' }, 200)
  } catch (error) {
    console.error('Error in DELETE /api/spaces:', error)
    return createCorsResponse({ error: 'Failed to delete space' }, 500)
  }
}
