import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const dynamic = 'force-dynamic';

// Cheap count-only query for the notification bell — never fetches the full
// queue just to show a badge number.
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { count, error } = await auth.admin
    .from('payment_queue')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) {
    console.error('Failed to count pending payments:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
