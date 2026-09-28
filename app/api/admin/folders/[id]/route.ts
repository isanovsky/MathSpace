import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { friendlyDbError } from '@/lib/data/postgresError';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: 'Nama folder wajib diisi.' }, { status: 400 });
  }

  // Only renaming is supported here. Moving a folder to a different parent or
  // changing matkul <-> subfolder is not exposed by the UI and is riskier
  // (it can silently change every document's subject/category), so it is
  // deliberately left out for now rather than half-supported.
  const { data: folder, error } = await auth.admin
    .from('folders')
    .update({ name })
    .eq('id', id)
    .select('id, name, parent_id, type')
    .single();

  if (error || !folder) {
    return NextResponse.json({ error: friendlyDbError(error) }, { status: 400 });
  }

  return NextResponse.json({ folder });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  const { error } = await auth.admin.from('folders').delete().eq('id', id);

  if (error) {
    // 23503 = still has subfolders or documents (ON DELETE RESTRICT)
    return NextResponse.json({ error: friendlyDbError(error) }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
