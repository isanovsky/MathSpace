import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile';
import { createAdminClient } from '@/lib/supabase/admin';

const FIXED_AMOUNT = 10000; // Rp10rb/6 bulan — never trust an amount from the client.
const ALLOWED_BANKS = ['BCA', 'Mandiri'];
const MAX_PROOF_BYTES = 200 * 1024; // 200KB
const ALLOWED_PROOF_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

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

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const senderName = String(formData.get('senderName') ?? '').trim();
  const bank = String(formData.get('bank') ?? '');
  const transferTime = String(formData.get('transferTime') ?? '');
  const proof = formData.get('proof');

  if (!senderName) {
    return NextResponse.json({ error: 'Nama pengirim wajib diisi.' }, { status: 400 });
  }
  if (!ALLOWED_BANKS.includes(bank)) {
    return NextResponse.json({ error: 'Pilih rekening tujuan transfer.' }, { status: 400 });
  }
  if (!transferTime || Number.isNaN(Date.parse(transferTime))) {
    return NextResponse.json({ error: 'Waktu transfer tidak valid.' }, { status: 400 });
  }
  if (!(proof instanceof File) || proof.size === 0) {
    return NextResponse.json({ error: 'Foto bukti transfer wajib diunggah.' }, { status: 400 });
  }
  const extension = ALLOWED_PROOF_TYPES[proof.type];
  if (!extension) {
    return NextResponse.json(
      { error: 'Format gambar harus JPEG, PNG, atau WebP.' },
      { status: 400 },
    );
  }
  if (proof.size > MAX_PROOF_BYTES) {
    return NextResponse.json({ error: 'Ukuran gambar maksimal 200KB.' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fast-fail in the common case before spending an upload on a request that
  // will be rejected anyway. The partial unique index below is still the
  // real guard against a race between two near-simultaneous submits.
  const { data: existingPending } = await admin
    .from('payment_queue')
    .select('id')
    .eq('user_id', profile.id)
    .eq('status', 'pending')
    .maybeSingle();
  if (existingPending) {
    return NextResponse.json(
      { error: 'Kamu masih punya permintaan yang menunggu diproses.' },
      { status: 409 },
    );
  }

  const id = randomUUID();
  const proofPath = `${id}.${extension}`;

  const { error: uploadError } = await admin.storage
    .from('payment-proofs')
    .upload(proofPath, proof, { contentType: proof.type, upsert: false });

  if (uploadError) {
    console.error('Failed to upload payment proof:', uploadError);
    return NextResponse.json({ error: 'Gagal mengunggah bukti transfer.' }, { status: 500 });
  }

  const { error: insertError } = await admin.from('payment_queue').insert({
    id,
    user_id: profile.id,
    sender_name: senderName,
    bank,
    amount: FIXED_AMOUNT,
    transfer_time: transferTime,
    proof_image_path: proofPath,
    status: 'pending',
  });

  if (insertError) {
    await admin.storage.from('payment-proofs').remove([proofPath]);
    // 23505 = the one-pending-per-user partial unique index caught a race
    // that slipped past the fast-fail check above.
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'Kamu masih punya permintaan yang menunggu diproses.' },
        { status: 409 },
      );
    }
    console.error('Failed to submit payment:', insertError);
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
