import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

// Manual override, outside the payment-verification flow entirely — for
// handling edge cases and complaints, not a replacement for it. Restricted
// to the two states an admin should plausibly set by hand; 'pending' is a
// transient state that only makes sense while a real payment request exists.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (status !== 'premium' && status !== 'unverified') {
    return NextResponse.json(
      { error: 'Status harus premium atau unverified.' },
      { status: 400 },
    );
  }

  const { error } = await auth.admin
    .from('profiles')
    .update({
      status,
      premium_since: status === 'premium' ? new Date().toISOString() : null,
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to update user status:', error);
    return NextResponse.json({ error: 'Gagal mengubah status user.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Deleting the auth.users row cascades to profiles and payment_queue
// (both declared ON DELETE CASCADE back in step 2's schema).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  if (id === auth.profile.id) {
    return NextResponse.json(
      { error: 'Tidak bisa menghapus akun sendiri lewat sini.' },
      { status: 400 },
    );
  }

  const { data: target } = await auth.admin
    .from('profiles')
    .select('role')
    .eq('id', id)
    .maybeSingle();

  if (target?.role === 'admin') {
    return NextResponse.json(
      { error: 'Akun admin tidak bisa dihapus lewat sini. Gunakan Supabase dashboard.' },
      { status: 400 },
    );
  }

  // Deleting the auth user cascades the payment_queue rows away in the
  // database, but it does NOT touch their proof images sitting in Storage —
  // clean those up first or they become permanent orphans.
  const { data: payments } = await auth.admin
    .from('payment_queue')
    .select('proof_image_path')
    .eq('user_id', id);

  const proofPaths = (payments ?? [])
    .map((p) => p.proof_image_path)
    .filter((p): p is string => !!p);
  if (proofPaths.length > 0) {
    await auth.admin.storage.from('payment-proofs').remove(proofPaths);
  }

  const { error } = await auth.admin.auth.admin.deleteUser(id);
  if (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Gagal menghapus user.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}