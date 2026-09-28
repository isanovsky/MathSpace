import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface CurrentProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'unverified' | 'pending' | 'premium';
}

// Identity comes from the verified session; the profile row (role/status)
// is read with the secret key because `profiles` has RLS with no policies.
// Returns null when nobody is logged in or the profile row is missing.
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('id, name, email, role, status')
    .eq('id', user.id)
    .single();

  return (profile as CurrentProfile | null) ?? null;
}