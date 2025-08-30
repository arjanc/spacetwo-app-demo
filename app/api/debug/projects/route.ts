import { NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
    };

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          error: 'No token provided',
          envCheck,
        },
        { status: 401 },
      );
    }

    const supabase = await createClientSupabase();

    // Verify the token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      return NextResponse.json(
        {
          error: 'Auth error',
          details: authError.message,
          envCheck,
        },
        { status: 401 },
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error: 'No user found',
          envCheck,
        },
        { status: 401 },
      );
    }

    // Test database connection
    const { data: projects, error: dbError } = await supabase
      .from('projects')
      .select('count')
      .eq('owner_id', user.id)
      .eq('deleted', false);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      envCheck,
      dbTest: {
        hasError: !!dbError,
        error: dbError?.message,
        projectCount: projects?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
