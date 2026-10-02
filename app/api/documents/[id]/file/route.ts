import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessDocument } from '@/lib/data/access';

// Streams the actual PDF bytes back, authenticated on every request — this
// deliberately replaces the old signed-URL approach. A signed URL, once
// handed to the browser, is a bearer link: anyone who copies it (from
// DevTools, a mobile "Open" fallback card, etc.) can reuse it elsewhere
// until it expires, regardless of their own login state. Returning the
// bytes directly means there is never a separate link to copy in the first
// place — only an authenticated request gets the file.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const admin = createAdminClient();

  const { data: doc, error } = await admin
    .from('documents')
    .select('is_premium, status, file_path, title')
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

  const { data: fileBlob, error: downloadError } = await admin.storage
    .from('documents')
    .download(doc.file_path);

  if (downloadError || !fileBlob) {
    console.error('Failed to download document file:', downloadError);
    return NextResponse.json({ error: 'Gagal memuat file.' }, { status: 500 });
  }

  const arrayBuffer = await fileBlob.arrayBuffer();
  const safeTitle = doc.title.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'dokumen';

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safeTitle}.pdf"`,
      // Never cached by shared/proxy caches — this response is
      // access-controlled per request, not a public asset.
      'Cache-Control': 'private, no-store',
    },
  });
}
