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

export async function POST(request: Request) {
  const supabase = createClientSupabase()

  const { data, error } = await supabase
    .from('spaces')
    .insert({ title: 'Just to keep Supabase alive.' })
    .select()
    .single()

  return createCorsResponse({}, 201)
}
