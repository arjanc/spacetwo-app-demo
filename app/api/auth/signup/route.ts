import { supabase } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

// Return the session data
    return NextResponse.json({ 
        user: data.user,
        session: data.session 
    });
}