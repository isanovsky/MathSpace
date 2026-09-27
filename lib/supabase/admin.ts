import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Bypasses Row Level Security entirely. Only ever import this inside Route
// Handlers or Server Actions, never in a component that can be rendered on
// the client. The `server-only` import above makes the build fail loudly if
// that ever happens by accident.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}