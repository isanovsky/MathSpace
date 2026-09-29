import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const [totalUsers, premiumUsers, activeDocuments] = await Promise.all([
    auth.admin.from('profiles').select('id', { count: 'exact', head: true }),
    auth.admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'premium'),
    auth.admin
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'aktif'),
  ]);

  if (totalUsers.error || premiumUsers.error || activeDocuments.error) {
    console.error(
      'Failed to load analytics:',
      totalUsers.error || premiumUsers.error || activeDocuments.error,
    );
    return NextResponse.json({ error: 'Gagal memuat analitik.' }, { status: 500 });
  }

  return NextResponse.json({
    totalUsers: totalUsers.count ?? 0,
    premiumUsers: premiumUsers.count ?? 0,
    activeDocuments: activeDocuments.count ?? 0,
  });
}
