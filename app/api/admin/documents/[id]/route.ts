import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { friendlyDbError } from '@/lib/data/postgresError';

const EDITABLE_FIELDS: Record<string, string> = {
  title: 'title',
  description: 'description',
  type: 'type',
  folderId: 'folder_id',
  isPremium: 'is_premium',
  status: 'status',
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(EDITABLE_FIELDS)) {
    if (key in body) updates[column] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Tidak ada field yang diubah.' }, { status: 400 });
  }
  if ('title' in updates && !String(updates.title).trim()) {
    return NextResponse.json({ error: 'Judul dokumen wajib diisi.' }, { status: 400 });
  }

  if (updates.folder_id) {
    const { data: folder } = await auth.admin
      .from('folders')
      .select('id')
      .eq('id', updates.folder_id)
      .maybeSingle();
    if (!folder) {
      return NextResponse.json({ error: 'Folder tidak ditemukan.' }, { status: 400 });
    }
  }

  const { error } = await auth.admin.from('documents').update(updates).eq('id', id);

  if (error) {
    return NextResponse.json({ error: friendlyDbError(error) }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const { error } = await auth.admin.from('documents').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: friendlyDbError(error) }, { status: 400 });
  }

  // File naming is deterministic (`${id}.pdf`), so no lookup needed. Ignore
  // failure here — a leftover file in Storage is harmless, unlike a document
  // row pointing at nothing.
  await auth.admin.storage.from('documents').remove([`${id}.pdf`]);

  return NextResponse.json({ ok: true });
}
