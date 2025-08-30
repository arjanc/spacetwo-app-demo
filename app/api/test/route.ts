import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Test API: Simple test endpoint called');
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test API: Error:', error);
    return NextResponse.json(
      {
        error: 'Test endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
