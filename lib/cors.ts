import { NextResponse } from 'next/server'

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

// Helper function to create responses with CORS headers
export function createCorsResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  })
}

// Handle preflight OPTIONS requests
export function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
}

// For more restrictive CORS (optional)
export function createRestrictiveCorsResponse(data: any, status: number = 200, allowedOrigins: string[] = []) {
  const restrictiveHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.length > 0 ? allowedOrigins.join(', ') : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }

  return NextResponse.json(data, {
    status,
    headers: restrictiveHeaders,
  })
}
