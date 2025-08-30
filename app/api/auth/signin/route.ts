import { createClientSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { email, password } = await req.json();
    const supabase = await createClientSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Return the session data
    return NextResponse.json({ 
        user: data.user,
        session: data.session 
    });
}