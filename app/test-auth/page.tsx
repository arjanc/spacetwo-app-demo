'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function TestAuthPage() {
  const { user, session, loading } = useAuth();
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [oauthStatus, setOauthStatus] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // Don't render in production
  const isProduction = process.env.NODE_ENV === 'production';

  // Handle SSR issue
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isProduction) {
    return (
      <div className="min-h-screen bg-[#111111] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Test Auth (Development Only)</h1>
          <p className="text-gray-400">This page is only available in development mode.</p>
        </div>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#111111] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setAuthStatus(`Error: ${error.message}`);
          return;
        }

        if (session) {
          setAuthStatus(`Authenticated: ${session.user.email}`);
        } else {
          setAuthStatus('Not authenticated');
        }
      } catch (error) {
        setAuthStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    checkAuth();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setOauthStatus('Starting Google OAuth...');
      console.log('TestAuth: Starting Google OAuth...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log('TestAuth: OAuth response:', { data, error });

      if (error) {
        setOauthStatus(`OAuth Error: ${error.message}`);
        console.error('TestAuth: OAuth error:', error);
      } else {
        setOauthStatus(`OAuth initiated: ${JSON.stringify(data)}`);
        console.log('TestAuth: OAuth data:', data);
      }
    } catch (error) {
      setOauthStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('TestAuth: Error:', error);
    }
  };

  const checkOAuthProviders = async () => {
    try {
      setOauthStatus('Checking OAuth providers...');

      // Try to get OAuth providers (this might not work in client, but worth trying)
      const { data, error } = await supabase.auth.listIdentities();

      console.log('TestAuth: OAuth providers check:', { data, error });
      setOauthStatus(`OAuth providers check: ${error ? error.message : 'Success'}`);
    } catch (error) {
      setOauthStatus(`OAuth providers check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Test Page</h1>

        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Auth Status</h2>
            <p>{authStatus}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">OAuth Status</h2>
            <p>{oauthStatus}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">User Info</h2>
            <pre className="text-sm overflow-auto">{JSON.stringify({ user, session, loading }, null, 2)}</pre>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Environment</h2>
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
            <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
            <p>Site URL: {process.env.NEXT_PUBLIC_SITE_URL || 'Not set'}</p>
            <p>Current Origin: {window.location.origin}</p>
            <p>Current URL: {window.location.href}</p>
          </div>

          <div className="flex gap-4">
            <button onClick={handleGoogleSignIn} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
              Test Google Sign In
            </button>
            <button onClick={checkOAuthProviders} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
              Check OAuth Providers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
