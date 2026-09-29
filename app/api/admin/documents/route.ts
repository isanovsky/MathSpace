import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { friendlyDbError } from '@/lib/data/postgresError';

// Called AFTER the browser has already uploaded the PDF straight to Storage
// via a signed URL from /api/admin/documents/prepare-upload. This request
// only carries metadata (JSON), never the file bytes — that split is what
// keeps large uploads off Vercel's request-body limit.
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id : '';
  const filePath = typeof body.filePath === 'string' ? body.filePath : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const type = typeof body.type === 'string' && body.type ? body.type : 'Catatan Kuliah';
  const folderId = typeof body.folderId === 'string' ? body.folderId : '';
  const isPremium = body.isPremium === true;
  const status = body.status === 'diarsipkan' ? 'diarsipkan' : 'aktif';

  if (!id || !filePath) {
    return NextResponse.json(
      { error: 'File belum diunggah. Ulangi proses upload.' },
      { status: 400 },
    );
  }
  if (!title) {
    return NextResponse.json({ error: 'Judul dokumen wajib diisi.' }, { status: 400 });
  }
  if (!folderId) {
    return NextResponse.json({ error: 'Folder wajib dipilih.' }, { status: 400 });
  }

  const { data: folder } = await auth.admin
    .from('folders')
    .select('id')
    .eq('id', folderId)
    .maybeSingle();
  if (!folder) {
    return NextResponse.json({ error: 'Folder tidak ditemukan.' }, { status: 400 });
  }

  const { error: insertError } = await auth.admin.from('documents').insert({
    id,
    title,
    description,
    type,
    folder_id: folderId,
    is_premium: isPremium,
    status,
    author: auth.profile.name || 'Dept. Staff',
    file_path: filePath,
  });

  if (insertError) {
    // Clean up the orphaned file so it doesn't sit there unreferenced.
    await auth.admin.storage.from('documents').remove([filePath]);
    return NextResponse.json({ error: friendlyDbError(insertError) }, { status: 400 });
  }

  return NextResponse.json({ id });
}
