import { NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClientSupabase();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
          details: authError?.message,
        },
        { status: 401 },
      );
    }

    console.log('=== STORAGE POLICIES DEBUG ===');
    console.log('User ID:', user.id);

    // Check if buckets exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    console.log('Available buckets:', buckets?.map((b) => b.name) || []);
    console.log('Buckets error:', bucketsError);

    // Try to list files in project-files bucket
    const { data: projectFiles, error: projectFilesError } = await supabase.storage
      .from('project-files')
      .list('', { limit: 1 });

    console.log('Project-files list result:', projectFiles);
    console.log('Project-files list error:', projectFilesError);

    // Try to list files in avatars bucket
    const { data: avatarsFiles, error: avatarsError } = await supabase.storage.from('avatars').list('', { limit: 1 });

    console.log('Avatars list result:', avatarsFiles);
    console.log('Avatars list error:', avatarsError);

    // Try to get a signed URL for a test file
    const testPath = `${user.id}/test-file.txt`;

    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from('project-files')
      .createSignedUploadUrl(testPath);

    console.log('Signed URL result:', signedUrl);
    console.log('Signed URL error:', signedUrlError);

    // Check current policies via SQL
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_schema', 'storage')
      .eq('table_name', 'objects');

    console.log('Current policies:', policies);
    console.log('Policies error:', policiesError);

    // Try a direct SQL query to check policies
    const { data: policyCheck, error: policyCheckError } = await supabase.rpc('exec_sql', {
      sql_query: `
          SELECT 
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'objects' AND schemaname = 'storage'
          ORDER BY policyname;
        `,
    });

    console.log('Policy check result:', policyCheck);
    console.log('Policy check error:', policyCheckError);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      buckets: {
        available: buckets?.map((b) => b.name) || [],
        error: bucketsError?.message,
      },
      projectFiles: {
        canList: !projectFilesError,
        error: projectFilesError?.message,
        files: projectFiles?.length || 0,
      },
      avatars: {
        canList: !avatarsError,
        error: avatarsError?.message,
        files: avatarsFiles?.length || 0,
      },
      signedUrl: {
        canCreate: !signedUrlError,
        error: signedUrlError?.message,
        url: signedUrl?.signedUrl ? 'Generated successfully' : null,
      },
      policies: {
        count: policies?.length || 0,
        error: policiesError?.message,
        details: policies || [],
      },
      policyCheck: {
        result: policyCheck,
        error: policyCheckError?.message,
      },
    });
  } catch (error) {
    console.error('Storage policies debug error:', error);
    return NextResponse.json(
      {
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
