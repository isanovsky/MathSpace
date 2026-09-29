import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile';
import { createAdminClient } from '@/lib/supabase/admin';

// The current user's most recent payment request, so the pricing page can
// show "pending" or "rejected: <reason>" instead of just their bare status.
export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ payment: null }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from('payment_queue')
    .select('id, status, bank, amount, transfer_time, reason, created_at')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ payment: data ?? null });
}
