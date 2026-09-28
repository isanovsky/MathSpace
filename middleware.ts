import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

// Redirect while keeping any refreshed session cookies that were set on
// `source`; otherwise a token refresh done in this request would be lost.
function redirectTo(request: NextRequest, path: string, source: NextResponse) {
  const res = NextResponse.redirect(new URL(path, request.url));
  source.cookies.getAll().forEach((cookie) => res.cookies.set(cookie));
  return res;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() verifies the token with Supabase Auth (unlike getSession(),
  // which only reads the cookie), and refreshes it if expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdminRoute) {
    if (!user) {
      return redirectTo(request, '/login', response);
    }

    // The role lives in `profiles`, which has RLS enabled with no policies,
    // so it can only be read with the secret key.
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Fail closed: a DB error or missing profile is treated as "not admin".
    if (profile?.role !== 'admin') {
      return redirectTo(request, '/', response);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};