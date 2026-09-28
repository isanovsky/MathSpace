import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { friendlyDbError } from '@/lib/data/postgresError';

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const type = typeof body?.type === 'string' && body.type ? body.type : 'Catatan Kuliah';
  const folderId = typeof body?.folderId === 'string' ? body.folderId : '';
  const isPremium = body?.isPremium === true;
  const status = body?.status === 'diarsipkan' ? 'diarsipkan' : 'aktif';

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

  const { data: document, error } = await auth.admin
    .from('documents')
    .insert({
      title,
      description,
      type,
      folder_id: folderId,
      is_premium: isPremium,
      status,
      author: auth.profile.name || 'Dept. Staff',
    })
    .select('id')
    .single();

  if (error || !document) {
    return NextResponse.json({ error: friendlyDbError(error) }, { status: 400 });
  }

  return NextResponse.json({ id: document.id });
}
