import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessDocument } from '@/lib/data/access';

// Returns a short-lived signed URL to the PDF — never the storage path
// itself, and never through the publishable key. This is the real gate:
// /api/documents/[id] only tells the browser WHETHER it may open the file,
// this route is what actually hands over something that can read it.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const admin = createAdminClient();

  const { data: doc, error } = await admin
    .from('documents')
    .select('is_premium, status, file_path')
    .eq('id', id)
    .maybeSingle();

  if (error || !doc || !doc.file_path) {
    return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 404 });
  }
  if (doc.status !== 'aktif' && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 404 });
  }
  if (!canAccessDocument(profile, doc.is_premium)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: signed, error: signError } = await admin.storage
    .from('documents')
    .createSignedUrl(doc.file_path, 60);

  if (signError || !signed) {
    console.error('Failed to sign file URL:', signError);
    return NextResponse.json({ error: 'Gagal membuat link file.' }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
