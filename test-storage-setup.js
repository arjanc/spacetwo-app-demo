// Test Storage Setup
// Run this in your browser console to check if storage buckets are properly configured

async function testStorageSetup() {
  console.log('🔍 Testing Supabase Storage Setup...');

  try {
    // Get the Supabase client
    const { supabase } = await import('/lib/supabase.js');

    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return;
    }

    if (!session) {
      console.error('❌ No session found. Please log in first.');
      return;
    }

    console.log('✅ User authenticated:', session.user.email);

    // List all storage buckets
    console.log('📦 Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }

    console.log('📋 Available buckets:', buckets);

    // Check for required buckets
    const projectFilesBucket = buckets.find((b) => b.id === 'project-files');
    const avatarsBucket = buckets.find((b) => b.id === 'avatars');

    console.log('🔍 project-files bucket:', projectFilesBucket ? '✅ Found' : '❌ Missing');
    console.log('🔍 avatars bucket:', avatarsBucket ? '✅ Found' : '❌ Missing');

    if (!projectFilesBucket && !avatarsBucket) {
      console.error('❌ No required buckets found!');
      console.log('💡 Run the QUICK_STORAGE_FIX.sql script in your Supabase dashboard.');
      return;
    }

    // Test creating a signed URL (this will test policies)
    console.log('🧪 Testing storage policies...');

    const testPath = `${session.user.id}/test/test-file.jpg`;

    if (projectFilesBucket) {
      console.log('🧪 Testing project-files bucket...');
      const { data: projectFilesData, error: projectFilesError } = await supabase.storage
        .from('project-files')
        .createSignedUploadUrl(testPath);

      if (projectFilesError) {
        console.error('❌ project-files bucket error:', projectFilesError);
      } else {
        console.log('✅ project-files bucket working!');
      }
    }

    if (avatarsBucket) {
      console.log('🧪 Testing avatars bucket...');
      const { data: avatarsData, error: avatarsError } = await supabase.storage
        .from('avatars')
        .createSignedUploadUrl(`uploads/${session.user.id}/test-file.jpg`);

      if (avatarsError) {
        console.error('❌ avatars bucket error:', avatarsError);
      } else {
        console.log('✅ avatars bucket working!');
      }
    }

    // Check user's projects
    console.log('📁 Checking user projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('owner_id', session.user.id)
      .eq('deleted', false);

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
    } else {
      console.log('📁 User projects:', projects);
    }

    console.log('🎉 Storage setup test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStorageSetup();
