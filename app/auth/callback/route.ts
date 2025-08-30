import { NextRequest, NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/';

  if (code) {
    try {
      const supabase = await createClientSupabase();

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`);
      }

      // Check if this is a new user (first time sign in)
      if (
        data.user?.identities?.some(
          (identity) => identity.provider === 'google' && identity.identity_data?.email_verified,
        )
      ) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('created_at')
          .eq('id', data.user.id)
          .single();

        // If no profile exists or it was just created (within the last 5 seconds)
        if (!profile || (profile.created_at && new Date(profile.created_at).getTime() > Date.now() - 5000)) {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
        }
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`);
    }
  }

  // Redirect to the original URL or home page
  return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
}
