'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  role: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  setUserWithProfile: (user: User | null) => Promise<{ success: boolean; error?: AuthError }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    // If Supabase is not configured, skip authentication
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, skipping authentication');
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      setUser(session?.user ?? null);
      setUserWithProfile(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseConfigured]);

  const setUserWithProfile = async (user: User | null) => {
    setUser(user);
    if (user) {
      try {
        await fetchProfile(user.id);
      } catch (error) {
        console.log('Error fetching profile:', error);
        return Promise.resolve({ success: false, error });
      }
    }
    setLoading(false);

    return Promise.resolve({ success: true });
  };

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, skipping profile fetch');
      return;
    }

    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        await createProfile(userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createProfile = async (userId: string) => {
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, skipping profile creation');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: user?.email || '',
            name: user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
            username: user?.user_metadata?.username || user?.email?.split('@')[0],
            avatar: user?.user_metadata?.avatar_url || null,
            role: 'viewer',
            is_online: true,
            last_seen: new Date().toISOString(),
            deleted: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error creating profile:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, cannot sign in');
      return;
    }

    try {
      // Get the current URL to redirect back after sign in
      const currentUrl = new URL(window.location.href);
      const redirectAfterSignIn = currentUrl.pathname !== '/login' 
        ? currentUrl.pathname + currentUrl.search
        : '/';
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectAfterSignIn)}`,
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, cannot sign out');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }

      // Explicitly clear local state
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, cannot update profile');
      return;
    }

    if (!user) throw new Error('No user logged in');

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
    setUserWithProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
