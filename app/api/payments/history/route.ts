import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile';
import { createAdminClient } from '@/lib/supabase/admin';

// Full payment history for the current user (profile page), as opposed to
// /api/payments/me which only returns the latest one (pricing page).
export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ payments: [] }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('payment_queue')
    .select('id, status, bank, amount, sender_name, reason, created_at')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load payment history:', error);
    return NextResponse.json({ payments: [] }, { status: 500 });
  }

  return NextResponse.json({ payments: data });
}
