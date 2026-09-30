import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const dynamic = 'force-dynamic';

// The queue joined with the requester's name/email — admin needs to know
// WHO is asking, not just a user_id.
interface QueueRow {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  bank: string | null;
  amount: number | null;
  sender_name: string | null;
  transfer_time: string | null;
  proof_image_path: string | null;
  reason: string | null;
  created_at: string;
  profiles: { id: string; name: string; email: string; jurusan: string | null } | null;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { data, error } = await auth.admin
    .from('payment_queue')
    .select(
      'id, status, bank, amount, sender_name, transfer_time, proof_image_path, reason, created_at, ' +
        'profiles ( id, name, email, jurusan )',
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load payment queue:', error);
    return NextResponse.json({ error: 'Gagal memuat antrean.' }, { status: 500 });
  }

  // Expose whether a proof exists, not the storage path itself — the path is
  // only ever resolved server-side into a short-lived signed URL, on demand.
  const rows = data as unknown as QueueRow[];
  const queue = rows.map((row) => ({
    id: row.id,
    status: row.status,
    bank: row.bank,
    amount: row.amount,
    sender_name: row.sender_name,
    transfer_time: row.transfer_time,
    reason: row.reason,
    created_at: row.created_at,
    profiles: row.profiles,
    hasProof: !!row.proof_image_path,
  }));

  return NextResponse.json({ queue });
}

// Deletes ALL resolved (approved/rejected) history in one shot, and their
// proof images. Pending requests are never touched — they still need a
// decision first. Irreversible: this is real financial history disappearing,
// the client is expected to make the user confirm explicitly before calling.
export async function DELETE() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { data: resolved, error: fetchError } = await auth.admin
    .from('payment_queue')
    .select('id, proof_image_path')
    .neq('status', 'pending');

  if (fetchError) {
    console.error('Failed to load resolved payments:', fetchError);
    return NextResponse.json({ error: 'Gagal memuat riwayat.' }, { status: 500 });
  }
  if (!resolved || resolved.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const proofPaths = resolved
    .map((r) => r.proof_image_path)
    .filter((p): p is string => !!p);
  if (proofPaths.length > 0) {
    await auth.admin.storage.from('payment-proofs').remove(proofPaths);
  }

  const { error: deleteError } = await auth.admin
    .from('payment_queue')
    .delete()
    .neq('status', 'pending');

  if (deleteError) {
    console.error('Failed to delete payment history:', deleteError);
    return NextResponse.json({ error: 'Gagal menghapus riwayat.' }, { status: 500 });
  }

  return NextResponse.json({ deleted: resolved.length });
}
