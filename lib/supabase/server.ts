import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClientSupabase() {
  const cookieStore = await cookies()

  // Create a simple cookie handler
  const cookieOptions = {
    get(name: string) {
      return cookieStore.get(name)?.value
    },
    set(name: string, value: string, options: any) {
      try {
        cookieStore.set({
          name,
          value,
          ...options,
          sameSite: options.sameSite || 'lax',
          path: options.path || '/',
        })
      } catch (error) {
        console.error('Error setting cookie:', error)
      }
    },
    remove(name: string, options: any) {
      try {
        cookieStore.set({
          name,
          value: '',
          ...options,
          maxAge: 0,
          path: options?.path || '/',
        })
      } catch (error) {
        console.error('Error removing cookie:', error)
      }
    },
  }

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
