import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

// Approve/reject run as single-transaction Postgres functions (see step7.sql)
// so the queue row and the user's profile.status always change together.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === 'approve') {
    const { error } = await auth.admin.rpc('approve_payment', { payment_id: id });
    if (error) return NextResponse.json({ error: friendlyRpcError(error.message) }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'reject') {
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';
    const { error } = await auth.admin.rpc('reject_payment', {
      payment_id: id,
      reject_reason: reason || null,
    });
    if (error) return NextResponse.json({ error: friendlyRpcError(error.message) }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'action harus approve atau reject.' }, { status: 400 });
}

function friendlyRpcError(message: string): string {
  if (message.includes('PAYMENT_NOT_FOUND')) return 'Permintaan tidak ditemukan.';
  if (message.includes('PAYMENT_NOT_PENDING')) return 'Permintaan ini sudah diproses sebelumnya.';
  return 'Terjadi kesalahan pada database.';
}

// Only for cleaning up resolved history (approved/rejected). A pending
// request must go through approve/reject first — deleting it directly would
// silently drop a payment nobody ever decided on.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const { data: existing } = await auth.admin
    .from('payment_queue')
    .select('status')
    .eq('id', id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Permintaan tidak ditemukan.' }, { status: 404 });
  }
  if (existing.status === 'pending') {
    return NextResponse.json(
      { error: 'Setujui atau tolak dulu sebelum menghapus riwayat ini.' },
      { status: 400 },
    );
  }

  const { error } = await auth.admin.from('payment_queue').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'Gagal menghapus riwayat.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
