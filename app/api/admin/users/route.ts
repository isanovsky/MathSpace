import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { data, error } = await auth.admin
    .from('profiles')
    .select('id, name, email, role, status, premium_since, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load users:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar user.' }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}
