import { redirect } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/server';
import UsernameSetup from '@/components/UsernameSetup';

export default async function UsernameSetupPage() {
  const supabase = await createClientSupabase();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('Error getting user in username setup page:', authError);
    redirect('/login');
  }

  if (!user) {
    redirect('/login');
  }

  // Check if user already has a username
  try {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile in username setup page:', profileError);
      // If there's an error fetching the profile, continue to username setup
    } else if (profile?.username) {
      // If user already has a username, redirect to onboarding
      redirect('/onboarding');
    }
  } catch (error) {
    console.error('Error in profile check in username setup page:', error);
    // If there's an error, continue to username setup
  }

  return <UsernameSetup />;
}
