import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Define protected routes with methods
interface ProtectedRoute {
  path: string;
  methods?: string[]; // If not provided, all methods are protected
}

const protectedRoutes: ProtectedRoute[] = [
  // Protect all methods for collections
  { path: '/api/collections' },

  // Protect GET method for file access
  { path: '/api/files', methods: ['GET'] },

  // Protect all methods for projects
  { path: '/api/projects' },

  // Protect POST method for file uploads
  { path: '/api/upload', methods: ['POST'] },

  // Protect POST method for direct file uploads
  { path: '/api/upload/direct', methods: ['POST'] },

  // Protect all methods for spaces
  { path: '/api/spaces', methods: ['POST', 'PUT', 'DELETE'] },

  // Protect all methods for users
  { path: '/api/users', methods: ['PUT', 'DELETE'] },

  // Protect onboarding and username setup pages
  { path: '/onboarding' },
  { path: '/username-setup' },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  console.log('Middleware called for path:', pathname);

  // Check if this is a username-based route (like /username/project or /username/project/collection)
  const usernameRouteMatch = pathname.match(/^\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?$/);
  const isUsernameRoute =
    usernameRouteMatch &&
    !['api', 'login', 'register', 'onboarding', 'username-setup', 'auth', 'test-auth'].includes(usernameRouteMatch[1]);

  console.log('Username route match:', usernameRouteMatch);
  console.log('Is username route:', isUsernameRoute);

  // Check if the current route and method are protected
  const routeConfig = protectedRoutes.find((route) => pathname.startsWith(route.path));

  const isMethodProtected = (config: ProtectedRoute) => !config.methods || config.methods.includes(method);

  const isRouteProtected = routeConfig && isMethodProtected(routeConfig);

  // Username-based routes are protected and need authentication
  const needsAuth = isRouteProtected; // Temporarily remove username route protection

  console.log('Needs auth:', needsAuth);
  console.log('Is username route:', isUsernameRoute);

  if (!needsAuth) {
    console.log('No auth needed, allowing access');
    return NextResponse.next();
  }

  console.log('Auth required for path:', pathname);

  try {
    const requestHeaders = new Headers(request.headers);

    // Create a response object that we can modify
    const response = NextResponse.next({ request: { headers: requestHeaders } });

    // Handle protected API routes
    if (pathname.startsWith('/api/')) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return new NextResponse(JSON.stringify({ error: 'Authentication token required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const buffered: Array<{ name: string; value: string; options?: any }> = [];

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => request.cookies.getAll().map(({ name, value }) => ({ name, value })),
            setAll: (toSet) => toSet.forEach((c) => buffered.push(c)),
          },
        },
      );

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return new NextResponse(JSON.stringify({ error: 'Invalid or expired token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const h = new Headers(request.headers);
      h.set('x-user-id', user.id);
  
      // Single response for this branch with modified request headers
      const res = NextResponse.next({ request: { headers: h } });
  
      // Flush ONLY Supabase’s own cookies (no custom x-user-id cookie!)
      buffered.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
  
      return res;
    }

    // Handle protected page routes (non-API)
    // Create a Supabase client for the middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log('Session check result:', { hasSession: !!session, error: sessionError, userId: session?.user?.id });

    // If there's no session, redirect to login
    if (!session) {
      console.log('No session found, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For username-based routes, check if user has access
    if (isUsernameRoute && usernameRouteMatch) {
      const requestedUsername = usernameRouteMatch[1];

      // Get user's profile to check their username
      const { data: profile } = await supabase.from('users').select('username').eq('id', session.user.id).single();

      // If user doesn't have a username, redirect to username setup
      if (!profile?.username) {
        return NextResponse.redirect(new URL('/username-setup', request.url));
      }

      // For now, only allow users to access their own username routes
      // In the future, you might want to allow public access to other users' profiles
      if (profile.username !== requestedUsername) {
        // User is trying to access someone else's content, redirect to their own profile
        const userUrl = pathname.replace(`/${requestedUsername}/`, `/${profile.username}/`);
        return NextResponse.redirect(new URL(userUrl, request.url));
      }
    }

    return response;
  } catch (error) {
    console.error('Error in middleware:', error);
    // In case of error, redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    '/api/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (auth endpoints)
     * - login/register pages
     */
    '/((?!_next/static|_next/image|favicon.ico|public|icons|images|api/auth|login|register).*)',
  ],
};
