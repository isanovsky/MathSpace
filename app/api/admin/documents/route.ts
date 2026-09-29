import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { friendlyDbError } from '@/lib/data/postgresError';

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const type = String(formData.get('type') ?? '') || 'Catatan Kuliah';
  const folderId = String(formData.get('folderId') ?? '');
  const isPremium = formData.get('isPremium') === 'true';
  const status = formData.get('status') === 'diarsipkan' ? 'diarsipkan' : 'aktif';
  const file = formData.get('file');

  if (!title) {
    return NextResponse.json({ error: 'Judul dokumen wajib diisi.' }, { status: 400 });
  }
  if (!folderId) {
    return NextResponse.json({ error: 'Folder wajib dipilih.' }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'File PDF wajib diunggah.' }, { status: 400 });
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File harus berformat PDF.' }, { status: 400 });
  }
  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json({ error: 'Ukuran file maksimal 10MB.' }, { status: 400 });
  }

  const { data: folder } = await auth.admin
    .from('folders')
    .select('id')
    .eq('id', folderId)
    .maybeSingle();
  if (!folder) {
    return NextResponse.json({ error: 'Folder tidak ditemukan.' }, { status: 400 });
  }

  // Upload first, then insert the row referencing it. If the insert fails
  // afterwards we clean up the orphaned file — the reverse order would risk
  // a document row with no file behind it, which is worse (users see an
  // entry they can never open).
  const id = randomUUID();
  const filePath = `${id}.pdf`;

  const { error: uploadError } = await auth.admin.storage
    .from('documents')
    .upload(filePath, file, { contentType: 'application/pdf', upsert: false });

  if (uploadError) {
    console.error('Failed to upload file:', uploadError);
    return NextResponse.json({ error: 'Gagal mengunggah file.' }, { status: 500 });
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
    await auth.admin.storage.from('documents').remove([filePath]);
    return NextResponse.json({ error: friendlyDbError(insertError) }, { status: 400 });
  }

  return NextResponse.json({ id });
}
