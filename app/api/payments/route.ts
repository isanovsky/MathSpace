import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile';
import { createAdminClient } from '@/lib/supabase/admin';

const FIXED_AMOUNT = 10000; // Rp10rb/6 bulan — never trust an amount from the client.
const ALLOWED_BANKS = ['BCA', 'Mandiri'];

// Submit a new payment verification request.
export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (profile.status === 'premium') {
    return NextResponse.json(
      { error: 'Kamu sudah menjadi anggota premium.' },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const senderName = typeof body?.senderName === 'string' ? body.senderName.trim() : '';
  const bank = typeof body?.bank === 'string' ? body.bank : '';
  const transferTime = typeof body?.transferTime === 'string' ? body.transferTime : '';

  if (!senderName) {
    return NextResponse.json({ error: 'Nama pengirim wajib diisi.' }, { status: 400 });
  }
  if (!ALLOWED_BANKS.includes(bank)) {
    return NextResponse.json({ error: 'Pilih rekening tujuan transfer.' }, { status: 400 });
  }
  if (!transferTime || Number.isNaN(Date.parse(transferTime))) {
    return NextResponse.json({ error: 'Waktu transfer tidak valid.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from('payment_queue').insert({
    user_id: profile.id,
    sender_name: senderName,
    bank,
    amount: FIXED_AMOUNT,
    transfer_time: transferTime,
    status: 'pending',
  });

  if (error) {
    // 23505 = the one-pending-per-user partial unique index already caught it.
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Kamu masih punya permintaan yang menunggu diproses.' },
        { status: 409 },
      );
    }
    console.error('Failed to submit payment:', error);
    return NextResponse.json({ error: 'Gagal mengirim permintaan.' }, { status: 500 });
  }

  // Best-effort: reflects "awaiting review" in the UI. If this write fails,
  // approval still works correctly later (it sets status itself), so this
  // is not treated as a hard failure of the submission.
  await admin
    .from('profiles')
    .update({ status: 'pending' })
    .eq('id', profile.id)
    .eq('status', 'unverified');

  return NextResponse.json({ ok: true });
}
