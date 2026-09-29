import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const dynamic = 'force-dynamic';

// The queue joined with the requester's name/email — admin needs to know
// WHO is asking, not just a user_id.
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { data, error } = await auth.admin
    .from('payment_queue')
    .select(
      'id, status, bank, amount, sender_name, transfer_time, proof_image_url, reason, created_at, ' +
        'profiles ( id, name, email, jurusan )',
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load payment queue:', error);
    return NextResponse.json({ error: 'Gagal memuat antrean.' }, { status: 500 });
  }

  return NextResponse.json({ queue: data });
}
