import { NextRequest, NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    console.log('=== File API: Starting request ===');
    console.log('File API: Params:', params);
    console.log('File API: FileId:', params.fileId);
    console.log('File API: Request URL:', request.url);

    const { fileId } = params;

    // Validate fileId format (should be a UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(fileId)) {
      console.error('File API: Invalid UUID format:', fileId);
      return NextResponse.json({ error: 'Invalid file ID format', fileId }, { status: 400 });
    }

    // Get user ID from the headers set by the middleware
    const userId = request.headers.get('x-user-id');
    console.log('File API: User ID from headers:', userId);
    
    if (!userId) {
      console.error('File API: User not authenticated');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    const supabase = await createClientSupabase();

    // Simple query first - just get basic file info
    const { data: basicFile, error: basicError } = await supabase
      .from('files')
      .select('id, title, description, type, preview_url, file_path, orientation, mime_type, created_at')
      .eq('id', fileId)
      .eq('deleted', false)
      .single();

    console.log('File API: Basic file query result:', { basicFile, basicError });

    if (basicError) {
      console.error('File API: Database error:', basicError);
      return NextResponse.json(
        {
          error: 'Database error',
          details: basicError.message,
          code: basicError.code,
        },
        { status: 500 },
      );
    }

    if (!basicFile) {
      console.log('File API: File not found');
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Generate signed URL for the file image
    let imageUrl = '/placeholder.svg'; // Default fallback

    if (basicFile.preview_url || basicFile.file_path) {
      const filePath = basicFile.preview_url || basicFile.file_path;

      // Try project-files bucket first
      try {
        const { data: signedUrlData } = await supabase.storage.from('project-files').createSignedUrl(filePath, 3600); // 1 hour expiry

        if (signedUrlData?.signedUrl) {
          imageUrl = signedUrlData.signedUrl;
          console.log('File API: Generated signed URL from project-files bucket');
        }
      } catch (error) {
        console.log('File API: project-files bucket failed, trying avatars bucket...');

        // Try avatars bucket as fallback
        try {
          const { data: signedUrlData } = await supabase.storage.from('avatars').createSignedUrl(filePath, 3600); // 1 hour expiry

          if (signedUrlData?.signedUrl) {
            imageUrl = signedUrlData.signedUrl;
            console.log('File API: Generated signed URL from avatars bucket');
          }
        } catch (fallbackError) {
          console.error('File API: Both buckets failed for file:', basicFile.id, fallbackError);
          // Keep the fallback URL
        }
      }
    }

    // Create simple file detail response
    const fileDetail = {
      id: basicFile.id,
      title: basicFile.title || `File ${basicFile.id}`,
      description: basicFile.description || 'No description available',
      image: imageUrl,
      orientation: basicFile.orientation || 'landscape',
      mime_type: basicFile.mime_type,
      author: {
        name: 'You',
        avatar: '/placeholder-user.jpg',
        username: '@you',
      },
      stats: {
        likes: Math.floor(Math.random() * 50) + 10,
        comments: Math.floor(Math.random() * 20) + 1,
        views: Math.floor(Math.random() * 200) + 50,
      },
      tags: ['file', basicFile.type || 'media', 'creative'],
      type: basicFile.type || 'image',
      category: 'File',
      createdAt: new Date(basicFile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      collection: 'Collection',
      project: 'Project',
    };

    console.log('File API: Returning file detail:', fileDetail);
    return NextResponse.json(fileDetail);
  } catch (error) {
    console.error('File API: Unexpected error:', error);
    console.error('File API: Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
