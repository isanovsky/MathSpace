import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { friendlyDbError } from '@/lib/data/postgresError';

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const type = body?.type === 'subfolder' ? 'subfolder' : 'matkul';
  const parentId = typeof body?.parentId === 'string' && body.parentId ? body.parentId : null;

  if (!name) {
    return NextResponse.json({ error: 'Nama folder wajib diisi.' }, { status: 400 });
  }

  if (type === 'subfolder') {
    if (!parentId) {
      return NextResponse.json(
        { error: 'Subfolder wajib punya mata kuliah induk.' },
        { status: 400 },
      );
    }
    // Only two levels are supported by the UI: a subfolder's parent must be
    // a top-level matkul, never another subfolder.
    const { data: parent } = await auth.admin
      .from('folders')
      .select('type')
      .eq('id', parentId)
      .maybeSingle();
    if (!parent) {
      return NextResponse.json({ error: 'Mata kuliah induk tidak ditemukan.' }, { status: 400 });
    }
    if (parent.type !== 'matkul') {
      return NextResponse.json(
        { error: 'Subfolder hanya boleh dibuat langsung di bawah mata kuliah.' },
        { status: 400 },
      );
    }
  }

  const { data: folder, error } = await auth.admin
    .from('folders')
    .insert({ name, type, parent_id: type === 'subfolder' ? parentId : null })
    .select('id, name, parent_id, type')
    .single();

  if (error || !folder) {
    return NextResponse.json({ error: friendlyDbError(error) }, { status: 400 });
  }

  return NextResponse.json({
    folder: {
      id: folder.id,
      name: folder.name,
      parentId: folder.parent_id,
      type: folder.type,
      documentCount: 0,
    },
  });
}
