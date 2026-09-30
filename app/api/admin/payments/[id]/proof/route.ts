import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

// Admin-only: resolves the stored path into a short-lived signed URL. The
// browser never gets the raw storage path, and the URL expires quickly.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const { data: payment } = await auth.admin
    .from('payment_queue')
    .select('proof_image_path')
    .eq('id', id)
    .maybeSingle();

  if (!payment?.proof_image_path) {
    return NextResponse.json({ error: 'Bukti tidak ditemukan.' }, { status: 404 });
  }

  const { data: signed, error } = await auth.admin.storage
    .from('payment-proofs')
    .createSignedUrl(payment.proof_image_path, 60);

  if (error || !signed) {
    console.error('Failed to sign payment proof URL:', error);
    return NextResponse.json({ error: 'Gagal membuat link bukti.' }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
