import 'server-only';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile';

// Call at the top of every admin Route Handler. Middleware already blocks
// /admin pages, but it does not cover /api/* routes, and a security check
// should not depend on a single layer.
//
//   const auth = await requireAdmin();
//   if (auth.error) return auth.error;
//   // auth.profile and auth.admin (secret-key client) are available here
export async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    } as const;
  }

  if (profile.role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    } as const;
  }

  return { profile, admin: createAdminClient(), error: null } as const;
}