import { NextRequest, NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug Files API: Starting...');

    const supabase = await createClientSupabase();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Debug Files API: Authentication error:', userError);
      return NextResponse.json({ error: 'Unauthorized', userError }, { status: 401 });
    }

    console.log('Debug Files API: User ID:', user.id);

    // Get all files for this user
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select(
        `
        id,
        title,
        type,
        orientation,
        owner_id,
        collection_id,
        collection:collections (
          id,
          title,
          project:projects (
            id,
            name,
            owner_id
          )
        )
      `,
      )
      .eq('deleted', false)
      .eq('owner_id', user.id);

    console.log('Debug Files API: Files query result:', { files, filesError });

    if (filesError) {
      return NextResponse.json(
        {
          error: 'Database error',
          details: filesError,
          user_id: user.id,
        },
        { status: 500 },
      );
    }

    // Get all collections for this user
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, title, project_id, owner_id')
      .eq('deleted', false)
      .eq('owner_id', user.id);

    console.log('Debug Files API: Collections query result:', { collections, collectionsError });

    return NextResponse.json({
      user_id: user.id,
      files: files || [],
      collections: collections || [],
      files_count: files?.length || 0,
      collections_count: collections?.length || 0,
    });
  } catch (error) {
    console.error('Debug Files API: Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
